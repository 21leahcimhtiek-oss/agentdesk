import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { executionRateLimit } from "@/lib/rate-limit";
import { executeAgent } from "@/lib/openai/execute-agent";
import { PLAN_LIMITS } from "@/lib/stripe/client";
import { z } from "zod";

const ExecuteSchema = z.object({
  input: z.string().min(1).max(10000),
});

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ip = request.headers.get("x-forwarded-for") ?? user.id;
  const { success } = await executionRateLimit.limit(ip);
  if (!success) return NextResponse.json({ error: "Rate limit exceeded (10/min for executions)" }, { status: 429 });

  const member = await supabase.from("org_members").select("org_id, orgs(plan)").eq("user_id", user.id).single();
  if (!member.data) return NextResponse.json({ error: "No organization found" }, { status: 403 });

  const orgId = member.data.org_id;
  const plan = (member.data.orgs as any)?.plan ?? "free";
  const limits = PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS] ?? PLAN_LIMITS.free;

  const thisMonth = new Date();
  thisMonth.setDate(1); thisMonth.setHours(0, 0, 0, 0);
  const { count: monthCount } = await supabase
    .from("agent_executions").select("id", { count: "exact" })
    .eq("org_id", orgId).gte("created_at", thisMonth.toISOString());

  if (limits.executions_per_month !== -1 && (monthCount ?? 0) >= limits.executions_per_month) {
    return NextResponse.json({ error: "Monthly execution limit reached. Upgrade your plan." }, { status: 403 });
  }

  const { data: agent } = await supabase
    .from("agents").select("*").eq("id", params.id).eq("org_id", orgId).neq("status", "deleted").single();
  if (!agent) return NextResponse.json({ error: "Agent not found" }, { status: 404 });

  const body = await request.json();
  const parsed = ExecuteSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { data: execRecord } = await supabase
    .from("agent_executions")
    .insert({ agent_id: agent.id, org_id: orgId, input: parsed.data.input, status: "running" })
    .select().single();

  try {
    const result = await executeAgent({
      model: agent.model, systemPrompt: agent.system_prompt,
      input: parsed.data.input, temperature: agent.temperature, maxTokens: agent.max_tokens,
    });

    const { data: completed } = await supabase
      .from("agent_executions")
      .update({ output: result.output, status: "success", tokens_used: result.tokens_used, cost_usd: result.cost_usd, duration_ms: result.duration_ms })
      .eq("id", execRecord!.id).select().single();

    await supabase.from("agents").update({ status: "active" }).eq("id", agent.id);

    // Upsert monthly usage record
    const periodStart = thisMonth.toISOString().split("T")[0];
    const periodEnd = new Date(thisMonth.getFullYear(), thisMonth.getMonth() + 1, 0).toISOString().split("T")[0];
    await supabase.rpc("increment_usage", { p_org_id: orgId, p_period_start: periodStart, p_period_end: periodEnd, p_tokens: result.tokens_used, p_cost: result.cost_usd }).maybeSingle();

    // Fire webhooks
    const { data: webhooks } = await supabase.from("webhooks").select("*").eq("org_id", orgId).eq("is_active", true).contains("events", ["execution.complete"]);
    if (webhooks?.length) {
      const payload = JSON.stringify({ event: "execution.complete", execution: completed });
      await Promise.allSettled(webhooks.map((wh: any) =>
        fetch(wh.url, { method: "POST", headers: { "Content-Type": "application/json", "X-AgentDesk-Secret": wh.secret }, body: payload })
      ));
    }

    return NextResponse.json({ data: completed });
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : "Execution failed";
    await supabase.from("agent_executions").update({ status: "failed", error: errMsg }).eq("id", execRecord!.id);
    await supabase.from("agents").update({ status: "error" }).eq("id", agent.id);
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { apiRateLimit } from "@/lib/rate-limit";
import { PLAN_LIMITS } from "@/lib/stripe/client";
import { z } from "zod";

const CreateAgentSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  model: z.enum(["gpt-4o", "gpt-4o-mini", "gpt-3.5-turbo"]).default("gpt-4o-mini"),
  system_prompt: z.string().max(8000).default(""),
  temperature: z.number().min(0).max(2).default(0.7),
  max_tokens: z.number().int().min(1).max(32000).default(1024),
});

export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "anonymous";
  const { success } = await apiRateLimit.limit(ip);
  if (!success) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const member = await supabase.from("org_members").select("org_id").eq("user_id", user.id).single();
  if (!member.data) return NextResponse.json({ error: "No organization found" }, { status: 403 });

  const { data, error } = await supabase
    .from("agents")
    .select("*, agent_executions(id)")
    .eq("org_id", member.data.org_id)
    .neq("status", "deleted")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "anonymous";
  const { success } = await apiRateLimit.limit(ip);
  if (!success) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const member = await supabase
    .from("org_members")
    .select("org_id, orgs(plan)")
    .eq("user_id", user.id)
    .single();
  if (!member.data) return NextResponse.json({ error: "No organization found" }, { status: 403 });

  const orgId = member.data.org_id;
  const plan = (member.data.orgs as any)?.plan ?? "free";
  const limits = PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS] ?? PLAN_LIMITS.free;

  if (limits.agents !== -1) {
    const { count } = await supabase
      .from("agents")
      .select("id", { count: "exact" })
      .eq("org_id", orgId)
      .neq("status", "deleted");
    if ((count ?? 0) >= limits.agents) {
      return NextResponse.json({ error: `Agent limit reached (${limits.agents} on ${plan} plan)` }, { status: 403 });
    }
  }

  const body = await request.json();
  const parsed = CreateAgentSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { data, error } = await supabase
    .from("agents")
    .insert({ ...parsed.data, org_id: orgId })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabase.from("audit_log").insert({
    org_id: orgId, user_id: user.id, action: "agent.created",
    resource_type: "agent", resource_id: data.id,
    metadata: { name: data.name },
  });

  return NextResponse.json({ data }, { status: 201 });
}
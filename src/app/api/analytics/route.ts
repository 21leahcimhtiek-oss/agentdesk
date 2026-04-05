import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const member = await supabase.from("org_members").select("org_id").eq("user_id", user.id).single();
  if (!member.data) return NextResponse.json({ error: "No org" }, { status: 403 });
  const orgId = member.data.org_id;

  const { searchParams } = new URL(request.url);
  const endDate = searchParams.get("end_date") ?? new Date().toISOString().split("T")[0];
  const startDate = searchParams.get("start_date") ?? (() => {
    const d = new Date(); d.setDate(d.getDate() - 30); return d.toISOString().split("T")[0];
  })();

  const { data: executions } = await supabase
    .from("agent_executions")
    .select("created_at, status, tokens_used, cost_usd, agent_id, agents(name)")
    .eq("org_id", orgId)
    .gte("created_at", startDate)
    .lte("created_at", endDate + "T23:59:59Z");

  const byDay: Record<string, { success: number; failed: number; tokens: number; cost: number }> = {};
  const byAgent: Record<string, { name: string; cost: number; count: number; success: number }> = {};

  for (const e of executions ?? []) {
    const day = e.created_at.split("T")[0];
    if (!byDay[day]) byDay[day] = { success: 0, failed: 0, tokens: 0, cost: 0 };
    if (e.status === "success") byDay[day].success++; else byDay[day].failed++;
    byDay[day].tokens += e.tokens_used ?? 0;
    byDay[day].cost += Number(e.cost_usd);

    const name = (e as any).agents?.name ?? e.agent_id;
    if (!byAgent[e.agent_id]) byAgent[e.agent_id] = { name, cost: 0, count: 0, success: 0 };
    byAgent[e.agent_id].cost += Number(e.cost_usd);
    byAgent[e.agent_id].count++;
    if (e.status === "success") byAgent[e.agent_id].success++;
  }

  return NextResponse.json({
    data: {
      daily: Object.entries(byDay).map(([date, v]) => ({ date, ...v })),
      by_agent: Object.values(byAgent).sort((a, b) => b.cost - a.cost),
      totals: {
        executions: (executions ?? []).length,
        tokens: Object.values(byDay).reduce((s, v) => s + v.tokens, 0),
        cost_usd: Object.values(byDay).reduce((s, v) => s + v.cost, 0),
        success_rate: (executions ?? []).length > 0
          ? ((executions ?? []).filter((e) => e.status === "success").length / (executions ?? []).length * 100).toFixed(1)
          : "0",
      },
    },
  });
}
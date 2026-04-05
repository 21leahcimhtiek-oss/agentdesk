import { createClient } from "@/lib/supabase/server";
import UsageChart from "@/components/UsageChart";
import CostBreakdown from "@/components/CostBreakdown";

export const metadata = { title: "Analytics" };

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const member = await supabase.from("org_members").select("org_id").eq("user_id", user.id).single();
  const orgId = member.data?.org_id;

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: executions } = await supabase
    .from("agent_executions")
    .select("created_at, status, tokens_used, cost_usd, agent_id, agents(name)")
    .eq("org_id", orgId)
    .gte("created_at", thirtyDaysAgo.toISOString())
    .order("created_at", { ascending: true });

  const dailyCounts: Record<string, { success: number; failed: number; cost: number }> = {};
  const agentCosts: Record<string, { name: string; cost: number; count: number }> = {};

  for (const exec of executions ?? []) {
    const day = exec.created_at.split("T")[0];
    if (!dailyCounts[day]) dailyCounts[day] = { success: 0, failed: 0, cost: 0 };
    if (exec.status === "success") dailyCounts[day].success++;
    else if (exec.status === "failed") dailyCounts[day].failed++;
    dailyCounts[day].cost += Number(exec.cost_usd);

    const agentName = (exec as any).agents?.name ?? exec.agent_id;
    if (!agentCosts[exec.agent_id]) agentCosts[exec.agent_id] = { name: agentName, cost: 0, count: 0 };
    agentCosts[exec.agent_id].cost += Number(exec.cost_usd);
    agentCosts[exec.agent_id].count++;
  }

  const chartData = Object.entries(dailyCounts).map(([date, v]) => ({ date, ...v }));
  const costData = Object.values(agentCosts).sort((a, b) => b.cost - a.cost).slice(0, 10);

  const totalExecutions = (executions ?? []).length;
  const totalCost = Object.values(dailyCounts).reduce((s, v) => s + v.cost, 0);
  const successRate = totalExecutions > 0
    ? ((executions ?? []).filter((e) => e.status === "success").length / totalExecutions * 100).toFixed(1)
    : "0";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <p className="text-gray-400 text-sm mt-1">Last 30 days performance</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { label: "Total Executions", value: totalExecutions.toLocaleString() },
          { label: "Total Cost", value: `$${totalCost.toFixed(4)}` },
          { label: "Success Rate", value: `${successRate}%` },
        ].map(({ label, value }) => (
          <div key={label} className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <p className="text-sm text-gray-400 mb-2">{label}</p>
            <p className="text-3xl font-bold text-white">{value}</p>
          </div>
        ))}
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-6">Execution Volume</h2>
        <UsageChart data={chartData} />
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-6">Cost by Agent</h2>
        <CostBreakdown data={costData} />
      </div>
    </div>
  );
}
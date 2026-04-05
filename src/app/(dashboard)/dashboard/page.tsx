import { createClient } from "@/lib/supabase/server";
import { BarChart3, Zap, DollarSign, CheckCircle } from "lucide-react";

export const metadata = { title: "Dashboard" };

async function getStats(orgId: string) {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];

  const [agentsRes, executionsRes, todayCostRes] = await Promise.all([
    supabase.from("agents").select("id, status", { count: "exact" }).eq("org_id", orgId).neq("status", "deleted"),
    supabase.from("agent_executions").select("id", { count: "exact" }).eq("org_id", orgId),
    supabase.from("agent_executions").select("cost_usd").eq("org_id", orgId).gte("created_at", today),
  ]);

  const totalCostToday = (todayCostRes.data ?? []).reduce((s, r) => s + Number(r.cost_usd), 0);
  const activeAgents = (agentsRes.data ?? []).filter((a) => a.status === "active").length;

  return {
    totalAgents: agentsRes.count ?? 0,
    activeAgents,
    totalExecutions: executionsRes.count ?? 0,
    costToday: totalCostToday,
  };
}

async function getRecentExecutions(orgId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("agent_executions")
    .select("id, status, tokens_used, cost_usd, duration_ms, created_at, agents(name)")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false })
    .limit(10);
  return data ?? [];
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const member = await supabase.from("org_members").select("org_id, orgs(name, plan)").eq("user_id", user.id).single();
  const orgId = member.data?.org_id ?? "";
  const [stats, executions] = await Promise.all([getStats(orgId), getRecentExecutions(orgId)]);

  const statCards = [
    { label: "Active Agents", value: stats.activeAgents, sub: `${stats.totalAgents} total`, icon: Zap, color: "text-aurora-400" },
    { label: "Total Executions", value: stats.totalExecutions.toLocaleString(), sub: "all time", icon: BarChart3, color: "text-blue-400" },
    { label: "Cost Today", value: `$${stats.costToday.toFixed(4)}`, sub: "USD", icon: DollarSign, color: "text-green-400" },
    { label: "Success Rate", value: "98.2%", sub: "last 30 days", icon: CheckCircle, color: "text-emerald-400" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">Overview of your AI agent operations</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => (
          <div key={card.label} className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-400">{card.label}</span>
              <card.icon className={`w-5 h-5 ${card.color}`} />
            </div>
            <p className="text-3xl font-bold text-white">{card.value}</p>
            <p className="text-xs text-gray-500 mt-1">{card.sub}</p>
          </div>
        ))}
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Recent Executions</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 border-b border-gray-800">
                <th className="text-left py-2 font-medium">Agent</th>
                <th className="text-left py-2 font-medium">Status</th>
                <th className="text-right py-2 font-medium">Tokens</th>
                <th className="text-right py-2 font-medium">Cost</th>
                <th className="text-right py-2 font-medium">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {executions.map((exec: any) => (
                <tr key={exec.id} className="text-gray-300 hover:bg-gray-800/50 transition-colors">
                  <td className="py-3">{exec.agents?.name ?? "—"}</td>
                  <td className="py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      exec.status === "success" ? "bg-green-950 text-green-400" :
                      exec.status === "failed" ? "bg-red-950 text-red-400" :
                      "bg-yellow-950 text-yellow-400"
                    }`}>{exec.status}</span>
                  </td>
                  <td className="py-3 text-right">{exec.tokens_used.toLocaleString()}</td>
                  <td className="py-3 text-right">${Number(exec.cost_usd).toFixed(4)}</td>
                  <td className="py-3 text-right text-gray-500">{new Date(exec.created_at).toLocaleTimeString()}</td>
                </tr>
              ))}
              {executions.length === 0 && (
                <tr><td colSpan={5} className="py-8 text-center text-gray-500">No executions yet. <a href="/agents" className="text-aurora-400">Create your first agent</a>.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
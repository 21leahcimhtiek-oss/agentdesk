import { createClient } from "@/lib/supabase/server";
import BillingPlans from "@/components/BillingPlans";
import { PLAN_LIMITS } from "@/lib/stripe/client";

export const metadata = { title: "Billing" };

export default async function BillingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const member = await supabase.from("org_members").select("org_id, orgs(name, plan, stripe_subscription_id)").eq("user_id", user.id).single();
  const org = (member.data?.orgs as any);
  const orgId = member.data?.org_id;
  const plan = org?.plan ?? "free";
  const limits = PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS] ?? PLAN_LIMITS.free;

  const thisMonth = new Date();
  thisMonth.setDate(1);
  thisMonth.setHours(0, 0, 0, 0);

  const [{ count: agentCount }, { count: execCount }] = await Promise.all([
    supabase.from("agents").select("id", { count: "exact" }).eq("org_id", orgId).neq("status", "deleted"),
    supabase.from("agent_executions").select("id", { count: "exact" }).eq("org_id", orgId).gte("created_at", thisMonth.toISOString()),
  ]);

  const usageItems = [
    { label: "Agents", used: agentCount ?? 0, limit: limits.agents, unit: "agents" },
    { label: "Executions this month", used: execCount ?? 0, limit: limits.executions_per_month, unit: "executions" },
  ];

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Billing & Plans</h1>
        <p className="text-gray-400 text-sm mt-1">Manage your subscription and usage</p>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm text-gray-400 mb-1">Current plan</p>
            <p className="text-2xl font-bold text-white capitalize">{plan}</p>
          </div>
          {org?.stripe_subscription_id && (
            <form action="/api/billing/portal" method="POST">
              <button type="submit" className="border border-gray-700 hover:border-gray-500 text-gray-300 text-sm px-4 py-2 rounded-lg transition-colors">
                Manage subscription
              </button>
            </form>
          )}
        </div>

        <div className="space-y-4">
          {usageItems.map(({ label, used, limit, unit }) => {
            const pct = limit === -1 ? 0 : Math.min((used / limit) * 100, 100);
            return (
              <div key={label}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-gray-300">{label}</span>
                  <span className="text-gray-400">{used.toLocaleString()} / {limit === -1 ? "∞" : limit.toLocaleString()} {unit}</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${pct > 90 ? "bg-red-500" : pct > 70 ? "bg-yellow-500" : "bg-aurora-500"}`}
                    style={{ width: limit === -1 ? "0%" : `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <BillingPlans currentPlan={plan} />
    </div>
  );
}
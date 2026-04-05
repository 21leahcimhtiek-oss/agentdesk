import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import CostChart from '@/components/CostChart';
import LatencyChart from '@/components/LatencyChart';

export default async function AnalyticsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: member } = await supabase.from('members').select('org_id').eq('user_id', user.id).single();

  const { data: runs } = await supabase
    .from('agent_runs')
    .select('status, cost_usd, latency_ms, tokens_used, started_at')
    .eq('org_id', member?.org_id ?? '')
    .gte('started_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    .order('started_at', { ascending: true });

  const byDay: Record<string, { date: string; runs: number; cost: number; latency: number[]; tokens: number; failed: number }> = {};
  (runs ?? []).forEach(r => {
    const day = r.started_at.slice(0, 10);
    if (!byDay[day]) byDay[day] = { date: day, runs: 0, cost: 0, latency: [], tokens: 0, failed: 0 };
    byDay[day].runs++;
    byDay[day].cost += r.cost_usd ?? 0;
    byDay[day].latency.push(r.latency_ms ?? 0);
    byDay[day].tokens += r.tokens_used ?? 0;
    if (r.status === 'failed') byDay[day].failed++;
  });

  const chartData = Object.values(byDay).map(d => ({
    date: d.date,
    cost: parseFloat(d.cost.toFixed(4)),
    runs: d.runs,
    avgLatency: d.latency.length > 0 ? Math.round(d.latency.reduce((a, b) => a + b, 0) / d.latency.length) : 0,
    errorRate: d.runs > 0 ? parseFloat((d.failed / d.runs * 100).toFixed(1)) : 0,
  }));

  const totalRuns = runs?.length ?? 0;
  const totalCost = runs?.reduce((s, r) => s + (r.cost_usd ?? 0), 0) ?? 0;
  const avgLatency = totalRuns > 0 ? Math.round((runs?.reduce((s, r) => s + (r.latency_ms ?? 0), 0) ?? 0) / totalRuns) : 0;
  const successRate = totalRuns > 0 ? ((runs?.filter(r => r.status === 'success').length ?? 0) / totalRuns * 100).toFixed(1) : '0';

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600 text-sm mt-1">Last 30 days</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Runs', value: totalRuns },
          { label: 'Total Cost', value: `$${totalCost.toFixed(2)}` },
          { label: 'Avg Latency', value: `${avgLatency}ms` },
          { label: 'Success Rate', value: `${successRate}%` },
        ].map(s => (
          <div key={s.label} className="card p-5">
            <div className="text-sm text-gray-500 mb-1">{s.label}</div>
            <div className="text-2xl font-bold text-gray-900">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Daily Cost</h2>
          <CostChart data={chartData} />
        </div>
        <div className="card p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Average Latency (ms)</h2>
          <LatencyChart data={chartData} />
        </div>
      </div>
    </div>
  );
}
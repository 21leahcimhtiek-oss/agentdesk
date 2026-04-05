import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Activity, DollarSign, AlertTriangle, CheckCircle } from 'lucide-react';
import { formatCost } from '@/lib/utils';

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: member } = await supabase
    .from('members')
    .select('org_id')
    .eq('user_id', user.id)
    .single();

  const orgId = member?.org_id;

  const [agentsRes, runsRes] = await Promise.all([
    supabase.from('agents').select('id', { count: 'exact' }).eq('org_id', orgId ?? ''),
    supabase.from('agent_runs').select('status, cost_usd, started_at').eq('org_id', orgId ?? '').gte('started_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
  ]);

  const runs = runsRes.data ?? [];
  const totalRuns = runs.length;
  const failedRuns = runs.filter(r => r.status === 'failed').length;
  const successRate = totalRuns > 0 ? ((totalRuns - failedRuns) / totalRuns * 100).toFixed(1) : '0';
  const totalCost = runs.reduce((sum, r) => sum + (r.cost_usd ?? 0), 0);

  const stats = [
    { label: 'Total Agents', value: agentsRes.count ?? 0, icon: Activity, color: 'text-brand-600', bg: 'bg-brand-50' },
    { label: 'Runs (30d)', value: totalRuns, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Failed Runs', value: failedRuns, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Cost (30d)', value: formatCost(totalCost), icon: DollarSign, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  const recentRuns = await supabase
    .from('agent_runs')
    .select('id, status, cost_usd, latency_ms, started_at, agents(name)')
    .eq('org_id', orgId ?? '')
    .order('started_at', { ascending: false })
    .limit(5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
        <p className="text-gray-600 text-sm mt-1">Last 30 days</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map(s => (
          <div key={s.label} className="card p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-lg ${s.bg}`}>
                <s.icon className={`h-5 w-5 ${s.color}`} />
              </div>
              <span className="text-sm text-gray-600 font-medium">{s.label}</span>
            </div>
            <div className="text-3xl font-bold text-gray-900">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Recent Runs</h2>
            <Link href="/runs" className="text-brand-600 text-sm hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {(recentRuns.data ?? []).map(run => (
              <Link key={run.id} href={`/runs/${run.id}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    run.status === 'success' ? 'bg-green-100 text-green-700' :
                    run.status === 'failed' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>{run.status}</span>
                  <span className="text-sm text-gray-700">{(run.agents as { name: string } | null)?.name ?? 'Unknown'}</span>
                </div>
                <span className="text-xs text-gray-500">{formatCost(run.cost_usd ?? 0)}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Success Rate</h2>
          <div className="text-5xl font-bold text-gray-900 mb-2">{successRate}%</div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-green-500 h-2 rounded-full" style={{ width: `${successRate}%` }} />
          </div>
          <p className="text-sm text-gray-500 mt-2">{totalRuns - failedRuns} of {totalRuns} runs succeeded</p>
        </div>
      </div>
    </div>
  );
}
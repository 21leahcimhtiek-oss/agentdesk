import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { formatDateTime, formatCost, formatLatency } from '@/lib/utils';
import StatusBadge from '@/components/StatusBadge';

export default async function AgentDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: agent } = await supabase.from('agents').select('*').eq('id', params.id).single();
  if (!agent) notFound();

  const { data: runs } = await supabase
    .from('agent_runs')
    .select('*')
    .eq('agent_id', params.id)
    .order('started_at', { ascending: false })
    .limit(20);

  const totalRuns = runs?.length ?? 0;
  const failedRuns = runs?.filter(r => r.status === 'failed').length ?? 0;
  const totalCost = runs?.reduce((sum, r) => sum + (r.cost_usd ?? 0), 0) ?? 0;
  const avgLatency = totalRuns > 0 ? Math.round((runs?.reduce((sum, r) => sum + (r.latency_ms ?? 0), 0) ?? 0) / totalRuns) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/agents" className="text-gray-500 hover:text-gray-700"><ArrowLeft className="h-5 w-5" /></Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{agent.name}</h1>
          <p className="text-gray-500 text-sm">{agent.description ?? 'No description'}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Runs', value: totalRuns },
          { label: 'Failed', value: failedRuns },
          { label: 'Total Cost', value: formatCost(totalCost) },
          { label: 'Avg Latency', value: formatLatency(avgLatency) },
        ].map(s => (
          <div key={s.label} className="card p-4">
            <div className="text-sm text-gray-500">{s.label}</div>
            <div className="text-2xl font-bold text-gray-900">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">Recent Runs</h2>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
            <tr>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-left">Started</th>
              <th className="px-6 py-3 text-right">Tokens</th>
              <th className="px-6 py-3 text-right">Cost</th>
              <th className="px-6 py-3 text-right">Latency</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {runs?.map(run => (
              <tr key={run.id} className="hover:bg-gray-50">
                <td className="px-6 py-4"><Link href={`/runs/${run.id}`}><StatusBadge status={run.status} /></Link></td>
                <td className="px-6 py-4 text-sm text-gray-600">{formatDateTime(run.started_at)}</td>
                <td className="px-6 py-4 text-sm text-right text-gray-600">{run.tokens_used}</td>
                <td className="px-6 py-4 text-sm text-right text-gray-600">{formatCost(run.cost_usd)}</td>
                <td className="px-6 py-4 text-sm text-right text-gray-600">{formatLatency(run.latency_ms)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
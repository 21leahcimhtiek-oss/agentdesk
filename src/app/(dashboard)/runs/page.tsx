import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { formatDateTime, formatCost, formatLatency } from '@/lib/utils';
import StatusBadge from '@/components/StatusBadge';

export default async function RunsPage({ searchParams }: { searchParams: { status?: string; agent?: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: member } = await supabase.from('members').select('org_id').eq('user_id', user.id).single();

  let query = supabase
    .from('agent_runs')
    .select('*, agents(name)')
    .eq('org_id', member?.org_id ?? '')
    .order('started_at', { ascending: false })
    .limit(100);

  if (searchParams.status) query = query.eq('status', searchParams.status);
  if (searchParams.agent) query = query.eq('agent_id', searchParams.agent);

  const { data: runs } = await query;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Runs</h1>
        <p className="text-gray-600 text-sm mt-1">{runs?.length ?? 0} runs</p>
      </div>

      <div className="flex gap-2">
        {['', 'success', 'failed', 'running', 'pending'].map(s => (
          <Link key={s} href={s ? `/runs?status=${s}` : '/runs'}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
              (searchParams.status ?? '') === s ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
            }`}>
            {s || 'All'}
          </Link>
        ))}
      </div>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
            <tr>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-left">Agent</th>
              <th className="px-6 py-3 text-left">Started</th>
              <th className="px-6 py-3 text-right">Tokens</th>
              <th className="px-6 py-3 text-right">Cost</th>
              <th className="px-6 py-3 text-right">Latency</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {runs?.map(run => (
              <tr key={run.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <Link href={`/runs/${run.id}`}><StatusBadge status={run.status} /></Link>
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">{(run.agents as { name: string } | null)?.name ?? '—'}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{formatDateTime(run.started_at)}</td>
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
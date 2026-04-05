import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { formatDateTime, formatCost, formatLatency } from '@/lib/utils';
import StatusBadge from '@/components/StatusBadge';
import TraceViewer from '@/components/TraceViewer';

export default async function RunDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: run } = await supabase
    .from('agent_runs')
    .select('*, agents(name, slug)')
    .eq('id', params.id)
    .single();

  if (!run) notFound();

  const agent = run.agents as { name: string; slug: string } | null;

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-4">
        <Link href="/runs" className="text-gray-500 hover:text-gray-700"><ArrowLeft className="h-5 w-5" /></Link>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">Run Trace</h1>
          <StatusBadge status={run.status} />
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Agent', value: agent?.name ?? '—' },
          { label: 'Tokens Used', value: run.tokens_used },
          { label: 'Cost', value: formatCost(run.cost_usd) },
          { label: 'Latency', value: formatLatency(run.latency_ms) },
        ].map(s => (
          <div key={s.label} className="card p-4">
            <div className="text-xs text-gray-500 mb-1">{s.label}</div>
            <div className="font-semibold text-gray-900">{s.value}</div>
          </div>
        ))}
      </div>

      {run.error_message && (
        <div className="card p-4 border-red-200 bg-red-50">
          <div className="text-sm font-medium text-red-800 mb-1">Error</div>
          <div className="text-sm text-red-700 font-mono">{run.error_message}</div>
        </div>
      )}

      <div className="card p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Tool Calls</h2>
        <TraceViewer toolCalls={run.tool_calls ?? []} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="font-semibold text-gray-900 mb-3">Input</h2>
          <pre className="text-xs bg-gray-50 p-3 rounded-lg overflow-auto max-h-64 text-gray-700">{JSON.stringify(run.input, null, 2)}</pre>
        </div>
        <div className="card p-6">
          <h2 className="font-semibold text-gray-900 mb-3">Output</h2>
          <pre className="text-xs bg-gray-50 p-3 rounded-lg overflow-auto max-h-64 text-gray-700">{JSON.stringify(run.output, null, 2)}</pre>
        </div>
      </div>

      <div className="text-xs text-gray-400 flex gap-6">
        <span>Started: {formatDateTime(run.started_at)}</span>
        {run.completed_at && <span>Completed: {formatDateTime(run.completed_at)}</span>}
      </div>
    </div>
  );
}
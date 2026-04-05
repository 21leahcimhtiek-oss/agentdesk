import Link from 'next/link';
import StatusBadge from './StatusBadge';
import { formatDateTime, formatCost, formatLatency } from '@/lib/utils';
import type { AgentRun } from '@/types';

interface Props {
  run: AgentRun & { agents?: { name: string } };
}

export default function RunRow({ run }: Props) {
  return (
    <tr className="hover:bg-gray-50 border-b border-gray-100 last:border-0">
      <td className="px-6 py-4">
        <Link href={`/runs/${run.id}`} className="hover:opacity-80">
          <StatusBadge status={run.status} />
        </Link>
      </td>
      <td className="px-6 py-4 text-sm text-gray-700">{run.agents?.name ?? '—'}</td>
      <td className="px-6 py-4 text-sm text-gray-500">{formatDateTime(run.started_at)}</td>
      <td className="px-6 py-4 text-sm text-right text-gray-600">{run.tokens_used.toLocaleString()}</td>
      <td className="px-6 py-4 text-sm text-right text-gray-600">{formatCost(run.cost_usd)}</td>
      <td className="px-6 py-4 text-sm text-right text-gray-600">{formatLatency(run.latency_ms)}</td>
    </tr>
  );
}
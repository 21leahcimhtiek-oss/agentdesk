import Link from 'next/link';
import { Bot, ExternalLink } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';
import type { Agent } from '@/types';

interface Props {
  agent: Agent;
}

export default function AgentCard({ agent }: Props) {
  return (
    <Link href={`/agents/${agent.id}`} className="card p-6 hover:shadow-md transition-shadow block">
      <div className="flex items-start justify-between mb-3">
        <div className="p-2 bg-brand-50 rounded-lg">
          <Bot className="h-5 w-5 text-brand-600" />
        </div>
        {agent.endpoint_url && (
          <a href={agent.endpoint_url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="text-gray-400 hover:text-gray-600">
            <ExternalLink className="h-4 w-4" />
          </a>
        )}
      </div>
      <h3 className="font-semibold text-gray-900 mb-1">{agent.name}</h3>
      {agent.description && <p className="text-sm text-gray-500 mb-3 line-clamp-2">{agent.description}</p>}
      <div className="flex items-center justify-between mt-auto">
        <span className="text-xs text-gray-400 font-mono">{agent.slug}</span>
        <span className="text-xs text-gray-400">{formatRelativeTime(agent.created_at)}</span>
      </div>
    </Link>
  );
}
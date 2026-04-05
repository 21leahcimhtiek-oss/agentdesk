import Link from "next/link";
import type { Agent } from "@/types";
import { clsx } from "clsx";
import { Zap, Clock, Play } from "lucide-react";

const MODEL_LABELS: Record<string, string> = {
  "gpt-4o": "GPT-4o",
  "gpt-4o-mini": "GPT-4o-mini",
  "gpt-3.5-turbo": "GPT-3.5",
};

interface AgentCardProps {
  agent: Agent & { agent_executions?: { id: string; created_at: string; status: string }[] };
}

export default function AgentCard({ agent }: AgentCardProps) {
  const executions = agent.agent_executions ?? [];
  const lastExec = executions[0];
  const statusDotClass = {
    active: "bg-green-400",
    idle: "bg-yellow-400",
    error: "bg-red-400",
    deleted: "bg-gray-400",
  }[agent.status] ?? "bg-gray-400";

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-gray-700 transition-colors flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className={clsx("w-2.5 h-2.5 rounded-full flex-shrink-0", statusDotClass)} />
          <h3 className="text-white font-semibold text-sm truncate max-w-[160px]">{agent.name}</h3>
        </div>
        <span className="text-xs bg-aurora-950 text-aurora-400 border border-aurora-900 px-2 py-0.5 rounded-full">
          {MODEL_LABELS[agent.model] ?? agent.model}
        </span>
      </div>

      {agent.description && (
        <p className="text-gray-400 text-xs leading-relaxed line-clamp-2">{agent.description}</p>
      )}

      <div className="flex items-center justify-between text-xs text-gray-500 pt-1 border-t border-gray-800">
        <span className="flex items-center gap-1">
          <Zap className="w-3 h-3" /> {executions.length} runs
        </span>
        {lastExec ? (
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {new Date(lastExec.created_at).toLocaleDateString()}
          </span>
        ) : (
          <span className="text-gray-600">No runs yet</span>
        )}
      </div>

      <div className="flex gap-2">
        <Link href={`/agents/${agent.id}`}
          className="flex-1 text-center text-xs border border-gray-700 hover:border-gray-500 text-gray-300 py-2 rounded-lg transition-colors">
          View
        </Link>
        <Link href={`/agents/${agent.id}`}
          className="flex items-center gap-1 text-xs bg-aurora-600 hover:bg-aurora-700 text-white px-3 py-2 rounded-lg transition-colors">
          <Play className="w-3 h-3" /> Run
        </Link>
      </div>
    </div>
  );
}
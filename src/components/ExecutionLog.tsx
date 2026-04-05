"use client";
import { useState } from "react";
import type { AgentExecution } from "@/types";
import { ChevronDown, ChevronUp, Clock, Zap, DollarSign } from "lucide-react";
import { clsx } from "clsx";

interface ExecutionLogProps {
  execution: AgentExecution;
}

export default function ExecutionLog({ execution }: ExecutionLogProps) {
  const [expanded, setExpanded] = useState(false);

  const statusStyles = {
    success: "bg-green-950 text-green-400 border-green-900",
    failed: "bg-red-950 text-red-400 border-red-900",
    running: "bg-yellow-950 text-yellow-400 border-yellow-900",
  };

  return (
    <div className="border border-gray-800 rounded-xl overflow-hidden">
      <button onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-800/50 transition-colors text-left">
        <div className="flex items-center gap-3">
          <span className={clsx("text-xs border px-2 py-0.5 rounded-full font-medium", statusStyles[execution.status])}>
            {execution.status}
          </span>
          <span className="text-gray-300 text-sm truncate max-w-[300px]">{execution.input}</span>
        </div>
        <div className="flex items-center gap-4 text-xs text-gray-500">
          {execution.duration_ms && (
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{execution.duration_ms}ms</span>
          )}
          <span className="flex items-center gap-1"><Zap className="w-3 h-3" />{execution.tokens_used}</span>
          <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />${Number(execution.cost_usd).toFixed(4)}</span>
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>
      {expanded && (
        <div className="border-t border-gray-800 p-4 space-y-3 bg-gray-900/50">
          <div>
            <p className="text-xs font-medium text-gray-400 mb-1">Input</p>
            <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono bg-gray-800 rounded-lg p-3 max-h-32 overflow-y-auto">{execution.input}</pre>
          </div>
          {execution.output && (
            <div>
              <p className="text-xs font-medium text-gray-400 mb-1">Output</p>
              <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono bg-gray-800 rounded-lg p-3 max-h-48 overflow-y-auto">{execution.output}</pre>
            </div>
          )}
          {execution.error && (
            <div>
              <p className="text-xs font-medium text-red-400 mb-1">Error</p>
              <pre className="text-sm text-red-300 whitespace-pre-wrap font-mono bg-red-950 rounded-lg p-3">{execution.error}</pre>
            </div>
          )}
          <p className="text-xs text-gray-500">{new Date(execution.created_at).toLocaleString()}</p>
        </div>
      )}
    </div>
  );
}
"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { TraceViewer } from "@/components/TraceViewer";
import { StatusBadge } from "@/components/StatusBadge";
import { formatCost, formatLatency, formatDate, formatTokens } from "@/lib/utils";

interface RunDetail {
  id: string;
  status: "pending" | "running" | "success" | "failed";
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  tool_calls: unknown[];
  tokens_used: number;
  cost_usd: number;
  latency_ms: number;
  error_message?: string;
  started_at: string;
  completed_at?: string;
  agents?: { name: string; slug: string };
}

export default function RunDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [run, setRun] = useState<RunDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/runs/${id}`)
      .then((r) => r.json())
      .then((d) => { setRun(d.run); setLoading(false); });
  }, [id]);

  if (loading) return <div className="p-8 text-center text-gray-400">Loading run...</div>;
  if (!run) return <div className="p-8 text-center text-red-400">Run not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-mono">{run.id}</h1>
          <p className="text-gray-500 text-sm mt-1">{run.agents?.name} · {formatDate(run.started_at)}</p>
        </div>
        <StatusBadge status={run.status} />
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Tokens Used", value: formatTokens(run.tokens_used) },
          { label: "Cost", value: formatCost(run.cost_usd) },
          { label: "Latency", value: formatLatency(run.latency_ms) },
          { label: "Tool Calls", value: Array.isArray(run.tool_calls) ? run.tool_calls.length : 0 },
        ].map((m) => (
          <div key={m.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500">{m.label}</p>
            <p className="text-xl font-bold text-gray-900 mt-1">{m.value}</p>
          </div>
        ))}
      </div>

      {run.error_message && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-sm font-medium text-red-700">Error</p>
          <p className="text-sm text-red-600 mt-1 font-mono">{run.error_message}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Input</h3>
          <pre className="text-xs text-gray-600 overflow-auto max-h-48 bg-gray-50 p-3 rounded">{JSON.stringify(run.input, null, 2)}</pre>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Output</h3>
          <pre className="text-xs text-gray-600 overflow-auto max-h-48 bg-gray-50 p-3 rounded">{JSON.stringify(run.output, null, 2)}</pre>
        </div>
      </div>

      <TraceViewer toolCalls={run.tool_calls as Array<{ name: string; input: unknown; output: unknown; latency_ms?: number }>} />
    </div>
  );
}
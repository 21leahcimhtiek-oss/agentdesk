"use client";
import { useEffect, useState } from "react";
import { StatusBadge } from "@/components/StatusBadge";
import { formatCost, formatLatency, formatDate, cn } from "@/lib/utils";
import Link from "next/link";

interface Run {
  id: string;
  agent_id: string;
  status: "pending" | "running" | "success" | "failed";
  tokens_used: number;
  cost_usd: number;
  latency_ms: number;
  started_at: string;
  agents?: { name: string };
}

const STATUS_FILTERS = ["all", "success", "failed", "running", "pending"] as const;

export default function RunsPage() {
  const [runs, setRuns] = useState<Run[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    const params = filter !== "all" ? `?status=${filter}` : "";
    fetch(`/api/runs${params}`)
      .then((r) => r.json())
      .then((d) => { setRuns(d.runs || []); setLoading(false); });
  }, [filter]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Agent Runs</h1>
        <p className="text-gray-500 text-sm mt-1">Full history of all agent executions</p>
      </div>
      <div className="flex gap-2">
        {STATUS_FILTERS.map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={cn("px-3 py-1 rounded-full text-sm font-medium capitalize",
              filter === s ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200")}>
            {s}
          </button>
        ))}
      </div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {["Run ID", "Agent", "Status", "Tokens", "Cost", "Latency", "Started"].map((h) => (
                <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-400">Loading runs...</td></tr>
            ) : runs.length === 0 ? (
              <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-400">No runs found</td></tr>
            ) : runs.map((run) => (
              <tr key={run.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-mono text-blue-600">
                  <Link href={`/runs/${run.id}`}>{run.id.slice(0, 8)}...</Link>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">{run.agents?.name ?? "—"}</td>
                <td className="px-6 py-4"><StatusBadge status={run.status} /></td>
                <td className="px-6 py-4 text-sm text-gray-600">{run.tokens_used.toLocaleString()}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{formatCost(run.cost_usd)}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{formatLatency(run.latency_ms)}</td>
                <td className="px-6 py-4 text-sm text-gray-400">{formatDate(run.started_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
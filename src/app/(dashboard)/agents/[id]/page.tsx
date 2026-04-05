import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ArrowLeft, Play } from "lucide-react";
import ExecutionLog from "@/components/ExecutionLog";

export const metadata = { title: "Agent Details" };

export default async function AgentDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: agent } = await supabase.from("agents").select("*").eq("id", params.id).single();
  if (!agent) notFound();

  const { data: executions } = await supabase
    .from("agent_executions")
    .select("*")
    .eq("agent_id", params.id)
    .order("created_at", { ascending: false })
    .limit(20);

  const statusColor = { active: "text-green-400", idle: "text-yellow-400", error: "text-red-400", deleted: "text-gray-400" };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <Link href="/agents" className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to agents
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">{agent.name}</h1>
              <span className={`text-sm font-medium ${statusColor[agent.status as keyof typeof statusColor] ?? "text-gray-400"}`}>
                ● {agent.status}
              </span>
            </div>
            {agent.description && <p className="text-gray-400 text-sm mt-1">{agent.description}</p>}
          </div>
          <Link href={`/agents/${agent.id}/run`} className="inline-flex items-center gap-2 bg-aurora-600 hover:bg-aurora-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors">
            <Play className="w-4 h-4" /> Run now
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Model", value: agent.model },
          { label: "Temperature", value: agent.temperature },
          { label: "Max Tokens", value: agent.max_tokens.toLocaleString() },
          { label: "Created", value: new Date(agent.created_at).toLocaleDateString() },
        ].map(({ label, value }) => (
          <div key={label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-xs text-gray-400 mb-1">{label}</p>
            <p className="text-white font-medium text-sm">{String(value)}</p>
          </div>
        ))}
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <h2 className="text-sm font-medium text-gray-400 mb-3">System Prompt</h2>
        <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono bg-gray-800/50 rounded-lg p-4 max-h-48 overflow-y-auto">
          {agent.system_prompt || "(no system prompt)"}
        </pre>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Recent Executions</h2>
        {executions && executions.length > 0 ? (
          <div className="space-y-3">
            {executions.map((exec: any) => <ExecutionLog key={exec.id} execution={exec} />)}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No executions yet.</p>
        )}
      </div>
    </div>
  );
}
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Plus, Search } from "lucide-react";
import AgentCard from "@/components/AgentCard";

export const metadata = { title: "Agents" };

export default async function AgentsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const member = await supabase.from("org_members").select("org_id").eq("user_id", user.id).single();
  const orgId = member.data?.org_id;

  const { data: agents } = await supabase
    .from("agents")
    .select(`id, name, description, model, status, created_at, updated_at,
      agent_executions(id, created_at, status)`)
    .eq("org_id", orgId)
    .neq("status", "deleted")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Agents</h1>
          <p className="text-gray-400 text-sm mt-1">{agents?.length ?? 0} agents in your workspace</p>
        </div>
        <Link href="/agents/new" className="inline-flex items-center gap-2 bg-aurora-600 hover:bg-aurora-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors">
          <Plus className="w-4 h-4" /> New Agent
        </Link>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="search" placeholder="Search agents..."
          className="w-full bg-gray-900 border border-gray-700 text-white pl-10 pr-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-aurora-500 text-sm" />
      </div>

      {agents && agents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {agents.map((agent: any) => <AgentCard key={agent.id} agent={agent} />)}
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 border-dashed rounded-2xl p-16 text-center">
          <div className="w-16 h-16 bg-aurora-950 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-aurora-800">
            <Plus className="w-8 h-8 text-aurora-400" />
          </div>
          <h3 className="text-white font-semibold text-lg mb-2">No agents yet</h3>
          <p className="text-gray-400 text-sm mb-6">Create your first AI agent to get started.</p>
          <Link href="/agents/new" className="inline-flex items-center gap-2 bg-aurora-600 hover:bg-aurora-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
            <Plus className="w-4 h-4" /> Create your first agent
          </Link>
        </div>
      )}
    </div>
  );
}
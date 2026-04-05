import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Executions" };

export default async function ExecutionsPage({ searchParams }: { searchParams: { page?: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const member = await supabase.from("org_members").select("org_id").eq("user_id", user.id).single();
  const orgId = member.data?.org_id;
  const page = parseInt(searchParams.page ?? "1");
  const perPage = 50;
  const from = (page - 1) * perPage;

  const { data: executions, count } = await supabase
    .from("agent_executions")
    .select("*, agents(name, model)", { count: "exact" })
    .eq("org_id", orgId)
    .order("created_at", { ascending: false })
    .range(from, from + perPage - 1);

  const totalPages = Math.ceil((count ?? 0) / perPage);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Execution History</h1>
        <p className="text-gray-400 text-sm mt-1">{count?.toLocaleString() ?? 0} total executions</p>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-800/50 border-b border-gray-700">
              <tr className="text-gray-400">
                <th className="text-left px-4 py-3 font-medium">Agent</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-right px-4 py-3 font-medium">Duration</th>
                <th className="text-right px-4 py-3 font-medium">Tokens</th>
                <th className="text-right px-4 py-3 font-medium">Cost</th>
                <th className="text-right px-4 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {(executions ?? []).map((exec: any) => (
                <tr key={exec.id} className="text-gray-300 hover:bg-gray-800/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium">{exec.agents?.name ?? "—"}</div>
                    <div className="text-xs text-gray-500">{exec.agents?.model}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      exec.status === "success" ? "bg-green-950 text-green-400" :
                      exec.status === "failed" ? "bg-red-950 text-red-400" :
                      "bg-yellow-950 text-yellow-400"}`}>{exec.status}</span>
                  </td>
                  <td className="px-4 py-3 text-right">{exec.duration_ms ? `${exec.duration_ms}ms` : "—"}</td>
                  <td className="px-4 py-3 text-right">{exec.tokens_used.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right">${Number(exec.cost_usd).toFixed(4)}</td>
                  <td className="px-4 py-3 text-right text-gray-500 text-xs">{new Date(exec.created_at).toLocaleString()}</td>
                </tr>
              ))}
              {(!executions || executions.length === 0) && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">No executions found.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-4 py-4 border-t border-gray-800 flex items-center justify-between text-sm text-gray-400">
            <span>Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              {page > 1 && <a href={`?page=${page - 1}`} className="px-3 py-1 rounded bg-gray-800 hover:bg-gray-700 transition-colors">Previous</a>}
              {page < totalPages && <a href={`?page=${page + 1}`} className="px-3 py-1 rounded bg-gray-800 hover:bg-gray-700 transition-colors">Next</a>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
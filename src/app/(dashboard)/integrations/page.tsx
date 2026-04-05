import { createClient } from "@/lib/supabase/server";
import ApiKeyCard from "@/components/ApiKeyCard";

export const metadata = { title: "Integrations" };

export default async function IntegrationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const member = await supabase.from("org_members").select("org_id").eq("user_id", user.id).single();
  const orgId = member.data?.org_id;

  const [{ data: apiKeys }, { data: webhooks }] = await Promise.all([
    supabase.from("api_keys").select("*").eq("org_id", orgId).order("created_at", { ascending: false }),
    supabase.from("webhooks").select("*").eq("org_id", orgId).order("created_at", { ascending: false }),
  ]);

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Integrations</h1>
        <p className="text-gray-400 text-sm mt-1">Manage API keys and webhook endpoints</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">API Keys</h2>
          <button className="bg-aurora-600 hover:bg-aurora-700 text-white text-sm px-4 py-2 rounded-lg font-medium transition-colors">
            Create key
          </button>
        </div>
        {(apiKeys ?? []).length > 0 ? (
          <div className="space-y-3">
            {(apiKeys ?? []).map((key: any) => <ApiKeyCard key={key.id} apiKey={key} />)}
          </div>
        ) : (
          <div className="bg-gray-900 border border-gray-800 border-dashed rounded-xl p-8 text-center text-gray-500">
            No API keys yet. Create one to access AgentDesk programmatically.
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Webhooks</h2>
          <button className="bg-aurora-600 hover:bg-aurora-700 text-white text-sm px-4 py-2 rounded-lg font-medium transition-colors">
            Add webhook
          </button>
        </div>
        {(webhooks ?? []).length > 0 ? (
          <div className="space-y-3">
            {(webhooks ?? []).map((wh: any) => (
              <div key={wh.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-white font-medium text-sm">{wh.url}</p>
                    <p className="text-gray-400 text-xs mt-1">{wh.events.join(", ")}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${wh.is_active ? "bg-green-950 text-green-400" : "bg-gray-800 text-gray-400"}`}>
                      {wh.is_active ? "active" : "inactive"}
                    </span>
                    <button className="text-red-400 hover:text-red-300 text-xs transition-colors">Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-900 border border-gray-800 border-dashed rounded-xl p-8 text-center text-gray-500">
            No webhooks configured. Add one to receive execution events.
          </div>
        )}
      </div>
    </div>
  );
}
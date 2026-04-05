import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const member = await supabase
    .from("org_members")
    .select("org_id, role, orgs(id, name, slug, plan, created_at)")
    .eq("user_id", user.id)
    .single();

  const org = (member.data?.orgs as any);
  const myRole = member.data?.role;

  const { data: members } = await supabase
    .from("org_members")
    .select("user_id, role, created_at")
    .eq("org_id", org?.id);

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-gray-400 text-sm mt-1">Manage your organization settings</p>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-5">
        <h2 className="text-lg font-semibold text-white">Organization</h2>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Organization name</label>
          <input type="text" defaultValue={org?.name}
            className="w-full bg-gray-800 border border-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-aurora-500 transition"
            readOnly={myRole === "viewer" || myRole === "member"} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Slug</label>
          <input type="text" defaultValue={org?.slug}
            className="w-full bg-gray-800 border border-gray-700 text-gray-400 px-4 py-3 rounded-lg" readOnly />
        </div>
        {(myRole === "owner" || myRole === "admin") && (
          <button className="bg-aurora-600 hover:bg-aurora-700 text-white text-sm px-4 py-2 rounded-lg font-medium transition-colors">
            Save changes
          </button>
        )}
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Team Members</h2>
          {(myRole === "owner" || myRole === "admin") && (
            <button className="bg-aurora-600 hover:bg-aurora-700 text-white text-sm px-4 py-2 rounded-lg font-medium transition-colors">
              Invite member
            </button>
          )}
        </div>
        <div className="space-y-2">
          {(members ?? []).map((m: any) => (
            <div key={m.user_id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
              <div>
                <p className="text-white text-sm font-medium">{m.user_id.slice(0, 8)}…</p>
                <p className="text-gray-500 text-xs">{new Date(m.created_at).toLocaleDateString()}</p>
              </div>
              <span className="text-xs capitalize bg-gray-700 text-gray-300 px-2 py-1 rounded">{m.role}</span>
            </div>
          ))}
        </div>
      </div>

      {myRole === "owner" && (
        <div className="bg-gray-900 border border-red-900 rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-red-400">Danger Zone</h2>
          <p className="text-gray-400 text-sm">Permanently delete this organization and all its data. This action cannot be undone.</p>
          <button className="border border-red-800 hover:bg-red-950 text-red-400 text-sm px-4 py-2 rounded-lg font-medium transition-colors">
            Delete organization
          </button>
        </div>
      )}
    </div>
  );
}
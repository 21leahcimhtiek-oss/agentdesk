import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import AgentForm from "@/components/AgentForm";
import { ArrowLeft } from "lucide-react";

export const metadata = { title: "New Agent" };

export default async function NewAgentPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <Link href="/agents" className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to agents
        </Link>
        <h1 className="text-2xl font-bold text-white">Create new agent</h1>
        <p className="text-gray-400 text-sm mt-1">Configure your AI agent&apos;s behavior and model settings.</p>
      </div>
      <AgentForm mode="create" />
    </div>
  );
}
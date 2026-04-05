import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import AgentCard from '@/components/AgentCard';

export default async function AgentsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: member } = await supabase.from('members').select('org_id').eq('user_id', user.id).single();
  const { data: agents } = await supabase.from('agents').select('*').eq('org_id', member?.org_id ?? '').order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agents</h1>
          <p className="text-gray-600 text-sm mt-1">{agents?.length ?? 0} registered agents</p>
        </div>
        <Link href="/agents/new" className="btn-primary flex items-center gap-2">
          <Plus className="h-4 w-4" /> Register Agent
        </Link>
      </div>
      {agents?.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-gray-500 mb-4">No agents registered yet</p>
          <Link href="/agents/new" className="btn-primary">Register your first agent</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents?.map(agent => <AgentCard key={agent.id} agent={agent} />)}
        </div>
      )}
    </div>
  );
}
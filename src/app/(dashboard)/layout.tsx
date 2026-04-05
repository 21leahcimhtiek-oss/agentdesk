import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Sidebar from '@/components/Sidebar';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: member } = await supabase
    .from('members')
    .select('org_id, role, organizations(id, name, slug, plan)')
    .eq('user_id', user.id)
    .single();

  const org = member?.organizations as { id: string; name: string; slug: string; plan: string } | null;

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar orgName={org?.name ?? 'My Organization'} orgPlan={org?.plan ?? 'starter'} />
      <main className="flex-1 overflow-auto">
        <div className="p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function SettingsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: member } = await supabase
    .from('members')
    .select('role, organizations(id, name, slug, plan, monthly_run_limit)')
    .eq('user_id', user.id)
    .single();

  const org = member?.organizations as { id: string; name: string; slug: string; plan: string; monthly_run_limit: number } | null;

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
      </div>

      <div className="card p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Organization</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Organization Name</label>
            <input className="input" defaultValue={org?.name} readOnly />
          </div>
          <div>
            <label className="label">Slug</label>
            <input className="input" defaultValue={org?.slug} readOnly />
          </div>
          <div>
            <label className="label">Plan</label>
            <input className="input capitalize" defaultValue={org?.plan} readOnly />
          </div>
          <div>
            <label className="label">Monthly Run Limit</label>
            <input className="input" defaultValue={org?.monthly_run_limit} readOnly />
          </div>
        </div>
      </div>

      <div className="card p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Account</h2>
        <div>
          <label className="label">Email</label>
          <input className="input" defaultValue={user.email} readOnly />
        </div>
      </div>
    </div>
  );
}
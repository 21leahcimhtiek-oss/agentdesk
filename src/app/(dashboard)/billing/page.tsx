import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import BillingPlans from '@/components/BillingPlans';

export default async function BillingPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: member } = await supabase
    .from('members')
    .select('organizations(plan, stripe_customer_id, stripe_subscription_id)')
    .eq('user_id', user.id)
    .single();

  const org = member?.organizations as { plan: string; stripe_customer_id?: string; stripe_subscription_id?: string } | null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Billing</h1>
        <p className="text-gray-600 text-sm mt-1">Current plan: <span className="font-semibold capitalize">{org?.plan ?? 'starter'}</span></p>
      </div>
      <BillingPlans currentPlan={org?.plan ?? 'starter'} hasSubscription={!!org?.stripe_subscription_id} />
    </div>
  );
}
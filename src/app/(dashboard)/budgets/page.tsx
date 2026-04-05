import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import BudgetMeter from '@/components/BudgetMeter';

export default async function BudgetsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: member } = await supabase.from('members').select('org_id').eq('user_id', user.id).single();
  const { data: budgets } = await supabase
    .from('budgets')
    .select('*, agents(name)')
    .eq('org_id', member?.org_id ?? '');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Budgets</h1>
          <p className="text-gray-600 text-sm mt-1">Monitor spend against limits</p>
        </div>
      </div>

      {budgets?.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-gray-500">No budgets configured yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {budgets?.map(budget => (
            <BudgetMeter key={budget.id} budget={budget} agentName={(budget.agents as { name: string } | null)?.name} />
          ))}
        </div>
      )}
    </div>
  );
}
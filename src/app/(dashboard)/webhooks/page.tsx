import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { formatRelativeTime } from '@/lib/utils';

export default async function WebhooksPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: member } = await supabase.from('members').select('org_id').eq('user_id', user.id).single();
  const { data: webhooks } = await supabase
    .from('webhooks')
    .select('*')
    .eq('org_id', member?.org_id ?? '')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Webhooks</h1>
        <p className="text-gray-600 text-sm mt-1">Receive alerts for run failures, budget overruns, and anomalies</p>
      </div>

      <div className="card divide-y divide-gray-100">
        {webhooks?.length === 0 ? (
          <div className="p-12 text-center text-gray-500">No webhooks configured</div>
        ) : webhooks?.map(wh => (
          <div key={wh.id} className="p-6 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${wh.active ? 'bg-green-500' : 'bg-gray-400'}`} />
                <span className="font-medium text-gray-900 text-sm">{wh.url}</span>
              </div>
              <div className="mt-1 flex gap-2">
                {wh.events?.map((ev: string) => (
                  <span key={ev} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{ev}</span>
                ))}
              </div>
            </div>
            <span className="text-xs text-gray-400">{formatRelativeTime(wh.created_at)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
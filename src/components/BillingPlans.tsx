'use client';
import { useState } from 'react';
import { Check } from 'lucide-react';
import { PLANS } from '@/lib/stripe/client';
import { cn } from '@/lib/utils';

interface Props {
  currentPlan: string;
  hasSubscription: boolean;
}

export default function BillingPlans({ currentPlan, hasSubscription }: Props) {
  const [loading, setLoading] = useState<string | null>(null);

  async function handleUpgrade(plan: string) {
    setLoading(plan);
    const res = await fetch('/api/billing/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan }),
    });
    if (res.ok) {
      const { url } = await res.json();
      window.location.href = url;
    } else {
      setLoading(null);
    }
  }

  async function handlePortal() {
    setLoading('portal');
    const res = await fetch('/api/billing/portal', { method: 'POST' });
    if (res.ok) {
      const { url } = await res.json();
      window.location.href = url;
    }
    setLoading(null);
  }

  return (
    <div className="space-y-6">
      {hasSubscription && (
        <div className="card p-4 flex items-center justify-between">
          <span className="text-sm text-gray-600">Manage your subscription, invoices, and payment method</span>
          <button onClick={handlePortal} disabled={loading === 'portal'} className="btn-secondary text-sm">
            {loading === 'portal' ? 'Loading...' : 'Manage Billing'}
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {(Object.entries(PLANS) as [string, typeof PLANS.starter][]).map(([key, plan]) => {
          const isCurrent = currentPlan === key;
          return (
            <div key={key} className={cn('card p-6', isCurrent && 'ring-2 ring-brand-500')}>
              {isCurrent && <div className="text-xs font-semibold text-brand-600 mb-2">Current plan</div>}
              <div className="text-xl font-bold text-gray-900 mb-1">{plan.name}</div>
              <div className="text-3xl font-bold text-gray-900 mb-4">
                ${plan.price}<span className="text-base font-normal text-gray-500">/mo</span>
              </div>
              <ul className="space-y-2 mb-6">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                    <Check className="h-4 w-4 text-green-500 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => !isCurrent && handleUpgrade(key)}
                disabled={isCurrent || loading === key}
                className={cn('w-full', isCurrent ? 'btn-secondary opacity-50 cursor-default' : 'btn-primary')}
              >
                {loading === key ? 'Loading...' : isCurrent ? 'Current plan' : 'Upgrade'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
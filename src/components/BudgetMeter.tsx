import { cn } from '@/lib/utils';
import type { Budget } from '@/types';

interface Props {
  budget: Budget;
  agentName?: string;
}

export default function BudgetMeter({ budget, agentName }: Props) {
  const pct = budget.monthly_limit_usd > 0
    ? Math.min((budget.current_spend_usd / budget.monthly_limit_usd) * 100, 100)
    : 0;

  const isAlert = pct >= budget.alert_threshold * 100;
  const isExceeded = pct >= 100;

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="font-medium text-gray-900 text-sm">{agentName ?? 'Organization Budget'}</div>
          <div className="text-xs text-gray-500">Monthly limit: ${budget.monthly_limit_usd}</div>
        </div>
        <div className={cn('text-sm font-bold', isExceeded ? 'text-red-600' : isAlert ? 'text-yellow-600' : 'text-gray-900')}>
          {pct.toFixed(1)}%
        </div>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
        <div
          className={cn('h-2 rounded-full transition-all', isExceeded ? 'bg-red-500' : isAlert ? 'bg-yellow-500' : 'bg-green-500')}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-500">
        <span>${Number(budget.current_spend_usd).toFixed(2)} spent</span>
        <span>${Number(budget.monthly_limit_usd).toFixed(2)} limit</span>
      </div>
      {isAlert && !isExceeded && (
        <div className="mt-2 text-xs text-yellow-700 bg-yellow-50 px-2 py-1 rounded">Alert threshold reached</div>
      )}
      {isExceeded && (
        <div className="mt-2 text-xs text-red-700 bg-red-50 px-2 py-1 rounded">Budget exceeded!</div>
      )}
    </div>
  );
}
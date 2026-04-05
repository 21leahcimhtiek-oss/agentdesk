import { AlertTriangle, Info, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  severity: 'low' | 'medium' | 'high' | 'critical';
  label?: string;
}

export default function AlertBadge({ severity, label }: Props) {
  const config = {
    low: { icon: Info, classes: 'bg-blue-50 text-blue-700' },
    medium: { icon: AlertTriangle, classes: 'bg-yellow-50 text-yellow-700' },
    high: { icon: AlertCircle, classes: 'bg-orange-50 text-orange-700' },
    critical: { icon: AlertCircle, classes: 'bg-red-50 text-red-700' },
  }[severity];

  const Icon = config.icon;

  return (
    <span className={cn('inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium', config.classes)}>
      <Icon className="h-3 w-3" />
      {label ?? severity}
    </span>
  );
}
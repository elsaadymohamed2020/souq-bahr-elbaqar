import React from 'react';
import { CheckCircle2, Clock3, XCircle } from 'lucide-react';
import { cn } from '../../lib/cn';

const TONES = {
  neutral: 'bg-surface-2 text-fg-muted border-line',
  ink: 'bg-ink text-white border-ink',
  amber: 'bg-amber-100 text-amber-900 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30',
  solidAmber: 'bg-amber-500 text-ink border-amber-500',
  emerald: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30',
  red: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/15 dark:text-red-300 dark:border-red-500/30',
  blue: 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/30',
  purple: 'bg-violet-50 text-violet-800 border-violet-200 dark:bg-violet-500/15 dark:text-violet-300 dark:border-violet-500/30',
  glass: 'bg-white/90 text-ink border-white/60 backdrop-blur',
};

export default function Badge({ tone = 'neutral', icon: Icon, className, children, size = 'sm' }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border font-bold leading-none whitespace-nowrap',
        size === 'xs' ? 'px-2 py-1 text-[10px]' : 'px-2.5 py-1.5 text-[11px]',
        TONES[tone],
        className
      )}
    >
      {Icon ? <Icon className={size === 'xs' ? 'h-3 w-3' : 'h-3.5 w-3.5'} aria-hidden="true" /> : null}
      {children}
    </span>
  );
}

export const STATUS_META = {
  avail: { label: 'متاح', tone: 'emerald', icon: CheckCircle2 },
  held: { label: 'محجوز', tone: 'amber', icon: Clock3 },
  sold: { label: 'اتباع', tone: 'red', icon: XCircle },
};

export function StatusBadge({ status, className, size, labels }) {
  const meta = STATUS_META[status] || STATUS_META.avail;
  const label = labels?.[status] || meta.label;
  return (
    <Badge tone={meta.tone} icon={meta.icon} className={className} size={size}>
      {label}
    </Badge>
  );
}

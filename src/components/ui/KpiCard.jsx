import React from 'react';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';
import { TrendingDown, TrendingUp } from 'lucide-react';
import AnimatedNumber from './AnimatedNumber';
import { cn } from '../../lib/cn';

const ICON_TONES = {
  amber: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  blue: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
  purple: 'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300',
  ink: 'bg-ink text-amber-400 dark:bg-white/10',
};

const STROKES = { amber: '#F59E0B', emerald: '#10B981', blue: '#1F6FEB', purple: '#8B5CF6', ink: '#0B152B' };

/**
 * KPI tile: label, animated value, delta, optional sparkline.
 * spark: number[]  (optional)
 */
export default function KpiCard({
  label,
  value,
  format,
  suffix,
  icon: Icon,
  tone = 'amber',
  delta,
  deltaLabel,
  spark,
  onClick,
  className,
  footer,
}) {
  const Comp = onClick ? 'button' : 'div';
  const positive = typeof delta === 'number' ? delta >= 0 : true;
  const sparkData = spark?.map((v, i) => ({ i, v }));
  return (
    <Comp
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-card border border-line bg-surface p-4 text-right sm:p-5',
        onClick && 'transition-[box-shadow,transform,border-color] duration-200 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-lift',
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="text-xs font-bold text-fg-muted sm:text-sm">{label}</span>
        {Icon ? (
          <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl', ICON_TONES[tone])}>
            <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
          </span>
        ) : null}
      </div>
      <div className="mt-2 flex items-baseline gap-1.5">
        <AnimatedNumber value={value} format={format} className="font-heading text-2xl font-black text-fg sm:text-[28px]" />
        {suffix ? <span className="text-xs font-semibold text-fg-subtle">{suffix}</span> : null}
      </div>
      <div className="mt-1.5 flex min-h-[20px] items-center gap-2 text-xs">
        {typeof delta === 'number' ? (
          <span
            className={cn(
              'num inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 font-bold',
              positive ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300' : 'bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300'
            )}
          >
            {positive ? <TrendingUp className="h-3 w-3" aria-hidden="true" /> : <TrendingDown className="h-3 w-3" aria-hidden="true" />}
            {Math.abs(delta)}%
          </span>
        ) : null}
        {deltaLabel ? <span className="text-fg-subtle">{deltaLabel}</span> : null}
      </div>
      {sparkData ? (
        <div className="pointer-events-none -mx-5 -mb-5 mt-3 h-12" aria-hidden="true">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparkData} margin={{ top: 4, bottom: 0, left: 0, right: 0 }}>
              <defs>
                <linearGradient id={`spark-${tone}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={STROKES[tone]} stopOpacity={0.28} />
                  <stop offset="100%" stopColor={STROKES[tone]} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="v" stroke={STROKES[tone]} strokeWidth={2} fill={`url(#spark-${tone})`} isAnimationActive />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : null}
      {footer}
    </Comp>
  );
}

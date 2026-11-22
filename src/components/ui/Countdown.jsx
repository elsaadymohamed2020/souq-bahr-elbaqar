import React, { useEffect, useState } from 'react';
import { cn } from '../../lib/cn';

/** ends: 'YYYY-MM-DD' (end of that day, Cairo) or a Date / timestamp. */
export function toEndTime(ends) {
  if (!ends) return 0;
  if (typeof ends === 'number') return ends;
  if (ends instanceof Date) return ends.getTime();
  return new Date(`${ends}T23:59:59+02:00`).getTime();
}

export function useCountdown(ends) {
  const end = toEndTime(ends);
  const calc = () => Math.max(0, end - Date.now());
  const [left, setLeft] = useState(calc);
  useEffect(() => {
    setLeft(calc());
    const t = setInterval(() => setLeft(calc()), 1000);
    return () => clearInterval(t);
  }, [end]); // eslint-disable-line react-hooks/exhaustive-deps
  const s = Math.floor(left / 1000);
  return {
    done: left <= 0,
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
  };
}

const pad = (n) => String(n).padStart(2, '0');

/**
 * Countdown display.
 * variant 'boxes': [2 يوم][14:22:05]   variant 'inline': "فاضل 2 يوم 14:22:05"
 */
export default function Countdown({ ends, variant = 'boxes', className, tone = 'dark' }) {
  const { done, days, hours, minutes, seconds } = useCountdown(ends);
  if (done) return <span className={cn('text-xs font-bold text-fg-subtle', className)}>العرض خلص</span>;

  if (variant === 'inline') {
    return (
      <span className={cn('num inline-flex items-center gap-1 font-bold', className)} aria-label={`فاضل ${days} يوم و ${hours} ساعة`}>
        {days > 0 ? <span>{days} يوم</span> : null}
        <span dir="ltr">
          {pad(hours)}:{pad(minutes)}:{pad(seconds)}
        </span>
      </span>
    );
  }

  const box =
    tone === 'dark'
      ? 'bg-ink text-white dark:bg-white/10'
      : tone === 'amber'
      ? 'bg-amber-500 text-ink'
      : 'bg-white/15 text-white';
  const units = [
    { v: days, l: 'يوم' },
    { v: hours, l: 'ساعة' },
    { v: minutes, l: 'دقيقة' },
    { v: seconds, l: 'ثانية' },
  ];
  return (
    <div className={cn('flex items-center gap-1', className)} role="timer" aria-label={`فاضل ${days} يوم و ${hours} ساعة و ${minutes} دقيقة`}>
      {units.map((u) => (
        <span key={u.l} className={cn('num flex min-w-[40px] flex-col items-center rounded-lg px-1.5 py-1 leading-none', box)}>
          <span className="font-heading text-sm font-black">{pad(u.v)}</span>
          <span className="mt-0.5 text-[9px] font-semibold opacity-75">{u.l}</span>
        </span>
      ))}
    </div>
  );
}

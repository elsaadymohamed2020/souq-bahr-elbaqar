import React from 'react';

const defaultValue = (v, unit) => `${Number(v || 0).toLocaleString('en-US')}${unit ? ` ${unit}` : ''}`;

/**
 * One tooltip for every admin chart (recharts passes active, payload, label).
 * unit: suffix after each value ('ج' by default)
 * labelFormatter(label, payload) / valueFormatter(value, entry) are optional.
 */
export default function ChartTooltip({ active, payload, label, unit = 'ج', labelFormatter, valueFormatter, hideLabel }) {
  if (!active || !payload || !payload.length) return null;
  const heading = labelFormatter ? labelFormatter(label, payload) : label;
  return (
    <div dir="rtl" className="min-w-[168px] rounded-xl border border-white/10 bg-ink/95 px-3 py-2.5 text-right text-white shadow-soft-lg backdrop-blur">
      {!hideLabel && heading != null && heading !== '' ? (
        <p className="mb-1.5 border-b border-white/10 pb-1.5 font-heading text-xs font-black text-amber-300">{heading}</p>
      ) : null}
      <ul className="space-y-1 text-xs">
        {payload.map((entry, i) => {
          const color = entry.color || entry.payload?.fill || entry.payload?.color || '#F59E0B';
          return (
            <li key={`${entry.dataKey ?? entry.name}-${i}`} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: color }} aria-hidden="true" />
                {entry.name}
              </span>
              <span className="num font-heading font-bold text-white">
                {valueFormatter ? valueFormatter(entry.value, entry) : defaultValue(entry.value, unit)}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

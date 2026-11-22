import React, { useMemo, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import {
  ArrowLeftRight,
  Banknote,
  Boxes,
  Building2,
  CalendarClock,
  CreditCard,
  MapPin,
  Package,
  Receipt,
  Sparkles,
  TrendingUp,
  Warehouse,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Badge, Button, EmptyState, FilterChips, KpiCard } from '../ui';
import { cn } from '../../lib/cn';
import ChartTooltip from './ChartTooltip';
import { Panel, formatMonth, sum, useChartColors } from './adminShared';

// Profit of the last 6 months as a share of this month (illustrative trend)
const PROFIT_TREND = [0.58, 0.66, 0.63, 0.79, 0.88, 1];

const PAY_META = {
  كاش: { icon: Banknote, tone: 'neutral' },
  تحويل: { icon: ArrowLeftRight, tone: 'blue' },
  تقسيط: { icon: CalendarClock, tone: 'purple' },
};
const payMeta = (pay) => PAY_META[pay] || { icon: CreditCard, tone: 'blue' };

const kFormat = (v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : v);

export default function AdminERP() {
  const { invoices, products, baseFinancials, formatPrice, getFinalPrice, setIsRecordSaleOpen, branches } = useApp();
  const c = useChartColors();
  const reduce = useReducedMotion();
  const [branch, setBranch] = useState('all');

  const branchNames = branches.map((b) => b.locationName);
  const matches = (br) => branch === 'all' || br === branch;

  // One helper for money per branch and one for stock per branch
  const totalsFor = (br) => {
    const inv = invoices.filter((i) => br === 'all' || i.br === br);
    return {
      sales: (baseFinancials.sales[br] || 0) + sum(inv, (i) => i.price),
      profit: (baseFinancials.profit[br] || 0) + sum(inv, (i) => (i.price || 0) - (i.cost || 0)),
    };
  };
  const stockFor = (br) => {
    const items = products.filter((p) => p.status !== 'sold' && (br === 'all' || p.branch === br));
    return { count: items.length, cost: sum(items, (p) => p.cost), retail: sum(items, (p) => getFinalPrice(p)) };
  };

  const totals = totalsFor(branch);
  const stock = stockFor(branch);
  const margin = totals.sales ? Math.round((totals.profit / totals.sales) * 100) : 0;
  const branchInvoices = invoices.filter((i) => matches(i.br));

  const branchData = branchNames.map((name) => ({ name, ...totalsFor(name) }));
  const stockRows = branchNames.map((name) => ({ name, ...stockFor(name) }));
  const stockTotal = sum(stockRows, (r) => r.cost) || 1;

  const trend = useMemo(() => {
    const now = new Date();
    return PROFIT_TREND.map((ratio, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (PROFIT_TREND.length - 1 - i), 1);
      const isNow = i === PROFIT_TREND.length - 1;
      return { label: isNow ? 'الشهر ده' : formatMonth(d), profit: Math.round(totals.profit * ratio) };
    });
  }, [totals.profit]);
  const trendDelta = Math.round(((PROFIT_TREND[5] - PROFIT_TREND[4]) / PROFIT_TREND[4]) * 100);

  const branchOptions = [
    { id: 'all', label: 'كل الفروع', icon: Building2 },
    ...branchNames.map((n) => ({ id: n, label: `فرع ${n}`, icon: MapPin })),
  ];

  return (
    <div className="space-y-5 lg:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <FilterChips ariaLabel="اختار الفرع" options={branchOptions} value={branch} onChange={setBranch} className="min-w-0 sm:flex-1" />
        <Button variant="primary" onClick={() => setIsRecordSaleOpen(true)} className="shrink-0 self-start sm:self-auto">
          <Receipt className="h-[18px] w-[18px]" aria-hidden="true" />
          تسجيل بيعة
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <KpiCard
          label="مبيعات الشهر"
          value={totals.sales}
          format={(n) => formatPrice(Math.round(n))}
          suffix="ج"
          icon={Receipt}
          tone="blue"
          deltaLabel="شامل فواتير النهارده"
          spark={PROFIT_TREND.map((r) => Math.round(totals.sales * r))}
        />
        <KpiCard
          label="صافي الربح"
          value={totals.profit}
          format={(n) => formatPrice(Math.round(n))}
          suffix="ج"
          icon={TrendingUp}
          tone="emerald"
          delta={trendDelta}
          deltaLabel={`هامش ${margin}%`}
        />
        <KpiCard
          label="قيمة البضاعة في المخزن"
          value={stock.cost}
          format={(n) => formatPrice(Math.round(n))}
          suffix="ج"
          icon={Warehouse}
          tone="purple"
          deltaLabel={`هتتباع بـ ${formatPrice(stock.retail)} ج`}
        />
        <KpiCard label="قطع في المخزن" value={stock.count} suffix="قطعة" icon={Boxes} tone="ink" deltaLabel="متاحة ومحجوزة" />
      </div>

      <div className="grid gap-5 xl:grid-cols-12 xl:gap-6">
        <Panel className="xl:col-span-5" title="المبيعات حسب الفرع" subtitle="المبيعات والربح من أول الشهر">
          <ul className="mb-2 flex items-center gap-4 text-xs font-bold text-fg-muted" aria-hidden="true">
            <li className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: c.blue }} />
              المبيعات
            </li>
            <li className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: c.amber }} />
              الربح
            </li>
          </ul>
          <div className="h-60" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={branchData} margin={{ top: 8, right: 0, left: 4, bottom: 0 }} barGap={6} barCategoryGap="28%">
                <CartesianGrid vertical={false} stroke={c.grid} strokeDasharray="3 3" />
                <XAxis dataKey="name" reversed tickLine={false} axisLine={false} tickMargin={8} tick={{ fill: c.axis, fontSize: 12 }} />
                <YAxis orientation="right" tickLine={false} axisLine={false} width={44} tick={{ fill: c.axis, fontSize: 11 }} tickFormatter={kFormat} />
                <Tooltip cursor={{ fill: c.cursor }} content={<ChartTooltip labelFormatter={(l) => `فرع ${l}`} />} />
                <Bar dataKey="sales" name="المبيعات" fill={c.blue} radius={[8, 8, 0, 0]} maxBarSize={48} isAnimationActive={!reduce}>
                  {branchData.map((d) => (
                    <Cell key={d.name} fill={c.blue} fillOpacity={matches(d.name) ? 1 : 0.28} />
                  ))}
                </Bar>
                <Bar dataKey="profit" name="الربح" fill={c.amber} radius={[8, 8, 0, 0]} maxBarSize={48} isAnimationActive={!reduce}>
                  {branchData.map((d) => (
                    <Cell key={d.name} fill={c.amber} fillOpacity={matches(d.name) ? 1 : 0.28} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel
          className="xl:col-span-7"
          title="الربح آخر 6 شهور"
          subtitle={branch === 'all' ? 'كل الفروع' : `فرع ${branch}`}
          actions={
            <Badge tone="emerald" icon={TrendingUp}>
              <span className="num">{trendDelta}%</span> عن الشهر اللي فات
            </Badge>
          }
        >
          <div className="h-60" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend} margin={{ top: 12, right: 0, left: 8, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke={c.grid} strokeDasharray="3 3" />
                <XAxis dataKey="label" reversed tickLine={false} axisLine={false} tickMargin={8} interval="preserveStartEnd" tick={{ fill: c.axis, fontSize: 11 }} />
                <YAxis orientation="right" tickLine={false} axisLine={false} width={44} tick={{ fill: c.axis, fontSize: 11 }} tickFormatter={kFormat} />
                <Tooltip cursor={{ stroke: c.axis, strokeDasharray: '4 4' }} content={<ChartTooltip />} />
                <Line
                  type="monotone"
                  dataKey="profit"
                  name="صافي الربح"
                  stroke={c.amber}
                  strokeWidth={3}
                  dot={{ r: 3.5, fill: c.surface, stroke: c.amber, strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: c.amber, stroke: c.surface, strokeWidth: 2 }}
                  isAnimationActive={!reduce}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <div className="grid gap-5 xl:grid-cols-12 xl:gap-6">
        <Panel
          className="xl:col-span-8"
          title="الفواتير"
          subtitle={`${branchInvoices.length} فاتورة، الأحدث الأول`}
          bodyClassName="pt-2 sm:pt-3"
        >
          {branchInvoices.length ? (
            <ul className="divide-y divide-line">
              {branchInvoices.map((inv) => {
                const pm = payMeta(inv.pay);
                const today = inv.d === 'اليوم';
                return (
                  <li key={inv.n} className="flex flex-wrap items-center gap-x-3 gap-y-2 py-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-fg-muted">
                      <Receipt className="h-[18px] w-[18px]" aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1 basis-40">
                      <p className="flex min-w-0 items-center gap-2">
                        <span className="num shrink-0 text-[11px] font-bold text-fg-subtle" dir="ltr">
                          #{inv.n}
                        </span>
                        <span className="truncate font-heading text-sm font-bold text-fg">{inv.item}</span>
                        {today ? (
                          <Badge tone="amber" size="xs" icon={Sparkles} className="shrink-0">
                            جديدة
                          </Badge>
                        ) : null}
                      </p>
                      <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-xs text-fg-muted">
                        <span>{inv.cust}</span>
                        <span aria-hidden="true">·</span>
                        <span>فرع {inv.br}</span>
                        <span aria-hidden="true">·</span>
                        <span>{inv.d}</span>
                      </p>
                    </div>
                    <Badge tone={pm.tone} icon={pm.icon} size="xs" className="shrink-0">
                      {inv.pay}
                    </Badge>
                    <div className="ms-auto shrink-0 text-left">
                      <p className="font-heading text-base font-black text-fg">
                        <span className="num">{formatPrice(inv.price)}</span> <span className="text-xs font-semibold text-fg-subtle">ج</span>
                      </p>
                      <p className="num text-xs font-bold text-emerald-700 dark:text-emerald-400">ربح {formatPrice((inv.price || 0) - (inv.cost || 0))}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <EmptyState
              icon={Receipt}
              title="مفيش فواتير في الفرع ده لسه"
              description="أول بيعة تسجلها هتظهر هنا على طول."
              className="mt-2 py-10"
              action={
                <Button variant="primary" onClick={() => setIsRecordSaleOpen(true)}>
                  <Receipt className="h-4 w-4" aria-hidden="true" />
                  تسجيل بيعة
                </Button>
              }
            />
          )}
        </Panel>

        <Panel className="xl:col-span-4" title="البضاعة في كل فرع" subtitle="بسعر الشراء، من غير اللي اتباع">
          {stockRows.some((r) => r.count) ? (
            <ul className="space-y-3">
              {stockRows.map((r) => {
                const share = Math.round((r.cost / stockTotal) * 100);
                const active = matches(r.name);
                return (
                  <li
                    key={r.name}
                    className={cn(
                      'rounded-2xl border p-4 transition-[border-color,opacity] duration-200',
                      active ? 'border-line bg-surface-2/50' : 'border-line opacity-60'
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5 font-heading text-sm font-black text-fg">
                        <MapPin className="h-4 w-4 text-fg-subtle" aria-hidden="true" />
                        فرع {r.name}
                      </span>
                      <span className="num inline-flex items-center gap-1 text-xs font-bold text-fg-muted">
                        <Package className="h-3.5 w-3.5" aria-hidden="true" />
                        {r.count} قطعة
                      </span>
                    </div>
                    <p className="mt-2 font-heading text-xl font-black text-fg">
                      <span className="num">{formatPrice(r.cost)}</span> <span className="text-xs font-semibold text-fg-subtle">ج</span>
                    </p>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-3" role="presentation">
                      <div className="h-full rounded-full bg-violet-500 transition-[width] duration-500" style={{ width: `${share}%` }} />
                    </div>
                    <p className="num mt-1.5 flex justify-between text-[11px] text-fg-subtle">
                      <span>{share}% من البضاعة</span>
                      <span>هتتباع بـ {formatPrice(r.retail)} ج</span>
                    </p>
                  </li>
                );
              })}
            </ul>
          ) : (
            <EmptyState icon={Warehouse} title="المخزن فاضي" description="كل القطع اتباعت. ضيف قطع جديدة." className="py-8" />
          )}
        </Panel>
      </div>
    </div>
  );
}

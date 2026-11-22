import React, { useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import {
  BadgeCheck,
  CalendarDays,
  ChevronLeft,
  Eye,
  Flame,
  Globe,
  Hourglass,
  Layers,
  Lightbulb,
  MapPin,
  MessageCircle,
  MessageSquare,
  Moon,
  Package,
  PackagePlus,
  Receipt,
  Store,
  Tag,
  TrendingDown,
  TrendingUp,
  UserRoundCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useCairoClock } from '../../lib/hooks';
import { Avatar, Badge, Button, EmptyState, KpiCard, SegmentedControl } from '../ui';
import { WhatsAppIcon } from '../common/BrandIcons';
import { cn } from '../../lib/cn';
import ChartTooltip from './ChartTooltip';
import {
  ActivityIcon,
  CHANNELS,
  ChannelMark,
  Panel,
  formatDayLong,
  formatDayMonth,
  formatWeekday,
  isFresh,
  sum,
  useChartColors,
} from './adminShared';

// Illustrative daily numbers for the last 7 days (today gets real invoices added on top)
const DAILY = [
  { sales: 24500, profit: 7800 },
  { sales: 32000, profit: 9900 },
  { sales: 18500, profit: 5400 },
  { sales: 41000, profit: 13200 },
  { sales: 29000, profit: 8700 },
  { sales: 48500, profit: 16100 },
  { sales: 21500, profit: 6600 },
];
// Earlier weeks of the last 30 days (the current week is computed from DAILY)
const EARLIER_WEEKS = [
  { label: 'من 3 أسابيع', sales: 168000, profit: 51000 },
  { label: 'من أسبوعين', sales: 181000, profit: 55500 },
  { label: 'الأسبوع اللي فات', sales: 197000, profit: 60800 },
];
const PREV_30_DAYS = 690000;

// Where conversations came from in the last 30 days
const CHANNEL_MIX = [
  { id: 'wa', value: 580 },
  { id: 'fb', value: 390 },
  { id: 'ms', value: 215 },
  { id: 'ig', value: 75 },
];

// Reel-to-cash funnel (illustrative, last 30 days)
const FUNNEL = [
  { id: 'views', label: 'شافوا الريلز', value: 294000, display: '294K', icon: Eye },
  { id: 'asks', label: 'سألوا في التعليقات', value: 1420, icon: MessageCircle },
  { id: 'visits', label: 'دخلوا الموقع', value: 840, icon: Globe },
  { id: 'book', label: 'داسوا احجز على واتساب', value: 142, icon: WhatsAppIcon },
  { id: 'sold', label: 'اشتروا فعلاً', value: 38, icon: BadgeCheck },
];
const FUNNEL_REVENUE = 360000;

// What to prefill when the owner adds the piece a waiting customer wants
const WAIT_PREFILL = {
  فريزر: { name: 'ديب فريزر 7 درج نوفروست', cat: 'home' },
  موتور: { name: 'موتور مية 12 حصان Siemens', cat: 'ind' },
  غسالة: { name: 'غسالة أطباق 12 فرد مستوردة', cat: 'home' },
};
const prefillFor = (c) => WAIT_PREFILL[c.kw] || (c.kw ? { name: c.kw } : null);

const pctChange = (now, before) => (before ? Math.round(((now - before) / before) * 100) : 0);
const rateLabel = (r) => (r < 10 ? r.toFixed(1) : Math.round(r));

/* ------------------------------------------------------------------ */

function Greeting() {
  const { conversations, customers, isOpenNow, openAddProduct, setIsRecordSaleOpen, setIsAddOfferOpen, setIsAddDealOpen } = useApp();
  const { hour } = useCairoClock();
  const unread = conversations.filter((c) => c.unread).length;
  const waiting = customers.filter((c) => c.seg === 'wait').length;

  const actions = [
    { id: 'add', label: 'إضافة قطعة', icon: PackagePlus, variant: 'primary', onClick: () => openAddProduct(), tour: 'admin-quick-add' },
    { id: 'sale', label: 'تسجيل بيعة', icon: Receipt, onClick: () => setIsRecordSaleOpen(true) },
    { id: 'offer', label: 'عرض جديد', icon: Tag, onClick: () => setIsAddOfferOpen(true) },
    { id: 'deal', label: 'صفقة جديدة', icon: Layers, onClick: () => setIsAddDealOpen(true) },
  ];

  return (
    <section aria-label="ترحيب وإجراءات سريعة" className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-fg-muted">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="h-4 w-4 text-fg-subtle" aria-hidden="true" />
            {formatDayLong(new Date())}
          </span>
          <Badge tone={isOpenNow ? 'emerald' : 'neutral'} icon={isOpenNow ? Store : Moon} size="xs">
            {isOpenNow ? 'المحل فاتح دلوقتي' : 'المحل قافل دلوقتي'}
          </Badge>
        </div>
        <h2 className="mt-2 font-heading text-2xl font-black text-fg sm:text-3xl">{hour < 12 ? 'صباح الخير يا حاج إبراهيم' : 'مساء الخير يا حاج إبراهيم'}</h2>
        <p className="mt-1 text-sm text-fg-muted">
          {unread ? (
            <>
              عندك <b className="num text-fg">{unread}</b> رسايل مستنية رد
            </>
          ) : (
            'كل الرسايل اترد عليها'
          )}
          {waiting ? (
            <>
              ، و<b className="num text-fg">{waiting}</b> عملاء مستنيين قطع.
            </>
          ) : (
            '.'
          )}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
        {actions.map((a) => {
          const Icon = a.icon;
          return (
            <Button key={a.id} variant={a.variant || 'secondary'} size="md" onClick={a.onClick} data-tour={a.tour} className="justify-start sm:justify-center">
              <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
              {a.label}
            </Button>
          );
        })}
      </div>
    </section>
  );
}

function Funnel() {
  const { formatPrice } = useApp();
  const reduce = useReducedMotion();
  const max = Math.log(FUNNEL[0].value);
  const min = Math.log(FUNNEL[FUNNEL.length - 1].value);
  const widthFor = (v) => 16 + (84 * (Math.log(v) - min)) / (max - min);
  const asks = FUNNEL[1].value;
  const sold = FUNNEL[FUNNEL.length - 1].value;
  const overall = (sold / asks) * 100;

  return (
    <section aria-labelledby="funnel-title" className="relative overflow-hidden rounded-card bg-ink p-5 text-white ring-1 ring-white/10 sm:p-6">
      <div aria-hidden="true" className="pointer-events-none absolute -left-24 -top-28 h-72 w-72 rounded-full bg-amber-500/15 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-32 right-10 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />

      <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-8">
        <div className="min-w-0">
          <p className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-300">
            <Flame className="h-4 w-4" aria-hidden="true" />
            من الريل للفلوس
          </p>
          <h2 id="funnel-title" className="mt-1 font-heading text-xl font-black sm:text-2xl">
            إزاي المشاهدات بتتحول لبيع
          </h2>
          <p className="mt-1 text-sm text-slate-300">آخر 30 يوم، من ريلز فيسبوك لحد الفاتورة. النسبة جنب كل خطوة يعني كام واحد كمّل.</p>

          <ol className="mt-5 space-y-3.5">
            {FUNNEL.map((s, i) => {
              const Icon = s.icon;
              const last = i === FUNNEL.length - 1;
              const width = widthFor(s.value);
              const rate = i > 0 ? (s.value / FUNNEL[i - 1].value) * 100 : null;
              return (
                <li key={s.id}>
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className={cn('flex min-w-0 items-center gap-2', last ? 'font-bold text-amber-300' : 'text-slate-200')}>
                      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                      <span className="truncate">{s.label}</span>
                    </span>
                    <span className="num font-heading font-black">{s.display || formatPrice(s.value)}</span>
                  </div>
                  <div className="mt-1.5 flex items-center gap-3">
                    <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-white/10">
                      <motion.div
                        className={cn('h-full rounded-full', last ? 'bg-amber-400' : 'bg-white/75')}
                        initial={{ width: reduce ? `${width}%` : 0 }}
                        whileInView={{ width: `${width}%` }}
                        viewport={{ once: true, margin: '-40px' }}
                        transition={{ duration: 0.9, delay: 0.08 * i, ease: [0.16, 1, 0.3, 1] }}
                      />
                    </div>
                    <span className="num w-12 shrink-0 text-left text-[11px] font-bold text-slate-400" aria-label={rate != null ? `${rateLabel(rate)}% كمّلوا` : undefined}>
                      {rate != null ? `${rateLabel(rate)}%` : ''}
                    </span>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        <aside className="flex flex-col justify-between gap-5 rounded-2xl bg-white/[0.06] p-5 ring-1 ring-white/10">
          <div>
            <p className="text-xs font-bold text-slate-300">النتيجة في الآخر</p>
            <p className="mt-1 font-heading text-4xl font-black text-amber-400">
              <span className="num">{sold}</span> <span className="text-base text-white">بيعة</span>
            </p>
            <p className="num mt-1 text-sm text-slate-300">بقيمة {formatPrice(FUNNEL_REVENUE)} ج</p>
            <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-xs font-bold">
              <TrendingUp className="h-3.5 w-3.5 text-amber-300" aria-hidden="true" />
              <span className="num">{rateLabel(overall)}%</span> من اللي سألوا اشتروا
            </p>
          </div>
          <p className="flex gap-2 border-t border-white/10 pt-4 text-xs leading-relaxed text-slate-300">
            <Lightbulb className="h-4 w-4 shrink-0 text-amber-300" aria-hidden="true" />
            من غير الموقع، أغلب اللي بيسألوا "بكام؟" في التعليقات بيضيعوا. دلوقتي كل واحد بيوصل للقطعة وسعرها ويحجز في ثانية.
          </p>
        </aside>
      </div>
    </section>
  );
}

function SalesChart({ className }) {
  const { invoices, formatPrice } = useApp();
  const c = useChartColors();
  const reduce = useReducedMotion();
  const [range, setRange] = useState('7d');

  const todayInvoices = invoices.filter((i) => i.d === 'اليوم');
  const todaySales = sum(todayInvoices, (i) => i.price);
  const todayProfit = sum(todayInvoices, (i) => (i.price || 0) - (i.cost || 0));

  const days = useMemo(() => {
    const now = new Date();
    return DAILY.map((d, i) => {
      const date = new Date(now);
      date.setDate(now.getDate() - (DAILY.length - 1 - i));
      const isToday = i === DAILY.length - 1;
      return {
        label: isToday ? 'النهارده' : formatWeekday(date),
        full: isToday ? `النهارده، ${formatDayMonth(date)}` : formatDayLong(date),
        sales: d.sales + (isToday ? todaySales : 0),
        profit: d.profit + (isToday ? todayProfit : 0),
      };
    });
  }, [todaySales, todayProfit]);

  const weeks = useMemo(
    () => [
      ...EARLIER_WEEKS.map((w) => ({ ...w, full: w.label })),
      { label: 'الأسبوع ده', full: 'الأسبوع ده', sales: sum(days, (d) => d.sales), profit: sum(days, (d) => d.profit) },
    ],
    [days]
  );

  const data = range === '7d' ? days : weeks;
  const total = sum(data, (d) => d.sales);
  const profit = sum(data, (d) => d.profit);
  const delta = range === '7d' ? pctChange(total, EARLIER_WEEKS[2].sales) : pctChange(total, PREV_30_DAYS);
  const up = delta >= 0;

  return (
    <Panel
      className={className}
      title="حركة المبيعات"
      subtitle="المبيعات والربح، وفواتير النهارده محسوبة على طول"
      actions={
        <SegmentedControl
          layoutId="home-sales-range"
          ariaLabel="المدة"
          value={range}
          onChange={setRange}
          options={[
            { id: '7d', label: 'آخر 7 أيام' },
            { id: '30d', label: 'آخر 30 يوم' },
          ]}
        />
      }
    >
      <div className="flex flex-wrap items-end gap-x-6 gap-y-3">
        <div>
          <p className="text-xs font-bold text-fg-muted">المبيعات</p>
          <p className="font-heading text-2xl font-black text-fg sm:text-[28px]">
            <span className="num">{formatPrice(total)}</span> <span className="text-xs font-semibold text-fg-subtle">ج</span>
          </p>
        </div>
        <div>
          <p className="text-xs font-bold text-fg-muted">الربح</p>
          <p className="font-heading text-lg font-black text-fg">
            <span className="num">{formatPrice(profit)}</span> <span className="text-xs font-semibold text-fg-subtle">ج</span>
          </p>
        </div>
        <Badge tone={up ? 'emerald' : 'red'} icon={up ? TrendingUp : TrendingDown}>
          <span className="num">{Math.abs(delta)}%</span> {up ? 'زيادة' : 'أقل'} عن {range === '7d' ? 'الأسبوع اللي فات' : 'الشهر اللي فات'}
        </Badge>
        <ul className="flex items-center gap-4 text-xs font-bold text-fg-muted sm:ms-auto" aria-hidden="true">
          <li className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: c.blue }} />
            المبيعات
          </li>
          <li className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: c.amber }} />
            الربح
          </li>
        </ul>
      </div>

      <div className="mt-4 h-60 sm:h-72" dir="ltr">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 0, left: 4, bottom: 0 }}>
            <defs>
              <linearGradient id="home-sales-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={c.blue} stopOpacity={0.28} />
                <stop offset="100%" stopColor={c.blue} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="home-profit-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={c.amber} stopOpacity={0.3} />
                <stop offset="100%" stopColor={c.amber} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke={c.grid} strokeDasharray="3 3" />
            <XAxis
              dataKey="label"
              reversed
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              interval="preserveStartEnd"
              tick={{ fill: c.axis, fontSize: 11 }}
            />
            <YAxis
              orientation="right"
              tickLine={false}
              axisLine={false}
              width={40}
              tick={{ fill: c.axis, fontSize: 11 }}
              tickFormatter={(v) => `${Math.round(v / 1000)}k`}
            />
            <Tooltip
              cursor={{ stroke: c.axis, strokeDasharray: '4 4' }}
              content={<ChartTooltip labelFormatter={(label, payload) => payload?.[0]?.payload?.full || label} />}
            />
            <Area
              type="monotone"
              dataKey="sales"
              name="المبيعات"
              stroke={c.blue}
              strokeWidth={2.5}
              fill="url(#home-sales-fill)"
              activeDot={{ r: 5, strokeWidth: 2, stroke: c.surface }}
              isAnimationActive={!reduce}
            />
            <Area
              type="monotone"
              dataKey="profit"
              name="الربح"
              stroke={c.amber}
              strokeWidth={2}
              fill="url(#home-profit-fill)"
              activeDot={{ r: 4, strokeWidth: 2, stroke: c.surface }}
              isAnimationActive={!reduce}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  );
}

function ChannelDonut({ className }) {
  const { formatPrice } = useApp();
  const c = useChartColors();
  const reduce = useReducedMotion();
  const total = sum(CHANNEL_MIX, (d) => d.value);
  const data = CHANNEL_MIX.map((d) => ({ ...d, name: CHANNELS[d.id].label, fill: CHANNELS[d.id].color }));

  return (
    <Panel className={className} title="الرسايل جاية منين" subtitle="آخر 30 يوم">
      <div className="flex flex-col items-center gap-5 sm:flex-row xl:flex-col">
        <div className="relative h-44 w-44 shrink-0" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius="70%"
                outerRadius="100%"
                paddingAngle={3}
                cornerRadius={6}
                stroke={c.surface}
                strokeWidth={3}
                startAngle={90}
                endAngle={-270}
                isAnimationActive={!reduce}
              >
                {data.map((d) => (
                  <Cell key={d.id} fill={d.fill} />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip unit="محادثة" hideLabel />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="num font-heading text-2xl font-black text-fg">{formatPrice(total)}</span>
            <span className="text-[11px] font-bold text-fg-subtle">محادثة</span>
          </div>
        </div>
        <ul className="w-full space-y-3">
          {data.map((d) => {
            const share = Math.round((d.value / total) * 100);
            return (
              <li key={d.id}>
                <div className="flex items-center gap-2 text-sm">
                  <ChannelMark ch={d.id} size="xs" />
                  <span className="flex-1 font-semibold text-fg">{d.name}</span>
                  <span className="num text-xs text-fg-subtle">{formatPrice(d.value)}</span>
                  <span className="num w-10 text-left font-heading text-sm font-black text-fg">{share}%</span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-2">
                  <div className="h-full rounded-full" style={{ width: `${share}%`, backgroundColor: d.fill }} />
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </Panel>
  );
}

function WaitingList({ className }) {
  const { customers, setSelectedCustomer, openAddProduct, setAdminTab } = useApp();
  const waiting = customers.filter((c) => c.seg === 'wait');

  return (
    <Panel
      className={className}
      title={
        <span className="flex items-center gap-2">
          عملاء مستنيين قطع
          <Badge tone="purple" icon={Hourglass} size="xs">
            <span className="num">{waiting.length}</span>
          </Badge>
        </span>
      }
      subtitle="أول ما تنزّل القطعة، النظام هيقولك مين مستنيها ويبعتله"
      actions={
        <Button variant="ghost" size="sm" className="h-10" onClick={() => setAdminTab('crm')}>
          كل العملاء
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </Button>
      }
    >
      {waiting.length ? (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          {waiting.map((c) => (
            <li
              key={c.id}
              className="flex flex-col rounded-2xl border border-line bg-surface transition-[border-color,box-shadow] duration-200 hover:border-line-strong hover:shadow-soft-sm"
            >
              <button
                type="button"
                onClick={() => setSelectedCustomer(c)}
                className="flex flex-1 items-start gap-3 rounded-t-2xl p-3.5 text-right transition-transform duration-150 active:scale-[0.99]"
              >
                <Avatar name={c.name} label={c.avatar} />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5">
                    <span className="truncate font-heading text-sm font-black text-fg">{c.name}</span>
                    <ChannelMark ch={c.ch} size="xs" />
                  </span>
                  <span className="mt-0.5 flex items-center gap-1 text-xs text-fg-subtle">
                    <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
                    <span className="truncate">{c.gov}</span>
                  </span>
                  <span className="mt-2 line-clamp-2 block text-sm leading-snug text-fg-muted">{c.want}</span>
                </span>
              </button>
              <div className="flex items-center justify-between gap-2 border-t border-line px-3.5 py-2">
                <span className="truncate text-xs text-fg-subtle">آخر كلام: {c.last}</span>
                <Button variant="soft" size="sm" className="h-10 shrink-0" onClick={() => openAddProduct(prefillFor(c))}>
                  <PackagePlus className="h-4 w-4" aria-hidden="true" />
                  نزّل القطعة
                </Button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          icon={UserRoundCheck}
          title="مفيش حد مستني قطعة"
          description="أول ما عميل يطلب قطعة مش موجودة، هيظهر هنا."
          className="py-8"
        />
      )}
    </Panel>
  );
}

function ActivityFeed({ className }) {
  const { activities } = useApp();
  const list = activities.slice(0, 6);
  return (
    <Panel className={className} title="آخر النشاط" subtitle="بيتحدث لحظة بلحظة">
      {list.length ? (
        <ol className="relative space-y-4 before:absolute before:bottom-3 before:right-[17px] before:top-3 before:w-px before:bg-line">
          {list.map((a) => (
            <li key={a.id} className="relative flex gap-3">
              <ActivityIcon activity={a} className="relative ring-4 ring-surface" />
              <div className="min-w-0 flex-1 pt-0.5">
                <p className="text-sm font-semibold leading-snug text-fg">{a.title}</p>
                <p className="mt-0.5 flex items-center gap-1.5 text-xs text-fg-subtle">
                  {isFresh(a) ? (
                    <span className="relative flex h-2 w-2" aria-hidden="true">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                    </span>
                  ) : null}
                  {a.time} · {a.branch}
                </p>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <EmptyState icon={Package} title="لسه مفيش نشاط" className="py-8" />
      )}
    </Panel>
  );
}

export default function AdminHome() {
  const { products, invoices, conversations, customers, baseFinancials, formatPrice, setAdminTab } = useApp();

  const available = products.filter((p) => p.status === 'avail').length;
  const held = products.filter((p) => p.status === 'held').length;
  const unread = conversations.filter((c) => c.unread).length;
  const waiting = customers.filter((c) => c.seg === 'wait').length;
  const monthSales = baseFinancials.sales.all + sum(invoices, (i) => i.price);
  const salesSpark = DAILY.map((d) => d.sales);

  return (
    <div className="space-y-5 lg:space-y-6">
      <Greeting />

      <div data-tour="admin-kpis" className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <KpiCard
          label="قطع متاحة دلوقتي"
          value={available}
          suffix="قطعة"
          icon={Package}
          tone="blue"
          deltaLabel={held ? `و${held} محجوزة` : 'كله معروض على الموقع'}
          spark={[5, 6, 6, 7, 6, 7, available]}
          onClick={() => setAdminTab('products')}
        />
        <KpiCard
          label="مبيعات الشهر"
          value={monthSales}
          format={(n) => formatPrice(Math.round(n))}
          suffix="ج"
          icon={Receipt}
          tone="emerald"
          delta={12}
          deltaLabel="عن الشهر اللي فات"
          spark={salesSpark}
          onClick={() => setAdminTab('erp')}
        />
        <KpiCard
          label="رسايل مستنية رد"
          value={unread}
          suffix="رسالة"
          icon={MessageSquare}
          tone="amber"
          deltaLabel={unread ? 'رد عليهم قبل ما يروحوا لغيرك' : 'كله اترد عليه'}
          spark={[2, 4, 3, 5, 4, 6, unread]}
          onClick={() => setAdminTab('inbox')}
        />
        <KpiCard
          label="عملاء مستنيين قطع"
          value={waiting}
          suffix="عميل"
          icon={Hourglass}
          tone="purple"
          deltaLabel="جاهزين يشتروا أول ما تنزل"
          spark={[1, 2, 2, 3, 2, 3, waiting]}
          onClick={() => setAdminTab('crm')}
        />
      </div>

      <Funnel />

      <div className="grid gap-5 xl:grid-cols-12 xl:gap-6">
        <SalesChart className="xl:col-span-8" />
        <ChannelDonut className="xl:col-span-4" />
      </div>

      <div className="grid gap-5 xl:grid-cols-12 xl:gap-6">
        <WaitingList className="xl:col-span-7" />
        <ActivityFeed className="xl:col-span-5" />
      </div>
    </div>
  );
}

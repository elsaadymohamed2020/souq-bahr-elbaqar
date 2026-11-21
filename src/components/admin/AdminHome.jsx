import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  MessageSquare,
  Bell,
  Coins,
  Package,
  Bot,
  ArrowUpRight,
  ArrowDownLeft,
  RotateCcw,
  Sparkles,
  Users,
  Eye,
  CheckCircle2,
  Clock,
  Flame,
  Plus,
  Receipt,
  Tag,
  Share2,
  Calendar,
  Filter,
} from 'lucide-react';

// 7-day detailed business metrics
const WEEKLY_TREND = [
  { day: 'السبت', date: '15 نوفمبر', sales: 24500, profit: 7800, orders: 4, visitors: 110 },
  { day: 'الأحد', date: '16 نوفمبر', sales: 32000, profit: 9900, orders: 6, visitors: 145 },
  { day: 'الاثنين', date: '17 نوفمبر', sales: 18500, profit: 5400, orders: 3, visitors: 95 },
  { day: 'الثلاثاء', date: '18 نوفمبر', sales: 41000, profit: 13200, orders: 7, visitors: 190 },
  { day: 'الأربعاء', date: '19 نوفمبر', sales: 29000, profit: 8700, orders: 5, visitors: 130 },
  { day: 'الخميس', date: '20 نوفمبر', sales: 48500, profit: 16100, orders: 9, visitors: 260 },
  { day: 'الجمعة', date: '21 نوفمبر', sales: 36000, profit: 11500, orders: 6, visitors: 210 },
];

// 30-day aggregated periods
const MONTHLY_TREND = [
  { period: 'الأسبوع 1', sales: 138000, profit: 42000, orders: 24 },
  { period: 'الأسبوع 2', sales: 154000, profit: 48500, orders: 28 },
  { period: 'الأسبوع 3', sales: 172000, profit: 54000, orders: 31 },
  { period: 'الأسبوع 4', sales: 164000, profit: 51200, orders: 29 },
];

// Sales breakdown by product category
const CATEGORY_DATA = [
  { name: 'أجهزة منزلية', value: 340000, count: 28, color: '#1F6FEB' },
  { name: 'معدات صناعية ومواتير', value: 215000, count: 14, color: '#F59E0B' },
  { name: 'موبيليا وأبواب خشب', value: 76000, count: 19, color: '#10B981' },
];

// Channel source breakdown
const CHANNEL_DATA = [
  { name: 'واتساب', share: 46, chats: 580, color: '#10B981' },
  { name: 'تعليقات فيسبوك', share: 31, chats: 390, color: '#1877F2' },
  { name: 'ماسنجر', share: 17, chats: 215, color: '#0084FF' },
  { name: 'إنستجرام', share: 6, chats: 75, color: '#E1306C' },
];

// Hourly interaction peak (when reel viewers comment)
const HOURLY_TRAFFIC = [
  { hour: '9 ص', inquiries: 12 },
  { hour: '12 ظ', inquiries: 28 },
  { hour: '3 ع', inquiries: 34 },
  { hour: '6 م', inquiries: 45 },
  { hour: '8 م (ذروة)', inquiries: 82 },
  { hour: '10 م (ذروة)', inquiries: 94 },
  { hour: '12 ص', inquiries: 41 },
];

// Most in-demand items on the waiting list
const WAITING_DEMAND_ITEMS = [
  { name: 'مواتير مياه 10 و 12 حصان Siemens', count: 8, avgBudget: '9,000 - 14,000 ج', badge: 'طلب عالي جداً' },
  { name: 'ديب فريزر 6 و 7 درج نوفروست', count: 6, avgBudget: '11,000 - 15,000 ج', badge: 'نادر في المعرض' },
  { name: 'غسالات فوق أوتوماتيك 10-12 ك', count: 5, avgBudget: '9,000 - 12,000 ج', badge: 'سريع البيع' },
  { name: 'مكن لحام ألماني إنفرتر 250A', count: 4, avgBudget: '16,000 - 20,000 ج', badge: 'مستورد' },
];

// Custom Tooltip for Recharts
const CustomAreaTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-ink/95 text-white p-3.5 rounded-2xl shadow-xl border border-slate-700 text-right backdrop-blur-md min-w-[170px]">
        <p className="font-heading font-black text-xs text-amber-400 mb-2 border-b border-slate-700/80 pb-1">
          {label}
        </p>
        <div className="space-y-1.5 text-xs">
          {payload.map((entry, index) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                {entry.name}:
              </span>
              <span className="font-heading font-bold text-white">
                {Number(entry.value).toLocaleString('en-US')} ج
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export default function AdminHome() {
  const {
    conversations,
    products,
    invoices,
    activities,
    baseFinancials,
    formatPrice,
    resetDemo,
    setAdminTab,
    setIsAddProductOpen,
    setIsRecordSaleOpen,
    setIsAddOfferOpen,
    showToast,
  } = useApp();

  const [trendRange, setTrendRange] = useState('7d'); // '7d' | '30d'
  const [metricView, setMetricView] = useState('revenue'); // 'revenue' | 'profit'

  // Dynamic calculations
  const unreadCount = conversations.filter((c) => c.unread).length;
  const availableCount = products.filter((p) => p.status === 'avail').length;
  const totalMonthlySales =
    baseFinancials.sales.all + invoices.reduce((acc, inv) => acc + (inv.price || 0), 0);
  const totalMonthlyProfit =
    baseFinancials.profit.all + invoices.reduce((acc, inv) => acc + ((inv.price || 0) - (inv.cost || 0)), 0);

  const activeTrendData = trendRange === '7d' ? WEEKLY_TREND : MONTHLY_TREND;
  const activeXKey = trendRange === '7d' ? 'day' : 'period';

  return (
    <div className="space-y-6">
      
      {/* 1. TOP HEADER & QUICK ACTION BAR */}
      <div className="bg-white rounded-3xl p-6 shadow-soft border border-slate-200/80 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>لوحة المؤشرات والتحليلات المتطورة</span>
          </div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl text-ink tracking-tight">
            لوحة قيادة أعمال سوق بحر البقر
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            متابعة فورية للمبيعات، الأرباح، تحويلات ريلز فيسبوك، وحالة المخزن بين فرعي بحر البقر والصالحية.
          </p>
        </div>

        {/* Quick Actions Hub */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsAddProductOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-ink font-heading font-bold text-xs shadow-sm transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>منتج جديد</span>
          </button>

          <button
            onClick={() => setIsRecordSaleOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-heading font-bold text-xs shadow-sm transition-all active:scale-95"
          >
            <Receipt className="w-4 h-4" />
            <span>تسجيل بيعة</span>
          </button>

          <button
            onClick={() => setIsAddOfferOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-ink hover:bg-slate-800 text-white font-heading font-bold text-xs shadow-sm transition-all active:scale-95"
          >
            <Tag className="w-4 h-4 text-amber-400" />
            <span>عرض جديد</span>
          </button>

          <button
            onClick={resetDemo}
            title="استرجاع البيانات الأصلية للديمو"
            className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. TOP METRIC CARDS (4 KPIs with live indicators) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Monthly Revenue */}
        <div className="bg-white p-5 rounded-3xl shadow-soft border border-slate-200/80 hover:border-slate-300 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">إجمالي المبيعات (الشهر)</span>
            <span className="p-2 rounded-2xl bg-blue-50 text-brand-blue">
              <Coins className="w-4 h-4" />
            </span>
          </div>
          <div className="my-3">
            <div className="flex items-baseline gap-1">
              <span className="font-heading font-black text-2xl sm:text-3xl text-ink">
                {formatPrice(totalMonthlySales)}
              </span>
              <span className="text-xs font-semibold text-slate-500">جنيه</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+14.8% عن الشهر الماضي</span>
          </div>
        </div>

        {/* Net Profit */}
        <div className="bg-white p-5 rounded-3xl shadow-soft border border-slate-200/80 hover:border-slate-300 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">صافي الأرباح</span>
            <span className="p-2 rounded-2xl bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="my-3">
            <div className="flex items-baseline gap-1">
              <span className="font-heading font-black text-2xl sm:text-3xl text-emerald-700">
                {formatPrice(totalMonthlyProfit)}
              </span>
              <span className="text-xs font-semibold text-emerald-600">جنيه</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
            <span>هامش ربح قياسي {Math.round((totalMonthlyProfit / totalMonthlySales) * 100)}%</span>
          </div>
        </div>

        {/* Unread & Inquiries */}
        <div
          onClick={() => setAdminTab('inbox')}
          className="bg-white p-5 rounded-3xl shadow-soft border border-slate-200/80 hover:border-amber-400 cursor-pointer transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">رسايل واستفسارات معلقة</span>
            <span className="p-2 rounded-2xl bg-amber-50 text-amber-600">
              <MessageSquare className="w-4 h-4" />
            </span>
          </div>
          <div className="my-3">
            <div className="flex items-baseline gap-2">
              <span className="font-heading font-black text-2xl sm:text-3xl text-ink">
                {unreadCount}
              </span>
              <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                تحتاج رداً
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <span>من واتساب وماسنجر وفيسبوك</span>
          </div>
        </div>

        {/* Available Products */}
        <div
          onClick={() => setAdminTab('products')}
          className="bg-white p-5 rounded-3xl shadow-soft border border-slate-200/80 hover:border-indigo-400 cursor-pointer transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">القطع المعروضة الآن</span>
            <span className="p-2 rounded-2xl bg-indigo-50 text-indigo-600">
              <Package className="w-4 h-4" />
            </span>
          </div>
          <div className="my-3">
            <div className="flex items-baseline gap-1">
              <span className="font-heading font-black text-2xl sm:text-3xl text-ink">
                {availableCount}
              </span>
              <span className="text-xs font-semibold text-slate-500">قطعة</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-indigo-600 font-bold">
            <span>جاهزة للحجز المباشر بالمعارض</span>
          </div>
        </div>

      </div>

      {/* 3. BUSINESS FUNNEL: FROM REELS TO CASH (قصة نجاح حقيقية للعميل) */}
      <div className="bg-gradient-to-br from-ink via-ink-800 to-slate-900 rounded-3xl p-6 sm:p-7 text-white shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-blue/15 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20 mb-1">
                <Flame className="w-3.5 h-3.5" />
                <span>مسار تحويل مشاهدات الريلز إلى صفقات بيع (Conversion Funnel)</span>
              </div>
              <h3 className="font-heading font-black text-xl sm:text-2xl text-white">
                كيف يحوّل النظام مشاهدات ريلز فيسبوك إلى فلوس في جيبك؟
              </h3>
            </div>
            <span className="text-xs text-slate-300 font-mono bg-white/10 px-3 py-1.5 rounded-xl border border-white/15">
              نسبة التحويل الكلية: 2.7%
            </span>
          </div>

          {/* 5 Funnel Stages */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 space-y-1">
              <span className="text-[11px] text-slate-300 font-medium block">1. مشاهدات الريلز</span>
              <span className="font-heading font-black text-xl sm:text-2xl text-white block">294K</span>
              <span className="text-[10px] text-amber-300">أعلى ريل فيسبوك</span>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 space-y-1">
              <span className="text-[11px] text-slate-300 font-medium block">2. أسئلة وتعليقات</span>
              <span className="font-heading font-black text-xl sm:text-2xl text-white block">1,420</span>
              <span className="text-[10px] text-emerald-300">«فين؟» و«بكام؟»</span>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 space-y-1">
              <span className="text-[11px] text-slate-300 font-medium block">3. زوار موقع المعروض</span>
              <span className="font-heading font-black text-xl sm:text-2xl text-white block">840</span>
              <span className="text-[10px] text-sky-300">تصفحوا الكتالوج</span>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 space-y-1">
              <span className="text-[11px] text-slate-300 font-medium block">4. نقرات حجز واتساب</span>
              <span className="font-heading font-black text-xl sm:text-2xl text-white block">142</span>
              <span className="text-[10px] text-emerald-300">حجزوا كود محدد</span>
            </div>

            <div className="col-span-2 md:col-span-1 bg-amber-500 text-ink rounded-2xl p-4 shadow-lg space-y-1">
              <span className="text-[11px] font-bold block">5. صفقات بيع مكتملة</span>
              <span className="font-heading font-black text-xl sm:text-2xl block">38 بيعة</span>
              <span className="text-[10px] font-black">بقيمة 360,000 ج</span>
            </div>

          </div>

          <p className="text-xs text-slate-300 leading-relaxed pt-1 border-t border-white/10">
            💡 <b>بدون هذا الموقع:</b> أكثر من 90% من سائلي التعليقات يضيعون لأن الصفحة لا تستطيع الرد عليهم يدوياً في الحال. <b>مع النظام:</b> يتم توجيه كل سائل مباشرة إلى القطعة وسعرها وحجزها في ثانية.
          </p>
        </div>
      </div>

      {/* 4. MAIN CHARTS SECTION: SALES & REVENUE (Interactive Recharts Area Chart) */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-soft border border-slate-200/80 space-y-6">
        
        {/* Chart Header & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="font-heading font-black text-xl text-ink">
              حركة المبيعات وصافي الأرباح التقديرية
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              رسم بياني تفاعلي يوضح تدرج المبيعات مقارنة بصافي أرباح الصفقات
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {/* 7d vs 30d toggle */}
            <div className="flex items-center bg-slate-100 p-1 rounded-2xl text-xs font-bold">
              <button
                onClick={() => setTrendRange('7d')}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  trendRange === '7d' ? 'bg-white text-ink shadow-sm' : 'text-slate-500'
                }`}
              >
                آخر 7 أيام
              </button>
              <button
                onClick={() => setTrendRange('30d')}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  trendRange === '30d' ? 'bg-white text-ink shadow-sm' : 'text-slate-500'
                }`}
              >
                آخر شهر
              </button>
            </div>
          </div>
        </div>

        {/* Recharts Area Chart */}
        <div className="h-72 w-full pt-2" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={activeTrendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1F6FEB" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#1F6FEB" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis
                dataKey={activeXKey}
                stroke="#94A3B8"
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: '#E2E8F0' }}
              />
              <YAxis
                stroke="#94A3B8"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `${val / 1000}k`}
              />
              <Tooltip content={<CustomAreaTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{ paddingBottom: '20px', fontSize: '13px', fontFamily: 'Cairo' }}
                formatter={(value) => (value === 'sales' ? 'إجمالي المبيعات' : 'صافي الأرباح')}
              />

              <Area
                type="monotone"
                dataKey="sales"
                name="sales"
                stroke="#1F6FEB"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorSales)"
              />
              <Area
                type="monotone"
                dataKey="profit"
                name="profit"
                stroke="#F59E0B"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorProfit)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

      </div>

      {/* 5. TWO COLUMN ANALYTICS: CATEGORY DONUT + HOURLY PEAK */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Category Sales Donut Chart */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-7 shadow-soft border border-slate-200/80 flex flex-col justify-between">
          <div>
            <h3 className="font-heading font-black text-lg text-ink">
              توزيع المبيعات حسب قسم المعروض
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              نسبة مساهمة كل قسم في إجمالي إيرادات السوق
            </p>
          </div>

          <div className="h-60 w-full relative flex items-center justify-center my-4" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={CATEGORY_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {CATEGORY_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [`${Number(value).toLocaleString('en-US')} ج`, name]}
                  contentStyle={{
                    backgroundColor: '#0B152B',
                    borderRadius: '16px',
                    color: '#fff',
                    border: 'none',
                    textAlign: 'right',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Donut Center Metric */}
            <div className="absolute text-center pointer-events-none">
              <span className="text-[11px] font-bold text-slate-400 block">إجمالي المعروض</span>
              <span className="font-heading font-black text-xl text-ink">631K ج</span>
            </div>
          </div>

          {/* Legend Items */}
          <div className="space-y-2 pt-3 border-t border-slate-100">
            {CATEGORY_DATA.map((cat) => (
              <div key={cat.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 font-medium text-slate-700">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                  {cat.name} ({cat.count} قطعة)
                </span>
                <span className="font-heading font-bold text-ink">
                  {formatPrice(cat.value)} ج
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Hourly Peak & Reel Viewers Traffic (Bar Chart) */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-7 shadow-soft border border-slate-200/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-black text-lg text-ink">
                ساعات ذروة الاستفسارات (يومياً)
              </h3>
              <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-lg border border-purple-200">
                الذروة 8م - 11م
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              توقيت كتابة التعليقات على ريلز فيسبوك وإرسال رسايل واتساب
            </p>
          </div>

          <div className="h-60 w-full pt-4" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={HOURLY_TRAFFIC} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="hour" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  formatter={(val) => [`${val} استفسار`, 'حجم الرسايل']}
                  contentStyle={{
                    backgroundColor: '#0B152B',
                    borderRadius: '14px',
                    color: '#fff',
                    border: 'none',
                    textAlign: 'right',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="inquiries" fill="#8B5CF6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="p-3 bg-purple-50 rounded-2xl border border-purple-200/80 text-xs text-purple-950 flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-600 shrink-0" />
            <span>
              نشر ريلز الصفحة بين الساعة 7 مساءً و 9 مساءً يضاعف استفسارات الشراء بنسبة 300%.
            </span>
          </div>
        </div>

      </div>

      {/* 6. WAITING LIST & IN-DEMAND ITEMS (قائمة الانتظار لأكثر القطع طلباً) */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-soft border border-slate-200/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-heading font-black text-lg text-ink">
                أكثر القطع المطلوبة في «قائمة الانتظار»
              </h3>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                فرص مبيعات مؤكدة
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              عملاء طلبوا هذه الأجهزة بالاسم وينتظرون توفرها في المعرض للشراء فوراً
            </p>
          </div>

          <button
            onClick={() => showToast('تم إرسال برودكاست للعملاء في قائمة الانتظار!')}
            className="self-start sm:self-auto flex items-center gap-1.5 px-4 py-2 rounded-xl bg-ink hover:bg-slate-800 text-white font-heading font-bold text-xs transition-all active:scale-95"
          >
            <Bell className="w-3.5 h-3.5 text-amber-400" />
            <span>إشعار المسجلين عند توفر دفعة</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {WAITING_DEMAND_ITEMS.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100/70 border border-slate-200/80 transition-all space-y-2 flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md inline-block">
                  {item.badge}
                </span>
                <h4 className="font-heading font-bold text-sm text-ink leading-snug">
                  {item.name}
                </h4>
              </div>

              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">
                  مستني: <b className="text-ink">{item.count} عملاء</b>
                </span>
                <span className="font-bold text-emerald-600 font-mono text-[11px]">
                  {item.avgBudget}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 7. RECENT LIVE ACTIVITY & SYSTEM LOGS */}
      <div className="bg-white rounded-3xl p-6 shadow-soft border border-slate-200/80 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-black text-lg text-ink">
            سجل العمليات المباشرة بالمعرض والنظام
          </h3>
          <span className="text-xs text-slate-400 font-medium">محدث لحظياً</span>
        </div>

        <div className="divide-y divide-slate-100">
          {activities.slice(0, 5).map((act) => (
            <div key={act.id} className="py-3.5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
                <span className="text-xs sm:text-sm font-semibold text-slate-800">{act.title}</span>
              </div>
              <div className="text-xs text-slate-400 font-medium shrink-0">
                {act.time} · {act.branch}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

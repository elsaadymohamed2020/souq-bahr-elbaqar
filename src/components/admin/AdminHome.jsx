import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  TrendingUp,
  MessageSquare,
  Bell,
  Coins,
  Package,
  Bot,
  ArrowUpRight,
  ExternalLink,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { SALES_CHART_DATA } from '../../data/initialData';

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
  } = useApp();

  const [activeTooltip, setActiveTooltip] = useState(null);

  // Unread messages count
  const unreadCount = conversations.filter((c) => c.unread).length;
  const availableCount = products.filter((p) => p.status === 'avail').length;

  // Monthly revenue calculation
  const totalMonthlySales =
    baseFinancials.sales.all + invoices.reduce((acc, inv) => acc + (inv.price || 0), 0);

  // Channels distribution
  const channels = [
    { id: 'wa', name: 'واتساب', pct: 46, color: 'bg-emerald-500', text: 'text-emerald-700' },
    { id: 'fb', name: 'تعليقات فيسبوك', pct: 31, color: 'bg-blue-600', text: 'text-blue-700' },
    { id: 'ms', name: 'ماسنجر', pct: 17, color: 'bg-sky-500', text: 'text-sky-700' },
    { id: 'ig', name: 'إنستجرام', pct: 6, color: 'bg-pink-500', text: 'text-pink-700' },
  ];

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-soft border border-slate-200/80">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 mb-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>لوحة المؤشرات الذكية</span>
          </div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl text-ink tracking-tight">
            أهلاً بحضرتك يا حاج
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            ده ملخص حركة اليوم: الزوار، الحجوزات، المبيعات والردود التلقائية عبر كل المنصات.
          </p>
        </div>

        <button
          onClick={resetDemo}
          className="self-start sm:self-auto flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-slate-500 hover:text-ink bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>استرجاع بيانات الديمو</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Unread Messages */}
        <div 
          onClick={() => setAdminTab('inbox')}
          className="bg-white p-5 rounded-3xl shadow-soft border border-slate-200/80 hover:border-blue-400 cursor-pointer transition-all space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">رسايل مستنية رد</span>
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <MessageSquare className="w-4 h-4" />
            </span>
          </div>
          <div>
            <span className="font-heading font-black text-2xl sm:text-3xl text-ink block">
              {unreadCount}
            </span>
            <span className="text-[11px] text-slate-400 font-medium">من كل المنصات</span>
          </div>
        </div>

        {/* Reservations Today */}
        <div 
          onClick={() => setAdminTab('crm')}
          className="bg-white p-5 rounded-3xl shadow-soft border border-slate-200/80 hover:border-amber-400 cursor-pointer transition-all space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">حجوزات واستفسارات</span>
            <span className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Bell className="w-4 h-4" />
            </span>
          </div>
          <div>
            <span className="font-heading font-black text-2xl sm:text-3xl text-ink block">
              {12 + invoices.length}
            </span>
            <span className="text-[11px] text-emerald-600 font-bold">3 منهم من زرار الموقع</span>
          </div>
        </div>

        {/* Monthly Sales */}
        <div 
          onClick={() => setAdminTab('erp')}
          className="bg-white p-5 rounded-3xl shadow-soft border border-slate-200/80 hover:border-emerald-400 cursor-pointer transition-all space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">مبيعات الشهر</span>
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Coins className="w-4 h-4" />
            </span>
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="font-heading font-black text-2xl sm:text-3xl text-ink">
                {formatPrice(totalMonthlySales)}
              </span>
              <span className="text-xs text-slate-500 font-bold">ج</span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">لكل الفروع حتى الآن</span>
          </div>
        </div>

        {/* Available Items */}
        <div 
          onClick={() => setAdminTab('products')}
          className="bg-white p-5 rounded-3xl shadow-soft border border-slate-200/80 hover:border-indigo-400 cursor-pointer transition-all space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">قطع متاحة للبيع</span>
            <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Package className="w-4 h-4" />
            </span>
          </div>
          <div>
            <span className="font-heading font-black text-2xl sm:text-3xl text-ink block">
              {availableCount}
            </span>
            <span className="text-[11px] text-slate-400 font-medium">معروضة للزبائن الآن</span>
          </div>
        </div>

      </div>

      {/* Auto Reply AI highlight card */}
      <div className="bg-gradient-to-br from-ink via-ink-800 to-slate-900 rounded-3xl p-6 text-white shadow-lg border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
              <Bot className="w-4 h-4" />
              <span>المساعد التلقائي الذكي (Facebook & WhatsApp Auto-Bot)</span>
            </div>
            <h3 className="font-heading font-black text-xl sm:text-2xl text-white">
              النهارده رد تلقائياً على <span className="text-amber-400">64 تعليق ورسالة</span> من غير ما حد يمسك الموبايل!
            </h3>
            <p className="text-xs sm:text-sm text-slate-300">
              النظام يفرز أسئلة «المكان فين؟» و«بكام؟» و«فيه شحن؟» ويرد فوراً باللوكيشن والأسعار وروابط الحجز.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 shrink-0">
            <span className="px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-medium text-amber-200">
              📍 38 رد بالعنوان والخريطة
            </span>
            <span className="px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-medium text-emerald-200">
              💰 19 رد بالأسعار الرسمية
            </span>
            <span className="px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-medium text-sky-200">
              🚚 7 ردود بتكلفة الشحن
            </span>
          </div>
        </div>
      </div>

      {/* Two Column Section: Chart + Channels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Sales Chart */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl shadow-soft border border-slate-200/80 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-heading font-bold text-lg text-ink">حركة المبيعات (آخر 7 أيام)</h3>
              <p className="text-xs text-slate-400">بالألف جنيه عبر كافة الفروع</p>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              +14% هذا الأسبوع
            </span>
          </div>

          {/* SVG Bar Chart with Hover Tooltip */}
          <div className="relative pt-6 pb-2">
            <div className="h-44 flex items-end justify-between gap-3 px-2 border-b border-slate-100">
              {SALES_CHART_DATA.map((item, idx) => {
                const heightPct = (item.val / 40) * 100;
                return (
                  <div
                    key={item.day}
                    onMouseEnter={() => setActiveTooltip(item)}
                    onMouseLeave={() => setActiveTooltip(null)}
                    className="flex-1 flex flex-col items-center gap-2 group relative cursor-pointer"
                  >
                    {/* Bar */}
                    <div className="w-full max-w-[34px] bg-slate-100 rounded-t-xl overflow-hidden h-36 flex items-end">
                      <div
                        style={{ height: `${heightPct}%` }}
                        className={`w-full rounded-t-xl transition-all duration-300 ${
                          idx === SALES_CHART_DATA.length - 1
                            ? 'bg-amber-500 group-hover:bg-amber-400'
                            : 'bg-ink group-hover:bg-brand-blue'
                        }`}
                      />
                    </div>

                    {/* Day label */}
                    <span className="text-[11px] font-bold text-slate-500 group-hover:text-ink transition-colors">
                      {item.day}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Hover Tooltip */}
            {activeTooltip && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-ink text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-lg border border-slate-700 animate-in fade-in zoom-in-95">
                {activeTooltip.day} ({activeTooltip.date}): {activeTooltip.val * 1000} جنيه
              </div>
            )}
          </div>
        </div>

        {/* Channels Breakdown */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl shadow-soft border border-slate-200/80 flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="font-heading font-bold text-lg text-ink">الرسايل جاية منين؟</h3>
            <p className="text-xs text-slate-400">توزيع قنوات التواصل واستفسارات الزبائن</p>
          </div>

          <div className="space-y-4">
            {channels.map((ch) => (
              <div key={ch.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-700">{ch.name}</span>
                  <span className={ch.text}>{ch.pct}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${ch.pct}%` }}
                    className={`h-full ${ch.color} rounded-full transition-all duration-500`}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4 text-[11px] text-slate-400 text-center">
            واتساب وفيسبوك يمثلان 77% من إجمالي حركة الزبائن
          </div>
        </div>

      </div>

      {/* Recent Live Activities */}
      <div className="bg-white p-6 rounded-3xl shadow-soft border border-slate-200/80">
        <h3 className="font-heading font-bold text-lg text-ink mb-4">
          آخر ما تم في النظام
        </h3>

        <div className="divide-y divide-slate-100">
          {activities.slice(0, 5).map((act) => (
            <div key={act.id} className="py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                <span className="text-sm font-semibold text-slate-800">{act.title}</span>
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

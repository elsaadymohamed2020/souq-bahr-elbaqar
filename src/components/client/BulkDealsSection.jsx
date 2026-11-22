import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Layers,
  Scale,
  PackageCheck,
  MapPin,
  TrendingUp,
  MessageCircle,
  Eye,
  CreditCard,
  Sparkles,
  ArrowDownLeft,
  CheckCircle2,
  Clock,
  Building2,
  Tag,
} from 'lucide-react';

export default function BulkDealsSection() {
  const {
    deals,
    formatPrice,
    setSelectedDealForDetail,
    getWhatsAppDealLink,
    bookDealDeposit,
  } = useApp();

  const [activeFilter, setActiveFilter] = useState('all');

  const filteredDeals = deals.filter((deal) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'avail') return deal.status === 'avail';
    return deal.category === activeFilter;
  });

  const categories = [
    { id: 'all', label: 'كل الصفقات' },
    { id: 'avail', label: '🔥 المتاح حالياً للمعاينة' },
    { id: 'حديد ومعادن', label: 'حديد ومعادن ثقيلة' },
    { id: 'معدات ومواتير', label: 'معدات وخطوط إنتاج' },
    { id: 'تبريد وتجهيزات', label: 'تبريد وتجهيزات' },
  ];

  return (
    <section id="deals" className="py-16 sm:py-24 bg-gradient-to-b from-slate-900 via-ink to-slate-950 text-white relative overflow-hidden">
      
      {/* Background Decorative Glow */}
      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-brand-blue/15 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300 text-xs font-bold mb-3">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>حصري للمقاولين والتجار والمصانع والورش</span>
            </div>

            <h2 className="font-heading font-black text-3xl sm:text-5xl text-white tracking-tight">
              نظام الصفقات واللوطات الكبرى <br />
              <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 bg-clip-text text-transparent">
                (بيع شروة واحدة كـ Total)
              </span>
            </h2>

            <p className="text-slate-300 text-sm sm:text-base max-w-2xl mt-3 leading-relaxed">
              مش كل شغلنا بالقطعة! بنجيب صفقات تصفية مصانع وهياكل حديد ومعدات أوروبية بنعرضها شروة كاملة على بعضها كـ Total بأسعار لقطة لا تقبل المنافسة مع كشف تفصيلي بمحتويات كل بند.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-md shrink-0 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 font-heading font-black text-xl">
              {deals.length}
            </div>
            <div>
              <span className="text-xs text-slate-400 block font-semibold">صفقات ولوطات معروضة:</span>
              <span className="text-sm font-bold text-white">معاينة بالمخزن وميزان بسكول</span>
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveFilter(cat.id)}
              className={`px-4 py-2.5 rounded-xl font-heading font-bold text-xs sm:text-sm whitespace-nowrap transition-all ${
                activeFilter === cat.id
                  ? 'bg-amber-500 text-ink shadow-glow-amber'
                  : 'bg-white/10 hover:bg-white/15 text-slate-300 border border-white/10'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Deals Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filteredDeals.map((deal) => {
            const isAvail = deal.status === 'avail';
            const isHeld = deal.status === 'held';
            const isSold = deal.status === 'sold';
            const profit = deal.estimatedRetail ? deal.estimatedRetail - deal.totalPrice : 0;

            return (
              <article
                key={deal.code}
                className={`group bg-slate-900/90 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl hover:border-amber-500/50 transition-all duration-300 flex flex-col justify-between ${
                  isSold ? 'opacity-85' : ''
                }`}
              >
                {/* Visual Banner */}
                <div className="relative h-56 bg-slate-800 overflow-hidden">
                  <img
                    src={deal.img || '/images/products/motor.jpg'}
                    alt={deal.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />

                  {/* Gradient overlays */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
                  
                  {/* Status chip */}
                  <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md border shadow-sm">
                    {isAvail && (
                      <span className="bg-emerald-950/90 text-emerald-300 border-emerald-500/50 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        متاح للمعاينة والتفاوض
                      </span>
                    )}
                    {isHeld && (
                      <span className="bg-amber-950/90 text-amber-300 border-amber-500/50 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-400" />
                        جاري المعاينة لمشتري
                      </span>
                    )}
                    {isSold && (
                      <span className="bg-rose-950/90 text-rose-300 border-rose-500/50 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-rose-400" />
                        تم بيع الصفقة
                      </span>
                    )}
                  </div>

                  {/* Code & Badge */}
                  <div className="absolute top-4 left-4 flex items-center gap-2">
                    <span className="font-mono text-xs font-black text-white bg-black/70 px-2.5 py-1 rounded-lg backdrop-blur-md border border-white/20">
                      {deal.code}
                    </span>
                    {deal.badge && (
                      <span className="text-xs font-bold text-amber-950 bg-amber-400 px-2.5 py-1 rounded-lg shadow-sm">
                        {deal.badge}
                      </span>
                    )}
                  </div>

                  {/* Specs Strip */}
                  <div className="absolute bottom-3 inset-x-4 flex flex-wrap items-center gap-3 text-xs text-slate-300">
                    <span className="flex items-center gap-1 bg-black/60 px-2.5 py-1 rounded-md backdrop-blur-sm">
                      <Scale className="w-3.5 h-3.5 text-amber-400" />
                      {deal.weight}
                    </span>
                    <span className="flex items-center gap-1 bg-black/60 px-2.5 py-1 rounded-md backdrop-blur-sm">
                      <PackageCheck className="w-3.5 h-3.5 text-brand-blue" />
                      {deal.itemsCount}
                    </span>
                    <span className="flex items-center gap-1 bg-black/60 px-2.5 py-1 rounded-md backdrop-blur-sm">
                      <MapPin className="w-3.5 h-3.5 text-rose-400" />
                      فرع {deal.branch}
                    </span>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-6 space-y-5 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    
                    {/* Title */}
                    <h3 className="font-heading font-black text-xl text-white group-hover:text-amber-400 transition-colors leading-snug">
                      {deal.title}
                    </h3>

                    {/* Brief description */}
                    <p className="text-xs sm:text-sm text-slate-400 line-clamp-2 leading-relaxed">
                      {deal.desc}
                    </p>

                    {/* Preview of internal items */}
                    <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-bold text-amber-400">
                        <span className="flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5" />
                          <span>أبرز محتويات الشروة:</span>
                        </span>
                        <span className="text-[11px] text-slate-400 font-normal">
                          {deal.items?.length || 0} بنود
                        </span>
                      </div>

                      <ul className="text-xs text-slate-300 space-y-1 pr-1">
                        {deal.items && deal.items.slice(0, 3).map((it, idx) => (
                          <li key={idx} className="flex items-center justify-between gap-2">
                            <span className="truncate">• {it.name}</span>
                            <span className="text-amber-400/90 font-mono font-semibold shrink-0">
                              {it.qty}
                            </span>
                          </li>
                        ))}
                      </ul>

                      {deal.items && deal.items.length > 3 && (
                        <div className="text-[11px] font-bold text-slate-400 pt-1 text-left">
                          + {deal.items.length - 3} بنود أخرى داخل الكشف
                        </div>
                      )}
                    </div>

                  </div>

                  {/* Financial Total Box */}
                  <div className="pt-4 border-t border-slate-800 space-y-4">
                    <div className="flex items-baseline justify-between">
                      <div>
                        <span className="text-xs text-amber-400 font-semibold block">
                          السعر المطلوب للشروة بالكامل (Total):
                        </span>
                        <div className="flex items-baseline gap-2">
                          <span className={`font-heading font-black text-3xl sm:text-4xl ${isSold ? 'line-through text-slate-500' : 'text-white'}`}>
                            {formatPrice(deal.totalPrice)}
                          </span>
                          <span className="text-xs font-bold text-slate-400">جنيه مصري</span>
                        </div>
                      </div>

                      {profit > 0 && !isSold && (
                        <div className="text-left bg-emerald-950/60 border border-emerald-500/30 px-3 py-1.5 rounded-xl">
                          <span className="text-[10px] text-slate-400 block line-through">
                            قطاعي: {formatPrice(deal.estimatedRetail)} ج
                          </span>
                          <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            وفر {formatPrice(profit)} ج
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                      <button
                        onClick={() => setSelectedDealForDetail(deal)}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-heading font-bold text-xs sm:text-sm border border-white/15 transition-all"
                      >
                        <Eye className="w-4 h-4 text-amber-400" />
                        <span>كشف محتويات الصفقة</span>
                      </button>

                      {isAvail ? (
                        <a
                          href={getWhatsAppDealLink(deal, 'inspect')}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-heading font-bold text-xs sm:text-sm shadow-sm transition-all"
                        >
                          <MessageCircle className="w-4 h-4 text-emerald-200" />
                          <span>احجز معاينة بالمخزن</span>
                        </a>
                      ) : isHeld ? (
                        <div className="w-full py-3 rounded-2xl bg-amber-950/60 border border-amber-800 text-amber-300 font-bold text-xs text-center">
                          جاري المعاينة والتفاوض
                        </div>
                      ) : (
                        <div className="w-full py-3 rounded-2xl bg-slate-800 text-slate-500 font-bold text-xs text-center cursor-not-allowed">
                          تم بيع الصفقة
                        </div>
                      )}
                    </div>

                  </div>

                </div>
              </article>
            );
          })}
        </div>

      </div>
    </section>
  );
}

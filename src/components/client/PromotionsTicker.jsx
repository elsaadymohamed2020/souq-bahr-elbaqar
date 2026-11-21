import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Flame,
  Sparkles,
  MapPin,
  Truck,
  MessageCircle,
  Tag,
  Clock,
  ArrowLeft,
  ShieldCheck,
} from 'lucide-react';

export default function PromotionsTicker() {
  const { offers, products } = useApp();

  // Active offers
  const activeOffers = offers.filter((o) => o.active);
  const newProducts = products.filter((p) => p.isNew);

  const tickerItems = [
    ...(activeOffers.length > 0
      ? activeOffers.map((o) => ({
          type: 'offer',
          badge: '🔥 عرض خاص وحصري',
          badgeColor: 'bg-amber-500 text-ink',
          text: `${o.title || `خصم ${o.pct}%`} — ساري حتى ${o.ends} بالمعارض`,
          link: '#items',
        }))
      : [
          {
            type: 'offer',
            badge: '🔥 عروض الأسبوع',
            badgeColor: 'bg-amber-500 text-ink',
            text: 'خصومات مميزة على الأجهزة والمعدات الصناعية حتى نهاية الشهر',
            link: '#items',
          },
        ]),
    ...(newProducts.length > 0
      ? [
          {
            type: 'new',
            badge: '✨ وصل حديثاً للمخزن',
            badgeColor: 'bg-brand-blue text-white',
            text: `وصلت دفعة: ${newProducts.map((p) => p.name).slice(0, 2).join(' · ')}`,
            link: '#items',
          },
        ]
      : []),
    {
      type: 'location',
      badge: '📍 زيارة المعارض',
      badgeColor: 'bg-purple-600 text-white',
      text: 'المعاينة متاحة يومياً من 9 صباحاً حتى 5 مساءً بفرعي بحر البقر والصالحية الجديدة',
      link: '#branches',
    },
    {
      type: 'shipping',
      badge: '🚚 شحن ونقل مجهز',
      badgeColor: 'bg-emerald-600 text-white',
      text: 'شحن لجميع مراكز الشرقية والمحافظات (العاشر، الزقازيق، الإسماعيلية، القاهرة، بورسعيد)',
      link: '#items',
    },
    {
      type: 'wa',
      badge: '💬 حجز فوري',
      badgeColor: 'bg-emerald-500 text-white',
      text: 'احجز قطعتك بكود القطعة وسعرها مباشرة على واتساب الحجز: 01034052401',
      link: 'https://wa.me/201034052401',
    },
    {
      type: 'trust',
      badge: '🛡️ الأرقام الرسمية',
      badgeColor: 'bg-slate-700 text-white',
      text: 'احذر الحسابات المزيفة، تعاملاتنا الرسمية عبر الموقع وأرقامنا المعتمدة فقط',
      link: '#branches',
    },
  ];

  // Duplicate items array so the ticker creates an infinite seamless loop
  const duplicatedItems = [...tickerItems, ...tickerItems];

  return (
    <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-2">
      <div className="bg-gradient-to-r from-ink via-ink-800 to-slate-900 rounded-3xl p-3 sm:p-4 shadow-xl border border-slate-800 overflow-hidden relative group">
        
        {/* Ambient subtle glow */}
        <div className="absolute top-0 right-1/4 w-40 h-full bg-amber-500/10 blur-xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-40 h-full bg-brand-blue/10 blur-xl pointer-events-none" />

        <div className="flex items-center gap-3">
          
          {/* Static Lead Label */}
          <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-white/10 text-amber-400 font-heading font-black text-xs shrink-0 border border-white/15 backdrop-blur-md z-10 shadow-sm select-none">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
            </span>
            <span>شريط الأخبار والعروض</span>
          </div>

          {/* Marquee Ticker Track */}
          <div className="flex-1 overflow-hidden relative [mask-image:linear-gradient(to_right,transparent,black_40px,black_calc(100%-40px),transparent)]">
            <div className="animate-ticker flex items-center gap-8 py-0.5">
              {duplicatedItems.map((item, idx) => (
                <a
                  key={idx}
                  href={item.link}
                  className="flex items-center gap-2.5 text-xs text-slate-200 hover:text-white transition-colors shrink-0 group/item"
                >
                  <span
                    className={`font-heading font-bold text-[11px] px-2.5 py-0.5 rounded-full shadow-sm shrink-0 ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                  <span className="font-medium text-slate-300 group-hover/item:text-white transition-colors">
                    {item.text}
                  </span>
                  <span className="text-slate-600 mr-4 font-bold select-none">•</span>
                </a>
              ))}
            </div>
          </div>

          {/* Pause hint on hover */}
          <div className="hidden lg:block text-[10px] text-slate-400 font-medium shrink-0 z-10 px-2 opacity-60 group-hover:opacity-100 transition-opacity">
            (قف بالماوس للتثبيت)
          </div>

        </div>

      </div>
    </div>
  );
}

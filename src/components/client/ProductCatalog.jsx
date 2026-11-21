import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Refrigerator,
  WashingMachine,
  Flame,
  Tv,
  Zap,
  Gauge,
  Cpu,
  DoorClosed,
  Tag,
  MapPin,
  MessageCircle,
  Sparkles,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  HelpCircle,
} from 'lucide-react';

const ICON_MAP = {
  Refrigerator,
  WashingMachine,
  Flame,
  Tv,
  Zap,
  Gauge,
  Cpu,
  DoorClosed,
};

export default function ProductCatalog() {
  const {
    products,
    categories,
    offers,
    getOfferForProduct,
    getFinalPrice,
    formatPrice,
    getWhatsAppBookingLink,
  } = useApp();

  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAvailability, setFilterAvailability] = useState('all'); // 'all' | 'avail'

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesCat = activeCategory === 'all' || p.cat === activeCategory;
    const matchesSearch =
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.branch.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAvail = filterAvailability === 'all' || p.status === 'avail';
    return matchesCat && matchesSearch && matchesAvail;
  });

  // Active promotional banners & announcements
  const liveOffers = offers.filter((o) => o.active);
  const [activeSlide, setActiveSlide] = useState(0);

  const announcementSlides = [
    ...(liveOffers.length > 0
      ? liveOffers.map((o) => ({
          badge: `🔥 خصم ${o.pct}%`,
          badgeStyle: 'bg-amber-500 text-ink',
          title: o.title || `خصم ${o.pct}% ساري الآن على المعروض`,
          desc: `ساري حتى ${o.ends} · الخصم محسوب تلقائياً في الأسعار بالأسفل`,
          icon: Tag,
        }))
      : [
          {
            badge: '🔥 عروض مستمرة',
            badgeStyle: 'bg-amber-500 text-ink',
            title: 'خصومات مميزة على الأجهزة والمعدات الصناعية',
            desc: 'تخفيضات خاصة عند شراء أكثر من قطعة للمعرض أو الورش',
            icon: Tag,
          },
        ]),
    {
      badge: '✨ وصل حديثاً',
      badgeStyle: 'bg-brand-blue text-white',
      title: 'وصول دفعة مواتير Siemens 10 و12 حصان وتلاجات كريازي',
      desc: 'فحص شامل وبحالة الزيرو — المعاينة بفرع الصالحية وبحر البقر',
      icon: Sparkles,
    },
    {
      badge: '💬 حجز فوري',
      badgeStyle: 'bg-emerald-600 text-white',
      title: 'احجز قطعتك برقم الكود مباشرة على الواتساب',
      desc: 'اضغط على زر "احجز على واتساب" ويتم تثبيت القطعة باسمك',
      icon: MessageCircle,
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % announcementSlides.length);
    }, 3800);
    return () => clearInterval(timer);
  }, [announcementSlides.length]);

  return (
    <section id="items" className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6">
      
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200/60 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>المعروض الآن في الفروع</span>
          </div>
          <h2 className="font-heading font-black text-2xl sm:text-4xl text-ink tracking-tight">
            اختار قطعتك واحجزها فوراً
          </h2>
          <p className="text-slate-500 text-sm sm:text-base mt-1">
            كل قطعة معروضة بسعرها وحالتها الحقيقية، والقطعة اللي بتتباع بيتعلّم عليها فوراً.
          </p>
        </div>

        {/* Dynamic Animated Announcements & Offers Card */}
        <div className="w-full md:w-auto md:min-w-[360px] bg-gradient-to-r from-amber-500/10 via-amber-400/20 to-amber-500/10 border border-amber-400/40 rounded-2xl p-4 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-sm ${announcementSlides[activeSlide].badgeStyle}`}>
              {announcementSlides[activeSlide].badge}
            </span>
            <div className="flex items-center gap-1">
              {announcementSlides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveSlide(i)}
                  className={`h-1.5 rounded-full transition-all ${
                    activeSlide === i ? 'w-4 bg-amber-500' : 'w-1.5 bg-amber-300/70'
                  }`}
                  aria-label={`إعلان ${i + 1}`}
                />
              ))}
            </div>
          </div>

          <div className="flex items-start gap-3 min-h-[44px]">
            <span className="p-2 rounded-xl bg-amber-500 text-ink shrink-0 mt-0.5 shadow-sm">
              <Tag className="w-4 h-4 font-bold" />
            </span>
            <div className="space-y-0.5">
              <h4 className="font-heading font-bold text-sm text-ink leading-snug">
                {announcementSlides[activeSlide].title}
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                {announcementSlides[activeSlide].desc}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-4 mb-8">
        
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => {
            const count =
              cat.id === 'all'
                ? products.length
                : products.filter((p) => p.cat === cat.id).length;
            const isActive = activeCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-heading font-bold whitespace-nowrap transition-all border ${
                  isActive
                    ? 'bg-ink text-white border-ink shadow-md'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <span>{cat.name}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-sans ${
                    isActive ? 'bg-amber-400 text-ink' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & In-stock toggle */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث باسم القطعة (مثلاً: تلاجة، موتور، لحام، شاشة)..."
              className="w-full pl-4 pr-11 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700"
              >
                مسح
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <button
              onClick={() => setFilterAvailability(filterAvailability === 'all' ? 'avail' : 'all')}
              className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold border transition-all flex items-center justify-center gap-2 flex-1 sm:flex-initial ${
                filterAvailability === 'avail'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>المتاح للحجز فقط</span>
            </button>
          </div>
        </div>

      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
          <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-heading font-bold text-lg text-ink">لم يتم العثور على قطع تطابق بحثك</h3>
          <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">
            جرّب تغيير كلمات البحث أو اختر قسماً آخر من الأقسام بالأعلى.
          </p>
          <button
            onClick={() => {
              setActiveCategory('all');
              setSearchQuery('');
              setFilterAvailability('all');
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-ink text-xs font-bold"
          >
            عرض كل المعروض
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filteredProducts.map((product) => {
            const offer = getOfferForProduct(product);
            const finalPrice = getFinalPrice(product);
            const hasDiscount = offer && offer.pct > 0;
            const IconComponent = ICON_MAP[product.icon] || Tag;

            // Status Badge
            const isAvail = product.status === 'avail';
            const isHeld = product.status === 'held';
            const isSold = product.status === 'sold';

            return (
              <article
                key={product.code}
                className={`group bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-soft hover:shadow-soft-lg transition-all duration-300 flex flex-col ${
                  isSold ? 'opacity-85' : ''
                }`}
              >
                {/* Visual Area */}
                <div className="h-48 bg-slate-100 relative overflow-hidden flex items-center justify-center">
                  {product.img ? (
                    <img
                      src={product.img}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-3xl bg-white shadow-soft flex items-center justify-center text-ink group-hover:scale-105 transition-transform duration-300 border border-slate-100">
                      <IconComponent className="w-10 h-10 text-slate-700" />
                    </div>
                  )}

                  {/* Top gradient for chip contrast */}
                  <div className="absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-black/40 via-black/10 to-transparent pointer-events-none" />

                  {/* Status chip */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md shadow-sm border">
                    {isAvail && (
                      <span className="bg-white/90 text-emerald-700 border-white/60 flex items-center gap-1.5 shadow-sm">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        متاح الآن
                      </span>
                    )}
                    {isHeld && (
                      <span className="bg-white/90 text-amber-800 border-white/60 flex items-center gap-1.5 shadow-sm">
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                        محجوز لعميل
                      </span>
                    )}
                    {isSold && (
                      <span className="bg-white/90 text-rose-700 border-white/60 flex items-center gap-1.5 shadow-sm">
                        <span className="w-2 h-2 rounded-full bg-rose-500" />
                        تم البيع
                      </span>
                    )}
                  </div>

                  {/* Discount or New Badge */}
                  {hasDiscount && !isSold && (
                    <div className="absolute top-3 left-3 bg-amber-500 text-ink font-heading font-black text-xs px-2.5 py-1 rounded-xl shadow-md">
                      خصم {offer.pct}%
                    </div>
                  )}

                  {product.isNew && !hasDiscount && !isSold && (
                    <div className="absolute top-3 left-3 bg-brand-blue text-white font-heading font-bold text-[11px] px-2.5 py-1 rounded-xl shadow-md">
                      وصل حديثاً
                    </div>
                  )}

                  {/* Item Code badge */}
                  <div className="absolute bottom-2.5 left-3 text-[11px] font-mono font-bold text-white bg-black/60 px-2 py-0.5 rounded-md backdrop-blur-sm">
                    {product.code}
                  </div>
                </div>

                {/* Details Area */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    
                    {/* Branch and badge */}
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="flex items-center gap-1 font-medium text-slate-600">
                        <MapPin className="w-3.5 h-3.5 text-amber-500" />
                        فرع {product.branch}
                      </span>
                      {product.badge && (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                          {product.badge}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="font-heading font-bold text-base text-ink line-clamp-2 leading-snug group-hover:text-amber-600 transition-colors">
                      {product.name}
                    </h3>

                    {/* Condition / brief */}
                    {product.condition && (
                      <p className="text-xs text-slate-500 line-clamp-1">
                        {product.condition}
                      </p>
                    )}
                  </div>

                  {/* Price & Booking Action */}
                  <div className="pt-3 border-t border-slate-100 space-y-3">
                    <div className="flex items-baseline justify-between">
                      <div>
                        <span className="text-xs text-slate-400 block font-medium">السعر المطلوب</span>
                        <div className="flex items-baseline gap-2">
                          <span className={`font-heading font-black text-2xl ${isSold ? 'line-through text-slate-400' : 'text-ink'}`}>
                            {formatPrice(finalPrice)}
                          </span>
                          <span className="text-xs font-semibold text-slate-500">جنيه</span>
                        </div>
                      </div>

                      {hasDiscount && (
                        <div className="text-left">
                          <span className="text-xs text-slate-400 line-through block">
                            {formatPrice(product.price)} ج
                          </span>
                          <span className="text-[11px] font-bold text-emerald-600">
                            وفرت {formatPrice(product.price - finalPrice)} ج
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Button */}
                    {isAvail ? (
                      <a
                        href={getWhatsAppBookingLink(product)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-ink hover:bg-slate-800 text-white font-heading font-bold text-sm shadow-sm transition-all active:scale-95 group/btn"
                      >
                        <MessageCircle className="w-4 h-4 text-emerald-400 group-hover/btn:scale-110 transition-transform" />
                        <span>احجز على واتساب</span>
                      </a>
                    ) : isHeld ? (
                      <div className="w-full py-2.5 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-800 font-heading font-bold text-xs text-center">
                        محجوزة مؤقتاً · استفسر عن بدائل
                      </div>
                    ) : (
                      <div className="w-full py-2.5 rounded-2xl bg-slate-100 text-slate-400 font-heading font-bold text-xs text-center cursor-not-allowed">
                        تم البيع لعميل
                      </div>
                    )}
                  </div>

                </div>
              </article>
            );
          })}
        </div>
      )}

    </section>
  );
}

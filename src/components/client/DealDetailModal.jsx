import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Layers,
  MapPin,
  Scale,
  PackageCheck,
  CheckCircle2,
  ShieldCheck,
  MessageCircle,
  CreditCard,
  Building2,
  Sparkles,
  Phone,
  ArrowRight,
  TrendingUp,
  Tag,
  Truck,
} from 'lucide-react';

export default function DealDetailModal() {
  const {
    selectedDealForDetail,
    setSelectedDealForDetail,
    formatPrice,
    getWhatsAppDealLink,
    bookDealDeposit,
  } = useApp();

  const [customBidAmount, setCustomBidAmount] = useState('');
  const [showBidForm, setShowBidForm] = useState(false);

  if (!selectedDealForDetail) return null;

  const deal = selectedDealForDetail;
  const isAvail = deal.status === 'avail';
  const isHeld = deal.status === 'held';
  const isSold = deal.status === 'sold';

  const profitMargin = deal.estimatedRetail ? deal.estimatedRetail - deal.totalPrice : 0;

  const handleCustomBid = (e) => {
    e.preventDefault();
    if (!customBidAmount) return;
    const text = `السلام عليكم يا حاج، بخصوص الصفقة (${deal.code}: ${deal.title})، المعروضة بـ ${formatPrice(deal.totalPrice)} ج، أنا جاهز للتنفيذ الفوري وعارض مبلغ ${formatPrice(customBidAmount)} جنيه كـ Total للشروة كاملة. هل يناسبك؟`;
    window.open(`https://wa.me/201034052401?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 flex items-center justify-center bg-ink/75 backdrop-blur-sm animate-in fade-in duration-200">
      
      {/* Modal Container */}
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                  {deal.code}
                </span>
                <span className="text-xs font-semibold text-slate-300">
                  لوط كامل · بيع شروة واحدة كـ Total
                </span>
              </div>
              <h3 className="font-heading font-black text-lg sm:text-xl text-white mt-1 line-clamp-1">
                {deal.title}
              </h3>
            </div>
          </div>

          <button
            onClick={() => setSelectedDealForDetail(null)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Top Banner & Financial Summary */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50 via-slate-50 to-white border border-amber-200/80 shadow-soft">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-amber-800 uppercase tracking-wide block">
                  السعر المطلوب للشروة بالكامل (Total):
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="font-heading font-black text-3xl sm:text-4xl text-ink">
                    {formatPrice(deal.totalPrice)}
                  </span>
                  <span className="text-sm font-bold text-slate-600">جنيه مصري</span>
                </div>
              </div>

              {deal.estimatedRetail > 0 && (
                <div className="bg-white p-3.5 rounded-xl border border-amber-200/80 sm:text-left text-right">
                  <span className="text-[11px] text-slate-400 block font-semibold">
                    قيمة التجزئة التقديرية (قطاعي):
                  </span>
                  <span className="text-sm font-bold text-slate-600 line-through">
                    {formatPrice(deal.estimatedRetail)} ج
                  </span>
                  <div className="flex items-center gap-1 text-emerald-700 text-xs font-extrabold mt-0.5">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>وفر للتاجر {formatPrice(profitMargin)} ج</span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Specs Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-4 mt-4 border-t border-slate-200/70 text-xs">
              <div className="flex items-center gap-1.5 text-slate-600">
                <Scale className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="font-medium truncate">{deal.weight || 'حسب الوزن'}</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-600">
                <PackageCheck className="w-4 h-4 text-brand-blue shrink-0" />
                <span className="font-medium truncate">{deal.itemsCount}</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-600">
                <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                <span className="font-medium truncate">فرع {deal.branch}</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-600">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-medium truncate">معاينة وتجربة حية</span>
              </div>
            </div>
          </div>

          {/* Description */}
          {deal.desc && (
            <div className="space-y-1.5">
              <h4 className="font-heading font-black text-sm text-ink">تفاصيل ومصدر الصفقة:</h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200/70">
                {deal.desc}
              </p>
            </div>
          )}

          {/* Itemized Manifest Table */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="font-heading font-black text-sm sm:text-base text-ink flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-500" />
                <span>كشف محتويات الصفقة بالتفصيل (بند بند):</span>
              </h4>
              <span className="text-xs font-bold text-slate-400">
                {deal.items?.length || 0} بنود رئيسية
              </span>
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3 w-10 text-center">#</th>
                    <th className="p-3">اسم البند والمعدة</th>
                    <th className="p-3 w-24">الكمية</th>
                    <th className="p-3 hidden sm:table-cell">المواصفات والحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {deal.items && deal.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 text-center font-mono font-bold text-slate-400">
                        {idx + 1}
                      </td>
                      <td className="p-3">
                        <span className="font-bold text-ink block">{item.name}</span>
                        <span className="text-[11px] text-slate-500 sm:hidden block mt-0.5">
                          {item.spec}
                        </span>
                      </td>
                      <td className="p-3 font-semibold text-amber-800 bg-amber-50/50">
                        {item.qty}
                      </td>
                      <td className="p-3 text-slate-500 hidden sm:table-cell">
                        {item.spec}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Location & Inspection terms */}
          <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/70 space-y-2">
            <div className="flex items-center gap-2 text-brand-blue text-xs font-bold">
              <Truck className="w-4 h-4 shrink-0" />
              <span>شروط المعاينة والتسليم للوط:</span>
            </div>
            <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside leading-relaxed pr-1">
              <li>
                <strong>الموقع:</strong> {deal.location}
              </li>
              <li>
                <strong>المعاينة الفنية:</strong> المعاينة متاحة يومياً من 9 صباحاً حتى 5 مساءً، مع إمكانية تجربة المواتير بالكهرباء فحص العزوم.
              </li>
              <li>
                <strong>الوزن والتسليم:</strong> في حالة لوطات الحديد، يتم الوزن على ميزان بسكول معتمد بحضور المشتري والتحميل بالونش فوراً.
              </li>
              <li>
                <strong>طريقة البيع:</strong> اللوط يباع شروة واحدة كاملة على بعضها كـ Total ولا يوجد تجزئة.
              </li>
            </ul>
          </div>

          {/* Negotiation / Bid Form */}
          {showBidForm ? (
            <form onSubmit={handleCustomBid} className="p-4 rounded-2xl bg-amber-50 border border-amber-300 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900">
                  تقديم عرض سعر / تفاوض مباشر مع الحاج:
                </span>
                <button
                  type="button"
                  onClick={() => setShowBidForm(false)}
                  className="text-xs text-slate-500 hover:text-slate-800"
                >
                  إلغاء
                </button>
              </div>

              <div className="flex gap-2">
                <input
                  type="number"
                  required
                  placeholder="المبلغ المقترح بالجنيه (مثال: 800000)"
                  value={customBidAmount}
                  onChange={(e) => setCustomBidAmount(e.target.value)}
                  className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-amber-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-ink text-white font-bold text-xs hover:bg-slate-800 transition-colors"
                >
                  إرسال العرض على واتساب
                </button>
              </div>
            </form>
          ) : null}

        </div>

        {/* Footer Actions */}
        <div className="p-5 sm:p-6 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3">
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {!showBidForm && isAvail && (
              <button
                type="button"
                onClick={() => setShowBidForm(true)}
                className="px-4 py-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-ink font-bold text-xs transition-colors"
              >
                🤝 تفاوض / قدّم عرض سعر
              </button>
            )}

            {isAvail && (
              <button
                type="button"
                onClick={() => {
                  bookDealDeposit(deal);
                  setSelectedDealForDetail(null);
                }}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-ink font-heading font-black text-xs shadow-glow-amber transition-all active:scale-95"
              >
                <CreditCard className="w-4 h-4" />
                <span>حجز بعربون ({formatPrice(deal.deposit || 50000)} ج)</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {isAvail ? (
              <a
                href={getWhatsAppDealLink(deal, 'inspect')}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-heading font-bold text-xs sm:text-sm shadow-sm transition-all active:scale-95"
              >
                <MessageCircle className="w-4 h-4 text-emerald-200" />
                <span>احجز موعد معاينة في الهنجر</span>
              </a>
            ) : isHeld ? (
              <div className="w-full sm:w-auto px-4 py-3 rounded-xl bg-amber-100 text-amber-900 text-xs font-bold text-center">
                الصفقة جاري معاينتها حالياً · استفسر عن صفقات قادمة
              </div>
            ) : (
              <div className="w-full sm:w-auto px-4 py-3 rounded-xl bg-slate-200 text-slate-500 text-xs font-bold text-center cursor-not-allowed">
                تم بيع الصفقة بالكامل
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}

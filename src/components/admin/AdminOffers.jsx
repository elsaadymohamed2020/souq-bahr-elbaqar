import React from 'react';
import { useApp } from '../../context/AppContext';
import { Plus, Tag, Trash2, Send, Sparkles, MessageCircle } from 'lucide-react';

export default function AdminOffers() {
  const {
    offers,
    toggleOffer,
    deleteOffer,
    setIsAddOfferOpen,
    products,
    showToast,
  } = useApp();

  const handleBroadcast = () => {
    showToast('تمت محاكاة إرسال برودكاست العروض لـ 1,240 عميل مسجلين بالواتساب!');
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl shadow-soft border border-slate-200/80">
        <div>
          <h1 className="font-heading font-black text-xl sm:text-2xl text-ink">
            إدارة العروض والخصومات
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            فعّل أي خصم في ثانية، والأسعار تتحدث لوحدها على الموقع مع شريط العروض الترويجي.
          </p>
        </div>

        <button
          onClick={() => setIsAddOfferOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-ink font-heading font-black text-sm shadow-glow-amber transition-all active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>إنشاء عرض جديد</span>
        </button>
      </div>

      {/* Offers Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {offers.map((offer) => (
          <div
            key={offer.id}
            className={`bg-white rounded-3xl p-5 shadow-soft border transition-all flex items-center justify-between gap-4 ${
              offer.active ? 'border-amber-300 ring-2 ring-amber-400/20' : 'border-slate-200/80 opacity-75'
            }`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-16 h-16 rounded-2xl font-heading font-black text-2xl flex items-center justify-center shrink-0 ${
                  offer.active
                    ? 'bg-amber-500 text-ink shadow-md shadow-amber-500/30'
                    : 'bg-slate-100 text-slate-400'
                }`}
                dir="ltr"
              >
                -{offer.pct}%
              </div>

              <div className="space-y-1">
                <h3 className="font-heading font-bold text-base text-ink">
                  {offer.title || `خصم ${offer.pct}%`}
                </h3>
                <p className="text-xs text-slate-500">
                  ساري حتى: <b className="text-slate-700">{offer.ends}</b>
                </p>
                {offer.desc && (
                  <p className="text-[11px] text-slate-400">{offer.desc}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Switch Toggle */}
              <button
                onClick={() => toggleOffer(offer.id)}
                className={`w-12 h-7 rounded-full transition-colors relative p-1 ${
                  offer.active ? 'bg-emerald-500' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    offer.active ? '-translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>

              <button
                onClick={() => deleteOffer(offer.id)}
                className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Broadcast WhatsApp Simulator */}
      <div className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 rounded-3xl p-6 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-right">
          <div className="flex items-center gap-2 font-heading font-black text-lg">
            <MessageCircle className="w-5 h-5 fill-white" />
            <span>ابعت العروض النشطة لعملائك على الواتساب</span>
          </div>
          <p className="text-xs sm:text-sm text-emerald-100 max-w-xl">
            رسالة موحدة مجهزة بقوالب Meta الرسمية توصل لكل العملاء الذين تواصلوا معك سابقاً لزيادة المبيعات.
          </p>
        </div>

        <button
          onClick={handleBroadcast}
          className="px-6 py-3 rounded-2xl bg-white text-emerald-800 font-heading font-black text-sm shadow-md hover:bg-emerald-50 transition-all active:scale-95 shrink-0"
        >
          إرسال للعملاء (تجربة)
        </button>
      </div>

    </div>
  );
}

import React from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldAlert, PhoneCall, CheckCircle2 } from 'lucide-react';

export default function TrustSection() {
  const { officialNumbers } = useApp();

  return (
    <section className="py-14 max-w-7xl mx-auto px-4 sm:px-6">
      <div className="bg-gradient-to-br from-ink via-ink-800 to-slate-900 rounded-3xl p-6 sm:p-10 text-white relative overflow-hidden shadow-xl border border-slate-800">
        
        {/* Glow orb */}
        <div className="absolute top-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Text message */}
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span>تحذير هام من الحسابات والصفحات المزيفة</span>
            </div>

            <h3 className="font-heading font-black text-2xl sm:text-3xl text-white tracking-tight">
              اتأكد إنك بتتعامل مع الأرقام الرسمية للسوق
            </h3>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              نظراً لوجود أشخاص ينتحلون اسم «سوق بحر البقر الكبير» ويرسلون أسعاراً غير صحيحة، نؤكد أن تعاملاتنا تتم فقط عبر المعاينة في فروعنا وعبر الأرقام الرسمية المدرجة هنا، وقارن دائماً أي سعر بالمعروض على هذا الموقع.
            </p>

            <div className="flex flex-wrap gap-4 pt-2 text-xs sm:text-sm text-slate-400 font-medium">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                معاينة وفحص في المعرض
              </span>
              <span className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                أسعار معلنة وثابتة
              </span>
              <span className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                حجز مباشر على الواتساب
              </span>
            </div>
          </div>

          {/* Official Phone Cards */}
          <div className="lg:col-span-5 space-y-3">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
              أرقام التواصل الرسمية المعتمدة:
            </span>

            <div className="space-y-2">
              {officialNumbers.map((item) => (
                <a
                  key={item.number}
                  href={`tel:${item.number}`}
                  className="group flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 transition-all text-white active:scale-98"
                >
                  <div className="flex items-center gap-3">
                    <span className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-400/30 group-hover:bg-amber-500 group-hover:text-ink transition-colors">
                      <PhoneCall className="w-4 h-4" />
                    </span>
                    <div>
                      <span className="block font-mono font-bold text-base sm:text-lg tracking-wider" dir="ltr">
                        {item.display}
                      </span>
                      <span className="text-xs text-slate-300">{item.label}</span>
                    </div>
                  </div>

                  <span className="text-xs font-heading font-bold text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-lg border border-amber-400/20">
                    اتصال
                  </span>
                </a>
              ))}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}

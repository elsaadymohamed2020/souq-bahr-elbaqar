import React from 'react';
import { useApp } from '../../context/AppContext';
import { MapPin, Navigation, Phone, Clock, ExternalLink } from 'lucide-react';

export default function BranchesSection() {
  const { branches } = useApp();

  return (
    <section id="branches" className="py-16 bg-slate-100/70 border-t border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-amber-600 bg-amber-100/60 px-3 py-1 rounded-full border border-amber-200 inline-block mb-2">
            مواقع المعارض
          </span>
          <h2 className="font-heading font-black text-2xl sm:text-4xl text-ink tracking-tight">
            فروعنا في محافظة الشرقية
          </h2>
          <p className="text-slate-500 text-sm sm:text-base mt-2">
            معارضنا مفتوحة يومياً لاستقبالكم، أو دوس "وديني باللوكيشن" عشان جوجل ماب يوصلك مباشرة لباب المعرض.
          </p>
        </div>

        {/* Branches Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {branches.map((branch) => (
            <div
              key={branch.id}
              className="bg-white rounded-3xl overflow-hidden shadow-soft border border-slate-200/80 hover:shadow-soft-lg transition-all duration-300 flex flex-col justify-between"
            >
              {/* Map visual Header */}
              <div className="h-40 bg-gradient-to-br from-slate-800 via-ink to-slate-900 relative flex items-center justify-center p-4 overflow-hidden">
                {/* Visual grid lines */}
                <div 
                  className="absolute inset-0 opacity-15"
                  style={{
                    backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
                    backgroundSize: '24px 24px',
                  }}
                />
                
                {/* Map Pin icon */}
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500 text-ink flex items-center justify-center shadow-lg shadow-amber-500/30 animate-bounce">
                    <MapPin className="w-7 h-7" />
                  </div>
                  <span className="mt-2 text-xs font-mono font-bold text-amber-300 bg-ink/70 px-3 py-0.5 rounded-full border border-amber-400/30">
                    Google Maps GPS
                  </span>
                </div>
              </div>

              {/* Details Body */}
              <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-heading font-black text-xl sm:text-2xl text-ink">
                      {branch.name}
                    </h3>
                    {branch.featured && (
                      <span className="text-[11px] font-bold text-brand-blue bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
                        الفرع الأكبر
                      </span>
                    )}
                  </div>

                  <div className="space-y-2.5 text-sm text-slate-600">
                    <div className="flex items-start gap-2.5">
                      <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-1" />
                      <span className="leading-relaxed font-medium">{branch.address}</span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>{branch.hours}</span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="font-mono font-semibold" dir="ltr">{branch.phoneDisplay}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100">
                  <a
                    href={branch.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-ink hover:bg-slate-800 text-white font-heading font-bold text-sm shadow-sm transition-all active:scale-95"
                  >
                    <Navigation className="w-4 h-4 text-amber-400" />
                    <span>وديني باللوكيشن</span>
                  </a>

                  <a
                    href={`tel:${branch.phone}`}
                    className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200/80 text-ink font-heading font-bold text-sm transition-all active:scale-95 border border-slate-200"
                  >
                    <Phone className="w-4 h-4 text-slate-600" />
                    <span>اتصل بالفرع</span>
                  </a>
                </div>

              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

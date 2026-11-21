import React from 'react';
import { Tag, MapPin, CheckCircle2, ArrowDown } from 'lucide-react';

export default function QuickAnswers() {
  const items = [
    {
      id: 'price',
      href: '#items',
      icon: Tag,
      iconColor: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
      title: 'بكام؟',
      desc: 'السعر مكتوب ومحدث على كل قطعة بدون فصال أو مفاجآت',
    },
    {
      id: 'location',
      href: '#branches',
      icon: MapPin,
      iconColor: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
      title: 'فين المكان؟',
      desc: 'الخريطة توصلك لباب فرع بحر البقر أو فرع الصالحية',
    },
    {
      id: 'available',
      href: '#items',
      icon: CheckCircle2,
      iconColor: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
      title: 'لسه موجود؟',
      desc: 'متاح ولا اتباع باين قدامك، واللي بيتباع بيتعلّم عليه فوراً',
    },
  ];

  return (
    <section aria-label="الإجابات السريعة" className="relative z-20 -mt-10 sm:-mt-14 max-w-7xl mx-auto px-4 sm:px-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <a
              key={item.id}
              href={item.href}
              className="group bg-white rounded-3xl p-5 shadow-soft border border-slate-200/80 hover:shadow-soft-lg hover:border-amber-400/50 transition-all duration-300 flex items-start gap-4"
            >
              <div className={`p-3.5 rounded-2xl border ${item.iconColor} shrink-0 transition-transform group-hover:scale-110 duration-200`}>
                <Icon className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-heading font-black text-lg text-ink group-hover:text-amber-600 transition-colors">
                    {item.title}
                  </h3>
                  <ArrowDown className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}

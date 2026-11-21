import React from 'react';
import { MapPin, Phone, ShieldCheck, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 pt-12 pb-24 sm:pb-12 text-slate-600 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-slate-100">
          
          {/* Brand Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-ink flex items-center justify-center text-amber-400 font-heading font-black text-lg">
                ب
              </div>
              <span className="font-heading font-black text-lg text-ink">
                سوق بحر البقر الكبير
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
              أكبر سوق للأجهزة المنزلية والمعدات الأوروبية المستوردة بمحافظة الشرقية. فرعا الحسينية والصالحية الجديدة.
            </p>
          </div>

          {/* Quick links */}
          <div className="space-y-2">
            <h4 className="font-heading font-bold text-ink text-sm">فروعنا الرسمية</h4>
            <ul className="space-y-2 text-xs text-slate-500">
              <li className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-amber-500" />
                <span>فرع بحر البقر: قرية 3، بجوار المسجد الكبير، الحسينية</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-amber-500" />
                <span>فرع الصالحية: مدينة الصالحية الجديدة</span>
              </li>
            </ul>
          </div>

          {/* Booking Info */}
          <div className="space-y-2">
            <h4 className="font-heading font-bold text-ink text-sm">رقم الحجز المعتمد</h4>
            <p className="text-xs text-slate-500">
              للحجز والاستفسارات الفورية عبر الواتساب والمكالمات:
            </p>
            <div className="font-mono font-bold text-base text-ink" dir="ltr">
              010 3405 2401
            </div>
          </div>

        </div>

        {/* Developer Credit & Demo Note */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div>
            جميع الحقوق محفوظة © {new Date().getFullYear()} سوق بحر البقر الكبير.
          </div>
          <div className="flex items-center gap-1.5 text-slate-500 font-medium">
            <span>تم تطوير هذا النموذج التجريبي لتقديم تجربة تسوق وحجز رقمية راقية</span>
          </div>
        </div>

      </div>
    </footer>
  );
}

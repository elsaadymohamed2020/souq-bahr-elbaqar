import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Search, MapPin, Phone, MessageSquare, Clock, User, ArrowUpRight } from 'lucide-react';

const SEGMENT_LABELS = {
  all: 'كل العملاء',
  new: 'عميل جديد',
  int: 'مهتم',
  wait: 'مستني قطعة',
  buy: 'اشترى سابقاً',
};

const SEGMENT_COLORS = {
  new: 'bg-blue-100 text-blue-800 border-blue-200',
  int: 'bg-amber-100 text-amber-800 border-amber-200',
  wait: 'bg-purple-100 text-purple-800 border-purple-200',
  buy: 'bg-emerald-100 text-emerald-800 border-emerald-200',
};

export default function AdminCRM() {
  const { customers, setSelectedCustomer, formatPrice } = useApp();
  const [activeSeg, setActiveSeg] = useState('all');
  const [query, setQuery] = useState('');

  const filtered = customers.filter((c) => {
    const matchesSeg = activeSeg === 'all' || c.seg === activeSeg;
    const matchesSearch =
      !query ||
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.gov.toLowerCase().includes(query.toLowerCase()) ||
      (c.want && c.want.toLowerCase().includes(query.toLowerCase()));
    return matchesSeg && matchesSearch;
  });

  return (
    <div className="space-y-4">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl shadow-soft border border-slate-200/80">
        <div>
          <h1 className="font-heading font-black text-xl sm:text-2xl text-ink">
            سجل العملاء وإدارة العلاقات (CRM)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            بيانات وتاريخ كل عميل كلمك على فيسبوك أو واتساب أو اشترى من المعرض.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث باسم العميل أو المحافظة..."
            className="w-full pl-4 pr-10 py-2.5 bg-slate-100 border border-slate-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Segments bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {Object.entries(SEGMENT_LABELS).map(([k, label]) => {
          const count = k === 'all' ? customers.length : customers.filter((c) => c.seg === k).length;
          return (
            <button
              key={k}
              onClick={() => setActiveSeg(k)}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs sm:text-sm font-heading font-bold transition-all border ${
                activeSeg === k
                  ? 'bg-ink text-white border-ink shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>{label}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeSeg === k ? 'bg-amber-400 text-ink' : 'bg-slate-100'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Customers List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((c) => (
          <div
            key={c.id}
            onClick={() => setSelectedCustomer(c)}
            className="group bg-white rounded-3xl p-5 shadow-soft border border-slate-200/80 hover:shadow-soft-lg hover:border-amber-400/60 cursor-pointer transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-700 to-ink text-white font-heading font-black text-base flex items-center justify-center">
                    {c.avatar}
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-base text-ink group-hover:text-amber-600 transition-colors">
                      {c.name}
                    </h3>
                    <span className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-amber-500" />
                      {c.gov}
                    </span>
                  </div>
                </div>

                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${SEGMENT_COLORS[c.seg]}`}>
                  {SEGMENT_LABELS[c.seg]}
                </span>
              </div>

              {/* Want / Interest */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-600 leading-relaxed">
                <span className="font-bold text-slate-700 block mb-1">الاهتمام أو الطلب:</span>
                {c.want}
              </div>
            </div>

            {/* Bottom info */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>آخر تواصل: <b className="text-slate-700">{c.last}</b></span>
              {c.spent > 0 && (
                <span className="font-heading font-black text-sm text-emerald-700">
                  {formatPrice(c.spent)} ج
                </span>
              )}
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}

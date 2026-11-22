import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Layers,
  Plus,
  Scale,
  MapPin,
  CheckCircle2,
  Clock,
  Trash2,
  TrendingUp,
  X,
  Sparkles,
  Eye,
  Tag,
  Building2,
  AlertCircle,
} from 'lucide-react';

export default function AdminDeals() {
  const {
    deals,
    formatPrice,
    addDeal,
    updateDealStatus,
    deleteDeal,
    setSelectedDealForDetail,
    isAddDealOpen,
    setIsAddDealOpen,
    branches,
  } = useApp();

  // Form State for Add Deal Modal
  const [dealForm, setDealForm] = useState({
    title: '',
    totalPrice: '',
    estimatedRetail: '',
    deposit: '',
    category: 'معدات ومواتير',
    branch: 'بحر البقر',
    location: 'هنجر المخازن العمومي - بحر البقر',
    weight: 'حوالي 10 طن',
    itemsCount: '25 قطعة ومعدة',
    condition: 'فحص شامل وبحالة الفابريكا وتجربة بالكهرباء قبل الشحن',
    desc: 'صفقة تصفية خط إنتاج كاملة. البيع شروة واحدة كـ Total.',
    badge: 'صفقة جديدة',
    items: [
      { name: 'مواتير سيمنز 15 حصان ألماني', qty: '6 مواتير', spec: 'نحاس أصلي بحالة ممتازة' },
      { name: 'لوحات تحكم وقواطع شنايدر', qty: '2 لوحة', spec: 'قواطع 630 أمبير' },
    ],
  });

  const [newItem, setNewItem] = useState({ name: '', qty: '', spec: '' });

  // Summary Metrics
  const totalVolume = deals.reduce((sum, d) => sum + (d.totalPrice || 0), 0);
  const availCount = deals.filter((d) => d.status === 'avail').length;
  const heldCount = deals.filter((d) => d.status === 'held').length;
  const soldCount = deals.filter((d) => d.status === 'sold').length;

  const handleAddItemToForm = () => {
    if (!newItem.name.trim()) return;
    setDealForm({
      ...dealForm,
      items: [...dealForm.items, { ...newItem }],
    });
    setNewItem({ name: '', qty: '', spec: '' });
  };

  const handleRemoveItemFromForm = (idx) => {
    setDealForm({
      ...dealForm,
      items: dealForm.items.filter((_, i) => i !== idx),
    });
  };

  const handleSubmitDeal = (e) => {
    e.preventDefault();
    if (!dealForm.title.trim() || !dealForm.totalPrice) return;

    addDeal({
      ...dealForm,
      itemsCount: `${dealForm.items.length} بنود ومعدات رئيسية`,
    });

    setIsAddDealOpen(false);
    // Reset form
    setDealForm({
      title: '',
      totalPrice: '',
      estimatedRetail: '',
      deposit: '',
      category: 'معدات ومواتير',
      branch: 'بحر البقر',
      location: 'هنجر المخازن العمومي - بحر البقر',
      weight: 'حوالي 10 طن',
      itemsCount: '25 قطعة ومعدة',
      condition: 'فحص شامل وبحالة الفابريكا وتجربة بالكهرباء قبل الشحن',
      desc: 'صفقة تصفية خط إنتاج كاملة. البيع شروة واحدة كـ Total.',
      badge: 'صفقة جديدة',
      items: [
        { name: 'مواتير سيمنز 15 حصان ألماني', qty: '6 مواتير', spec: 'نحاس أصلي بحالة ممتازة' },
      ],
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header & Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading font-black text-2xl text-ink">
            إدارة الصفقات واللوطات الكبرى
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            شروات المصانع، لوطات الحديد والمعدات المعروضة على بعضها كـ Total للتجار والمقاولين
          </p>
        </div>

        <button
          onClick={() => setIsAddDealOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-ink font-heading font-black text-sm shadow-glow-amber transition-all active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>إدراج صفقة / لوط جديد</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-soft">
          <span className="text-xs font-bold text-slate-400 block mb-1">
            إجمالي قيمة الصفقات (Total Volume)
          </span>
          <div className="flex items-baseline gap-1">
            <span className="font-heading font-black text-2xl text-ink">
              {formatPrice(totalVolume)}
            </span>
            <span className="text-xs font-semibold text-slate-500">ج</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-soft">
          <span className="text-xs font-bold text-emerald-600 block mb-1">
            صفقات متاحة للمعاينة والتفاوض
          </span>
          <span className="font-heading font-black text-2xl text-emerald-700">
            {availCount} صفقات
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-soft">
          <span className="text-xs font-bold text-amber-600 block mb-1">
            صفقات جاري معاينتها لمشتري
          </span>
          <span className="font-heading font-black text-2xl text-amber-700">
            {heldCount} صفقات
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-soft">
          <span className="text-xs font-bold text-slate-500 block mb-1">
            صفقات تم بيعها وتحصيلها
          </span>
          <span className="font-heading font-black text-2xl text-slate-700">
            {soldCount} صفقات
          </span>
        </div>
      </div>

      {/* Deals List */}
      <div className="space-y-4">
        {deals.map((deal) => {
          const isAvail = deal.status === 'avail';
          const isHeld = deal.status === 'held';
          const isSold = deal.status === 'sold';

          return (
            <div
              key={deal.code}
              className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-soft hover:shadow-soft-lg transition-all space-y-4"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                
                {/* Title & Info */}
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                    <img
                      src={deal.img || '/images/products/motor.jpg'}
                      alt={deal.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                        {deal.code}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">
                        فرع {deal.branch} · {deal.weight}
                      </span>
                      {deal.badge && (
                        <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          {deal.badge}
                        </span>
                      )}
                    </div>

                    <h3 className="font-heading font-bold text-base sm:text-lg text-ink">
                      {deal.title}
                    </h3>

                    <p className="text-xs text-slate-500 line-clamp-1 max-w-2xl">
                      {deal.desc}
                    </p>
                  </div>
                </div>

                {/* Price */}
                <div className="lg:text-left shrink-0">
                  <span className="text-xs text-slate-400 block font-semibold">
                    السعر المطلوب كـ Total:
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className={`font-heading font-black text-2xl ${isSold ? 'line-through text-slate-400' : 'text-ink'}`}>
                      {formatPrice(deal.totalPrice)}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">جنيه</span>
                  </div>
                </div>

              </div>

              {/* Items Manifest & Status Actions */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                
                {/* Items preview tag */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedDealForDetail(deal)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5 text-amber-600" />
                    <span>عرض كشف المحتويات ({deal.items?.length || 0} بنود)</span>
                  </button>
                  <span className="text-xs text-slate-400">
                    موقع التشوين: {deal.location}
                  </span>
                </div>

                {/* Status Switcher & Delete */}
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200/70 text-xs font-bold">
                    <button
                      onClick={() => updateDealStatus(deal.code, 'avail')}
                      className={`px-3 py-1.5 rounded-xl transition-all ${
                        isAvail
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      متاح
                    </button>
                    <button
                      onClick={() => updateDealStatus(deal.code, 'held')}
                      className={`px-3 py-1.5 rounded-xl transition-all ${
                        isHeld
                          ? 'bg-amber-500 text-ink shadow-xs'
                          : 'text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      جاري المعاينة
                    </button>
                    <button
                      onClick={() => updateDealStatus(deal.code, 'sold')}
                      className={`px-3 py-1.5 rounded-xl transition-all ${
                        isSold
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      تم البيع
                    </button>
                  </div>

                  <button
                    onClick={() => deleteDeal(deal.code)}
                    className="p-2.5 rounded-xl text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="حذف الصفقة"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* Add Deal Modal */}
      {isAddDealOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 flex items-center justify-center bg-ink/75 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8 max-h-[92vh] flex flex-col">
            
            {/* Header */}
            <div className="p-5 sm:p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-black text-lg text-ink">إدراج صفقة / لوط جديد</h3>
                  <p className="text-xs text-slate-500">عرض شروة كاملة على بعضها كـ Total للتجار والمصانع</p>
                </div>
              </div>

              <button
                onClick={() => setIsAddDealOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitDeal} className="p-6 overflow-y-auto space-y-4 flex-1">
              
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  عنوان الصفقة بالكامل *
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: صفقة تصفية ورش كبرى: 15 موتور + كمرات حديد 10 طن"
                  value={dealForm.title}
                  onChange={(e) => setDealForm({ ...dealForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    السعر المطلوب كـ Total (جنيه) *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="مثال: 750000"
                    value={dealForm.totalPrice}
                    onChange={(e) => setDealForm({ ...dealForm, totalPrice: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    القيمة التقديرية للتجزئة (اختياري)
                  </label>
                  <input
                    type="number"
                    placeholder="مثال: 950000"
                    value={dealForm.estimatedRetail}
                    onChange={(e) => setDealForm({ ...dealForm, estimatedRetail: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    عربون التثبيت والحجز (جنيه)
                  </label>
                  <input
                    type="number"
                    placeholder="مثال: 50000"
                    value={dealForm.deposit}
                    onChange={(e) => setDealForm({ ...dealForm, deposit: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الفرع</label>
                  <select
                    value={dealForm.branch}
                    onChange={(e) => setDealForm({ ...dealForm, branch: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"
                  >
                    <option value="بحر البقر">بحر البقر</option>
                    <option value="الصالحية">الصالحية الجديدة</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">التصنيف</label>
                  <select
                    value={dealForm.category}
                    onChange={(e) => setDealForm({ ...dealForm, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"
                  >
                    <option value="معدات ومواتير">معدات ومواتير</option>
                    <option value="حديد ومعادن">حديد ومعادن</option>
                    <option value="تبريد وتجهيزات">تبريد وتجهيزات</option>
                    <option value="كهرباء ومحولات">كهرباء ومحولات</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الوزن التقديري</label>
                  <input
                    type="text"
                    placeholder="مثال: 15 طن"
                    value={dealForm.weight}
                    onChange={(e) => setDealForm({ ...dealForm, weight: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">مكان المعاينة والتخزين</label>
                <input
                  type="text"
                  placeholder="مثال: هنجر المخازن الرئيسي - بحر البقر"
                  value={dealForm.location}
                  onChange={(e) => setDealForm({ ...dealForm, location: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              {/* Dynamic Items Builder */}
              <div className="space-y-2.5 pt-2 border-t border-slate-200">
                <label className="block text-xs font-bold text-slate-700">
                  كشف محتويات الصفقة (البنود داخل اللوط):
                </label>

                {/* Items list */}
                <div className="space-y-2">
                  {dealForm.items.map((it, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                    >
                      <div>
                        <span className="font-bold text-ink">{it.name}</span>
                        <span className="text-slate-400 mr-2">({it.qty})</span>
                        {it.spec && <span className="text-slate-500 mr-2">· {it.spec}</span>}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveItemFromForm(idx)}
                        className="text-rose-500 hover:text-rose-700 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add Item inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="اسم البند (مثال: مواتير سيمنز 20 حصان)"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    className="px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                  <input
                    type="text"
                    placeholder="الكمية (مثال: 5 مواتير أو 8 طن)"
                    value={newItem.qty}
                    onChange={(e) => setNewItem({ ...newItem, qty: e.target.value })}
                    className="px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      placeholder="المواصفة"
                      value={newItem.spec}
                      onChange={(e) => setNewItem({ ...newItem, spec: e.target.value })}
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleAddItemToForm}
                      className="px-3 py-2 rounded-xl bg-ink text-white font-bold text-xs hover:bg-slate-800 transition-colors"
                    >
                      + أضف
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">وصف تفصيلي للصفقة</label>
                <textarea
                  rows={2}
                  value={dealForm.desc}
                  onChange={(e) => setDealForm({ ...dealForm, desc: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Submit */}
              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddDealOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-ink font-heading font-black text-xs shadow-glow-amber transition-all"
                >
                  نشر الصفقة على الموقع فوراً
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}

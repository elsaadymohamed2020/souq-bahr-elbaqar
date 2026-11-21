import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Plus,
  Trash2,
  MapPin,
  Tag,
  CheckCircle2,
  Clock,
  XCircle,
  Package,
} from 'lucide-react';

export default function AdminProducts() {
  const {
    products,
    updateProductStatus,
    deleteProduct,
    setIsAddProductOpen,
    formatPrice,
    getFinalPrice,
    offers,
  } = useApp();

  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = products.filter(
    (p) => statusFilter === 'all' || p.status === statusFilter
  );

  return (
    <div className="space-y-4">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl shadow-soft border border-slate-200/80">
        <div>
          <h1 className="font-heading font-black text-xl sm:text-2xl text-ink">
            إدارة المعروض والمنتجات
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            أي قطعة تضيفها أو تغير حالتها هنا بتظهر فوراً في واجهة المتجر للزبائن.
          </p>
        </div>

        <button
          onClick={() => setIsAddProductOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-ink font-heading font-black text-sm shadow-glow-amber transition-all active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>إضافة منتج جديد</span>
        </button>
      </div>

      {/* Status filter tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'all', name: 'كل القطع', count: products.length },
          { id: 'avail', name: 'متاح للبيع', count: products.filter((p) => p.status === 'avail').length },
          { id: 'held', name: 'محجوز', count: products.filter((p) => p.status === 'held').length },
          { id: 'sold', name: 'تم البيع', count: products.filter((p) => p.status === 'sold').length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs sm:text-sm font-heading font-bold transition-all border ${
              statusFilter === tab.id
                ? 'bg-ink text-white border-ink shadow-sm'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span>{tab.name}</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] ${statusFilter === tab.id ? 'bg-amber-400 text-ink' : 'bg-slate-100'}`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Products List */}
      <div className="space-y-3">
        {filtered.map((product) => {
          const finalPrice = getFinalPrice(product);

          return (
            <div
              key={product.code}
              className="bg-white rounded-3xl p-4 sm:p-5 shadow-soft border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-slate-300 transition-all"
            >
              {/* Left Info */}
              <div className="flex items-start gap-4 flex-1">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-ink shrink-0 border border-slate-200/60 font-bold">
                  {product.img ? (
                    <img src={product.img} alt="" className="w-full h-full object-cover rounded-2xl" />
                  ) : (
                    <Package className="w-7 h-7 text-slate-600" />
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                      {product.code}
                    </span>
                    <h3 className="font-heading font-bold text-base text-ink">
                      {product.name}
                    </h3>
                    {product.isNew && (
                      <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                        جديد
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                    <span className="flex items-center gap-1 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-amber-500" />
                      فرع {product.branch}
                    </span>
                    <span>·</span>
                    <span>تكلفة الشراء: <b className="text-slate-700">{formatPrice(product.cost)} ج</b></span>
                  </div>
                </div>
              </div>

              {/* Price & State Switcher */}
              <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-0 border-slate-100">
                
                {/* Price */}
                <div className="text-right sm:text-left">
                  <div className="flex items-baseline gap-1">
                    <span className="font-heading font-black text-xl text-ink">
                      {formatPrice(finalPrice)}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">ج</span>
                  </div>
                  {finalPrice !== product.price && (
                    <span className="text-xs text-slate-400 line-through block">
                      {formatPrice(product.price)} ج
                    </span>
                  )}
                </div>

                {/* Status Switcher Segments */}
                <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-bold">
                  <button
                    onClick={() => updateProductStatus(product.code, 'avail')}
                    className={`px-3 py-1.5 rounded-xl transition-all ${
                      product.status === 'avail'
                        ? 'bg-white text-emerald-700 shadow-sm'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    متاح
                  </button>
                  <button
                    onClick={() => updateProductStatus(product.code, 'held')}
                    className={`px-3 py-1.5 rounded-xl transition-all ${
                      product.status === 'held'
                        ? 'bg-white text-amber-700 shadow-sm'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    محجوز
                  </button>
                  <button
                    onClick={() => updateProductStatus(product.code, 'sold')}
                    className={`px-3 py-1.5 rounded-xl transition-all ${
                      product.status === 'sold'
                        ? 'bg-white text-rose-700 shadow-sm'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    اتباع
                  </button>
                </div>

                {/* Delete */}
                <button
                  onClick={() => deleteProduct(product.code)}
                  title="حذف المنتج"
                  className="p-2.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}

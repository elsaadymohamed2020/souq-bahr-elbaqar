import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Coins, TrendingUp, Package, Tag, Plus, Receipt } from 'lucide-react';

export default function AdminERP() {
  const {
    invoices,
    products,
    baseFinancials,
    formatPrice,
    setIsRecordSaleOpen,
    branches,
  } = useApp();

  const [activeBranch, setActiveBranch] = useState('all');

  // Filter logic
  const inBranch = (br) => activeBranch === 'all' || br === activeBranch;

  // Filtered invoices
  const filteredInvoices = invoices.filter((i) => inBranch(i.br));

  // Sales and profit calculations
  const baseSales = baseFinancials.sales[activeBranch] || baseFinancials.sales.all;
  const baseProfit = baseFinancials.profit[activeBranch] || baseFinancials.profit.all;

  const currentNewSales = filteredInvoices.reduce((acc, i) => acc + (i.price || 0), 0);
  const currentNewProfit = filteredInvoices.reduce((acc, i) => acc + ((i.price || 0) - (i.cost || 0)), 0);

  const totalSales = baseSales + currentNewSales;
  const totalProfit = baseProfit + currentNewProfit;
  const profitMargin = Math.round((totalProfit / totalSales) * 100);

  // Stock at cost
  const stockItems = products.filter((p) => p.status !== 'sold' && inBranch(p.branch));
  const stockValuation = stockItems.reduce((acc, p) => acc + (p.cost || 0), 0);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl shadow-soft border border-slate-200/80">
        <div>
          <h1 className="font-heading font-black text-xl sm:text-2xl text-ink">
            الحسابات والمخزن (ERP)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            متابعة إيرادات المبيعات، أرباح الصفقات، وقيمة بضاعة المخزن لكل فرع.
          </p>
        </div>

        <button
          onClick={() => setIsRecordSaleOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-heading font-black text-sm shadow-md transition-all active:scale-95 shrink-0"
        >
          <Receipt className="w-4 h-4" />
          <span>تسجيل بيعة جديدة (فاتورة)</span>
        </button>
      </div>

      {/* Branch selector tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'all', name: 'كل الفروع' },
          { id: 'بحر البقر', name: 'فرع بحر البقر' },
          { id: 'الصالحية', name: 'فرع الصالحية الجديدة' },
        ].map((b) => (
          <button
            key={b.id}
            onClick={() => setActiveBranch(b.id)}
            className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-heading font-bold transition-all border ${
              activeBranch === b.id
                ? 'bg-ink text-white border-ink shadow-sm'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {b.name}
          </button>
        ))}
      </div>

      {/* Financial KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-3xl shadow-soft border border-slate-200/80 space-y-2">
          <span className="text-xs font-bold text-slate-400 block">إجمالي مبيعات الشهر</span>
          <div className="flex items-baseline gap-1">
            <span className="font-heading font-black text-2xl sm:text-3xl text-ink">
              {formatPrice(totalSales)}
            </span>
            <span className="text-xs text-slate-500 font-bold">ج</span>
          </div>
          <span className="text-[11px] text-slate-400">شامل فواتير اليوم</span>
        </div>

        <div className="bg-white p-5 rounded-3xl shadow-soft border border-slate-200/80 space-y-2">
          <span className="text-xs font-bold text-slate-400 block">صافي الربح التقديري</span>
          <div className="flex items-baseline gap-1">
            <span className="font-heading font-black text-2xl sm:text-3xl text-emerald-700">
              {formatPrice(totalProfit)}
            </span>
            <span className="text-xs text-emerald-600 font-bold">ج</span>
          </div>
          <span className="text-[11px] text-emerald-600 font-bold">هامش ربح {profitMargin}%</span>
        </div>

        <div className="bg-white p-5 rounded-3xl shadow-soft border border-slate-200/80 space-y-2">
          <span className="text-xs font-bold text-slate-400 block">قيمة بضاعة المخزن</span>
          <div className="flex items-baseline gap-1">
            <span className="font-heading font-black text-2xl sm:text-3xl text-ink">
              {formatPrice(stockValuation)}
            </span>
            <span className="text-xs text-slate-500 font-bold">ج</span>
          </div>
          <span className="text-[11px] text-slate-400">محسوبة بسعر تكلفة الشراء</span>
        </div>

        <div className="bg-white p-5 rounded-3xl shadow-soft border border-slate-200/80 space-y-2">
          <span className="text-xs font-bold text-slate-400 block">عدد القطع في المخزن</span>
          <div className="flex items-baseline gap-1">
            <span className="font-heading font-black text-2xl sm:text-3xl text-ink">
              {stockItems.length}
            </span>
            <span className="text-xs text-slate-500 font-bold">قطعة</span>
          </div>
          <span className="text-[11px] text-slate-400">متاحة ومحجوزة</span>
        </div>

      </div>

      {/* Two Columns: Recent Invoices + Stock distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Invoices List */}
        <div className="lg:col-span-8 bg-white p-6 rounded-3xl shadow-soft border border-slate-200/80">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-bold text-lg text-ink">آخر الفواتير المسجلة</h3>
            <span className="text-xs text-slate-400">مرتبة من الأحدث</span>
          </div>

          <div className="divide-y divide-slate-100">
            {filteredInvoices.map((inv) => (
              <div key={inv.n} className="py-3.5 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                      #{inv.n}
                    </span>
                    <span className="font-heading font-bold text-sm text-ink">{inv.item}</span>
                  </div>
                  <div className="text-xs text-slate-400 flex items-center gap-2">
                    <span>العميل: <b className="text-slate-600">{inv.cust}</b></span>
                    <span>·</span>
                    <span>فرع {inv.br}</span>
                    <span>·</span>
                    <span>دفع {inv.pay}</span>
                    <span>·</span>
                    <span>{inv.d}</span>
                  </div>
                </div>

                <div className="text-left shrink-0">
                  <span className="font-heading font-black text-base text-ink block">
                    {formatPrice(inv.price)} ج
                  </span>
                  <span className="text-xs font-bold text-emerald-600">
                    +{formatPrice(inv.price - inv.cost)} ربح
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stock Value by branch */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl shadow-soft border border-slate-200/80 space-y-4">
          <div>
            <h3 className="font-heading font-bold text-lg text-ink">توزيع المخزن بالفروع</h3>
            <p className="text-xs text-slate-400">قيمة القطع المتوفرة بسعر الشراء</p>
          </div>

          <div className="space-y-4 pt-2">
            {[
              {
                name: 'فرع بحر البقر',
                val: products.filter((p) => p.status !== 'sold' && p.branch === 'بحر البقر').reduce((a, b) => a + (b.cost || 0), 0),
                count: products.filter((p) => p.status !== 'sold' && p.branch === 'بحر البقر').length,
              },
              {
                name: 'فرع الصالحية',
                val: products.filter((p) => p.status !== 'sold' && p.branch === 'الصالحية').reduce((a, b) => a + (b.cost || 0), 0),
                count: products.filter((p) => p.status !== 'sold' && p.branch === 'الصالحية').length,
              },
            ].map((brItem) => (
              <div key={brItem.name} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-heading font-bold text-sm text-ink">{brItem.name}</span>
                  <span className="text-xs font-bold text-slate-500">{brItem.count} قطعة</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-slate-400">إجمالي القيمة:</span>
                  <span className="font-heading font-black text-base text-ink">
                    {formatPrice(brItem.val)} جنيه
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}

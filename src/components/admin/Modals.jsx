import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import Modal from '../common/Modal';
import {
  Camera,
  Upload,
  Sparkles,
  MessageCircle,
  Coins,
  CheckCircle2,
  Calendar,
  Phone,
  MapPin,
  Clock,
  User,
} from 'lucide-react';

export default function Modals() {
  const {
    // Add Product Modal
    isAddProductOpen,
    setIsAddProductOpen,
    addProduct,
    categories,
    branches,

    // Add Offer Modal
    isAddOfferOpen,
    setIsAddOfferOpen,
    addOffer,
    products,

    // Record Sale Modal
    isRecordSaleOpen,
    setIsRecordSaleOpen,
    recordSale,
    formatPrice,

    // Customer Detail Modal
    selectedCustomer,
    setSelectedCustomer,
    setAdminTab,
    setActiveConvId,

    // Waiting Customer Alert
    waitingCustomerAlert,
    setWaitingCustomerAlert,
    showToast,
  } = useApp();

  // State for Add Product Form
  const [productForm, setProductForm] = useState({
    name: '',
    cat: 'home',
    branch: 'الصالحية',
    price: '',
    cost: '',
    condition: 'مستورد فحص شامل وبحالة ممتازة',
    icon: 'Refrigerator',
  });

  // State for Add Offer Form
  const [offerForm, setOfferForm] = useState({
    scope: 'cat', // 'cat' | 'item' | 'all'
    target: 'ind',
    pct: 10,
    ends: '2026-11-30',
    title: '',
  });

  // State for Record Sale Form
  const availableItems = products.filter((p) => p.status !== 'sold');
  const [saleForm, setSaleForm] = useState({
    productCode: availableItems[0]?.code || '',
    custName: '',
    price: availableItems[0]?.price || '',
    payMethod: 'كاش',
  });

  // Handlers
  const handleProductSubmit = (e) => {
    e.preventDefault();
    if (!productForm.name || !productForm.price) return;
    addProduct({
      name: productForm.name,
      cat: productForm.cat,
      branch: productForm.branch,
      price: Number(productForm.price),
      cost: Number(productForm.cost) || Math.round(Number(productForm.price) * 0.7),
      condition: productForm.condition,
      icon:
        productForm.cat === 'home'
          ? 'Refrigerator'
          : productForm.cat === 'ind'
          ? 'Zap'
          : 'DoorClosed',
    });
    setProductForm({
      name: '',
      cat: 'home',
      branch: 'الصالحية',
      price: '',
      cost: '',
      condition: 'مستورد فحص شامل وبحالة ممتازة',
      icon: 'Refrigerator',
    });
    setIsAddProductOpen(false);
  };

  const handleOfferSubmit = (e) => {
    e.preventDefault();
    let title = offerForm.title;
    if (!title) {
      if (offerForm.scope === 'all') title = `خصم ${offerForm.pct}% على كل المعروض`;
      else if (offerForm.scope === 'cat') {
        const catObj = categories.find((c) => c.id === offerForm.target);
        title = `خصم ${offerForm.pct}% على ${catObj ? catObj.name : 'القسم'}`;
      } else {
        const prod = products.find((p) => p.code === offerForm.target);
        title = `خصم ${offerForm.pct}% على ${prod ? prod.name : 'القطعة'}`;
      }
    }

    addOffer({
      scope: offerForm.scope,
      target: offerForm.target,
      pct: offerForm.pct,
      ends: offerForm.ends,
      title: title,
    });
    setIsAddOfferOpen(false);
  };

  const handleSaleSubmit = (e) => {
    e.preventDefault();
    recordSale(saleForm);
    setIsRecordSaleOpen(false);
  };

  const handleOpenCustomerConvo = (convoId) => {
    setSelectedCustomer(null);
    setAdminTab('inbox');
    setActiveConvId(convoId);
  };

  return (
    <>
      {/* 1. ADD PRODUCT MODAL */}
      <Modal
        isOpen={isAddProductOpen}
        onClose={() => setIsAddProductOpen(false)}
        title="إضافة قطعة جديدة للمعروض"
      >
        <form onSubmit={handleProductSubmit} className="space-y-4">
          
          {/* Photo simulator */}
          <div className="border-2 border-dashed border-slate-200 rounded-2xl p-5 text-center bg-slate-50 hover:bg-slate-100/60 transition-colors cursor-pointer flex flex-col items-center justify-center gap-2">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-600 flex items-center justify-center">
              <Camera className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-ink block">صوّر القطعة بكاميرا الموبايل</span>
              <span className="text-[11px] text-slate-400">أو اختر صورة من معرض الصور</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">اسم القطعة والموديل</label>
            <input
              type="text"
              required
              value={productForm.name}
              onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
              placeholder="مثال: موتور مية 12 حصان Siemens أو تلاجة شارب..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all placeholder:text-slate-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">القسم</label>
              <select
                value={productForm.cat}
                onChange={(e) => setProductForm({ ...productForm, cat: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              >
                <option value="home">أجهزة منزلية</option>
                <option value="ind">معدات صناعية</option>
                <option value="wood">موبيليا وأبواب</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">الفرع المعروضة فيه</label>
              <select
                value={productForm.branch}
                onChange={(e) => setProductForm({ ...productForm, branch: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              >
                <option value="الصالحية">فرع الصالحية</option>
                <option value="بحر البقر">فرع بحر البقر</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">سعر البيع (جنيه)</label>
              <input
                type="number"
                required
                value={productForm.price}
                onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                placeholder="مثال: 9500"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                سعر التكلفة <span className="text-[10px] text-slate-400 font-normal">(لك فقط)</span>
              </label>
              <input
                type="number"
                value={productForm.cost}
                onChange={(e) => setProductForm({ ...productForm, cost: e.target.value })}
                placeholder="مثال: 6500"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">وصف الحالة والفحص</label>
            <input
              type="text"
              value={productForm.condition}
              onChange={(e) => setProductForm({ ...productForm, condition: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-ink hover:bg-slate-800 text-white font-heading font-black text-sm shadow-md transition-all active:scale-95 mt-2"
          >
            نشر القطعة فوراً على الموقع
          </button>
        </form>
      </Modal>

      {/* 2. ADD OFFER MODAL */}
      <Modal
        isOpen={isAddOfferOpen}
        onClose={() => setIsAddOfferOpen(false)}
        title="إنشاء عرض ترويجي جديد"
      >
        <form onSubmit={handleOfferSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">نطاق الخصم</label>
            <select
              value={offerForm.scope}
              onChange={(e) => setOfferForm({ ...offerForm, scope: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            >
              <option value="cat">قسم كامل (مثال: كل المعدات الصناعية)</option>
              <option value="item">قطعة واحدة معينة</option>
              <option value="all">كل المعروض في المعرض</option>
            </select>
          </div>

          {offerForm.scope === 'cat' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">اختر القسم</label>
              <select
                value={offerForm.target}
                onChange={(e) => setOfferForm({ ...offerForm, target: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none"
              >
                <option value="home">أجهزة منزلية</option>
                <option value="ind">معدات صناعية</option>
                <option value="wood">موبيليا وأبواب</option>
              </select>
            </div>
          )}

          {offerForm.scope === 'item' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">اختر القطعة</label>
              <select
                value={offerForm.target}
                onChange={(e) => setOfferForm({ ...offerForm, target: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none"
              >
                {products.filter((p) => p.status !== 'sold').map((p) => (
                  <option key={p.code} value={p.code}>
                    {p.name} ({p.code})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">نسبة الخصم</label>
            <div className="grid grid-cols-5 gap-2">
              {[5, 10, 15, 20, 25].map((pct) => (
                <button
                  type="button"
                  key={pct}
                  onClick={() => setOfferForm({ ...offerForm, pct })}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                    offerForm.pct === pct
                      ? 'bg-ink text-white border-ink shadow-sm'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {pct}%
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">ساري حتى تاريخ</label>
            <input
              type="date"
              value={offerForm.ends}
              onChange={(e) => setOfferForm({ ...offerForm, ends: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-ink font-heading font-black text-sm shadow-glow-amber transition-all active:scale-95 mt-2"
          >
            تفعيل العرض فوراً
          </button>
        </form>
      </Modal>

      {/* 3. RECORD SALE (INVOICE) MODAL */}
      <Modal
        isOpen={isRecordSaleOpen}
        onClose={() => setIsRecordSaleOpen(false)}
        title="تسجيل عملية بيع جديدة (إصدار فاتورة)"
      >
        <form onSubmit={handleSaleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">القطعة المباعة</label>
            <select
              value={saleForm.productCode}
              onChange={(e) => {
                const selectedCode = e.target.value;
                const prod = products.find((p) => p.code === selectedCode);
                setSaleForm({
                  ...saleForm,
                  productCode: selectedCode,
                  price: prod ? prod.price : '',
                });
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            >
              {availableItems.map((p) => (
                <option key={p.code} value={p.code}>
                  {p.name} ({p.code}) — {formatPrice(p.price)} ج
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">اسم العميل المشتري</label>
            <input
              type="text"
              required
              value={saleForm.custName}
              onChange={(e) => setSaleForm({ ...saleForm, custName: e.target.value })}
              placeholder="مثال: الحاج إبراهيم الشرقاوي"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">السعر الفعلي للبيع (جنيه)</label>
              <input
                type="number"
                required
                value={saleForm.price}
                onChange={(e) => setSaleForm({ ...saleForm, price: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">طريقة الدفع</label>
              <select
                value={saleForm.payMethod}
                onChange={(e) => setSaleForm({ ...saleForm, payMethod: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none"
              >
                <option value="كاش">كاش في المعرض</option>
                <option value="تحويل">تحويل بنكي / فودافون كاش</option>
                <option value="تقسيط">تقسيط مباشر</option>
              </select>
            </div>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed bg-amber-50 p-3 rounded-xl border border-amber-200 text-amber-900">
            💡 بمجرد حفظ الفاتورة، ستتحول حالة القطعة تلقائياً إلى «تم البيع» على واجهة المتجر ولن يتمكن زبون آخر من حجزها.
          </p>

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-heading font-black text-sm shadow-md transition-all active:scale-95"
          >
            تأكيد البيع وإصدار الفاتورة
          </button>
        </form>
      </Modal>

      {/* 4. CUSTOMER DETAILS MODAL */}
      <Modal
        isOpen={Boolean(selectedCustomer)}
        onClose={() => setSelectedCustomer(null)}
        title={selectedCustomer?.name || 'تفاصيل العميل'}
      >
        {selectedCustomer && (
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-ink text-white font-heading font-black text-lg flex items-center justify-center">
                  {selectedCustomer.avatar}
                </div>
                <div>
                  <h4 className="font-heading font-bold text-lg text-ink">
                    {selectedCustomer.name}
                  </h4>
                  <span className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-500" />
                    {selectedCustomer.gov}
                  </span>
                </div>
              </div>

              {selectedCustomer.spent > 0 && (
                <div className="text-left">
                  <span className="text-[11px] text-slate-400 block">إجمالي المشتريات</span>
                  <span className="font-heading font-black text-base text-emerald-700">
                    {formatPrice(selectedCustomer.spent)} ج
                  </span>
                </div>
              )}
            </div>

            {/* Interaction Timeline */}
            <div>
              <span className="font-heading font-bold text-xs text-slate-500 uppercase tracking-wider block mb-3">
                سجل التعاملات والمحادثات
              </span>
              <div className="space-y-2 border-r-2 border-slate-200 pr-3 mr-2">
                {selectedCustomer.tl?.map(([event, date], i) => (
                  <div key={i} className="relative space-y-0.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500 absolute -right-[19px] top-1.5 ring-4 ring-white" />
                    <p className="text-sm font-semibold text-slate-800">{event}</p>
                    <span className="text-xs text-slate-400">{date}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="pt-3 border-t border-slate-100 flex items-center gap-3">
              {selectedCustomer.convo && (
                <button
                  onClick={() => handleOpenCustomerConvo(selectedCustomer.convo)}
                  className="flex-1 py-3 rounded-2xl bg-ink hover:bg-slate-800 text-white font-heading font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-400" />
                  <span>فتح المحادثة بالصندوق</span>
                </button>
              )}

              {selectedCustomer.phone && (
                <a
                  href={`tel:${selectedCustomer.phone}`}
                  className="px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-ink font-heading font-bold text-xs flex items-center gap-1.5"
                >
                  <Phone className="w-4 h-4 text-slate-600" />
                  <span>اتصال</span>
                </a>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* 5. KILLER DEMO MOMENT: WAITING CUSTOMER ALERT MODAL */}
      <Modal
        isOpen={Boolean(waitingCustomerAlert)}
        onClose={() => setWaitingCustomerAlert(null)}
        title="🔔 بشرى سارة! عملاء ينتظرون هذه القطعة"
      >
        {waitingCustomerAlert && (
          <div className="space-y-4">
            <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200/80 text-amber-900 text-xs sm:text-sm leading-relaxed">
              <span className="font-bold block mb-1">
                القطعة المضافة: «{waitingCustomerAlert.product.name}»
              </span>
              تم العثور على عملاء مسجلين سابقاً في قائمة الانتظار كانوا يستفسرون عن نفس هذا النوع:
            </div>

            <div className="space-y-2">
              {waitingCustomerAlert.matchedCustomers.map((cust) => (
                <div
                  key={cust.id}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-ink text-white font-heading font-black text-sm flex items-center justify-center">
                      {cust.avatar}
                    </div>
                    <div>
                      <h5 className="font-heading font-bold text-sm text-ink">{cust.name}</h5>
                      <p className="text-xs text-slate-500">{cust.want} · {cust.gov}</p>
                    </div>
                  </div>

                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-lg">
                    جاهز للشراء
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                setWaitingCustomerAlert(null);
                showToast('تم إرسال إشعار للعميل عبر الواتساب بتوفر القطعة!');
              }}
              className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-heading font-black text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>إرسال إشعار للعميل فوراً على الواتساب</span>
            </button>
          </div>
        )}
      </Modal>
    </>
  );
}

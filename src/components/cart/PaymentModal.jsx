import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  CreditCard,
  Wallet,
  Banknote,
  Calendar,
  CheckCircle2,
  Copy,
  Check,
  ShieldCheck,
  Truck,
  Building2,
  Phone,
  User,
  MapPin,
  X,
  Sparkles,
  ArrowRight,
  ExternalLink,
  MessageCircle,
  FileText,
  Lock,
} from 'lucide-react';

export default function PaymentModal() {
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    cartItems,
    cartCount,
    cartTotal,
    formatPrice,
    processPayment,
    setViewMode,
    setAdminTab,
    showToast,
  } = useApp();

  // Form State
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    deliveryMethod: 'pickup', // 'pickup' | 'delivery'
    branch: 'الصالحية',
    address: '',
    notes: '',
  });

  // Payment Method: 'wallet' | 'card' | 'cod' | 'installments'
  const [paymentMethod, setPaymentMethod] = useState('wallet');

  // Wallet / InstaPay state
  const [walletSenderPhone, setWalletSenderPhone] = useState('');
  const [isCopiedWallet, setIsCopiedWallet] = useState(false);
  const [isCopiedInsta, setIsCopiedInsta] = useState(false);

  // Card state
  const [cardData, setCardData] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: '',
  });

  // Installments state
  const [installmentMonths, setInstallmentMonths] = useState(6);

  // Flow states
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);

  if (!isCheckoutOpen) return null;

  const handleCopy = (text, type) => {
    navigator.clipboard?.writeText(text);
    if (type === 'wallet') {
      setIsCopiedWallet(true);
      setTimeout(() => setIsCopiedWallet(false), 2000);
    } else {
      setIsCopiedInsta(true);
      setTimeout(() => setIsCopiedInsta(false), 2000);
    }
    showToast('تم نسخ الرقم بنجاح');
  };

  const handleFillDemoCard = () => {
    setCardData({
      number: '4242 •••• •••• 4242',
      name: formData.customerName || 'محمد عبد الرحمن',
      expiry: '12/28',
      cvv: '884',
    });
    showToast('تم تعبئة بيانات بطاقة تجريبية للديمو');
  };

  const handleFillDemoWallet = () => {
    setWalletSenderPhone('010' + Math.floor(10000000 + Math.random() * 90000000));
    showToast('تمت محاكاة رقم تحويل ناجح فوري!');
  };

  const handleClose = () => {
    setIsCheckoutOpen(false);
    setCompletedOrder(null);
    setIsProcessing(false);
  };

  const handleSubmitPayment = (e) => {
    e.preventDefault();

    if (!formData.customerName.trim()) {
      showToast('يرجى كتابة اسم المستلم / العميل', 'error');
      return;
    }
    if (!formData.phone.trim()) {
      showToast('يرجى إدخال رقم الموبايل للتواصل وتأكيد الطلب', 'error');
      return;
    }

    setIsProcessing(true);

    // Simulate realistic payment gateway authorization
    setTimeout(() => {
      let methodLabel = 'محفظة إلكترونية / انستاباي';
      let transferRef = walletSenderPhone ? `تحويل من ${walletSenderPhone}` : 'تحويل فوري مؤكد';

      if (paymentMethod === 'card') {
        methodLabel = 'بطاقة بنكية (فيزا/ماستركارد)';
        transferRef = `بطاقة تنتهي بـ ${cardData.number.slice(-4) || '4242'}`;
      } else if (paymentMethod === 'cod') {
        methodLabel = 'دفع كاش عند الاستلام والمعاينة';
        transferRef = 'سداد عند الاستلام';
      } else if (paymentMethod === 'installments') {
        methodLabel = `تقسيط ميسر (${installmentMonths} شهور)`;
        transferRef = `قسط شهري: ${formatPrice(Math.round(cartTotal / installmentMonths))} ج`;
      }

      const order = processPayment({
        customerName: formData.customerName,
        phone: formData.phone,
        deliveryMethod: formData.deliveryMethod === 'pickup' ? `استلام من فرع ${formData.branch}` : 'توصيل للمنزل مع تركيب',
        address: formData.deliveryMethod === 'delivery' ? formData.address : `فرع ${formData.branch}`,
        paymentMethod: methodLabel,
        notes: formData.notes,
        installmentMonths: paymentMethod === 'installments' ? installmentMonths : null,
        transferRef,
      });

      setIsProcessing(false);
      setCompletedOrder(order);
    }, 1200);
  };

  // WhatsApp link for completed order
  const getSuccessWhatsAppLink = () => {
    if (!completedOrder) return '';
    const text = `السلام عليكم، تم سداد طلبي رقم (${completedOrder.orderId}) من موقع سوق بحر البقر الكبير.\nالمبلغ الإجمالي: ${formatPrice(completedOrder.total)} جنيه.\nالاسم: ${completedOrder.customerName}\nطريقة الاستلام: ${completedOrder.deliveryMethod}\nطريقة الدفع: ${completedOrder.paymentMethod}\nيرجى تأكيد تجهيز الأجهزة.`;
    return `https://wa.me/201034052401?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 flex items-center justify-center bg-ink/70 backdrop-blur-sm animate-in fade-in duration-200">
      
      {/* Container */}
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8">
        
        {/* Top Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-black text-lg sm:text-xl text-ink">
                {completedOrder ? 'تم تأكيد الدفع والطلب بنجاح 🎉' : 'إتمام الشراء والدفع الآمن'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {completedOrder ? 'شكراً لثقتكم بسوق بحر البقر الكبير' : 'سوق بحr البقر الكبير · بوابة الدفع والحجز الرسمية'}
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {completedOrder ? (
            /* ================= Success State ================= */
            <div className="text-center py-4 space-y-6">
              
              <div className="w-20 h-20 mx-auto rounded-3xl bg-emerald-100 border border-emerald-300 text-emerald-600 flex items-center justify-center shadow-soft">
                <CheckCircle2 className="w-10 h-10 animate-bounce" />
              </div>

              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>دفع مؤكد وفاتورة مسجلة</span>
                </div>
                <h4 className="font-heading font-black text-2xl text-ink">
                  تم استلام طلبك ودفع الفاتورة بنجاح!
                </h4>
                <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                  تم تسجيل الفاتورة في نظام الحسابات (ERP) وتحديث حالة القطع في المعرض إلى "تم البيع" تلقائياً.
                </p>
              </div>

              {/* Order Details Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80 text-right space-y-3 max-w-lg mx-auto">
                <div className="flex justify-between items-center pb-3 border-b border-slate-200 text-xs sm:text-sm">
                  <span className="text-slate-500 font-medium">رقم الطلب:</span>
                  <span className="font-mono font-bold text-ink">{completedOrder.orderId}</span>
                </div>
                <div className="flex justify-between items-center text-xs sm:text-sm">
                  <span className="text-slate-500 font-medium">اسم العميل:</span>
                  <span className="font-bold text-ink">{completedOrder.customerName}</span>
                </div>
                <div className="flex justify-between items-center text-xs sm:text-sm">
                  <span className="text-slate-500 font-medium">طريقة الدفع:</span>
                  <span className="font-bold text-emerald-700">{completedOrder.paymentMethod}</span>
                </div>
                <div className="flex justify-between items-center text-xs sm:text-sm">
                  <span className="text-slate-500 font-medium">طريقة التسليم:</span>
                  <span className="font-semibold text-slate-700">{completedOrder.deliveryMethod}</span>
                </div>
                <div className="flex justify-between items-center text-xs sm:text-sm">
                  <span className="text-slate-500 font-medium">أرقام الفواتير الصادرة:</span>
                  <div className="flex gap-1.5 font-mono text-xs font-bold text-amber-700">
                    {completedOrder.invoices.map((inv) => (
                      <span key={inv} className="bg-amber-100 px-2 py-0.5 rounded">
                        #{inv}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
                  <span className="font-heading font-black text-sm text-ink">المبلغ الإجمالي المسدد:</span>
                  <div className="flex items-baseline gap-1 text-ink font-heading font-black text-xl">
                    <span>{formatPrice(completedOrder.total)}</span>
                    <span className="text-xs font-semibold text-slate-500">جنيه</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto pt-2">
                <a
                  href={getSuccessWhatsAppLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-heading font-bold text-sm shadow-sm transition-all"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-200" />
                  <span>إرسال الفاتورة على واتساب</span>
                </a>

                <button
                  onClick={() => {
                    handleClose();
                    setViewMode('admin');
                    setAdminTab('erp');
                  }}
                  className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-ink hover:bg-slate-800 text-white font-heading font-bold text-sm shadow-sm transition-all"
                >
                  <FileText className="w-4 h-4 text-amber-400" />
                  <span>مشاهدة الفاتورة في الإدارة (ERP)</span>
                </button>
              </div>

              <div>
                <button
                  onClick={handleClose}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800 underline transition-colors"
                >
                  متابعة تصفح المعروض
                </button>
              </div>

            </div>
          ) : (
            /* ================= Checkout Form ================= */
            <form onSubmit={handleSubmitPayment} className="space-y-6">
              
              {/* Items Mini Summary */}
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-amber-900 block">
                    الطلبية الحالية ({cartCount} قطع):
                  </span>
                  <span className="text-xs text-amber-700 line-clamp-1 mt-0.5">
                    {cartItems.map((ci) => ci.product.name).join(' · ')}
                  </span>
                </div>
                <div className="flex items-baseline gap-1 font-heading font-black text-lg text-ink shrink-0 mr-2">
                  <span>{formatPrice(cartTotal)}</span>
                  <span className="text-xs font-semibold text-slate-600">جنيه</span>
                </div>
              </div>

              {/* Step 1: Customer details */}
              <div className="space-y-3.5">
                <h4 className="font-heading font-black text-sm text-ink flex items-center gap-2">
                  <User className="w-4 h-4 text-amber-500" />
                  <span>1. بيانات المستلم والتوصيل</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      الاسم بالكامل *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: الحاج عادل الشرقاوي"
                      value={formData.customerName}
                      onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      رقم الموبايل / واتساب *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="010XXXXXXXX"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 text-sm"
                    />
                  </div>
                </div>

                {/* Delivery options */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, deliveryMethod: 'pickup' })}
                    className={`p-3 rounded-2xl border text-right transition-all flex flex-col gap-1 ${
                      formData.deliveryMethod === 'pickup'
                        ? 'border-amber-500 bg-amber-50/40 text-ink ring-2 ring-amber-400/20'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">معاينة واستلام بالفرع</span>
                      <Building2 className="w-4 h-4 text-amber-500" />
                    </div>
                    <span className="text-[11px] text-slate-500">مجاناً · فرع الصالحية أو بحر البقر</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, deliveryMethod: 'delivery' })}
                    className={`p-3 rounded-2xl border text-right transition-all flex flex-col gap-1 ${
                      formData.deliveryMethod === 'delivery'
                        ? 'border-amber-500 bg-amber-50/40 text-ink ring-2 ring-amber-400/20'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">توصيل منزلي</span>
                      <Truck className="w-4 h-4 text-brand-blue" />
                    </div>
                    <span className="text-[11px] text-slate-500">شحن سريع مع الفحص والتشغيل</span>
                  </button>
                </div>

                {formData.deliveryMethod === 'pickup' ? (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      اختر الفرع للاستلام
                    </label>
                    <select
                      value={formData.branch}
                      onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 text-sm bg-white"
                    >
                      <option value="الصالحية">فرع الصالحية الجديدة (طريق الموقف العمومي)</option>
                      <option value="بحر البقر">فرع بحر البقر القديمة (بجوار كوبري السوق)</option>
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      عنوان التوصيل بالتفصيل *
                    </label>
                    <input
                      type="text"
                      placeholder="المدينة / المركز / القرية واسم الشارع أو علامة مميزة"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 text-sm"
                    />
                  </div>
                )}
              </div>

              {/* Step 2: Payment Methods */}
              <div className="space-y-3.5 pt-2 border-t border-slate-100">
                <h4 className="font-heading font-black text-sm text-ink flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-amber-500" />
                  <span>2. وسيلة الدفع</span>
                </h4>

                {/* Method selector tabs */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('wallet')}
                    className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                      paymentMethod === 'wallet'
                        ? 'border-amber-500 bg-amber-50 text-ink ring-2 ring-amber-400/30 font-bold'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    <Wallet className="w-5 h-5 text-amber-600" />
                    <span className="text-xs">انستاباي / كاش</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                      paymentMethod === 'card'
                        ? 'border-amber-500 bg-amber-50 text-ink ring-2 ring-amber-400/30 font-bold'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 text-brand-blue" />
                    <span className="text-xs">فيزا / ماستركارد</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cod')}
                    className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                      paymentMethod === 'cod'
                        ? 'border-amber-500 bg-amber-50 text-ink ring-2 ring-amber-400/30 font-bold'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    <Banknote className="w-5 h-5 text-emerald-600" />
                    <span className="text-xs">كاش بالمعرض</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('installments')}
                    className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                      paymentMethod === 'installments'
                        ? 'border-amber-500 bg-amber-50 text-ink ring-2 ring-amber-400/30 font-bold'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    <Calendar className="w-5 h-5 text-purple-600" />
                    <span className="text-xs">تقسيط ميسر</span>
                  </button>
                </div>

                {/* Method Specific Panels */}
                {paymentMethod === 'wallet' && (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3.5">
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-slate-700 block">
                        بيانات التحويل المباشر:
                      </span>
                      
                      {/* Vodafone Cash */}
                      <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                        <div>
                          <span className="text-[11px] text-slate-400 block">فودافون كاش / أورنج / وي:</span>
                          <span className="font-mono font-bold text-sm text-ink">010 3405 2401</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopy('01034052401', 'wallet')}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors"
                        >
                          {isCopiedWallet ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{isCopiedWallet ? 'تم النسخ' : 'نسخ'}</span>
                        </button>
                      </div>

                      {/* InstaPay */}
                      <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                        <div>
                          <span className="text-[11px] text-slate-400 block">معرّف انستاباي (InstaPay IPA):</span>
                          <span className="font-mono font-bold text-sm text-brand-blue">souq-bahr-elbaqar@instapay</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopy('souq-bahr-elbaqar@instapay', 'insta')}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors"
                        >
                          {isCopiedInsta ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{isCopiedInsta ? 'تم النسخ' : 'نسخ'}</span>
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="رقم المحفظة التي قمت بالتحويل منها (اختياري للديمو)"
                        value={walletSenderPhone}
                        onChange={(e) => setWalletSenderPhone(e.target.value)}
                        className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-amber-500"
                      />
                      <button
                        type="button"
                        onClick={handleFillDemoWallet}
                        className="px-3 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-800 text-xs font-bold transition-colors whitespace-nowrap"
                      >
                        ⚡ محاكاة تحويل فوري
                      </button>
                    </div>
                  </div>
                )}

                {paymentMethod === 'card' && (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                    {/* Visual Credit Card Preview */}
                    <div className="w-full max-w-sm mx-auto h-40 rounded-2xl bg-gradient-to-tr from-ink-950 via-ink-800 to-slate-800 text-white p-4 flex flex-col justify-between shadow-xl relative overflow-hidden border border-slate-700">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl" />
                      <div className="flex justify-between items-start">
                        <span className="text-[11px] font-heading font-black tracking-widest text-amber-400">
                          سوق بحر البقر الكبير
                        </span>
                        <div className="flex items-center gap-1">
                          <div className="w-6 h-6 rounded-full bg-rose-500/80" />
                          <div className="w-6 h-6 rounded-full bg-amber-500/80 -mr-3" />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-400">رقم البطاقة</span>
                        <div className="font-mono text-base tracking-widest font-bold">
                          {cardData.number || '•••• •••• •••• ••••'}
                        </div>
                      </div>

                      <div className="flex justify-between items-end text-[11px]">
                        <div>
                          <span className="text-[9px] text-slate-400 block">اسم صاحب البطاقة</span>
                          <span className="font-semibold uppercase tracking-wider">
                            {cardData.name || 'الاسم على البطاقة'}
                          </span>
                        </div>
                        <div className="text-left">
                          <span className="text-[9px] text-slate-400 block">صالحة حتى</span>
                          <span className="font-mono font-semibold">{cardData.expiry || 'MM/YY'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Inputs */}
                    <div className="space-y-2.5">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-700">بيانات البطاقة:</span>
                        <button
                          type="button"
                          onClick={handleFillDemoCard}
                          className="text-xs font-bold text-amber-700 hover:text-amber-800 underline"
                        >
                          ⚡ ملء بيانات تجريبية للديمو
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <input
                          type="text"
                          placeholder="رقم البطاقة (16 رقم)"
                          value={cardData.number}
                          onChange={(e) => setCardData({ ...cardData, number: e.target.value })}
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-amber-500 font-mono"
                        />
                        <input
                          type="text"
                          placeholder="الاسم المطبوع على البطاقة"
                          value={cardData.name}
                          onChange={(e) => setCardData({ ...cardData, name: e.target.value })}
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-amber-500"
                        />
                        <input
                          type="text"
                          placeholder="تاريخ الانتهاء (MM/YY)"
                          value={cardData.expiry}
                          onChange={(e) => setCardData({ ...cardData, expiry: e.target.value })}
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-amber-500 font-mono"
                        />
                        <input
                          type="password"
                          maxLength={3}
                          placeholder="رمز الأمان (CVV)"
                          value={cardData.cvv}
                          onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-amber-500 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'cod' && (
                  <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-2">
                    <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>دفع نقدي آمن 100% بعد المعاينة الفعلية</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      لا تدفع أي مبالغ الآن! تعال عاين الأجهزة بنفسك في الفرع أو انتظر وصول مندوب التوصيل، افحص الموتور والجسم الخارجي وشغل الجهاز، ثم ادفع كاش واستلم فاتورتك وشهادة الضمان.
                    </p>
                  </div>
                )}

                {paymentMethod === 'installments' && (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <span className="text-xs font-bold text-slate-700 block">
                      اختر مدة التقسيط بدون فوائد:
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      {[6, 12, 24].map((months) => {
                        const monthlyRate = Math.round(cartTotal / months);
                        return (
                          <button
                            key={months}
                            type="button"
                            onClick={() => setInstallmentMonths(months)}
                            className={`p-3 rounded-xl border text-center transition-all ${
                              installmentMonths === months
                                ? 'border-purple-600 bg-purple-50 text-purple-900 ring-2 ring-purple-400/30 font-bold'
                                : 'border-slate-200 hover:border-slate-300 text-slate-600'
                            }`}
                          >
                            <span className="block text-xs font-black">{months} شهور</span>
                            <span className="block text-[11px] text-purple-700 mt-1 font-bold">
                              {formatPrice(monthlyRate)} ج/شهر
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-[11px] text-slate-500 text-center">
                      متاح عبر كروت المشتريات البنكية (البنك الأهلي، مصر، CIB) وفاليو وأمان وسوق كاش.
                    </p>
                  </div>
                )}
              </div>

              {/* Submit CTA */}
              <div className="pt-3 border-t border-slate-100 space-y-3">
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-ink hover:bg-slate-800 text-white font-heading font-black text-base shadow-soft transition-all active:scale-98 disabled:opacity-75 disabled:cursor-wait"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                      <span>جاري معالجة الدفع الآمن وإصدار الفاتورة...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 text-amber-400" />
                      <span>
                        تأكيد الدفع والطلب · {formatPrice(cartTotal)} جنيه
                      </span>
                    </>
                  )}
                </button>

                <p className="text-[11px] text-center text-slate-400">
                  🔒 بياناتك مشفرة ومحمية بمعايير الأمان البنكية · يتم ربط الفاتورة فورياً بنظام ERP
                </p>
              </div>

            </form>
          )}
        </div>

      </div>
    </div>
  );
}

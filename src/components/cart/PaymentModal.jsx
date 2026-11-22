import React, { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  BadgeCheck,
  CalendarRange,
  Check,
  CheckCircle2,
  CreditCard,
  FileText,
  Info,
  Lock,
  Pencil,
  ShieldCheck,
  ShoppingCart,
  Store,
  Truck,
  User,
  Wallet,
  Wand2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import Modal from '../common/Modal';
import { WhatsAppIcon } from '../common/BrandIcons';
import { Badge, Button, EmptyState, Field, LabeledInput, SegmentedControl, Select, Textarea } from '../ui';
import { scrollToId, useMediaQuery } from '../../lib/hooks';
import { cn } from '../../lib/cn';
import { CardPreview, CopyButton, CopyRow, OrderSummary, Pieces, RadioMark, Stepper, SummaryToggle } from './CheckoutParts';
import {
  cardBrand,
  cardNumberError,
  cartOriginalTotal,
  cartShippingSize,
  cvvError,
  demoExpiry,
  digitsOnly,
  expiryError,
  formatCardNumber,
  formatExpiry,
  formatPhone,
  isEgyptMobile,
  monthsWord,
  normalizePhone,
  phoneError,
  randomDigits,
  shippingRange,
  shortZoneName,
} from './checkoutUtils';

const EASE = [0.16, 1, 0.3, 1];
const PROCESSING_MS = 1200;

const STEPS = [
  { id: 'info', label: 'البيانات' },
  { id: 'pay', label: 'الدفع' },
  { id: 'review', label: 'التأكيد' },
];

// `erp` is the short label stored on the invoices, so the ERP table shows the matching icon.
const METHODS = [
  { id: 'wallet', label: 'محفظة إلكترونية', desc: 'فودافون كاش أو إنستاباي', icon: Wallet, erp: 'تحويل' },
  { id: 'card', label: 'فيزا وميزة', desc: 'أي كارت بنكي', icon: CreditCard, erp: 'كارت' },
  { id: 'cod', label: 'الدفع عند الاستلام', desc: 'كاش بعد ما تعاين', icon: Banknote, erp: 'كاش' },
  { id: 'installments', label: 'تقسيط', desc: 'من 6 لـ 18 شهر', icon: CalendarRange, erp: 'تقسيط' },
];
const MONTHS = [6, 12, 18];

const STEP_FIELDS = [
  ['customerName', 'phone', 'branch', 'zone', 'address'],
  ['walletNumber', 'cardNumber', 'cardName', 'cardExpiry', 'cardCvv'],
  [],
];

const EMPTY_INFO = { customerName: '', phone: '', deliveryMethod: 'pickup', branch: '', zone: '', address: '', notes: '' };
const EMPTY_PAY = { method: 'wallet', walletNumber: '', transferRef: '', cardNumber: '', cardName: '', cardExpiry: '', cardCvv: '', months: 12 };

function validate(info, pay) {
  const e = {};
  const name = info.customerName.trim();
  if (!name) e.customerName = 'اكتب اسمك عشان الفاتورة تطلع باسمك';
  else if (name.length < 3) e.customerName = 'اكتب الاسم كامل';
  const pe = phoneError(info.phone);
  if (pe) e.phone = pe;
  if (info.deliveryMethod === 'pickup' && !info.branch) e.branch = 'اختار الفرع اللي هتستلم منه';
  if (info.deliveryMethod === 'delivery') {
    if (!info.zone) e.zone = 'اختار المحافظة';
    const addr = info.address.trim();
    if (!addr) e.address = 'اكتب العنوان';
    else if (addr.length < 10) e.address = 'زوّد التفاصيل شوية عشان المندوب يوصلك';
  }

  if (pay.method === 'wallet') {
    const we = phoneError(pay.walletNumber, { emptyMessage: 'اكتب رقم المحفظة اللي هتحوّل منها' });
    if (we) e.walletNumber = we;
  }
  if (pay.method === 'card') {
    const ne = cardNumberError(pay.cardNumber);
    if (ne) e.cardNumber = ne;
    if (pay.cardName.trim().length < 3) e.cardName = 'اكتب الاسم زي ما هو على الكارت';
    const xe = expiryError(pay.cardExpiry);
    if (xe) e.cardExpiry = xe;
    const ce = cvvError(pay.cardCvv);
    if (ce) e.cardCvv = ce;
  }
  return e;
}

/** Step title that takes focus when the step changes, so screen readers announce it. */
function StepHeading({ title, subtitle, focusRef }) {
  const ref = useRef(null);
  useEffect(() => {
    if (focusRef.current) {
      focusRef.current = false;
      ref.current?.focus({ preventScroll: true });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="mb-4">
      <h3 ref={ref} tabIndex={-1} className="font-heading text-lg font-black text-fg outline-none">
        {title}
      </h3>
      {subtitle ? <p className="mt-0.5 text-xs text-fg-muted sm:text-sm">{subtitle}</p> : null}
    </div>
  );
}

function ReviewBlock({ icon: Icon, title, onEdit, children }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-line bg-surface p-3 sm:p-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-fg-muted">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1 text-sm">
        <p className="text-[11px] font-bold text-fg-subtle">{title}</p>
        <div className="mt-0.5 space-y-0.5 text-fg">{children}</div>
      </div>
      <Button variant="ghost" size="sm" className="-my-1 h-10 shrink-0 px-2.5" onClick={onEdit} aria-label={`تعديل ${title}`}>
        <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
        تعديل
      </Button>
    </div>
  );
}

export default function PaymentModal() {
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    setIsCartOpen,
    cartItems,
    cartCount,
    cartTotal,
    formatPrice,
    processPayment,
    setViewMode,
    setAdminTab,
    viewMode,
    branches,
    shippingZones,
    officialNumbers,
    getGeneralWhatsAppLink,
  } = useApp();
  const reduce = useReducedMotion();
  const isPhone = useMediaQuery('(max-width: 639px)');
  const uid = useId();
  const formId = `${uid}-form`;
  const ids = {
    zone: `${uid}-zone`,
    address: `${uid}-address`,
    notes: `${uid}-notes`,
    summary: `${uid}-summary`,
  };

  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [info, setInfo] = useState(EMPTY_INFO);
  const [pay, setPay] = useState(EMPTY_PAY);
  const [touched, setTouched] = useState({});
  const [attempted, setAttempted] = useState({});
  const [attemptTick, setAttemptTick] = useState(0);
  const [phase, setPhase] = useState(null); // null | 'auth' | 'invoice'
  const [completed, setCompleted] = useState(null);

  const formRef = useRef(null);
  const focusHeadingRef = useRef(false);
  const timers = useRef([]);

  // Fresh start every time the checkout opens: step 1, no errors, no old receipt.
  useLayoutEffect(() => {
    if (!isCheckoutOpen) return;
    const names = branches.map((b) => b.locationName);
    const fromCart = cartItems.map((i) => i.product.branch).find((b) => names.includes(b));
    const fallback = branches.find((b) => b.featured)?.locationName || names[0] || '';
    setStep(0);
    setDir(1);
    setTouched({});
    setAttempted({});
    setPhase(null);
    setCompleted(null);
    setInfo((prev) => ({ ...prev, branch: names.includes(prev.branch) ? prev.branch : fromCart || fallback }));
  }, [isCheckoutOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // If something else closes the checkout mid-payment (the guided tour does), cancel the fake payment.
  useEffect(() => {
    if (isCheckoutOpen) return undefined;
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setPhase(null);
    return undefined;
  }, [isCheckoutOpen]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  // After a blocked "next", bring the first broken field into view.
  useEffect(() => {
    if (!attemptTick) return;
    const el = formRef.current?.querySelector('[aria-invalid="true"]');
    if (el) {
      el.scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' });
      el.focus({ preventScroll: true });
    }
  }, [attemptTick]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ---------------- Derived ---------------- */
  const errors = validate(info, pay);
  const stepValid = (i) => !STEP_FIELDS[i].some((k) => errors[k]);
  const err = (k, i) => (touched[k] || attempted[i] ? errors[k] : undefined);

  const method = METHODS.find((m) => m.id === pay.method) || METHODS[0];
  const pickup = info.deliveryMethod === 'pickup';
  const branch = branches.find((b) => b.locationName === info.branch);
  const zone = shippingZones.find((z) => z.id === info.zone) || null;
  const ship = pickup ? null : shippingRange(zone, cartShippingSize(cartItems));
  const savings = Math.max(0, cartOriginalTotal(cartItems) - cartTotal);
  const monthly = Math.ceil(cartTotal / (pay.months || 1));
  const cartBranches = [...new Set(cartItems.map((i) => i.product.branch).filter(Boolean))];
  const mainNumber = officialNumbers?.find((n) => n.isMain) || officialNumbers?.[0];
  const last4 = digitsOnly(pay.cardNumber).slice(-4);

  const shippingNode = pickup ? (
    'مجاناً من الفرع'
  ) : ship ? (
    <span className="num">
      {formatPrice(ship.lo)} لـ {formatPrice(ship.hi)} ج
    </span>
  ) : (
    <span className="font-semibold text-fg-subtle">حسب المحافظة</span>
  );
  const totalNote =
    pay.method === 'cod'
      ? 'هتدفعه كاش عند الاستلام'
      : pay.method === 'installments'
      ? `على ${pay.months} ${monthsWord(pay.months)}، ${formatPrice(monthly)} ج في الشهر`
      : !pickup && ship
      ? 'الشحن بتدفعه لما الطلب يوصلك'
      : null;

  const methodDetail = () => {
    if (pay.method === 'wallet') return `من ${formatPhone(pay.walletNumber)}${pay.transferRef ? ` · عملية ${pay.transferRef}` : ''}`;
    if (pay.method === 'card') return `كارت ${cardBrand(pay.cardNumber)?.label || ''} ينتهي بـ ${last4}`.replace('  ', ' ');
    if (pay.method === 'cod') return pickup ? 'كاش في الفرع بعد المعاينة' : 'كاش للمندوب بعد المعاينة';
    return `${pay.months} ${monthsWord(pay.months)} × ${formatPrice(monthly)} ج`;
  };

  /* ---------------- Actions ---------------- */
  const setInfoField = (k, v) => setInfo((p) => ({ ...p, [k]: v }));
  const setPayField = (k, v) => setPay((p) => ({ ...p, [k]: v }));
  const touch = (k) => () => setTouched((t) => (t[k] ? t : { ...t, [k]: true }));

  const scrollBodyTop = () => {
    formRef.current?.closest('.overflow-y-auto')?.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  };

  const goTo = (i) => {
    if (i === step || phase) return;
    setDir(i > step ? 1 : -1);
    focusHeadingRef.current = true;
    setStep(i);
    scrollBodyTop();
  };

  const handleClose = () => {
    if (phase) return; // never close in the middle of "paying"
    setIsCheckoutOpen(false);
  };

  const backToCart = () => {
    setIsCheckoutOpen(false);
    setIsCartOpen(true);
  };

  const browse = () => {
    setIsCheckoutOpen(false);
    const switching = viewMode !== 'store';
    if (switching) setViewMode('store');
    setTimeout(() => scrollToId('items'), switching ? 420 : 80);
  };

  const fillWallet = () => {
    setPay((p) => ({ ...p, walletNumber: `010${randomDigits(8)}`, transferRef: randomDigits(10) }));
    setTouched((t) => ({ ...t, walletNumber: true }));
  };

  const fillCard = () => {
    setPay((p) => ({
      ...p,
      cardNumber: '4242 4242 4242 4242',
      cardName: info.customerName.trim() || 'محمد عبد الرحمن',
      cardExpiry: demoExpiry(),
      cardCvv: '123',
    }));
    setTouched((t) => ({ ...t, cardNumber: true, cardName: true, cardExpiry: true, cardCvv: true }));
  };

  const submitOrder = () => {
    if (phase || !cartItems.length) return;
    setPhase('auth');
    const customerName = info.customerName.trim();
    const zoneShort = shortZoneName(zone?.name);
    const deliveryMethod = pickup ? `استلام من فرع ${info.branch}` : `توصيل للبيت في ${zoneShort}`;
    const address = pickup ? `فرع ${info.branch}` : `${zoneShort}، ${info.address.trim()}`;
    const detail = methodDetail();
    const transferRef =
      pay.method === 'wallet'
        ? pay.transferRef
          ? `عملية ${pay.transferRef} من ${pay.walletNumber}`
          : `تحويل من ${pay.walletNumber}`
        : pay.method === 'card'
        ? `كارت ينتهي بـ ${last4}`
        : pay.method === 'cod'
        ? 'الدفع عند الاستلام'
        : detail;
    const methodSnapshot = { id: method.id, label: method.label, detail };
    const shipSnapshot = ship;

    timers.current.push(setTimeout(() => setPhase('invoice'), PROCESSING_MS / 2));
    timers.current.push(
      setTimeout(() => {
        const order = processPayment({
          customerName,
          phone: info.phone,
          deliveryMethod,
          address,
          paymentMethod: method.erp,
          notes: info.notes.trim(),
          installmentMonths: pay.method === 'installments' ? pay.months : null,
          transferRef,
        });
        setPhase(null);
        if (order) {
          setCompleted({ ...order, method: methodSnapshot, ship: shipSnapshot });
          // Payment details are never kept after the order goes through.
          setPay((p) => ({ ...EMPTY_PAY, method: p.method, months: p.months }));
          setInfo((p) => ({ ...p, notes: '' }));
        }
      }, PROCESSING_MS)
    );
  };

  const next = () => {
    if (phase) return;
    if (!stepValid(step)) {
      setAttempted((a) => ({ ...a, [step]: true }));
      setAttemptTick((t) => t + 1);
      return;
    }
    if (step === 0 && !pay.walletNumber && isEgyptMobile(info.phone)) {
      // Most people pay from their own number; save them typing it twice.
      setPayField('walletNumber', info.phone);
    }
    if (step < STEPS.length - 1) goTo(step + 1);
    else submitOrder();
  };

  const back = () => {
    if (phase) return;
    if (step === 0) backToCart();
    else goTo(step - 1);
  };

  const goErp = () => {
    setIsCheckoutOpen(false);
    setViewMode('admin');
    setAdminTab('erp');
  };

  /* ---------------- Views ---------------- */
  const stepVariants = reduce
    ? { enter: { opacity: 0 }, center: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        // RTL: the next step comes in from the left, the old one leaves to the right.
        enter: (d) => ({ opacity: 0, x: d > 0 ? -28 : 28 }),
        center: { opacity: 1, x: 0 },
        exit: (d) => ({ opacity: 0, x: d > 0 ? 28 : -28 }),
      };

  const summaryProps = {
    items: cartItems,
    formatPrice,
    total: cartTotal,
    savings,
    shipping: shippingNode,
    totalNote,
  };

  const radioCard = (checked) =>
    cn(
      'relative cursor-pointer rounded-2xl border transition-[border-color,background-color,box-shadow] duration-150',
      'has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-amber-500 has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-surface',
      checked ? 'border-amber-500 bg-amber-50/70 shadow-soft-sm dark:bg-amber-500/10' : 'border-line bg-surface hover:border-line-strong hover:bg-surface-2/60'
    );

  const stepInfo = (
    <>
      <StepHeading title="بياناتك والاستلام" subtitle="هنكلمك على الرقم ده عشان نأكد الطلب" focusRef={focusHeadingRef} />
      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <LabeledInput
            label="الاسم"
            required
            autoComplete="name"
            placeholder="مثلاً: محمد عبد الرحمن"
            value={info.customerName}
            onChange={(e) => setInfoField('customerName', e.target.value)}
            onBlur={touch('customerName')}
            error={err('customerName', 0)}
          />
          <LabeledInput
            label="رقم الموبايل"
            required
            type="tel"
            inputMode="numeric"
            dir="ltr"
            autoComplete="tel-national"
            placeholder="01XXXXXXXXX"
            value={info.phone}
            onChange={(e) => setInfoField('phone', normalizePhone(e.target.value))}
            onBlur={touch('phone')}
            error={err('phone', 0)}
            hint="هنبعتلك تأكيد الطلب واتساب عليه"
            className="[&_input]:num"
          />
        </div>

        <div className="space-y-3">
          <p className="text-xs font-bold text-fg">
            هتستلم إزاي؟
          </p>
          <SegmentedControl
            layoutId={`${uid}-delivery`}
            ariaLabel="طريقة الاستلام"
            size="md"
            value={info.deliveryMethod}
            onChange={(v) => setInfoField('deliveryMethod', v)}
            className="grid w-full grid-cols-2"
            options={[
              { id: 'pickup', label: 'استلام من الفرع', icon: Store },
              { id: 'delivery', label: 'توصيل للبيت', icon: Truck },
            ]}
          />

            {pickup ? (
              <motion.fieldset
                key="pickup"
                initial={{ opacity: 0, y: reduce ? 0 : 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="space-y-2"
              >
                <legend className="sr-only">اختار الفرع</legend>
                <div className="grid gap-2 sm:grid-cols-2">
                  {branches.map((b) => {
                    const checked = info.branch === b.locationName;
                    const here = cartItems.filter((i) => i.product.branch === b.locationName).length;
                    return (
                      <label key={b.id} className={cn(radioCard(checked), 'flex items-start gap-3 p-3')}>
                        <input
                          type="radio"
                          name={`${uid}-branch`}
                          value={b.locationName}
                          checked={checked}
                          onChange={() => setInfoField('branch', b.locationName)}
                          className="sr-only"
                        />
                        <RadioMark checked={checked} className="mt-0.5" />
                        <span className="min-w-0 flex-1">
                          <span className="block font-heading text-sm font-black text-fg">{b.name}</span>
                          <span className="mt-0.5 line-clamp-2 block text-[11px] leading-relaxed text-fg-muted">{b.address}</span>
                          {here > 0 ? (
                            <Badge tone="neutral" size="xs" className="mt-1.5">
                              فيه <Pieces n={here} /> من طلبك
                            </Badge>
                          ) : null}
                        </span>
                      </label>
                    );
                  })}
                </div>
                {err('branch', 0) ? (
                  <p role="alert" className="text-xs font-semibold text-red-600 dark:text-red-400">
                    {err('branch', 0)}
                  </p>
                ) : cartBranches.length > 1 ? (
                  <p className="flex items-start gap-1.5 text-[11px] text-fg-subtle">
                    <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    طلبك في فرعين، هنجمعهولك في الفرع اللي تختاره
                  </p>
                ) : null}
              </motion.fieldset>
            ) : (
              <motion.div
                key="delivery"
                initial={{ opacity: 0, y: reduce ? 0 : 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="space-y-4"
              >
                <Field label="المحافظة" required htmlFor={ids.zone} error={err('zone', 0)}>
                  <Select
                    id={ids.zone}
                    value={info.zone}
                    onChange={(e) => {
                      setInfoField('zone', e.target.value);
                      touch('zone')();
                    }}
                    onBlur={touch('zone')}
                    aria-invalid={err('zone', 0) ? true : undefined}
                    className={cn(err('zone', 0) && 'border-red-400')}
                  >
                    <option value="" disabled>
                      اختار المحافظة
                    </option>
                    {shippingZones.map((z) => (
                      <option key={z.id} value={z.id}>
                        {z.name}
                      </option>
                    ))}
                  </Select>
                </Field>

                {zone ? (
                  <div className="flex items-start gap-3 rounded-xl border border-line bg-surface-2/60 p-3" aria-live="polite">
                    <Truck className="mt-0.5 h-5 w-5 shrink-0 text-brand-blue dark:text-blue-400" aria-hidden="true" />
                    <div className="min-w-0 text-sm">
                      {ship ? (
                        <p className="font-bold text-fg">
                          الشحن تقريباً{' '}
                          <span className="num font-heading font-black">
                            {formatPrice(ship.lo)} لـ {formatPrice(ship.hi)} ج
                          </span>
                        </p>
                      ) : (
                        <p className="font-bold text-fg">الشحن بيتحدد مع الفرع</p>
                      )}
                      <p className="mt-0.5 text-xs text-fg-muted">بيوصل {zone.days} · بتدفعه لما الطلب يوصلك</p>
                    </div>
                  </div>
                ) : null}

                <Field label="العنوان بالتفصيل" required htmlFor={ids.address} error={err('address', 0)}>
                  <Textarea
                    id={ids.address}
                    rows={2}
                    autoComplete="street-address"
                    className="min-h-[76px]"
                    placeholder="المركز أو القرية، الشارع، وعلامة مميزة جنبك"
                    value={info.address}
                    onChange={(e) => setInfoField('address', e.target.value)}
                    onBlur={touch('address')}
                    invalid={Boolean(err('address', 0))}
                  />
                </Field>
              </motion.div>
            )}
        </div>

        <Field label="ملاحظات" hint="اختياري" htmlFor={ids.notes}>
          <Textarea
            id={ids.notes}
            rows={2}
            className="min-h-[64px]"
            placeholder="مثلاً: كلمني قبل ما تيجي بساعة"
            value={info.notes}
            onChange={(e) => setInfoField('notes', e.target.value)}
          />
        </Field>
      </div>
    </>
  );

  const walletPanel = (
    <div className="space-y-3">
      <p className="flex items-center gap-1.5 text-xs font-bold text-fg">
        <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
        حوّل على الأرقام الرسمية دي بس
      </p>
      <div className="grid gap-2">
        <CopyRow label="فودافون كاش وأي محفظة" value={mainNumber?.number || '01034052401'} display={mainNumber?.display || '010 3405 2401'} />
        <CopyRow label="إنستاباي" value="souq-bahr-elbaqar@instapay" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <LabeledInput
          label="رقم المحفظة اللي هتحوّل منها"
          required
          type="tel"
          inputMode="numeric"
          dir="ltr"
          placeholder="01XXXXXXXXX"
          value={pay.walletNumber}
          onChange={(e) => setPayField('walletNumber', normalizePhone(e.target.value))}
          onBlur={touch('walletNumber')}
          error={err('walletNumber', 1)}
          className="[&_input]:num"
        />
        <LabeledInput
          label="رقم العملية"
          hint="اختياري، هتلاقيه في رسالة التحويل"
          inputMode="numeric"
          dir="ltr"
          placeholder="مثلاً 4829301756"
          value={pay.transferRef}
          onChange={(e) => setPayField('transferRef', digitsOnly(e.target.value).slice(0, 16))}
          className="[&_input]:num"
        />
      </div>
      <Button variant="soft" size="sm" className="h-10" onClick={fillWallet}>
        <Wand2 className="h-4 w-4" aria-hidden="true" />
        ملء بيانات تجريبية
      </Button>
    </div>
  );

  const cardPanel = (
    <div className="space-y-4">
      <CardPreview number={pay.cardNumber} name={pay.cardName} expiry={pay.cardExpiry} brand={cardBrand(pay.cardNumber)} />
      <div className="grid grid-cols-2 gap-3">
        <LabeledInput
          className="col-span-2 [&_input]:num"
          label="رقم الكارت"
          required
          inputMode="numeric"
          autoComplete="cc-number"
          dir="ltr"
          placeholder="0000 0000 0000 0000"
          value={pay.cardNumber}
          onChange={(e) => setPayField('cardNumber', formatCardNumber(e.target.value))}
          onBlur={touch('cardNumber')}
          error={err('cardNumber', 1)}
        />
        <LabeledInput
          className="col-span-2"
          label="الاسم على الكارت"
          required
          autoComplete="cc-name"
          dir="auto"
          placeholder="زي ما هو مكتوب على الكارت"
          value={pay.cardName}
          onChange={(e) => setPayField('cardName', e.target.value)}
          onBlur={touch('cardName')}
          error={err('cardName', 1)}
        />
        <LabeledInput
          className="[&_input]:num"
          label="تاريخ الانتهاء"
          required
          inputMode="numeric"
          autoComplete="cc-exp"
          dir="ltr"
          placeholder="MM/YY"
          value={pay.cardExpiry}
          onChange={(e) => setPayField('cardExpiry', formatExpiry(e.target.value))}
          onBlur={touch('cardExpiry')}
          error={err('cardExpiry', 1)}
        />
        <LabeledInput
          className="[&_input]:num"
          label="CVV"
          required
          type="password"
          inputMode="numeric"
          autoComplete="cc-csc"
          dir="ltr"
          placeholder="123"
          maxLength={3}
          value={pay.cardCvv}
          onChange={(e) => setPayField('cardCvv', digitsOnly(e.target.value).slice(0, 3))}
          onBlur={touch('cardCvv')}
          error={err('cardCvv', 1)}
        />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 text-[11px] font-semibold text-fg-subtle">
          <Lock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          بيانات الكارت مش بتتحفظ عندنا
        </p>
        <Button variant="soft" size="sm" className="h-10" onClick={fillCard}>
          <Wand2 className="h-4 w-4" aria-hidden="true" />
          ملء بيانات تجريبية
        </Button>
      </div>
    </div>
  );

  const codPanel = (
    <div className="space-y-3">
      <p className="flex items-center gap-2 font-heading text-sm font-black text-fg">
        <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
        مش هتدفع حاجة دلوقتي
      </p>
      <ul className="space-y-2 text-sm text-fg-muted">
        {[
          pickup ? 'تعالى الفرع وعاين القطعة بنفسك' : 'المندوب هيوصلك الطلب لحد البيت',
          'شغّلها واتأكد إنها سليمة قدامك',
          pickup ? 'ادفع كاش في الفرع واستلم فاتورتك' : 'ادفع كاش للمندوب واستلم فاتورتك',
        ].map((t) => (
          <li key={t} className="flex items-start gap-2">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
            {t}
          </li>
        ))}
      </ul>
    </div>
  );

  const installmentsPanel = (
    <div className="space-y-3">
      <fieldset>
        <legend className="mb-2 text-xs font-bold text-fg">هتقسّط على كام شهر؟</legend>
        <div className="grid grid-cols-3 gap-2">
          {MONTHS.map((m) => {
            const checked = pay.months === m;
            return (
              <label key={m} className={cn(radioCard(checked), 'flex flex-col items-center rounded-xl px-1.5 py-2.5 text-center')}>
                <input
                  type="radio"
                  name={`${uid}-months`}
                  value={m}
                  checked={checked}
                  onChange={() => setPayField('months', m)}
                  className="sr-only"
                />
                <span className="flex items-center gap-1 font-heading text-sm font-black text-fg">
                  {checked ? <Check className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" strokeWidth={3} aria-hidden="true" /> : null}
                  <span className="num">{m}</span> {monthsWord(m)}
                </span>
                <span className="num mt-0.5 text-[11px] font-bold text-fg-muted">{formatPrice(Math.ceil(cartTotal / m))} ج/شهر</span>
              </label>
            );
          })}
        </div>
      </fieldset>
      <p className="rounded-xl border border-line bg-surface p-3 text-sm text-fg" aria-live="polite">
        هتدفع <span className="num font-heading font-black">{formatPrice(monthly)} ج</span> كل شهر لمدة{' '}
        <span className="num font-bold">{pay.months}</span> {monthsWord(pay.months)}، من غير مقدم ومن غير فوايد
      </p>
      <p className="text-[11px] text-fg-subtle">متاح مع فاليو وأمان وكروت تقسيط البنوك. الموافقة بتاخد دقايق.</p>
    </div>
  );

  const stepPay = (
    <>
      <StepHeading title="هتدفع إزاي؟" subtitle="اختار الطريقة اللي تريحك" focusRef={focusHeadingRef} />
      <div className="space-y-4">
        <fieldset>
          <legend className="sr-only">طريقة الدفع</legend>
          <div className="grid grid-cols-2 gap-2.5">
            {METHODS.map((m) => {
              const checked = pay.method === m.id;
              const Icon = m.icon;
              return (
                <label key={m.id} className={cn(radioCard(checked), 'flex flex-col gap-2 p-3')}>
                  <input
                    type="radio"
                    name={`${uid}-method`}
                    value={m.id}
                    checked={checked}
                    onChange={() => setPayField('method', m.id)}
                    className="sr-only"
                  />
                  <span className="flex items-center justify-between">
                    <span
                      className={cn(
                        'flex h-9 w-9 items-center justify-center rounded-xl transition-colors',
                        checked ? 'bg-amber-500 text-ink' : 'bg-surface-2 text-fg-muted'
                      )}
                    >
                      <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                    </span>
                    <RadioMark checked={checked} />
                  </span>
                  <span>
                    <span className="block font-heading text-[13px] font-black leading-tight text-fg sm:text-sm">{m.label}</span>
                    <span className="mt-0.5 block text-[11px] leading-snug text-fg-muted">{m.desc}</span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

          <motion.div
            key={pay.method}
            initial={{ opacity: 0, y: reduce ? 0 : 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: EASE }}
            className="rounded-2xl border border-line bg-surface-2/50 p-3 sm:p-4"
          >
            {pay.method === 'wallet' ? walletPanel : pay.method === 'card' ? cardPanel : pay.method === 'cod' ? codPanel : installmentsPanel}
          </motion.div>
      </div>
    </>
  );

  const stepReview = (
    <>
      <StepHeading title="راجع طلبك" subtitle="بص على كل حاجة مرة أخيرة قبل ما تأكد" focusRef={focusHeadingRef} />
      <div className="space-y-3">
        <ReviewBlock icon={User} title="بياناتك" onEdit={() => goTo(0)}>
          <p className="font-bold">{info.customerName.trim()}</p>
          <p className="num text-fg-muted">
            <span dir="ltr">{formatPhone(info.phone)}</span>
          </p>
        </ReviewBlock>

        <ReviewBlock icon={pickup ? Store : Truck} title={pickup ? 'استلام من الفرع' : 'توصيل للبيت'} onEdit={() => goTo(0)}>
          {pickup ? (
            <>
              <p className="font-bold">{branch?.name || `فرع ${info.branch}`}</p>
              {branch?.address ? <p className="text-xs text-fg-muted">{branch.address}</p> : null}
              {branch?.hours ? <p className="text-xs text-fg-subtle">{branch.hours}</p> : null}
            </>
          ) : (
            <>
              <p className="font-bold">{shortZoneName(zone?.name)}</p>
              <p className="text-xs text-fg-muted">{info.address.trim()}</p>
              {zone ? (
                <p className="text-xs text-fg-subtle">
                  بيوصل {zone.days}
                  {ship ? (
                    <>
                      {' '}
                      · شحن تقريباً{' '}
                      <span className="num">
                        {formatPrice(ship.lo)} لـ {formatPrice(ship.hi)} ج
                      </span>
                    </>
                  ) : null}
                </p>
              ) : null}
            </>
          )}
          {info.notes.trim() ? <p className="pt-1 text-xs text-fg-muted">ملاحظاتك: {info.notes.trim()}</p> : null}
        </ReviewBlock>

        <ReviewBlock icon={method.icon} title="الدفع" onEdit={() => goTo(1)}>
          <p className="font-bold">{method.label}</p>
          <p className="num text-xs text-fg-muted">{methodDetail()}</p>
        </ReviewBlock>

        <div className="rounded-2xl border border-line bg-surface p-3 md:hidden">
          <p className="mb-3 font-heading text-sm font-black text-fg">
            الطلب (<Pieces n={cartCount} />)
          </p>
          <OrderSummary {...summaryProps} maxItems={6} />
        </div>
      </div>
    </>
  );

  const processingLabel = phase === 'auth' ? (pay.method === 'cod' ? 'بنسجل الطلب' : 'بنأكد الدفع') : 'بنعمل الفواتير';

  const primaryLabel =
    step === 0 ? (
      <>
        {isPhone ? 'كمّل' : 'كمّل للدفع'}
        <ArrowLeft className="h-5 w-5" aria-hidden="true" />
      </>
    ) : step === 1 ? (
      <>
        {isPhone ? 'كمّل' : 'كمّل للمراجعة'}
        <ArrowLeft className="h-5 w-5" aria-hidden="true" />
      </>
    ) : (
      <>
        <Lock className="h-4 w-4" aria-hidden="true" />
        {pay.method === 'cod' ? (
          <span className="min-w-0 truncate">
            أكّد الطلب
            {isPhone ? null : (
              <>
                {' '}
                · <span className="num">{formatPrice(cartTotal)}</span> ج
              </>
            )}
          </span>
        ) : pay.method === 'installments' ? (
          <span className="min-w-0 truncate">
            أكّد التقسيط
            {isPhone ? null : (
              <>
                {' '}
                · <span className="num">{formatPrice(monthly)}</span> ج/شهر
              </>
            )}
          </span>
        ) : (
          <span className="min-w-0 truncate">
            ادفع <span className="num">{formatPrice(cartTotal)}</span> ج
          </span>
        )}
      </>
    );

  const showForm = !completed && cartItems.length > 0;

  const footer = showForm ? (
    <div className="flex items-center gap-2">
      <Button variant="secondary" size="lg" className="shrink-0 px-4" onClick={back} disabled={Boolean(phase)}>
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
        {step === 0 ? (isPhone ? 'السلة' : 'رجوع للسلة') : 'رجوع'}
      </Button>
      <Button type="submit" form={formId} size="lg" className="min-w-0 flex-1" loading={Boolean(phase)}>
        {phase ? <span className="min-w-0 truncate">{processingLabel}</span> : primaryLabel}
      </Button>
    </div>
  ) : null;

  /* ---------------- Success ---------------- */
  let successView = null;
  if (completed) {
    const isCod = completed.method?.id === 'cod';
    const waText = [
      `السلام عليكم يا حاج، عملت طلب من الموقع ورقمه ${completed.orderId}.`,
      `الإجمالي: ${formatPrice(completed.total)} جنيه`,
      `الاسم: ${completed.customerName}`,
      `الموبايل: ${completed.phone}`,
      `الاستلام: ${completed.deliveryMethod}`,
      completed.address && !completed.address.startsWith('فرع') ? `العنوان: ${completed.address}` : null,
      `الدفع: ${completed.method?.label} (${completed.method?.detail})`,
      `الفواتير: ${completed.invoices.map((n) => `#${n}`).join(' ')}`,
      'ياريت تأكدلي تجهيز الطلب.',
    ]
      .filter(Boolean)
      .join('\n');

    successView = (
      <div className="mx-auto max-w-md text-center">
        <motion.span
          initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={reduce ? { duration: 0.15 } : { type: 'spring', stiffness: 380, damping: 17, delay: 0.05 }}
          className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 ring-8 ring-emerald-50 dark:bg-emerald-500/15 dark:text-emerald-400 dark:ring-emerald-500/5"
        >
          <CheckCircle2 className="h-11 w-11" strokeWidth={2.2} aria-hidden="true" />
        </motion.span>
        <h3 className="mt-4 font-heading text-2xl font-black text-fg">{isCod ? 'طلبك اتسجل' : 'الدفع اتأكد'}</h3>
        <p className="mx-auto mt-1 max-w-[36ch] text-sm text-fg-muted">
          الفواتير اتعملت في الحسابات، والقطع اتشالت من المعروض على الموقع.
        </p>

        <div className="mt-5 rounded-2xl border border-line bg-surface-2/60 p-4 text-right">
          <div className="flex items-center justify-between gap-3 border-b border-line pb-3">
            <div className="min-w-0">
              <span className="block text-[11px] font-bold text-fg-subtle">رقم الطلب</span>
              <span className="num block truncate font-heading text-lg font-black text-fg" dir="ltr">
                {completed.orderId}
              </span>
            </div>
            <CopyButton value={completed.orderId} label="رقم الطلب" />
          </div>
          <dl className="mt-3 space-y-2.5 text-sm">
            <div className="flex items-start justify-between gap-3">
              <dt className="shrink-0 text-fg-muted">الفواتير</dt>
              <dd className="flex flex-wrap justify-end gap-1">
                {completed.invoices.map((n) => (
                  <Badge key={n} tone="amber" size="xs" className="num">
                    #{n}
                  </Badge>
                ))}
              </dd>
            </div>
            <div className="flex items-start justify-between gap-3">
              <dt className="shrink-0 text-fg-muted">الاسم</dt>
              <dd className="min-w-0 text-left font-bold text-fg">{completed.customerName}</dd>
            </div>
            <div className="flex items-start justify-between gap-3">
              <dt className="shrink-0 text-fg-muted">الاستلام</dt>
              <dd className="min-w-0 text-left font-bold text-fg">{completed.deliveryMethod}</dd>
            </div>
            <div className="flex items-start justify-between gap-3">
              <dt className="shrink-0 text-fg-muted">الدفع</dt>
              <dd className="min-w-0 text-left font-bold text-fg">
                {completed.method?.label}
                <span className="num block text-[11px] font-semibold text-fg-subtle">{completed.method?.detail}</span>
              </dd>
            </div>
            <div className="flex items-start justify-between gap-3">
              <dt className="shrink-0 text-fg-muted">القطع</dt>
              <dd className="min-w-0 text-left font-bold text-fg">
                <Pieces n={completed.items.reduce((s, i) => s + i.quantity, 0)} />
              </dd>
            </div>
            <div className="flex items-start justify-between gap-3">
              <dt className="shrink-0 text-fg-muted">الوقت</dt>
              <dd className="min-w-0 text-left font-semibold text-fg">
                {completed.date} · {completed.time}
              </dd>
            </div>
          </dl>
          <div className="mt-3 flex items-baseline justify-between gap-3 border-t border-line pt-3">
            <span className="font-heading text-sm font-black text-fg">{isCod ? 'هتدفع عند الاستلام' : 'اتدفع'}</span>
            <span className="num font-heading text-2xl font-black text-fg">
              {formatPrice(completed.total)} <span className="text-sm font-bold text-fg-muted">ج</span>
            </span>
          </div>
          {completed.ship ? (
            <p className="mt-1 text-left text-[11px] text-fg-subtle">
              + شحن تقريباً{' '}
              <span className="num">
                {formatPrice(completed.ship.lo)} لـ {formatPrice(completed.ship.hi)} ج
              </span>{' '}
              عند الاستلام
            </p>
          ) : null}
        </div>

        <div className="mt-5 flex flex-col gap-2.5">
          <Button variant="dark" size="lg" block onClick={goErp}>
            <FileText className="h-5 w-5 text-amber-400 dark:text-amber-600" aria-hidden="true" />
            شوف الفاتورة في لوحة التحكم
          </Button>
          <Button variant="whatsapp" size="lg" block href={getGeneralWhatsAppLink(waText)} target="_blank" rel="noopener noreferrer">
            <WhatsAppIcon className="h-5 w-5" aria-hidden="true" />
            ابعت تأكيد الطلب
          </Button>
          <Button variant="ghost" size="md" block onClick={handleClose}>
            رجوع للمتجر
          </Button>
        </div>
        <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-fg-subtle">
          <Info className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          دفع تجريبي للعرض، مفيش فلوس حقيقية اتسحبت
        </p>
      </div>
    );
  }

  /* ---------------- Render ---------------- */
  return (
    <Modal
      isOpen={isCheckoutOpen}
      onClose={handleClose}
      title={completed ? 'الطلب اتأكد' : 'إتمام الطلب'}
      subtitle={completed ? 'شكراً لثقتك في سوق بحر البقر الكبير' : 'دفع تجريبي للعرض، مفيش فلوس حقيقية بتتسحب'}
      icon={completed ? CheckCircle2 : Lock}
      tone={completed ? 'celebrate' : 'default'}
      maxWidth={showForm || completed ? 'sm:max-w-2xl md:max-w-3xl h-[92dvh] sm:h-[min(780px,92vh)]' : 'sm:max-w-lg'}
      bodyClassName={showForm ? 'p-0 sm:p-0' : undefined}
      footer={footer}
    >
      {completed ? (
        successView
      ) : !cartItems.length ? (
        <EmptyState
          icon={ShoppingCart}
          title="السلة فاضية"
          description="ضيف القطع اللي عاجباك الأول، وبعدين كمّل الطلب من هنا."
          action={
            <Button size="md" onClick={browse}>
              تصفح المعروض
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            </Button>
          }
          className="border-0 py-8"
        />
      ) : (
        <div className="md:grid md:min-h-full md:grid-cols-[minmax(0,1fr)_272px]">
          <div className="min-w-0 px-4 pb-6 sm:px-6">
            <div className="sticky top-0 z-10 -mx-4 bg-surface px-4 pb-3 pt-4 sm:-mx-6 sm:px-6">
              <Stepper steps={STEPS} current={step} onJump={goTo} />
            </div>

            {step < 2 ? (
              <SummaryToggle id={ids.summary} count={cartCount} total={cartTotal} formatPrice={formatPrice} className="mb-4 mt-1 md:hidden">
                <OrderSummary {...summaryProps} />
              </SummaryToggle>
            ) : null}

            <p className="sr-only" aria-live="assertive">
              {phase ? processingLabel : ''}
            </p>

            <form
              id={formId}
              ref={formRef}
              noValidate
              onSubmit={(e) => {
                e.preventDefault();
                next();
              }}
              className="pt-2"
            >
                <motion.section
                  key={STEPS[step].id}
                  custom={dir}
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: reduce ? 0.12 : 0.22, ease: EASE }}
                >
                  {step === 0 ? stepInfo : step === 1 ? stepPay : stepReview}
                </motion.section>
            </form>
          </div>

          <aside aria-label="ملخص الطلب" className="hidden bg-surface-2/60 md:block">
            <div className="sticky top-0 space-y-4 p-5">
              <h3 className="flex items-baseline justify-between gap-2 font-heading text-sm font-black text-fg">
                ملخص الطلب
                <span className="text-xs font-bold text-fg-subtle">
                  <Pieces n={cartCount} />
                </span>
              </h3>
              <OrderSummary {...summaryProps} />
              <ul className="space-y-2 border-t border-line pt-3 text-[11px] font-bold text-fg-muted">
                <li className="flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                  عاين قبل ما تدفع
                </li>
                <li className="flex items-center gap-1.5">
                  <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-brand-blue dark:text-blue-400" aria-hidden="true" />
                  أرقام رسمية بس
                </li>
                <li className="flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  فاتورة باسمك لكل قطعة
                </li>
              </ul>
            </div>
          </aside>
        </div>
      )}
    </Modal>
  );
}

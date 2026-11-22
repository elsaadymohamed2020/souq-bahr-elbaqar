import React, { useEffect, useId, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowLeftRight,
  BadgeCheck,
  Banknote,
  BellRing,
  CalendarClock,
  Camera,
  Check,
  Coins,
  Info,
  MapPin,
  MessageCircle,
  Package,
  PackagePlus,
  Phone,
  Receipt,
  Tag,
  UserRound,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { inDays } from '../../data/initialData';
import Modal from '../common/Modal';
import { WhatsAppIcon } from '../common/BrandIcons';
import { Avatar, Badge, Button, EmptyState, Field, LabeledInput, SegmentedControl, Select } from '../ui';
import { cn } from '../../lib/cn';
import AddDealModal from './AddDealModal';
import { ChannelMark, SEGMENTS, Thumb, discounted, getChannel, inOfferScope, inboxIntent, todayIso, useFinePointer } from './adminShared';

/* ------------------------------------------------------------------
   Helpers
------------------------------------------------------------------- */
const CAT_ICON = { home: 'Refrigerator', ind: 'Zap', wood: 'DoorClosed' };

const EMPTY_PRODUCT = {
  name: '',
  cat: 'home',
  branch: 'الصالحية',
  price: '',
  cost: '',
  condition: 'مستورد، فحص شامل وبحالة ممتازة',
  img: '',
};
const PRODUCT_FIELDS = Object.keys(EMPTY_PRODUCT);

const productFormFrom = (prefill) => {
  const form = { ...EMPTY_PRODUCT };
  if (prefill) {
    PRODUCT_FIELDS.forEach((k) => {
      if (prefill[k] !== undefined && prefill[k] !== null) form[k] = String(prefill[k]);
    });
  }
  return form;
};

/** Read a photo from the phone and shrink it so it fits in localStorage. */
async function fileToDataUrl(file, max = 720) {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = reject;
      i.src = url;
    });
    const scale = Math.min(1, max / Math.max(img.width, img.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.78);
  } finally {
    URL.revokeObjectURL(url);
  }
}

const PCT_OPTIONS = [5, 10, 15, 20, 25, 30];

const makeOfferForm = () => ({ scope: 'cat', target: 'ind', pct: 10, ends: inDays(7), title: '' });

const PAY_OPTIONS = [
  { id: 'كاش', label: 'كاش', icon: Banknote },
  { id: 'تحويل', label: 'تحويل', icon: ArrowLeftRight },
  { id: 'تقسيط', label: 'تقسيط', icon: CalendarClock },
];

/* ------------------------------------------------------------------
   1. Add product
------------------------------------------------------------------- */
function AddProductModal() {
  const { isAddProductOpen, setIsAddProductOpen, addProductPrefill, setAddProductPrefill, addProduct, categories, branches, customers, formatPrice } =
    useApp();
  const [form, setForm] = useState(EMPTY_PRODUCT);
  const [imgBroken, setImgBroken] = useState(false);
  const fine = useFinePointer();
  const [reading, setReading] = useState(false);
  const fileId = useId();
  const catId = useId();
  const branchId = useId();

  useEffect(() => {
    if (!isAddProductOpen) return;
    setForm(productFormFrom(addProductPrefill));
    setImgBroken(false);
  }, [isAddProductOpen, addProductPrefill]);

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const openPickerOnKey = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      document.getElementById(fileId)?.click();
    }
  };

  const close = () => {
    setIsAddProductOpen(false);
    setAddProductPrefill(null);
  };

  const onPhoto = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setReading(true);
    try {
      const dataUrl = await fileToDataUrl(file);
      set({ img: dataUrl });
      setImgBroken(false);
    } catch (err) {
      // unreadable file: keep the dropzone
    } finally {
      setReading(false);
    }
  };

  const submit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.price) return;
    const price = Number(form.price);
    addProduct({
      name: form.name.trim(),
      cat: form.cat,
      branch: form.branch,
      price,
      cost: Number(form.cost) || Math.round(price * 0.7),
      condition: form.condition,
      img: form.img || undefined,
      icon: CAT_ICON[form.cat] || 'Package',
    });
    close();
  };

  const price = Number(form.price) || 0;
  const cost = Number(form.cost) || 0;
  const margin = price && cost ? price - cost : 0;
  const name = form.name.trim().toLowerCase();
  const waiting = name ? customers.filter((c) => c.kw && name.includes(c.kw.toLowerCase())) : [];
  const hasImg = Boolean(form.img) && !imgBroken;

  return (
    <Modal
      isOpen={isAddProductOpen}
      onClose={close}
      title="إضافة قطعة جديدة"
      subtitle="هتنزل على الموقع على طول"
      icon={PackagePlus}
      maxWidth="max-w-xl"
      dataTour="add-product-modal"
      footer={
        <div className="flex gap-2">
          <Button variant="secondary" onClick={close} className="shrink-0">
            إلغاء
          </Button>
          <Button type="submit" form="add-product-form" variant="primary" className="min-w-0 flex-1" data-tour="add-product-submit">
            <Check className="h-[18px] w-[18px]" aria-hidden="true" />
            نزّل القطعة على الموقع
          </Button>
        </div>
      }
    >
      <form id="add-product-form" onSubmit={submit} className="space-y-4">
        <input id={fileId} type="file" accept="image/*" className="sr-only" onChange={onPhoto} tabIndex={-1} />
        {hasImg ? (
          <div className="relative overflow-hidden rounded-2xl border border-line bg-surface-2">
            <img src={form.img} alt="صورة القطعة" className="h-48 w-full object-cover sm:h-56" onError={() => setImgBroken(true)} />
            <div className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-2">
              <Badge tone="glass" icon={Check}>
                الصورة جاهزة
              </Badge>
              <div className="flex gap-2">
                <label
                  htmlFor={fileId}
                  tabIndex={0}
                  onKeyDown={openPickerOnKey}
                  className="inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-xl bg-white/90 px-3 font-heading text-xs font-bold text-ink shadow-soft-sm backdrop-blur transition-[background-color,transform] duration-150 hover:bg-white active:scale-[0.97]"
                >
                  <Camera className="h-4 w-4" aria-hidden="true" />
                  غيّر الصورة
                </label>
                <button
                  type="button"
                  onClick={() => set({ img: '' })}
                  aria-label="شيل الصورة"
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/90 text-ink shadow-soft-sm backdrop-blur transition-[background-color,transform] duration-150 hover:bg-white active:scale-[0.97]"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <label
            htmlFor={fileId}
            tabIndex={0}
            onKeyDown={openPickerOnKey}
            className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-line-strong bg-surface-2/60 p-5 text-center transition-[background-color,border-color,transform] duration-150 hover:border-amber-400 hover:bg-amber-50/60 focus-visible:border-amber-500 active:scale-[0.99] dark:hover:bg-amber-500/5"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
              {reading ? (
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />
              ) : (
                <Camera className="h-6 w-6" aria-hidden="true" />
              )}
            </span>
            <span className="font-heading text-sm font-black text-fg">{reading ? 'بنجهز الصورة...' : 'صوّر القطعة بالموبايل'}</span>
            <span className="text-xs text-fg-muted">أو اختار صورة من المعرض</span>
          </label>
        )}

        <div>
          <LabeledInput
            label="اسم القطعة والموديل"
            required
            data-autofocus={fine || undefined}
            placeholder="مثال: موتور مية 12 حصان Siemens"
            value={form.name}
            onChange={(e) => set({ name: e.target.value })}
          />
          {waiting.length ? (
            <p className="mt-2 flex items-center gap-1.5 rounded-xl bg-amber-50 px-3 py-2 text-xs font-bold text-amber-900 dark:bg-amber-500/10 dark:text-amber-200">
              <BellRing className="h-4 w-4 shrink-0" aria-hidden="true" />
              فيه <span className="num">{waiting.length}</span> عميل مستنيين القطعة دي، هنقولك عليهم أول ما تنزلها.
            </p>
          ) : null}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="القسم" htmlFor={catId}>
            <Select id={catId} value={form.cat} onChange={(e) => set({ cat: e.target.value })}>
              {categories
                .filter((c) => c.id !== 'all')
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
            </Select>
          </Field>
          <Field label="الفرع" htmlFor={branchId}>
            <Select id={branchId} value={form.branch} onChange={(e) => set({ branch: e.target.value })}>
              {branches.map((b) => (
                <option key={b.id} value={b.locationName}>
                  فرع {b.locationName}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <LabeledInput
            label="سعر البيع (ج)"
            required
            type="number"
            inputMode="numeric"
            min="0"
            placeholder="9500"
            value={form.price}
            onChange={(e) => set({ price: e.target.value })}
          />
          <LabeledInput
            label="سعر الشراء (ج)"
            type="number"
            inputMode="numeric"
            min="0"
            placeholder="6500"
            hint="بيظهر ليك بس"
            value={form.cost}
            onChange={(e) => set({ cost: e.target.value })}
          />
        </div>

        {margin ? (
          <p
            className={cn(
              'flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold',
              margin > 0
                ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300'
                : 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300'
            )}
          >
            <Coins className="h-4 w-4 shrink-0" aria-hidden="true" />
            {margin > 0 ? 'هتكسب' : 'هتخسر'} <span className="num">{formatPrice(Math.abs(margin))}</span> ج في القطعة دي
            {margin > 0 ? <span className="num">({Math.round((margin / price) * 100)}%)</span> : null}
          </p>
        ) : null}

        <LabeledInput label="الحالة والفحص" placeholder="مستورد، فحص شامل" value={form.condition} onChange={(e) => set({ condition: e.target.value })} />
      </form>
    </Modal>
  );
}

/* ------------------------------------------------------------------
   2. Add offer
------------------------------------------------------------------- */
function AddOfferModal() {
  const { isAddOfferOpen, setIsAddOfferOpen, addOffer, categories, products, formatPrice } = useApp();
  const [form, setForm] = useState(makeOfferForm);
  const targetId = useId();
  const cats = categories.filter((c) => c.id !== 'all');
  const sellable = products.filter((p) => p.status !== 'sold');

  useEffect(() => {
    if (isAddOfferOpen) setForm(makeOfferForm());
  }, [isAddOfferOpen]);

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const close = () => setIsAddOfferOpen(false);

  const changeScope = (scope) =>
    setForm((f) => ({
      ...f,
      scope,
      target: scope === 'cat' ? (cats.some((c) => c.id === f.target) ? f.target : cats[0]?.id) : scope === 'item' ? sellable[0]?.code || '' : null,
    }));

  const autoTitle = () => {
    if (form.scope === 'all') return `خصم ${form.pct}% على كل المعروض`;
    if (form.scope === 'cat') return `خصم ${form.pct}% على ${cats.find((c) => c.id === form.target)?.name || 'القسم'}`;
    return `خصم ${form.pct}% على ${products.find((p) => p.code === form.target)?.name || 'القطعة'}`;
  };

  const affected = sellable.filter((p) => inOfferScope(form, p));
  const sample = affected[0];

  const submit = (e) => {
    e.preventDefault();
    if (form.scope === 'item' && !form.target) return;
    addOffer({ scope: form.scope, target: form.target, pct: form.pct, ends: form.ends, title: form.title.trim() || autoTitle() });
    close();
  };

  return (
    <Modal
      isOpen={isAddOfferOpen}
      onClose={close}
      title="عرض جديد"
      subtitle="الأسعار هتتغير على الموقع أول ما تشغّله"
      icon={Tag}
      footer={
        <div className="flex gap-2">
          <Button variant="secondary" onClick={close} className="shrink-0">
            إلغاء
          </Button>
          <Button type="submit" form="add-offer-form" variant="primary" block disabled={!affected.length}>
            شغّل العرض
          </Button>
        </div>
      }
    >
      <form id="add-offer-form" onSubmit={submit} className="space-y-5">
        <Field label="الخصم على إيه">
          <SegmentedControl
            layoutId="offer-scope"
            ariaLabel="نطاق الخصم"
            size="md"
            value={form.scope}
            onChange={changeScope}
            className="w-full [&>button]:flex-1"
            options={[
              { id: 'cat', label: 'قسم' },
              { id: 'item', label: 'قطعة واحدة' },
              { id: 'all', label: 'كل المعروض' },
            ]}
          />
        </Field>

        {form.scope !== 'all' ? (
          <Field label={form.scope === 'cat' ? 'اختار القسم' : 'اختار القطعة'} htmlFor={targetId}>
            <Select id={targetId} value={form.target || ''} onChange={(e) => set({ target: e.target.value })}>
              {form.scope === 'cat'
                ? cats.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))
                : sellable.map((p) => (
                    <option key={p.code} value={p.code}>
                      {p.name} ({p.code})
                    </option>
                  ))}
            </Select>
          </Field>
        ) : null}

        <fieldset>
          <legend className="mb-1.5 block text-xs font-bold text-fg">نسبة الخصم</legend>
          <div className="grid grid-cols-6 gap-1.5 sm:gap-2">
            {PCT_OPTIONS.map((pct) => {
              const active = form.pct === pct;
              return (
                <button
                  key={pct}
                  type="button"
                  aria-pressed={active}
                  onClick={() => set({ pct })}
                  className={cn(
                    'num h-11 rounded-xl border font-heading text-sm font-black transition-[background-color,border-color,color,transform] duration-150 active:scale-[0.95]',
                    active
                      ? 'border-amber-500 bg-amber-500 text-ink shadow-glow-amber'
                      : 'border-line bg-surface text-fg-muted hover:border-line-strong hover:text-fg'
                  )}
                >
                  {pct}%
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="grid gap-3 sm:grid-cols-2">
          <LabeledInput label="شغال لحد يوم" type="date" min={todayIso()} required value={form.ends} onChange={(e) => set({ ends: e.target.value })} />
          <LabeledInput label="اسم العرض (اختياري)" placeholder={autoTitle()} value={form.title} onChange={(e) => set({ title: e.target.value })} />
        </div>

        <div className="rounded-2xl border border-line bg-surface-2/60 p-3.5">
          <p className="flex items-center gap-1.5 text-xs font-bold text-fg">
            <Info className="h-4 w-4 text-fg-subtle" aria-hidden="true" />
            {affected.length ? (
              <>
                السعر هيتغير على <span className="num">{affected.length}</span> قطعة
              </>
            ) : (
              'مفيش قطع متاحة داخلة في العرض ده'
            )}
          </p>
          {sample ? (
            <div className="mt-2.5 flex items-center gap-3">
              <Thumb src={sample.img} className="h-10 w-10 rounded-lg" iconClassName="h-4 w-4" />
              <span className="min-w-0 flex-1 truncate text-xs text-fg-muted">{sample.name}</span>
              <s className="num text-xs text-fg-subtle">{formatPrice(sample.price)}</s>
              <span className="num font-heading text-sm font-black text-amber-700 dark:text-amber-400">{formatPrice(discounted(sample.price, form.pct))} ج</span>
            </div>
          ) : null}
        </div>
      </form>
    </Modal>
  );
}

/* ------------------------------------------------------------------
   3. Record sale
------------------------------------------------------------------- */
function RecordSaleModal() {
  const { isRecordSaleOpen, setIsRecordSaleOpen, recordSale, products, formatPrice, getFinalPrice } = useApp();
  const [form, setForm] = useState({ productCode: '', custName: '', price: '', payMethod: 'كاش' });
  const productId = useId();
  const fine = useFinePointer();
  const sellable = products.filter((p) => p.status !== 'sold');

  // Fresh default (first piece that is not sold, at its live price) every time the modal opens
  useEffect(() => {
    if (!isRecordSaleOpen) return;
    const first = products.find((p) => p.status !== 'sold');
    setForm({ productCode: first?.code || '', custName: '', price: first ? String(getFinalPrice(first)) : '', payMethod: 'كاش' });
  }, [isRecordSaleOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const close = () => setIsRecordSaleOpen(false);
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const product = products.find((p) => p.code === form.productCode);
  const profit = product ? (Number(form.price) || 0) - (product.cost || 0) : 0;

  const submit = (e) => {
    e.preventDefault();
    if (!product || !form.custName.trim() || !form.price) return;
    recordSale({ ...form, custName: form.custName.trim() });
    close();
  };

  return (
    <Modal
      isOpen={isRecordSaleOpen}
      onClose={close}
      title="تسجيل بيعة"
      subtitle="الفاتورة هتتعمل والقطعة هتبقى اتباع على الموقع"
      icon={Receipt}
      footer={
        sellable.length ? (
          <div className="flex gap-2">
            <Button variant="secondary" onClick={close} className="shrink-0">
              إلغاء
            </Button>
            <Button type="submit" form="record-sale-form" variant="primary" block>
              <Receipt className="h-[18px] w-[18px]" aria-hidden="true" />
              سجّل الفاتورة
            </Button>
          </div>
        ) : null
      }
    >
      {sellable.length ? (
        <form id="record-sale-form" onSubmit={submit} className="space-y-4">
          <Field label="القطعة اللي اتباعت" htmlFor={productId}>
            <Select
              id={productId}
              value={form.productCode}
              onChange={(e) => {
                const p = products.find((x) => x.code === e.target.value);
                set({ productCode: e.target.value, price: p ? String(getFinalPrice(p)) : '' });
              }}
            >
              {sellable.map((p) => (
                <option key={p.code} value={p.code}>
                  {p.name} ({p.code}){p.status === 'held' ? '، محجوزة' : ''}
                </option>
              ))}
            </Select>
          </Field>

          {product ? (
            <div className="flex items-center gap-3 rounded-2xl border border-line bg-surface-2/60 p-3">
              <Thumb src={product.img} className="h-12 w-12 rounded-xl" iconClassName="h-5 w-5" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-heading text-sm font-bold text-fg">{product.name}</p>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-fg-muted">
                  <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                  فرع {product.branch}
                  <span aria-hidden="true">·</span>
                  سعر الموقع <span className="num font-bold text-fg">{formatPrice(getFinalPrice(product))}</span> ج
                </p>
              </div>
            </div>
          ) : null}

          <LabeledInput
            label="اسم المشتري"
            required
            data-autofocus={fine || undefined}
            placeholder="مثال: أستاذ سامح الشرقاوي"
            value={form.custName}
            onChange={(e) => set({ custName: e.target.value })}
          />

          <LabeledInput
            label="اتباعت بكام (ج)"
            required
            type="number"
            inputMode="numeric"
            min="0"
            value={form.price}
            onChange={(e) => set({ price: e.target.value })}
            hint={product ? `ربحك فيها ${formatPrice(profit)} ج` : undefined}
          />

          <Field label="الدفع">
            <SegmentedControl
              layoutId="sale-pay"
              ariaLabel="طريقة الدفع"
              size="md"
              value={form.payMethod}
              onChange={(payMethod) => set({ payMethod })}
              options={PAY_OPTIONS}
              className="w-full [&>button]:flex-1"
            />
          </Field>

          <p className="flex gap-2 rounded-xl bg-amber-50 p-3 text-xs leading-relaxed text-amber-900 dark:bg-amber-500/10 dark:text-amber-200">
            <Info className="h-4 w-4 shrink-0" aria-hidden="true" />
            أول ما تسجل الفاتورة، القطعة هتبقى "اتباع" على الموقع ومحدش هيقدر يحجزها.
          </p>
        </form>
      ) : (
        <EmptyState icon={Package} title="مفيش قطع متاحة للبيع" description="كل القطع اتباعت. ضيف قطعة جديدة الأول." className="border-0 py-8" />
      )}
    </Modal>
  );
}

/* ------------------------------------------------------------------
   4. Customer detail
------------------------------------------------------------------- */
const STAGE_ACTIVE = {
  blue: 'border-blue-600 bg-blue-600 text-white',
  amber: 'border-amber-500 bg-amber-500 text-ink',
  purple: 'border-violet-600 bg-violet-600 text-white',
  emerald: 'border-emerald-600 bg-emerald-600 text-white',
};

function CustomerModal() {
  const { selectedCustomer, setSelectedCustomer, customers, updateCustomerSegment, setAdminTab, setActiveConvId, setViewMode, formatPrice } = useApp();
  const customer = selectedCustomer ? customers.find((c) => c.id === selectedCustomer.id) || selectedCustomer : null;
  const close = () => setSelectedCustomer(null);

  const openConvo = () => {
    if (!customer?.convo) return;
    inboxIntent.openThread = true;
    setActiveConvId(customer.convo);
    setSelectedCustomer(null);
    setViewMode('admin');
    setAdminTab('inbox');
  };

  const channel = customer ? getChannel(customer.ch) : null;
  const waPhone = customer?.phone ? `https://wa.me/2${customer.phone}` : null;

  return (
    <Modal
      isOpen={Boolean(customer)}
      onClose={close}
      title={customer?.name || 'العميل'}
      subtitle={customer?.gov}
      icon={UserRound}
      footer={
        customer ? (
          <div className="flex flex-wrap gap-2">
            {customer.convo ? (
              <Button variant="dark" className="flex-1" onClick={openConvo}>
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                افتح المحادثة
              </Button>
            ) : null}
            {waPhone ? (
              <Button variant="whatsapp" className="flex-1" href={waPhone} target="_blank" rel="noopener noreferrer">
                <WhatsAppIcon className="h-4 w-4" aria-hidden="true" />
                واتساب
              </Button>
            ) : null}
            {customer.phone ? (
              <Button variant="secondary" className="flex-1" href={`tel:${customer.phone}`}>
                <Phone className="h-4 w-4" aria-hidden="true" />
                اتصل
              </Button>
            ) : null}
          </div>
        ) : null
      }
    >
      {customer ? (
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <Avatar name={customer.name} label={customer.avatar} size="lg" />
            <dl className="grid flex-1 grid-cols-3 gap-2 text-center">
              <div className="rounded-xl bg-surface-2 px-2 py-2">
                <dt className="text-[10px] font-bold text-fg-subtle">اشترى بـ</dt>
                <dd className="num mt-0.5 font-heading text-sm font-black text-fg">{customer.spent ? `${formatPrice(customer.spent)} ج` : 'لسه'}</dd>
              </div>
              <div className="rounded-xl bg-surface-2 px-2 py-2">
                <dt className="text-[10px] font-bold text-fg-subtle">آخر كلام</dt>
                <dd className="mt-0.5 truncate font-heading text-sm font-black text-fg">{customer.last}</dd>
              </div>
              <div className="rounded-xl bg-surface-2 px-2 py-2">
                <dt className="text-[10px] font-bold text-fg-subtle">جه من</dt>
                <dd className="mt-0.5 flex items-center justify-center gap-1 font-heading text-sm font-black text-fg">
                  <ChannelMark ch={customer.ch} size="xs" />
                  <span className="truncate">{channel.label}</span>
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-2xl border border-line bg-surface-2/50 p-3.5">
            <p className="text-xs font-bold text-fg-subtle">عايز إيه</p>
            <p className="mt-1 text-sm leading-relaxed text-fg">{customer.want}</p>
          </div>

          <fieldset>
            <legend className="mb-2 block text-xs font-bold text-fg">المرحلة</legend>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {SEGMENTS.map((s) => {
                const Icon = s.icon;
                const active = customer.seg === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => !active && updateCustomerSegment(customer.id, s.id)}
                    className={cn(
                      'flex h-11 items-center justify-center gap-1.5 rounded-xl border px-2 font-heading text-xs font-bold transition-[background-color,border-color,color,transform] duration-150 active:scale-[0.97]',
                      active ? STAGE_ACTIVE[s.tone] : 'border-line bg-surface text-fg-muted hover:border-line-strong hover:text-fg'
                    )}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    {s.label}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div>
            <p className="mb-3 text-xs font-bold text-fg">سجل التعامل</p>
            {customer.tl?.length ? (
              <ol className="relative space-y-3.5 before:absolute before:bottom-2 before:right-[5px] before:top-2 before:w-px before:bg-line">
                {customer.tl.map(([event, date], i) => (
                  <li key={`${event}-${i}`} className="relative flex gap-3">
                    <span
                      className={cn('relative mt-1.5 h-[11px] w-[11px] shrink-0 rounded-full ring-4 ring-surface', i === 0 ? 'bg-amber-500' : 'bg-line-strong')}
                      aria-hidden="true"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold leading-snug text-fg">{event}</p>
                      <p className="mt-0.5 text-xs text-fg-subtle">{date}</p>
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-fg-muted">لسه مفيش تعاملات.</p>
            )}
          </div>
        </div>
      ) : null}
    </Modal>
  );
}

/* ------------------------------------------------------------------
   5. Waiting customers alert (the killer demo moment)
------------------------------------------------------------------- */
function WaitingAlertModal() {
  const { waitingCustomerAlert, setWaitingCustomerAlert, notifyWaitingCustomers, triggerConfetti, formatPrice, getFinalPrice } = useApp();
  const reduce = useReducedMotion();
  const [sendState, setSendState] = useState('idle'); // idle | sending | sent
  const timers = useRef([]);
  const alertRef = useRef(null);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  useEffect(() => {
    if (waitingCustomerAlert) {
      alertRef.current = waitingCustomerAlert;
      clearTimers();
      setSendState('idle');
    }
  }, [waitingCustomerAlert]);

  useEffect(() => clearTimers, []);

  const alert = waitingCustomerAlert || alertRef.current;
  const product = alert?.product;
  const matched = alert?.matchedCustomers || [];

  const send = () => {
    if (sendState !== 'idle' || !waitingCustomerAlert) return;
    const snapshot = waitingCustomerAlert;
    setSendState('sending');
    timers.current.push(
      setTimeout(() => {
        setSendState('sent');
        triggerConfetti();
      }, 900)
    );
    timers.current.push(setTimeout(() => notifyWaitingCustomers(snapshot), 1500));
  };

  const close = () => {
    if (sendState === 'sent' && waitingCustomerAlert) {
      clearTimers();
      notifyWaitingCustomers(waitingCustomerAlert);
      return;
    }
    clearTimers();
    setSendState('idle');
    setWaitingCustomerAlert(null);
  };

  const list = {
    hidden: {},
    show: { transition: { staggerChildren: reduce ? 0 : 0.12, delayChildren: reduce ? 0 : 0.2 } },
  };
  const item = {
    hidden: { opacity: 0, y: reduce ? 0 : 14, scale: reduce ? 1 : 0.97 },
    show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
  };

  const firstName = matched[0]?.name?.split(' ')[0] || '';
  const price = product ? getFinalPrice(product) : 0;

  return (
    <Modal
      isOpen={Boolean(waitingCustomerAlert)}
      onClose={close}
      tone="celebrate"
      icon={BellRing}
      title="فيه عملاء مستنيين القطعة دي"
      subtitle={matched.length ? `${matched.length} عميل سألوا عليها قبل كده وجاهزين يشتروا` : undefined}
      dataTour="waiting-alert"
      footer={
        <div className="flex gap-2">
          <Button variant="secondary" onClick={close} disabled={sendState === 'sending'} className="shrink-0">
            بعدين
          </Button>
          <Button
            variant="whatsapp"
            size="lg"
            block
            data-tour="waiting-alert-send"
            onClick={send}
            loading={sendState === 'sending'}
            aria-live="polite"
            className={cn(sendState === 'sent' && 'bg-emerald-700 hover:bg-emerald-700')}
          >
            {sendState === 'idle' ? <WhatsAppIcon className="h-5 w-5" aria-hidden="true" /> : null}
            {sendState === 'sent' ? <Check className="h-5 w-5" aria-hidden="true" /> : null}
            {sendState === 'sending' ? 'بيتبعت...' : sendState === 'sent' ? 'اتبعت على الواتساب' : `ابعتلهم على الواتساب (${matched.length})`}
          </Button>
        </div>
      }
    >
      {product ? (
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-3 shadow-soft-sm">
            <Thumb src={product.img} className="h-14 w-14 rounded-xl" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <Badge tone="blue" size="xs" icon={PackagePlus}>
                  لسه نازلة
                </Badge>
                <span className="num text-[11px] font-bold text-fg-subtle" dir="ltr">
                  {product.code}
                </span>
              </div>
              <p className="mt-1 truncate font-heading text-sm font-black text-fg">{product.name}</p>
              <p className="mt-0.5 text-xs text-fg-muted">
                <span className="num font-bold text-fg">{formatPrice(price)}</span> ج · فرع {product.branch}
              </p>
            </div>
          </div>

          <motion.ul data-tour="waiting-alert-list" className="space-y-2" variants={list} initial="hidden" animate="show">
            {matched.map((c) => (
              <motion.li key={c.id} variants={item} className="flex items-center gap-3 rounded-2xl border border-line bg-surface-2/60 p-3">
                <Avatar name={c.name} label={c.avatar} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-heading text-sm font-black text-fg">{c.name}</p>
                  <p className="mt-0.5 line-clamp-1 text-xs text-fg-muted">{c.want}</p>
                  <p className="mt-0.5 flex items-center gap-1 text-[11px] text-fg-subtle">
                    <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
                    {c.gov}
                  </p>
                </div>
                <Badge tone="emerald" icon={BadgeCheck} size="xs" className="shrink-0">
                  جاهز يشتري
                </Badge>
              </motion.li>
            ))}
          </motion.ul>

          <div>
            <p className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-fg-muted">
              <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
              الرسالة اللي هتتبعت لكل واحد باسمه
            </p>
            <div className="rounded-2xl bg-[#E7F8EE] p-3 dark:bg-emerald-500/10">
              <div className="ms-auto max-w-[92%] rounded-2xl rounded-tl-md bg-white px-3.5 py-2.5 text-sm leading-relaxed text-ink shadow-soft-sm dark:bg-surface-2 dark:text-fg">
                أهلاً يا {firstName}، {product.name} اللي كنت بتسأل عليه وصل فرع {product.branch} بسعر{' '}
                <span className="num font-bold">{formatPrice(price)}</span> ج. تحب نحجزهولك؟
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
export default function Modals() {
  return (
    <>
      <AddProductModal />
      <AddOfferModal />
      <RecordSaleModal />
      <CustomerModal />
      <WaitingAlertModal />
      <AddDealModal />
    </>
  );
}

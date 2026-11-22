import React, { useMemo, useRef, useState } from 'react';
import { Check, Clock3, Copy, MapPin, Navigation, ShieldCheck, ShoppingCart, Truck, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useMediaQuery } from '../../lib/hooks';
import Modal from '../common/Modal';
import { WhatsAppIcon } from '../common/BrandIcons';
import { Badge, Button, Countdown, Select, StatusBadge } from '../ui';
import ProductCard from './ProductCard';
import { iconFor } from './icons';
import { sizeForProduct } from './ShippingEstimator';
import { cn } from '../../lib/cn';

function ZoomImage({ src, alt, dim }) {
  const [origin, setOrigin] = useState('50% 50%');
  const [zoom, setZoom] = useState(false);
  const fine = useMediaQuery('(hover: hover) and (pointer: fine)');
  const ref = useRef(null);
  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect();
    setOrigin(`${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`);
  };
  return (
    <div
      ref={ref}
      className={cn('relative aspect-[4/3] overflow-hidden rounded-2xl bg-surface-2', fine && 'cursor-zoom-in')}
      onMouseEnter={() => fine && setZoom(true)}
      onMouseLeave={() => setZoom(false)}
      onMouseMove={fine ? onMove : undefined}
    >
      <img
        src={src}
        alt={alt}
        width="800"
        height="600"
        className={cn('h-full w-full object-cover transition-transform duration-200 ease-out', dim && 'grayscale-[70%]')}
        style={{ transform: zoom ? 'scale(1.8)' : 'scale(1)', transformOrigin: origin }}
      />
      {fine ? (
        <span className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-ink/70 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur">
          حرّك الماوس عشان تقرّب
        </span>
      ) : null}
    </div>
  );
}

export default function ProductQuickView() {
  const {
    quickViewProduct: p,
    closeQuickView,
    products,
    categories,
    branches,
    shippingZones,
    itemSizes,
    getOfferForProduct,
    getFinalPrice,
    formatPrice,
    addToCart,
    cart,
    setIsCartOpen,
    getWhatsAppBookingLink,
    showToast,
  } = useApp();
  const isPhone = useMediaQuery('(max-width: 639px)');
  const [zone, setZone] = useState('sharqia');

  const similar = useMemo(() => {
    if (!p) return [];
    return products.filter((x) => x.cat === p.cat && x.code !== p.code && x.status !== 'sold').slice(0, 3);
  }, [p, products]);

  if (!p) return <Modal isOpen={false} onClose={closeQuickView} />;

  const offer = getOfferForProduct(p);
  const final = getFinalPrice(p);
  const saved = p.price - final;
  const isSold = p.status === 'sold';
  const inCart = cart.some((c) => c.code === p.code);
  const cat = categories.find((c) => c.id === p.cat);
  const branch = branches.find((b) => b.locationName === p.branch || b.name.includes(p.branch));
  const size = sizeForProduct(p);
  const z = shippingZones.find((x) => x.id === zone) || shippingZones[0];
  const [lo, hi] = z.prices[size];
  const Icon = iconFor(p.icon);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(p.code);
      showToast(`اتنسخ الكود ${p.code}`, 'info');
    } catch {
      showToast(`الكود: ${p.code}`, 'info');
    }
  };

  const actions = (
    <div className="flex items-center gap-2" data-tour="quickview-actions">
      {isPhone ? (
        <div className="ml-1 shrink-0 leading-tight">
          <span className="num block font-heading text-lg font-black text-fg">{formatPrice(final)} ج</span>
          {saved > 0 ? <span className="num block text-[11px] text-fg-subtle line-through">{formatPrice(p.price)}</span> : null}
        </div>
      ) : null}
      {inCart ? (
        <Button variant="soft" size="lg" className={cn('flex-1', isPhone && 'px-3')} onClick={() => setIsCartOpen(true)}>
          <Check className="h-5 w-5 text-emerald-600" aria-hidden="true" />
          {isPhone ? 'السلة' : 'في السلة'}
        </Button>
      ) : (
        <Button size="lg" className={cn('flex-1', isPhone && 'px-3')} disabled={isSold} onClick={() => addToCart(p)}>
          <ShoppingCart className="h-5 w-5" aria-hidden="true" />
          {isSold ? 'اتباعت' : isPhone ? 'للسلة' : 'أضف للسلة'}
        </Button>
      )}
      <Button
        variant="whatsapp"
        size="lg"
        className={cn('flex-1', isPhone && 'px-3', isSold && 'pointer-events-none opacity-40')}
        href={isSold ? undefined : getWhatsAppBookingLink(p)}
        target="_blank"
        rel="noopener noreferrer"
      >
        <WhatsAppIcon className="h-5 w-5" aria-hidden="true" />
        {isPhone ? 'احجز' : 'احجز واتساب'}
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={Boolean(p)}
      onClose={closeQuickView}
      hideHeader
      maxWidth="sm:max-w-5xl"
      bodyClassName="p-0 sm:p-0"
      dataTour="quickview"
      footer={isPhone ? actions : null}
    >
      <div className="relative">
        <button
          type="button"
          onClick={closeQuickView}
          aria-label="إغلاق"
          className="absolute left-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-surface/90 text-fg shadow-soft backdrop-blur transition-colors hover:bg-surface"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="grid gap-5 p-4 sm:p-6 md:grid-cols-2 md:gap-8">
          {/* Media */}
          <div className="space-y-3">
            {p.img ? (
              <ZoomImage src={p.img} alt={p.name} dim={isSold} />
            ) : (
              <div className="flex aspect-[4/3] items-center justify-center rounded-2xl bg-surface-2 text-fg-subtle">
                <Icon className="h-20 w-20" aria-hidden="true" />
              </div>
            )}
            <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-bold text-fg-muted">
              <span className="flex flex-col items-center gap-1 rounded-xl bg-surface-2 px-2 py-2.5">
                <ShieldCheck className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                متفحصة في المحل
              </span>
              <span className="flex flex-col items-center gap-1 rounded-xl bg-surface-2 px-2 py-2.5">
                <MapPin className="h-4 w-4 text-amber-600" aria-hidden="true" />
                عاين قبل ما تدفع
              </span>
              <span className="flex flex-col items-center gap-1 rounded-xl bg-surface-2 px-2 py-2.5">
                <Truck className="h-4 w-4 text-brand-blue" aria-hidden="true" />
                شحن لكل المحافظات
              </span>
            </div>
          </div>

          {/* Details */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={p.status} />
              {offer && !isSold ? <Badge tone="solidAmber">خصم {offer.pct}%</Badge> : null}
              {p.badge ? <Badge tone="blue">{p.badge}</Badge> : null}
              {p.isNew ? <Badge tone="ink">وصل جديد</Badge> : null}
              <button
                type="button"
                onClick={copyCode}
                className="num inline-flex items-center gap-1 rounded-full border border-line px-2.5 py-1.5 text-[11px] font-bold text-fg-muted transition-colors hover:bg-surface-2"
                aria-label={`انسخ كود القطعة ${p.code}`}
                dir="ltr"
              >
                <Copy className="h-3 w-3" aria-hidden="true" />
                {p.code}
              </button>
            </div>

            <div>
              <h2 className="font-heading text-xl font-black leading-snug text-fg sm:text-2xl">{p.name}</h2>
              {p.condition ? <p className="mt-1.5 text-sm leading-relaxed text-fg-muted">{p.condition}</p> : null}
            </div>

            <div className="rounded-2xl border border-line p-4">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="num font-heading text-3xl font-black text-fg">
                  {formatPrice(final)} <span className="text-base font-bold text-fg-muted">جنيه</span>
                </span>
                {saved > 0 ? <span className="num text-base text-fg-subtle line-through">{formatPrice(p.price)}</span> : null}
                {saved > 0 && !isSold ? (
                  <span className="num rounded-lg bg-emerald-50 px-2 py-1 text-xs font-black text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">هتوفر {formatPrice(saved)} ج</span>
                ) : null}
              </div>
              {offer && !isSold ? (
                <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-line pt-3">
                  <span className="text-xs font-bold text-fg-muted">الخصم يخلص بعد</span>
                  <Countdown ends={offer.ends} />
                </div>
              ) : null}
              {p.status === 'avail' ? (
                <p className="mt-3 flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-300">
                  <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
                  قطعة واحدة بس، واللي يحجز الأول ياخدها
                </p>
              ) : null}
            </div>

            {!isPhone ? actions : null}

            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-2xl bg-surface-2 p-4 text-sm">
              <div>
                <dt className="text-xs text-fg-subtle">القسم</dt>
                <dd className="font-bold text-fg">{cat?.name}</dd>
              </div>
              <div>
                <dt className="text-xs text-fg-subtle">الفرع</dt>
                <dd className="font-bold text-fg">{p.branch}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-xs text-fg-subtle">المكان</dt>
                <dd className="flex flex-wrap items-center justify-between gap-2 font-semibold text-fg">
                  <span className="min-w-0">{branch?.address || p.branch}</span>
                  {branch?.mapUrl ? (
                    <a
                      href={branch.mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-ink px-3 font-heading text-xs font-black text-white transition-colors hover:bg-ink-700 dark:bg-white dark:text-ink"
                    >
                      <Navigation className="h-3.5 w-3.5" aria-hidden="true" />
                      وديني
                    </a>
                  ) : null}
                </dd>
              </div>
            </dl>

            <div className="rounded-2xl border border-line p-4">
              <div className="mb-2 flex items-center gap-2 font-heading text-sm font-black text-fg">
                <Truck className="h-4 w-4 text-brand-blue" aria-hidden="true" />
                الشحن لحد بيتك
              </div>
              <label htmlFor="qv-zone" className="sr-only">
                اختار المحافظة
              </label>
              <Select id="qv-zone" value={zone} onChange={(e) => setZone(e.target.value)}>
                {shippingZones.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </Select>
              <p className="mt-2 text-sm text-fg-muted">
                <span className="num font-heading font-black text-fg">
                  {formatPrice(lo)} لـ {formatPrice(hi)} ج
                </span>{' '}
                ({itemSizes.find((s) => s.id === size)?.name}) · بيوصل {z.days}
              </p>
              <p className="mt-1 text-[11px] text-fg-subtle">سعر تقريبي، بيتأكد مع الفرع حسب المكان بالظبط.</p>
            </div>
          </div>
        </div>

        {similar.length ? (
          <div className="border-t border-line bg-canvas px-4 py-5 sm:px-6">
            <h3 className="mb-3 font-heading text-base font-black text-fg">منتجات شبه دي</h3>
            <ul className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {similar.map((s) => (
                <li key={s.code}>
                  <ProductCard product={s} variant="rail" />
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </Modal>
  );
}

import { sizeForProduct } from '../client/ShippingEstimator';

/** Deal deposits ("DEP-DEAL-801") live in the cart as snapshots, not as real products. */
export const isDepositCode = (code) => String(code || '').startsWith('DEP-');

const AR_DIGITS = '٠١٢٣٤٥٦٧٨٩';
const FA_DIGITS = '۰۱۲۳۴۵۶۷۸۹';

/** Arabic-Indic and Persian digits to 0-9, so "٠١٠" typed on an Arabic keyboard still validates. */
export function toLatinDigits(value = '') {
  return String(value).replace(/[٠-٩۰-۹]/g, (d) => {
    const i = AR_DIGITS.indexOf(d);
    return String(i > -1 ? i : FA_DIGITS.indexOf(d));
  });
}

export const digitsOnly = (value) => toLatinDigits(value).replace(/\D/g, '');

/** Keeps an Egyptian mobile as 11 local digits. Accepts +20 / 0020 pasted numbers. */
export function normalizePhone(value) {
  let d = digitsOnly(value);
  if (d.startsWith('0020')) d = `0${d.slice(4)}`;
  else if (d.startsWith('20') && d.length > 11) d = `0${d.slice(2)}`;
  return d.slice(0, 11);
}

const EG_MOBILE = /^01[0125]\d{8}$/;
export const isEgyptMobile = (value) => EG_MOBILE.test(value || '');

export function phoneError(value, { emptyMessage = 'اكتب رقم موبايلك' } = {}) {
  if (!value) return emptyMessage;
  if (value.length < 11) return 'الرقم ناقص، لازم يكون 11 رقم';
  if (!EG_MOBILE.test(value)) return 'الرقم لازم يبدأ بـ 010 أو 011 أو 012 أو 015';
  return null;
}

/** 01034052401 -> 010 3405 2401 */
export function formatPhone(value = '') {
  const v = String(value);
  if (v.length !== 11) return v;
  return `${v.slice(0, 3)} ${v.slice(3, 7)} ${v.slice(7)}`;
}

/* ---------------- Cards ---------------- */

export const formatCardNumber = (value) =>
  digitsOnly(value)
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, '$1 ');

export function formatExpiry(value) {
  let d = digitsOnly(value).slice(0, 4);
  if (d.length === 1 && Number(d) > 1) d = `0${d}`;
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
}

export function cardBrand(value) {
  const d = digitsOnly(value);
  if (/^5078/.test(d)) return { id: 'meeza', label: 'ميزة' };
  if (/^4/.test(d)) return { id: 'visa', label: 'VISA' };
  if (/^(5[1-5]|2[2-7])/.test(d)) return { id: 'mastercard', label: 'Mastercard' };
  return null;
}

export function cardNumberError(value) {
  const d = digitsOnly(value);
  if (!d) return 'اكتب رقم الكارت';
  if (d.length < 16) return 'رقم الكارت 16 رقم';
  return null;
}

export function expiryError(value) {
  if (!value) return 'اكتب تاريخ الانتهاء';
  const m = /^(\d{2})\/(\d{2})$/.exec(value);
  if (!m) return 'اكتبه كده: MM/YY';
  const month = Number(m[1]);
  const year = 2000 + Number(m[2]);
  if (month < 1 || month > 12) return 'الشهر من 01 لـ 12';
  const now = new Date();
  if (year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1)) return 'الكارت ده منتهي';
  return null;
}

export function cvvError(value) {
  const d = digitsOnly(value);
  if (!d) return 'اكتب الـ CVV';
  if (d.length < 3) return 'الـ CVV 3 أرقام ورا الكارت';
  return null;
}

/** A card expiry two years from now, for the demo fill. */
export function demoExpiry() {
  const yy = String((new Date().getFullYear() + 2) % 100).padStart(2, '0');
  return `12/${yy}`;
}

export const randomDigits = (n) =>
  Array.from({ length: n }, (_, i) => (i === 0 ? 1 + Math.floor(Math.random() * 9) : Math.floor(Math.random() * 10))).join('');

/* ---------------- Shipping ---------------- */

const SIZE_RANK = { small: 0, large: 1, heavy: 2 };

/** The biggest size class in the cart decides the truck, so it decides the price band. */
export function cartShippingSize(cartItems) {
  const sizes = cartItems.filter((i) => !isDepositCode(i.code)).map((i) => sizeForProduct(i.product));
  if (!sizes.length) return null;
  return sizes.reduce((a, b) => (SIZE_RANK[b] > SIZE_RANK[a] ? b : a));
}

export function shippingRange(zone, size) {
  if (!zone || !size) return null;
  const band = zone.prices?.[size];
  if (!band) return null;
  return { lo: band[0], hi: band[1], days: zone.days };
}

/** "الشرقية (الزقازيق، الحسينية)" -> "الشرقية" */
export const shortZoneName = (name = '') => name.replace(/\s*\(.*\)\s*/, '').trim();

/* ---------------- Copy ---------------- */

export const monthsWord = (m) => (m >= 3 && m <= 10 ? 'شهور' : 'شهر');

export function cartOriginalTotal(cartItems) {
  return cartItems.reduce((sum, i) => sum + (Number(i.product.price) || i.finalPrice) * i.quantity, 0);
}

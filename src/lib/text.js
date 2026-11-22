// Arabic-friendly search normalization: unify alef forms, taa marbuta, alef maqsura,
// strip tashkeel and tatweel, lowercase Latin.
export function normalizeAr(input = '') {
  return String(input)
    .toLowerCase()
    .replace(/[ً-ٰٟـ]/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/\s+/g, ' ')
    .trim();
}

export function matchesQuery(haystack, query) {
  const q = normalizeAr(query);
  if (!q) return true;
  const h = normalizeAr(haystack);
  return q.split(' ').every((part) => h.includes(part));
}

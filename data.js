// بيانات مشتركة بين الموقع ولوحة التحكم (نموذج تجريبي — بيانات وهمية)
// الموقع ولوحة التحكم بيقروا ويكتبوا هنا، فأي تعديل في اللوحة يظهر على الموقع.
const BB = (() => {
  const CATS = [
    { id: "home", name: "أجهزة منزلية", icon: "fridge" },
    { id: "ind", name: "معدات صناعية", icon: "gear" },
    { id: "wood", name: "موبيليا وأبواب", icon: "door" },
  ];
  const BRANCHES = ["بحر البقر", "الصالحية"];

  const DEFAULT_PRODUCTS = [
    { code: "BB-101", cat: "home", icon: "fridge", name: "تلاجة 16 قدم نوفروست", branch: "الصالحية", price: 14500, cost: 11000, status: "avail" },
    { code: "BB-102", cat: "home", icon: "washer", name: "غسالة فوق أوتوماتيك 10 كيلو", branch: "الصالحية", price: 9800, cost: 7200, status: "avail" },
    { code: "BB-103", cat: "home", icon: "stove", name: "بوتاجاز 5 شعلة 60×90", branch: "بحر البقر", price: 7200, cost: 5000, status: "held" },
    { code: "BB-104", cat: "home", icon: "tv", name: "شاشة 43 بوصة سمارت", branch: "الصالحية", price: 6500, cost: 4200, status: "sold" },
    { code: "BB-201", cat: "ind", icon: "zap", name: "مكينة لحام ألماني مستوردة", branch: "الصالحية", price: 18000, cost: 12500, status: "avail" },
    { code: "BB-202", cat: "ind", icon: "tank", name: "كمبروسر هواء 100 لتر إيطالي", branch: "الصالحية", price: 12500, cost: 9000, status: "avail" },
    { code: "BB-203", cat: "ind", icon: "gear", name: "موتور 10 حصان 1400 لفة", branch: "بحر البقر", price: 9000, cost: 6000, status: "avail" },
    { code: "BB-301", cat: "wood", icon: "door", name: "باب خشب زان قديم", branch: "بحر البقر", price: 2500, cost: 1200, status: "avail" },
  ];

  const DEFAULT_OFFERS = [
    { id: "o1", scope: "cat", target: "ind", pct: 10, ends: "2026-11-30", active: true },
  ];

  const clone = (v) => JSON.parse(JSON.stringify(v));
  function load(key, def) {
    try {
      const v = localStorage.getItem(key);
      return v ? JSON.parse(v) : clone(def);
    } catch (e) {
      return clone(def);
    }
  }
  function save(key, val) {
    try {
      localStorage.setItem(key, JSON.stringify(val));
      return true;
    } catch (e) {
      return false;
    }
  }

  const today = () => new Date().toISOString().slice(0, 10);
  const MONTHS = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
  const dateAr = (iso) => {
    const [y, m, d] = String(iso).split("-").map(Number);
    return m ? `${d} ${MONTHS[m - 1]}` : iso;
  };
  const catName = (id) => (CATS.find((c) => c.id === id) || {}).name || "";

  function offerTitle(o, products) {
    if (o.scope === "all") return `خصم ${o.pct}% على كل المعروض`;
    if (o.scope === "cat") return `خصم ${o.pct}% على ${catName(o.target)}`;
    const p = (products || []).find((x) => x.code === o.target);
    return `خصم ${o.pct}% على ${p ? p.name : o.target}`;
  }
  function offerFor(p, offers) {
    const live = offers.filter(
      (o) => o.active && o.ends >= today() &&
        (o.scope === "all" || (o.scope === "cat" && o.target === p.cat) || (o.scope === "item" && o.target === p.code))
    );
    if (!live.length) return null;
    return live.reduce((a, b) => (b.pct > a.pct ? b : a));
  }
  function finalPrice(p, offers) {
    const o = offerFor(p, offers);
    return o ? Math.round((p.price * (100 - o.pct)) / 100 / 50) * 50 : p.price;
  }

  return {
    CATS, BRANCHES, catName, offerTitle, offerFor, finalPrice, today, dateAr,
    products: () => load("bb_products", DEFAULT_PRODUCTS),
    saveProducts: (p) => save("bb_products", p),
    offers: () => load("bb_offers", DEFAULT_OFFERS),
    saveOffers: (o) => save("bb_offers", o),
    reset: () => {
      try { localStorage.removeItem("bb_products"); localStorage.removeItem("bb_offers"); } catch (e) {}
    },
    fmt: (n) => Number(n).toLocaleString("en-US"),
  };
})();

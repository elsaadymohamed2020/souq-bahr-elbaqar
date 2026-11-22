import { PITCH } from '../config/pitch';

const OWNER = PITCH.ownerCall;

// The demo motor that triggers the "waiting customer" moment (matches customer kw "موتور").
export const DEMO_MOTOR = {
  name: 'موتور مية 12 حصان مستورد إيطالي',
  cat: 'ind',
  branch: 'بحر البقر',
  price: 11000,
  cost: 7800,
  condition: 'مستورد بحالة الزيرو، متجرب قدامك في المحل',
  img: '/images/products/motor.jpg',
};

/**
 * Tour steps.
 * view: which view must be showing. adminTab: admin tab to open.
 * target: data-tour id to spotlight (null = centered card). component: 'intro' | 'finale'.
 * onEnter / onExit: (app, tour) => void.   waitFor: app event that moves the tour forward.
 * autoAction: what "اعملها بدالي" does on a waiting step.   inModal: target lives inside a modal.
 */
export const TOUR_STEPS = [
  {
    id: 'intro',
    view: 'store',
    component: 'intro',
  },
  {
    id: 'search',
    view: 'store',
    target: 'store-search',
    noScroll: true,
    title: 'الزبون بيدوّر بنفسه',
    body: 'يكتب "تلاجة" أو "موتور" ويلاقي السعر والحالة في ثانية، من غير ما يستنى حد يرد في التعليقات.',
    onEnter: () => window.scrollTo({ top: 0, behavior: 'smooth' }),
  },
  {
    id: 'hero',
    view: 'store',
    target: 'hero-banner',
    title: 'العروض أول حاجة يشوفها',
    body: 'خصم المعدات بعداد تنازلي، والسعر القديم بيتشطب لوحده. إنت بتشغّل العرض من اللوحة بدوسة.',
  },
  {
    id: 'qa',
    view: 'store',
    target: 'quick-answers',
    title: 'بكام؟ فين؟ لسه موجود؟',
    body: 'أكتر 3 أسئلة في تعليقات الريلز، الموقع بيرد عليهم لوحده 24 ساعة. وقتك يا حاج يروح للبيع، مش للرد.',
  },
  {
    id: 'deals',
    view: 'store',
    target: 'deal-rail',
    title: 'عرض النهارده',
    body: 'كل قطعة عليها خصم بتظهر هنا لوحدها، ومكتوب عليها "قطعة واحدة بس" عشان الزبون يحجز بسرعة.',
  },
  {
    id: 'quickview',
    view: 'store',
    target: 'quickview-actions',
    inModal: true,
    title: 'الحجز بدوسة على الواتساب',
    body: 'زرار "احجز واتساب" بيفتح رسالة جاهزة فيها كود القطعة وسعرها والفرع، على رقمك الرسمي بس.',
    onEnter: (app) => app.openQuickView('BB-101'),
    onExit: (app) => app.closeQuickView(),
  },
  {
    id: 'shipping',
    view: 'store',
    target: 'shipping',
    title: 'الزبون البعيد مبقاش بيضيع',
    body: 'اللي من القاهرة والبحيرة والعاشر يعرف الشحن هيكلفه كام قبل ما يسأل، ويكلمك وهو جاهز.',
  },
  {
    id: 'trust',
    view: 'store',
    target: 'verify-number',
    title: 'النصاب ملوش مكان',
    body: 'أي حد يكلم الزبون باسمك، الزبون يكتب الرقم هنا ويعرف في ثانية إنه مش رقمك.',
  },
  {
    id: 'branches',
    view: 'store',
    target: 'branches',
    title: 'المكان فين؟ "وديني"',
    body: 'الفرعين بالمواعيد، وزرار "وديني" بيفتح الخريطة لحد باب المحل.',
  },
  {
    id: 'admin',
    view: 'admin',
    adminTab: 'home',
    target: 'admin-kpis',
    title: `ودي لوحة التحكم بتاعتك يا ${OWNER}`,
    body: 'المبيعات والرسايل والعملاء المستنيين، كله قدامك من الموبايل. أي تعديل هنا بيظهر على الموقع على طول.',
  },
  {
    id: 'inbox',
    view: 'admin',
    adminTab: 'inbox',
    target: 'admin-inbox',
    title: 'كل الرسايل في مكان واحد',
    body: 'واتساب وماسنجر وتعليقات فيسبوك وإنستجرام في صندوق واحد، والرد التلقائي بيبعت العنوان والخريطة لوحده.',
  },
  {
    id: 'add-motor',
    view: 'admin',
    adminTab: 'home',
    target: 'add-product-submit',
    inModal: true,
    interactive: true,
    waitFor: 'product:added',
    title: 'جرّب بنفسك: نزّل قطعة جديدة',
    body: 'البيانات جاهزة: موتور مية 12 حصان. دوس "نزّل القطعة على الموقع" وشوف هيحصل إيه.',
    onEnter: (app) => app.openAddProduct(DEMO_MOTOR),
    autoAction: () => document.querySelector('[data-tour="add-product-submit"]')?.click(),
  },
  {
    id: 'waiting',
    view: 'admin',
    target: 'waiting-alert-send',
    inModal: true,
    interactive: true,
    waitFor: 'customer:notified',
    title: 'السيستم افتكر الزبون لوحده',
    body: 'خالد رمضان كان سايب طلب موتور من أسبوع. أول ما القطعة نزلت، اللوحة نبهتك. دوس وابعتله.',
    autoAction: () => document.querySelector('[data-tour="waiting-alert-send"]')?.click(),
  },
  {
    id: 'motor-live',
    view: 'store',
    target: (tour) => `product-${tour.lastAddedCode || 'BB-401'}`,
    title: 'ونزل على الموقع بالخصم لوحده',
    body: 'الموتور ظهر في "عرض النهارده" بخصم 10% وفي "وصل جديد"، من غير ما تكتب بوست ولا ترد على تعليق.',
  },
  {
    id: 'finale',
    view: 'store',
    component: 'finale',
  },
];

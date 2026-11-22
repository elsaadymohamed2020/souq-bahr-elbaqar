import React, { useEffect, useId, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ClipboardList, Layers, Plus, TrendingDown, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import Modal from '../common/Modal';
import { Badge, Button, Field, Input, LabeledInput, Select, Textarea } from '../ui';
import { useFinePointer } from './adminShared';

const DEAL_CATEGORIES = ['معدات ومواتير', 'حديد ومعادن', 'تبريد وتجهيزات', 'كهرباء ومحولات'];

const DEFAULT_LOCATION = {
  'بحر البقر': 'هنجر المخازن العمومي، بحر البقر',
  الصالحية: 'ساحة التشوين، فرع الصالحية الجديدة',
};

const DEFAULT_ITEMS = [
  { name: 'مواتير سيمنز 15 حصان ألماني', qty: '6 مواتير', spec: 'نحاس أصلي بحالة ممتازة' },
  { name: 'لوحات تحكم وقواطع شنايدر', qty: '2 لوحة', spec: 'قواطع 630 أمبير' },
];

/** The one default for the add-deal form (used on every open). */
export const makeDealForm = () => ({
  title: '',
  totalPrice: '',
  estimatedRetail: '',
  deposit: '',
  category: DEAL_CATEGORIES[0],
  branch: 'بحر البقر',
  location: DEFAULT_LOCATION['بحر البقر'],
  weight: 'حوالي 10 طن',
  condition: 'فحص شامل وتجربة بالكهرباء قبل الشحن',
  desc: 'صفقة تصفية خط إنتاج كامل، والبيع شروة واحدة على بعضها.',
  badge: 'صفقة جديدة',
  items: DEFAULT_ITEMS.map((i) => ({ ...i })),
});

const EMPTY_ITEM = { name: '', qty: '', spec: '' };

export default function AddDealModal() {
  const { isAddDealOpen, setIsAddDealOpen, addDeal, branches, formatPrice } = useApp();
  const reduce = useReducedMotion();
  const ids = { cat: useId(), branch: useId(), desc: useId(), itemName: useId(), itemQty: useId(), itemSpec: useId() };
  const [form, setForm] = useState(makeDealForm);
  const [newItem, setNewItem] = useState(EMPTY_ITEM);
  const fine = useFinePointer();

  useEffect(() => {
    if (isAddDealOpen) {
      setForm(makeDealForm());
      setNewItem(EMPTY_ITEM);
    }
  }, [isAddDealOpen]);

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const close = () => setIsAddDealOpen(false);

  const changeBranch = (branch) =>
    setForm((f) => ({
      ...f,
      branch,
      location: Object.values(DEFAULT_LOCATION).includes(f.location) ? DEFAULT_LOCATION[branch] || f.location : f.location,
    }));

  const addItem = () => {
    if (!newItem.name.trim()) return;
    setForm((f) => ({ ...f, items: [...f.items, { name: newItem.name.trim(), qty: newItem.qty.trim(), spec: newItem.spec.trim() }] }));
    setNewItem(EMPTY_ITEM);
    requestAnimationFrame(() => document.getElementById(ids.itemName)?.focus());
  };

  const removeItem = (idx) => setForm((f) => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));

  const onItemKey = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addItem();
    }
  };

  const submit = (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.totalPrice) return;
    addDeal({ ...form, title: form.title.trim(), itemsCount: `${form.items.length} بنود رئيسية` });
    close();
  };

  const total = Number(form.totalPrice) || 0;
  const retail = Number(form.estimatedRetail) || 0;
  const saving = total && retail > total ? Math.round(((retail - total) / retail) * 100) : 0;
  const branchNames = branches.map((b) => b.locationName);

  return (
    <Modal
      isOpen={isAddDealOpen}
      onClose={close}
      title="صفقة جديدة"
      subtitle="شروة كاملة تتباع على بعضها للتجار والمصانع"
      icon={Layers}
      maxWidth="max-w-2xl"
      footer={
        <div className="flex gap-2">
          <Button variant="secondary" onClick={close} className="shrink-0">
            إلغاء
          </Button>
          <Button type="submit" form="add-deal-form" variant="primary" block>
            نزّل الصفقة على الموقع
          </Button>
        </div>
      }
    >
      <form id="add-deal-form" onSubmit={submit} className="space-y-4">
        <LabeledInput
          label="عنوان الصفقة"
          required
          data-autofocus={fine || undefined}
          placeholder="مثال: تصفية ورشة كاملة، 15 موتور و10 طن كمرات حديد"
          value={form.title}
          onChange={(e) => set({ title: e.target.value })}
        />

        <div className="grid gap-3 sm:grid-cols-3">
          <LabeledInput
            label="السعر على بعضه (ج)"
            required
            type="number"
            inputMode="numeric"
            min="0"
            placeholder="750000"
            className="num"
            value={form.totalPrice}
            onChange={(e) => set({ totalPrice: e.target.value })}
          />
          <LabeledInput
            label="قيمتها في السوق (اختياري)"
            type="number"
            inputMode="numeric"
            min="0"
            placeholder="950000"
            value={form.estimatedRetail}
            onChange={(e) => set({ estimatedRetail: e.target.value })}
          />
          <LabeledInput
            label="العربون (ج)"
            type="number"
            inputMode="numeric"
            min="0"
            placeholder="50000"
            hint="لو سبته فاضي هيبقى 10%"
            value={form.deposit}
            onChange={(e) => set({ deposit: e.target.value })}
          />
        </div>

        {saving ? (
          <Badge tone="emerald" icon={TrendingDown}>
            التاجر هيوفر <span className="num">{saving}%</span> عن سعر السوق ({formatPrice(retail - total)} ج)
          </Badge>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="الفرع" htmlFor={ids.branch}>
            <Select id={ids.branch} value={form.branch} onChange={(e) => changeBranch(e.target.value)}>
              {branchNames.map((b) => (
                <option key={b} value={b}>
                  فرع {b}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="النوع" htmlFor={ids.cat}>
            <Select id={ids.cat} value={form.category} onChange={(e) => set({ category: e.target.value })}>
              {DEAL_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </Field>
          <LabeledInput label="الوزن التقريبي" placeholder="15 طن" value={form.weight} onChange={(e) => set({ weight: e.target.value })} />
        </div>

        <LabeledInput
          label="مكان المعاينة"
          placeholder="هنجر المخازن، بحر البقر"
          value={form.location}
          onChange={(e) => set({ location: e.target.value })}
        />

        <section aria-labelledby="deal-items-title" className="space-y-3 rounded-2xl border border-line bg-surface-2/50 p-3 sm:p-4">
          <div className="flex items-center justify-between gap-2">
            <h4 id="deal-items-title" className="flex items-center gap-1.5 font-heading text-sm font-black text-fg">
              <ClipboardList className="h-4 w-4 text-fg-subtle" aria-hidden="true" />
              كشف المحتويات
            </h4>
            <span className="num text-xs font-bold text-fg-muted">{form.items.length} بند</span>
          </div>

          {form.items.length ? (
            <ul className="space-y-2">
              <AnimatePresence initial={false}>
                {form.items.map((it, idx) => (
                  <motion.li
                    key={`${it.name}-${idx}`}
                    layout={reduce ? false : 'position'}
                    initial={{ opacity: 0, y: reduce ? 0 : 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, transition: { duration: 0.12 } }}
                    className="flex items-start gap-3 rounded-xl border border-line bg-surface p-2.5"
                  >
                    <span className="num flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-xs font-black text-fg-muted">
                      {idx + 1}
                    </span>
                    <div className="min-w-0 flex-1 text-xs">
                      <p className="font-bold text-fg">{it.name}</p>
                      <p className="mt-0.5 flex flex-wrap gap-x-2 text-fg-muted">
                        {it.qty ? <span className="font-semibold">{it.qty}</span> : null}
                        {it.spec ? <span>{it.spec}</span> : null}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(idx)}
                      aria-label={`شيل ${it.name}`}
                      className="shrink-0 text-fg-subtle hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                    >
                      <X className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          ) : (
            <p className="rounded-xl border border-dashed border-line-strong p-3 text-center text-xs text-fg-subtle">لسه مفيش بنود. ضيف أول بند تحت.</p>
          )}

          <div className="grid gap-2 sm:grid-cols-[1.4fr_1fr_1fr_auto]">
            <label htmlFor={ids.itemName} className="sr-only">
              اسم البند
            </label>
            <Input
              id={ids.itemName}
              placeholder="اسم البند، مثلاً مواتير 20 حصان"
              value={newItem.name}
              onChange={(e) => setNewItem((n) => ({ ...n, name: e.target.value }))}
              onKeyDown={onItemKey}
            />
            <label htmlFor={ids.itemQty} className="sr-only">
              الكمية
            </label>
            <Input id={ids.itemQty} placeholder="الكمية" value={newItem.qty} onChange={(e) => setNewItem((n) => ({ ...n, qty: e.target.value }))} onKeyDown={onItemKey} />
            <label htmlFor={ids.itemSpec} className="sr-only">
              المواصفة
            </label>
            <Input id={ids.itemSpec} placeholder="المواصفة" value={newItem.spec} onChange={(e) => setNewItem((n) => ({ ...n, spec: e.target.value }))} onKeyDown={onItemKey} />
            <Button variant="dark" onClick={addItem} disabled={!newItem.name.trim()}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              ضيف
            </Button>
          </div>
        </section>

        <Field label="وصف الصفقة" htmlFor={ids.desc}>
          <Textarea id={ids.desc} rows={3} value={form.desc} onChange={(e) => set({ desc: e.target.value })} />
        </Field>
      </form>
    </Modal>
  );
}

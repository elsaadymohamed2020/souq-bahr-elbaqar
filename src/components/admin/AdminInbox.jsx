import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Bot, CheckCheck, Globe, Inbox, MessageSquareDashed, SendHorizontal, Zap } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useIsDesktop } from '../../lib/hooks';
import { Avatar, Badge, Button, EmptyState, FilterChips, Select } from '../ui';
import { FacebookIcon } from '../common/BrandIcons';
import { cn } from '../../lib/cn';
import { CHANNELS, ChannelMark, SearchField, getChannel, inboxIntent } from './adminShared';

const CHANNEL_ORDER = ['wa', 'fb', 'ms', 'ig'];

const ASSIGNEES = ['الحاج', 'أحمد', 'محمود', 'الرد التلقائي'];
// The stored value stays 'الحاج' (matches the data); the owner is shown by name
const assigneeLabel = (who) => (who === 'الحاج' ? 'الحاج إبراهيم' : who);
const TAGS = [
  { id: 'حجز', label: 'حجز' },
  { id: 'استفسار', label: 'استفسار' },
  { id: 'شحن', label: 'شحن' },
  { id: 'طلب', label: 'طلب خاص' },
];

const QUICK_REPLIES = [
  {
    title: 'العنوان واللوكيشن',
    text: 'أهلاً بحضرتك. فرع بحر البقر: قرية 3 جنب المسجد الكبير، مركز الحسينية.\nاللوكيشن: maps.app.goo.gl/fhwNC2Zct37i7MXb9\nفرع الصالحية الجديدة: maps.app.goo.gl/LhtYGJDiZQWQ2QDh7\nمواعيدنا كل يوم من 9 الصبح لـ 5 المغرب، ورقم الحجز 01034052401',
  },
  { title: 'لينك المعروض', text: 'كل المعروض بالصور والأسعار وحالة كل قطعة على الموقع، وتقدر تحجز منه على طول: [لينك الموقع]' },
  { title: 'القطعة متاحة', text: 'أيوه يا فندم القطعة متاحة ومفحوصة. تحب أحجزهالك باسمك ورقمك قبل ما تتباع؟' },
  { title: 'الشحن للمحافظات', text: 'بنشحن لكل المحافظات بعربيات مجهزة. ابعتلي محافظتك والقطعة وأحسبلك الشحن بالظبط.' },
  { title: 'اتحجزتلك', text: 'تمام، القطعة اتحجزت باسمك لحد بكرة. مستنيينك في الفرع.' },
];

const CUSTOMER_REPLIES = [
  'تمام يا حاج، جاي بكرة الصبح إن شاء الله',
  'طب ممكن صورة تانية للقطعة؟',
  'ألف شكر، هبعتلك اللوكيشن',
  'تمام، احجزهالي باسمي لو سمحت',
  'طب آخر سعر كام يا حاج؟',
  'ربنا يكرمك، هكلمك أول ما أوصل الفرع',
];

const REPLY_DELAY = 1800;
const TYPING_START = 450;

function TypingBubble() {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={{ opacity: 0, y: reduce ? 0 : 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex justify-start"
    >
      <div className="flex items-center gap-2 rounded-2xl rounded-tr-md border border-line bg-surface px-3.5 py-2.5 shadow-soft-sm">
        <span className="flex items-center gap-1" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="h-1.5 w-1.5 rounded-full bg-fg-subtle"
              animate={reduce ? undefined : { y: [0, -3, 0], opacity: [0.5, 1, 0.5] }}
              transition={reduce ? undefined : { duration: 0.9, repeat: 2, delay: i * 0.15 }}
            />
          ))}
        </span>
        <span className="text-xs font-semibold text-fg-muted">بيكتب...</span>
      </div>
    </motion.div>
  );
}

function MessageBubble({ msg, animate }) {
  const reduce = useReducedMotion();
  const isCustomer = msg.f === 'c';
  const isBot = msg.f === 'bot';
  return (
    <motion.div
      initial={animate ? { opacity: 0, y: reduce ? 0 : 8, scale: reduce ? 1 : 0.98 } : false}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      className={cn('flex', isCustomer ? 'justify-start' : 'justify-end')}
    >
      <div
        className={cn(
          'max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-soft-sm sm:max-w-[75%]',
          isCustomer && 'rounded-tr-md border border-line bg-surface text-fg',
          isBot && 'rounded-tl-md border border-violet-200 bg-violet-50 text-violet-950 dark:border-violet-500/25 dark:bg-violet-500/10 dark:text-violet-100',
          !isCustomer && !isBot && 'rounded-tl-md bg-ink text-white dark:bg-ink-700'
        )}
      >
        {isBot ? (
          <p className="mb-1 flex items-center gap-1.5 text-[11px] font-bold text-violet-700 dark:text-violet-300">
            <Bot className="h-3.5 w-3.5" aria-hidden="true" />
            رد تلقائي
          </p>
        ) : null}
        {!isCustomer && !isBot ? <span className="sr-only">إنت: </span> : null}
        <p className="whitespace-pre-line break-words">{msg.t}</p>
        <p
          className={cn(
            'mt-1 flex items-center gap-1 text-[10px]',
            isCustomer ? 'text-fg-subtle' : isBot ? 'text-violet-500 dark:text-violet-300/80' : 'justify-end text-slate-300'
          )}
        >
          <span className="num" dir="ltr">
            {msg.tm}
          </span>
          {!isCustomer && !isBot ? <CheckCheck className="h-3.5 w-3.5 text-sky-300" aria-label="اتقرت" /> : null}
        </p>
      </div>
    </motion.div>
  );
}

function ConversationItem({ convo, selected, onSelect }) {
  const last = convo.msgs[convo.msgs.length - 1];
  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(convo.id)}
        aria-current={selected ? 'true' : undefined}
        className={cn(
          'flex w-full items-start gap-3 rounded-xl p-3 text-right transition-[background-color,transform] duration-150 active:scale-[0.99]',
          selected ? 'bg-surface-2 ring-1 ring-line' : 'hover:bg-surface-2/70'
        )}
      >
        <span className="relative shrink-0">
          <Avatar name={convo.name} label={convo.avatar} />
          <ChannelMark ch={convo.ch} size="xs" className="absolute -bottom-1 -left-1 ring-2 ring-surface" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center justify-between gap-2">
            <span className={cn('truncate font-heading text-sm text-fg', convo.unread ? 'font-black' : 'font-bold')}>{convo.name}</span>
            <span className="shrink-0 text-[11px] text-fg-subtle">{convo.time}</span>
          </span>
          <span className={cn('mt-0.5 flex min-w-0 items-center gap-1 text-xs', convo.unread ? 'font-semibold text-fg' : 'text-fg-muted')}>
            {last?.f === 'bot' ? <Bot className="h-3.5 w-3.5 shrink-0 text-violet-600 dark:text-violet-400" aria-label="رد تلقائي" /> : null}
            {last?.f === 'me' ? <span className="shrink-0 text-fg-subtle">إنت:</span> : null}
            <span className="truncate">{last?.t}</span>
          </span>
          <span className="mt-2 flex flex-wrap items-center gap-1.5">
            <Badge size="xs">{TAGS.find((t) => t.id === convo.tag)?.label || convo.tag}</Badge>
            {convo.auto ? (
              <Badge tone="purple" size="xs" icon={Bot}>
                رد تلقائي
              </Badge>
            ) : null}
            {convo.unread ? (
              <span className="ms-auto inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 dark:text-amber-400">
                <span className="h-2 w-2 rounded-full bg-amber-500" aria-hidden="true" />
                جديدة
              </span>
            ) : null}
          </span>
        </span>
      </button>
    </li>
  );
}

function Thread({ convo, onBack, showBack, typing, onSend, draft, setDraft }) {
  const { updateConversationMeta } = useApp();
  const reduce = useReducedMotion();
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const lastIdRef = useRef(null);
  const channel = getChannel(convo.ch);

  // Keep the newest message in view (instant when switching conversations)
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const switched = lastIdRef.current !== convo.id;
    lastIdRef.current = convo.id;
    el.scrollTo({ top: el.scrollHeight, behavior: switched || reduce ? 'auto' : 'smooth' });
  }, [convo.id, convo.msgs.length, typing, reduce]);

  // Auto-grow the composer
  useLayoutEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
  }, [draft]);

  const submit = (e) => {
    e?.preventDefault();
    if (!draft.trim()) return;
    onSend(draft);
    inputRef.current?.focus();
  };

  const applyQuickReply = (text) => {
    setDraft(text);
    requestAnimationFrame(() => {
      const el = inputRef.current;
      if (!el) return;
      el.focus();
      el.setSelectionRange(el.value.length, el.value.length);
    });
  };

  return (
    <section aria-label={`محادثة ${convo.name}`} className="flex h-full min-h-0 min-w-0 flex-1 flex-col bg-surface">
      <header className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-line px-3 py-2.5 sm:px-4">
        {showBack ? (
          <Button variant="ghost" size="icon" aria-label="رجوع للمحادثات" onClick={onBack} className="-me-1">
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </Button>
        ) : null}
        <span className="relative shrink-0">
          <Avatar name={convo.name} label={convo.avatar} />
          <ChannelMark ch={convo.ch} size="xs" className="absolute -bottom-1 -left-1 ring-2 ring-surface" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="truncate font-heading text-sm font-black text-fg sm:text-base">{convo.name}</h2>
          <p className={cn('truncate text-xs', typing ? 'font-bold text-emerald-700 dark:text-emerald-400' : 'text-fg-muted')} aria-live="polite">
            {typing ? 'بيكتب...' : `على ${channel.label} · مسؤول: ${assigneeLabel(convo.who || 'الحاج')}`}
          </p>
        </div>
        <div className="flex w-full gap-2 sm:w-auto">
          <div className="min-w-0 flex-1 sm:w-36 sm:flex-none">
            <label htmlFor={`who-${convo.id}`} className="sr-only">
              مسؤول المحادثة
            </label>
            <Select
              id={`who-${convo.id}`}
              value={convo.who || 'الحاج'}
              onChange={(e) => updateConversationMeta(convo.id, 'who', e.target.value)}
              className="h-10 text-xs font-bold"
            >
              {ASSIGNEES.map((a) => (
                <option key={a} value={a}>
                  {a === 'الرد التلقائي' ? a : `مسؤول: ${assigneeLabel(a)}`}
                </option>
              ))}
            </Select>
          </div>
          <div className="min-w-0 flex-1 sm:w-32 sm:flex-none">
            <label htmlFor={`tag-${convo.id}`} className="sr-only">
              نوع المحادثة
            </label>
            <Select
              id={`tag-${convo.id}`}
              value={convo.tag || 'استفسار'}
              onChange={(e) => updateConversationMeta(convo.id, 'tag', e.target.value)}
              className="h-10 text-xs font-bold"
            >
              {TAGS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </header>

      {convo.ctx || convo.note ? (
        <div className="flex flex-col gap-1.5 border-b border-line bg-surface-2/60 px-4 py-2 text-xs font-semibold text-fg-muted">
          {convo.ctx ? (
            <p className="flex items-start gap-1.5">
              <FacebookIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-600 dark:text-blue-400" aria-hidden="true" />
              <span>{convo.ctx}</span>
            </p>
          ) : null}
          {convo.note ? (
            <p className="flex items-start gap-1.5">
              <Globe className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
              <span>{convo.note}</span>
            </p>
          ) : null}
        </div>
      ) : null}

      <div ref={scrollRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain bg-canvas/70 px-3 py-4 sm:px-5">
        <div className="flex justify-center">
          <span className="rounded-full bg-surface px-3 py-1 text-[11px] font-bold text-fg-subtle shadow-soft-sm ring-1 ring-line">النهارده</span>
        </div>
        <div key={convo.id} className="space-y-3">
          {convo.msgs.map((m, i) => (
            <MessageBubble key={`${convo.id}-${i}`} msg={m} animate={i >= convo.msgs.length - 1 && convo.msgs.length > 0 && lastIdRef.current === convo.id} />
          ))}
        </div>
        <AnimatePresence>{typing ? <TypingBubble key="typing" /> : null}</AnimatePresence>
      </div>

      <div className="border-t border-line bg-surface">
        <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto px-3 pt-2.5">
          <span className="flex shrink-0 items-center gap-1 text-[11px] font-bold text-fg-subtle">
            <Zap className="h-3.5 w-3.5" aria-hidden="true" />
            رد سريع
          </span>
          {QUICK_REPLIES.map((q) => (
            <button
              key={q.title}
              type="button"
              onClick={() => applyQuickReply(q.text)}
              className="h-9 shrink-0 whitespace-nowrap rounded-full border border-line bg-surface px-3 text-xs font-bold text-fg-muted transition-[background-color,border-color,color,transform] duration-150 hover:border-line-strong hover:bg-surface-2 hover:text-fg active:scale-[0.97]"
            >
              {q.title}
            </button>
          ))}
        </div>
        <form onSubmit={submit} className="flex items-end gap-2 p-3">
          <label htmlFor={`composer-${convo.id}`} className="sr-only">
            اكتب ردك
          </label>
          <textarea
            id={`composer-${convo.id}`}
            ref={inputRef}
            rows={1}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder="اكتب ردك هنا..."
            className="max-h-32 min-h-[44px] flex-1 resize-none rounded-2xl border border-line bg-surface-2 px-4 py-2.5 text-sm leading-relaxed text-fg placeholder:text-fg-subtle transition-[border-color,box-shadow] duration-150 hover:border-line-strong focus:border-amber-500 focus:bg-surface focus:outline-none focus:ring-4 focus:ring-amber-500/15"
          />
          <Button type="submit" variant="dark" size="icon" className="h-11 w-11 shrink-0 rounded-2xl" disabled={!draft.trim()} aria-label="ابعت الرد">
            <SendHorizontal className="h-5 w-5 rotate-180" aria-hidden="true" />
          </Button>
        </form>
        <p className="hidden px-4 pb-2 text-[11px] text-fg-subtle sm:block">Enter للإرسال، و Shift + Enter لسطر جديد</p>
      </div>
    </section>
  );
}

export default function AdminInbox() {
  const { conversations, activeConvId, setActiveConvId, sendMessage, markConversationRead } = useApp();
  const isDesktop = useIsDesktop();
  const [channel, setChannel] = useState('all');
  const [query, setQuery] = useState('');
  const [mobileView, setMobileView] = useState(() => (inboxIntent.openThread ? 'thread' : 'list'));
  const [drafts, setDrafts] = useState({});
  const [typingFor, setTypingFor] = useState(null);

  const sendRef = useRef(sendMessage);
  sendRef.current = sendMessage;
  const timersRef = useRef([]);
  const mountedRef = useRef(true);
  const lastReplyRef = useRef(-1);

  useEffect(() => {
    inboxIntent.openThread = false;
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const counts = useMemo(
    () =>
      conversations.reduce((acc, c) => {
        acc[c.ch] = (acc[c.ch] || 0) + 1;
        return acc;
      }, {}),
    [conversations]
  );

  const channelOptions = [
    { id: 'all', label: 'الكل', count: conversations.length, icon: Inbox },
    ...CHANNEL_ORDER.map((id) => ({ id, label: CHANNELS[id].label, count: counts[id] || 0, icon: CHANNELS[id].icon })),
  ];

  const q = query.trim();
  const filtered = conversations.filter(
    (c) => (channel === 'all' || c.ch === channel) && (!q || c.name.includes(q) || c.msgs.some((m) => m.t.includes(q)))
  );
  const activeConvo = filtered.find((c) => c.id === activeConvId) || null;
  const showThread = isDesktop || (mobileView === 'thread' && Boolean(activeConvo));
  const showList = isDesktop || !showThread;
  const unreadTotal = conversations.filter((c) => c.unread).length;

  // Mark as read whenever the open thread has unread messages
  useEffect(() => {
    if (activeConvo?.unread && showThread) markConversationRead(activeConvo.id);
  }, [activeConvo?.id, activeConvo?.unread, showThread]); // eslint-disable-line react-hooks/exhaustive-deps

  const openConvo = (id) => {
    setActiveConvId(id);
    markConversationRead(id);
    setMobileView('thread');
  };

  const pickReply = () => {
    let i = Math.floor(Math.random() * CUSTOMER_REPLIES.length);
    if (i === lastReplyRef.current) i = (i + 1) % CUSTOMER_REPLIES.length;
    lastReplyRef.current = i;
    return CUSTOMER_REPLIES[i];
  };

  const scheduleCustomerReply = (id) => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [
      setTimeout(() => {
        if (mountedRef.current) setTypingFor(id);
      }, TYPING_START),
      setTimeout(() => {
        sendRef.current(id, pickReply(), 'c');
        if (mountedRef.current) setTypingFor(null);
      }, TYPING_START + REPLY_DELAY),
    ];
  };

  const handleSend = (text) => {
    if (!activeConvo || !text.trim()) return;
    sendMessage(activeConvo.id, text);
    setDrafts((d) => ({ ...d, [activeConvo.id]: '' }));
    scheduleCustomerReply(activeConvo.id);
  };

  const filterLabel = channel === 'all' ? 'كل القنوات' : CHANNELS[channel]?.label;

  return (
    <div className="space-y-4">
      {showList ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <FilterChips ariaLabel="فلتر القنوات" options={channelOptions} value={channel} onChange={setChannel} className="min-w-0 flex-1" />
          <span className="hidden shrink-0 text-xs font-bold text-fg-muted sm:block">
            <span className="num">{unreadTotal}</span> مش مقروءة
          </span>
        </div>
      ) : null}

      <div
        data-tour="admin-inbox"
        className={cn(
          'flex overflow-hidden rounded-card border border-line bg-surface shadow-soft-sm',
          'lg:h-[calc(100vh_-_224px)] lg:min-h-[540px]',
          !isDesktop && showThread && 'h-[calc(100dvh_-_212px_-_env(safe-area-inset-bottom))] min-h-[440px]'
        )}
      >
        {showList ? (
          <aside aria-label="المحادثات" className="flex min-h-0 w-full flex-col lg:w-[340px] lg:shrink-0 lg:border-l lg:border-line">
            <div className="flex items-center gap-2 border-b border-line p-3">
              <SearchField value={query} onChange={setQuery} placeholder="دوّر باسم العميل أو كلمة" size="sm" className="flex-1" />
            </div>
            {filtered.length ? (
              <ul className="min-h-0 flex-1 space-y-1 p-2 lg:overflow-y-auto lg:overscroll-contain">
                {filtered.map((c) => (
                  <ConversationItem key={c.id} convo={c} selected={isDesktop && c.id === activeConvo?.id} onSelect={openConvo} />
                ))}
              </ul>
            ) : (
              <div className="p-3">
                <EmptyState
                  icon={Inbox}
                  title="مفيش رسايل هنا"
                  description={q ? `مفيش محادثة فيها "${q}".` : `مفيش محادثات من ${filterLabel} دلوقتي.`}
                  className="border-0 py-10"
                  action={
                    <Button
                      variant="secondary"
                      size="sm"
                      className="h-10"
                      onClick={() => {
                        setChannel('all');
                        setQuery('');
                      }}
                    >
                      شوف كل الرسايل
                    </Button>
                  }
                />
              </div>
            )}
          </aside>
        ) : null}

        {showThread ? (
          activeConvo ? (
            <Thread
              convo={activeConvo}
              showBack={!isDesktop}
              onBack={() => setMobileView('list')}
              typing={typingFor === activeConvo.id}
              draft={drafts[activeConvo.id] || ''}
              setDraft={(v) => setDrafts((d) => ({ ...d, [activeConvo.id]: v }))}
              onSend={handleSend}
            />
          ) : (
            <div className="hidden flex-1 items-center justify-center bg-canvas/60 p-8 lg:flex">
              <div className="max-w-xs text-center">
                <span className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-2 text-fg-subtle">
                  <MessageSquareDashed className="h-7 w-7" aria-hidden="true" />
                </span>
                <p className="font-heading text-base font-black text-fg">اختار محادثة</p>
                <p className="mt-1 text-sm text-fg-muted">دوس على أي محادثة من القائمة عشان ترد عليها.</p>
              </div>
            </div>
          )
        ) : null}
      </div>
    </div>
  );
}

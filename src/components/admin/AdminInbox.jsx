import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Send,
  MessageCircle,
  Bot,
  User,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { FacebookIcon, InstagramIcon, WhatsAppIcon } from '../common/BrandIcons';

const CHANNEL_CONFIG = {
  wa: { name: 'واتساب', icon: WhatsAppIcon, color: 'text-emerald-500 bg-emerald-50' },
  fb: { name: 'فيسبوك', icon: FacebookIcon, color: 'text-blue-600 bg-blue-50' },
  ms: { name: 'ماسنجر', icon: MessageCircle, color: 'text-sky-500 bg-sky-50' },
  ig: { name: 'إنستجرام', icon: InstagramIcon, color: 'text-pink-500 bg-pink-50' },
};

const QUICK_REPLIES = [
  {
    title: 'العنوان والخريطة',
    text: 'أهلاً بك 👋\nفرع بحر البقر: قرية 3 بجوار المسجد الكبير، مركز الحسينية\nلوكيشن بحر البقر: maps.app.goo.gl/fhwNC2Zct37i7MXb9\n\nفرع الصالحية الجديدة:\nلوكيشن الصالحية: maps.app.goo.gl/LhtYGJDiZQWQ2QDh7\nمواعيدنا يومياً من 9 الصبح لـ 5 المغرب، ورقم الحجز: 01034052401',
  },
  {
    title: 'رابط المعروض والأسعار',
    text: 'كل المعروض بالصور والأسعار الحقيقية وحالة كل قطعة متاح تقدر تشوفه وتحجز مباشرة من هنا: [رابط الموقع]',
  },
  {
    title: 'القطعة متاحة بفضل الله',
    text: 'أيوه يا فندم القطعة متاحة بفضل الله ومفحوصة تماماً، تحب أحجزها باسم حضرتك ورقم تليفونك قبل ما تتباع؟',
  },
  {
    title: 'تفاصيل الشحن للمحافظات',
    text: 'متاح شحن لكل المحافظات بعربيات مجهزة لضمان سلامة الأجهزة. ابعتلنا محافظتك والقطعة ونحسبلك تكلفة الشحن بالظبط.',
  },
];

export default function AdminInbox() {
  const {
    conversations,
    activeConvId,
    setActiveConvId,
    sendMessage,
    markConversationRead,
    updateConversationMeta,
  } = useApp();

  const [activeChannelFilter, setActiveChannelFilter] = useState('all');
  const [inputText, setInputText] = useState('');

  // Filter conversations
  const filteredConvos = conversations.filter(
    (c) => activeChannelFilter === 'all' || c.ch === activeChannelFilter
  );

  const activeConvo = conversations.find((c) => c.id === activeConvId) || conversations[0];

  const handleSelectConvo = (id) => {
    setActiveConvId(id);
    markConversationRead(id);
  };

  const handleSend = (e) => {
    e?.preventDefault();
    if (!inputText.trim()) return;
    sendMessage(activeConvo.id, inputText);
    setInputText('');
  };

  const handleQuickReply = (text) => {
    setInputText(text);
  };

  return (
    <div className="space-y-4">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-3xl shadow-soft border border-slate-200/80">
        <div>
          <h1 className="font-heading font-black text-xl sm:text-2xl text-ink">
            صندوق الرسايل الموحد
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            رسايل واتساب، ماسنجر، تعليقات فيسبوك، وإنستجرام كلها في مكان واحد للرد الفوري.
          </p>
        </div>

        {/* Filter chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', name: 'الكل' },
            { id: 'wa', name: 'واتساب' },
            { id: 'fb', name: 'فيسبوك' },
            { id: 'ms', name: 'ماسنجر' },
            { id: 'ig', name: 'إنستجرام' },
          ].map((ch) => (
            <button
              key={ch.id}
              onClick={() => setActiveChannelFilter(ch.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeChannelFilter === ch.id
                  ? 'bg-ink text-white'
                  : 'bg-slate-100 hover:bg-slate-200/80 text-slate-600'
              }`}
            >
              {ch.name}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[650px] bg-white rounded-3xl shadow-soft border border-slate-200/80 overflow-hidden">
        
        {/* Conversations List (Left/Sidebar in RTL) */}
        <div className="lg:col-span-5 border-l border-slate-200 flex flex-col h-full bg-slate-50/50">
          <div className="p-3.5 border-b border-slate-200 bg-white">
            <span className="text-xs font-bold text-slate-500">المحادثات الواردة ({filteredConvos.length})</span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2 space-y-1">
            {filteredConvos.map((c) => {
              const isSelected = c.id === activeConvo?.id;
              const lastMsg = c.msgs[c.msgs.length - 1];
              const ChannelIcon = CHANNEL_CONFIG[c.ch]?.icon || MessageCircle;

              return (
                <div
                  key={c.id}
                  onClick={() => handleSelectConvo(c.id)}
                  className={`p-3.5 rounded-2xl cursor-pointer transition-all flex items-start gap-3 ${
                    isSelected
                      ? 'bg-white shadow-soft border border-slate-200/80 ring-2 ring-ink/5'
                      : 'hover:bg-white/80'
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-slate-700 to-ink text-white font-heading font-black text-base flex items-center justify-center">
                      {c.avatar}
                    </div>
                    <span className="absolute -bottom-1 -right-1 p-1 rounded-full bg-white shadow-sm border border-slate-200">
                      <ChannelIcon className="w-3 h-3 text-slate-700" />
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-heading font-bold text-sm text-ink truncate">
                        {c.name}
                      </span>
                      <span className="text-[11px] text-slate-400">{c.time}</span>
                    </div>

                    <p className={`text-xs truncate ${c.unread ? 'font-bold text-ink' : 'text-slate-500'}`}>
                      {lastMsg?.f === 'bot' && '🤖 '}
                      {lastMsg?.f === 'me' && 'إنت: '}
                      {lastMsg?.t}
                    </p>

                    <div className="flex items-center gap-1.5 mt-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-200/70 text-slate-700">
                        {c.tag}
                      </span>
                      {c.auto && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-100 text-purple-700 flex items-center gap-1">
                          <Bot className="w-3 h-3" />
                          رد تلقائي
                        </span>
                      )}
                      {c.unread && (
                        <span className="w-2 h-2 rounded-full bg-brand-blue mr-auto" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Conversation Thread (Right) */}
        {activeConvo ? (
          <div className="lg:col-span-7 flex flex-col h-full bg-white">
            
            {/* Thread Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between gap-3 bg-slate-50/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-ink text-white font-heading font-black text-base flex items-center justify-center">
                  {activeConvo.avatar}
                </div>
                <div>
                  <h3 className="font-heading font-bold text-sm text-ink flex items-center gap-2">
                    <span>{activeConvo.name}</span>
                    <span className="text-xs font-normal text-slate-400">
                      via {CHANNEL_CONFIG[activeConvo.ch]?.name}
                    </span>
                  </h3>
                  {activeConvo.note && (
                    <p className="text-xs text-emerald-600 font-medium">{activeConvo.note}</p>
                  )}
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2 text-xs">
                <select
                  value={activeConvo.who || 'الحاج'}
                  onChange={(e) => updateConversationMeta(activeConvo.id, 'who', e.target.value)}
                  className="bg-white border border-slate-200 rounded-xl px-2.5 py-1 text-slate-700 font-medium focus:outline-none"
                >
                  <option value="الحاج">مسؤول: الحاج</option>
                  <option value="أحمد">مسؤول: أحمد</option>
                  <option value="محمود">مسؤول: محمود</option>
                  <option value="الرد التلقائي">الرد التلقائي</option>
                </select>

                <select
                  value={activeConvo.tag || 'استفسار'}
                  onChange={(e) => updateConversationMeta(activeConvo.id, 'tag', e.target.value)}
                  className="bg-white border border-slate-200 rounded-xl px-2.5 py-1 text-slate-700 font-medium focus:outline-none"
                >
                  <option value="حجز">حجز</option>
                  <option value="استفسار">استفسار</option>
                  <option value="شحن">شحن</option>
                  <option value="طلب">طلب خاص</option>
                </select>
              </div>
            </div>

            {/* Context tag if from reel */}
            {activeConvo.ctx && (
              <div className="bg-blue-50/80 px-4 py-2 border-b border-blue-100 text-xs text-blue-900 font-medium flex items-center gap-1.5">
                <FacebookIcon className="w-3.5 h-3.5 text-blue-600" />
                <span>{activeConvo.ctx}</span>
              </div>
            )}

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FAFBFD]">
              {activeConvo.msgs.map((msg, i) => {
                const isCustomer = msg.f === 'c';
                const isBot = msg.f === 'bot';
                const isMe = msg.f === 'me';

                return (
                  <div
                    key={i}
                    className={`flex flex-col ${isCustomer ? 'items-start' : 'items-end'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-3xl p-3.5 text-sm leading-relaxed whitespace-pre-line shadow-sm ${
                        isCustomer
                          ? 'bg-white text-ink border border-slate-200/80 rounded-tr-sm'
                          : isBot
                          ? 'bg-purple-50 text-purple-950 border border-purple-200/80 rounded-tl-sm'
                          : 'bg-ink text-white rounded-tl-sm'
                      }`}
                    >
                      {isBot && (
                        <div className="flex items-center gap-1.5 text-xs font-bold text-purple-700 mb-1.5">
                          <Bot className="w-3.5 h-3.5" />
                          <span>رد تلقائي فوري</span>
                        </div>
                      )}
                      <p>{msg.t}</p>
                      <span className={`text-[10px] block mt-1 ${isCustomer ? 'text-slate-400' : isBot ? 'text-purple-400' : 'text-slate-300'}`}>
                        {msg.tm}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick replies */}
            <div className="p-2 border-t border-slate-100 bg-slate-50 flex items-center gap-1.5 overflow-x-auto">
              <span className="text-[11px] font-bold text-slate-400 px-2 shrink-0">رد سريع:</span>
              {QUICK_REPLIES.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickReply(q.text)}
                  className="px-3 py-1 rounded-full bg-white hover:bg-slate-200/80 border border-slate-200 text-xs font-medium text-slate-700 whitespace-nowrap shrink-0 transition-colors"
                >
                  {q.title}
                </button>
              ))}
            </div>

            {/* Composer */}
            <form onSubmit={handleSend} className="p-3 border-t border-slate-200 bg-white flex items-center gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="اكتب ردك هنا (أو اختر من الردود الجاهزة بالأعلى)..."
                className="flex-1 bg-slate-100 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all placeholder:text-slate-400"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="p-3 rounded-2xl bg-ink hover:bg-slate-800 disabled:opacity-50 text-white transition-all shadow-sm shrink-0"
              >
                <Send className="w-4 h-4 rotate-180" />
              </button>
            </form>

          </div>
        ) : (
          <div className="lg:col-span-7 flex items-center justify-center p-8 text-center text-slate-400">
            اختر محادثة من القائمة لعرضها
          </div>
        )}

      </div>

    </div>
  );
}

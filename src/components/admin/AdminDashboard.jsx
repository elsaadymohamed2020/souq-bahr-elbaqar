import React from 'react';
import { useApp } from '../../context/AppContext';
import AdminHome from './AdminHome';
import AdminInbox from './AdminInbox';
import AdminProducts from './AdminProducts';
import AdminDeals from './AdminDeals';
import AdminOffers from './AdminOffers';
import AdminCRM from './AdminCRM';
import AdminERP from './AdminERP';
import {
  LayoutDashboard,
  MessageSquare,
  Package,
  Layers,
  Tag,
  Users,
  Coins,
  Store,
  ExternalLink,
} from 'lucide-react';

const ADMIN_TABS = [
  { id: 'home', label: 'الرئيسية', icon: LayoutDashboard },
  { id: 'inbox', label: 'الرسايل', icon: MessageSquare, badgeKey: 'unread' },
  { id: 'products', label: 'المنتجات', icon: Package },
  { id: 'deals', label: 'الصفقات واللوطات', icon: Layers },
  { id: 'offers', label: 'العروض', icon: Tag },
  { id: 'crm', label: 'العملاء', icon: Users },
  { id: 'erp', label: 'الحسابات', icon: Coins },
];

export default function AdminDashboard() {
  const { adminTab, setAdminTab, setViewMode, conversations } = useApp();

  const unreadCount = conversations.filter((c) => c.unread).length;

  return (
    <div className="min-h-screen bg-[#F1F4F9] flex flex-col pb-20 lg:pb-10">
      
      {/* Admin Shell Container */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 flex-1 flex flex-col lg:flex-row gap-6">
        
        {/* Desktop Sidebar Navigation */}
        <aside className="hidden lg:flex flex-col w-64 shrink-0 space-y-4">
          <div className="bg-white rounded-3xl p-4 shadow-soft border border-slate-200/80 space-y-1">
            <span className="text-[11px] font-bold text-slate-400 px-3 uppercase tracking-wider block mb-2">
              لوحات الإدارة
            </span>

            {ADMIN_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = adminTab === tab.id;
              const showBadge = tab.badgeKey === 'unread' && unreadCount > 0;

              return (
                <button
                  key={tab.id}
                  onClick={() => setAdminTab(tab.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl font-heading font-bold text-sm transition-all ${
                    isActive
                      ? 'bg-ink text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-ink'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                    <span>{tab.label}</span>
                  </div>

                  {showBadge && (
                    <span className="w-5 h-5 rounded-full bg-brand-blue text-white text-[11px] font-sans flex items-center justify-center font-bold">
                      {unreadCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick link back to store */}
          <div className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 rounded-3xl p-5 border border-amber-300/60 space-y-3">
            <div className="flex items-center gap-2 text-ink font-heading font-bold text-sm">
              <Store className="w-4 h-4 text-amber-600" />
              <span>معاينة واجهة الزبون</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              شاهد كيف تنعكس تعديلاتك وأسعارك فوراً في واجهة المتجر الحية.
            </p>
            <button
              onClick={() => setViewMode('store')}
              className="w-full py-2.5 rounded-xl bg-ink text-white font-heading font-bold text-xs hover:bg-slate-800 transition-all flex items-center justify-center gap-1.5"
            >
              <span>فتح المتجر</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0">
          {adminTab === 'home' && <AdminHome />}
          {adminTab === 'inbox' && <AdminInbox />}
          {adminTab === 'products' && <AdminProducts />}
          {adminTab === 'deals' && <AdminDeals />}
          {adminTab === 'offers' && <AdminOffers />}
          {adminTab === 'crm' && <AdminCRM />}
          {adminTab === 'erp' && <AdminERP />}
        </main>

      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav aria-label="التنقل السريع للإدارة" className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 py-2 flex items-center justify-around shadow-lg">
        {ADMIN_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = adminTab === tab.id;
          const showBadge = tab.badgeKey === 'unread' && unreadCount > 0;

          return (
            <button
              key={tab.id}
              onClick={() => setAdminTab(tab.id)}
              className={`flex flex-col items-center gap-1 p-1.5 rounded-xl text-[10px] font-heading font-bold relative transition-all ${
                isActive ? 'text-ink' : 'text-slate-400'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'text-amber-500' : 'text-slate-400'}`} />
                {showBadge && (
                  <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-brand-blue text-white text-[9px] flex items-center justify-center font-bold font-sans">
                    {unreadCount}
                  </span>
                )}
              </div>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

    </div>
  );
}

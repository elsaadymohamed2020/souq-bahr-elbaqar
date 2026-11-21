import React from 'react';
import { useApp } from '../../context/AppContext';
import { ArrowDownLeft, MapPin, CheckCircle, Flame, ShieldAlert, Sparkles, MessageCircle } from 'lucide-react';

export default function HeroSection() {
  const { formatPrice } = useApp();

  return (
    <section className="relative overflow-hidden bg-ink text-white pt-10 pb-20 sm:pb-28">
      {/* Background radial gradients */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[350px] bg-brand-blue/30 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-[400px] h-[300px] bg-amber-500/20 rounded-full blur-[100px] pointer-events-none" />
      
      {/* Subtle grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.05] pointer-events-none" 
        style={{ 
          backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px)', 
          backgroundSize: '28px 28px' 
        }} 
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Main Hero Copy */}
          <div className="lg:col-span-7 space-y-6 text-right">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300 text-xs sm:text-sm font-semibold">
              <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>أجهزة منزلية فرز أول ومعدات أوروبية مستوردة</span>
            </div>

            <h1 className="font-heading font-black text-3xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.2] text-white">
              كل المعروض بسعره، <br />
              <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 bg-clip-text text-transparent">
                قدامك على الموبايل
              </span>
            </h1>

            <p className="text-slate-300 text-base sm:text-lg max-w-2xl leading-relaxed">
              شوف إيه الموجود في الفرعين، وبكام، ولسه متاح ولا اتباع. واحجز مباشرة على الواتساب في ثانية من غير ما تستنى رد حد في التعليقات.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href="#items"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-ink font-heading font-black text-base shadow-glow-amber transition-all active:scale-95"
              >
                <span>تصفح المعروض والأسعار</span>
                <ArrowDownLeft className="w-5 h-5" />
              </a>

              <a
                href="#branches"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white border border-white/20 font-heading font-bold text-base transition-all active:scale-95"
              >
                <MapPin className="w-5 h-5 text-amber-400" />
                <span>عناوين الفروع والخريطة</span>
              </a>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-800 max-w-xl">
              <div>
                <span className="block font-heading font-black text-2xl sm:text-3xl text-white">
                  +882 ألف
                </span>
                <span className="text-xs sm:text-sm text-slate-400 font-medium">متابع على فيسبوك</span>
              </div>
              <div>
                <span className="block font-heading font-black text-2xl sm:text-3xl text-white">
                  فرعين
                </span>
                <span className="text-xs sm:text-sm text-slate-400 font-medium">بحر البقر والصالحية</span>
              </div>
              <div>
                <span className="block font-heading font-black text-2xl sm:text-3xl text-amber-400">
                  +290 ألف
                </span>
                <span className="text-xs sm:text-sm text-slate-400 font-medium">مشاهدة للريل</span>
              </div>
            </div>

          </div>

          {/* Visual Showcase (Floating Cards) */}
          <div className="lg:col-span-5 relative flex justify-center py-6">
            <div className="relative w-full max-w-[340px] sm:max-w-[380px] h-[340px]">
              
              {/* Card 1: Refrigerator */}
              <div className="absolute top-0 right-0 w-[230px] bg-white rounded-2xl p-3 shadow-2xl border border-slate-100 rotate-[-4deg] hover:rotate-0 transition-transform duration-300 overflow-hidden">
                <div className="h-28 rounded-xl bg-slate-100 relative overflow-hidden">
                  <img
                    src="/images/products/fridge.jpg"
                    alt="تلاجة 16 قدم"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/90 text-emerald-700 shadow-sm">
                    متاح الآن
                  </span>
                </div>
                <div className="mt-2.5 px-1">
                  <h4 className="font-bold text-ink text-sm line-clamp-1">تلاجة 16 قدم نوفروست</h4>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="font-heading font-black text-lg text-ink">
                      14,500 <span className="text-xs font-normal text-slate-500">جنيه</span>
                    </span>
                    <span className="text-[11px] text-slate-400">فرع الصالحية</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Welding Machine */}
              <div className="absolute top-16 left-0 w-[230px] bg-white rounded-2xl p-3 shadow-2xl border border-slate-100 rotate-[6deg] hover:rotate-0 transition-transform duration-300 z-10 overflow-hidden">
                <div className="h-28 rounded-xl bg-slate-100 relative overflow-hidden">
                  <img
                    src="/images/products/welder.jpg"
                    alt="مكينة لحام ألماني"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-ink shadow-sm">
                    خصم 10%
                  </span>
                </div>
                <div className="mt-2.5 px-1">
                  <h4 className="font-bold text-ink text-sm line-clamp-1">مكينة لحام ألماني مستوردة</h4>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="font-heading font-black text-lg text-ink">
                      16,200 <span className="text-xs font-normal text-slate-500">جنيه</span>
                    </span>
                    <span className="text-[11px] line-through text-slate-400">18,000</span>
                  </div>
                </div>
              </div>

              {/* Floating WhatsApp pill */}
              <div className="absolute -bottom-2 right-1/2 translate-x-1/2 z-20 whitespace-nowrap bg-emerald-500 text-white font-bold text-xs sm:text-sm px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-bounce">
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>اتحجزت بضغطة زر على الواتساب</span>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

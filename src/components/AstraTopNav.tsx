import React, { useEffect, useState } from 'react';
import { Language } from '../types';
import { AstraLogo } from './AstraLogo';
import { ASTRONAUT_PROFILE_EVENT, AstronautIdentity, getAstronautIdentity } from '../utils/astronautIdentity';
import { Globe, Menu, Settings, Sparkles } from 'lucide-react';

interface AstraTopNavProps {
  lang: Language;
  onToggleLang: () => void;
  onResetData: () => void;
  onOpenMobileMenu?: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenAssistant: () => void;
  onOpenEmergency?: () => void;
}

export const AstraTopNav: React.FC<AstraTopNavProps> = ({ lang, onToggleLang, onOpenMobileMenu, onOpenAssistant }) => {
  const [astronaut, setAstronaut] = useState<AstronautIdentity>(() => getAstronautIdentity());
  useEffect(() => {
    const update = (event: Event) => setAstronaut((event as CustomEvent<AstronautIdentity>).detail || getAstronautIdentity());
    window.addEventListener(ASTRONAUT_PROFILE_EVENT, update);
    return () => window.removeEventListener(ASTRONAUT_PROFILE_EVENT, update);
  }, []);
  const isAr = lang === 'ar';
  const astronautImage = '/assets/aistudio/file_00000000740082468d45c8f9dd0784f4_8c03b9ab.png';

  return (
    <header className="astra-topbar sticky top-0 z-30 px-4 py-3 sm:px-6">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button type="button" onClick={onOpenMobileMenu} className="rounded-xl border border-white/10 bg-white/[0.04] p-2 text-slate-300 transition hover:border-cyan-200/30 hover:text-white lg:hidden" title={isAr ? 'القائمة' : 'Menu'}><Menu className="h-5 w-5"/></button>
          <div className="flex items-center gap-2 lg:hidden"><AstraLogo size="sm" showText subtitle=""/></div>
          <div className="hidden items-center gap-2 rounded-full border border-white/[0.08] bg-black/20 px-3 py-2 sm:flex"><span className="h-2 w-2 animate-pulse rounded-full bg-emerald-300 shadow-[0_0_10px_#6ee7b7]"/><span className="text-[10px] text-slate-300">{isAr ? 'وحدة أسترا جاهزة' : 'ASTRA node ready'}</span></div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden items-center gap-2 rounded-full border border-white/[0.08] bg-black/20 px-3 py-2 md:flex"><Sparkles className="h-3.5 w-3.5 text-cyan-200"/><span className="text-[10px] text-slate-400">{astronaut.missionName}</span></div>
          <button type="button" onClick={onOpenAssistant} className="hidden items-center gap-2 rounded-full border border-cyan-100/15 bg-cyan-100/[0.05] px-3 py-2 text-[10px] text-cyan-50 transition hover:border-cyan-100/30 sm:flex"><Sparkles className="h-3.5 w-3.5"/>{isAr ? 'اسأل أسترا' : 'Ask Astra'}</button>
          <button type="button" onClick={onToggleLang} className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-[10px] text-slate-300 transition hover:border-cyan-100/30 hover:text-white" title={isAr ? 'تغيير اللغة' : 'Change language'}><Globe className="h-3.5 w-3.5 text-cyan-200"/>{isAr ? 'EN' : 'عربي'}</button>
          <div className="flex max-w-[180px] items-center gap-2 rounded-full border border-white/[0.08] bg-black/20 py-1 pl-1 pr-3">
            <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full border border-cyan-100/30 bg-[#101827]"><img src={astronautImage} alt={isAr ? 'رائد فضاء' : 'Astronaut'} className="h-full w-full object-cover object-[75%_15%]" onError={(event) => { event.currentTarget.style.display = 'none'; }}/></div>
            <div className="min-w-0"><p className="truncate text-[10px] font-semibold text-white">{astronaut.displayName}</p><p className="truncate text-[9px] text-slate-500">{astronaut.rank}</p></div>
          </div>
          <span className="hidden h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-slate-400 lg:flex" title={isAr ? 'عدّل بياناتك من الإعدادات' : 'Edit profile in Settings'}><Settings className="h-4 w-4"/></span>
        </div>
      </div>
    </header>
  );
};

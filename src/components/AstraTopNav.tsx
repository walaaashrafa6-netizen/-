import React from 'react';
import { Language, ModuleTab } from '../types';
import { TRANSLATIONS } from '../utils/translations';
import { AstraLogo } from './AstraLogo';
import { 
  Menu, 
  Globe, 
  Orbit,
  ShieldAlert,
  Search,
  Sparkles
} from 'lucide-react';

interface AstraTopNavProps {
  lang: Language;
  onToggleLang: () => void;
  onResetData: () => void;
  onOpenMobileMenu?: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenAssistant: () => void;
  onOpenEmergency?: () => void;
}

export const AstraTopNav: React.FC<AstraTopNavProps> = ({
  lang,
  onToggleLang,
  onOpenMobileMenu,
  onOpenAssistant,
  onOpenEmergency,
}) => {
  const t = TRANSLATIONS[lang];

  return (
    <header className="sticky top-0 z-30 bg-[#07111F]/90 backdrop-blur-xl border-b border-[#162E48]/80 px-4 sm:px-6 py-3 transition-all">
      <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
        {/* Left: Mobile Menu & ASTRA Logo on small screens */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-xl bg-[#0C1B2B] border border-[#162E48] text-[#A9B8C8] hover:text-white"
            title="Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex lg:hidden items-center gap-2">
            <AstraLogo size="sm" showText={true} subtitle="" />
          </div>
        </div>

        {/* Right: Exactly matching reference image top right bar */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 ml-auto">
          {/* 1. Node Mode (Offline Ready) Pill matching reference */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0C1B2B] border border-[#162E48] text-xs font-mono text-white shadow-inner">
            <span className="w-2 h-2 rounded-full bg-[#35C98A] animate-pulse" />
            <span className="text-[#F2F6FA] text-[11px] font-medium hidden sm:inline">Node Mode</span>
            <span className="text-[#35C98A] text-[11px] font-mono">(Offline Ready)</span>
          </div>

          {/* 2. ISS Mission / Expedition 72 Pill matching reference */}
          <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0C1B2B] border border-[#162E48] text-xs font-mono text-white">
            {/* Spacecraft / Station vector icon */}
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#42C8F5]" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 8h16M4 16h16M10 4v16M14 4v16M2 12h20" strokeLinecap="round" />
            </svg>
            <span className="text-[#A9B8C8] text-[11px]">ISS Mission</span>
            <span className="text-[#42C8F5] text-[11px] font-bold">Expedition 72</span>
          </div>

          {/* 3. Language Switcher */}
          <button
            onClick={onToggleLang}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-full bg-[#0C1B2B] border border-[#162E48] hover:border-[#42C8F5]/50 text-[#A9B8C8] hover:text-white transition-all cursor-pointer"
            title="Toggle Language / تبديل اللغة"
          >
            <Globe className="w-3.5 h-3.5 text-[#42C8F5]" />
            <span className="font-semibold">{lang === 'en' ? 'عربي' : 'EN'}</span>
          </button>

          {/* 4. Astronaut Avatar matching reference */}
          <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full p-0.5 bg-gradient-to-tr from-[#42C8F5] via-[#11263A] to-[#8B7CFF] shadow-[0_0_15px_rgba(66,200,245,0.4)] cursor-pointer select-none">
            <div className="w-full h-full rounded-full overflow-hidden bg-[#07111F] flex items-center justify-center">
              <img
                src="/assets/aistudio/file_00000000740082468d45c8f9dd0784f4_8c03b9ab.png"
                alt="Astronaut Commander"
                className="w-full h-full object-cover object-right-top scale-[2.2]"
              />
            </div>
            {/* Active status ring indicator */}
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#35C98A] border-2 border-[#07111F]" />
          </div>
        </div>
      </div>
    </header>
  );
};

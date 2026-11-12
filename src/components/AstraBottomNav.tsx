import React from 'react';
import { ModuleTab, Language } from '../types';
import { TRANSLATIONS } from '../utils/translations';
import { Home, Moon, Wind, Heart, Sparkles, AlertTriangle } from 'lucide-react';

interface AstraBottomNavProps {
  currentTab: ModuleTab;
  onSelectTab: (tab: ModuleTab) => void;
  lang: Language;
}

export const AstraBottomNav: React.FC<AstraBottomNavProps> = ({
  currentTab,
  onSelectTab,
  lang,
}) => {
  const items = [
    { id: 'overview' as ModuleTab, label: lang === 'ar' ? 'الرئيسية' : 'Home', icon: Home },
    { id: 'sleep' as ModuleTab, label: lang === 'ar' ? 'النوم' : 'Sleep', icon: Moon },
    { id: 'breathing' as ModuleTab, label: lang === 'ar' ? 'التنفس' : 'Breathing', icon: Wind },
    { id: 'wellness' as ModuleTab, label: lang === 'ar' ? 'الرفاهية' : 'Wellness', icon: Heart },
    { id: 'intelligence' as ModuleTab, label: lang === 'ar' ? 'الذكاء' : 'AI Core', icon: Sparkles },
    { id: 'emergency' as ModuleTab, label: lang === 'ar' ? 'الطوارئ' : 'Emergency', icon: AlertTriangle, isAlert: true },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#07111F]/95 backdrop-blur-2xl border-t border-[#162E48] pb-safe shadow-[0_-8px_25px_rgba(0,0,0,0.6)]">
      <div className="grid grid-cols-6 items-center h-16 max-w-lg mx-auto px-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex flex-col items-center justify-center min-h-[44px] py-1 transition-all cursor-pointer ${
                isActive
                  ? 'text-[#42C8F5]'
                  : item.isAlert
                  ? 'text-[#E85D65]'
                  : 'text-[#A9B8C8] hover:text-white'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? 'scale-110 stroke-[2.2] text-[#42C8F5] drop-shadow-[0_0_8px_#42C8F5]' : ''
                  }`}
                />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#42C8F5]" />
                )}
              </div>
              <span
                className={`text-[9px] font-sans tracking-tight mt-1 truncate max-w-[54px] ${
                  isActive ? 'font-bold text-[#42C8F5]' : ''
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

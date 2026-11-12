import React from 'react';
import { ModuleTab, Language } from '../types';
import { TRANSLATIONS } from '../utils/translations';
import { AstraLogo } from './AstraLogo';
import { 
  Home, 
  Moon, 
  Wind, 
  Heart, 
  Activity, 
  Dumbbell, 
  Rocket, 
  BarChart2, 
  Settings, 
  ShieldAlert,
  Clock,
  Sparkles,
  Info,
  Radio,
  Database,
  Cpu
} from 'lucide-react';

interface AstraSidebarProps {
  currentTab: ModuleTab;
  onSelectTab: (tab: ModuleTab) => void;
  lang: Language;
  onOpenAppIconModal?: () => void;
}

export const AstraSidebar: React.FC<AstraSidebarProps> = ({
  currentTab,
  onSelectTab,
  lang,
  onOpenAppIconModal,
}) => {
  const t = TRANSLATIONS[lang];

  const menuItems = [
    { id: 'overview' as ModuleTab, label: lang === 'ar' ? 'الرئيسية' : 'Home', icon: Home },
    { 
      id: 'health_core' as ModuleTab, 
      label: lang === 'ar' ? 'نواة الصحة وبيانات NASA' : 'Health Core & NASA', 
      icon: Database 
    },
    { 
      id: 'predict' as ModuleTab, 
      label: lang === 'ar' ? 'ASTRA التنبؤ والاتصال' : 'ASTRA PREDICT', 
      icon: Radio,
      highlight: true
    },
    { 
      id: 'intelligence' as ModuleTab, 
      label: lang === 'ar' ? '🧠 نواة الذكاء والتكامل' : '🧠 Intelligence Core', 
      icon: Cpu,
      highlight: true
    },
    { id: 'sleep' as ModuleTab, label: lang === 'ar' ? 'إدارة النوم' : 'Sleep Orbit', icon: Moon },
    { id: 'breathing' as ModuleTab, label: lang === 'ar' ? 'متابعة التنفس' : 'Respiratory Orbit', icon: Wind },
    { id: 'wellness' as ModuleTab, label: lang === 'ar' ? 'الرفاهية والصحة' : 'Wellness', icon: Heart },
    { id: 'body' as ModuleTab, label: lang === 'ar' ? 'المؤشرات الجسدية' : 'Body Orbit', icon: Activity },
    { id: 'motion' as ModuleTab, label: lang === 'ar' ? 'النشاط البدني' : 'Motion Orbit', icon: Dumbbell },
    { id: 'foresight' as ModuleTab, label: lang === 'ar' ? 'استشراف المهمة' : 'Mission Foresight', icon: Rocket },
    { id: 'reports' as ModuleTab, label: lang === 'ar' ? 'التقارير' : 'Reports', icon: BarChart2 },
    { id: 'settings' as ModuleTab, label: lang === 'ar' ? 'الإعدادات' : 'Settings', icon: Settings },
    { 
      id: 'emergency' as ModuleTab, 
      label: lang === 'ar' ? 'مركز الطوارئ والإنقاذ' : 'Emergency Center', 
      icon: ShieldAlert,
      isEmergency: true 
    },
  ];

  return (
    <aside className="w-64 shrink-0 hidden lg:flex flex-col justify-between h-screen sticky top-0 bg-[#07111F]/95 backdrop-blur-2xl border-r border-[#162E48] p-4 select-none z-30 transition-all">
      {/* 1. Header: ASTRA Geometric Logo + Wordmark matching reference */}
      <div>
        <div 
          onClick={() => onSelectTab('overview')}
          className="flex items-center gap-3.5 py-3 px-3 mb-6 rounded-2xl bg-[#0C1B2B]/60 border border-[#162E48]/80 hover:border-[#42C8F5]/40 transition-all cursor-pointer group"
        >
          <AstraLogo size="md" showText={false} />
          <div className="flex flex-col">
            <span className="font-display font-bold tracking-[0.16em] text-white text-lg group-hover:text-[#42C8F5] transition-colors leading-none">
              ASTRA
            </span>
            <span className="text-[10px] text-[#A9B8C8] font-sans tracking-wide mt-1">
              Astronaut Health Companion
            </span>
          </div>
        </div>

        {/* 2. Menu Items matching reference list and styling */}
        <nav className="space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-sans font-medium transition-all duration-200 group relative cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-[#173B60] to-[#008CC8] text-white font-bold shadow-[0_4px_18px_rgba(66,200,245,0.3)] border border-[#42C8F5]/40'
                    : item.isEmergency
                    ? 'text-[#E85D65] hover:bg-[#E85D65]/10 border border-[#E85D65]/30 font-semibold'
                    : 'text-[#A9B8C8] hover:text-white hover:bg-[#0C1B2B] border border-transparent hover:border-[#162E48]'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-transform ${
                    isActive ? 'scale-110 text-white' : item.isEmergency ? 'text-[#E85D65] animate-pulse' : 'text-[#A9B8C8] group-hover:text-[#42C8F5]'
                  }`}
                />
                <span className="truncate">{item.label}</span>
                {item.isEmergency && !isActive && (
                  <span className="ml-auto w-2 h-2 rounded-full bg-[#E85D65] animate-ping" />
                )}
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#42C8F5] shadow-[0_0_8px_#42C8F5]" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* 3. Bottom Widget: Mission Time matching reference image */}
      <div className="space-y-3 pt-3 border-t border-[#162E48]">
        {/* Mission Time Card: (Clock icon + Mission Time + T+ 12d 04h) */}
        <div className="p-3 rounded-2xl bg-[#0C1B2B] border border-[#162E48] flex items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2 text-[#A9B8C8]">
            <Clock className="w-4 h-4 text-[#42C8F5]" />
            <span>Mission Time</span>
          </div>
          <span className="text-white font-bold tracking-wider">T+ 12d 04h</span>
        </div>

        {/* App Icon Showcase Trigger */}
        {onOpenAppIconModal && (
          <button
            onClick={onOpenAppIconModal}
            className="w-full py-2 px-3 rounded-xl bg-[#11263A] border border-[#162E48] hover:border-[#42C8F5]/50 text-[#A9B8C8] hover:text-white text-[11px] font-mono flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#42C8F5]" />
            <span>{lang === 'ar' ? 'عرض أيقونة التطبيق والهوية' : 'View App Icon & Identity'}</span>
          </button>
        )}
      </div>
    </aside>
  );
};

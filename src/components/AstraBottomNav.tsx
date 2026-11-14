import React from 'react';
import { ModuleTab, Language } from '../types';
import { AlertTriangle, Home, Moon, Radio, Sparkles, Wind } from 'lucide-react';

interface AstraBottomNavProps { currentTab: ModuleTab; onSelectTab: (tab: ModuleTab) => void; lang: Language; }

export const AstraBottomNav: React.FC<AstraBottomNavProps> = ({ currentTab, onSelectTab, lang }) => {
  const items = [
    { id: 'overview' as ModuleTab, label: lang === 'ar' ? 'الرئيسية' : 'Home', icon: Home },
    { id: 'sleep' as ModuleTab, label: lang === 'ar' ? 'النوم' : 'Sleep', icon: Moon },
    { id: 'breathing' as ModuleTab, label: lang === 'ar' ? 'التنفس' : 'Breathing', icon: Wind },
    { id: 'predict' as ModuleTab, label: 'PREDICT', icon: Radio },
    { id: 'intelligence' as ModuleTab, label: 'ASTRA AI', icon: Sparkles },
    { id: 'emergency' as ModuleTab, label: lang === 'ar' ? 'الطوارئ' : 'SOS', icon: AlertTriangle, alert: true },
  ];
  return <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-cyan-100/10 bg-[#050a14]/90 pb-safe shadow-[0_-8px_30px_rgba(0,0,0,.4)] backdrop-blur-2xl lg:hidden"><div className="mx-auto grid h-16 max-w-xl grid-cols-6 items-center px-1">{items.map((item) => {const Icon = item.icon; const active = currentTab === item.id; return <button key={item.id} type="button" onClick={() => onSelectTab(item.id)} className={`flex min-h-[48px] flex-col items-center justify-center gap-1 rounded-xl text-[9px] transition ${active ? 'text-cyan-100' : item.alert ? 'text-rose-200' : 'text-slate-500 hover:text-slate-200'}`} aria-current={active ? 'page' : undefined}><span className={`flex h-7 w-8 items-center justify-center rounded-lg ${active ? 'bg-cyan-100/[0.09]' : ''}`}><Icon className={`h-[18px] w-[18px] ${active ? 'drop-shadow-[0_0_8px_rgba(66,200,245,.8)]' : ''}`}/></span><span className="max-w-[58px] truncate">{item.label}</span></button>;})}</div></nav>;
};

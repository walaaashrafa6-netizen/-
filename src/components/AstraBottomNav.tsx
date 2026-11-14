import React from 'react';
import { ModuleTab, Language } from '../types';
import { AlertTriangle, Activity, Home, Radio, Sparkles } from 'lucide-react';

interface AstraBottomNavProps {
  currentTab: ModuleTab;
  onSelectTab: (tab: ModuleTab) => void;
  lang: Language;
}

export const AstraBottomNav: React.FC<AstraBottomNavProps> = ({ currentTab, onSelectTab, lang }) => {
  const ar = lang === 'ar';
  const items = [
    { id: 'overview' as ModuleTab, label: ar ? 'المهمة' : 'Mission', icon: Home },
    { id: 'health_core' as ModuleTab, label: ar ? 'الصحة' : 'Health', icon: Activity },
    { id: 'predict' as ModuleTab, label: 'PREDICT', icon: Radio },
    { id: 'intelligence' as ModuleTab, label: 'ASTRA AI', icon: Sparkles },
    { id: 'emergency' as ModuleTab, label: ar ? 'طوارئ' : 'SOS', icon: AlertTriangle, alert: true },
  ];

  return (
    <nav className="astra-mobile-nav" aria-label={ar ? 'التنقل الرئيسي' : 'Primary navigation'}>
      {items.map(({ id, label, icon: Icon, alert }) => (
        <button
          type="button"
          key={id}
          aria-current={currentTab === id ? 'page' : undefined}
          aria-label={label}
          className={`astra-mobile-nav-item${currentTab === id ? ' is-active' : ''}${alert ? ' is-emergency' : ''}`}
          onClick={() => onSelectTab(id)}
        >
          <Icon aria-hidden="true" />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
};

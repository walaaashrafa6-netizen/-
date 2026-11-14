import React from 'react';
import { ModuleTab, Language } from '../types';
import { AstraLogo } from './AstraLogo';
import {
  Activity, BarChart3, Database, Dumbbell, Heart, Home, Moon, Radio,
  Rocket, Settings, ShieldAlert, Sparkles, Wind,
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
  const ar = lang === 'ar';
  const groups = [
    {
      title: ar ? 'المهمة' : 'MISSION',
      items: [{ id: 'overview' as ModuleTab, label: ar ? 'نظرة المهمة' : 'Mission overview', icon: Home }],
    },
    {
      title: ar ? 'الصحة' : 'HEALTH',
      items: [
        { id: 'health_core' as ModuleTab, label: ar ? 'مركز الصحة' : 'Health core', icon: Database },
        { id: 'sleep' as ModuleTab, label: ar ? 'النوم' : 'Sleep orbit', icon: Moon },
        { id: 'wellness' as ModuleTab, label: ar ? 'العافية' : 'Wellness', icon: Heart },
        { id: 'breathing' as ModuleTab, label: ar ? 'التنفس' : 'Respiratory', icon: Wind },
        { id: 'body' as ModuleTab, label: ar ? 'المؤشرات الحيوية' : 'Body metrics', icon: Activity },
        { id: 'motion' as ModuleTab, label: ar ? 'الحركة' : 'Motion', icon: Dumbbell },
      ],
    },
    {
      title: ar ? 'أنظمة المهمة' : 'MISSION SYSTEMS',
      items: [
        { id: 'intelligence' as ModuleTab, label: 'ASTRA AI', icon: Sparkles },
        { id: 'predict' as ModuleTab, label: 'ASTRA PREDICT', icon: Radio },
        { id: 'foresight' as ModuleTab, label: ar ? 'استشراف المهمة' : 'Mission foresight', icon: Rocket },
        { id: 'reports' as ModuleTab, label: ar ? 'التقارير' : 'Reports', icon: BarChart3 },
      ],
    },
    {
      title: ar ? 'النظام' : 'SYSTEM',
      items: [
        { id: 'emergency' as ModuleTab, label: ar ? 'مركز الطوارئ' : 'Emergency center', icon: ShieldAlert, emergency: true },
        { id: 'settings' as ModuleTab, label: ar ? 'الإعدادات' : 'Settings', icon: Settings },
      ],
    },
  ];

  return (
    <aside className="astra-sidebar hidden lg:flex">
      <button className="astra-brand" onClick={() => onSelectTab('overview')} aria-label="ASTRA mission overview">
        <AstraLogo size="md" showText={false} />
        <span><strong>ASTRA</strong><small>{ar ? 'دعم المهمة' : 'MISSION SUPPORT'}</small></span>
      </button>
      <nav className="astra-side-groups" aria-label={ar ? 'التنقل الرئيسي' : 'Primary navigation'}>
        {groups.map((group) => (
          <section className="astra-nav-group" key={group.title}>
            <h2>{group.title}</h2>
            {group.items.map(({ id, label, icon: Icon, emergency }) => (
              <button
                key={id}
                type="button"
                aria-current={currentTab === id ? 'page' : undefined}
                className={`astra-nav-item${currentTab === id ? ' is-active' : ''}${emergency ? ' is-emergency' : ''}`}
                onClick={() => onSelectTab(id)}
              >
                <Icon aria-hidden="true" />
                <span>{label}</span>
              </button>
            ))}
          </section>
        ))}
      </nav>
      {onOpenAppIconModal && (
        <button type="button" className="astra-identity-link" onClick={onOpenAppIconModal}>
          {ar ? 'هوية ASTRA' : 'ASTRA identity'}
        </button>
      )}
    </aside>
  );
};

import React, { useState, useEffect } from 'react';
import { 
  ModuleTab, 
  Language, 
  SleepRecord, 
  WellnessRecord, 
  RespiratoryRecord, 
  AstronautProfile,
  WellnessTask,
  MissionBadge,
  BodyMetricRecord,
  HealthEventRecord
} from './types';
import { 
  getSavedSleepRecords, 
  saveSleepRecords, 
  getSavedWellnessRecords, 
  saveWellnessRecords, 
  getSavedRespiratoryRecords, 
  saveRespiratoryRecords, 
  getSavedProfile, 
  saveProfile, 
  getSavedTasks,
  saveTasks,
  getSavedBadges,
  saveBadges,
  resetAllStorageData 
} from './utils/storage';
import { 
  getSavedBodyMetrics, 
  saveBodyMetrics, 
  getSavedHealthEvents, 
  saveHealthEvents 
} from './utils/healthCoreEngine';
import { TRANSLATIONS } from './utils/translations';
import { AstraSidebar } from './components/AstraSidebar';
import { AstraTopNav } from './components/AstraTopNav';
import { AstraBottomNav } from './components/AstraBottomNav';
import { OverviewView } from './components/OverviewView';
import { SleepOrbitView } from './components/SleepOrbitView';
import { RespiratoryOrbitView } from './components/RespiratoryOrbitView';
import { MindOrbitView } from './components/MindOrbitView';
import { BodyOrbitView } from './components/BodyOrbitView';
import { MotionOrbitView } from './components/MotionOrbitView';
import { MissionForesightView } from './components/MissionForesightView';
import { ReportsView } from './components/ReportsView';
import { SettingsView } from './components/SettingsView';
import { AssistantView } from './components/AssistantView';
import { EmergencyRescueView } from './components/EmergencyRescueView';
import { PredictiveMissionView } from './components/PredictiveMissionView';
import { HealthCoreHub } from './components/HealthCoreHub';
import { IntelligenceCoreHub } from './components/IntelligenceCoreHub';
import { AstraAppIconCard } from './components/AstraAppIconCard';
import { ShieldAlert, Sparkles, X, Radio, Database } from 'lucide-react';

export default function App() {
  const [profile, setProfile] = useState<AstronautProfile>(() => getSavedProfile());
  const [lang, setLang] = useState<Language>(() => profile.language || 'ar');
  const [currentTab, setCurrentTab] = useState<ModuleTab>('overview');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [showAppIconModal, setShowAppIconModal] = useState<boolean>(false);

  const [sleepRecords, setSleepRecords] = useState<SleepRecord[]>(() => getSavedSleepRecords());
  const [wellnessRecords, setWellnessRecords] = useState<WellnessRecord[]>(() => getSavedWellnessRecords());
  const [respiratoryRecords, setRespiratoryRecords] = useState<RespiratoryRecord[]>(() => getSavedRespiratoryRecords());
  const [bodyMetrics, setBodyMetrics] = useState<BodyMetricRecord[]>(() => getSavedBodyMetrics());
  const [healthEvents, setHealthEvents] = useState<HealthEventRecord[]>(() => getSavedHealthEvents());
  const [tasks, setTasks] = useState<WellnessTask[]>(() => getSavedTasks());
  const [badges, setBadges] = useState<MissionBadge[]>(() => getSavedBadges());

  // Handle document direction for Arabic support
  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  const handleToggleLang = () => {
    const nextLang: Language = lang === 'en' ? 'ar' : 'en';
    setLang(nextLang);
    const updated = { ...profile, language: nextLang };
    setProfile(updated);
    saveProfile(updated);
  };

  // Sleep handlers
  const handleSaveSleep = (record: SleepRecord) => {
    setSleepRecords((prev) => {
      const exists = prev.findIndex((r) => r.id === record.id);
      let updated: SleepRecord[];
      if (exists >= 0) {
        updated = [...prev];
        updated[exists] = record;
      } else {
        updated = [...prev, record];
      }
      updated.sort((a, b) => a.date.localeCompare(b.date));
      saveSleepRecords(updated);
      return updated;
    });
  };

  const handleDeleteSleep = (id: string) => {
    setSleepRecords((prev) => {
      const updated = prev.filter((r) => r.id !== id);
      saveSleepRecords(updated);
      return updated;
    });
  };

  // Wellness handlers
  const handleSaveWellness = (record: WellnessRecord) => {
    setWellnessRecords((prev) => {
      const exists = prev.findIndex((r) => r.id === record.id);
      let updated: WellnessRecord[];
      if (exists >= 0) {
        updated = [...prev];
        updated[exists] = record;
      } else {
        updated = [...prev, record];
      }
      updated.sort((a, b) => a.date.localeCompare(b.date));
      saveWellnessRecords(updated);
      return updated;
    });
  };

  const handleDeleteWellness = (id: string) => {
    setWellnessRecords((prev) => {
      const updated = prev.filter((r) => r.id !== id);
      saveWellnessRecords(updated);
      return updated;
    });
  };

  // Respiratory handlers
  const handleSaveRespiratory = (record: RespiratoryRecord) => {
    setRespiratoryRecords((prev) => {
      const updated = [...prev, record];
      saveRespiratoryRecords(updated);
      return updated;
    });
  };

  // Body Metrics handlers
  const handleSaveBodyMetric = (record: BodyMetricRecord) => {
    setBodyMetrics((prev) => {
      const updated = [record, ...prev];
      saveBodyMetrics(updated);
      return updated;
    });
  };

  // Health Event handler
  const handleSaveHealthEvent = (event: HealthEventRecord) => {
    setHealthEvents((prev) => {
      const updated = [event, ...prev];
      saveHealthEvents(updated);
      return updated;
    });
  };

  // Batch import handlers
  const handleBatchImportSleep = (newSleepRecords: SleepRecord[]) => {
    setSleepRecords((prev) => {
      const combined = [...newSleepRecords, ...prev];
      // remove duplicate IDs
      const unique = Array.from(new Map(combined.map((r) => [r.id, r])).values());
      unique.sort((a, b) => a.date.localeCompare(b.date));
      saveSleepRecords(unique);
      return unique;
    });
  };

  const handleBatchImportBodyMetrics = (newMetrics: BodyMetricRecord[]) => {
    setBodyMetrics((prev) => {
      const combined = [...newMetrics, ...prev];
      const unique = Array.from(new Map(combined.map((r) => [r.id, r])).values());
      unique.sort((a, b) => b.timestamp - a.timestamp);
      saveBodyMetrics(unique);
      return unique;
    });
  };

  // Task handlers
  const handleToggleTask = (taskId: string) => {
    setTasks((prev) => {
      const updated = prev.map((t) =>
        t.id === taskId ? { ...t, completed: !t.completed } : t
      );
      saveTasks(updated);
      return updated;
    });
  };

  const handleAddTask = (title: string, titleAr: string) => {
    const newTask: WellnessTask = {
      id: `task-${Date.now()}`,
      title,
      titleAr,
      time: '18:00 UTC',
      completed: false,
      category: 'readiness',
    };
    setTasks((prev) => {
      const updated = [...prev, newTask];
      saveTasks(updated);
      return updated;
    });
  };

  // Profile update
  const handleUpdateProfile = (p: AstronautProfile) => {
    setProfile(p);
    saveProfile(p);
  };

  // Demo reset
  const handleResetData = () => {
    const t = TRANSLATIONS[lang];
    if (window.confirm(t.resetConfirm)) {
      resetAllStorageData();
      setSleepRecords(getSavedSleepRecords());
      setWellnessRecords(getSavedWellnessRecords());
      setRespiratoryRecords(getSavedRespiratoryRecords());
      setTasks(getSavedTasks());
      setBadges(getSavedBadges());
      setProfile(getSavedProfile());
      setCurrentTab('overview');
    }
  };

  return (
    <div className="min-h-screen bg-deep-cosmos text-[#F2F5F8] flex flex-col lg:flex-row selection:bg-[#36D9FF]/20 selection:text-[#36D9FF]">
      {/* 1. Left Desktop Sidebar matching reference image */}
      <AstraSidebar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          setMobileMenuOpen(false);
        }}
        lang={lang}
        onOpenAppIconModal={() => setShowAppIconModal(true)}
      />

      {/* Mobile Drawer Menu for smaller screens */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md lg:hidden flex">
          <div className="w-72 bg-[#080B16] h-full p-4 border-r border-[#1E2D4A] flex flex-col justify-between">
            <div className="flex items-center justify-between pb-3 border-b border-[#1E2D4A]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#36D9FF]" />
                <span className="font-display font-bold text-white">ASTRA Navigation</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="space-y-2 my-4 flex-1 overflow-y-auto">
              {[
                { id: 'overview' as ModuleTab, label: lang === 'ar' ? 'الرئيسية' : 'Overview' },
                { id: 'health_core' as ModuleTab, label: lang === 'ar' ? '🛡️ نواة الصحة وبيانات NASA' : '🛡️ Health Core & NASA' },
                { id: 'predict' as ModuleTab, label: lang === 'ar' ? '📡 ASTRA التنبؤ والاتصال' : '📡 ASTRA PREDICT' },
                { id: 'intelligence' as ModuleTab, label: lang === 'ar' ? '🧠 نواة الذكاء والتكامل' : '🧠 Intelligence Core' },
                { id: 'sleep' as ModuleTab, label: lang === 'ar' ? 'إدارة النوم' : 'Sleep Orbit' },
                { id: 'breathing' as ModuleTab, label: lang === 'ar' ? 'متابعة التنفس' : 'Respiratory Orbit' },
                { id: 'wellness' as ModuleTab, label: lang === 'ar' ? 'الرفاهية النفسية' : 'Wellness' },
                { id: 'body' as ModuleTab, label: lang === 'ar' ? 'المؤشرات الجسدية' : 'Body Orbit' },
                { id: 'motion' as ModuleTab, label: lang === 'ar' ? 'النشاط البدني' : 'Motion Orbit' },
                { id: 'foresight' as ModuleTab, label: lang === 'ar' ? 'استشراف المهمة' : 'Mission Foresight' },
                { id: 'reports' as ModuleTab, label: lang === 'ar' ? 'السجلات والتقارير' : 'History & Reports' },
                { id: 'settings' as ModuleTab, label: lang === 'ar' ? 'الإعدادات' : 'Settings' },
                { id: 'emergency' as ModuleTab, label: lang === 'ar' ? '🚨 طوارئ ناسا والإنقاذ' : '🚨 NASA Emergency SOS' },
                { id: 'assistant' as ModuleTab, label: lang === 'ar' ? 'مساعد أسترا الذكي' : 'ASTRA AI' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-right p-3 rounded-xl text-xs font-sans transition-all ${
                    currentTab === item.id
                      ? 'bg-gradient-to-r from-[#8B7CFF] to-[#36D9FF] text-[#080B16] font-bold'
                      : 'text-slate-300 hover:bg-[#121D33]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            <button
              onClick={handleToggleLang}
              className="w-full py-2.5 rounded-xl bg-[#121D33] border border-[#1E2D4A] text-xs font-mono text-center text-slate-300"
            >
              {lang === 'ar' ? 'Switch to English' : 'التحويل للعربية'}
            </button>
          </div>
          <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}

      {/* 2. Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Bar matching reference */}
        <AstraTopNav
          lang={lang}
          onToggleLang={handleToggleLang}
          onResetData={handleResetData}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenAssistant={() => setCurrentTab('intelligence')}
          onOpenEmergency={() => setCurrentTab('emergency')}
        />

        {/* Workspace Display Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
          {currentTab === 'overview' && (
            <OverviewView
              sleepRecords={sleepRecords}
              wellnessRecords={wellnessRecords}
              respiratoryRecords={respiratoryRecords}
              bodyMetrics={bodyMetrics}
              tasks={tasks}
              onToggleTask={handleToggleTask}
              onAddTask={handleAddTask}
              badges={badges}
              onNavigate={setCurrentTab}
              lang={lang}
            />
          )}

          {currentTab === 'health_core' && (
            <HealthCoreHub
              sleepRecords={sleepRecords}
              wellnessRecords={wellnessRecords}
              respiratoryRecords={respiratoryRecords}
              bodyMetrics={bodyMetrics}
              healthEvents={healthEvents}
              onSaveSleepRecord={handleSaveSleep}
              onSaveBodyMetric={handleSaveBodyMetric}
              onSaveHealthEvent={handleSaveHealthEvent}
              onBatchImportSleep={handleBatchImportSleep}
              onBatchImportBodyMetrics={handleBatchImportBodyMetrics}
              lang={lang}
            />
          )}

          {currentTab === 'predict' && (
            <PredictiveMissionView lang={lang} />
          )}

          {currentTab === 'intelligence' && (
            <IntelligenceCoreHub
              sleepRecords={sleepRecords}
              wellnessRecords={wellnessRecords}
              respiratoryRecords={respiratoryRecords}
              bodyMetrics={bodyMetrics}
              healthEvents={healthEvents}
              lang={lang}
            />
          )}

          {currentTab === 'sleep' && (
            <SleepOrbitView
              records={sleepRecords}
              onSaveRecord={handleSaveSleep}
              onDeleteRecord={handleDeleteSleep}
              lang={lang}
            />
          )}

          {currentTab === 'breathing' && (
            <RespiratoryOrbitView
              records={respiratoryRecords}
              onSaveRecord={handleSaveRespiratory}
              lang={lang}
            />
          )}

          {currentTab === 'wellness' && (
            <MindOrbitView
              records={wellnessRecords}
              onSaveRecord={handleSaveWellness}
              onDeleteRecord={handleDeleteWellness}
              lang={lang}
            />
          )}

          {currentTab === 'body' && (
            <BodyOrbitView lang={lang} />
          )}

          {currentTab === 'motion' && (
            <MotionOrbitView lang={lang} />
          )}

          {currentTab === 'foresight' && (
            <MissionForesightView lang={lang} />
          )}

          {currentTab === 'reports' && (
            <ReportsView
              sleepRecords={sleepRecords}
              wellnessRecords={wellnessRecords}
              respiratoryRecords={respiratoryRecords}
              lang={lang}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsView
              profile={profile}
              onUpdateProfile={handleUpdateProfile}
              onResetData={handleResetData}
              lang={lang}
            />
          )}

          {currentTab === 'emergency' && (
            <EmergencyRescueView lang={lang} />
          )}

          {currentTab === 'assistant' && (
            <AssistantView
              sleepRecords={sleepRecords}
              wellnessRecords={wellnessRecords}
              respiratoryRecords={respiratoryRecords}
              lang={lang}
            />
          )}
        </main>

        {/* Mobile Bottom Navigation */}
        <AstraBottomNav
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          lang={lang}
        />

        {/* Footer */}
        <footer className="border-t border-[#1E2D4A]/50 bg-[#080B16] py-5 px-6 mb-16 lg:mb-0 text-center text-xs text-slate-500 font-mono">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <span className="text-slate-300 font-bold">ASTRA</span> · Spaceflight Wellness Companion · Expedition 72
            </div>
            <div className="text-[11px] text-slate-500">
              Browser Local Storage · NASA / ESA Operational Medicine Standards
            </div>
          </div>
        </footer>
      </div>

      {/* App Icon Showcase Modal */}
      {showAppIconModal && (
        <div 
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setShowAppIconModal(false)}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <AstraAppIconCard onClose={() => setShowAppIconModal(false)} lang={lang} />
          </div>
        </div>
      )}
    </div>
  );
}

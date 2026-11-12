import React, { useState } from 'react';
import { AstronautProfile, Language } from '../types';
import { TRANSLATIONS } from '../utils/translations';
import { 
  Settings, 
  User, 
  Globe, 
  RotateCcw, 
  Check, 
  ShieldCheck, 
  Trash2, 
  Save
} from 'lucide-react';

interface SettingsViewProps {
  profile: AstronautProfile;
  onUpdateProfile: (p: AstronautProfile) => void;
  onResetData: () => void;
  lang: Language;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  profile,
  onUpdateProfile,
  onResetData,
  lang,
}) => {
  const t = TRANSLATIONS[lang];

  const [callsign, setCallsign] = useState<string>(profile.callsign);
  const [rank, setRank] = useState<string>(profile.rank || 'Commander');
  const [missionName, setMissionName] = useState<string>(profile.missionName);
  const [targetSleepHours, setTargetSleepHours] = useState<number>(profile.targetSleepMinutes / 60);
  const [saved, setSaved] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      ...profile,
      callsign,
      rank,
      missionName,
      targetSleepMinutes: targetSleepHours * 60,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6 pb-12 max-w-3xl">
      {/* Header */}
      <div className="glass-panel rounded-3xl p-6 relative overflow-hidden">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 uppercase mb-1">
          <Settings className="w-4 h-4 text-[#36D9FF]" />
          <span>CONSOLE PREFERENCES · MODULE 08</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-display font-bold text-white tracking-wide">
          {t.settingsTitle}
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 font-sans mt-1">
          {lang === 'ar'
            ? 'تخصيص هوية رائد الفضاء، معايير المهمة، وأهداف النوم المدارية.'
            : 'Configure astronaut profile, mission identifier, and baseline sleep requirements.'}
        </p>
      </div>

      {/* Settings Form */}
      <div className="glass-panel rounded-3xl p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {saved && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>{lang === 'ar' ? 'تم حفظ التعديلات بنجاح في التخزين المحلي!' : 'Settings successfully saved to local storage.'}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-300 uppercase mb-1">
                Astronaut Callsign
              </label>
              <input
                type="text"
                value={callsign}
                onChange={(e) => setCallsign(e.target.value)}
                className="w-full bg-[#080B16] border border-[#1E2D4A] focus:border-[#36D9FF] rounded-xl px-4 py-2.5 text-sm text-white font-sans focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 uppercase mb-1">
                Mission Rank
              </label>
              <input
                type="text"
                value={rank}
                onChange={(e) => setRank(e.target.value)}
                className="w-full bg-[#080B16] border border-[#1E2D4A] focus:border-[#36D9FF] rounded-xl px-4 py-2.5 text-sm text-white font-sans focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-300 uppercase mb-1">
                Mission Identifier
              </label>
              <input
                type="text"
                value={missionName}
                onChange={(e) => setMissionName(e.target.value)}
                className="w-full bg-[#080B16] border border-[#1E2D4A] focus:border-[#36D9FF] rounded-xl px-4 py-2.5 text-sm text-white font-sans focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 uppercase mb-1">
                Daily Sleep Target (Hours): <strong className="text-[#36D9FF]">{targetSleepHours} hrs</strong>
              </label>
              <input
                type="range"
                min="6"
                max="10"
                step="0.5"
                value={targetSleepHours}
                onChange={(e) => setTargetSleepHours(Number(e.target.value))}
                className="w-full accent-[#36D9FF] bg-[#1E2D4A] h-2 rounded-lg cursor-pointer mt-2"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#8B7CFF] to-[#36D9FF] text-[#080B16] font-bold text-xs font-mono uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(54,217,255,0.3)] flex items-center justify-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{lang === 'ar' ? 'حفظ الإعدادات' : 'Save Console Profile'}</span>
          </button>
        </form>
      </div>

      {/* Dangerous Reset Zone */}
      <div className="glass-panel rounded-3xl p-6 border border-rose-500/30">
        <h3 className="text-sm font-mono font-bold text-rose-400 uppercase mb-2">
          {lang === 'ar' ? 'إعادة تعيين البيانات والنموذج' : 'Reset Storage Baseline'}
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          {lang === 'ar'
            ? 'مسح جميع السجلات المدخلة وإعادة ضبط البيانات إلى القيم القياسية للمهمة.'
            : 'Clear local storage session and restore standard Expedition 72 seed parameters.'}
        </p>

        <button
          onClick={onResetData}
          className="px-4 py-2 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 hover:bg-rose-500/30 text-xs font-mono transition-colors flex items-center gap-2"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{t.resetData}</span>
        </button>
      </div>
    </div>
  );
};

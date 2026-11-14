import React, { useState } from 'react';
import { AstronautProfile, Language } from '../types';
import { TRANSLATIONS } from '../utils/translations';
import {
  Settings,
  Check,
  Save,
  Download,
  Database,
  Trash2,
  RefreshCw,
} from 'lucide-react';

interface SettingsViewProps {
  profile: AstronautProfile;
  onUpdateProfile: (p: AstronautProfile) => void;
  onResetData: () => void;
  onLoadDemoData?: () => void;
  lang: Language;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  profile,
  onUpdateProfile,
  onResetData,
  onLoadDemoData,
  lang,
}) => {
  const t = TRANSLATIONS[lang];
  const isAr = lang === 'ar';

  const [callsign, setCallsign] = useState<string>(profile.callsign);
  const [rank, setRank] = useState<string>(profile.rank || 'Commander');
  const [missionName, setMissionName] = useState<string>(profile.missionName);
  const [missionDay, setMissionDay] = useState<number>(profile.missionDay || 1);
  const [targetSleepHours, setTargetSleepHours] = useState<number>(profile.targetSleepMinutes / 60);
  const [saved, setSaved] = useState<boolean>(false);

  const [isExportingZip, setIsExportingZip] = useState<boolean>(false);
  const [exportStatus, setExportStatus] = useState<string | null>(null);
  const [demoLoaded, setDemoLoaded] = useState<boolean>(false);
  const [confirmClear, setConfirmClear] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      ...profile,
      callsign: callsign.trim() || 'Astronaut',
      rank: rank.trim() || 'Commander',
      missionName: missionName.trim() || 'ISS Expedition 72',
      missionDay: Math.max(1, Number(missionDay) || 1),
      targetSleepMinutes: targetSleepHours * 60,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleDownloadProjectZip = async () => {
    if (isExportingZip) return;
    setIsExportingZip(true);
    setExportStatus(null);

    try {
      const response = await fetch('/api/export-project.zip');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'ASTRA-Astronaut-Health-Companion.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setExportStatus(
        isAr
          ? 'تم تجهيز وتحميل ملف ZIP الكامل للمشروع بنجاح.'
          : 'Project ZIP archive downloaded successfully.'
      );
    } catch {
      setExportStatus(
        isAr
          ? 'تعذر تحميل الأرشيف عبر الخادم. تأكد من تشغيل الخادم المحلي.'
          : 'Failed to export ZIP archive. Check that the server is running.'
      );
    } finally {
      setIsExportingZip(false);
    }
  };

  const handleLoadDemo = () => {
    if (!onLoadDemoData) return;
    onLoadDemoData();
    setDemoLoaded(true);
    setTimeout(() => setDemoLoaded(false), 3000);
  };

  return (
    <div className="space-y-6 pb-12 max-w-3xl">
      {/* Header */}
      <div className="glass-panel rounded-3xl p-6">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 uppercase mb-1">
          <Settings className="w-4 h-4 text-[#36D9FF]" />
          <span>{isAr ? 'تفضيلات النظام والملف الشخصي' : 'CONSOLE PREFERENCES'}</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-display font-bold text-white tracking-wide">
          {t.settingsTitle}
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 font-sans mt-1">
          {isAr
            ? 'تخصيص هوية رائد الفضاء، بيانات المهمة، إدارة السجلات، وتصدير المشروع الكامل.'
            : 'Configure astronaut callsign, mission day, data management, and full project ZIP export.'}
        </p>
      </div>

      {/* Settings Form */}
      <div className="glass-panel rounded-3xl p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {saved && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>
                {isAr
                  ? 'تم حفظ التعديلات بنجاح في التخزين المحلي.'
                  : 'Settings successfully saved to local storage.'}
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-300 uppercase mb-1">
                {isAr ? 'اسم / نداء رائد الفضاء' : 'Astronaut Callsign'}
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
                {isAr ? 'الرتبة / الدور' : 'Mission Rank'}
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
                {isAr ? 'اسم المهمة الفضائية' : 'Mission Identifier'}
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
                {isAr ? 'يوم المهمة (Flight Day)' : 'Mission Flight Day'}
              </label>
              <input
                type="number"
                min={1}
                max={999}
                value={missionDay}
                onChange={(e) => setMissionDay(Number(e.target.value))}
                className="w-full bg-[#080B16] border border-[#1E2D4A] focus:border-[#36D9FF] rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-300 uppercase mb-1">
              {isAr ? 'هدف النوم اليومي:' : 'Daily Sleep Target:'}{' '}
              <strong className="text-[#36D9FF]">{targetSleepHours} hrs</strong>
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

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#173B60] to-[#0099DD] text-white font-bold text-xs font-mono uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isAr ? 'حفظ الإعدادات' : 'Save Console Profile'}</span>
          </button>
        </form>
      </div>

      {/* Export Project ZIP Card */}
      <div className="glass-panel rounded-3xl p-6 border border-[#42C8F5]/30 space-y-3">
        <h3 className="text-sm font-mono font-bold text-[#42C8F5] uppercase flex items-center gap-2">
          <Download className="w-4 h-4" />
          <span>{isAr ? 'تصدير المشروع الكامل كملف ZIP' : 'Export Full Project (.zip)'}</span>
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          {isAr
            ? 'تحميل حزمة الكود المصدري الكاملة للمشروع (الواجهة، الخادم، الاختبارات، وملف package.json بدون node_modules أو أسرار) لنقله وتطويره في أي بيئة أخرى.'
            : 'Download the complete ASTRA source code archive (frontend, server.ts, tests, package.json, excluding node_modules and env secrets) for external development.'}
        </p>

        {exportStatus && (
          <div className="p-2.5 rounded-xl bg-[#07111F] border border-[#42C8F5]/30 text-xs text-[#42C8F5] font-mono">
            {exportStatus}
          </div>
        )}

        <button
          type="button"
          onClick={handleDownloadProjectZip}
          disabled={isExportingZip}
          className="px-5 py-2.5 rounded-xl bg-[#42C8F5] text-[#07111F] font-bold text-xs font-mono hover:brightness-110 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isExportingZip ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          <span>
            {isExportingZip
              ? isAr
                ? 'جاري تجهيز الأرشيف...'
                : 'Packaging ZIP...'
              : isAr
              ? 'تحميل المشروع (.zip)'
              : 'Download Project (.zip)'}
          </span>
        </button>
      </div>

      {/* Data Management Zone */}
      <div className="glass-panel rounded-3xl p-6 border border-[#1E2D4A] space-y-4">
        <h3 className="text-sm font-mono font-bold text-white uppercase flex items-center gap-2">
          <Database className="w-4 h-4 text-[#35C98A]" />
          <span>{isAr ? 'إدارة السجلات والبيانات' : 'User Telemetry Data Management'}</span>
        </h3>
        <p className="text-xs text-slate-400">
          {isAr
            ? 'تبدأ السجلات فارغة افتراضياً حتى تقوم بإدخال قياساتك. يمكنك تجربة التطبيق عبر تحميل حزمة بيانات تجريبية أو مسح كافة السجلات.'
            : 'All logs start empty until you record data. Load a labeled sample demo dataset for preview or clear all saved records.'}
        </p>

        {demoLoaded && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>
              {isAr
                ? 'تم تحميل البيانات التجريبية بنجاح (مصنفة كـ simulated).'
                : 'Sample demo dataset loaded (tagged as simulated).'}
            </span>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          {onLoadDemoData && (
            <button
              type="button"
              onClick={handleLoadDemo}
              className="px-4 py-2 rounded-xl bg-[#173B60] border border-[#42C8F5]/40 text-[#42C8F5] hover:brightness-110 text-xs font-mono transition-all flex items-center gap-2 cursor-pointer"
            >
              <Database className="w-3.5 h-3.5" />
              <span>{isAr ? 'تحميل بيانات تجريبية للمعاينة' : 'Load Sample Demo Data'}</span>
            </button>
          )}

          {!confirmClear ? (
            <button
              type="button"
              onClick={() => setConfirmClear(true)}
              className="px-4 py-2 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 hover:bg-rose-500/25 text-xs font-mono transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isAr ? 'مسح كافة السجلات' : 'Clear All User Logs'}</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  onResetData();
                  setConfirmClear(false);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-mono font-bold cursor-pointer"
              >
                {isAr ? 'تأكيد المسح النهائي' : 'Confirm Clear All'}
              </button>
              <button
                type="button"
                onClick={() => setConfirmClear(false)}
                className="px-3 py-2 rounded-xl bg-[#080B16] border border-[#1E2D4A] text-slate-300 text-xs font-mono cursor-pointer"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

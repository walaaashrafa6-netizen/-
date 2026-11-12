import React, { useState } from 'react';
import { SleepRecord, WellnessRecord, RespiratoryRecord, Language } from '../types';
import { TRANSLATIONS } from '../utils/translations';
import { formatDuration } from '../utils/storage';
import { 
  BarChart3, 
  Download, 
  FileText, 
  Printer, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Share2,
  ShieldCheck
} from 'lucide-react';

interface ReportsViewProps {
  sleepRecords: SleepRecord[];
  wellnessRecords: WellnessRecord[];
  respiratoryRecords: RespiratoryRecord[];
  lang: Language;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  sleepRecords,
  wellnessRecords,
  respiratoryRecords,
  lang,
}) => {
  const t = TRANSLATIONS[lang];
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  // Export JSON
  const handleExportJSON = () => {
    const reportData = {
      mission: 'ISS Expedition 72',
      exportDate: new Date().toISOString(),
      sleepRecords,
      wellnessRecords,
      respiratoryRecords,
      disclaimer: 'ASTRA Astronaut Health Companion Prototype Report',
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ASTRA_Mission_Report_Sol48_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="glass-panel rounded-3xl p-6 relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#36D9FF] tracking-wider uppercase mb-1">
            <BarChart3 className="w-4 h-4 text-[#36D9FF]" />
            <span>AUDIT & PRIVATE MEDICAL CONFERENCE SUMMARY · MODULE 07</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-display font-bold text-white tracking-wide">
            {t.reportsTitle}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 font-sans mt-1 max-w-2xl">
            {lang === 'ar'
              ? 'تجميع ومراجعة السجلات التاريخية وتصدير ملخص طبي منظم لمشاركته مع طبيب الرحلة (Flight Surgeon).'
              : 'Consolidated mission health audit for confidential review during Private Medical Conferences.'}
          </p>
        </div>

        <button
          onClick={handleExportJSON}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#8B7CFF] to-[#36D9FF] hover:opacity-95 text-[#080B16] font-bold text-xs font-mono uppercase tracking-wider transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(54,217,255,0.3)] shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>{downloadSuccess ? 'Exported!' : 'Export JSON Log'}</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel rounded-2xl p-5">
          <span className="text-xs font-mono text-slate-400 uppercase">Total Sleep Entries</span>
          <div className="text-3xl font-mono font-bold text-white mt-1 tabular-nums">
            {sleepRecords.length}
          </div>
          <span className="text-[11px] text-[#20E0A0] font-sans">100% saved locally</span>
        </div>

        <div className="glass-panel rounded-2xl p-5">
          <span className="text-xs font-mono text-slate-400 uppercase">Wellness Check-ins</span>
          <div className="text-3xl font-mono font-bold text-[#8B7CFF] mt-1 tabular-nums">
            {wellnessRecords.length}
          </div>
          <span className="text-[11px] text-slate-400 font-sans">Daily self-reports</span>
        </div>

        <div className="glass-panel rounded-2xl p-5">
          <span className="text-xs font-mono text-slate-400 uppercase">Respiratory Logs</span>
          <div className="text-3xl font-mono font-bold text-[#36D9FF] mt-1 tabular-nums">
            {respiratoryRecords.length}
          </div>
          <span className="text-[11px] text-[#FFBF69] font-sans">Simulated Telemetry</span>
        </div>
      </div>

      {/* Comprehensive Medical Summary Table */}
      <div className="glass-panel rounded-3xl p-6">
        <h2 className="text-base font-display font-bold text-white mb-4 pb-2 border-b border-[#1E2D4A]">
          {lang === 'ar' ? 'سجل الأيام السبعة الأخيرة (7-Day Consolidated Audit)' : '7-Day In-Flight Consolidated Log'}
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-[#1E2D4A] text-slate-400 text-[10px] uppercase">
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Sleep Window</th>
                <th className="py-2.5 px-3">Duration</th>
                <th className="py-2.5 px-3">Disturbances</th>
                <th className="py-2.5 px-3">Stress / Mood</th>
                <th className="py-2.5 px-3">Respiration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E2D4A]/50 text-slate-200">
              {[...sleepRecords].reverse().slice(0, 7).map((s) => {
                const w = wellnessRecords.find((r) => r.date === s.date);
                const r = respiratoryRecords.find((r) => r.date === s.date);
                return (
                  <tr key={s.id} className="hover:bg-[#121D33]/40 transition-colors">
                    <td className="py-3 px-3 text-white font-bold">{s.date}</td>
                    <td className="py-3 px-3 text-slate-400">{s.bedtime} → {s.wakeTime}</td>
                    <td className="py-3 px-3 text-[#36D9FF] font-semibold">{formatDuration(s.durationMinutes)}</td>
                    <td className="py-3 px-3 text-slate-400 text-[11px]">{s.disturbances?.join(', ') || 'Nominal'}</td>
                    <td className="py-3 px-3">
                      Stress: <strong className="text-[#FFBF69]">{w?.stressRating || 2}/5</strong> · Mood: <strong className="text-[#8B7CFF]">{w?.moodRating || 4}/5</strong>
                    </td>
                    <td className="py-3 px-3 text-[#20E0A0]">{r?.respiratoryRate || 16}/min</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

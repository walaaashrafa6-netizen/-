import React, { useState } from 'react';
import {
  SleepRecord,
  WellnessRecord,
  RespiratoryRecord,
  BodyMetricRecord,
  AstronautProfile,
  ModuleTab,
  Language,
  WellnessTask,
  MissionBadge,
} from '../types';
import { formatDuration } from '../utils/storage';
import {
  CheckCircle2,
  Activity,
  Moon,
  Wind,
  Heart,
  Thermometer,
  BarChart2,
  Star,
  ArrowRight,
  Send,
  AlertTriangle,
  Sparkles,
  ChevronRight,
  Database,
  PlusCircle,
} from 'lucide-react';

interface OverviewViewProps {
  sleepRecords: SleepRecord[];
  wellnessRecords: WellnessRecord[];
  respiratoryRecords: RespiratoryRecord[];
  bodyMetrics?: BodyMetricRecord[];
  profile: AstronautProfile;
  tasks: WellnessTask[];
  onToggleTask: (taskId: string) => void;
  onAddTask: (title: string, titleAr: string) => void;
  badges: MissionBadge[];
  onNavigate: (tab: ModuleTab) => void;
  onAskAi?: (prompt: string) => void;
  onLoadDemoData?: () => void;
  lang: Language;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  sleepRecords,
  wellnessRecords,
  respiratoryRecords,
  bodyMetrics = [],
  profile,
  onNavigate,
  onAskAi,
  onLoadDemoData,
  lang,
}) => {
  const isAr = lang === 'ar';
  const [trendTimeframe, setTrendTimeframe] = useState<'1D' | '1W' | '1M'>('1W');
  const [assistantInput, setAssistantInput] = useState<string>('');

  const latestSleep = sleepRecords[sleepRecords.length - 1] || null;
  const latestWellness = wellnessRecords[wellnessRecords.length - 1] || null;
  const latestResp = respiratoryRecords[respiratoryRecords.length - 1] || null;
  const latestBody = bodyMetrics[0] || null;

  const totalLogged =
    sleepRecords.length +
    wellnessRecords.length +
    respiratoryRecords.length +
    bodyMetrics.length;

  const sleepDisplay = latestSleep ? formatDuration(latestSleep.durationMinutes) : null;
  const sleepProgressPct = latestSleep
    ? Math.min(100, Math.round((latestSleep.durationMinutes / (profile.targetSleepMinutes || 480)) * 100))
    : 0;

  const respDisplay = latestResp ? latestResp.respiratoryRate : null;
  const wellnessScore = latestWellness
    ? (((latestWellness.moodRating + latestWellness.energyRating) / 2) * 2).toFixed(1)
    : null;

  const handleAssistantSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = assistantInput.trim();
    if (!q) return;
    setAssistantInput('');
    if (onAskAi) {
      onAskAi(q);
    } else {
      onNavigate('intelligence');
    }
  };

  // Build real trend points when user records exist
  const sleepPoints = sleepRecords.slice(-7).map((r, idx, arr) => {
    const x = arr.length === 1 ? 250 : 40 + (idx / (arr.length - 1)) * 420;
    const clampedH = Math.max(0, Math.min(10, r.durationMinutes / 60));
    const y = 140 - (clampedH / 10) * 110;
    return `${x},${y}`;
  });

  const stressPoints = wellnessRecords.slice(-7).map((r, idx, arr) => {
    const x = arr.length === 1 ? 250 : 40 + (idx / (arr.length - 1)) * 420;
    const y = 140 - (r.stressRating / 5) * 105;
    return `${x},${y}`;
  });

  const energyPoints = wellnessRecords.slice(-7).map((r, idx, arr) => {
    const x = arr.length === 1 ? 250 : 40 + (idx / (arr.length - 1)) * 420;
    const y = 140 - (r.energyRating / 5) * 105;
    return `${x},${y}`;
  });

  return (
    <div className="space-y-5 pb-16 max-w-7xl mx-auto">
      {/* 1. Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-[#0C1B2B] border border-[#162E48] shadow-2xl p-6 sm:p-8">
        <div className="absolute right-0 top-0 bottom-0 w-full sm:w-2/3 md:w-1/2 pointer-events-none overflow-hidden select-none">
          <img
            src="/assets/aistudio/file_00000000740082468d45c8f9dd0784f4_8c03b9ab.png"
            alt="Astronaut Spaceflight View"
            className="w-full h-full object-cover object-[75%_18%] opacity-70"
            style={{
              maskImage: 'linear-gradient(to right, transparent 0%, black 50%)',
              WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 50%)',
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0C1B2B] via-[#0C1B2B]/60 to-transparent" />
        </div>

        <div className="relative z-10 max-w-xl">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-[#F2F6FA] tracking-wide">
            {isAr ? `مرحبًا، ${profile.callsign}` : `Welcome, ${profile.callsign}`}
          </h1>
          <p className="text-xs sm:text-sm text-[#A9B8C8] font-sans mt-1">
            {profile.missionName} · {isAr ? `يوم المهمة ${profile.missionDay}` : `Flight Day ${profile.missionDay}`}
          </p>

          {/* Overall Health Status Card */}
          <div className="mt-5 p-4 rounded-2xl bg-[#07111F]/90 border border-[#162E48] backdrop-blur-md max-w-md shadow-lg">
            <div className="flex items-center justify-between pb-2 border-b border-[#162E48]/50">
              <div className="flex items-center gap-2 text-xs font-mono text-[#A9B8C8]">
                <Activity className="w-3.5 h-3.5 text-[#42C8F5]" />
                <span>{isAr ? 'حالة السجلات الصحية' : 'Overall Telemetry Status'}</span>
              </div>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                  totalLogged > 0
                    ? 'bg-emerald-500/10 text-[#35C98A] border-[#35C98A]/30'
                    : 'bg-slate-800/80 text-[#A9B8C8] border-[#162E48]'
                }`}
              >
                {totalLogged > 0
                  ? `${totalLogged} ${isAr ? 'سجلات' : 'LOGS'}`
                  : isAr
                  ? 'لا توجد سجلات'
                  : 'EMPTY LOG'}
              </span>
            </div>

            <div className="flex items-center justify-between pt-3 gap-3">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    totalLogged > 0
                      ? 'bg-[#35C98A]/15 border border-[#35C98A]/40 text-[#35C98A]'
                      : 'bg-[#173B60]/50 border border-[#42C8F5]/30 text-[#42C8F5]'
                  }`}
                >
                  {totalLogged > 0 ? (
                    <CheckCircle2 className="w-6 h-6 stroke-[2.2]" />
                  ) : (
                    <PlusCircle className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <div
                    className={`text-lg font-display font-bold leading-tight ${
                      totalLogged > 0 ? 'text-[#35C98A]' : 'text-white'
                    }`}
                  >
                    {totalLogged > 0
                      ? isAr
                        ? 'بيانات نشطة وموثقة'
                        : 'Telemetry Active'
                      : isAr
                      ? 'بانتظار تسجيل بياناتك'
                      : 'Awaiting User Logs'}
                  </div>
                  <div className="text-xs text-[#A9B8C8] font-sans">
                    {totalLogged > 0
                      ? isAr
                        ? 'جميع المؤشرات مبنية على مدخلاتك المسجلة'
                        : 'Reflecting your recorded mission logs'
                      : isAr
                      ? 'ابدأ بإدخال قياساتك أو جرب البيانات التجريبية'
                      : 'Log your vitals or load sample demo data'}
                  </div>
                </div>
              </div>
            </div>

            {totalLogged === 0 && (
              <div className="mt-3 pt-3 border-t border-[#162E48]/60 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onNavigate('health_core')}
                  className="px-3 py-1.5 rounded-lg bg-[#42C8F5] text-[#07111F] font-bold text-[11px] font-mono cursor-pointer hover:brightness-110 transition-all"
                >
                  {isAr ? 'تسجيل بيانات صحية' : 'Log Health Data'}
                </button>
                {onLoadDemoData && (
                  <button
                    type="button"
                    onClick={onLoadDemoData}
                    className="px-3 py-1.5 rounded-lg bg-[#0C1B2B] border border-[#162E48] hover:border-[#42C8F5]/50 text-[#A9B8C8] hover:text-white text-[11px] font-mono cursor-pointer transition-colors"
                  >
                    {isAr ? 'تحميل بيانات تجريبية' : 'Load Sample Demo'}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Top 4 Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Sleep */}
        <div
          onClick={() => onNavigate('sleep')}
          className="rounded-2xl p-4 bg-[#0C1B2B] border border-[#162E48] hover:border-[#42C8F5]/60 transition-all cursor-pointer shadow-lg flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono text-[#A9B8C8]">
              <Moon className="w-4 h-4 text-[#42C8F5]" />
              <span>{isAr ? 'النوم' : 'Sleep'}</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400 uppercase">
              {latestSleep ? latestSleep.source : isAr ? 'غير مسجل' : 'EMPTY'}
            </span>
          </div>

          <div className="flex items-center justify-between my-3">
            <div>
              <div className="text-xl sm:text-2xl font-display font-bold text-white tracking-tight">
                {sleepDisplay || (isAr ? 'غير مسجل' : 'Not Logged')}
              </div>
              <div className="text-xs text-[#A9B8C8] mt-1 font-sans">
                {latestSleep
                  ? `${isAr ? 'الهدف:' : 'Goal:'} ${Math.round((profile.targetSleepMinutes || 480) / 60)}h · ${sleepProgressPct}%`
                  : isAr
                  ? 'اضغط لتسجيل النوم'
                  : 'Click to log sleep'}
              </div>
            </div>

            <div className="relative w-12 h-12 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-[#11263A]"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                {sleepProgressPct > 0 && (
                  <path
                    className="text-[#42C8F5]"
                    strokeDasharray={`${sleepProgressPct}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                )}
              </svg>
            </div>
          </div>
        </div>

        {/* Card 2: Respiration */}
        <div
          onClick={() => onNavigate('breathing')}
          className="rounded-2xl p-4 bg-[#0C1B2B] border border-[#162E48] hover:border-[#42C8F5]/60 transition-all cursor-pointer shadow-lg flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono text-[#A9B8C8]">
              <Wind className="w-4 h-4 text-[#42C8F5]" />
              <span>{isAr ? 'التنفس' : 'Respiration'}</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400 uppercase">
              {latestResp ? latestResp.source || 'LOGGED' : isAr ? 'غير مسجل' : 'EMPTY'}
            </span>
          </div>

          <div className="flex items-center justify-between my-3">
            <div>
              {respDisplay !== null ? (
                <>
                  <div className="text-2xl font-display font-bold text-white tracking-tight flex items-baseline gap-1">
                    <span>{respDisplay}</span>
                    <span className="text-sm font-sans font-normal text-[#A9B8C8]">/min</span>
                  </div>
                  <div className="text-xs text-[#35C98A] mt-1 font-sans">
                    {latestResp?.date}
                  </div>
                </>
              ) : (
                <>
                  <div className="text-xl font-display font-bold text-white">
                    {isAr ? 'غير مسجل' : 'Not Logged'}
                  </div>
                  <div className="text-xs text-[#A9B8C8] mt-1 font-sans">
                    {isAr ? 'اضغط لتسجيل التنفس' : 'Click to log rate'}
                  </div>
                </>
              )}
            </div>
            <div className="text-xl font-mono text-[#42C8F5]">
              {respDisplay !== null ? `${respDisplay}` : '—'}
            </div>
          </div>
        </div>

        {/* Card 3: Wellness */}
        <div
          onClick={() => onNavigate('wellness')}
          className="rounded-2xl p-4 bg-[#0C1B2B] border border-[#162E48] hover:border-[#42C8F5]/60 transition-all cursor-pointer shadow-lg flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono text-[#A9B8C8]">
              <Heart className="w-4 h-4 text-[#42C8F5]" />
              <span>{isAr ? 'الرفاهية النفسية' : 'Wellness'}</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400 uppercase">
              {latestWellness ? latestWellness.source : isAr ? 'غير مسجل' : 'EMPTY'}
            </span>
          </div>

          <div className="flex items-center justify-between my-3">
            <div>
              {wellnessScore !== null ? (
                <>
                  <div className="text-2xl font-display font-bold text-white tracking-tight flex items-baseline gap-1">
                    <span>{wellnessScore}</span>
                    <span className="text-sm font-sans font-normal text-[#A9B8C8]">/10</span>
                  </div>
                  <div className="text-xs text-[#35C98A] mt-1 font-sans">
                    {isAr ? `التوتر: ${latestWellness?.stressRating}/5` : `Stress: ${latestWellness?.stressRating}/5`}
                  </div>
                </>
              ) : (
                <>
                  <div className="text-xl font-display font-bold text-white">
                    {isAr ? 'غير مسجل' : 'Not Logged'}
                  </div>
                  <div className="text-xs text-[#A9B8C8] mt-1 font-sans">
                    {isAr ? 'اضغط لتسجيل المزاج' : 'Click to log check-in'}
                  </div>
                </>
              )}
            </div>
            <div className="text-xl font-mono text-[#35C98A]">
              {wellnessScore !== null ? wellnessScore : '—'}
            </div>
          </div>
        </div>

        {/* Card 4: Body Metrics */}
        <div
          onClick={() => onNavigate('health_core')}
          className="rounded-2xl p-4 bg-[#0C1B2B] border border-[#162E48] hover:border-[#42C8F5]/60 transition-all cursor-pointer shadow-lg flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono text-[#A9B8C8]">
              <Thermometer className="w-4 h-4 text-[#42C8F5]" />
              <span>{isAr ? 'المؤشرات الحيوية' : 'Body Metrics'}</span>
            </div>
            <span className={`text-[10px] font-mono ${latestBody ? 'text-[#35C98A]' : 'text-slate-400'}`}>
              {latestBody ? latestBody.source.toUpperCase() : isAr ? 'غير مسجل' : 'EMPTY'}
            </span>
          </div>

          <div className="flex items-center justify-between my-3">
            {latestBody && latestBody.heartRateBpm ? (
              <div>
                <div className="text-xl sm:text-2xl font-display font-bold text-white tracking-tight flex items-baseline gap-1">
                  <span>{latestBody.heartRateBpm}</span>
                  <span className="text-xs font-sans font-normal text-[#A9B8C8]">bpm</span>
                  {latestBody.bloodPressureSys && (
                    <span className="text-xs font-mono text-[#42C8F5] ms-2">
                      {latestBody.bloodPressureSys}/{latestBody.bloodPressureDia}
                    </span>
                  )}
                </div>
                <div className="text-xs text-[#35C98A] mt-1 font-sans">
                  {latestBody.date}
                </div>
              </div>
            ) : (
              <div>
                <div className="text-xl font-display font-bold text-white tracking-tight">
                  {isAr ? 'غير مسجل' : 'Not Logged'}
                </div>
                <div className="text-xs text-[#A9B8C8] mt-1 font-sans">
                  {isAr ? 'أضف قياساتك في نواة الصحة' : 'Add vitals in Health Core'}
                </div>
              </div>
            )}

            <div className="text-[#A9B8C8] text-xl font-mono">
              {latestBody?.spO2Percent ? `${latestBody.spO2Percent}%` : '—'}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Middle Row: Trends Overview & Next Action */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Real Trends Overview (7 Cols) */}
        <div className="lg:col-span-7 rounded-3xl p-5 sm:p-6 bg-[#0C1B2B] border border-[#162E48] shadow-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-sm font-display font-bold text-white">
              <BarChart2 className="w-4 h-4 text-[#42C8F5]" />
              <span>{isAr ? 'نظرة على الاتجاهات المسجلة' : 'Trends Overview'}</span>
            </div>

            <div className="flex items-center gap-1 p-1 rounded-xl bg-[#07111F] border border-[#162E48]">
              {(['1D', '1W', '1M'] as const).map((period) => (
                <button
                  key={period}
                  type="button"
                  onClick={() => setTrendTimeframe(period)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                    trendTimeframe === period
                      ? 'bg-[#173B60] text-[#42C8F5] font-bold border border-[#42C8F5]/40'
                      : 'text-[#A9B8C8] hover:text-white'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>

          {sleepRecords.length === 0 && wellnessRecords.length === 0 ? (
            <div className="h-48 rounded-2xl bg-[#07111F] border border-dashed border-[#162E48] flex flex-col items-center justify-center p-4 text-center space-y-3">
              <BarChart2 className="w-7 h-7 text-[#42C8F5]/60" />
              <div className="space-y-1">
                <div className="text-xs font-bold text-white">
                  {isAr ? 'لا توجد قياسات تاريخية لعرض الرسم البياني' : 'No Logged Records to Plot Yet'}
                </div>
                <p className="text-[11px] text-[#A9B8C8] max-w-sm">
                  {isAr
                    ? 'سجل بيانات النوم أو الرفاهية أولاً ليتم رسم اتجاهاتك الحقيقية، أو قم بتحميل البيانات التجريبية.'
                    : 'Log sleep or wellness entries to plot your real trajectory, or load sample demo records.'}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                <button
                  type="button"
                  onClick={() => onNavigate('sleep')}
                  className="px-3 py-1.5 rounded-lg bg-[#173B60] text-[#42C8F5] text-[11px] font-mono cursor-pointer hover:brightness-110"
                >
                  {isAr ? 'تسجيل النوم' : 'Log Sleep'}
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('wellness')}
                  className="px-3 py-1.5 rounded-lg bg-[#173B60] text-[#35C98A] text-[11px] font-mono cursor-pointer hover:brightness-110"
                >
                  {isAr ? 'تسجيل الرفاهية' : 'Log Wellness'}
                </button>
              </div>
            </div>
          ) : (
            <div className="relative w-full h-48 my-2">
              <svg viewBox="0 0 500 170" className="w-full h-full overflow-visible">
                <line x1="30" y1="30" x2="480" y2="30" stroke="#162E48" strokeDasharray="3 3" opacity="0.6" />
                <line x1="30" y1="85" x2="480" y2="85" stroke="#162E48" strokeDasharray="3 3" opacity="0.6" />
                <line x1="30" y1="140" x2="480" y2="140" stroke="#162E48" strokeDasharray="3 3" opacity="0.6" />

                {sleepPoints.length > 1 && (
                  <polyline
                    fill="none"
                    stroke="#42C8F5"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={sleepPoints.join(' ')}
                  />
                )}
                {stressPoints.length > 1 && (
                  <polyline
                    fill="none"
                    stroke="#F2B84B"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={stressPoints.join(' ')}
                  />
                )}
                {energyPoints.length > 1 && (
                  <polyline
                    fill="none"
                    stroke="#35C98A"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={energyPoints.join(' ')}
                  />
                )}
              </svg>

              <div className="absolute top-2 right-4 flex flex-col gap-1 text-[11px] font-mono bg-[#07111F]/90 p-2.5 rounded-xl border border-[#162E48]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#42C8F5]" />
                  <span className="text-[#F2F6FA]">{isAr ? 'النوم' : 'Sleep'} ({sleepRecords.length})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#F2B84B]" />
                  <span className="text-[#F2F6FA]">{isAr ? 'التوتر' : 'Stress'} ({wellnessRecords.length})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#35C98A]" />
                  <span className="text-[#F2F6FA]">{isAr ? 'الطاقة' : 'Energy'} ({wellnessRecords.length})</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Next Action (5 Cols) */}
        <div className="lg:col-span-5 rounded-3xl p-5 sm:p-6 bg-[#0C1B2B] border border-[#162E48] shadow-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-sm font-display font-bold text-white">
              <Star className="w-4 h-4 text-[#42C8F5]" />
              <span>{isAr ? 'الإجراء الموصى به' : 'Next Action'}</span>
            </div>
            <span className="text-[10px] font-mono text-[#35C98A]">READY</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 my-auto py-3">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#173B60] border border-[#42C8F5]/30 flex items-center justify-center text-[#42C8F5] shrink-0">
                  <Moon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-display font-bold text-white leading-tight">
                    {isAr ? 'تسجيل المؤشرات والراحة' : 'Record Health & Sleep Log'}
                  </h4>
                  <p className="text-xs text-[#A9B8C8] font-sans mt-0.5 max-w-[210px]">
                    {isAr
                      ? 'أضف بياناتك اليومية لتمكين ASTRA من التحليل الدقيق.'
                      : 'Enter daily logs so ASTRA can analyze your actual trends.'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onNavigate('sleep')}
                className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#173B60] to-[#0099DD] hover:opacity-95 text-white font-bold text-xs font-mono tracking-wider transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>{isAr ? 'تسجيل الآن' : 'Log Now'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="relative w-28 h-28 shrink-0 flex items-center justify-center select-none">
              <div className="absolute inset-0 rounded-full border border-[#42C8F5]/20" />
              <div className="absolute inset-3 rounded-full border border-[#42C8F5]/40 border-dashed" />
              <svg viewBox="0 0 100 100" className="w-16 h-16 text-[#42C8F5]">
                <rect x="15" y="48" width="70" height="4" fill="#FFFFFF" opacity="0.9" />
                <rect x="42" y="38" width="16" height="24" rx="3" fill="#42C8F5" />
                <rect x="10" y="24" width="12" height="52" rx="2" fill="#173B60" stroke="#42C8F5" strokeWidth="1.5" />
                <rect x="78" y="24" width="12" height="52" rx="2" fill="#173B60" stroke="#42C8F5" strokeWidth="1.5" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Bottom Integrated ASTRA Assistant Bar */}
      <div className="rounded-3xl p-4 sm:p-5 bg-[#0C1B2B] border border-[#162E48] shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 w-full md:w-auto">
          <div className="w-11 h-11 rounded-full bg-[#07111F] border border-[#42C8F5]/50 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-[#42C8F5]" />
          </div>

          <div>
            <div className="text-sm font-display font-bold text-white leading-tight">
              {isAr ? 'مساعد ASTRA الذكي' : 'ASTRA Intelligence Assistant'}
            </div>
            <div className="text-xs text-[#A9B8C8] font-sans">
              {isAr ? 'اسأل بالعربية أو الإنجليزية — ينقلك مباشرة لوحدة الذكاء' : 'Ask in Arabic or English — opens directly in Intelligence Core'}
            </div>
          </div>
        </div>

        <form onSubmit={handleAssistantSubmit} className="relative w-full md:w-96 flex items-center">
          <input
            type="text"
            value={assistantInput}
            onChange={(e) => setAssistantInput(e.target.value)}
            placeholder={isAr ? 'اسأل ASTRA أي سؤال...' : 'Ask ASTRA anything...'}
            className="w-full bg-[#07111F] border border-[#162E48] focus:border-[#42C8F5] rounded-full px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-all"
          />
          <button
            type="submit"
            className="mx-1 p-2 rounded-full bg-[#42C8F5] text-[#07111F] hover:brightness-110 transition-all cursor-pointer shrink-0"
            title={isAr ? 'إرسال' : 'Send'}
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      {/* 5. Quick Access Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          type="button"
          onClick={() => onNavigate('health_core')}
          className="px-4 py-3 rounded-2xl bg-[#0C1B2B] hover:bg-[#11263A] border border-[#35C98A]/40 hover:border-[#35C98A] transition-all flex items-center justify-between gap-3 cursor-pointer group shadow-lg text-start"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#35C98A]/15 border border-[#35C98A]/40 flex items-center justify-center text-[#35C98A] shrink-0">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-display font-bold text-white group-hover:text-[#35C98A] transition-colors truncate">
                {isAr ? 'نواة الصحة وبيانات NASA' : 'Health Core & NASA Data'}
              </div>
              <div className="text-[10px] text-[#A9B8C8] font-mono truncate">
                {isAr ? 'استيراد CSV · فحص النطاقات' : 'CSV/JSON Ingest · Provenance'}
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-[#A9B8C8] group-hover:text-white shrink-0" />
        </button>

        <button
          type="button"
          onClick={() => onNavigate('predict')}
          className="px-4 py-3 rounded-2xl bg-[#0C1B2B] hover:bg-[#11263A] border border-[#42C8F5]/40 hover:border-[#42C8F5] transition-all flex items-center justify-between gap-3 cursor-pointer group shadow-lg text-start"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#42C8F5]/15 border border-[#42C8F5]/40 flex items-center justify-center text-[#42C8F5] shrink-0">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-display font-bold text-white group-hover:text-[#42C8F5] transition-colors truncate">
                ASTRA PREDICT
              </div>
              <div className="text-[10px] text-[#A9B8C8] font-mono truncate">
                {isAr ? 'جدولة استباقية · ربط DSN' : 'Preemptive Link · DSN Hub'}
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-[#A9B8C8] group-hover:text-white shrink-0" />
        </button>

        <button
          type="button"
          onClick={() => onNavigate('emergency')}
          className="px-4 py-3 rounded-2xl bg-[#11263A] hover:bg-[#162E48] border border-[#E85D65]/40 hover:border-[#E85D65] transition-all flex items-center justify-between gap-3 cursor-pointer group shadow-lg text-start"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#E85D65]/20 border border-[#E85D65]/50 flex items-center justify-center text-[#E85D65] shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-display font-bold text-white group-hover:text-[#E85D65] transition-colors truncate">
                {isAr ? 'موارد الطوارئ والإنقاذ' : 'Emergency Resources'}
              </div>
              <div className="text-[10px] text-[#A9B8C8] font-mono truncate">
                {isAr ? '18 بروتوكول من ناسا' : '18 NASA Protocols'}
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-[#A9B8C8] group-hover:text-white shrink-0" />
        </button>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { 
  SleepRecord, 
  WellnessRecord, 
  RespiratoryRecord, 
  BodyMetricRecord,
  ModuleTab, 
  Language, 
  WellnessTask, 
  MissionBadge 
} from '../types';
import { TRANSLATIONS } from '../utils/translations';
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
  Clock, 
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ShieldAlert,
  SlidersHorizontal,
  ChevronRight,
  Database
} from 'lucide-react';

interface OverviewViewProps {
  sleepRecords: SleepRecord[];
  wellnessRecords: WellnessRecord[];
  respiratoryRecords: RespiratoryRecord[];
  bodyMetrics?: BodyMetricRecord[];
  tasks: WellnessTask[];
  onToggleTask: (taskId: string) => void;
  onAddTask: (title: string, titleAr: string) => void;
  badges: MissionBadge[];
  onNavigate: (tab: ModuleTab) => void;
  lang: Language;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  sleepRecords,
  wellnessRecords,
  respiratoryRecords,
  bodyMetrics,
  onNavigate,
  lang,
}) => {
  const t = TRANSLATIONS[lang];

  const [trendTimeframe, setTrendTimeframe] = useState<'1D' | '1W' | '1M'>('1D');
  const [assistantInput, setAssistantInput] = useState<string>('');

  // Latest calculated data
  const latestSleep = sleepRecords[sleepRecords.length - 1];
  const latestWellness = wellnessRecords[wellnessRecords.length - 1];
  const latestResp = respiratoryRecords[respiratoryRecords.length - 1];

  const sleepHours = latestSleep ? (latestSleep.durationMinutes / 60).toFixed(1) : '7.5';
  const sleepDisplay = latestSleep 
    ? `${Math.floor(latestSleep.durationMinutes / 60)}h ${latestSleep.durationMinutes % 60}m`
    : '7h 32m';

  const respDisplay = latestResp ? latestResp.respiratoryRate : 16;
  const wellnessScore = latestWellness ? ((latestWellness.moodRating + latestWellness.energyRating) / 2 * 2).toFixed(1) : '8.5';

  const handleAssistantSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assistantInput.trim()) return;
    onNavigate('assistant');
  };

  return (
    <div className="space-y-5 pb-16 max-w-7xl mx-auto">
      {/* 1. Hero Banner: Exactly matching reference image top section */}
      <div className="relative rounded-3xl overflow-hidden bg-[#0C1B2B] border border-[#162E48] shadow-2xl p-6 sm:p-8">
        {/* Right background: Earth curvature & Astronaut in EVA suit */}
        <div className="absolute right-0 top-0 bottom-0 w-full sm:w-2/3 md:w-1/2 pointer-events-none overflow-hidden select-none">
          <img
            src="/public/assets/aistudio/file_00000000740082468d45c8f9dd0784f4_8c03b9ab.png"
            alt="Astronaut Spaceflight View"
            className="w-full h-full object-cover object-[75%_18%] opacity-70 mask-radial"
            style={{
              maskImage: 'linear-gradient(to right, transparent 0%, black 50%)',
              WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 50%)'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0C1B2B] via-[#0C1B2B]/60 to-transparent" />
        </div>

        {/* Content on left */}
        <div className="relative z-10 max-w-xl">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-[#F2F6FA] tracking-wide">
            {lang === 'ar' ? 'مرحبًا، القائدة سارة' : 'Welcome, Commander'}
          </h1>
          <p className="text-xs sm:text-sm text-[#A9B8C8] italic font-sans mt-1">
            One Astronaut. One Mission. One Health Picture.
          </p>

          {/* Overall Health Status Card matching reference image */}
          <div className="mt-5 p-4 rounded-2xl bg-[#07111F]/90 border border-[#162E48] backdrop-blur-md max-w-md shadow-lg">
            <div className="flex items-center justify-between pb-2 border-b border-[#162E48]/50">
              <div className="flex items-center gap-2 text-xs font-mono text-[#A9B8C8]">
                <Activity className="w-3.5 h-3.5 text-[#42C8F5]" />
                <span>Overall Health Status</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-[#35C98A] border border-[#35C98A]/30">
                SIMULATED DATA
              </span>
            </div>

            <div className="flex items-center justify-between pt-3">
              <div className="flex items-center gap-3">
                {/* Large Green Checkmark Circle */}
                <div className="w-10 h-10 rounded-full bg-[#35C98A]/15 border border-[#35C98A]/40 flex items-center justify-center text-[#35C98A] shadow-[0_0_15px_rgba(53,201,138,0.25)] shrink-0">
                  <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
                </div>
                <div>
                  <div className="text-xl font-display font-bold text-[#35C98A] tracking-wider leading-tight">
                    Optimal
                  </div>
                  <div className="text-xs text-[#A9B8C8] font-sans">
                    All systems nominal
                  </div>
                </div>
              </div>

              {/* Cyan Animated EKG vital line waveform */}
              <div className="w-36 h-10 hidden sm:flex items-center justify-end overflow-hidden">
                <svg viewBox="0 0 140 40" className="w-full h-full text-[#42C8F5]">
                  <path
                    d="M 0 20 L 30 20 L 38 12 L 44 28 L 52 4 L 60 36 L 68 18 L 76 22 L 85 20 L 140 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="drop-shadow-[0_0_6px_#42C8F5]"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Top 4 Metric Cards Row: Sleep, Respiration, Wellness, Body Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Sleep */}
        <div 
          onClick={() => onNavigate('sleep')}
          className="rounded-2xl p-4 bg-[#0C1B2B] border border-[#162E48] hover:border-[#42C8F5]/60 transition-all cursor-pointer group shadow-lg flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono text-[#A9B8C8]">
              <Moon className="w-4 h-4 text-[#42C8F5]" />
              <span>Sleep</span>
            </div>
            <span className="text-[10px] font-mono text-slate-500">SIMULATED</span>
          </div>

          <div className="flex items-center justify-between my-3">
            <div>
              <div className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
                {sleepDisplay}
              </div>
              <div className="flex items-center gap-2 text-xs text-[#A9B8C8] mt-1 font-sans">
                <span>Goal: 7h+</span>
                <span className="text-[#35C98A] font-mono font-semibold">↑ +12%</span>
              </div>
            </div>

            {/* Cyan Circular Progress Ring (85%) */}
            <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-[#11263A]"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-[#42C8F5] drop-shadow-[0_0_8px_#42C8F5]"
                  strokeDasharray="85, 100"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Card 2: Respiration */}
        <div 
          onClick={() => onNavigate('breathing')}
          className="rounded-2xl p-4 bg-[#0C1B2B] border border-[#162E48] hover:border-[#42C8F5]/60 transition-all cursor-pointer group shadow-lg flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono text-[#A9B8C8]">
              <Wind className="w-4 h-4 text-[#42C8F5]" />
              <span>Respiration</span>
            </div>
            <span className="text-[10px] font-mono text-slate-500">SIMULATED</span>
          </div>

          <div className="flex items-center justify-between my-3">
            <div>
              <div className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight flex items-baseline gap-1">
                <span>{respDisplay}</span>
                <span className="text-sm font-sans font-normal text-[#A9B8C8]">/min</span>
              </div>
              <div className="text-xs text-[#35C98A] mt-1 font-sans">
                Normal Range
              </div>
            </div>

            {/* Cyan Waveform curve */}
            <div className="w-16 h-10 flex items-center justify-center">
              <svg viewBox="0 0 80 40" className="w-full h-full text-[#42C8F5]">
                <path
                  d="M 0 25 C 15 10, 25 35, 40 20 C 55 5, 65 30, 80 18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  className="drop-shadow-[0_0_6px_#42C8F5]"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Card 3: Wellness */}
        <div 
          onClick={() => onNavigate('wellness')}
          className="rounded-2xl p-4 bg-[#0C1B2B] border border-[#162E48] hover:border-[#42C8F5]/60 transition-all cursor-pointer group shadow-lg flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono text-[#A9B8C8]">
              <Heart className="w-4 h-4 text-[#42C8F5]" />
              <span>Wellness</span>
            </div>
            <span className="text-[10px] font-mono text-slate-500">SIMULATED</span>
          </div>

          <div className="flex items-center justify-between my-3">
            <div>
              <div className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight flex items-baseline gap-1">
                <span>{wellnessScore}</span>
                <span className="text-sm font-sans font-normal text-[#A9B8C8]">/10</span>
              </div>
              <div className="text-xs text-[#35C98A] mt-1 font-sans">
                Good
              </div>
            </div>

            {/* Cyan Equalizer / Bars chart matching reference */}
            <div className="flex items-end gap-1.5 h-10">
              <div className="w-1.5 h-4 rounded-full bg-[#42C8F5]/50" />
              <div className="w-1.5 h-6 rounded-full bg-[#42C8F5]/70" />
              <div className="w-1.5 h-7 rounded-full bg-[#42C8F5]/80" />
              <div className="w-1.5 h-9 rounded-full bg-[#42C8F5]" />
              <div className="w-1.5 h-10 rounded-full bg-[#42C8F5] shadow-[0_0_8px_#42C8F5]" />
            </div>
          </div>
        </div>

        {/* Card 4: Body Metrics / Health Core */}
        <div 
          onClick={() => onNavigate('health_core')}
          className="rounded-2xl p-4 bg-[#0C1B2B] border border-[#162E48] hover:border-[#42C8F5]/60 transition-all cursor-pointer group shadow-lg flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono text-[#A9B8C8]">
              <Thermometer className="w-4 h-4 text-[#42C8F5]" />
              <span>Body Metrics</span>
            </div>
            <span className={`text-[10px] font-mono ${bodyMetrics && bodyMetrics.length > 0 ? 'text-[#35C98A]' : 'text-slate-500'}`}>
              {bodyMetrics && bodyMetrics[0] ? bodyMetrics[0].source.toUpperCase() : 'OFFLINE'}
            </span>
          </div>

          <div className="flex items-center justify-between my-3">
            {bodyMetrics && bodyMetrics.length > 0 && bodyMetrics[0].heartRateBpm ? (
              <div>
                <div className="text-xl sm:text-2xl font-display font-bold text-white tracking-tight flex items-baseline gap-1">
                  <span>{bodyMetrics[0].heartRateBpm}</span>
                  <span className="text-xs font-sans font-normal text-[#A9B8C8]">bpm</span>
                  <span className="text-xs font-mono text-[#42C8F5] ml-2">
                    {bodyMetrics[0].bloodPressureSys}/{bodyMetrics[0].bloodPressureDia}
                  </span>
                </div>
                <div className="text-xs text-[#35C98A] mt-1 font-sans">
                  {lang === 'ar' ? 'المؤشرات الحيوية طبيعية' : 'Nominal Envelopes'}
                </div>
              </div>
            ) : (
              <div>
                <div className="text-lg sm:text-xl font-display font-bold text-white tracking-tight">
                  No New Data
                </div>
                <div className="text-xs text-[#A9B8C8] mt-1 font-sans">
                  Last: 12h ago
                </div>
              </div>
            )}

            <div className="text-[#A9B8C8] text-xl font-mono">
              {bodyMetrics && bodyMetrics.length > 0 && bodyMetrics[0].spO2Percent ? `${bodyMetrics[0].spO2Percent}%` : '—'}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Middle Row: Trends Overview & Next Action */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Trends Overview (7 Cols) matching reference curve chart */}
        <div className="lg:col-span-7 rounded-3xl p-5 sm:p-6 bg-[#0C1B2B] border border-[#162E48] shadow-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-sm font-display font-bold text-white">
              <BarChart2 className="w-4 h-4 text-[#42C8F5]" />
              <span>Trends Overview</span>
            </div>

            {/* Timeframe selector: [1D] [1W] [1M] */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-[#07111F] border border-[#162E48]">
              {(['1D', '1W', '1M'] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setTrendTimeframe(period)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                    trendTimeframe === period
                      ? 'bg-[#173B60] text-[#42C8F5] font-bold border border-[#42C8F5]/40 shadow-[0_0_10px_rgba(66,200,245,0.25)]'
                      : 'text-[#A9B8C8] hover:text-white'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>

          {/* Multi-curve Smooth Wave Chart matching reference image */}
          <div className="relative w-full h-48 my-2">
            <svg viewBox="0 0 500 180" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="sleepWaveGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#42C8F5" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#42C8F5" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid lines */}
              <line x1="30" y1="30" x2="490" y2="30" stroke="#162E48" strokeDasharray="3 3" opacity="0.6" />
              <line x1="30" y1="80" x2="490" y2="80" stroke="#162E48" strokeDasharray="3 3" opacity="0.6" />
              <line x1="30" y1="130" x2="490" y2="130" stroke="#162E48" strokeDasharray="3 3" opacity="0.6" />

              {/* Curve 1: Sleep (Cyan/Blue #42C8F5) */}
              <path
                d="M 30 110 C 90 60, 160 140, 240 85 C 320 30, 400 120, 480 75"
                fill="none"
                stroke="#42C8F5"
                strokeWidth="2.5"
                strokeLinecap="round"
                className="drop-shadow-[0_0_8px_#42C8F5]"
              />

              {/* Curve 2: Stress (Orange #F2B84B) */}
              <path
                d="M 30 85 C 100 130, 180 65, 260 120 C 340 170, 410 70, 480 115"
                fill="none"
                stroke="#F2B84B"
                strokeWidth="2.5"
                strokeLinecap="round"
                className="drop-shadow-[0_0_8px_#F2B84B]"
              />

              {/* Curve 3: Energy (Green #35C98A) */}
              <path
                d="M 30 140 C 110 125, 190 145, 270 135 C 350 125, 420 150, 480 138"
                fill="none"
                stroke="#35C98A"
                strokeWidth="2"
                strokeLinecap="round"
                className="drop-shadow-[0_0_8px_#35C98A]"
              />

              {/* Key Data Point nodes */}
              <circle cx="240" cy="85" r="4" fill="#42C8F5" stroke="#0C1B2B" strokeWidth="2" />
              <circle cx="260" cy="120" r="4" fill="#F2B84B" stroke="#0C1B2B" strokeWidth="2" />
              <circle cx="270" cy="135" r="4" fill="#35C98A" stroke="#0C1B2B" strokeWidth="2" />
            </svg>

            {/* Legend placed inside chart area as in reference */}
            <div className="absolute top-2 right-4 flex flex-col gap-1.5 text-[11px] font-mono bg-[#07111F]/80 p-2.5 rounded-xl border border-[#162E48]/80 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#42C8F5]" />
                <span className="text-[#F2F6FA]">Sleep</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F2B84B]" />
                <span className="text-[#F2F6FA]">Stress</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#35C98A]" />
                <span className="text-[#F2F6FA]">Energy</span>
              </div>
            </div>
          </div>

          {/* Time axis matching reference: 00:00 06:00 12:00 18:00 24:00 */}
          <div className="flex justify-between text-xs font-mono text-[#A9B8C8] px-4 pt-2 border-t border-[#162E48]">
            <span>00:00</span>
            <span>06:00</span>
            <span>12:00</span>
            <span>18:00</span>
            <span>24:00</span>
          </div>
        </div>

        {/* Right: Next Action (5 Cols) with 3D Orbital Radar & Station matching reference */}
        <div className="lg:col-span-5 rounded-3xl p-5 sm:p-6 bg-[#0C1B2B] border border-[#162E48] shadow-2xl flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-sm font-display font-bold text-white">
              <Star className="w-4 h-4 text-[#42C8F5]" />
              <span>Next Action</span>
            </div>
            <span className="text-[10px] font-mono text-[#35C98A]">SCHEDULED</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 my-auto">
            {/* Left text & CTA */}
            <div className="space-y-3 z-10">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#173B60] border border-[#42C8F5]/30 flex items-center justify-center text-[#42C8F5] shrink-0">
                  <Moon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-display font-bold text-white leading-tight">
                    Record Sleep Log
                  </h4>
                  <p className="text-xs text-[#A9B8C8] font-sans mt-0.5 max-w-[190px]">
                    Track your sleep schedule for better analysis.
                  </p>
                </div>
              </div>

              <button
                onClick={() => onNavigate('sleep')}
                className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#173B60] to-[#0099DD] hover:opacity-95 text-white font-bold text-xs font-mono tracking-wider transition-all shadow-[0_0_15px_rgba(66,200,245,0.35)] flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <span>Log Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Right: Holographic Orbital Radar & Station Silhouette */}
            <div className="relative w-36 h-36 shrink-0 flex items-center justify-center select-none">
              {/* Concentric rotating rings */}
              <div className="absolute inset-0 rounded-full border border-[#42C8F5]/20 animate-[spin_30s_linear_infinite]" />
              <div className="absolute inset-2 rounded-full border border-[#42C8F5]/40 border-dashed" />
              <div className="absolute inset-6 rounded-full border border-[#42C8F5]/60 animate-ping opacity-20" />
              <div className="absolute inset-8 rounded-full bg-[#42C8F5]/10 backdrop-blur-sm" />

              {/* Space Station / ISS Graphic Silhouette */}
              <div className="relative z-10 w-20 h-20 flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-full h-full text-[#42C8F5] drop-shadow-[0_0_10px_#42C8F5]">
                  {/* Central truss */}
                  <rect x="15" y="48" width="70" height="4" fill="#FFFFFF" opacity="0.9" />
                  {/* Main module */}
                  <rect x="42" y="38" width="16" height="24" rx="3" fill="#42C8F5" />
                  {/* Solar Arrays Left */}
                  <rect x="10" y="24" width="12" height="52" rx="2" fill="#173B60" stroke="#42C8F5" strokeWidth="1.5" />
                  <line x1="10" y1="37" x2="22" y2="37" stroke="#42C8F5" strokeWidth="1" />
                  <line x1="10" y1="50" x2="22" y2="50" stroke="#42C8F5" strokeWidth="1" />
                  <line x1="10" y1="63" x2="22" y2="63" stroke="#42C8F5" strokeWidth="1" />
                  {/* Solar Arrays Right */}
                  <rect x="78" y="24" width="12" height="52" rx="2" fill="#173B60" stroke="#42C8F5" strokeWidth="1.5" />
                  <line x1="78" y1="37" x2="90" y2="37" stroke="#42C8F5" strokeWidth="1" />
                  <line x1="78" y1="50" x2="90" y2="50" stroke="#42C8F5" strokeWidth="1" />
                  <line x1="78" y1="63" x2="90" y2="63" stroke="#42C8F5" strokeWidth="1" />
                  {/* Radiator and docking ports */}
                  <circle cx="50" cy="50" r="3" fill="#FFFFFF" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Bottom Integrated ASTRA Assistant Bar: Matching reference image */}
      <div className="rounded-3xl p-4 sm:p-5 bg-[#0C1B2B] border border-[#162E48] shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: Glowing AI sphere / orb icon + greeting */}
        <div className="flex items-center gap-3.5 w-full md:w-auto">
          {/* Luminous AI Sphere icon matching reference */}
          <div className="relative w-12 h-12 rounded-full p-0.5 bg-gradient-to-tr from-[#0099DD] via-[#8B7CFF] to-[#42C8F5] shadow-[0_0_20px_rgba(66,200,245,0.4)] flex items-center justify-center shrink-0">
            <div className="w-full h-full rounded-full bg-[#07111F] flex items-center justify-center overflow-hidden relative">
              <div className="absolute inset-1 rounded-full bg-gradient-to-br from-[#173B60] via-[#07111F] to-[#42C8F5]/30 animate-pulse" />
              <Sparkles className="w-5 h-5 text-[#42C8F5] relative z-10" />
            </div>
          </div>

          <div>
            <div className="text-sm font-display font-bold text-white leading-tight">
              ASTRA Assistant
            </div>
            <div className="text-xs text-[#A9B8C8] font-sans">
              How can I help you today, Commander?
            </div>
          </div>
        </div>

        {/* Right: Input bar matching reference with cyan arrow button */}
        <form onSubmit={handleAssistantSubmit} className="relative w-full md:w-96 flex items-center">
          <input
            type="text"
            value={assistantInput}
            onChange={(e) => setAssistantInput(e.target.value)}
            placeholder="Ask anything..."
            className="w-full bg-[#07111F] border border-[#162E48] focus:border-[#42C8F5] rounded-full pl-4 pr-12 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-all shadow-inner"
          />
          <button
            type="submit"
            className="absolute right-1.5 p-2 rounded-full bg-gradient-to-r from-[#173B60] to-[#0099DD] text-white hover:opacity-95 transition-opacity cursor-pointer shadow-[0_0_10px_rgba(66,200,245,0.4)]"
            title="Send"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      {/* 5. Health Core, ASTRA PREDICT, and Emergency Resources Quick Access Bars */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Health Core & NASA Data Button */}
        <button
          onClick={() => onNavigate('health_core')}
          className="px-4 py-3 rounded-2xl bg-[#0C1B2B] hover:bg-[#11263A] border border-[#35C98A]/40 hover:border-[#35C98A] transition-all flex items-center justify-between gap-3 cursor-pointer group shadow-lg text-left"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#35C98A]/15 border border-[#35C98A]/40 flex items-center justify-center text-[#35C98A] shadow-[0_0_12px_rgba(53,201,138,0.3)] shrink-0">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-display font-bold text-white group-hover:text-[#35C98A] transition-colors truncate">
                {lang === 'ar' ? 'نواة الصحة وبيانات NASA' : 'Health Core & NASA Data'}
              </div>
              <div className="text-[10px] text-[#A9B8C8] font-mono truncate">
                {lang === 'ar' ? 'استيراد CSV · فحص النطاقات' : 'CSV/JSON Ingest · Provenance'}
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-[#A9B8C8] group-hover:text-white transition-colors shrink-0" />
        </button>

        {/* ASTRA PREDICT Button */}
        <button
          onClick={() => onNavigate('predict')}
          className="px-4 py-3 rounded-2xl bg-[#0C1B2B] hover:bg-[#11263A] border border-[#42C8F5]/40 hover:border-[#42C8F5] transition-all flex items-center justify-between gap-3 cursor-pointer group shadow-lg text-left"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#42C8F5]/15 border border-[#42C8F5]/40 flex items-center justify-center text-[#42C8F5] shadow-[0_0_12px_rgba(66,200,245,0.3)] shrink-0">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-display font-bold text-white group-hover:text-[#42C8F5] transition-colors truncate">
                {lang === 'ar' ? 'ASTRA PREDICT' : 'ASTRA PREDICT'}
              </div>
              <div className="text-[10px] text-[#A9B8C8] font-mono truncate">
                {lang === 'ar' ? 'جدولة استباقية · ربط DSN' : 'Preemptive Link · DSN Hub'}
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-[#A9B8C8] group-hover:text-white transition-colors shrink-0" />
        </button>

        {/* Emergency Resources Quick Access Bar */}
        <button
          onClick={() => onNavigate('emergency')}
          className="px-4 py-3 rounded-2xl bg-[#11263A] hover:bg-[#162E48] border border-[#E85D65]/40 hover:border-[#E85D65] transition-all flex items-center justify-between gap-3 cursor-pointer group shadow-lg text-left"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#E85D65]/20 border border-[#E85D65]/50 flex items-center justify-center text-[#E85D65] shadow-[0_0_12px_rgba(232,93,101,0.3)] shrink-0">
              <AlertTriangle className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="text-xs font-display font-bold text-white group-hover:text-[#E85D65] transition-colors truncate">
                {lang === 'ar' ? 'موارد الطوارئ والإنقاذ' : 'Emergency Resources'}
              </div>
              <div className="text-[10px] text-[#A9B8C8] font-mono truncate">
                {lang === 'ar' ? '18 بروتوكول من ناسا' : '18 NASA Protocols'}
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-[#A9B8C8] group-hover:text-white transition-colors shrink-0" />
        </button>
      </div>
    </div>
  );
};

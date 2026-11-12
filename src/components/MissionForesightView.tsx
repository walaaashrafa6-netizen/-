import React, { useState } from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../utils/translations';
import { 
  Compass, 
  Calendar, 
  CheckSquare, 
  Rocket, 
  Clock, 
  ShieldCheck, 
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface MissionForesightViewProps {
  lang: Language;
}

export const MissionForesightView: React.FC<MissionForesightViewProps> = ({ lang }) => {
  const t = TRANSLATIONS[lang];

  const [checklist, setChecklist] = useState([
    { id: 'c1', label: 'Spacewalk (EVA 91) 72h Pre-breathe Oxygen Protocol', done: true },
    { id: 'c2', label: 'EMU Spacesuit Thermal Micrometeorite Garment fit check', done: true },
    { id: 'c3', label: 'Circadian Slam-Shift: Delay sleep window by 3.5 hours for HTV cargo docking', done: false },
    { id: 'c4', label: 'Vestibular otolith conditioning before Soyuz return de-orbit burn', done: false },
  ]);

  const toggleCheck = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item))
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="glass-panel rounded-3xl p-6 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#FFBF69] tracking-wider uppercase mb-1">
              <Compass className="w-4 h-4 text-[#FFBF69]" />
              <span>MISSION PHASING & PREPARATION · MODULE 06</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-display font-bold text-white tracking-wide">
              {t.foresightOrbitTitle}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-sans mt-1 max-w-2xl">
              {lang === 'ar'
                ? 'جداول مراحل المهمة، وقوائم الاستعداد لعمليات السير في الفضاء والالتحام المداري، والتحضير الفسيولوجي للعودة للأرض.'
                : 'Mission timeline progression, EVA spacewalk preparation checklists, and terrestrial re-entry conditioning.'}
            </p>
          </div>

          <div className="px-3 py-1 rounded-full bg-amber-500/10 text-[#FFBF69] border border-[#FFBF69]/30 text-xs font-mono font-semibold">
            FLIGHT DAY 48 OF 180
          </div>
        </div>
      </div>

      {/* Mission Phases Timeline */}
      <div className="glass-panel rounded-3xl p-6">
        <h2 className="text-base font-display font-bold text-white mb-4 pb-2 border-b border-[#1E2D4A]">
          {lang === 'ar' ? 'المسار الزمني لمراحل المهمة (Expedition 72 Timeline)' : 'Expedition 72 Flight Phasing'}
        </h2>

        <div className="space-y-4">
          {/* Phase 1 */}
          <div className="p-4 rounded-2xl bg-[#080B16] border border-[#20E0A0]/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#20E0A0]/20 text-[#20E0A0] flex items-center justify-center font-bold text-xs">
                ✓
              </div>
              <div>
                <div className="text-xs font-bold text-white">Phase 1: Orbit Insertion & Acute Adaptation</div>
                <div className="text-[11px] text-slate-400 font-mono">Flight Days 1 – 14 · Completed</div>
              </div>
            </div>
            <span className="text-xs font-mono text-[#20E0A0]">SAS Adaptation Complete</span>
          </div>

          {/* Phase 2: Active Science */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-[#121D33] to-[#101827] border border-[#36D9FF] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-[0_0_20px_rgba(54,217,255,0.15)]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#36D9FF]/20 text-[#36D9FF] flex items-center justify-center font-bold text-xs animate-pulse">
                ●
              </div>
              <div>
                <div className="text-xs font-bold text-white">Phase 2: Core Microgravity Science & Station Maintenance</div>
                <div className="text-[11px] text-slate-400 font-mono">Flight Days 15 – 120 · Current Phase</div>
              </div>
            </div>
            <span className="text-xs font-mono text-[#36D9FF] font-semibold">Active Operational Sol</span>
          </div>

          {/* Phase 3: Upcoming EVAs */}
          <div className="p-4 rounded-2xl bg-[#080B16] border border-[#1E2D4A] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 opacity-80">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center font-bold text-xs">
                3
              </div>
              <div>
                <div className="text-xs font-bold text-white">Phase 3: US Spacewalk EVA 91 & Roll-Out Solar Array Deployment</div>
                <div className="text-[11px] text-slate-400 font-mono">Flight Day 64 · T-16 Days</div>
              </div>
            </div>
            <span className="text-xs font-mono text-[#FFBF69]">Pre-breathe Conditioning</span>
          </div>
        </div>
      </div>

      {/* Preparation Checklist */}
      <div className="glass-panel rounded-3xl p-6">
        <h2 className="text-base font-display font-bold text-white mb-4 pb-2 border-b border-[#1E2D4A]">
          {lang === 'ar' ? 'قائمة الجاهزية والبروتوكولات القادمة' : 'Operational Wellness Checklists'}
        </h2>

        <div className="space-y-2.5">
          {checklist.map((item) => (
            <div
              key={item.id}
              onClick={() => toggleCheck(item.id)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                item.done
                  ? 'bg-[#101827] border-[#20E0A0]/30 text-slate-300'
                  : 'bg-[#080B16] border-[#1E2D4A] hover:border-[#36D9FF] text-white'
              }`}
            >
              <div className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-colors ${
                item.done
                  ? 'bg-[#20E0A0] border-[#20E0A0] text-[#080B16]'
                  : 'border-slate-500 hover:border-[#36D9FF]'
              }`}>
                {item.done && <CheckSquare className="w-4 h-4 stroke-[2.5]" />}
              </div>
              <span className={`text-xs font-sans ${item.done ? 'line-through text-slate-400' : 'font-medium'}`}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

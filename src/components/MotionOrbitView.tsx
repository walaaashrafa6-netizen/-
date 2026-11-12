import React, { useState } from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../utils/translations';
import { 
  Dumbbell, 
  Flame, 
  Heart, 
  CheckCircle2, 
  Clock, 
  Play, 
  ShieldCheck, 
  AlertCircle,
  Plus
} from 'lucide-react';

interface MotionOrbitViewProps {
  lang: Language;
}

export const MotionOrbitView: React.FC<MotionOrbitViewProps> = ({ lang }) => {
  const t = TRANSLATIONS[lang];

  const [aredMinutes, setAredMinutes] = useState<number>(45);
  const [t2Minutes, setT2Minutes] = useState<number>(30);
  const [exerciseLogged, setExerciseLogged] = useState<boolean>(false);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="glass-panel rounded-3xl p-6 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#20E0A0] tracking-wider uppercase mb-1">
              <Dumbbell className="w-4 h-4 text-[#20E0A0]" />
              <span>COUNTERMEASURE PHYSIOLOGY · MODULE 05</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-display font-bold text-white tracking-wide">
              {t.motionOrbitTitle}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-sans mt-1 max-w-2xl">
              {lang === 'ar'
                ? 'مكافحة ضمور العضلات وفقدان كثافة العظام عبر بروتوكولات التحميل الميكانيكي المعتمدة لوكالات الفضاء.'
                : 'Musculoskeletal bone density preservation and aerobic conditioning via ARED and T2 countermeasure hardware.'}
            </p>
          </div>

          <div className="px-3 py-1 rounded-full bg-emerald-500/10 text-[#20E0A0] border border-[#20E0A0]/30 text-xs font-mono font-semibold">
            2.5h DAILY MANDATE
          </div>
        </div>
      </div>

      {/* Countermeasure Hardware Trackers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Hardware 1: ARED */}
        <div className="glass-panel rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#20E0A0]/15 border border-[#20E0A0]/40 flex items-center justify-center text-[#20E0A0]">
                  <Dumbbell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-display font-bold text-white">
                    ARED (Advanced Resistive Exercise)
                  </h3>
                  <span className="text-[10px] font-mono text-[#20E0A0]">Vacuum Cylinders · Up to 600 lbs</span>
                </div>
              </div>
              <span className="text-xs font-mono text-white font-bold">45 min</span>
            </div>

            <p className="text-xs text-slate-300 font-sans leading-relaxed mb-4">
              {lang === 'ar'
                ? 'تمارين الرفعة الميتة والقرفصاء الثنائية لتوليد قوى الشد الميكانيكي على عظم الفخذ والفقرات القطنية.'
                : 'Axial mechanical strain squats and deadlifts to stimulate osteoblast activity and preserve lumbar density.'}
            </p>

            <div className="space-y-2 text-xs font-mono text-slate-300">
              <div className="flex items-center justify-between p-2 rounded-xl bg-[#080B16] border border-[#1E2D4A]">
                <span>Squat Protocol (4 sets × 10 reps):</span>
                <span className="text-[#36D9FF]">185 kg equivalent</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-[#080B16] border border-[#1E2D4A]">
                <span>Romanian Deadlift:</span>
                <span className="text-[#36D9FF]">160 kg equivalent</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              setExerciseLogged(true);
              setTimeout(() => setExerciseLogged(false), 2500);
            }}
            className="mt-5 w-full py-2.5 rounded-xl bg-[#20E0A0] hover:bg-[#34e8aa] text-[#080B16] font-bold text-xs font-mono uppercase tracking-wider transition-all"
          >
            {exerciseLogged ? 'Recorded to Mission Log!' : 'Confirm ARED Protocol Completed'}
          </button>
        </div>

        {/* Hardware 2: T2 Treadmill */}
        <div className="glass-panel rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#36D9FF]/15 border border-[#36D9FF]/40 flex items-center justify-center text-[#36D9FF]">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-display font-bold text-white">
                    T2 Colbert Treadmill
                  </h3>
                  <span className="text-[10px] font-mono text-[#36D9FF]">Bungee Harness Loading (75% Earth G)</span>
                </div>
              </div>
              <span className="text-xs font-mono text-white font-bold">30 min</span>
            </div>

            <p className="text-xs text-slate-300 font-sans leading-relaxed mb-4">
              {lang === 'ar'
                ? 'الجري المداري بأحزمة الشد المطاطية لدعم الحجم القلبي والدورة الدموية ومكافحة فقدان عضلات الساق.'
                : 'Bungee-loaded interval running to maintain stroke volume, aerobic VO₂ max, and soleus muscle volume.'}
            </p>

            <div className="space-y-2 text-xs font-mono text-slate-300">
              <div className="flex items-center justify-between p-2 rounded-xl bg-[#080B16] border border-[#1E2D4A]">
                <span>Target Heart Rate Zone:</span>
                <span className="text-[#20E0A0]">140 - 155 BPM</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-[#080B16] border border-[#1E2D4A]">
                <span>Harness Pull Down Force:</span>
                <span className="text-[#36D9FF]">58 kg (80% BW)</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              setExerciseLogged(true);
              setTimeout(() => setExerciseLogged(false), 2500);
            }}
            className="mt-5 w-full py-2.5 rounded-xl bg-[#36D9FF] hover:bg-[#62e2ff] text-[#080B16] font-bold text-xs font-mono uppercase tracking-wider transition-all"
          >
            {exerciseLogged ? 'Recorded to Mission Log!' : 'Confirm T2 Protocol Completed'}
          </button>
        </div>
      </div>
    </div>
  );
};

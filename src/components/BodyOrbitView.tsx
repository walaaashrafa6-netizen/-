import React, { useState } from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../utils/translations';
import { 
  Activity, 
  Heart, 
  Thermometer, 
  Gauge, 
  Radio, 
  ShieldAlert, 
  AlertCircle,
  Clock,
  ArrowRight
} from 'lucide-react';

interface BodyOrbitViewProps {
  lang: Language;
}

export const BodyOrbitView: React.FC<BodyOrbitViewProps> = ({ lang }) => {
  const t = TRANSLATIONS[lang];

  // Simulated optical biosensor readings (clearly labeled)
  const [heartRate, setHeartRate] = useState<number>(68);
  const [systolic, setSystolic] = useState<number>(118);
  const [diastolic, setDiastolic] = useState<number>(76);
  const [coreTemp, setCoreTemp] = useState<number>(36.8);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="glass-panel rounded-3xl p-6 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#36D9FF] tracking-wider uppercase mb-1">
              <Activity className="w-4 h-4 text-[#36D9FF]" />
              <span>HEMODYNAMIC TELEMETRY · MODULE 03</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-display font-bold text-white tracking-wide">
              {t.bodyOrbitTitle}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-sans mt-1 max-w-2xl">
              {lang === 'ar'
                ? 'متابعة التغيرات الفسيولوجية للدورة الدموية وضغط الدم والحرارة المركزية في بيئة انعدام الوزن.'
                : 'Cardiovascular hemodynamic adaptation, orthostatic blood pressure stability, and core temperature transponder tracking.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-amber-500/10 text-[#FFBF69] border border-[#FFBF69]/30 text-xs font-mono font-semibold">
              {t.simulatedTag}
            </span>
          </div>
        </div>

        {/* Sensor stream disclaimer banner */}
        <div className="mt-4 p-3 rounded-2xl bg-[#080B16] border border-[#1E2D4A] flex items-start gap-3 text-xs font-mono text-slate-300">
          <ShieldAlert className="w-4 h-4 text-[#FFBF69] shrink-0 mt-0.5" />
          <span>
            <strong>RESEARCH PROTOTYPE PROTOCOL:</strong> All values displayed are calibrated microgravity baseline vectors. Continuous optical pulse oximeter or arterial cuff hardware is currently awaiting certified telemetry binding.
          </span>
        </div>
      </div>

      {/* 4 Core Vitals Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Heart Rate */}
        <div className="glass-panel rounded-2xl p-5 hover:border-[#FF6577]/50 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono text-slate-400 uppercase">Heart Rate</span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/15 border border-rose-500/40 flex items-center justify-center text-[#FF6577]">
              <Heart className="w-4 h-4 animate-pulse" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-mono font-bold text-white tabular-nums">
              {heartRate}
            </span>
            <span className="text-xs font-mono text-slate-400">BPM</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Resting Baseline</span>
            <span className="text-[#20E0A0]">Nominal (60-80)</span>
          </div>
        </div>

        {/* Metric 2: Blood Pressure */}
        <div className="glass-panel rounded-2xl p-5 hover:border-[#36D9FF]/50 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono text-slate-400 uppercase">Blood Pressure</span>
            <div className="w-8 h-8 rounded-xl bg-[#36D9FF]/15 border border-[#36D9FF]/40 flex items-center justify-center text-[#36D9FF]">
              <Gauge className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-mono font-bold text-white tabular-nums">
              {systolic}/{diastolic}
            </span>
            <span className="text-xs font-mono text-slate-400">mmHg</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Central Venous Index</span>
            <span className="text-[#20E0A0]">Optimal</span>
          </div>
        </div>

        {/* Metric 3: Core Temperature */}
        <div className="glass-panel rounded-2xl p-5 hover:border-[#FFBF69]/50 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono text-slate-400 uppercase">Core Body Temp</span>
            <div className="w-8 h-8 rounded-xl bg-[#FFBF69]/15 border border-[#FFBF69]/40 flex items-center justify-center text-[#FFBF69]">
              <Thermometer className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-mono font-bold text-white tabular-nums">
              {coreTemp}°
            </span>
            <span className="text-xs font-mono text-slate-400">C</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Circadian Nadir</span>
            <span className="text-[#20E0A0]">Normothermic</span>
          </div>
        </div>

        {/* Metric 4: SpO2 Pulse Oximetry */}
        <div className="glass-panel rounded-2xl p-5 hover:border-[#8B7CFF]/50 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono text-slate-400 uppercase">Pulse Oximetry</span>
            <div className="w-8 h-8 rounded-xl bg-[#8B7CFF]/15 border border-[#8B7CFF]/40 flex items-center justify-center text-[#8B7CFF]">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-mono font-bold text-white tabular-nums">
              98%
            </span>
            <span className="text-xs font-mono text-slate-400">SpO₂</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Cabin O₂: 21.2%</span>
            <span className="text-[#20E0A0]">Calibrated</span>
          </div>
        </div>
      </div>

      {/* Microgravity Hemodynamics Clinical Guidance */}
      <div className="glass-panel rounded-3xl p-6">
        <h2 className="text-base font-display font-bold text-white mb-4 pb-2 border-b border-[#1E2D4A]">
          {lang === 'ar' ? 'آليات التكيف الدوراني في الفضاء (Spaceflight Cardiovascular Dynamics)' : 'Cardiovascular Dynamics in Microgravity'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans text-slate-300 leading-relaxed">
          <div className="p-4 rounded-2xl bg-[#080B16] border border-[#1E2D4A]">
            <h3 className="font-bold text-[#36D9FF] mb-1.5 flex items-center gap-1.5">
              <span>انخفاض حجم البلازما الفعال (Plasma Volume Loss)</span>
            </h3>
            <p>
              بسبب انزياح السوائل نحو الرأس، تستشعر مستقبلات الضغط الأذينية امتلاءً كاذباً، فيفرز الجسم هرمونات تدر البول، مما يؤدي لفقدان 10-15% من حجم البلازما خلال أول 48 ساعة. يتم تعويض هذا عبر بروتوكول الترطيب بالملح قبل العودة للأرض.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#080B16] border border-[#1E2D4A]">
            <h3 className="font-bold text-[#8B7CFF] mb-1.5 flex items-center gap-1.5">
              <span>عدم التحمل الانتصابي (Orthostatic Intolerance)</span>
            </h3>
            <p>
              يقل نشاط المقاومة الوعائية الطرفية لعدم الحاجة لمقاومة الجاذبية. تساعد تمارين جهاز ARED اليومية وحزام المشي T2 على الحفاظ على نغمة الأوعية الدموية العضلية لمنع الدوار وهبوط الضغط المفاجئ.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

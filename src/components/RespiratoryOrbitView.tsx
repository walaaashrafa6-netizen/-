import React, { useState, useEffect } from 'react';
import { RespiratoryRecord, Language } from '../types';
import { TRANSLATIONS } from '../utils/translations';
import { 
  Wind, 
  Activity, 
  ShieldAlert, 
  AlertCircle, 
  Check, 
  Play, 
  Square, 
  Heart, 
  Clock, 
  Layers,
  Info
} from 'lucide-react';

interface RespiratoryOrbitViewProps {
  records: RespiratoryRecord[];
  onSaveRecord: (record: RespiratoryRecord) => void;
  lang: Language;
}

export const RespiratoryOrbitView: React.FC<RespiratoryOrbitViewProps> = ({
  records,
  onSaveRecord,
  lang,
}) => {
  const t = TRANSLATIONS[lang];

  // Pacer state (Box breathing: Inhale 4s, Hold 4s, Exhale 4s, Hold 4s)
  const [pacerActive, setPacerActive] = useState<boolean>(false);
  const [pacerPhase, setPacerPhase] = useState<'inhale' | 'hold1' | 'exhale' | 'hold2'>('inhale');
  const [pacerSeconds, setPacerSeconds] = useState<number>(4);

  useEffect(() => {
    if (!pacerActive) return;

    const timer = setInterval(() => {
      setPacerSeconds((prev) => {
        if (prev <= 1) {
          setPacerPhase((phase) => {
            if (phase === 'inhale') return 'hold1';
            if (phase === 'hold1') return 'exhale';
            if (phase === 'exhale') return 'hold2';
            return 'inhale';
          });
          return 4;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [pacerActive]);

  // Form State for manual or simulated recording
  const todayStr = new Date().toISOString().split('T')[0];
  const [simRate, setSimRate] = useState<number>(16);
  const [pattern, setPattern] = useState<'regular' | 'rapid' | 'shallow' | 'irregular'>('regular');
  const [context, setContext] = useState<'rest' | 'post_exercise' | 'eva_prep' | 'workstation'>('rest');
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  const symptomList = [
    { id: 'Shortness of breath', label: 'Shortness of breath (Dyspnea)' },
    { id: 'Cephalad Sinus Congestion', label: 'Cephalad sinus stuffiness (Fluid Shift)' },
    { id: 'Airway Dryness', label: 'Airway dryness / Low humidity' },
    { id: 'Cough', label: 'Cough / Particulate irritation' },
  ];

  const handleToggleSymptom = (id: string) => {
    setSymptoms((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleLogManual = (e: React.FormEvent) => {
    e.preventDefault();
    const newRecord: RespiratoryRecord = {
      id: `resp-${Date.now()}`,
      date: todayStr,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      respiratoryRate: simRate,
      pattern,
      activityContext: context,
      symptoms,
      isSimulated: true, // Marked transparently
      source: 'user_manual_entry',
      qualityRating: 'nominal',
      timestamp: Date.now(),
    };

    onSaveRecord(newRecord);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const latest = records[records.length - 1];

  return (
    <div className="space-y-6 pb-12">
      {/* Header with Prominent Simulation Disclaimer */}
      <div className="rounded-2xl p-5 bg-[#101827] border border-[#1E2D4A] relative overflow-hidden">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#36D9FF] tracking-wider uppercase mb-1">
              <Wind className="w-4 h-4 text-[#36D9FF]" />
              <span>RESPIRATORY PHYSIOLOGY · MODULE 04 (SCIENTIFIC PRIORITIZATION)</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-display font-bold text-white tracking-wide">
              {t.respiratoryOrbitTitle}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-sans mt-1 max-w-3xl leading-relaxed">
              {t.respiratoryOrbitSubtitle}
            </p>
          </div>
          <span className="shrink-0 px-2.5 py-1 rounded bg-[#FFBF69]/10 text-[#FFBF69] border border-[#FFBF69]/30 text-xs font-mono font-semibold">
            {t.simulatedTag}
          </span>
        </div>

        {/* Prominent Banner Distinguishing Telemetry from Live Sensor */}
        <div className="mt-4 p-3 rounded-lg bg-[#080B16] border border-[#FFBF69]/30 text-xs text-slate-300 font-mono flex items-start gap-3">
          <ShieldAlert className="w-4 h-4 text-[#FFBF69] shrink-0 mt-0.5" />
          <div>
            <strong className="text-[#FFBF69]">RESEARCH PROTOTYPE DISCLOSURE:</strong> All values shown are calibrated simulated baseline vectors. No physical respiratory strap, chest impedance pneumograph, or spirometer is connected to this client session.
          </div>
        </div>
      </div>

      {/* The 4 Core Pillars of Space Respiratory Science */}
      <div className="rounded-2xl p-5 bg-[#0C1B2B] border border-[#162E48]">
        <h2 className="text-sm font-mono uppercase tracking-wider text-[#36D9FF] mb-3 flex items-center gap-2">
          <Layers className="w-4 h-4" />
          {t.fourPillarsTitle}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-[#080B16] border border-[#1E2D4A]">
            <div className="text-xs font-mono text-[#36D9FF] font-semibold">{t.pillar1Title}</div>
            <div className="text-xl font-mono font-bold text-white my-1 tabular-nums">
              {latest ? latest.respiratoryRate : 16} <span className="text-xs text-slate-400 font-normal">/min</span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans leading-snug">{t.pillar1Desc}</p>
          </div>

          <div className="p-3 rounded-xl bg-[#080B16] border border-[#1E2D4A]">
            <div className="text-xs font-mono text-[#36D9FF] font-semibold">{t.pillar2Title}</div>
            <div className="text-xl font-mono font-bold text-white my-1 capitalize">
              {latest ? latest.pattern : 'Regular'}
            </div>
            <p className="text-[11px] text-slate-400 font-sans leading-snug">{t.pillar2Desc}</p>
          </div>

          <div className="p-3 rounded-xl bg-[#080B16] border border-[#1E2D4A]">
            <div className="text-xs font-mono text-[#8B7CFF] font-semibold">{t.pillar3Title}</div>
            <div className="text-sm font-mono font-bold text-slate-200 my-1">
              {latest?.symptoms?.length ? `${latest.symptoms.length} noted` : 'None reported'}
            </div>
            <p className="text-[11px] text-slate-400 font-sans leading-snug">{t.pillar3Desc}</p>
          </div>

          <div className="p-3 rounded-xl bg-[#080B16] border border-[#1E2D4A]">
            <div className="text-xs font-mono text-[#20E0A0] font-semibold">{t.pillar4Title}</div>
            <div className="text-xl font-mono font-bold text-slate-400 my-1">
              -- % <span className="text-[10px] text-slate-500 font-sans">(Awaiting pulse oximeter)</span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans leading-snug">{t.pillar4Desc}</p>
          </div>
        </div>
      </div>

      {/* Guided Autonomic Breathing Pacer */}
      <div className="rounded-2xl p-5 bg-gradient-to-br from-[#121D33] to-[#101827] border border-[#36D9FF]/40 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-base font-display font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#36D9FF]" />
              {t.cadencePacerTitle}
            </h2>
            <p className="text-xs text-slate-300 font-sans mt-0.5">
              {t.cadencePacerDesc}
            </p>
          </div>

          <button
            onClick={() => setPacerActive(!pacerActive)}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold tracking-wider transition-all flex items-center gap-2 shrink-0 ${
              pacerActive
                ? 'bg-[#FF6577] text-white hover:bg-[#ff4e63]'
                : 'bg-[#36D9FF] text-[#080B16] hover:bg-[#62e2ff] shadow-[0_0_15px_rgba(54,217,255,0.3)]'
            }`}
          >
            {pacerActive ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{pacerActive ? t.stopPacer : t.startPacer}</span>
          </button>
        </div>

        {/* Pacer Visualizer */}
        <div className="flex flex-col items-center justify-center py-6">
          <div className="relative w-40 h-40 flex items-center justify-center">
            {/* Outer Orbital Ring */}
            <div className={`absolute inset-0 rounded-full border-2 transition-all duration-1000 ${
              pacerActive
                ? pacerPhase === 'inhale'
                  ? 'border-[#36D9FF] scale-110 shadow-[0_0_25px_rgba(54,217,255,0.4)]'
                  : pacerPhase === 'exhale'
                  ? 'border-[#8B7CFF] scale-90'
                  : 'border-[#20E0A0] scale-100'
                : 'border-[#1E2D4A]'
            }`} />

            {/* Inner Breathing Core */}
            <div className={`w-28 h-28 rounded-full flex flex-col items-center justify-center transition-all duration-1000 ${
              pacerActive
                ? pacerPhase === 'inhale'
                  ? 'bg-[#36D9FF]/20 scale-110'
                  : pacerPhase === 'exhale'
                  ? 'bg-[#8B7CFF]/20 scale-85'
                  : 'bg-[#20E0A0]/20 scale-100'
                : 'bg-[#121D33]'
            }`}>
              {pacerActive ? (
                <>
                  <span className="text-xs font-mono uppercase tracking-widest text-slate-300">
                    {pacerPhase === 'inhale' && 'Inhale'}
                    {pacerPhase === 'hold1' && 'Hold'}
                    {pacerPhase === 'exhale' && 'Exhale'}
                    {pacerPhase === 'hold2' && 'Hold'}
                  </span>
                  <span className="text-3xl font-mono font-bold text-white tabular-nums">
                    {pacerSeconds}s
                  </span>
                </>
              ) : (
                <span className="text-xs font-mono text-slate-400 text-center px-2">
                  Press Start to Begin
                </span>
              )}
            </div>
          </div>
          <span className="text-xs font-mono text-slate-400 mt-4">
            Box Breathing Protocol · 4s Cycle
          </span>
        </div>
      </div>

      {/* Manual Vitals & Symptoms Log */}
      <div className="rounded-2xl p-5 bg-[#0C1B2B] border border-[#162E48]">
        <h2 className="text-base font-display font-bold text-white mb-4 pb-2 border-b border-[#1E2D4A]">
          {t.simulateLogResp}
        </h2>

        {saveSuccess && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>Respiratory record logged to local storage.</span>
          </div>
        )}

        <form onSubmit={handleLogManual} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-300 uppercase mb-1">
                Respiratory Rate (breaths/min): <strong className="text-[#36D9FF]">{simRate}</strong>
              </label>
              <input
                type="range"
                min="10"
                max="32"
                value={simRate}
                onChange={(e) => setSimRate(Number(e.target.value))}
                className="w-full accent-[#36D9FF] bg-[#1E2D4A] h-2 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
                <span>10 (Bradypnea)</span>
                <span className="text-[#20E0A0]">12-18 (Nominal)</span>
                <span className="text-[#FFBF69]">20+ (Tachypnea)</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 uppercase mb-1">
                Pattern
              </label>
              <select
                value={pattern}
                onChange={(e) => setPattern(e.target.value as any)}
                className="w-full bg-[#080B16] border border-[#1E2D4A] focus:border-[#36D9FF] rounded-lg p-2 text-sm text-white font-mono focus:outline-none"
              >
                <option value="regular">Regular & Unlabored</option>
                <option value="rapid">Rapid / Panting</option>
                <option value="shallow">Shallow / Guarded</option>
                <option value="irregular">Irregular Rhythm</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 uppercase mb-1">
                {t.activityContextLabel}
              </label>
              <select
                value={context}
                onChange={(e) => setContext(e.target.value as any)}
                className="w-full bg-[#080B16] border border-[#1E2D4A] focus:border-[#36D9FF] rounded-lg p-2 text-sm text-white font-mono focus:outline-none"
              >
                <option value="rest">{t.contextRest}</option>
                <option value="post_exercise">{t.contextExercise}</option>
                <option value="eva_prep">{t.contextEVA}</option>
                <option value="workstation">{t.contextMaintenance}</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-300 uppercase mb-1.5">
              Associated Respiratory Symptoms
            </label>
            <div className="flex flex-wrap gap-2">
              {symptomList.map((sym) => {
                const isSelected = symptoms.includes(sym.id);
                return (
                  <button
                    type="button"
                    key={sym.id}
                    onClick={() => handleToggleSymptom(sym.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-sans transition-all border ${
                      isSelected
                        ? 'bg-[#36D9FF]/20 border-[#36D9FF] text-[#36D9FF] font-semibold'
                        : 'bg-[#080B16] border-[#1E2D4A] text-slate-400 hover:text-white'
                    }`}
                  >
                    {sym.label}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-[#36D9FF] hover:bg-[#62e2ff] text-[#080B16] font-bold text-xs font-mono uppercase tracking-wider transition-all"
          >
            Record Observation Snapshot
          </button>
        </form>
      </div>

      {/* Flight Surgeon Escalation Protocol Box */}
      <div className="rounded-xl p-4 bg-[#080B16] border border-[#FFBF69]/40 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-[#FFBF69] shrink-0 mt-0.5" />
        <div>
          <div className="text-xs font-mono font-bold text-[#FFBF69] tracking-wider uppercase">
            {t.escalationProtocolTitle}
          </div>
          <p className="text-xs text-slate-300 font-sans mt-1 leading-relaxed">
            {t.escalationDesc}
          </p>
        </div>
      </div>
    </div>
  );
};

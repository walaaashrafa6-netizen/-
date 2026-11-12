import React, { useState } from 'react';
import { WellnessRecord, Language } from '../types';
import { TRANSLATIONS } from '../utils/translations';
import { 
  HeartPulse, 
  Smile, 
  Zap, 
  ShieldAlert, 
  Check, 
  Trash2, 
  Calendar,
  Sparkles,
  Info,
  UserCheck
} from 'lucide-react';

interface MindOrbitViewProps {
  records: WellnessRecord[];
  onSaveRecord: (record: WellnessRecord) => void;
  onDeleteRecord: (id: string) => void;
  lang: Language;
}

export const MindOrbitView: React.FC<MindOrbitViewProps> = ({
  records,
  onSaveRecord,
  onDeleteRecord,
  lang,
}) => {
  const t = TRANSLATIONS[lang];
  const todayStr = new Date().toISOString().split('T')[0];

  // Form State
  const [date, setDate] = useState<string>(todayStr);
  const [mood, setMood] = useState<number>(4);
  const [stress, setStress] = useState<number>(2);
  const [energy, setEnergy] = useState<number>(4);
  const [isolation, setIsolation] = useState<boolean>(false);
  const [concentration, setConcentration] = useState<boolean>(false);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [notes, setNotes] = useState<string>('');
  const [savedAlert, setSavedAlert] = useState<boolean>(false);

  const symptomOptions = [
    { id: 'Space Adaptation', label: t.symptomSpaceAdaptation },
    { id: 'Fluid Shift', label: t.symptomFluidShift },
    { id: 'Spine Elongation', label: t.symptomBackache },
    { id: 'Orbital Headache', label: t.symptomHeadache },
  ];

  const handleToggleSymptom = (id: string) => {
    setSymptoms((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const record: WellnessRecord = {
      id: `wellness-${Date.now()}`,
      date,
      moodRating: mood,
      stressRating: stress,
      energyRating: energy,
      isolationFeeling: isolation,
      concentrationDifficulty: concentration,
      symptoms,
      notes,
      source: 'user_logged',
      timestamp: Date.now(),
    };

    onSaveRecord(record);
    setSavedAlert(true);
    setTimeout(() => setSavedAlert(false), 2500);
    setNotes('');
  };

  // Recent 7 days for trend
  const recentRecords = records.slice(-7);

  // Compute average stress and mood
  const avgMood = records.length > 0
    ? (records.reduce((a, b) => a + b.moodRating, 0) / records.length).toFixed(1)
    : '4.0';
  const avgStress = records.length > 0
    ? (records.reduce((a, b) => a + b.stressRating, 0) / records.length).toFixed(1)
    : '2.0';

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="rounded-2xl p-5 bg-[#101827] border border-[#1E2D4A] relative overflow-hidden">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#8B7CFF] tracking-wider uppercase mb-1">
              <HeartPulse className="w-4 h-4 text-[#8B7CFF]" />
              <span>PSYCHOLOGICAL READINESS · MODULE 02</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-display font-bold text-white tracking-wide">
              {t.wellnessOrbitTitle}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-sans mt-1 max-w-3xl leading-relaxed">
              {t.wellnessOrbitSubtitle}
            </p>
          </div>
        </div>

        {/* Safe non-judgmental guidance */}
        <div className="mt-4 flex items-start gap-2.5 p-3 rounded-lg bg-[#080B16] border border-[#1E2D4A] text-xs text-slate-400 font-mono">
          <Info className="w-4 h-4 text-[#8B7CFF] shrink-0 mt-0.5" />
          <span>
            <strong>CONFIDENTIALITY & ETHICS:</strong> Self-reports are logged in local storage. ASTRA does not infer your emotions through interface metrics or attempt algorithmic psychological diagnosis.
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl p-4 bg-[#0C1B2B] border border-[#162E48]">
          <span className="text-xs font-mono text-slate-400 uppercase">Average Mood Rating</span>
          <div className="text-2xl font-mono font-bold text-white tabular-nums mt-1">
            {avgMood} <span className="text-xs text-slate-400 font-normal">/ 5.0</span>
          </div>
          <span className="text-[11px] text-[#20E0A0] font-sans">Steady baseline adaptation</span>
        </div>

        <div className="rounded-xl p-4 bg-[#0C1B2B] border border-[#162E48]">
          <span className="text-xs font-mono text-slate-400 uppercase">Average Perceived Stress</span>
          <div className="text-2xl font-mono font-bold text-[#36D9FF] tabular-nums mt-1">
            {avgStress} <span className="text-xs text-slate-400 font-normal">/ 5.0</span>
          </div>
          <span className="text-[11px] text-slate-400 font-sans">Within expected mission bounds</span>
        </div>

        <div className="rounded-xl p-4 bg-[#0C1B2B] border border-[#162E48]">
          <span className="text-xs font-mono text-slate-400 uppercase">Support Protocol</span>
          <div className="text-xs font-mono text-slate-300 mt-2 leading-relaxed">
            Direct audio uplink to Crew Surgeon available on S-Band Orbit Channel 4.
          </div>
        </div>
      </div>

      {/* Check-in Form */}
      <div className="rounded-2xl p-5 bg-[#0C1B2B] border border-[#162E48] shadow-xl">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#1E2D4A]">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-[#8B7CFF]" />
            <h2 className="text-base font-display font-bold text-white">
              Daily Wellness Self-Assessment
            </h2>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {date}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {savedAlert && (
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>Assessment recorded in local storage successfully.</span>
            </div>
          )}

          {/* Date Picker */}
          <div>
            <label className="block text-xs font-mono text-slate-300 uppercase mb-1">
              Assessment Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-[#080B16] border border-[#1E2D4A] focus:border-[#8B7CFF] rounded-lg px-3 py-1.5 text-sm text-white font-mono focus:outline-none"
            />
          </div>

          {/* Stepper 1: Mood */}
          <div className="p-4 rounded-xl bg-[#080B16] border border-[#1E2D4A]">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-mono text-slate-300 uppercase flex items-center gap-2">
                <Smile className="w-4 h-4 text-[#8B7CFF]" />
                {t.moodLabel}: <strong className="text-white font-mono">{mood}/5</strong>
              </label>
              <span className="text-xs font-mono text-[#8B7CFF]">
                {mood === 1 && 'Low / Distressed'}
                {mood === 2 && 'Subdued / Somber'}
                {mood === 3 && 'Neutral / Steady'}
                {mood === 4 && 'Good / Positive'}
                {mood === 5 && 'Optimal / Elevated'}
              </span>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((val) => (
                <button
                  type="button"
                  key={val}
                  onClick={() => setMood(val)}
                  className={`py-2 rounded-lg text-xs font-mono font-bold transition-all border ${
                    mood === val
                      ? 'bg-[#8B7CFF] text-[#080B16] border-[#8B7CFF] shadow-[0_0_12px_rgba(139,124,255,0.4)]'
                      : 'bg-[#121D33] text-slate-400 border-[#1E2D4A] hover:text-white hover:border-slate-500'
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>

          {/* Stepper 2: Perceived Stress */}
          <div className="p-4 rounded-xl bg-[#080B16] border border-[#1E2D4A]">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-mono text-slate-300 uppercase flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-[#FFBF69]" />
                {t.stressLabel}: <strong className="text-white font-mono">{stress}/5</strong>
              </label>
              <span className="text-xs font-mono text-[#FFBF69]">
                {stress === 1 && 'Calm / Grounded'}
                {stress === 2 && 'Mild / Manageable'}
                {stress === 3 && 'Moderate / Demanding ops'}
                {stress === 4 && 'Elevated / Strained'}
                {stress === 5 && 'High Stress / Requires debrief'}
              </span>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((val) => (
                <button
                  type="button"
                  key={val}
                  onClick={() => setStress(val)}
                  className={`py-2 rounded-lg text-xs font-mono font-bold transition-all border ${
                    stress === val
                      ? 'bg-[#FFBF69] text-[#080B16] border-[#FFBF69] shadow-[0_0_12px_rgba(255,191,105,0.4)]'
                      : 'bg-[#121D33] text-slate-400 border-[#1E2D4A] hover:text-white hover:border-slate-500'
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>

          {/* Stepper 3: Energy */}
          <div className="p-4 rounded-xl bg-[#080B16] border border-[#1E2D4A]">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-mono text-slate-300 uppercase flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#36D9FF]" />
                {t.energyLabel}: <strong className="text-white font-mono">{energy}/5</strong>
              </label>
              <span className="text-xs font-mono text-[#36D9FF]">
                {energy === 1 && 'Exhausted'}
                {energy === 2 && 'Sluggish'}
                {energy === 3 && 'Functional'}
                {energy === 4 && 'Active & Alert'}
                {energy === 5 && 'Peak Energy'}
              </span>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((val) => (
                <button
                  type="button"
                  key={val}
                  onClick={() => setEnergy(val)}
                  className={`py-2 rounded-lg text-xs font-mono font-bold transition-all border ${
                    energy === val
                      ? 'bg-[#36D9FF] text-[#080B16] border-[#36D9FF] shadow-[0_0_12px_rgba(54,217,255,0.4)]'
                      : 'bg-[#121D33] text-slate-400 border-[#1E2D4A] hover:text-white hover:border-slate-500'
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>

          {/* Microgravity Specific Inquiries */}
          <div className="space-y-2 pt-2">
            <label className="block text-xs font-mono text-slate-300 uppercase">
              Mission Context Observations
            </label>

            <label className="flex items-center gap-3 p-3 rounded-xl bg-[#080B16] border border-[#1E2D4A] cursor-pointer hover:border-slate-600">
              <input
                type="checkbox"
                checked={isolation}
                onChange={(e) => setIsolation(e.target.checked)}
                className="w-4 h-4 accent-[#8B7CFF] rounded"
              />
              <span className="text-xs text-slate-300 font-sans">
                {t.isolationCheck}
              </span>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-xl bg-[#080B16] border border-[#1E2D4A] cursor-pointer hover:border-slate-600">
              <input
                type="checkbox"
                checked={concentration}
                onChange={(e) => setConcentration(e.target.checked)}
                className="w-4 h-4 accent-[#8B7CFF] rounded"
              />
              <span className="text-xs text-slate-300 font-sans">
                {t.concentrationCheck}
              </span>
            </label>
          </div>

          {/* Space Adaptation Symptoms */}
          <div>
            <label className="block text-xs font-mono text-slate-300 uppercase mb-1.5">
              {t.symptomsLabel}
            </label>
            <div className="flex flex-wrap gap-2">
              {symptomOptions.map((sym) => {
                const isSelected = symptoms.includes(sym.id);
                return (
                  <button
                    type="button"
                    key={sym.id}
                    onClick={() => handleToggleSymptom(sym.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-sans transition-all border ${
                      isSelected
                        ? 'bg-[#8B7CFF]/20 border-[#8B7CFF] text-[#8B7CFF] font-semibold'
                        : 'bg-[#080B16] border-[#1E2D4A] text-slate-400 hover:text-white hover:border-slate-600'
                    }`}
                  >
                    {sym.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-mono text-slate-300 uppercase mb-1">
              Reflections & Context
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Private crew reflections, social dynamics, adaptation milestones..."
              className="w-full bg-[#080B16] border border-[#1E2D4A] focus:border-[#8B7CFF] rounded-lg p-3 text-sm text-white font-sans placeholder-slate-600 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-[#8B7CFF] hover:bg-[#a195ff] text-[#080B16] font-bold text-sm tracking-wide transition-all shadow-[0_0_20px_rgba(139,124,255,0.25)] flex items-center justify-center gap-2 cursor-pointer"
          >
            <HeartPulse className="w-4 h-4" />
            <span>{t.saveWellnessRecord}</span>
          </button>
        </form>
      </div>

      {/* Wellness Trends & History */}
      <div className="rounded-2xl p-5 bg-[#0C1B2B] border border-[#162E48]">
        <h2 className="text-base font-display font-bold text-white tracking-wide mb-4 pb-2 border-b border-[#1E2D4A]">
          {t.wellnessHistory} ({records.length} logs)
        </h2>

        <div className="space-y-3">
          {[...records].reverse().map((rec) => (
            <div
              key={rec.id}
              className="p-3.5 rounded-xl bg-[#080B16] border border-[#1E2D4A] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold font-mono text-white">
                    {rec.date}
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    Mood: <strong className="text-[#8B7CFF]">{rec.moodRating}/5</strong> · Stress: <strong className="text-[#FFBF69]">{rec.stressRating}/5</strong> · Energy: <strong className="text-[#36D9FF]">{rec.energyRating}/5</strong>
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                  {rec.isolationFeeling && (
                    <span className="text-[10px] font-sans px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20">
                      Isolation noted
                    </span>
                  )}
                  {rec.concentrationDifficulty && (
                    <span className="text-[10px] font-sans px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                      Concentration strain
                    </span>
                  )}
                  {rec.symptoms?.map((s, i) => (
                    <span key={i} className="text-[10px] font-sans px-2 py-0.5 rounded bg-[#121D33] text-slate-300">
                      {s}
                    </span>
                  ))}
                </div>

                {rec.notes && (
                  <p className="text-xs text-slate-400 font-sans mt-1.5 italic">
                    "{rec.notes}"
                  </p>
                )}
              </div>

              <button
                onClick={() => onDeleteRecord(rec.id)}
                className="p-2 rounded-lg bg-[#121D33] border border-[#1E2D4A] hover:border-[#FF6577] text-slate-400 hover:text-[#FF6577] self-end sm:self-center transition-colors"
                title={t.delete}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

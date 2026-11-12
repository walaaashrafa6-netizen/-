import React, { useState } from 'react';
import { SleepRecord, Language } from '../types';
import { TRANSLATIONS } from '../utils/translations';
import { calculateSleepMinutes, formatDuration } from '../utils/storage';
import { 
  Moon, 
  Clock, 
  Target, 
  Plus, 
  Trash2, 
  Edit3, 
  AlertTriangle, 
  Check, 
  Info,
  Calendar,
  Sparkles
} from 'lucide-react';

interface SleepOrbitViewProps {
  records: SleepRecord[];
  onSaveRecord: (record: SleepRecord) => void;
  onDeleteRecord: (id: string) => void;
  lang: Language;
}

export const SleepOrbitView: React.FC<SleepOrbitViewProps> = ({
  records,
  onSaveRecord,
  onDeleteRecord,
  lang,
}) => {
  const t = TRANSLATIONS[lang];

  // Today's date default
  const todayStr = new Date().toISOString().split('T')[0];

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [date, setDate] = useState<string>(todayStr);
  const [bedtime, setBedtime] = useState<string>('23:00');
  const [wakeTime, setWakeTime] = useState<string>('07:00');
  const [goalMinutes, setGoalMinutes] = useState<number>(480);
  const [qualityRating, setQualityRating] = useState<number>(4);
  const [disturbances, setDisturbances] = useState<string[]>([]);
  const [notes, setNotes] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Auto calculate duration in realtime
  const currentDuration = calculateSleepMinutes(bedtime, wakeTime);
  const isOvernight = bedtime > wakeTime;

  // Available spaceflight disturbance options
  const disturbanceOptions = [
    { id: 'Zero-G Floating', label: t.distFloat },
    { id: 'Cabin Noise', label: t.distNoise },
    { id: 'Circadian Light Shift', label: t.distLight },
    { id: 'Elevated CO2', label: t.distCO2 },
    { id: 'Mission Timeline Shift', label: t.distSchedule },
  ];

  const handleToggleDisturbance = (id: string) => {
    setDisturbances((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };

  const handleEditClick = (rec: SleepRecord) => {
    setEditingId(rec.id);
    setDate(rec.date);
    setBedtime(rec.bedtime);
    setWakeTime(rec.wakeTime);
    setGoalMinutes(rec.goalMinutes || 480);
    setQualityRating(rec.qualityRating || 4);
    setDisturbances(rec.disturbances || []);
    setNotes(rec.notes || '');
    setErrorMsg(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setDate(todayStr);
    setBedtime('23:00');
    setWakeTime('07:00');
    setDisturbances([]);
    setNotes('');
    setErrorMsg(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!date) {
      setErrorMsg('Please specify a valid date.');
      return;
    }
    if (!bedtime || !wakeTime) {
      setErrorMsg('Bedtime and Wake-up time are required.');
      return;
    }
    if (currentDuration <= 0) {
      setErrorMsg('Sleep duration must be greater than 0 minutes.');
      return;
    }

    const record: SleepRecord = {
      id: editingId || `sleep-${Date.now()}`,
      date,
      bedtime,
      wakeTime,
      durationMinutes: currentDuration,
      goalMinutes,
      qualityRating,
      disturbances,
      notes,
      source: 'user_logged',
      timestamp: Date.now(),
    };

    onSaveRecord(record);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);

    // Reset editing
    setEditingId(null);
    setNotes('');
    setDisturbances([]);
  };

  // Stats calculation
  const totalLogged = records.length;
  const avgMinutes = totalLogged > 0
    ? Math.round(records.reduce((a, b) => a + b.durationMinutes, 0) / totalLogged)
    : 0;
  const compliantNights = records.filter((r) => r.durationMinutes >= (r.goalMinutes || 480)).length;

  return (
    <div className="space-y-6 pb-12">
      {/* Module Header */}
      <div className="rounded-2xl p-5 bg-[#0C1B2B] border border-[#162E48] relative overflow-hidden">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#42C8F5] tracking-wider uppercase mb-1">
              <Moon className="w-4 h-4 text-[#42C8F5]" />
              <span>ORBITAL SLEEP TRACKING · MODULE 01</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-display font-bold text-white tracking-wide">
              {t.sleepOrbitTitle}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-sans mt-1 max-w-3xl leading-relaxed">
              {t.sleepOrbitSubtitle}
            </p>
          </div>
        </div>

        {/* Scientific distinction note */}
        <div className="mt-4 flex items-start gap-2.5 p-3 rounded-lg bg-[#080B16] border border-[#1E2D4A] text-xs text-slate-400 font-mono">
          <Info className="w-4 h-4 text-[#42C8F5] shrink-0 mt-0.5" />
          <span>
            <strong>SCIENTIFIC SPECIFICATION:</strong> This module logs self-reported time-in-quarters rest. It does not measure sleep architecture (REM / Slow-wave) without approved polysomnography polysomnograph sensors.
          </span>
        </div>
      </div>

      {/* KPI 3-Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl p-4 bg-[#0C1B2B] border border-[#162E48]">
          <span className="text-xs font-mono text-slate-400 uppercase">Average Recorded Sleep</span>
          <div className="text-2xl font-mono font-bold text-white tabular-nums mt-1">
            {formatDuration(avgMinutes)}
          </div>
          <span className="text-[11px] text-slate-400 font-sans">Across {totalLogged} logged nights</span>
        </div>

        <div className="rounded-xl p-4 bg-[#0C1B2B] border border-[#162E48]">
          <span className="text-xs font-mono text-slate-400 uppercase">Target Compliance</span>
          <div className="text-2xl font-mono font-bold text-[#20E0A0] tabular-nums mt-1">
            {totalLogged > 0 ? `${Math.round((compliantNights / totalLogged) * 100)}%` : '0%'}
          </div>
          <span className="text-[11px] text-slate-400 font-sans">{compliantNights} of {totalLogged} met ≥ 8.0h target</span>
        </div>

        <div className="rounded-xl p-4 bg-[#0C1B2B] border border-[#162E48]">
          <span className="text-xs font-mono text-slate-400 uppercase">Mission Guideline</span>
          <div className="text-2xl font-mono font-bold text-[#42C8F5] tabular-nums mt-1">
            8h 00m
          </div>
          <span className="text-[11px] text-slate-400 font-sans">ISS Standard circadian envelope</span>
        </div>
      </div>

      {/* Sleep Log Form & Live Calculator */}
      <div className="rounded-2xl p-5 bg-[#0C1B2B] border border-[#162E48] shadow-xl">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#1E2D4A]">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#42C8F5]" />
            <h2 className="text-base font-display font-bold text-white">
              {editingId ? t.updateSleepRecord : t.logSleepHeader}
            </h2>
          </div>
          {editingId && (
            <button
              onClick={handleCancelEdit}
              className="text-xs font-mono text-slate-400 hover:text-white px-2.5 py-1 rounded bg-[#121D33] border border-[#1E2D4A]"
            >
              {t.cancelEdit}
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {saveSuccess && (
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>Sleep record successfully recorded and synchronized to local storage.</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Date */}
            <div>
              <label className="block text-xs font-mono text-slate-300 uppercase mb-1">
                {t.date}
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-[#080B16] border border-[#1E2D4A] focus:border-[#42C8F5] rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none"
                required
              />
            </div>

            {/* Bedtime */}
            <div>
              <label className="block text-xs font-mono text-slate-300 uppercase mb-1">
                {t.bedtimeLabel}
              </label>
              <input
                type="time"
                value={bedtime}
                onChange={(e) => setBedtime(e.target.value)}
                className="w-full bg-[#080B16] border border-[#1E2D4A] focus:border-[#42C8F5] rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none"
                required
              />
            </div>

            {/* Wake-up Time */}
            <div>
              <label className="block text-xs font-mono text-slate-300 uppercase mb-1">
                {t.wakeTimeLabel}
              </label>
              <input
                type="time"
                value={wakeTime}
                onChange={(e) => setWakeTime(e.target.value)}
                className="w-full bg-[#080B16] border border-[#1E2D4A] focus:border-[#42C8F5] rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Automatic Duration Live Calculation Banner */}
          <div className="p-4 rounded-xl bg-[#080B16] border border-[#42C8F5]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-mono text-slate-400 uppercase block">
                {t.calculatedDuration}
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl sm:text-3xl font-mono font-bold text-white tabular-nums">
                  {formatDuration(currentDuration)}
                </span>
                <span className={`text-xs font-mono font-semibold ${
                  currentDuration >= goalMinutes ? 'text-[#20E0A0]' : 'text-[#FFBF69]'
                }`}>
                  {currentDuration >= goalMinutes ? `+${formatDuration(currentDuration - goalMinutes)} above target` : `-${formatDuration(goalMinutes - currentDuration)} deficit`}
                </span>
              </div>
            </div>

            <div className="text-right">
              {isOvernight && (
                <span className="inline-block text-[11px] font-mono text-[#42C8F5] px-2 py-1 rounded bg-[#42C8F5]/10 border border-[#42C8F5]/20">
                  {t.crossMidnightNotice}
                </span>
              )}
            </div>
          </div>

          {/* Goal Selector */}
          <div>
            <label className="block text-xs font-mono text-slate-300 uppercase mb-1">
              {t.goalLabel}: <strong className="text-[#42C8F5]">{formatDuration(goalMinutes)}</strong>
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="360"
                max="600"
                step="15"
                value={goalMinutes}
                onChange={(e) => setGoalMinutes(Number(e.target.value))}
                className="flex-1 accent-[#42C8F5] bg-[#1E2D4A] h-2 rounded-lg cursor-pointer"
              />
              <span className="text-xs font-mono text-slate-400 w-16 text-right tabular-nums">
                {goalMinutes / 60} hrs
              </span>
            </div>
          </div>

          {/* Disturbances Selector */}
          <div>
            <label className="block text-xs font-mono text-slate-300 uppercase mb-1.5">
              {t.disturbancesLabel}
            </label>
            <div className="flex flex-wrap gap-2">
              {disturbanceOptions.map((opt) => {
                const selected = disturbances.includes(opt.id);
                return (
                  <button
                    type="button"
                    key={opt.id}
                    onClick={() => handleToggleDisturbance(opt.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-sans transition-all border ${
                      selected
                        ? 'bg-[#42C8F5]/15 border-[#42C8F5] text-[#42C8F5] font-semibold'
                        : 'bg-[#080B16] border-[#1E2D4A] text-slate-400 hover:text-white hover:border-slate-600'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-mono text-slate-300 uppercase mb-1">
              {t.notesLabel}
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Ventilation duct acoustic vibration, sleep visor adjustment..."
              className="w-full bg-[#080B16] border border-[#1E2D4A] focus:border-[#42C8F5] rounded-lg p-3 text-sm text-white font-sans placeholder-slate-600 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-[#42C8F5] hover:bg-[#62e2ff] text-[#080B16] font-bold text-sm tracking-wide transition-all shadow-[0_0_20px_rgba(54,217,255,0.25)] flex items-center justify-center gap-2 cursor-pointer"
          >
            <Moon className="w-4 h-4" />
            <span>{editingId ? t.updateSleepRecord : t.saveSleepRecord}</span>
          </button>
        </form>
      </div>

      {/* History List */}
      <div className="rounded-2xl p-5 bg-[#0C1B2B] border border-[#162E48]">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#1E2D4A]">
          <h2 className="text-base font-display font-bold text-white tracking-wide">
            {t.sleepHistory} ({records.length})
          </h2>
          <span className="text-xs font-mono text-slate-400">
            Source: Local Device Prototype
          </span>
        </div>

        {records.length === 0 ? (
          <div className="py-8 text-center text-sm text-slate-500">
            {t.noSleepRecords}
          </div>
        ) : (
          <div className="space-y-3">
            {[...records].reverse().map((rec) => {
              const isTargetMet = rec.durationMinutes >= (rec.goalMinutes || 480);
              return (
                <div
                  key={rec.id}
                  className="rounded-xl p-3.5 bg-[#080B16] border border-[#1E2D4A] hover:border-slate-600 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#121D33] border border-[#1E2D4A] flex items-center justify-center shrink-0">
                      <Moon className={`w-5 h-5 ${isTargetMet ? 'text-[#42C8F5]' : 'text-[#FFBF69]'}`} />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white font-mono">
                          {rec.date}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          ({rec.bedtime} → {rec.wakeTime})
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className="text-xs font-mono font-semibold text-white">
                          {formatDuration(rec.durationMinutes)}
                        </span>
                        <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${
                          isTargetMet
                            ? 'bg-[#20E0A0]/10 text-[#20E0A0] border-[#20E0A0]/30'
                            : 'bg-[#FFBF69]/10 text-[#FFBF69] border-[#FFBF69]/30'
                        }`}>
                          {isTargetMet ? 'Target Met' : 'Deficit'}
                        </span>
                        {rec.disturbances?.map((dist, i) => (
                          <span key={i} className="text-[10px] font-sans text-slate-400 bg-[#121D33] px-1.5 py-0.2 rounded">
                            {dist}
                          </span>
                        ))}
                      </div>

                      {rec.notes && (
                        <p className="text-xs text-slate-400 font-sans mt-1 italic">
                          "{rec.notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      onClick={() => handleEditClick(rec)}
                      className="p-2 rounded-lg bg-[#121D33] border border-[#1E2D4A] hover:border-[#42C8F5] text-slate-400 hover:text-[#42C8F5] transition-colors"
                      title={t.edit}
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteRecord(rec.id)}
                      className="p-2 rounded-lg bg-[#121D33] border border-[#1E2D4A] hover:border-[#FF6577] text-slate-400 hover:text-[#FF6577] transition-colors"
                      title={t.delete}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

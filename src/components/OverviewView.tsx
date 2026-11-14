import React from 'react';
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
import { Activity, AlertTriangle, ArrowUpRight, Heart, Moon, Radio, Sparkles, Wind } from 'lucide-react';

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
  tasks,
  onToggleTask,
  onNavigate,
  onAskAi,
  onLoadDemoData,
  lang,
}) => {
  const ar = lang === 'ar';
  const newestSleep = [...sleepRecords].sort((a, b) => b.timestamp - a.timestamp)[0];
  const newestWellness = [...wellnessRecords].sort((a, b) => b.timestamp - a.timestamp)[0];
  const newestResp = [...respiratoryRecords].sort((a, b) => b.timestamp - a.timestamp)[0];
  const newestBody = [...bodyMetrics].sort((a, b) => b.timestamp - a.timestamp)[0];
  const openTasks = tasks.filter((task) => !task.completed).slice(0, 3);
  const hasTelemetry = sleepRecords.length + wellnessRecords.length + respiratoryRecords.length + bodyMetrics.length > 0;
  const [prompt, setPrompt] = React.useState('');
  const sourceLabel = (source?: string) => {
    if (!source) return ar ? 'غير مسجل' : 'NOT LOGGED';
    const labels: Record<string, string> = {
      simulated: ar ? 'محاكاة' : 'SIMULATED',
      simulated_telemetry: ar ? 'محاكاة' : 'SIMULATED',
      imported: ar ? 'مستورد' : 'IMPORTED',
      user_logged: ar ? 'إدخال المستخدم' : 'USER-LOGGED',
      measured: ar ? 'مقاس' : 'MEASURED',
      estimated: ar ? 'تقديري' : 'ESTIMATED',
    };
    return labels[source] || source.toUpperCase();
  };

  const submitPrompt = (event: React.FormEvent) => {
    event.preventDefault();
    if (!prompt.trim()) return;
    onAskAi?.(prompt.trim());
    setPrompt('');
  };

  return (
    <div className="mission-overview">
      <header className="mission-heading">
        <div>
          <div className="mission-kicker"><span className="status-dot" />{ar ? 'لوحة المهمة' : 'MISSION CONSOLE'} · {profile.missionName}</div>
          <h1>{ar ? `مرحباً ${profile.callsign}` : `Welcome, ${profile.callsign}`}</h1>
          <p>{ar ? `يوم المهمة ${profile.missionDay}` : `FLIGHT DAY ${profile.missionDay}`}</p>
        </div>
        <button type="button" className="mission-emergency" onClick={() => onNavigate('emergency')}>
          <AlertTriangle aria-hidden="true" />{ar ? 'الطوارئ' : 'EMERGENCY'}
        </button>
      </header>

      <section className="mission-status-strip" aria-label={ar ? 'حالة الأنظمة' : 'System status'}>
        <span className="status-dot" />
        <strong>{hasTelemetry ? (ar ? 'السجلات المحلية متاحة' : 'LOCAL LOGS AVAILABLE') : (ar ? 'بانتظار أول سجل' : 'AWAITING FIRST LOG')}</strong>
        <span>{ar ? `${sleepRecords.length + wellnessRecords.length + respiratoryRecords.length + bodyMetrics.length} سجلات` : `${sleepRecords.length + wellnessRecords.length + respiratoryRecords.length + bodyMetrics.length} records`}</span>
        <span className="status-provenance">{ar ? 'لا يوجد اتصال مباشر بناسا' : 'NO LIVE NASA LINK'}</span>
      </section>

      <section className="mission-metric-grid" aria-label={ar ? 'مؤشرات مختصرة' : 'Mission indicators'}>
        <button type="button" className="mission-metric" onClick={() => onNavigate('sleep')}>
          <span className="mission-metric-label"><Moon />{ar ? 'النوم' : 'SLEEP'}</span>
          <strong>{newestSleep ? formatDuration(newestSleep.durationMinutes) : '—'}</strong>
          <small>{sourceLabel(newestSleep?.source)}</small>
        </button>
        <button type="button" className="mission-metric" onClick={() => onNavigate('wellness')}>
          <span className="mission-metric-label"><Heart />{ar ? 'العافية' : 'WELLNESS'}</span>
          <strong>{newestWellness ? `${newestWellness.moodRating}/5` : '—'}</strong>
          <small>{newestWellness ? `${ar ? 'توتر' : 'Stress'} ${newestWellness.stressRating}/5 · ${sourceLabel(newestWellness.source)}` : sourceLabel()}</small>
        </button>
        <button type="button" className="mission-metric" onClick={() => onNavigate('breathing')}>
          <span className="mission-metric-label"><Wind />{ar ? 'التنفس' : 'RESPIRATORY'}</span>
          <strong>{newestResp ? `${newestResp.respiratoryRate}<small>/min</small>` : '—'}</strong>
          <small>{sourceLabel(newestResp?.source)}</small>
        </button>
        <button type="button" className="mission-metric" onClick={() => onNavigate('health_core')}>
          <span className="mission-metric-label"><Activity />{ar ? 'النبض' : 'HEART RATE'}</span>
          <strong>{newestBody?.heartRateBpm != null ? `${newestBody.heartRateBpm}<small> bpm</small>` : '—'}</strong>
          <small>{sourceLabel(newestBody?.source)}</small>
        </button>
      </section>

      {!hasTelemetry && (
        <section className="mission-empty-state">
          <div><strong>{ar ? 'لا توجد قياسات مسجلة' : 'No health measurements logged'}</strong><span>{ar ? 'تظهر البيانات هنا بعد تسجيلها.' : 'Your data appears here after it is recorded.'}</span></div>
          <button type="button" className="mission-action" onClick={() => onNavigate('health_core')}>{ar ? 'فتح مركز الصحة' : 'Open Health Core'}<ArrowUpRight /></button>
          {onLoadDemoData && <button type="button" className="mission-secondary" onClick={onLoadDemoData}>{ar ? 'تحميل بيانات محاكاة' : 'Load simulated sample'}</button>}
        </section>
      )}

      <div className="mission-lower-grid">
        <section className="mission-panel">
          <div className="mission-panel-heading"><div><span className="mission-kicker">{ar ? 'جدول اليوم' : 'TODAY'}</span><h2>{ar ? 'المهام القادمة' : 'Upcoming tasks'}</h2></div><span className="mission-count">{openTasks.length}</span></div>
          {openTasks.length ? <ul className="mission-task-list">{openTasks.map((task) => <li key={task.id}><label><input type="checkbox" checked={task.completed} onChange={() => onToggleTask(task.id)} /><span>{ar ? task.titleAr : task.title}</span></label><time>{task.time}</time></li>)}</ul> : <p className="mission-muted">{ar ? 'لا توجد مهام مفتوحة.' : 'No open tasks.'}</p>}
        </section>
        <section className="mission-panel mission-ai-panel">
          <div className="mission-panel-heading"><div><span className="mission-kicker">{ar ? 'مساعد المهمة' : 'MISSION ASSISTANT'}</span><h2><Sparkles /> ASTRA AI</h2></div><span className="mission-ai-mode">{ar ? 'حسب التوفر' : 'BY AVAILABILITY'}</span></div>
          <form className="mission-ai-form" onSubmit={submitPrompt}>
            <input value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder={ar ? 'اكتب سؤالاً...' : 'Ask a mission question...'} aria-label={ar ? 'سؤال للمساعد' : 'Question for ASTRA'} />
            <button type="submit" disabled={!prompt.trim()} aria-label={ar ? 'إرسال السؤال' : 'Send question'}><ArrowUpRight /></button>
          </form>
          <button className="mission-text-link" type="button" onClick={() => onNavigate('intelligence')}>{ar ? 'فتح مساحة المحادثة' : 'Open AI workspace'}<ArrowUpRight /></button>
        </section>
      </div>

      <section className="mission-shortcuts" aria-label={ar ? 'أنظمة المهمة' : 'Mission systems'}>
        <button type="button" onClick={() => onNavigate('predict')}><Radio />ASTRA PREDICT<span>{ar ? 'محاكاة الجدولة' : 'Scheduling simulation'}</span></button>
        <button type="button" onClick={() => onNavigate('foresight')}><Activity />{ar ? 'استشراف المهمة' : 'Mission foresight'}<span>{ar ? 'توقعات محلية' : 'Local projections'}</span></button>
      </section>
    </div>
  );
};

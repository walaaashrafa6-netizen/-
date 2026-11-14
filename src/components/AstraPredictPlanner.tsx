import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Language, MessageCategory, MessagePriority, MissionLinkMessage, OrbitalDelayScenario } from '../types';
import { ORBITAL_DELAY_SCENARIOS } from '../data/nasaOpenDatasets';
import { ArrowDown, ArrowUp, Check, Clock3, Globe2, LoaderCircle, Mail, MessageCircle, Radio, Rocket, Satellite, Send, ShieldAlert, Sparkles, Users, WandSparkles } from 'lucide-react';

interface AstraPredictPlannerProps { lang: Language; }
interface PlannedTransmission {
  id: string;
  recipient: string;
  content: string;
  category: MessageCategory;
  priority: MessagePriority;
  scenarioId: string;
  desiredReplyAt: number;
  responseMinutes: number;
  scheduledSendAt: number;
  createdAt: number;
  status: 'scheduled' | 'sending' | 'sent' | 'failed';
  error?: string;
  serverMessage?: MissionLinkMessage;
}

const STORAGE_KEY = 'astra_predict_plans_v1';
const MINUTE = 60_000;

function localDateTimeValue(timestamp: number): string {
  const date = new Date(timestamp);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * MINUTE);
  return local.toISOString().slice(0, 16);
}
function formatDate(timestamp: number, lang: Language): string {
  return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-EG' : 'en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(timestamp);
}
function durationLabel(minutes: number, lang: Language): string {
  const safe = Math.max(0, Math.ceil(minutes));
  const hours = Math.floor(safe / 60);
  const mins = safe % 60;
  if (lang === 'ar') return hours ? `${hours} س ${mins} د` : `${mins} دقيقة`;
  return hours ? `${hours}h ${mins}m` : `${mins} min`;
}
function loadPlans(): PlannedTransmission[] {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(stored) ? stored : [];
  } catch { return []; }
}

export const AstraPredictPlanner: React.FC<AstraPredictPlannerProps> = ({ lang }) => {
  const isAr = lang === 'ar';
  const [recipient, setRecipient] = useState('');
  const [category, setCategory] = useState<MessageCategory>('PERSONAL');
  const [priority, setPriority] = useState<MessagePriority>('ROUTINE');
  const [message, setMessage] = useState('');
  const [scenarioId, setScenarioId] = useState('mars-farthest');
  const [responseMinutes, setResponseMinutes] = useState(30);
  const [desiredReplyInput, setDesiredReplyInput] = useState(() => localDateTimeValue(Date.now() + 2 * 60 * MINUTE));
  const [plans, setPlans] = useState<PlannedTransmission[]>(loadPlans);
  const [notice, setNotice] = useState('');
  const sendingIds = useRef(new Set<string>());
  const activeScenario = ORBITAL_DELAY_SCENARIOS.find((scenario) => scenario.id === scenarioId) || ORBITAL_DELAY_SCENARIOS[3];
  const desiredReplyAt = new Date(desiredReplyInput).getTime();
  const propagationMinutes = activeScenario.oneWayLightTimeMinutes;
  const roundTripMinutes = propagationMinutes * 2;
  const transferMinutes = Math.max(0.1, (message.trim().length * 8) / (activeScenario.nominalUplinkRateKbps * 1000 * 60));
  const totalLeadMinutes = roundTripMinutes + responseMinutes + transferMinutes;
  const estimatedSendAt = desiredReplyAt - totalLeadMinutes * MINUTE;
  const sendNow = priority === 'CRITICAL' || estimatedSendAt <= Date.now();
  const plannedSendAt = sendNow ? Date.now() : estimatedSendAt;
  const arrivalAt = plannedSendAt + totalLeadMinutes * MINUTE;
  const isValidDate = Number.isFinite(desiredReplyAt);

  const persistPlans = useCallback((next: PlannedTransmission[]) => {
    setPlans(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); }
    catch { setNotice(isAr ? 'تعذّر حفظ الجدول محلياً؛ تحققي من مساحة التخزين.' : 'Could not save the schedule locally; check browser storage.'); }
  }, [isAr]);

  const sendPlan = useCallback(async (plan: PlannedTransmission) => {
    if (sendingIds.current.has(plan.id)) return;
    sendingIds.current.add(plan.id);
    setPlans((current) => {
      const next = current.map((item) => item.id === plan.id ? { ...item, status: 'sending' as const } : item);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* Keep sending. */ }
      return next;
    });
    try {
      const scenario = ORBITAL_DELAY_SCENARIOS.find((item) => item.id === plan.scenarioId) || ORBITAL_DELAY_SCENARIOS[3];
      const response = await fetch('/api/mission-link/messages', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderRole: 'astronaut', senderName: isAr ? 'رائد الفضاء · ASTRA' : 'Astronaut · ASTRA',
          recipientRole: 'ground_control', recipientName: plan.recipient,
          content: plan.content, contentAr: plan.content,
          priority: plan.priority, category: plan.category,
          oneWayDelaySeconds: scenario.oneWayLightTimeSeconds,
        }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.message) throw new Error(data?.error || `HTTP ${response.status}`);
      setPlans((current) => {
        const next = current.map((item) => item.id === plan.id ? { ...item, status: 'sent' as const, serverMessage: data.message } : item);
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* Keep visible in session. */ }
        return next;
      });
      setNotice(isAr ? `تم إرسال الرسالة إلى ${plan.recipient}. زمن وصول الإشارة للجهة نحو ${durationLabel(scenario.oneWayLightTimeMinutes, lang)}.` : `Message sent to ${plan.recipient}. Estimated signal travel to recipient: ${durationLabel(scenario.oneWayLightTimeMinutes, lang)}.`);
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      setPlans((current) => {
        const next = current.map((item) => item.id === plan.id ? { ...item, status: 'failed' as const, error: detail } : item);
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* Keep visible in session. */ }
        return next;
      });
      setNotice(isAr ? `لم تُرسل الرسالة؛ بقيت في قائمة الانتظار. السبب: ${detail}` : `Message was not sent and remains in the queue. Reason: ${detail}`);
    } finally { sendingIds.current.delete(plan.id); }
  }, [isAr, lang]);

  useEffect(() => {
    const checkDuePlans = () => {
      const due = loadPlans().filter((plan) => plan.status === 'scheduled' && plan.scheduledSendAt <= Date.now());
      due.forEach((plan) => void sendPlan(plan));
    };
    checkDuePlans();
    const interval = window.setInterval(checkDuePlans, 5_000);
    return () => window.clearInterval(interval);
  }, [sendPlan]);

  const handleSchedule = (event: React.FormEvent) => {
    event.preventDefault();
    if (!recipient.trim() || !message.trim() || !isValidDate) return;
    const timestamp = Date.now();
    const plan: PlannedTransmission = {
      id: `ASTRA-${timestamp}-${Math.random().toString(36).slice(2, 7)}`,
      recipient: recipient.trim(), content: message.trim(), category, priority, scenarioId,
      desiredReplyAt, responseMinutes, scheduledSendAt: plannedSendAt, createdAt: timestamp, status: 'scheduled',
    };
    persistPlans([plan, ...plans]);
    setMessage('');
    setNotice(sendNow
      ? (isAr ? 'الرسالة مجدولة للإرسال فوراً لأن الموعد المطلوب قريب أو لأن الأولوية عاجلة.' : 'This message is queued for immediate transmission because the requested reply time is too soon or it is marked urgent.')
      : (isAr ? `تمت الجدولة. سيُرسلها أسترا تلقائياً في ${formatDate(plan.scheduledSendAt, lang)} ما دامت الغرفة مفتوحة.` : `Scheduled. Astra will transmit at ${formatDate(plan.scheduledSendAt, lang)} while this room remains open.`));
  };

  const sendImmediately = (plan: PlannedTransmission) => void sendPlan({ ...plan, scheduledSendAt: Date.now() });
  const removePlan = (id: string) => persistPlans(plans.filter((plan) => plan.id !== id));
  const example = useMemo(() => isAr
    ? 'مثال: سأُنهي المذاكرة الساعة ٨:٠٠ مساءً وأريد أن تصلني وجبة بعد انتهائي مباشرة. مدة التوصيل ٣٠ دقيقة؛ احسب وقت الطلب المناسب.'
    : 'Example: I finish studying at 8:00 PM and want dinner right after. Delivery takes 30 minutes—calculate when to order.', [isAr]);

  const priorityLabels: Record<MessagePriority, string> = isAr
    ? { CRITICAL: 'عاجل جداً', HIGH: 'مهم', ROUTINE: 'عادي' }
    : { CRITICAL: 'Urgent', HIGH: 'Important', ROUTINE: 'Routine' };
  const categoryLabels: Record<MessageCategory, string> = isAr
    ? { MEDICAL: 'طبي', TRAJECTORY: 'ملاحة ومسار', MAINTENANCE: 'صيانة', PERSONAL: 'العائلة / شخصي', SCIENCE: 'علمي' }
    : { MEDICAL: 'Medical', TRAJECTORY: 'Navigation', MAINTENANCE: 'Maintenance', PERSONAL: 'Family / personal', SCIENCE: 'Science' };

  return (
    <div className="relative mx-auto max-w-7xl space-y-6 pb-10 text-white">
      <section className="relative overflow-hidden rounded-[30px] border border-cyan-100/10 bg-[#07101f] p-6 shadow-2xl sm:p-9">
        <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-32 h-80 w-80 rounded-full border border-cyan-200/10 sm:h-[30rem] sm:w-[30rem]"><div className="absolute inset-[15%] rounded-full border border-violet-200/10"/><div className="absolute inset-[27%] rounded-full bg-[radial-gradient(circle_at_35%_30%,#57b8d2,#234a80_48%,#10162d_78%)] shadow-[0_0_80px_rgba(54,172,226,.18)]"/></div>
        <div className="relative z-10 max-w-3xl">
          <div className="mb-4 flex flex-wrap items-center gap-2"><span className="inline-flex items-center gap-2 rounded-full border border-cyan-200/20 bg-cyan-200/[0.08] px-3 py-1.5 text-[10px] font-bold tracking-[.18em] text-cyan-100"><Satellite className="h-3.5 w-3.5"/>ASTRA PREDICT</span><span className="rounded-full border border-emerald-200/15 bg-emerald-200/[0.06] px-3 py-1.5 text-[10px] text-emerald-100/80">{isAr ? 'تخطيط زمني شفاف' : 'Transparent time planning'}</span></div>
          <h1 className="font-display text-3xl font-bold leading-tight sm:text-5xl">{isAr ? 'رسالتك تصل في الوقت المناسب' : 'Your message, timed just right'}</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300/80 sm:text-base">{isAr ? 'اكتب لمن تريد، وحدد متى تحتاج وصول الرد. يحسب أسترا وقت الإرسال الأنسب من زمن الإشارة ذهاباً وإياباً والوقت الذي تتوقع أن يحتاجه المستلم للرد.' : 'Choose who to contact and when you need their reply. Astra calculates a suggested send time from signal travel time and the time you expect the recipient to need to respond.'}</p>
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-200/15 bg-amber-200/[0.05] p-3.5 text-xs leading-6 text-amber-100/80"><ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-200"/><span>{isAr ? 'تنبيه: هذه الغرفة تحاكي جدولة الرسائل داخل المشروع فقط، وليست متصلة فعلياً بناسا أو بشبكة اتصالات فضائية. توقيت رد الجهة تقديري ولا يضمن أن ترد.' : 'Note: this room schedules messages within this app simulation only; it is not connected to NASA or a real spacecraft network. Recipient response time is an estimate, not a guarantee.'}</span></div>
        </div>
      </section>

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(360px,.95fr)]">
        <section className="rounded-[26px] border border-white/[0.08] bg-[#0b1322]/95 p-5 shadow-xl sm:p-7">
          <div className="mb-6 flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-100/15 bg-cyan-100/[0.07]"><Mail className="h-5 w-5 text-cyan-100"/></div><div><h2 className="text-lg font-semibold">{isAr ? 'اكتب الرسالة وخطط توقيتها' : 'Compose and plan your message'}</h2><p className="mt-1 text-xs text-slate-400">{isAr ? 'أسترا تحسب الاقتراح؛ أنت تراجع وتؤكد.' : 'Astra calculates a suggestion; you review and confirm.'}</p></div></div>
          <form onSubmit={handleSchedule} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-xs text-slate-300"><span>{isAr ? 'إلى مَن؟' : 'Recipient'}</span><input value={recipient} onChange={(event) => setRecipient(event.target.value)} placeholder={isAr ? 'مثال: مركز ناسا / العائلة' : 'e.g. NASA Mission Control / family'} className="w-full rounded-xl border border-white/10 bg-[#070d18] px-3.5 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-200/40" required/></label>
              <label className="space-y-2 text-xs text-slate-300"><span>{isAr ? 'نوع الرسالة' : 'Message type'}</span><select value={category} onChange={(event) => setCategory(event.target.value as MessageCategory)} className="w-full rounded-xl border border-white/10 bg-[#070d18] px-3.5 py-3 text-sm text-white outline-none focus:border-cyan-200/40">{(['MEDICAL','TRAJECTORY','MAINTENANCE','SCIENCE','PERSONAL'] as MessageCategory[]).map((value) => <option key={value} value={value}>{categoryLabels[value]}</option>)}</select></label>
            </div>
            <label className="block space-y-2 text-xs text-slate-300"><span>{isAr ? 'نص الرسالة' : 'Message'}</span><textarea rows={4} value={message} onChange={(event) => setMessage(event.target.value)} placeholder={isAr ? 'اكتب الرسالة التي تريد إيصالها...' : 'Write the message you want to send...'} className="w-full resize-y rounded-xl border border-white/10 bg-[#070d18] px-3.5 py-3 text-sm leading-6 text-white outline-none placeholder:text-slate-600 focus:border-cyan-200/40" required/></label>
            <div className="rounded-2xl border border-white/[0.08] bg-[#070d18]/80 p-4 sm:p-5">
              <div className="mb-4 flex items-center gap-2 text-sm font-semibold"><Clock3 className="h-4 w-4 text-cyan-200"/>{isAr ? 'متى تريد استلام الرد؟' : 'When do you need the reply?'}</div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-xs text-slate-300"><span>{isAr ? 'الموعد المطلوب للرد' : 'Reply needed by'}</span><input type="datetime-local" value={desiredReplyInput} onChange={(event) => setDesiredReplyInput(event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#101827] px-3 py-3 text-xs text-white outline-none focus:border-cyan-200/40" required/></label>
                <label className="space-y-2 text-xs text-slate-300"><span>{isAr ? 'الوقت المتوقع لإعداد الرد' : 'Recipient response time'}</span><div className="flex items-center gap-2"><input type="number" min="0" max="10080" value={responseMinutes} onChange={(event) => setResponseMinutes(Math.max(0, Number(event.target.value)))} className="w-full rounded-xl border border-white/10 bg-[#101827] px-3 py-3 text-sm text-white outline-none focus:border-cyan-200/40"/><span className="shrink-0 text-slate-500">{isAr ? 'دقيقة' : 'min'}</span></div></label>
              </div>
              <p className="mt-2 text-[10px] leading-5 text-slate-500">{isAr ? 'مثال: ضع ٣٠ دقيقة لطلب توصيل، أو المدة التي تتوقع أن يحتاجها مركز التحكم/أحد أفراد العائلة للرد.' : 'For example: enter 30 minutes for a delivery, or your estimate for Mission Control or a family member to respond.'}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-xs text-slate-300"><span>{isAr ? 'المسار / بُعد الاتصال' : 'Communication route / distance'}</span><select value={scenarioId} onChange={(event) => setScenarioId(event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#070d18] px-3 py-3 text-xs text-white outline-none focus:border-cyan-200/40">{ORBITAL_DELAY_SCENARIOS.map((scenario: OrbitalDelayScenario) => <option key={scenario.id} value={scenario.id}>{isAr ? scenario.nameAr : scenario.name} · {scenario.oneWayLightTimeMinutes} {isAr ? 'د اتجاه واحد' : 'min one-way'}</option>)}</select></label>
              <div className="space-y-2 text-xs text-slate-300"><span>{isAr ? 'درجة الاستعجال' : 'Urgency'}</span><div className="grid grid-cols-3 gap-2">{(['ROUTINE','HIGH','CRITICAL'] as MessagePriority[]).map((value) => <button key={value} type="button" onClick={() => setPriority(value)} className={`rounded-xl border px-2 py-3 text-[11px] transition ${priority === value ? value === 'CRITICAL' ? 'border-rose-300/40 bg-rose-300/15 text-rose-100' : value === 'HIGH' ? 'border-amber-200/40 bg-amber-200/10 text-amber-100' : 'border-cyan-200/40 bg-cyan-200/10 text-cyan-100' : 'border-white/10 bg-[#070d18] text-slate-400'}`}>{priorityLabels[value]}</button>)}</div></div>
            </div>

            <div className="rounded-2xl border border-cyan-100/15 bg-gradient-to-br from-cyan-200/[0.07] to-indigo-300/[0.04] p-4 sm:p-5">
              <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-cyan-50"><WandSparkles className="h-4 w-4 text-cyan-200"/>{isAr ? 'خطة أسترا المقترحة' : 'Astra’s timing estimate'}</div>
              {!isValidDate ? <p className="text-xs text-rose-200">{isAr ? 'أدخل موعداً صالحاً لوصول الرد.' : 'Enter a valid desired reply time.'}</p> : <>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border border-white/[0.07] bg-[#070d18]/70 p-3"><span className="block text-[10px] text-slate-500">{isAr ? 'إرسال الرسالة' : 'Send message'}</span><strong className="mt-1 block text-xs text-white">{sendNow ? (isAr ? 'الآن / فوراً' : 'Now / immediately') : formatDate(plannedSendAt, lang)}</strong></div>
                  <div className="rounded-xl border border-white/[0.07] bg-[#070d18]/70 p-3"><span className="block text-[10px] text-slate-500">{isAr ? 'وصول الرسالة المتوقع' : 'Message reaches recipient'}</span><strong className="mt-1 block text-xs text-white">{formatDate(plannedSendAt + (propagationMinutes + transferMinutes) * MINUTE, lang)}</strong></div>
                  <div className="rounded-xl border border-white/[0.07] bg-[#070d18]/70 p-3"><span className="block text-[10px] text-slate-500">{isAr ? 'وصول الرد التقديري' : 'Estimated reply arrival'}</span><strong className={`mt-1 block text-xs ${arrivalAt <= desiredReplyAt + MINUTE ? 'text-emerald-200' : 'text-amber-200'}`}>{formatDate(arrivalAt, lang)}</strong></div>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] text-slate-400"><span className="inline-flex items-center gap-1"><ArrowUp className="h-3 w-3 text-cyan-200"/>{isAr ? `الإشارة ذهاباً وإياباً: ${durationLabel(roundTripMinutes, lang)}` : `Signal round trip: ${durationLabel(roundTripMinutes, lang)}`}</span><span className="inline-flex items-center gap-1"><MessageCircle className="h-3 w-3 text-violet-200"/>{isAr ? `زمن إعداد الرد: ${durationLabel(responseMinutes, lang)}` : `Response preparation: ${durationLabel(responseMinutes, lang)}`}</span><span className="inline-flex items-center gap-1"><ArrowDown className="h-3 w-3 text-cyan-200"/>{isAr ? `هامش الحساب: ${durationLabel(totalLeadMinutes, lang)}` : `Total planning lead: ${durationLabel(totalLeadMinutes, lang)}`}</span></div>
                {sendNow && priority !== 'CRITICAL' && <p className="mt-3 rounded-xl border border-amber-200/15 bg-amber-200/[0.05] p-3 text-[11px] leading-5 text-amber-100/80">{isAr ? 'الموعد المطلوب أقرب من زمن الاتصال والرد المتوقع. الإرسال الآن هو أبكر خيار، لكن أسترا لا تستطيع ضمان وصول الرد قبل الموعد.' : 'The requested reply deadline is sooner than the estimated communication and response time. Sending now is the earliest option; Astra cannot guarantee a reply by your deadline.'}</p>}
                {priority === 'CRITICAL' && <p className="mt-3 rounded-xl border border-rose-200/15 bg-rose-200/[0.05] p-3 text-[11px] leading-5 text-rose-100/80">{isAr ? 'الأولوية العاجلة تتجاوز الجدولة وترسل الرسالة فوراً. لا تستخدم التطبيق بديلاً عن قنوات الطوارئ الرسمية.' : 'Urgent priority bypasses scheduling and queues the message immediately. Do not use this app instead of official emergency channels.'}</p>}
              </>}
            </div>
            <button type="submit" disabled={!recipient.trim() || !message.trim() || !isValidDate} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-200 to-sky-400 px-5 py-3.5 text-sm font-bold text-[#07111f] shadow-lg transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"><Sparkles className="h-4 w-4"/>{sendNow ? (isAr ? 'مراجعة وجدولة الإرسال الآن' : 'Review and queue now') : (isAr ? 'مراجعة وجدولة الإرسال الذكي' : 'Review and schedule transmission')}</button>
          </form>
        </section>

        <aside className="space-y-5">
          <section className="rounded-[26px] border border-white/[0.08] bg-[#0b1322]/95 p-5 shadow-xl sm:p-6">
            <div className="mb-4 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-200/[0.08] text-violet-100"><Users className="h-5 w-5"/></div><div><h2 className="font-semibold">{isAr ? 'مثال بسيط للفكرة' : 'The timing idea, simply'}</h2><p className="mt-1 text-[10px] text-slate-500">{isAr ? 'نفس منطق طلب الوجبة قبل انتهائك من المذاكرة' : 'Like ordering dinner before you finish studying'}</p></div></div>
            <p className="rounded-xl border border-white/[0.06] bg-[#070d18] p-3 text-xs leading-6 text-slate-300">{example}</p>
            <div className="mt-4 space-y-2 text-[11px] text-slate-400"><div className="flex items-center justify-between gap-3"><span>{isAr ? 'موعد الحاجة' : 'Need by'}</span><span className="text-white">٨:٠٠ مساءً</span></div><div className="flex items-center justify-between gap-3"><span>{isAr ? 'مدة وصول الرسالة / الخدمة' : 'Travel / service time'}</span><span className="text-cyan-100">٣٠ دقيقة</span></div><div className="flex items-center justify-between gap-3 border-t border-white/[0.07] pt-2"><span>{isAr ? 'وقت الطلب المقترح' : 'Suggested order time'}</span><span className="font-semibold text-emerald-200">٧:٣٠ مساءً</span></div></div>
          </section>

          <section className="rounded-[26px] border border-white/[0.08] bg-[#0b1322]/95 p-5 shadow-xl sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-3"><div className="flex items-center gap-2"><Radio className="h-4 w-4 text-cyan-200"/><h2 className="font-semibold">{isAr ? 'جدول الرسائل' : 'Transmission schedule'}</h2></div><span className="rounded-full bg-white/[0.06] px-2 py-1 text-[10px] text-slate-400">{plans.length}</span></div>
            {notice && <div role="status" className="mb-4 rounded-xl border border-cyan-200/15 bg-cyan-200/[0.05] p-3 text-[11px] leading-5 text-cyan-50/90">{notice}</div>}
            {plans.length === 0 ? <div className="rounded-xl border border-dashed border-white/10 px-4 py-8 text-center text-xs leading-6 text-slate-500"><Clock3 className="mx-auto mb-2 h-5 w-5 text-slate-600"/>{isAr ? 'لا توجد رسائل مجدولة. خطط لأول رسالة من النموذج.' : 'No scheduled messages yet. Plan your first transmission in the form.'}</div> : <div className="max-h-[560px] space-y-3 overflow-y-auto pr-1">{plans.map((plan) => <article key={plan.id} className="rounded-2xl border border-white/[0.08] bg-[#070d18] p-4"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className="truncate text-xs font-semibold text-white">{plan.recipient}</span><span className={`rounded-full px-2 py-0.5 text-[9px] ${plan.status === 'sent' ? 'bg-emerald-200/10 text-emerald-200' : plan.status === 'failed' ? 'bg-rose-200/10 text-rose-200' : 'bg-amber-200/10 text-amber-100'}`}>{plan.status === 'sent' ? (isAr ? 'أُرسلت' : 'Sent') : plan.status === 'sending' ? (isAr ? 'جارٍ الإرسال' : 'Sending') : plan.status === 'failed' ? (isAr ? 'تعذّر الإرسال' : 'Failed') : (isAr ? 'مجدولة' : 'Scheduled')}</span></div><p className="mt-2 line-clamp-3 whitespace-pre-wrap text-[11px] leading-5 text-slate-400">{plan.content}</p></div>{plan.status === 'sending' && <LoaderCircle className="h-4 w-4 shrink-0 animate-spin text-cyan-200"/>}{plan.status === 'sent' && <Check className="h-4 w-4 shrink-0 text-emerald-200"/>}</div><div className="mt-3 grid grid-cols-2 gap-2 border-t border-white/[0.06] pt-3 text-[10px]"><div><span className="block text-slate-600">{isAr ? 'موعد الإرسال' : 'Send at'}</span><span className="mt-1 block text-slate-300">{formatDate(plan.scheduledSendAt, lang)}</span></div><div><span className="block text-slate-600">{isAr ? 'الرد المطلوب' : 'Reply by'}</span><span className="mt-1 block text-slate-300">{formatDate(plan.desiredReplyAt, lang)}</span></div></div>{plan.status === 'failed' && <p className="mt-2 text-[10px] text-rose-200">{plan.error}</p>}{plan.status !== 'sent' && plan.status !== 'sending' && <div className="mt-3 flex justify-end gap-2"><button type="button" onClick={() => sendImmediately(plan)} className="rounded-lg border border-cyan-200/20 px-2.5 py-1.5 text-[10px] text-cyan-100 hover:bg-cyan-100/10">{isAr ? 'إرسال الآن' : 'Send now'}</button><button type="button" onClick={() => removePlan(plan.id)} className="rounded-lg border border-white/10 px-2.5 py-1.5 text-[10px] text-slate-400 hover:text-white">{isAr ? 'إلغاء' : 'Cancel'}</button></div>}</article>)}</div>}
            <p className="mt-4 text-[10px] leading-5 text-slate-600">{isAr ? 'مهم: مؤقت الإرسال يعمل في هذا المتصفح ما دامت صفحة المشروع مفتوحة. إغلاق الصفحة أو إيقاف الخادم قد يؤخر الرسالة. لا يوجد حالياً إرسال فعلي لناسا.' : 'Important: the send timer runs in this browser while the app stays open. Closing the page or stopping the server may delay it. No real NASA uplink is connected.'}</p>
          </section>
        </aside>
      </div>
      <section className="grid gap-3 rounded-2xl border border-white/[0.07] bg-[#0b1322]/70 p-4 text-[11px] leading-5 text-slate-400 sm:grid-cols-3 sm:p-5"><div className="flex items-start gap-2"><Globe2 className="mt-0.5 h-4 w-4 shrink-0 text-cyan-200"/><span>{isAr ? 'زمن الإشارة محسوب حسب المسار المختار، والرد يحتاج رحلة عودة أيضاً.' : 'Signal time uses the selected route; a reply also needs a return trip.'}</span></div><div className="flex items-start gap-2"><Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-violet-200"/><span>{isAr ? 'موعد تجهيز رد المستلم تقدير تدخله أنت، وليس تنبؤاً مؤكداً بسلوكه.' : 'Recipient response preparation is your estimate, not a prediction of their behavior.'}</span></div><div className="flex items-start gap-2"><Rocket className="mt-0.5 h-4 w-4 shrink-0 text-emerald-200"/><span>{isAr ? 'الإرسال إلى ناسا أو العائلة يتطلب تكامل شبكة حقيقية غير موجود في هذه المحاكاة.' : 'Sending to NASA or family requires a real network integration not present in this simulation.'}</span></div></section>
    </div>
  );
};

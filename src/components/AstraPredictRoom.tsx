import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Language, MessagePriority, MissionLinkMessage } from '../types';
import { ORBITAL_DELAY_SCENARIOS } from '../data/nasaOpenDatasets';
import { ArrowDown, ArrowUpRight, Check, Clock3, Headphones, LoaderCircle, MessageCircle, Radio, Rocket, Satellite, Send, ShieldAlert, Sparkles, Timer, UserRound, X } from 'lucide-react';

interface AstraPredictRoomProps { lang: Language; }
type RouteId = 'iss-earth' | string;
type PlanStatus = 'scheduled' | 'sending' | 'sent' | 'failed';
interface MessagePlan {
  id: string;
  recipient: string;
  body: string;
  priority: MessagePriority;
  routeId: RouteId;
  replyWaitMinutes: number;
  replyNeededAt: number;
  sendAt: number;
  createdAt: number;
  status: PlanStatus;
  error?: string;
  sentMessage?: MissionLinkMessage;
}

const STORAGE_KEY = 'astra_predict_plans_v2';
const MINUTE = 60_000;
const ISS_ROUTE = { id: 'iss-earth', name: 'ISS ↔ Earth via TDRS (estimate)', nameAr: 'المحطة ↔ الأرض عبر TDRS (تقديري)', oneWayMinutes: 0.02, seconds: 1.28, rateKbps: 2000 };
function routeDetails(id: RouteId) {
  if (id === ISS_ROUTE.id) return ISS_ROUTE;
  const scenario = ORBITAL_DELAY_SCENARIOS.find((item) => item.id === id) || ORBITAL_DELAY_SCENARIOS[3];
  return { id: scenario.id, name: scenario.name, nameAr: scenario.nameAr, oneWayMinutes: scenario.oneWayLightTimeMinutes, seconds: scenario.oneWayLightTimeSeconds, rateKbps: scenario.nominalUplinkRateKbps };
}
function readPlans(): MessagePlan[] {
  try { const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); return Array.isArray(value) ? value : []; } catch { return []; }
}
function localInputDate(timestamp: number) {
  const local = new Date(timestamp - new Date(timestamp).getTimezoneOffset() * MINUTE);
  return local.toISOString().slice(0, 16);
}
function displayDate(timestamp: number, lang: Language) {
  return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-EG' : 'en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(timestamp);
}
function duration(minutes: number, lang: Language) {
  const value = Math.max(0, Math.ceil(minutes));
  const hours = Math.floor(value / 60);
  const mins = value % 60;
  return lang === 'ar' ? (hours ? `${hours} س ${mins} د` : `${mins} د`) : (hours ? `${hours}h ${mins}m` : `${mins} min`);
}

export const AstraPredictRoom: React.FC<AstraPredictRoomProps> = ({ lang }) => {
  const isAr = lang === 'ar';
  const [recipient, setRecipient] = useState('Houston Mission Control');
  const [body, setBody] = useState('');
  const [priority, setPriority] = useState<MessagePriority>('ROUTINE');
  const [routeId, setRouteId] = useState<RouteId>(ISS_ROUTE.id);
  const [replyWait, setReplyWait] = useState(30);
  const [replyTime, setReplyTime] = useState(() => localInputDate(Date.now() + 2 * MINUTE * 60));
  const [plans, setPlans] = useState<MessagePlan[]>(readPlans);
  const [notice, setNotice] = useState('');
  const busyIds = useRef(new Set<string>());
  const route = routeDetails(routeId);
  const replyNeededAt = new Date(replyTime).getTime();
  const transferMinutes = Math.max(0.02, (new TextEncoder().encode(body).length * 8) / (route.rateKbps * 1000 * 60));
  const roundTripMinutes = route.oneWayMinutes * 2;
  const totalLeadMinutes = roundTripMinutes + replyWait + transferMinutes;
  const suggestedSendAt = replyNeededAt - totalLeadMinutes * MINUTE;
  const urgent = priority === 'CRITICAL';
  const sendAt = urgent || suggestedSendAt <= Date.now() ? Date.now() : suggestedSendAt;
  const estimatedReplyArrival = sendAt + totalLeadMinutes * MINUTE;
  const deadlineMissed = estimatedReplyArrival > replyNeededAt + 5_000;
  const hasValidReplyTime = Number.isFinite(replyNeededAt);

  const savePlans = useCallback((next: MessagePlan[]) => {
    setPlans(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); }
    catch { setNotice(isAr ? 'تعذّر حفظ الجدول على هذا الجهاز.' : 'Could not save the schedule on this device.'); }
  }, [isAr]);

  const transmit = useCallback(async (plan: MessagePlan) => {
    if (busyIds.current.has(plan.id)) return;
    busyIds.current.add(plan.id);
    setPlans((current) => {
      const next = current.map((item) => item.id === plan.id ? { ...item, status: 'sending' as const } : item);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* Continue current transmission. */ }
      return next;
    });
    try {
      const selectedRoute = routeDetails(plan.routeId);
      const response = await fetch('/api/mission-link/messages', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderRole: 'astronaut', senderName: isAr ? 'رائد فضاء · ASTRA' : 'Astronaut · ASTRA',
          recipientRole: 'ground_control', recipientName: plan.recipient,
          content: plan.body, contentAr: plan.body, priority: plan.priority,
          category: 'PERSONAL', oneWayDelaySeconds: selectedRoute.seconds,
        }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.message) throw new Error(data?.error || `HTTP ${response.status}`);
      setPlans((current) => {
        const next = current.map((item) => item.id === plan.id ? { ...item, status: 'sent' as const, sentMessage: data.message } : item);
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* Keep current session. */ }
        return next;
      });
      setNotice(isAr ? `أُضيفت الرسالة إلى سجل المحاكاة. زمن الإشارة للاتجاه الواحد نحو ${duration(selectedRoute.oneWayMinutes, lang)}.` : `Message added to the app's simulated comms log. Estimated one-way signal time: ${duration(selectedRoute.oneWayMinutes, lang)}.`);
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      setPlans((current) => {
        const next = current.map((item) => item.id === plan.id ? { ...item, status: 'failed' as const, error: reason } : item);
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* Keep current session. */ }
        return next;
      });
      setNotice(isAr ? `تعذّر الإرسال، والرسالة باقية في الجدول: ${reason}` : `Transmission failed; the plan remains queued: ${reason}`);
    } finally { busyIds.current.delete(plan.id); }
  }, [isAr, lang]);

  useEffect(() => {
    const checkQueue = () => readPlans().filter((plan) => plan.status === 'scheduled' && plan.sendAt <= Date.now()).forEach((plan) => void transmit(plan));
    checkQueue();
    const timer = window.setInterval(checkQueue, 5_000);
    return () => window.clearInterval(timer);
  }, [transmit]);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!recipient.trim() || !body.trim() || !hasValidReplyTime) return;
    const createdAt = Date.now();
    const plan: MessagePlan = {
      id: `ASTRA-${createdAt}-${Math.random().toString(36).slice(2, 6)}`,
      recipient: recipient.trim(), body: body.trim(), priority, routeId,
      replyWaitMinutes: Math.max(0, replyWait), replyNeededAt,
      sendAt, createdAt, status: 'scheduled',
    };
    savePlans([plan, ...plans]);
    setBody('');
    setNotice(sendAt <= createdAt + 1000
      ? (isAr ? 'هذه الرسالة ستُرسل فوراً لأن الموعد قريب أو الأولوية عاجلة.' : 'This message will be queued immediately because the deadline is close or the priority is urgent.')
      : (isAr ? `تمت الجدولة للإرسال في ${displayDate(sendAt, lang)}.` : `Scheduled to queue at ${displayDate(sendAt, lang)}.`));
  };

  const deletePlan = (id: string) => savePlans(plans.filter((plan) => plan.id !== id));
  const priorityText = (value: MessagePriority) => isAr ? ({ CRITICAL: 'عاجل', HIGH: 'مهم', ROUTINE: 'عادي' }[value]) : ({ CRITICAL: 'Urgent', HIGH: 'Important', ROUTINE: 'Routine' }[value]);
  const example = useMemo(() => isAr
    ? 'مثال: سأُنهي المذاكرة الساعة ٨:٠٠ وأحتاج وصول الوجبة بعدها. زمن التوصيل ٣٠ دقيقة؛ أطلبها الساعة ٧:٣٠.'
    : 'Example: I finish studying at 8:00 and want dinner afterwards. Delivery takes 30 minutes, so order at 7:30.', [isAr]);

  return (
    <div className="relative mx-auto max-w-7xl space-y-6 pb-10 text-white">
      <section className="relative overflow-hidden rounded-[30px] border border-cyan-100/10 bg-[#07101f] p-6 shadow-2xl sm:p-9">
        <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-32 h-80 w-80 rounded-full border border-cyan-200/10 sm:h-[30rem] sm:w-[30rem]"><div className="absolute inset-[15%] rounded-full border border-violet-200/10"/><div className="absolute inset-[27%] rounded-full bg-[radial-gradient(circle_at_35%_30%,#57b8d2,#234a80_48%,#10162d_78%)] shadow-[0_0_80px_rgba(54,172,226,.18)]"/></div>
        <div className="relative z-10 max-w-3xl">
          <div className="mb-4 flex flex-wrap items-center gap-2"><span className="inline-flex items-center gap-2 rounded-full border border-cyan-200/20 bg-cyan-200/[0.08] px-3 py-1.5 text-[10px] font-bold tracking-[.18em] text-cyan-100"><Satellite className="h-3.5 w-3.5"/>ASTRA PREDICT</span><span className="rounded-full border border-emerald-200/15 bg-emerald-200/[0.06] px-3 py-1.5 text-[10px] text-emerald-100/80">{isAr ? 'خطّط الرسالة في خطوات قليلة' : 'Plan a message in a few steps'}</span></div>
          <h1 className="font-display text-3xl font-bold leading-tight sm:text-5xl">{isAr ? 'خلّي الرسالة توصل في وقتها' : 'Time the message to arrive when it matters'}</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300/80 sm:text-base">{isAr ? 'اكتب الرسالة، اختَر المستلم، وحدد متى تحتاج الرد. يتوقع أسترا وقت الإرسال المناسب اعتماداً على تأخير الاتصال والمدة التي تتوقع أن يستغرقها الرد.' : 'Write your message, choose a recipient, and set when you need the reply. Astra estimates a send time using signal delay and your estimate for the recipient’s response time.'}</p>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        <article className="rounded-2xl border border-cyan-100/10 bg-[#0b1322] p-4"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-200/10"><Headphones className="h-5 w-5 text-cyan-100"/></div><div><h2 className="text-xs font-semibold">{isAr ? 'الصوت داخل المحطة' : 'Voice inside the station'}</h2><p className="mt-1 text-[10px] leading-5 text-slate-400">{isAr ? 'نظام الاتصالات الداخلي + سماعة وميكروفون معتمد' : 'Onboard intercom / radio + crew headset and microphone'}</p></div></div></article>
        <article className="rounded-2xl border border-cyan-100/10 bg-[#0b1322] p-4"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-200/10"><Satellite className="h-5 w-5 text-indigo-100"/></div><div><h2 className="text-xs font-semibold">{isAr ? 'الرابط بين المحطة والأرض' : 'Station-to-ground link'}</h2><p className="mt-1 text-[10px] leading-5 text-slate-400">{isAr ? 'شبكة NASA الفضائية TDRS / Space Network تنقل الصوت والبيانات' : 'NASA TDRS / Space Network relays voice and data'}</p></div></div></article>
        <article className="rounded-2xl border border-cyan-100/10 bg-[#0b1322] p-4"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-200/10"><Radio className="h-5 w-5 text-emerald-100"/></div><div><h2 className="text-xs font-semibold">{isAr ? 'قناة أسترا في هذا المشروع' : 'Astra channel in this app'}</h2><p className="mt-1 text-[10px] leading-5 text-slate-400">{isAr ? 'رسائل نصية مجدولة داخل سجل تجريبي — ليست اتصالاً فعلياً بناسا' : 'Scheduled text in a demo log—not a live NASA radio link'}</p></div></div></article>
      </section>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.08fr)_minmax(340px,.92fr)]">
        <section className="rounded-[26px] border border-white/[0.08] bg-[#0b1322]/95 p-5 shadow-xl sm:p-7">
          <div className="mb-5 flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-100/15 bg-cyan-100/[0.07]"><Send className="h-5 w-5 text-cyan-100"/></div><div><h2 className="text-lg font-semibold">{isAr ? 'رسالة جديدة' : 'New message'}</h2><p className="mt-1 text-xs text-slate-400">{isAr ? 'المطلوب فقط: المستلم، الرسالة، وموعد الرد.' : 'Just the essentials: recipient, message, and reply deadline.'}</p></div></div>
          <form onSubmit={submit} className="space-y-4">
            <label className="block space-y-2 text-xs text-slate-300"><span>{isAr ? 'المستلم' : 'Recipient'}</span><input value={recipient} onChange={(event) => setRecipient(event.target.value)} placeholder={isAr ? 'مثال: مركز التحكم في هيوستن أو العائلة' : 'e.g. Houston Mission Control or family'} className="w-full rounded-xl border border-white/10 bg-[#070d18] px-3.5 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-200/40" required/></label>
            <label className="block space-y-2 text-xs text-slate-300"><span>{isAr ? 'نص الرسالة' : 'Message'}</span><textarea rows={5} value={body} onChange={(event) => setBody(event.target.value)} placeholder={isAr ? 'اكتب ما تريد إيصاله...' : 'Write what you want to communicate...'} className="w-full resize-y rounded-xl border border-white/10 bg-[#070d18] px-3.5 py-3 text-sm leading-6 text-white outline-none placeholder:text-slate-600 focus:border-cyan-200/40" required/></label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-xs text-slate-300"><span>{isAr ? 'مسار الاتصال' : 'Communication route'}</span><select value={routeId} onChange={(event) => setRouteId(event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#070d18] px-3 py-3 text-xs text-white outline-none focus:border-cyan-200/40"><option value={ISS_ROUTE.id}>{isAr ? ISS_ROUTE.nameAr : ISS_ROUTE.name}</option>{ORBITAL_DELAY_SCENARIOS.filter((scenario) => scenario.id !== ISS_ROUTE.id).map((scenario) => <option key={scenario.id} value={scenario.id}>{isAr ? scenario.nameAr : scenario.name} · {scenario.oneWayLightTimeMinutes} {isAr ? 'د' : 'min'}</option>)}</select></label>
              <label className="space-y-2 text-xs text-slate-300"><span>{isAr ? 'متى تحتاج وصول الرد؟' : 'When do you need the reply?'}</span><input type="datetime-local" value={replyTime} onChange={(event) => setReplyTime(event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#070d18] px-3 py-3 text-xs text-white outline-none focus:border-cyan-200/40" required/></label>
            </div>
            <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
              <label className="space-y-2 text-xs text-slate-300"><span>{isAr ? 'وقت متوقع لإعداد الرد (اختياري)' : 'Recipient response time (optional)'}</span><div className="flex items-center gap-2"><input type="number" min="0" max="10080" value={replyWait} onChange={(event) => setReplyWait(Math.max(0, Number(event.target.value)))} className="w-full rounded-xl border border-white/10 bg-[#070d18] px-3 py-3 text-sm text-white outline-none focus:border-cyan-200/40"/><span className="text-slate-500">{isAr ? 'دقيقة' : 'min'}</span></div></label>
              <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#070d18] px-3 py-3 text-xs text-slate-300"><input type="checkbox" checked={priority === 'CRITICAL'} onChange={(event) => setPriority(event.target.checked ? 'CRITICAL' : 'ROUTINE')} className="h-4 w-4 accent-rose-400"/><span>{isAr ? 'عاجل — أرسل فوراً' : 'Urgent — send now'}</span></label>
            </div>
            <details className="rounded-xl border border-white/[0.07] bg-[#080f1c] px-4 py-3">
              <summary className="cursor-pointer text-xs text-slate-400">{isAr ? 'خيارات إضافية (اختيارية)' : 'Optional details'}</summary>
              <p className="mt-2 text-[11px] leading-5 text-slate-500">{isAr ? 'لا تحتاج لاختيار تصنيف طبي أو عائلي أو علمي. يمكن تخطي هذه التفاصيل. حالياً أسترا تسجل الرسالة كرسالة شخصية عامة في سجل المحاكاة.' : 'No medical, family, or science category is required. Skip these details; Astra currently records the message as a general personal message in the demo log.'}</p>
            </details>

            <div className="rounded-2xl border border-cyan-100/15 bg-gradient-to-br from-cyan-200/[0.07] to-indigo-300/[0.04] p-4 sm:p-5">
              <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-cyan-50"><Sparkles className="h-4 w-4 text-cyan-200"/>{isAr ? 'خطة التوقيت' : 'Timing plan'}</div>
              {!hasValidReplyTime ? <p className="text-xs text-rose-200">{isAr ? 'اختَر موعداً صحيحاً.' : 'Choose a valid deadline.'}</p> : <>
                <div className="grid gap-3 sm:grid-cols-3"><div className="rounded-xl bg-[#070d18]/80 p-3"><span className="block text-[10px] text-slate-500">{isAr ? 'الإرسال المقترح' : 'Suggested send'}</span><b className="mt-1 block text-xs text-white">{sendAt <= Date.now() ? (isAr ? 'الآن' : 'Now') : displayDate(sendAt, lang)}</b></div><div className="rounded-xl bg-[#070d18]/80 p-3"><span className="block text-[10px] text-slate-500">{isAr ? 'زمن الإشارة ذهاباً' : 'One-way signal'}</span><b className="mt-1 block text-xs text-cyan-100">{duration(route.oneWayMinutes, lang)}</b></div><div className="rounded-xl bg-[#070d18]/80 p-3"><span className="block text-[10px] text-slate-500">{isAr ? 'الرد المتوقع' : 'Estimated reply'}</span><b className={`mt-1 block text-xs ${deadlineMissed ? 'text-amber-200' : 'text-emerald-200'}`}>{displayDate(estimatedReplyArrival, lang)}</b></div></div>
                <div className="mt-3 flex items-center gap-2 text-[10px] text-slate-400"><Timer className="h-3.5 w-3.5 text-violet-200"/><span>{isAr ? `الحساب يشمل ${duration(roundTripMinutes, lang)} ذهاباً وإياباً + ${duration(replyWait, lang)} لكتابة الرد` : `Estimate includes ${duration(roundTripMinutes, lang)} round trip + ${duration(replyWait, lang)} for the recipient to reply`}</span></div>
                {deadlineMissed && <p className="mt-3 rounded-xl border border-amber-200/15 bg-amber-200/[0.05] p-3 text-[11px] leading-5 text-amber-100/80">{isAr ? 'الموعد قريب جداً؛ أسترا تقترح الإرسال الآن، لكن لا يمكن ضمان وصول الرد قبل الموعد.' : 'The deadline is too close. Astra suggests sending now, but cannot guarantee the reply will arrive by then.'}</p>}
              </>}
            </div>
            <button type="submit" disabled={!recipient.trim() || !body.trim() || !hasValidReplyTime} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-200 to-sky-400 px-5 py-3.5 text-sm font-bold text-[#07111f] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"><Send className="h-4 w-4"/>{sendAt <= Date.now() ? (isAr ? 'إضافة للإرسال الآن' : 'Queue to send now') : (isAr ? 'جدولة الرسالة' : 'Schedule message')}</button>
          </form>
        </section>

        <aside className="space-y-5">
          <section className="rounded-[26px] border border-white/[0.08] bg-[#0b1322]/95 p-5 shadow-xl sm:p-6"><div className="mb-4 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-200/[0.08]"><Headphones className="h-5 w-5 text-cyan-100"/></div><div><h2 className="text-sm font-semibold">{isAr ? 'جهاز اتصال رائد الفضاء' : 'Astronaut communication equipment'}</h2><p className="mt-1 text-[10px] text-slate-500">{isAr ? 'المحطة الدولية — توضيح مبسط' : 'ISS — simplified overview'}</p></div></div><div className="space-y-3 text-[11px] leading-5 text-slate-300"><div className="rounded-xl border border-white/[0.06] bg-[#070d18] p-3"><b className="text-cyan-100">{isAr ? 'للتحدث: ' : 'For voice: '}</b>{isAr ? 'نظام الاتصال الداخلي/الراديو على المحطة مع سماعة رأس وميكروفون.' : 'The station’s onboard intercom/radio system with a crew headset and microphone.'}</div><div className="rounded-xl border border-white/[0.06] bg-[#070d18] p-3"><b className="text-indigo-100">{isAr ? 'للربط بالأرض: ' : 'For the ground link: '}</b>{isAr ? 'شبكة NASA الفضائية TDRS (Space Network) تعمل كمرحّل للصوت والبيانات بين المحطة والمحطات الأرضية ومركز التحكم.' : 'NASA’s TDRS Space Network relays voice and data between the station, ground stations, and Mission Control.'}</div><p className="text-[10px] text-amber-100/70">{isAr ? 'هذا وصف للمعدات والشبكة، وليس ربطاً حقيقياً من تطبيق ASTRA. الرسائل هنا محاكاة نصية.' : 'This describes the real equipment/network; it does not connect this Astra app to the radio. Messages here are a text simulation.'}</p></div></section>

          <section className="rounded-[26px] border border-white/[0.08] bg-[#0b1322]/95 p-5 shadow-xl sm:p-6"><div className="mb-4 flex items-center justify-between gap-3"><div className="flex items-center gap-2"><Radio className="h-4 w-4 text-cyan-200"/><h2 className="text-sm font-semibold">{isAr ? 'قائمة الرسائل' : 'Message queue'}</h2></div><span className="rounded-full bg-white/[0.06] px-2 py-1 text-[10px] text-slate-400">{plans.length}</span></div>{notice && <div role="status" className="mb-4 rounded-xl border border-cyan-200/15 bg-cyan-200/[0.05] p-3 text-[11px] leading-5 text-cyan-50/90">{notice}</div>}{plans.length === 0 ? <div className="rounded-xl border border-dashed border-white/10 px-4 py-8 text-center text-xs text-slate-500"><Clock3 className="mx-auto mb-2 h-5 w-5 text-slate-600"/>{isAr ? 'لا توجد رسائل في الجدول بعد.' : 'No messages in the queue yet.'}</div> : <div className="max-h-[520px] space-y-3 overflow-y-auto pr-1">{plans.map((plan) => <article key={plan.id} className="rounded-2xl border border-white/[0.08] bg-[#070d18] p-4"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className="truncate text-xs font-semibold">{plan.recipient}</span><span className={`rounded-full px-2 py-0.5 text-[9px] ${plan.status === 'sent' ? 'bg-emerald-200/10 text-emerald-200' : plan.status === 'failed' ? 'bg-rose-200/10 text-rose-200' : 'bg-amber-200/10 text-amber-100'}`}>{plan.status === 'sent' ? (isAr ? 'أُرسلت للمحاكاة' : 'Sent to demo') : plan.status === 'sending' ? (isAr ? 'جارٍ' : 'Sending') : plan.status === 'failed' ? (isAr ? 'فشل' : 'Failed') : (isAr ? 'مجدولة' : 'Scheduled')}</span></div><p className="mt-2 line-clamp-3 whitespace-pre-wrap text-[11px] leading-5 text-slate-400">{plan.body}</p></div>{plan.status === 'sending' && <LoaderCircle className="h-4 w-4 animate-spin text-cyan-200"/>}{plan.status === 'sent' && <Check className="h-4 w-4 text-emerald-200"/>}</div><div className="mt-3 grid grid-cols-2 gap-2 border-t border-white/[0.06] pt-3 text-[10px]"><div><span className="block text-slate-600">{isAr ? 'الإرسال' : 'Send'}</span><span className="mt-1 block text-slate-300">{displayDate(plan.sendAt, lang)}</span></div><div><span className="block text-slate-600">{isAr ? 'الرد مطلوب' : 'Reply by'}</span><span className="mt-1 block text-slate-300">{displayDate(plan.replyNeededAt, lang)}</span></div></div>{plan.error && <p className="mt-2 text-[10px] text-rose-200">{plan.error}</p>}{plan.status !== 'sent' && plan.status !== 'sending' && <div className="mt-3 flex justify-end"><button type="button" onClick={() => deletePlan(plan.id)} className="flex items-center gap-1 rounded-lg border border-white/10 px-2.5 py-1.5 text-[10px] text-slate-400 hover:text-white"><X className="h-3 w-3"/>{isAr ? 'إلغاء' : 'Cancel'}</button></div>}</article>)}</div>}<p className="mt-4 text-[10px] leading-5 text-slate-600">{isAr ? 'الإرسال المجدول يعمل ما دامت صفحة التطبيق مفتوحة. إغلاقها قد يؤخر الرسالة. لا يوجد اتصال فعلي بناسا.' : 'Scheduled sending runs while this app page is open. Closing it may delay a message. There is no live NASA connection.'}</p></section>
        </aside>
      </div>
      <div className="flex items-start gap-2 rounded-2xl border border-amber-100/10 bg-amber-100/[0.03] p-4 text-[10px] leading-5 text-slate-400"><ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-200"/><span>{isAr ? 'شبكة TDRS/Space Network هي مرحّل اتصالات، وليست جهازاً يحمله الرائد. المعدات الصوتية تكون ضمن نظام المحطة مع سماعة وميكروفون. هذه الواجهة لا ترسل صوتاً ولا تتصل بناسا؛ الإرسال الحالي يحفظ رسالة نصية في سجل المشروع التجريبي.' : 'TDRS/Space Network is a communications relay, not a handheld device. Voice equipment is part of the station system with a headset and microphone. This UI does not send audio or connect to NASA; current transmission only stores text in the project demo log.'}</span></div>
      <div className="rounded-2xl border border-white/[0.07] bg-[#0b1322]/70 p-4 text-[11px] leading-6 text-slate-400"><div className="mb-2 flex items-center gap-2 text-slate-200"><UserRound className="h-4 w-4 text-cyan-200"/>{isAr ? 'مثال أسترا في الحياة اليومية' : 'Astra’s everyday timing example'}</div>{example}<div className="mt-2 flex items-center gap-2 font-semibold text-emerald-200"><ArrowUpRight className="h-3.5 w-3.5"/>{isAr ? 'موعد الحاجة ٨:٠٠ ← وقت الطلب ٧:٣٠' : 'Need at 8:00 ← order at 7:30'}</div></div>
    </div>
  );
};

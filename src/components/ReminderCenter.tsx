import React, { useEffect, useMemo, useState } from 'react';
import { Bell, BellRing, Check, Clock3, MessageCircle, Plus, Rocket, X } from 'lucide-react';
import { Language } from '../types';

type ReminderStatus = 'scheduled' | 'waiting' | 'answered' | 'done';
interface Reminder {
  id: string;
  title: string;
  dueAt: number;
  remindAt: number;
  leadMinutes: number;
  followUp: string;
  status: ReminderStatus;
  reply?: string;
  createdAt: number;
}

const STORAGE_KEY = 'astra_personal_reminders_v1';
const toLocalInput = (date: Date) => {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
};
const digitsToLatin = (value: string) => value.replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)));

/** Understand simple Arabic/English reminder requests; the date/time form remains available for clarity. */
function parseReminderCommand(command: string): { title: string; dueAt: number } | null {
  const text = digitsToLatin(command.trim());
  const timeMatch = text.match(/(?:الساعة\s*)?(\d{1,2}:\d{2})/);
  if (!timeMatch) return null;
  const [, time] = timeMatch;
  const dateMatch = text.match(/(\d{4}-\d{2}-\d{2})/);
  const date = dateMatch ? new Date(`${dateMatch[1]}T${time}`) : new Date();
  if (!dateMatch) {
    const [hours, minutes] = time.split(':').map(Number);
    date.setHours(hours, minutes, 0, 0);
    if (date.getTime() <= Date.now()) date.setDate(date.getDate() + 1);
  }
  if (!Number.isFinite(date.getTime()) || date.getTime() <= Date.now()) return null;
  const title = text
    .replace(/^(?:من فضلك\s*)?(?:ذكرني|ذكّرني|فكرني|remind me to|remind me)\s*/i, '')
    .replace(/(?:في|يوم|بتاريخ)\s*\d{4}-\d{2}-\d{2}/g, '')
    .replace(/(?:الساعة\s*)?\d{1,2}:\d{2}/, '')
    .replace(/\s+/g, ' ')
    .trim();
  return title ? { title, dueAt: date.getTime() } : null;
}

export const ReminderCenter: React.FC<{ lang: Language }> = ({ lang }) => {
  const isAr = lang === 'ar';
  const [open, setOpen] = useState(false);
  const [reminders, setReminders] = useState<Reminder[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [command, setCommand] = useState('');
  const [title, setTitle] = useState('');
  const [dueInput, setDueInput] = useState(() => toLocalInput(new Date(Date.now() + 60 * 60 * 1000)));
  const [leadMinutes, setLeadMinutes] = useState(15);
  const [followUp, setFollowUp] = useState('');
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState('');

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders)); } catch { /* Storage may be unavailable. */ }
  }, [reminders]);

  useEffect(() => {
    const deliverDueReminders = () => {
      const now = Date.now();
      setReminders((current) => {
        let changed = false;
        const next = current.map((item) => {
          if (item.status !== 'scheduled' || item.remindAt > now) return item;
          changed = true;
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(isAr ? 'تذكير من أسترا' : 'ASTRA reminder', {
              body: `${item.title}${item.followUp ? ` — ${isAr ? 'بعد ردك:' : 'After your reply:'} ${item.followUp}` : ''}`,
              tag: `astra-reminder-${item.id}`,
            });
          }
          return { ...item, status: 'waiting' as const };
        });
        return changed ? next : current;
      });
    };
    deliverDueReminders();
    const timer = window.setInterval(deliverDueReminders, 15000);
    return () => window.clearInterval(timer);
  }, [isAr]);

  const waitingCount = useMemo(() => reminders.filter((item) => item.status === 'waiting').length, [reminders]);

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      try { await Notification.requestPermission(); } catch { /* In-app alerts still work. */ }
    }
  };

  const createReminder = async (reminderTitle: string, dueAt: number) => {
    if (!reminderTitle.trim() || dueAt <= Date.now()) {
      setNotice(isAr ? 'اكتب المهمة واختر وقتاً مستقبلياً.' : 'Enter a task and choose a future time.');
      return;
    }
    await requestNotificationPermission();
    const lead = Math.max(0, Math.min(1440, Number(leadMinutes) || 0));
    const item: Reminder = {
      id: `reminder-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title: reminderTitle.trim(), dueAt, remindAt: dueAt - lead * 60000,
      leadMinutes: lead, followUp: followUp.trim(), status: 'scheduled', createdAt: Date.now(),
    };
    setReminders((current) => [item, ...current]);
    setNotice(isAr ? 'تم حفظ التذكير. سيظهر هنا قبل الموعد، وقد يرسل المتصفح إشعاراً.' : 'Reminder saved. It will appear here before the due time; browser notification availability varies.');
    setTitle(''); setCommand(''); setFollowUp('');
  };

  const submitCommand = (event: React.FormEvent) => {
    event.preventDefault();
    const parsed = parseReminderCommand(command);
    if (parsed) {
      setTitle(parsed.title);
      setDueInput(toLocalInput(new Date(parsed.dueAt)));
      setNotice(isAr ? 'فهمت المهمة والموعد. راجع التفاصيل ثم احفظ.' : 'I understood the task and time. Review the details, then save.');
    } else {
      setNotice(isAr ? 'اكتب مثلاً: ذكرني بشرب الماء الساعة 18:30 أو استخدم حقلي المهمة والموعد.' : 'Try “Remind me to drink water at 18:30” or fill in the task and time below.');
    }
  };

  const saveReply = (item: Reminder) => {
    const reply = (replyDrafts[item.id] || '').trim();
    if (!reply) return;
    setReminders((current) => current.map((entry) => entry.id === item.id ? { ...entry, reply, status: 'answered' } : entry));
    setReplyDrafts((current) => ({ ...current, [item.id]: '' }));
  };

  const removeReminder = (id: string) => setReminders((current) => current.filter((item) => item.id !== id));
  const dateLabel = (timestamp: number) => new Date(timestamp).toLocaleString(isAr ? 'ar-EG' : undefined, { dateStyle: 'medium', timeStyle: 'short' });
  const statusLabel = (status: ReminderStatus) => ({
    scheduled: isAr ? 'مجدول' : 'Scheduled', waiting: isAr ? 'بانتظار ردك' : 'Awaiting your reply',
    answered: isAr ? 'تم استلام ردك' : 'Reply received', done: isAr ? 'مكتمل' : 'Complete',
  })[status];

  return (
    <div className="fixed bottom-20 right-4 sm:bottom-5 sm:right-5 z-[60] font-sans" dir={isAr ? 'rtl' : 'ltr'}>
      {!open ? (
        <button onClick={() => setOpen(true)} aria-label={isAr ? 'فتح تذكيرات أسترا' : 'Open ASTRA reminders'}
          className="relative flex items-center gap-2 rounded-full bg-gradient-to-r from-[#8B7CFF] to-[#36D9FF] px-4 py-3 text-[#080B16] font-bold shadow-xl hover:scale-105 transition-transform">
          {waitingCount ? <BellRing className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
          <span>{isAr ? 'تذكيرات أسترا' : 'ASTRA Reminders'}</span>
          {waitingCount > 0 && <span className="absolute -top-1 -left-1 min-w-5 h-5 rounded-full bg-rose-500 text-white text-xs flex items-center justify-center">{waitingCount}</span>}
        </button>
      ) : (
        <section className="w-[min(92vw,420px)] max-h-[82vh] overflow-y-auto rounded-2xl border border-[#294362] bg-[#0C1B2B] text-[#F2F6FA] shadow-2xl">
          <header className="sticky top-0 z-10 flex items-center justify-between border-b border-[#1E2D4A] bg-[#0C1B2B] p-4">
            <div className="flex items-center gap-2"><Rocket className="w-5 h-5 text-[#36D9FF]"/><div><h2 className="font-bold">{isAr ? 'تذكيرات أسترا الذكية' : 'ASTRA Smart Reminders'}</h2><p className="text-[11px] text-slate-400">{isAr ? 'اكتب طلبك، حدّد الوقت، ثم أجب عند التنبيه.' : 'Describe it, set a time, then reply when prompted.'}</p></div></div>
            <button onClick={() => setOpen(false)} aria-label={isAr ? 'إغلاق' : 'Close'} className="rounded-lg p-2 text-slate-400 hover:bg-[#192742] hover:text-white"><X className="w-4 h-4"/></button>
          </header>
          <div className="space-y-4 p-4">
            <form onSubmit={submitCommand} className="flex gap-2">
              <input value={command} onChange={(event) => setCommand(event.target.value)} placeholder={isAr ? 'مثال: ذكرني بشرب الماء الساعة 18:30' : 'e.g. Remind me to drink water at 18:30'} className="min-w-0 flex-1 rounded-xl border border-[#294362] bg-[#07111F] px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-[#36D9FF] focus:outline-none" />
              <button className="rounded-xl bg-[#173B60] px-3 text-[#36D9FF]" title={isAr ? 'تحليل الطلب' : 'Understand request'}><MessageCircle className="w-4 h-4"/></button>
            </form>
            <div className="rounded-xl border border-[#1E2D4A] bg-[#101827] p-3">
              <label className="mb-1 block text-xs text-slate-300">{isAr ? 'ما الذي تريد تذكيرك به؟' : 'What should ASTRA remind you about?'}</label>
              <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder={isAr ? 'اكتب المهمة أو الحدث' : 'Task or event'} className="mb-3 w-full rounded-lg border border-[#294362] bg-[#07111F] px-3 py-2 text-sm text-white focus:border-[#36D9FF] focus:outline-none" />
              <div className="grid grid-cols-2 gap-3">
                <label className="text-xs text-slate-300">{isAr ? 'موعد المهمة' : 'Due time'}<input type="datetime-local" value={dueInput} onChange={(event) => setDueInput(event.target.value)} className="mt-1 w-full rounded-lg border border-[#294362] bg-[#07111F] px-2 py-2 text-xs text-white" /></label>
                <label className="text-xs text-slate-300">{isAr ? 'التنبيه قبل (دقيقة)' : 'Remind me (minutes before)'}<input type="number" min="0" max="1440" value={leadMinutes} onChange={(event) => setLeadMinutes(Number(event.target.value))} className="mt-1 w-full rounded-lg border border-[#294362] bg-[#07111F] px-2 py-2 text-sm text-white" /></label>
              </div>
              <label className="mt-3 block text-xs text-slate-300">{isAr ? 'ماذا تريد أن يحدث بعد ردك؟ (اختياري)' : 'What should happen after your reply? (optional)'}<input value={followUp} onChange={(event) => setFollowUp(event.target.value)} placeholder={isAr ? 'مثال: ساعدني على تسجيل إنجاز المهمة' : 'e.g. Help me log the completed task'} className="mt-1 w-full rounded-lg border border-[#294362] bg-[#07111F] px-3 py-2 text-sm text-white focus:border-[#36D9FF] focus:outline-none" /></label>
              <button type="button" onClick={() => createReminder(title, new Date(dueInput).getTime())} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#8B7CFF] to-[#36D9FF] px-4 py-2.5 text-sm font-bold text-[#080B16]"><Plus className="w-4 h-4"/>{isAr ? 'حفظ التذكير' : 'Save reminder'}</button>
            </div>
            {notice && <p role="status" className="rounded-lg bg-[#173B60]/60 p-2 text-xs text-[#A9DFFF]">{notice}</p>}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">{isAr ? 'خطتك ومتابعتك' : 'Your schedule & follow-up'}</h3>
              {reminders.length === 0 && <p className="rounded-xl border border-dashed border-[#294362] p-4 text-center text-xs text-slate-500">{isAr ? 'لا توجد تذكيرات بعد.' : 'No reminders yet.'}</p>}
              {reminders.map((item) => (
                <article key={item.id} className="rounded-xl border border-[#1E2D4A] bg-[#101827] p-3">
                  <div className="flex items-start justify-between gap-2"><div><div className="text-sm font-semibold text-white">{item.title}</div><div className="mt-1 flex items-center gap-1 text-[11px] text-slate-400"><Clock3 className="h-3 w-3"/>{dateLabel(item.dueAt)} · {isAr ? `تنبيه قبل ${item.leadMinutes} د` : `${item.leadMinutes}m early`}</div></div><span className={`shrink-0 rounded-full px-2 py-1 text-[10px] ${item.status === 'waiting' ? 'bg-amber-400/10 text-amber-300' : item.status === 'answered' || item.status === 'done' ? 'bg-emerald-400/10 text-emerald-300' : 'bg-[#173B60] text-[#A9DFFF]'}`}>{statusLabel(item.status)}</span></div>
                  {item.status === 'waiting' && <div className="mt-3 rounded-lg border border-amber-400/20 bg-amber-400/5 p-2"><p className="mb-2 text-xs text-amber-100">{isAr ? 'حان وقت التذكير. كيف تريد المتابعة؟' : 'It’s reminder time. How would you like to proceed?'}</p><div className="flex gap-2"><input value={replyDrafts[item.id] || ''} onChange={(event) => setReplyDrafts((current) => ({ ...current, [item.id]: event.target.value }))} onKeyDown={(event) => { if (event.key === 'Enter') saveReply(item); }} placeholder={isAr ? 'اكتب ردك هنا' : 'Type your reply'} className="min-w-0 flex-1 rounded-lg border border-[#294362] bg-[#07111F] px-2 py-2 text-xs text-white"/><button onClick={() => saveReply(item)} className="rounded-lg bg-emerald-500/20 px-3 text-emerald-300" title={isAr ? 'إرسال الرد' : 'Send reply'}><Check className="h-4 w-4"/></button></div></div>}
                  {item.reply && <div className="mt-2 rounded-lg bg-[#07111F] p-2 text-xs text-slate-300"><span className="text-[#36D9FF]">{isAr ? 'ردك: ' : 'Your reply: '}</span>{item.reply}{item.followUp && <p className="mt-1 text-slate-400">{isAr ? 'الخطوة التالية التي طلبتها: ' : 'Your requested next step: '}{item.followUp}</p>}</div>}
                  {item.status !== 'waiting' && <div className="mt-2 flex justify-end"><button onClick={() => removeReminder(item.id)} className="text-[11px] text-slate-500 hover:text-rose-300">{isAr ? 'حذف' : 'Remove'}</button></div>}
                </article>
              ))}
            </div>
            <p className="text-[10px] leading-relaxed text-slate-500">{isAr ? 'تعمل التذكيرات محلياً على هذا الجهاز أثناء فتح التطبيق. إشعارات الخلفية قد لا تصل بعد إغلاق المتصفح؛ للسلوك المضمون أبقِ أسترا مفتوحة.' : 'Reminders run locally on this device while the app is open. Background delivery is not guaranteed after closing the browser; keep ASTRA open for reliable alerts.'}</p>
          </div>
        </section>
      )}
    </div>
  );
};

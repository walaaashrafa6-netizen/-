import React, { useEffect, useRef, useState } from 'react';
import { Language, RespiratoryRecord, SleepRecord, WellnessRecord } from '../types';
import { formatDuration } from '../utils/storage';
import { generateLocalEngineResponse } from '../utils/localContextEngine';
import { ArrowUpRight, Bot, Check, Copy, Mic, MicOff, Orbit, Plus, Radio, Send, ShieldCheck, Sparkles, User, Volume2, VolumeX } from 'lucide-react';

interface ChatMessage { id: string; role: 'user' | 'assistant'; content: string; timestamp: string; }
interface AssistantViewProps { sleepRecords: SleepRecord[]; wellnessRecords: WellnessRecord[]; respiratoryRecords: RespiratoryRecord[]; lang: Language; }
type ConnectionState = 'unknown' | 'cloud' | 'local' | 'offline';

const STARS = [['8%','17%'],['19%','9%'],['31%','22%'],['47%','11%'],['65%','18%'],['78%','8%'],['91%','23%'],['13%','71%'],['28%','82%'],['53%','75%'],['72%','86%'],['88%','67%'],['39%','57%'],['6%','48%'],['96%','48%']];

export const AssistantView: React.FC<AssistantViewProps> = ({ sleepRecords, wellnessRecords, respiratoryRecords, lang }) => {
  const isAr = lang === 'ar';
  const latestSleep = sleepRecords[sleepRecords.length - 1];
  const latestWellness = wellnessRecords[wellnessRecords.length - 1];
  const latestResp = respiratoryRecords[respiratoryRecords.length - 1];
  const avgSleep = sleepRecords.length ? Math.round(sleepRecords.reduce((sum, record) => sum + record.durationMinutes, 0) / sleepRecords.length) : 460;
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try { const saved = localStorage.getItem('astra_chat_history'); const parsed = saved ? JSON.parse(saved) : []; return Array.isArray(parsed) ? parsed : []; }
    catch { return []; }
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [connection, setConnection] = useState<ConnectionState>('unknown');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const now = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  useEffect(() => {
    try { if (messages.length) localStorage.setItem('astra_chat_history', JSON.stringify(messages)); else localStorage.removeItem('astra_chat_history'); }
    catch { /* The conversation remains usable if browser storage is unavailable. */ }
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages]);

  const prompts = isAr
    ? ['كيف أتكيف مع النوم في انعدام الجاذبية؟', 'حلّل بيانات نومي المسجلة', 'اشرح لي كيف تدور محطة الفضاء حول الأرض']
    : ['How can I adapt my sleep routine in microgravity?', 'Help me understand my logged sleep data', 'Explain how the space station orbits Earth'];

  const send = async (value = input) => {
    const query = value.trim();
    if (!query || isLoading) return;
    const userMessage: ChatMessage = { id: `user-${Date.now()}`, role: 'user', content: query, timestamp: now() };
    const history = [...messages, userMessage];
    setMessages(history);
    setInput('');
    setIsLoading(true);
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 30000);
    try {
      const userContext = {
        missionName: 'ISS Expedition 72', missionDay: 48,
        latestSleepDuration: latestSleep ? formatDuration(latestSleep.durationMinutes) : '7h 40m',
        avgSleep: formatDuration(avgSleep), latestMood: latestWellness?.moodRating || 4,
        latestStress: latestWellness?.stressRating || 2, latestEnergy: latestWellness?.energyRating || 4,
        latestResp: latestResp?.respiratoryRate || 16,
        loggedSymptoms: latestWellness?.symptoms || [], sleepDisturbances: latestSleep?.disturbances || [],
      };
      const response = await fetch('/api/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: controller.signal,
        body: JSON.stringify({
          messages: history.map((message) => ({ role: message.role === 'user' ? 'user' : 'model', content: message.content })),
          userContext, language: lang,
        }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error || data?.details || `HTTP ${response.status}`);
      if (!data || typeof data.reply !== 'string' || !data.reply.trim()) throw new Error(isAr ? 'الخادم لم يُرجع نص إجابة.' : 'The server returned no answer text.');
      const isCloud = typeof data.model === 'string' && data.model.startsWith('gemini-');
      setConnection(isCloud ? 'cloud' : 'local');
      const reply = isCloud ? data.reply : `${data.reply}\n\n${isAr ? '⚠️ هذه إجابة محلية محدودة وليست من نموذج Gemini. لإجابات عامة أوسع، شغّل الخادم واضبط GEMINI_API_KEY الصحيح في إعدادات الأسرار، ثم أعد تشغيل التطبيق.' : '⚠️ This is a limited local reply, not a Gemini response. For broader answers, run the app server, set a valid GEMINI_API_KEY in your environment secrets, and restart the app.'}`;
      setMessages((current) => [...current, { id: `astra-${Date.now()}`, role: 'assistant', content: reply, timestamp: now() }]);
    } catch (error) {
      const detail = error instanceof Error && error.name === 'AbortError'
        ? (isAr ? 'انتهت مهلة الاتصال بعد 30 ثانية.' : 'The request timed out after 30 seconds.')
        : (error instanceof Error ? error.message : String(error));
      setConnection('offline');
      const local = generateLocalEngineResponse(query, lang);
      const notice = isAr
        ? `\n\n⚠️ تعذّر الاتصال بخدمة الذكاء الاصطناعي (${detail}). هذه إجابة محلية محدودة. تأكدي من تشغيل خادم المشروع وإعداد GEMINI_API_KEY صالح في أسرار بيئة التشغيل.`
        : `\n\n⚠️ Could not reach the AI service (${detail}). This is a limited local reply. Check that the project server is running and GEMINI_API_KEY is configured in the runtime environment secrets.`;
      setMessages((current) => [...current, { id: `astra-local-${Date.now()}`, role: 'assistant', content: `${local}${notice}`, timestamp: now() }]);
    } finally {
      window.clearTimeout(timeout);
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const newChat = () => {
    if (!messages.length || window.confirm(isAr ? 'هل تريد بدء محادثة جديدة؟' : 'Start a new conversation?')) { setMessages([]); setInput(''); }
  };
  const toggleMic = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) { window.alert(isAr ? 'التعرّف على الصوت غير مدعوم في هذا المتصفح.' : 'Speech recognition is not supported in this browser.'); return; }
    if (isListening) return;
    try {
      const recognition = new SpeechRecognition(); recognition.lang = isAr ? 'ar-EG' : 'en-US'; recognition.continuous = false;
      recognition.onstart = () => setIsListening(true); recognition.onend = () => setIsListening(false); recognition.onerror = () => setIsListening(false);
      recognition.onresult = (event: any) => setInput((value) => `${value}${value ? ' ' : ''}${event.results[0][0].transcript}`); recognition.start();
    } catch { setIsListening(false); }
  };
  const speak = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    if (isSpeaking) { window.speechSynthesis.cancel(); setIsSpeaking(false); return; }
    const utterance = new SpeechSynthesisUtterance(text.replace(/[*#_]/g, '')); utterance.lang = isAr ? 'ar-SA' : 'en-US';
    utterance.onend = () => setIsSpeaking(false); utterance.onerror = () => setIsSpeaking(false); setIsSpeaking(true); window.speechSynthesis.speak(utterance);
  };
  const copy = async (message: ChatMessage) => {
    try { await navigator.clipboard.writeText(message.content); setCopiedId(message.id); window.setTimeout(() => setCopiedId(null), 1800); }
    catch { /* Clipboard permission is browser-controlled. */ }
  };

  const connectionText = connection === 'cloud'
    ? (isAr ? 'متصل بـ Gemini' : 'Gemini connected')
    : connection === 'local'
      ? (isAr ? 'وضع محلي محدود · Gemini غير متاح' : 'Limited local mode · Gemini unavailable')
      : connection === 'offline'
        ? (isAr ? 'تعذّر الاتصال بالخادم' : 'AI server unreachable')
        : (isAr ? 'جاهز لإرسال أول رسالة' : 'Ready to send your first message');
  const connectionColor = connection === 'cloud' ? 'text-emerald-200' : connection === 'unknown' ? 'text-slate-300' : 'text-amber-200';

  return (
    <section className="relative mx-auto flex min-h-[calc(100vh-9rem)] w-full max-w-7xl flex-col overflow-hidden rounded-[30px] border border-cyan-100/10 bg-[#050914] text-white shadow-[0_30px_100px_rgba(0,0,0,.5)]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_75%_5%,rgba(62,95,190,.2),transparent_38%),radial-gradient(ellipse_at_5%_55%,rgba(112,54,170,.15),transparent_38%),linear-gradient(180deg,#080d1a_0%,#050914_65%)]" />
        {STARS.map(([left, top], index) => <span key={index} className="absolute h-1 w-1 rounded-full bg-cyan-100/70 shadow-[0_0_10px_rgba(125,211,252,.8)]" style={{ left, top, opacity: index % 3 === 0 ? 0.9 : 0.45 }} />)}
        <div className="absolute -right-20 -top-32 h-80 w-80 rounded-full border border-cyan-100/10 sm:right-[-2%] sm:top-[-24%] sm:h-[32rem] sm:w-[32rem]"><div className="absolute inset-[8%] rounded-full border border-cyan-100/[0.07]" /><div className="absolute inset-[17%] rounded-full border border-violet-200/[0.08]" /><div className="absolute inset-[25%] rounded-full bg-[radial-gradient(circle_at_32%_28%,#4bb7d5_0%,#255f9d_24%,#172857_53%,#090f25_74%)] shadow-[0_0_90px_rgba(61,131,220,.2)]" /></div>
      </div>
      <header className="relative z-10 border-b border-white/[0.08] px-5 py-5 sm:px-8 sm:py-7">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4"><div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-cyan-100/20 bg-gradient-to-br from-cyan-300/20 via-indigo-400/20 to-violet-400/20 shadow-[0_0_35px_rgba(71,190,224,.18)]"><Orbit className="h-7 w-7 text-cyan-200" strokeWidth={1.5} /><span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-[#080d1a] bg-emerald-300 shadow-[0_0_12px_rgba(110,231,183,.8)]" /></div><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h1 className="font-display text-2xl font-bold tracking-wide sm:text-3xl">ASTRA</h1><span className="rounded-full border border-cyan-200/20 bg-cyan-200/[0.07] px-2.5 py-1 text-[9px] font-semibold tracking-[.18em] text-cyan-100/80">MISSION AI</span></div><p className="mt-1 text-xs text-slate-300/80 sm:text-sm">{isAr ? 'رفيقتك الذكية — من مدار الأرض إلى أبعد النجوم' : 'Your intelligent companion, from Earth orbit to the farthest stars'}</p></div></div>
          <button type="button" onClick={newChat} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-xs text-slate-200 transition hover:border-cyan-200/30 hover:bg-cyan-200/[0.08]"><Plus className="h-4 w-4 text-cyan-200" />{isAr ? 'محادثة جديدة' : 'New chat'}</button>
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/[0.07] pt-4 text-[10px] tracking-wide text-slate-400 sm:text-[11px]">
          <span className={`inline-flex items-center gap-2 ${connectionColor}`}><Radio className={`h-3.5 w-3.5 ${connection === 'cloud' ? 'text-emerald-300' : 'text-cyan-200'}`} />{connectionText}</span><span>{isAr ? `متوسط النوم · ${formatDuration(avgSleep)}` : `Sleep average · ${formatDuration(avgSleep)}`}</span><span>{isAr ? `التوتر · ${latestWellness?.stressRating || 2}/5` : `Stress · ${latestWellness?.stressRating || 2}/5`}</span><span>{isAr ? `التنفس · ${latestResp?.respiratoryRate || 16}/د` : `Breathing · ${latestResp?.respiratoryRate || 16}/min`}</span>
        </div>
      </header>
      <main className="relative z-10 flex min-h-0 flex-1 flex-col">
        {!messages.length ? (
          <div className="flex flex-1 flex-col items-center justify-center px-5 py-10 text-center sm:px-8 sm:py-14">
            <div className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-cyan-200/20 bg-cyan-200/[0.06] shadow-[0_0_60px_rgba(68,174,225,.12)]"><Sparkles className="h-9 w-9 text-cyan-100" strokeWidth={1.4} /><span className="absolute -right-1 top-2 text-lg">✦</span></div>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[.28em] text-cyan-100/60">{isAr ? 'مركز القيادة · قناة آمنة' : 'MISSION CONTROL · SECURE CHANNEL'}</p>
            <h2 className="font-display text-3xl font-semibold sm:text-4xl">{isAr ? 'أهلاً بك، رائد الفضاء' : 'Welcome aboard, astronaut'}</h2>
            <p className="mt-3 max-w-lg text-sm leading-7 text-slate-300/80">{isAr ? 'أنا أسترا. اسألني عن الفضاء أو أي موضوع آخر، أو عن بياناتك المسجلة.' : 'I’m Astra. Ask me about space, any topic, or your logged wellness data.'}</p>
            <div className="mt-8 grid w-full max-w-3xl grid-cols-1 gap-3 text-start sm:grid-cols-3">{prompts.map((prompt) => <button key={prompt} onClick={() => void send(prompt)} className="group rounded-2xl border border-white/[0.09] bg-white/[0.035] p-4 text-start transition hover:-translate-y-0.5 hover:border-cyan-200/30 hover:bg-cyan-200/[0.06]"><span className="mb-4 flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-200/10 text-cyan-100"><Sparkles className="h-4 w-4" /></span><span className="block text-xs leading-5 text-slate-200">{prompt}</span><ArrowUpRight className="mt-3 h-4 w-4 text-slate-500 group-hover:text-cyan-100" /></button>)}</div>
            <p className="mt-7 max-w-xl text-[10px] leading-5 text-slate-500">{isAr ? 'ملاحظة: إذا لم يكن Gemini متاحًا، ستظهر لك رسالة توضح السبب بدلًا من الإيحاء بأن الاتصال يعمل.' : 'If Gemini is unavailable, Astra will show a diagnostic instead of pretending the cloud connection is working.'}</p>
          </div>
        ) : (
          <div className="flex-1 space-y-6 overflow-y-auto px-4 py-6 sm:px-8 sm:py-8">
            {messages.map((message) => { const isUser = message.role === 'user'; return <article key={message.id} className={`flex items-start gap-3 sm:gap-4 ${isUser ? 'flex-row-reverse' : ''}`}><div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${isUser ? 'border-cyan-200/20 bg-cyan-200/[0.08] text-cyan-100' : 'border-violet-200/20 bg-violet-300/10 text-cyan-100'}`}>{isUser ? <User className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}</div><div className={`max-w-[88%] rounded-2xl border px-4 py-3.5 shadow-lg sm:max-w-[78%] sm:px-5 ${isUser ? 'rounded-tr-sm border-cyan-200/15 bg-cyan-200/[0.07]' : 'rounded-tl-sm border-white/[0.09] bg-[#0d1423]/90'}`}><div className="mb-2 flex items-center justify-between gap-6 text-[10px] text-slate-400"><span className={isUser ? 'text-cyan-100/80' : 'font-semibold tracking-wide text-violet-100/90'}>{isUser ? (isAr ? 'أنت' : 'You') : 'ASTRA'}</span><time>{message.timestamp}</time></div><p className="whitespace-pre-wrap text-[13px] leading-7 text-slate-100/90 sm:text-sm">{message.content}</p>{!isUser && <div className="mt-3 flex items-center gap-1 border-t border-white/[0.07] pt-2"><button type="button" onClick={() => void copy(message)} className="rounded-lg p-2 text-slate-500 hover:bg-white/[0.06] hover:text-white" title={isAr ? 'نسخ الرد' : 'Copy response'}>{copiedId === message.id ? <Check className="h-3.5 w-3.5 text-emerald-300" /> : <Copy className="h-3.5 w-3.5" />}</button><button type="button" onClick={() => speak(message.content)} className="rounded-lg p-2 text-slate-500 hover:bg-white/[0.06] hover:text-cyan-100" title={isAr ? 'استمع للرد' : 'Listen to response'}>{isSpeaking ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}</button></div>}</div></article>; })}
            {isLoading && <div className="flex items-center gap-3 text-xs text-cyan-100/80"><div className="flex h-9 w-9 items-center justify-center rounded-xl border border-violet-200/20 bg-violet-300/10"><Bot className="h-4 w-4 animate-pulse" /></div><span className="animate-pulse">{isAr ? 'أسترا تستكشف الإجابة...' : 'Astra is exploring an answer...'}</span><span className="h-1.5 w-1.5 animate-ping rounded-full bg-cyan-200" /></div>}
            <div ref={messagesEndRef} />
          </div>
        )}
        <div className="border-t border-white/[0.08] bg-[#080d18]/90 px-4 pb-4 pt-4 backdrop-blur-xl sm:px-8 sm:pb-5">
          <form onSubmit={(event) => { event.preventDefault(); void send(); }} className="mx-auto flex max-w-4xl items-end gap-2 rounded-2xl border border-white/[0.12] bg-[#0e1524] p-2 shadow-[0_12px_40px_rgba(0,0,0,.3)] focus-within:border-cyan-200/35">
            <button type="button" onClick={toggleMic} className={`mb-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${isListening ? 'bg-rose-400/15 text-rose-300' : 'text-slate-400 hover:bg-white/[0.06] hover:text-cyan-100'}`} title={isAr ? 'إملاء صوتي' : 'Voice input'}>{isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}</button>
            <textarea ref={inputRef} rows={1} value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); void send(); } }} placeholder={isAr ? 'اكتب رسالتك إلى أسترا...' : 'Send a message to Astra...'} className="max-h-32 min-h-10 flex-1 resize-y bg-transparent px-2 py-2.5 text-sm text-white outline-none placeholder:text-slate-500" aria-label={isAr ? 'رسالتك إلى أسترا' : 'Your message to Astra'} />
            <button type="submit" disabled={!input.trim() || isLoading} className="mb-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-200 to-sky-400 text-[#07111f] transition hover:brightness-110 disabled:opacity-35" title={isAr ? 'إرسال' : 'Send message'}><Send className="h-4 w-4" /></button>
          </form>
          <div className="mx-auto mt-3 flex max-w-4xl items-center justify-center gap-2 text-center text-[10px] leading-5 text-slate-500"><ShieldCheck className="h-3 w-3 shrink-0 text-cyan-200/50" /><span>{isAr ? 'قد يخطئ الذكاء الاصطناعي. لا تعتمدي عليه وحده في القرارات الطبية أو الطارئة.' : 'AI can make mistakes. Don’t rely on it alone for medical or emergency decisions.'}</span></div>
        </div>
      </main>
    </section>
  );
};

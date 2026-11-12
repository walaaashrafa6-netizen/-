import React, { useState, useRef, useEffect } from 'react';
import { SleepRecord, WellnessRecord, RespiratoryRecord, Language } from '../types';
import { TRANSLATIONS } from '../utils/translations';
import { formatDuration } from '../utils/storage';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  ShieldCheck, 
  Info, 
  AlertTriangle,
  Lightbulb,
  Radio,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  RotateCcw,
  Copy,
  Check,
  Compass,
  ArrowRight,
  ShieldAlert,
  Cpu
} from 'lucide-react';
import { generateLocalEngineResponse, searchLocalKnowledgeBase } from '../utils/localContextEngine';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface AssistantViewProps {
  sleepRecords: SleepRecord[];
  wellnessRecords: WellnessRecord[];
  respiratoryRecords: RespiratoryRecord[];
  lang: Language;
}

export const AssistantView: React.FC<AssistantViewProps> = ({
  sleepRecords,
  wellnessRecords,
  respiratoryRecords,
  lang,
}) => {
  const t = TRANSLATIONS[lang];

  // Latest calculations to supply rich astronaut context
  const latestSleep = sleepRecords[sleepRecords.length - 1];
  const latestWellness = wellnessRecords[wellnessRecords.length - 1];
  const latestResp = respiratoryRecords[respiratoryRecords.length - 1];

  const avgSleep = sleepRecords.length > 0
    ? Math.round(sleepRecords.reduce((a, b) => a + b.durationMinutes, 0) / sleepRecords.length)
    : 460;
  const sleepDeficit = 480 - avgSleep;

  // Initial welcome message
  const getInitialMessages = (): ChatMessage[] => [
    {
      id: 'msg-welcome',
      role: 'assistant',
      content: lang === 'ar'
        ? `مرحباً بك، القائدة سارة تشين. أنا ASTRA — رفيقك المعرفي والصحي الذكي في المهمة.\n\nلقد اطلعت على سجلاتك الفضائية الحالية:\n- **متوسط النوم (7 أيام)**: ${formatDuration(avgSleep)} ${sleepDeficit > 0 ? `(عجز ${formatDuration(sleepDeficit)} عن هدف الـ 8 ساعات)` : '(مطابق لهدف المهمة)'}.\n- **الحالة النفسية والجاهزية**: توتر معتدل (${latestWellness?.stressRating || 2}/5)، وطاقة جيدة (${latestWellness?.energyRating || 4}/5).\n- **معدل التنفس**: ${latestResp?.respiratoryRate || 16} نفس/دقيقة (بيانات محاكاة اسمية).\n\nأنا هنا للتحاور معك بعمق وسلاسة تماماً مثل أحدث أنظمة الذكاء الاصطناعي — يمكنك استشارتي في التكيف مع انعدام الوزن، تحليل الإجهاد التراكمي، إرشادات التمارين على ARED، أو أي سؤال يدور في ذهنك أثناء تواجدك في المدار. كيف تشعرين الآن؟`
        : `Welcome back, Commander Chen. I am ASTRA, your mission cognitive twin and wellness companion.\n\nI have synchronized your active flight records:\n- **7-Day Sleep Baseline**: ${formatDuration(avgSleep)} ${sleepDeficit > 0 ? `(${formatDuration(sleepDeficit)} cumulative deficit vs 8.0h target)` : '(Target met)'}.\n- **Psychological Readiness**: Perceived stress ${latestWellness?.stressRating || 2}/5, energy ${latestWellness?.energyRating || 4}/5.\n- **Respiratory Cadence**: ${latestResp?.respiratoryRate || 16} breaths/min (Nominal rest baseline).\n\nI am engineered for deep, fluent, multi-turn conversations — whether you want to decompress, dissect circadian shift strategies, review countermeasure protocols on the ARED/T2, or discuss microgravity fluid redistribution. What is on your mind today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ];

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('astra_chat_history');
      if (saved) return JSON.parse(saved);
    } catch {}
    return getInitialMessages();
  });

  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
    try {
      localStorage.setItem('astra_chat_history', JSON.stringify(messages));
    } catch {}
  }, [messages]);

  // Voice synthesis (SpeechSynthesis)
  const handleSpeak = (text: string) => {
    if ('speechSynthesis' in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        return;
      }
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text.replace(/[*#_]/g, ''));
      utterance.lang = lang === 'ar' ? 'ar-SA' : 'en-US';
      utterance.rate = 1.0;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Voice Dictation (SpeechRecognition)
  const handleToggleMic = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(lang === 'ar' ? 'خاصية التعرف على الصوت غير مدعومة في هذا المتصفح.' : 'Speech recognition is not supported in this browser.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = lang === 'ar' ? 'ar-EG' : 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
      };

      recognition.start();
    } catch (e) {
      setIsListening(false);
    }
  };

  // Copy message
  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Clear chat
  const handleClearHistory = () => {
    if (window.confirm(lang === 'ar' ? 'هل تود مسح سجل المحادثة والبدء من جديد؟' : 'Reset conversation history?')) {
      const initial = getInitialMessages();
      setMessages(initial);
      localStorage.removeItem('astra_chat_history');
    }
  };

  // Send message
  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      // Build active astronaut telemetry context for Gemini
      const userContext = {
        missionName: 'ISS Expedition 72',
        missionDay: 48,
        latestSleepDuration: latestSleep ? formatDuration(latestSleep.durationMinutes) : '7h 40m',
        avgSleep: formatDuration(avgSleep),
        latestMood: latestWellness?.moodRating || 4,
        latestStress: latestWellness?.stressRating || 2,
        latestEnergy: latestWellness?.energyRating || 4,
        latestResp: latestResp?.respiratoryRate || 16,
        loggedSymptoms: latestWellness?.symptoms || [],
        sleepDisturbances: latestSleep?.disturbances || [],
      };

      // Format history starting from first user message for proper conversational pairing
      const userTurnIdx = newMessages.findIndex((m) => m.role === 'user');
      const validHistory = userTurnIdx >= 0 ? newMessages.slice(userTurnIdx) : newMessages;

      const formattedHistory = validHistory.map((m) => ({
        role: m.role === 'user' ? 'user' : 'model',
        content: m.content,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: formattedHistory,
          userContext,
          language: lang,
        }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok || !data) {
        throw new Error(data?.error || data?.details || `Server returned ${res.status}`);
      }

      const replyText = data.reply || (lang === 'ar' ? 'عذراً، لم أتمكن من معالجة الرد حالياً.' : 'Unable to generate response.');

      const botMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err: any) {
      console.warn('Network link unavailable — engaging Local Autonomous Edge Engine:', err);
      // Generate rich local response from Local Context Engine (zero-network RAG)
      const localReply = generateLocalEngineResponse(query, lang);
      const fallbackMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: localReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Conversational space medicine and NASA emergency prompts
  const starterPrompts = lang === 'ar' ? [
    '🚨 بروتوكول طوارئ ناسا عند تسرب الأمونيا السامة في 60 ثانية',
    '🫀 كيف أنفذ الإنعاش القلبي الرئوي في انعدام الوزن (Zero-G CPR)؟',
    'حلل عجز النوم التراكمي في آخر 7 أيام وما تأثيره على تركيزي؟',
    'أشعر بضغط واحتقان في الوجه، كيف يرتبط بانزياح السوائل نحو الرأس؟',
    'لدي ألم خفيف أسفل الظهر، هل هذا بسبب تمدد العمود الفقري في الفضاء؟',
    'ما هي جرعات الأدوية الفضائية المعتمدة لعلاج آلام الأسنان والرضح الجوي؟',
  ] : [
    '🚨 NASA Emergency Protocol for Toxic Ammonia Leak in < 60 seconds',
    '🫀 How to execute Zero-G CPR with the Handstand Method',
    'Analyze my 7-day sleep debt and its impact on mission vigilance.',
    'I feel facial fullness and sinus pressure. Is this normal cephalad fluid shift?',
    'I have mild lower back stiffness. How does zero-G spine elongation cause this?',
    'What are the approved spaceflight drug dosages for barodontalgia and trauma?',
  ];

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="rounded-2xl p-5 bg-gradient-to-r from-[#101827] via-[#121D33] to-[#101827] border border-[#8B7CFF]/40 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#8B7CFF] to-[#36D9FF] flex items-center justify-center shadow-[0_0_25px_rgba(139,124,255,0.4)]">
                <Sparkles className="w-6 h-6 text-[#080B16]" />
              </div>
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-[#20E0A0] border-2 border-[#101827] rounded-full" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-display font-bold text-white tracking-wide">
                  ASTRA AI · Spaceflight Cognitive Twin
                </h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#36D9FF]/10 text-[#36D9FF] border border-[#36D9FF]/30">
                  GEMINI 3.8 FLASH
                </span>
              </div>
              <p className="text-xs text-slate-300 font-sans mt-0.5">
                {lang === 'ar' 
                  ? 'محادثات ذكية متقدمة مع وعي شامل بسجلاتك، وبيئة الجاذبية الصغرى، وطب الفضاء.'
                  : 'Advanced multi-turn dialogue grounded in your in-flight telemetry and NASA/ESA space medicine protocols.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              onClick={handleClearHistory}
              className="p-2 rounded-xl bg-[#080B16] border border-[#1E2D4A] hover:border-[#FF6577] text-slate-400 hover:text-[#FF6577] text-xs font-mono transition-colors flex items-center gap-1.5"
              title={lang === 'ar' ? 'بدء محادثة جديدة' : 'Reset chat'}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{lang === 'ar' ? 'محادثة جديدة' : 'New Chat'}</span>
            </button>
          </div>
        </div>

        {/* Live Context Telemetry Capsule */}
        <div className="mt-4 pt-3 border-t border-[#1E2D4A]/60 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-[#36D9FF] animate-pulse" />
            <span className="text-slate-300">ACTIVE TELEMETRY INGESTION:</span>
            <span className="text-[#36D9FF] font-semibold">Sleep {formatDuration(avgSleep)} avg</span>
            <span>·</span>
            <span className="text-[#20E0A0]">Stress {latestWellness?.stressRating || 2}/5</span>
            <span>·</span>
            <span className="text-[#8B7CFF]">RR {latestResp?.respiratoryRate || 16}/min</span>
          </div>
          <div className="text-[11px] text-slate-500">
            Encrypted End-to-End Mission Node
          </div>
        </div>

        {/* Local NASA Knowledge Base Offline Engine Badge */}
        <div className="mt-2.5 pt-2 border-t border-[#1E2D4A]/40 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono">
          <div className="flex items-center gap-1.5 text-[#20E0A0]">
            <Cpu className="w-3.5 h-3.5" />
            <span>{lang === 'ar' ? 'العقدة المحلية المستقلة نشطة · 18 بروتوكول طوارئ من ناسا مدمج بدون إنترنت (0ms Offline RAG)' : 'AUTONOMOUS EDGE NODE ACTIVE · 18 NASA PROTOCOLS LOADED (0ms OFFLINE RAG)'}</span>
          </div>
          <div className="text-slate-400">
            {lang === 'ar' ? 'استرجاع فوري من ذاكرة الجهاز' : 'Zero-network local fallback ready'}
          </div>
        </div>
      </div>

      {/* Starter Prompts */}
      <div>
        <div className="text-xs font-mono uppercase text-slate-400 mb-2 flex items-center gap-1.5">
          <Lightbulb className="w-3.5 h-3.5 text-[#FFBF69]" />
          <span>{lang === 'ar' ? 'مواضيع ونقاشات مقترحة لرواد الفضاء:' : 'Suggested Spaceflight Inquiries:'}</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {starterPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              className="p-3 rounded-xl bg-[#101827] border border-[#1E2D4A] hover:border-[#8B7CFF] text-left text-xs text-slate-300 hover:text-white transition-all flex items-center justify-between group shadow-sm hover:shadow-[0_0_15px_rgba(139,124,255,0.15)]"
            >
              <span className="line-clamp-2 leading-relaxed">{prompt}</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#8B7CFF] shrink-0 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
          ))}
        </div>
      </div>

      {/* ChatGPT-Style Chat Container */}
      <div className="rounded-2xl bg-[#101827] border border-[#1E2D4A] shadow-2xl flex flex-col min-h-[500px] h-[650px] relative overflow-hidden">
        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3 sm:gap-4 ${
                  isUser ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 shadow-md ${
                    isUser
                      ? 'bg-[#36D9FF]/20 border border-[#36D9FF]/40 text-[#36D9FF]'
                      : 'bg-gradient-to-br from-[#8B7CFF] to-[#36D9FF] text-[#080B16] font-bold'
                  }`}
                >
                  {isUser ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                </div>

                {/* Message Bubble */}
                <div
                  className={`relative group rounded-2xl p-4 sm:p-5 max-w-[85%] sm:max-w-2xl text-xs sm:text-sm font-sans leading-relaxed shadow-lg ${
                    isUser
                      ? 'bg-[#192742] border border-[#36D9FF]/30 text-white rounded-tr-none'
                      : 'bg-[#080B16] border border-[#1E2D4A] text-slate-200 rounded-tl-none'
                  }`}
                >
                  {/* Sender Header */}
                  <div className="flex items-center justify-between gap-3 mb-2 pb-1.5 border-b border-[#1E2D4A]/60 text-[10px] font-mono text-slate-400">
                    <span className="font-semibold text-slate-300">
                      {isUser ? 'Commander Chen' : 'ASTRA Cognitive Twin'}
                    </span>
                    <span className="tabular-nums">{msg.timestamp}</span>
                  </div>

                  {/* Message Content with Markdown Formatting */}
                  <div className="whitespace-pre-wrap space-y-2">
                    {msg.content.split('\n\n').map((paragraph, pIdx) => (
                      <p key={pIdx} className="leading-relaxed">
                        {paragraph.split('\n').map((line, lIdx) => {
                          // Bullet items
                          if (line.startsWith('• ') || line.startsWith('- ')) {
                            return (
                              <span key={lIdx} className="block pl-2 my-1 text-slate-200">
                                <span className="text-[#36D9FF] mr-1.5">▪</span>
                                {renderFormattedText(line.replace(/^[•-]\s*/, ''))}
                              </span>
                            );
                          }
                          // Numbered list
                          if (/^\d+\.\s/.test(line)) {
                            return (
                              <span key={lIdx} className="block pl-2 my-1 text-slate-200">
                                <span className="text-[#8B7CFF] font-mono font-semibold mr-1.5">
                                  {line.match(/^\d+\./)?.[0]}
                                </span>
                                {renderFormattedText(line.replace(/^\d+\.\s*/, ''))}
                              </span>
                            );
                          }
                          return (
                            <span key={lIdx} className="block">
                              {renderFormattedText(line)}
                            </span>
                          );
                        })}
                      </p>
                    ))}
                  </div>

                  {/* Actions Bar for Assistant Messages */}
                  {!isUser && (
                    <div className="mt-3 pt-2 border-t border-[#1E2D4A]/50 flex items-center gap-2 text-slate-400">
                      <button
                        onClick={() => handleCopy(msg.id, msg.content)}
                        className="p-1.5 rounded-lg hover:bg-[#121D33] hover:text-white transition-colors"
                        title="Copy Response"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3.5 h-3.5 text-[#20E0A0]" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        onClick={() => handleSpeak(msg.content)}
                        className="p-1.5 rounded-lg hover:bg-[#121D33] hover:text-[#36D9FF] transition-colors"
                        title={isSpeaking ? 'Stop Audio' : 'Listen with Audio'}
                      >
                        {isSpeaking ? (
                          <VolumeX className="w-3.5 h-3.5 text-[#FF6577]" />
                        ) : (
                          <Volume2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#8B7CFF] to-[#36D9FF] text-[#080B16] flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5 animate-spin" />
              </div>
              <div className="p-4 rounded-2xl bg-[#080B16] border border-[#1E2D4A] rounded-tl-none">
                <div className="flex items-center gap-2 text-xs font-mono text-[#8B7CFF]">
                  <span className="w-2 h-2 rounded-full bg-[#8B7CFF] animate-ping" />
                  <span>ASTRA is synthesizing flight data & spaceflight medicine protocols...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-[#080B16] border-t border-[#1E2D4A]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            {/* Voice Dictation Button */}
            <button
              type="button"
              onClick={handleToggleMic}
              className={`p-3 rounded-xl border transition-all shrink-0 ${
                isListening
                  ? 'bg-rose-500/20 border-rose-500 text-rose-400 animate-pulse'
                  : 'bg-[#121D33] border-[#1E2D4A] text-slate-400 hover:text-white'
              }`}
              title={isListening ? 'Listening...' : 'Dictate with Voice'}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Input Box */}
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={lang === 'ar' ? 'تحدث مع أسترا، اسأل عن أي شيء يتعلق بنومك أو تكيفك في الفضاء...' : 'Message ASTRA (e.g. analyze my fatigue trends or explain zero-G back pain)...'}
              className="flex-1 bg-[#101827] border border-[#1E2D4A] focus:border-[#8B7CFF] rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 font-sans focus:outline-none focus:ring-1 focus:ring-[#8B7CFF]"
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#8B7CFF] to-[#36D9FF] hover:opacity-95 disabled:opacity-40 text-[#080B16] font-bold text-xs font-mono uppercase tracking-wider transition-all flex items-center gap-1.5 shrink-0 shadow-[0_0_15px_rgba(139,124,255,0.3)] cursor-pointer"
            >
              <span className="hidden sm:inline">{lang === 'ar' ? 'إرسال' : 'Send'}</span>
              <Send className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-2 text-center text-[10px] font-mono text-slate-500">
            ASTRA Cognitive Twin provides evidence-based spaceflight wellness insights. Does not replace the terrestrial Flight Surgeon.
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper to render bold markdown (**text**)
function renderFormattedText(text: string): React.ReactNode {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} className="text-white font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

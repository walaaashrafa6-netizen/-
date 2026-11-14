import React, { useState, useRef, useEffect } from 'react';
import {
  SleepRecord,
  WellnessRecord,
  RespiratoryRecord,
  BodyMetricRecord,
  AstronautProfile,
  Language,
} from '../types';
import { formatDuration } from '../utils/storage';
import {
  Sparkles,
  Send,
  Bot,
  User,
  Lightbulb,
  Radio,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  RotateCcw,
  Copy,
  Check,
  ArrowRight,
  Cpu,
} from 'lucide-react';
import { generateLocalEngineResponse } from '../utils/localContextEngine';

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
  bodyMetrics?: BodyMetricRecord[];
  profile: AstronautProfile;
  initialPrompt?: string | null;
  onClearInitialPrompt?: () => void;
  lang: Language;
}

export const AssistantView: React.FC<AssistantViewProps> = ({
  sleepRecords,
  wellnessRecords,
  respiratoryRecords,
  bodyMetrics = [],
  profile,
  initialPrompt,
  onClearInitialPrompt,
  lang,
}) => {
  const isAr = lang === 'ar';
  const callsign = profile.callsign || (isAr ? 'رائد الفضاء' : 'Astronaut');

  const latestSleep = sleepRecords[sleepRecords.length - 1] || null;
  const latestWellness = wellnessRecords[wellnessRecords.length - 1] || null;
  const latestResp = respiratoryRecords[respiratoryRecords.length - 1] || null;
  const latestBody = bodyMetrics[0] || null;

  const avgSleepMinutes =
    sleepRecords.length > 0
      ? Math.round(sleepRecords.reduce((a, b) => a + b.durationMinutes, 0) / sleepRecords.length)
      : null;

  const getInitialMessages = (): ChatMessage[] => [
    {
      id: 'msg-welcome',
      role: 'assistant',
      content: isAr
        ? `مرحباً بك يا **${callsign}**. أنا ASTRA — المساعد الذكي للرحلة الفضائية (**${profile.missionName}** · اليوم **${profile.missionDay}**).\n\n**حالة السجلات المسجلة حالياً:**\n• **النوم**: ${avgSleepMinutes !== null ? `متوسط ${formatDuration(avgSleepMinutes)} (${sleepRecords.length} سجل)` : 'لا توجد سجلات نوم مسجلة بعد.'}\n• **الحالة النفسية**: ${latestWellness ? `المزاج ${latestWellness.moodRating}/5 · التوتر ${latestWellness.stressRating}/5 · الطاقة ${latestWellness.energyRating}/5` : 'لا توجد تقييمات مسجلة بعد.'}\n• **معدل التنفس**: ${latestResp ? `${latestResp.respiratoryRate} نفس/دقيقة` : 'غير مسجل بعد.'}\n\nاسألني بالعربية أو الإنجليزية عن أي موضوع صحي أو هندسي في الفضاء!`
        : `Welcome, **${callsign}**. I am ASTRA — your spaceflight wellness and cognitive companion (**${profile.missionName}** · Flight Day **${profile.missionDay}**).\n\n**Currently Logged Telemetry:**\n• **Sleep**: ${avgSleepMinutes !== null ? `Average ${formatDuration(avgSleepMinutes)} (${sleepRecords.length} logs)` : 'No sleep records logged yet.'}\n• **Wellness**: ${latestWellness ? `Mood ${latestWellness.moodRating}/5 · Stress ${latestWellness.stressRating}/5 · Energy ${latestWellness.energyRating}/5` : 'No wellness check-ins logged yet.'}\n• **Respiration**: ${latestResp ? `${latestResp.respiratoryRate} breaths/min` : 'Not logged yet.'}\n\nAsk me anything in Arabic or English!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ];

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('astra_chat_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return getInitialMessages();
  });

  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const consumedInitialRef = useRef<string | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    try {
      localStorage.setItem('astra_chat_history', JSON.stringify(messages));
    } catch {}
  }, [messages]);

  const handleSpeak = (text: string) => {
    if ('speechSynthesis' in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        return;
      }
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text.replace(/[*#_`]/g, ''));
      utterance.lang = /[\u0600-\u06FF]/.test(text) ? 'ar-SA' : 'en-US';
      utterance.rate = 1.0;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleToggleMic = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceNotice(
        isAr
          ? 'خاصية التعرف على الصوت غير مدعومة في هذا المتصفح.'
          : 'Speech recognition is not supported in this browser.'
      );
      setTimeout(() => setVoiceNotice(null), 3500);
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = isAr ? 'ar-EG' : 'en-US';
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
    } catch {
      setIsListening(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearHistory = () => {
    const initial = getInitialMessages();
    setMessages(initial);
    localStorage.setItem('astra_chat_history', JSON.stringify(initial));
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const responseLang: Language = /[\u0600-\u06FF]/.test(query) ? 'ar' : /[a-zA-Z]/.test(query) ? 'en' : lang;

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
      const userContext = {
        callsign: profile.callsign,
        missionName: profile.missionName,
        missionDay: profile.missionDay,
        hasSleepData: sleepRecords.length > 0,
        sleepCount: sleepRecords.length,
        latestSleepDuration: latestSleep ? formatDuration(latestSleep.durationMinutes) : null,
        avgSleep: avgSleepMinutes !== null ? formatDuration(avgSleepMinutes) : null,
        hasWellnessData: wellnessRecords.length > 0,
        latestMood: latestWellness?.moodRating ?? null,
        latestStress: latestWellness?.stressRating ?? null,
        latestEnergy: latestWellness?.energyRating ?? null,
        hasRespData: respiratoryRecords.length > 0,
        latestResp: latestResp?.respiratoryRate ?? null,
        hasBodyMetrics: bodyMetrics.length > 0,
        latestHeartRate: latestBody?.heartRateBpm ?? null,
        latestBpSys: latestBody?.bloodPressureSys ?? null,
        latestBpDia: latestBody?.bloodPressureDia ?? null,
        latestSpO2: latestBody?.spO2Percent ?? null,
        loggedSymptoms: latestWellness?.symptoms || [],
        sleepDisturbances: latestSleep?.disturbances || [],
      };

      const userTurnIdx = newMessages.findIndex((m) => m.role === 'user');
      const validHistory = userTurnIdx >= 0 ? newMessages.slice(userTurnIdx) : newMessages;

      const formattedHistory = validHistory.slice(-12).map((m) => ({
        role: m.role === 'user' ? 'user' : 'model',
        content: m.content,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: formattedHistory,
          userContext,
          language: responseLang,
        }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok || !data) {
        throw new Error(data?.error || `Server returned ${res.status}`);
      }

      const replyText =
        data.reply || (responseLang === 'ar' ? 'تعذر توليد الرد حالياً.' : 'Unable to generate response.');

      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch {
      const localReply = generateLocalEngineResponse(query, responseLang);
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: localReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialPrompt && initialPrompt.trim() && consumedInitialRef.current !== initialPrompt) {
      consumedInitialRef.current = initialPrompt;
      handleSendMessage(initialPrompt);
      onClearInitialPrompt?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPrompt]);

  const starterPrompts = isAr
    ? [
        'لخص وضع بياناتي الصحية المسجلة حالياً',
        'بروتوكول طوارئ ناسا عند تسرب الأمونيا السامة',
        'أشعر باحتقان في الوجه، كيف يرتبط بانزياح السوائل؟',
        'لدي ألم خفيف أسفل الظهر، ما سببه في انعدام الوزن؟',
      ]
    : [
        'Summarize my currently logged health telemetry',
        'NASA Emergency Protocol for Toxic Ammonia Leak',
        'I feel facial fullness. Is this normal cephalad fluid shift?',
        'How does zero-G spine elongation cause lower back ache?',
      ];

  return (
    <div className="space-y-5 pb-12 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="rounded-2xl p-5 bg-[#0C1B2B] border border-[#162E48] shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#173B60] border border-[#42C8F5]/40 flex items-center justify-center text-[#42C8F5]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold text-white tracking-wide">
                ASTRA AI · {callsign}
              </h1>
              <p className="text-xs text-[#A9B8C8] font-sans mt-0.5">
                {isAr
                  ? 'محادثات ثنائية اللغة مبنية على قياساتك الفعلية ومعايير ناسا الفضائية.'
                  : 'Bilingual spaceflight assistant grounded in your logged telemetry and NASA references.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClearHistory}
            className="px-3 py-2 rounded-xl bg-[#07111F] border border-[#162E48] hover:border-[#42C8F5]/50 text-[#A9B8C8] hover:text-white text-xs font-mono transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isAr ? 'محادثة جديدة' : 'New Chat'}</span>
          </button>
        </div>

        {/* Truthful Telemetry Line */}
        <div className="mt-4 pt-3 border-t border-[#162E48] flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-[#A9B8C8]">
          <div className="flex items-center gap-2 flex-wrap">
            <Radio className="w-3.5 h-3.5 text-[#42C8F5]" />
            <span>
              {avgSleepMinutes !== null
                ? `${isAr ? 'النوم:' : 'Sleep:'} ${formatDuration(avgSleepMinutes)}`
                : isAr
                ? 'النوم: غير مسجل'
                : 'Sleep: Not logged'}
            </span>
            <span>·</span>
            <span>
              {latestWellness
                ? `${isAr ? 'التوتر:' : 'Stress:'} ${latestWellness.stressRating}/5`
                : isAr
                ? 'الرفاهية: غير مسجلة'
                : 'Wellness: Not logged'}
            </span>
            <span>·</span>
            <span>
              {latestResp
                ? `${isAr ? 'التنفس:' : 'RR:'} ${latestResp.respiratoryRate}/min`
                : isAr
                ? 'التنفس: غير مسجل'
                : 'RR: Not logged'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[#35C98A] text-[11px]">
            <Cpu className="w-3.5 h-3.5" />
            <span>{isAr ? 'حماية محلية نشطة' : 'Autonomous Fallback Ready'}</span>
          </div>
        </div>
      </div>

      {/* Starter Prompts */}
      <div>
        <div className="text-xs font-mono text-[#A9B8C8] mb-2 flex items-center gap-1.5">
          <Lightbulb className="w-3.5 h-3.5 text-[#F2B84B]" />
          <span>{isAr ? 'استفسارات مقترحة:' : 'Suggested Inquiries:'}</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {starterPrompts.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(prompt)}
              className="p-3 rounded-xl bg-[#0C1B2B] border border-[#162E48] hover:border-[#42C8F5]/50 text-start text-xs text-slate-300 hover:text-white transition-all flex items-center justify-between group cursor-pointer"
            >
              <span className="line-clamp-2 leading-relaxed">{prompt}</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#42C8F5] shrink-0 ms-2" />
            </button>
          ))}
        </div>
      </div>

      {/* Chat Container */}
      <div className="rounded-2xl bg-[#0C1B2B] border border-[#162E48] shadow-2xl flex flex-col min-h-[500px] h-[620px] overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            const msgIsAr = /[\u0600-\u06FF]/.test(msg.content);
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    isUser
                      ? 'bg-[#173B60] border border-[#42C8F5]/40 text-[#42C8F5]'
                      : 'bg-[#07111F] border border-[#162E48] text-[#42C8F5]'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div
                  dir={msgIsAr ? 'rtl' : 'ltr'}
                  className={`rounded-2xl p-4 max-w-[85%] text-xs sm:text-sm font-sans leading-relaxed ${
                    isUser
                      ? 'bg-[#173B60] border border-[#42C8F5]/30 text-white'
                      : 'bg-[#07111F] border border-[#162E48] text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 mb-2 pb-1.5 border-b border-white/10 text-[10px] font-mono text-[#A9B8C8]">
                    <span className="font-semibold text-white">{isUser ? callsign : 'ASTRA AI'}</span>
                    <span>{msg.timestamp}</span>
                  </div>

                  <div className="whitespace-pre-wrap space-y-2">
                    {msg.content.split('\n\n').map((paragraph, pIdx) => (
                      <p key={pIdx} className="leading-relaxed">
                        {paragraph.split('\n').map((line, lIdx) => {
                          if (line.startsWith('• ') || line.startsWith('- ')) {
                            return (
                              <span key={lIdx} className="block ps-2 my-1">
                                <span className="text-[#42C8F5] me-1.5">•</span>
                                {renderFormattedText(line.replace(/^[•-]\s*/, ''))}
                              </span>
                            );
                          }
                          if (/^\d+\.\s/.test(line)) {
                            return (
                              <span key={lIdx} className="block ps-2 my-1">
                                <span className="text-[#42C8F5] font-mono font-semibold me-1.5">
                                  {line.match(/^\d+\./)?.[0]}
                                </span>
                                {renderFormattedText(line.replace(/^\d+\.\s*/, ''))}
                              </span>
                            );
                          }
                          return (
                            <span key={lIdx} className="block">
                              {renderFormattedText(line.replace(/^#{1,4}\s*/, ''))}
                            </span>
                          );
                        })}
                      </p>
                    ))}
                  </div>

                  {!isUser && (
                    <div className="mt-3 pt-2 border-t border-[#162E48] flex items-center gap-2 text-slate-400">
                      <button
                        type="button"
                        onClick={() => handleCopy(msg.id, msg.content)}
                        className="p-1 rounded hover:text-white transition-colors cursor-pointer"
                        title="Copy"
                      >
                        {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-[#35C98A]" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSpeak(msg.content)}
                        className="p-1 rounded hover:text-[#42C8F5] transition-colors cursor-pointer"
                        title={isSpeaking ? 'Stop Audio' : 'Listen'}
                      >
                        {isSpeaking ? <VolumeX className="w-3.5 h-3.5 text-[#E85D65]" /> : <Volume2 className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#07111F] border border-[#162E48] text-[#42C8F5] flex items-center justify-center">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="p-3 rounded-2xl bg-[#07111F] border border-[#162E48] text-xs font-mono text-[#A9B8C8]">
                {isAr ? 'جاري تحليل الاستفسار...' : 'Synthesizing response...'}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-[#07111F] border-t border-[#162E48]">
          {voiceNotice && <div className="text-[11px] font-mono text-[#F2B84B] mb-2">{voiceNotice}</div>}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <button
              type="button"
              onClick={handleToggleMic}
              className={`p-3 rounded-xl border transition-all shrink-0 cursor-pointer ${
                isListening
                  ? 'bg-rose-500/20 border-rose-500 text-rose-400'
                  : 'bg-[#0C1B2B] border-[#162E48] text-slate-400 hover:text-white'
              }`}
              title="Voice Dictation"
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isAr ? 'تحدث مع ASTRA بالعربية أو الإنجليزية...' : 'Message ASTRA in English or Arabic...'}
              className="flex-1 bg-[#0C1B2B] border border-[#162E48] focus:border-[#42C8F5] rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 font-sans focus:outline-none"
            />

            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="px-5 py-3 rounded-xl bg-[#42C8F5] hover:brightness-110 disabled:opacity-40 text-[#07111F] font-bold text-xs font-mono uppercase tracking-wider transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <span className="hidden sm:inline">{isAr ? 'إرسال' : 'Send'}</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

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

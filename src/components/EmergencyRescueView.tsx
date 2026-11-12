import React, { useState, useEffect } from 'react';
import { Language, NASAEmergencyProtocol } from '../types';
import { TRANSLATIONS } from '../utils/translations';
import { NASA_EMERGENCY_PROTOCOLS, CURRENT_EDGE_NODE_STATUS } from '../data/nasaEmergencyProtocols';
import { searchLocalKnowledgeBase, generateLocalEngineResponse } from '../utils/localContextEngine';
import { 
  ShieldAlert, 
  AlertTriangle, 
  Flame, 
  Radio, 
  Volume2, 
  VolumeX, 
  Play, 
  Square, 
  Search, 
  CheckCircle2, 
  Clock, 
  Database, 
  Cpu, 
  LifeBuoy, 
  FileText,
  Activity,
  HeartPulse,
  Eye,
  Bone,
  Wind,
  Zap,
  ArrowRight,
  Bot,
  Sparkles,
  HelpCircle,
  Pill,
  Wrench,
  Send,
  RotateCcw
} from 'lucide-react';

interface EmergencyRescueViewProps {
  lang: Language;
}

export const EmergencyRescueView: React.FC<EmergencyRescueViewProps> = ({ lang }) => {
  const t = TRANSLATIONS[lang];

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeProtocol, setActiveProtocol] = useState<NASAEmergencyProtocol | null>(null);

  // View modes
  const [simplifiedMode, setSimplifiedMode] = useState<boolean>(true); // Plain-language for non-medical crew
  const [activeTab, setActiveTab] = useState<'checklist' | 'dosages' | 'troubleshooting' | 'source'>('checklist');

  // Emergency Triage Cockpit State
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [timerRunning, setTimerRunning] = useState<boolean>(false);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isVoiceActive, setIsVoiceActive] = useState<boolean>(false);

  // In-Cockpit ASTRA Emergency AI Co-Pilot State
  const [aiQuestion, setAiQuestion] = useState<string>('');
  const [aiConversation, setAiConversation] = useState<Array<{ sender: 'user' | 'astra'; text: string }>>([
    {
      sender: 'astra',
      text: lang === 'ar'
        ? 'أنا رفيق أسترا للطوارئ (ASTRA Emergency Co-Pilot) متصل بالعقدة المحلية بدون إنترنت. إذا كنت في موقف خطر أو لم تفهم مصطلحاً طبياً، اسألني فوراً وسأشرح لك خطوة بخطوة بلغة واضحة ماذا تفعل لإنقاذ نفسك أو زميلك.'
        : 'I am your ASTRA Emergency Co-Pilot, running fully offline on this autonomous edge node. If you are in a crisis or unsure of any medical procedure, ask me directly and I will guide you step-by-step in plain language.'
    }
  ]);

  // Categories list covering all 18 NASA emergency flight domains
  const categories = [
    { id: 'all', label: lang === 'ar' ? 'جميع البروتوكولات (18)' : 'All Protocols (18)' },
    { id: 'toxic_ammonia', label: lang === 'ar' ? 'تسرب الأمونيا' : 'Toxic Ammonia' },
    { id: 'decompression', label: lang === 'ar' ? 'تخفيف الضغط' : 'Decompression' },
    { id: 'cpr_cardiac', label: lang === 'ar' ? 'إنعاش قلبي Zero-G' : 'Zero-G CPR' },
    { id: 'fire_smoke', label: lang === 'ar' ? 'حرائق المقصورة' : 'Cabin Fire' },
    { id: 'eva_suit', label: lang === 'ar' ? 'طوارئ بدلة الفضاء' : 'EVA Spacesuit' },
    { id: 'radiation_spe', label: lang === 'ar' ? 'عاصفة إشعاعية' : 'Radiation Storm' },
    { id: 'hypoxia_co2', label: lang === 'ar' ? 'تسمم ثاني أكسيد الكربون' : 'CO₂ Toxicity' },
    { id: 'eye_trauma', label: lang === 'ar' ? 'شظايا العين' : 'Eye Trauma' },
    { id: 'pneumothorax', label: lang === 'ar' ? 'استرواح الصدر بالإبرة' : 'Thoracostomy' },
    { id: 'appendicitis', label: lang === 'ar' ? 'الزائدة الدودية بالفضاء' : 'Appendicitis' },
    { id: 'hydrazine_tox', label: lang === 'ar' ? 'تسمم الهيدرازين' : 'Hydrazine Tox' },
    { id: 'fracture', label: lang === 'ar' ? 'كسور العظام' : 'Bone Fractures' },
    { id: 'behavioral_psy', label: lang === 'ar' ? 'الأزمات النفسية والهلع' : 'Behavioral Panic' },
    { id: 'burns_electrical', label: lang === 'ar' ? 'حروق الصعق والحرارة' : 'Zero-G Burns' },
    { id: 'dental_pulpitis', label: lang === 'ar' ? 'عصب الأسنان المداري' : 'Dental Emergency' },
    { id: 'urinary_retention', label: lang === 'ar' ? 'احتباس البول والقسطرة' : 'Urinary Retention' },
    { id: 'water_contamination', label: lang === 'ar' ? 'تلوث مياه الشرب' : 'Water Contamination' },
    { id: 'sans_neuro', label: lang === 'ar' ? 'ضغط الجمجمة والـ SANS' : 'SANS Syndrome' },
  ];

  // Filter protocols via local search engine
  const searchResults = searchLocalKnowledgeBase(searchQuery, lang);
  const filteredProtocols = searchResults
    .map((r) => r.protocol)
    .filter((p) => selectedCategory === 'all' || p.category === selectedCategory);

  // Countdown timer for emergency action
  useEffect(() => {
    let interval: any = null;
    if (timerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0 && timerRunning) {
      setTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [timerRunning, timerSeconds]);

  // Voice alarm & instructions
  const speakEmergencyInstructions = (text: string) => {
    if ('speechSynthesis' in window) {
      if (isVoiceActive) {
        window.speechSynthesis.cancel();
        setIsVoiceActive(false);
        return;
      }
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === 'ar' ? 'ar-SA' : 'en-US';
      utterance.rate = 1.05;
      utterance.onend = () => setIsVoiceActive(false);
      utterance.onerror = () => setIsVoiceActive(false);
      setIsVoiceActive(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  const startEmergencyProtocol = (protocol: NASAEmergencyProtocol) => {
    setActiveProtocol(protocol);
    setCompletedSteps([]);
    setActiveTab('checklist');
    if (protocol.immediateActionTimerSeconds) {
      setTimerSeconds(protocol.immediateActionTimerSeconds);
      setTimerRunning(true);
    }
    // Speak first action immediately
    const firstActionText = lang === 'ar' 
      ? `تنبيه طوارئ ناسا: ${protocol.titleAr}. الإجراء الفوري الأول: ${protocol.immediateActionsAr[0]}`
      : `NASA Emergency Alert: ${protocol.title}. Immediate action: ${protocol.immediateActions[0]}`;
    speakEmergencyInstructions(firstActionText);
  };

  const toggleStep = (stepNumber: number) => {
    setCompletedSteps((prev) =>
      prev.includes(stepNumber) ? prev.filter((s) => s !== stepNumber) : [...prev, stepNumber]
    );
  };

  // Handle in-cockpit ASTRA AI Question
  const handleAskAstra = (presetQuery?: string) => {
    const q = presetQuery || aiQuestion;
    if (!q.trim()) return;

    const userMessage = { sender: 'user' as const, text: q };
    // Generate immediate offline response from Local Context Engine (0ms)
    const replyText = generateLocalEngineResponse(q, lang);
    const astraMessage = { sender: 'astra' as const, text: replyText };

    setAiConversation((prev) => [...prev, userMessage, astraMessage]);
    setAiQuestion('');

    // If matches a protocol, optionally suggest opening it
    const matches = searchLocalKnowledgeBase(q, lang);
    if (matches.length > 0 && matches[0].relevanceScore >= 35 && !activeProtocol) {
      setActiveProtocol(matches[0].protocol);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Autonomous Deep-Space Edge Node Status Banner */}
      <div className="glass-panel-glow rounded-3xl p-6 relative overflow-hidden border border-[#36D9FF]/40 shadow-[0_0_30px_rgba(54,217,255,0.15)]">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FF6577] via-[#8B7CFF] to-[#36D9FF] p-0.5 flex items-center justify-center shadow-[0_0_20px_rgba(255,101,119,0.3)] shrink-0">
              <div className="w-full h-full bg-[#080B16] rounded-[14px] flex items-center justify-center">
                <Cpu className="w-6 h-6 text-[#36D9FF]" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full bg-[#20E0A0]/20 text-[#20E0A0] border border-[#20E0A0]/40 text-xs font-mono font-bold tracking-wider animate-pulse flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#20E0A0]" />
                  {lang === 'ar' ? 'العقدة الفضائية المستقلة: نشطة محلياً' : 'AUTONOMOUS EDGE NODE: ONLINE'}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#8B7CFF]/20 text-[#8B7CFF] border border-[#8B7CFF]/40 text-xs font-mono">
                  {lang === 'ar' ? 'تأخير الاتصال بالأرض: 22.4 دقيقة (الاتجاه الواحد)' : 'ONE-WAY EARTH LATENCY: 22.4 MIN'}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-display font-bold text-white mt-1.5">
                {lang === 'ar' ? 'غرفة عمليات طوارئ وإنقاذ ناسا المدارية (NASA SOS Triage Cockpit)' : 'NASA Deep-Space Emergency SOS & Rescue Cockpit'}
              </h2>
              <p className="text-xs text-slate-300 font-sans mt-1 max-w-2xl leading-relaxed">
                {lang === 'ar'
                  ? 'بسبب بعد المسافة عن الأرض، يعمل جهازك كسيرفر محلي متكامل يحمل 18 بروتوكول إنقاذ رسمي من ناسا، مع محرك ذكاء اصطناعي محلي فوري (0ms) يقدم الدليل المبسط، وجدول جرعات الأدوية الفضائية، واستكشاف الأخطاء والبدائل الميدانية.'
                  : 'Due to deep-space speed-of-light delays, this device operates as an autonomous edge server pre-loaded with 18 official NASA flight emergency protocols, offering 0ms offline AI guidance, drug dosages, and field troubleshooting.'}
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3 w-full lg:w-auto justify-end border-t lg:border-t-0 border-[#1E2D4A] pt-3 lg:pt-0">
            <div className="px-3 py-2 rounded-xl bg-[#101827] border border-[#1E2D4A] text-right">
              <div className="text-[10px] text-slate-400 font-mono">{lang === 'ar' ? 'قاعدة بيانات ناسا' : 'NASA Protocols'}</div>
              <div className="text-sm font-bold text-[#36D9FF] font-mono">18 {lang === 'ar' ? 'بروتوكولاً معتمداً' : 'Flight Rules'}</div>
            </div>
            <div className="px-3 py-2 rounded-xl bg-[#101827] border border-[#1E2D4A] text-right">
              <div className="text-[10px] text-slate-400 font-mono">{lang === 'ar' ? 'سرعة الاستجابة' : 'Inference Latency'}</div>
              <div className="text-sm font-bold text-[#20E0A0] font-mono">0 ms (Offline)</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Embedded ASTRA Emergency AI Co-Pilot (غرفة استشارة أسترا الذكية للطوارئ) */}
      <div className="glass-panel rounded-3xl p-5 border border-[#8B7CFF]/40 shadow-[0_0_25px_rgba(139,124,255,0.15)] bg-gradient-to-b from-[#101827] via-[#121629] to-[#080B16]">
        <div className="flex items-center justify-between pb-3 border-b border-[#1E2D4A]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#8B7CFF]/20 border border-[#8B7CFF]/50 flex items-center justify-center text-[#8B7CFF] shadow-[0_0_15px_rgba(139,124,255,0.3)]">
              <Bot className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-display font-bold text-white">
                  {lang === 'ar' ? 'مساعد أسترا التفاعلي لغرفة الطوارئ (Emergency Co-Pilot)' : 'ASTRA Emergency AI Co-Pilot'}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#20E0A0]/15 text-[#20E0A0] border border-[#20E0A0]/30 text-[10px] font-mono">
                  {lang === 'ar' ? 'محرك محلي فوري 0ms' : '0ms Local Engine'}
                </span>
              </div>
              <div className="text-[11px] text-slate-400">
                {lang === 'ar' ? 'اشرح لي فوراً إذا لم تفهم الخطوات الطبية، أو احسب جرعة دواء، أو اسأل عن أي عارض مفاجئ' : 'Ask for simplified plain-language guidance, emergency drug dosages, or troubleshooting'}
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              const lastReply = aiConversation[aiConversation.length - 1]?.text;
              if (lastReply) speakEmergencyInstructions(lastReply);
            }}
            className={`p-2 rounded-xl border text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
              isVoiceActive
                ? 'bg-[#FF6577]/20 border-[#FF6577] text-[#FF6577] animate-pulse'
                : 'bg-[#121D33] border-[#1E2D4A] text-slate-300 hover:text-white'
            }`}
            title={lang === 'ar' ? 'قراءة التوجيهات صوتياً للمسعف' : 'Read guidance aloud'}
          >
            {isVoiceActive ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span className="hidden sm:inline">{lang === 'ar' ? 'توجيه صوتي' : 'Voice Guide'}</span>
          </button>
        </div>

        {/* Quick Triage Buttons for High-Stress Moments */}
        <div className="flex items-center gap-2 py-3 overflow-x-auto no-scrollbar">
          {[
            {
              id: 'simple',
              label: lang === 'ar' ? '🆘 أنا لست طبيباً: اشرح لي فوراً بالعامية ماذا أفعل؟' : '🆘 Plain English: What should I do right now?',
              query: lang === 'ar' ? 'أنا لست طبيباً: اشرح لي فوراً ماذا أفعل في الطوارئ بلغة بسيطة وسهلة جداً خطوة بخطوة' : 'I am not a doctor: explain what to do right now in simple steps'
            },
            {
              id: 'nh3',
              label: lang === 'ar' ? '⚠️ شممت رائحة نفاذة / تسرب أمونيا' : '⚠️ Smelling pungent ammonia leak',
              query: lang === 'ar' ? 'شممت رائحة نفاذة وأمونيا في الكابينة ماذا أفعل في 60 ثانية؟' : 'Toxic ammonia leak detected what are the first 60 seconds actions?'
            },
            {
              id: 'cpr',
              label: lang === 'ar' ? '🫀 زميلي فاقد الوعي ولا يوجد نبض' : '🫀 Unresponsive crewmember / No pulse',
              query: lang === 'ar' ? 'زميلي مغمى عليه ولا يتنفس كيف أعمل إنعاش قلبي في انعدام الوزن؟' : 'Crewmember unresponsive zero-G CPR handstand method'
            },
            {
              id: 'eye',
              label: lang === 'ar' ? '👁️ جسم غريب طافي في العين' : '👁️ Foreign debris in eye',
              query: lang === 'ar' ? 'دخل غبار أو جسم غريب في عيني في الفضاء كيف أغسلها دون تناثر الماء؟' : 'Corneal foreign body zero gravity eye flush protocol'
            },
            {
              id: 'depress',
              label: lang === 'ar' ? '📉 هبوط سريع في ضغط الكابينة' : '📉 Rapid cabin pressure drop',
              query: lang === 'ar' ? 'مؤشر ضغط الكابينة يهبط بسرعة ماذا نفعل لمنع انفجار فقاعات النيتروجين؟' : 'Cabin decompression nitrogen bends prevention'
            }
          ].map((chip) => (
            <button
              key={chip.id}
              onClick={() => handleAskAstra(chip.query)}
              className="px-3 py-1.5 rounded-full bg-[#121D33] border border-[#1E2D4A] hover:border-[#8B7CFF]/60 text-slate-300 hover:text-white text-xs font-sans whitespace-nowrap transition-all shrink-0 cursor-pointer active:scale-95"
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Conversation Box */}
        <div className="max-h-56 overflow-y-auto space-y-3 p-3 rounded-2xl bg-[#080B16]/80 border border-[#1E2D4A] font-sans text-xs">
          {aiConversation.slice(-4).map((msg, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-2xl ${
                msg.sender === 'user'
                  ? 'bg-[#1E2D4A]/50 text-[#36D9FF] text-right font-semibold ml-auto max-w-[85%]'
                  : 'bg-[#101827] text-slate-200 border border-[#8B7CFF]/20 leading-relaxed shadow-sm'
              }`}
            >
              <div className="font-mono text-[10px] text-slate-400 mb-1 flex items-center gap-1.5">
                {msg.sender === 'user' ? (
                  <span>👤 {lang === 'ar' ? 'أنت (رائد الفضاء)' : 'You (Astronaut)'}</span>
                ) : (
                  <span className="text-[#8B7CFF] flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>ASTRA Local Node Response</span>
                  </span>
                )}
              </div>
              <div className="whitespace-pre-line">{msg.text}</div>
            </div>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAskAstra();
          }}
          className="mt-3 flex items-center gap-2"
        >
          <input
            type="text"
            value={aiQuestion}
            onChange={(e) => setAiQuestion(e.target.value)}
            placeholder={
              lang === 'ar'
                ? 'اسأل أسترا فوراً: "مش فاهم أعمل إيه"، "جرعة الدواء"، "ماذا لو تعطل القناع؟"...'
                : 'Ask ASTRA: "Explain simply", "Drug dosages", "What if mask fails?", "Symptom check"...'
            }
            className="flex-1 bg-[#080B16] border border-[#1E2D4A] focus:border-[#8B7CFF] rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#8B7CFF]"
          />
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#8B7CFF] to-[#36D9FF] text-[#080B16] font-bold text-xs font-mono flex items-center gap-1.5 hover:opacity-95 transition-all cursor-pointer shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{lang === 'ar' ? 'استشارة العقدة' : 'Ask Local Node'}</span>
          </button>
        </form>
      </div>

      {/* 3. Active Emergency Cockpit (عند تشغيل بروتوكول طوارئ محدد) */}
      {activeProtocol && (
        <div className="glass-panel-glow rounded-3xl p-6 border-2 border-[#FF6577] bg-gradient-to-b from-[#1a0f1d] via-[#101827] to-[#080B16] shadow-[0_0_40px_rgba(255,101,119,0.3)] animate-in fade-in duration-300">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-[#FF6577]/30">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-[#FF6577] text-[#080B16] font-mono text-xs font-bold animate-pulse">
                  🚨 {lang === 'ar' ? 'بروتوكول طوارئ نشط الآن' : 'ACTIVE EMERGENCY COCKPIT'}
                </span>
                <span className="text-xs font-mono text-[#36D9FF]">{activeProtocol.code}</span>
              </div>
              <h3 className="text-2xl font-display font-bold text-white mt-1">
                {lang === 'ar' ? activeProtocol.titleAr : activeProtocol.title}
              </h3>
            </div>

            {/* Countdown Timer & Voice Control */}
            <div className="flex items-center gap-3">
              {activeProtocol.immediateActionTimerSeconds && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#080B16] border border-[#FF6577]/60 text-white font-mono shadow-[0_0_15px_rgba(255,101,119,0.2)]">
                  <Clock className="w-5 h-5 text-[#FF6577] animate-spin" />
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400">{lang === 'ar' ? 'النافذة الزمنية للإنقاذ' : 'Action Window'}</div>
                    <div className="text-lg font-bold text-[#FF6577] tabular-nums">
                      {Math.floor(timerSeconds / 60)}:{(timerSeconds % 60).toString().padStart(2, '0')}
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={() =>
                  speakEmergencyInstructions(
                    lang === 'ar'
                      ? `${activeProtocol.titleAr}. ${simplifiedMode ? activeProtocol.simplifiedExplanationAr : activeProtocol.immediateActionsAr.join('. ')}`
                      : `${activeProtocol.title}. ${simplifiedMode ? activeProtocol.simplifiedExplanationEn : activeProtocol.immediateActions.join('. ')}`
                  )
                }
                className={`p-3 rounded-2xl border text-sm font-mono flex items-center gap-2 transition-all cursor-pointer ${
                  isVoiceActive
                    ? 'bg-[#FF6577] text-[#080B16] border-[#FF6577] font-bold shadow-[0_0_20px_rgba(255,101,119,0.5)]'
                    : 'bg-[#101827] border-[#1E2D4A] text-white hover:border-[#36D9FF]'
                }`}
              >
                {isVoiceActive ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                <span className="hidden sm:inline">{isVoiceActive ? (lang === 'ar' ? 'إيقاف الصوت' : 'Mute') : (lang === 'ar' ? 'قراءة الخطوات بصوت عالٍ' : 'Read Steps Aloud')}</span>
              </button>

              <button
                onClick={() => {
                  setActiveProtocol(null);
                  setTimerRunning(false);
                  if (isVoiceActive && 'speechSynthesis' in window) window.speechSynthesis.cancel();
                }}
                className="p-3 rounded-2xl bg-[#121D33] border border-[#1E2D4A] text-slate-300 hover:text-white text-xs font-mono cursor-pointer"
              >
                {lang === 'ar' ? 'إنهاء الطوارئ' : 'Close'}
              </button>
            </div>
          </div>

          {/* Mode Switcher: Simplified Guide (لغير المتخصصين) vs Full NASA Flight Rules */}
          <div className="flex flex-wrap items-center justify-between gap-3 my-4 p-3 rounded-2xl bg-[#080B16]/90 border border-[#1E2D4A]">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-300">
                {lang === 'ar' ? 'وضع العرض:' : 'Viewing Mode:'}
              </span>
              <button
                onClick={() => setSimplifiedMode(true)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                  simplifiedMode
                    ? 'bg-gradient-to-r from-[#20E0A0] to-[#36D9FF] text-[#080B16] font-bold shadow-[0_0_15px_rgba(32,224,160,0.3)]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                💡 {lang === 'ar' ? 'الدليل الميداني المبسط (لمن لم يفهم)' : 'Simplified Field Guide'}
              </button>
              <button
                onClick={() => setSimplifiedMode(false)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                  !simplifiedMode
                    ? 'bg-gradient-to-r from-[#8B7CFF] to-[#36D9FF] text-[#080B16] font-bold shadow-[0_0_15px_rgba(139,124,255,0.3)]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                🔬 {lang === 'ar' ? 'بروتوكول ناسا الطبي المتقدم' : 'NASA Advanced Medical Rules'}
              </button>
            </div>

            {/* Sub-tabs: Checklist vs Dosages vs Troubleshooting */}
            <div className="flex items-center gap-1.5">
              {[
                { id: 'checklist', label: lang === 'ar' ? 'خطوات التنفيذ' : 'Checklist' },
                { id: 'dosages', label: lang === 'ar' ? 'جرعات الأدوية الفضائية' : 'Spaceflight Dosages' },
                { id: 'troubleshooting', label: lang === 'ar' ? 'البدائل واستكشاف الأخطاء' : 'Troubleshooting' },
                { id: 'source', label: lang === 'ar' ? 'مرجع ناسا' : 'NASA Citation' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-[#1E2D4A] text-[#36D9FF] font-semibold border border-[#36D9FF]/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* SIMPLIFIED PLAIN-LANGUAGE BOX (إذا اختار المستخدم الوضع المبسط) */}
          {simplifiedMode && (
            <div className="mb-4 p-4 rounded-2xl bg-[#20E0A0]/10 border border-[#20E0A0]/30 text-white">
              <div className="flex items-center gap-2 text-[#20E0A0] font-bold text-xs font-mono mb-1.5">
                <HelpCircle className="w-4 h-4" />
                <span>{lang === 'ar' ? 'ماذا تفعل فوراً؟ (شرح مباشر باللغة البسيطة دون مصطلحات معقدة):' : 'Immediate Plain-Language Action Plan:'}</span>
              </div>
              <p className="text-sm font-sans leading-relaxed text-slate-100">
                {lang === 'ar' ? activeProtocol.simplifiedExplanationAr : activeProtocol.simplifiedExplanationEn}
              </p>
            </div>
          )}

          {/* TAB 1: Step-by-Step Interactive Checklist */}
          {activeTab === 'checklist' && (
            <div className="space-y-4">
              {/* Immediate Actions Header */}
              <div className="p-4 rounded-2xl bg-[#FF6577]/10 border border-[#FF6577]/30">
                <div className="text-xs font-mono font-bold text-[#FF6577] mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  <span>{lang === 'ar' ? 'الإجراءات الإلزامية في الثواني الأولى:' : 'Immediate Mandatory Actions:'}</span>
                </div>
                <div className="space-y-1.5">
                  {(lang === 'ar' ? activeProtocol.immediateActionsAr : activeProtocol.immediateActions).map(
                    (act, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs font-mono text-white">
                        <span className="text-[#FF6577] font-bold">{idx + 1}.</span>
                        <span>{act}</span>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Step-by-Step Procedure with interactive Checkboxes */}
              <div className="space-y-3">
                <div className="text-xs font-mono text-slate-300 font-bold">
                  {lang === 'ar' ? 'خطوات التنفيذ المعتمدة (اضغط على الخطوة لتأكيد إتمامها):' : 'Verified Procedure Steps (Tap to complete):'}
                </div>
                {activeProtocol.stepByStepProcedure.map((step) => {
                  const isDone = completedSteps.includes(step.step);
                  return (
                    <div
                      key={step.step}
                      onClick={() => toggleStep(step.step)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                        isDone
                          ? 'bg-[#20E0A0]/10 border-[#20E0A0]/50 text-slate-300 opacity-80'
                          : 'bg-[#101827] border-[#1E2D4A] hover:border-[#36D9FF]/50 text-white'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                          isDone ? 'bg-[#20E0A0] text-[#080B16]' : 'border border-slate-500'
                        }`}
                      >
                        {isDone && <CheckCircle2 className="w-4 h-4 stroke-[3]" />}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-[#36D9FF]">
                            {lang === 'ar' ? `الخطوة ${step.step}` : `Step ${step.step}`}
                          </span>
                          {isDone && (
                            <span className="text-[10px] font-mono text-[#20E0A0]">
                              {lang === 'ar' ? '✓ تم الإنجاز' : '✓ Completed'}
                            </span>
                          )}
                        </div>
                        <p className={`text-xs mt-1 leading-relaxed ${isDone ? 'line-through text-slate-400' : 'text-slate-100'}`}>
                          {lang === 'ar' ? step.actionAr : step.action}
                        </p>
                        {(step.warning || step.warningAr) && (
                          <div className="mt-2 p-2 rounded-xl bg-[#FF6577]/10 border border-[#FF6577]/30 text-[11px] text-[#FF6577] flex items-center gap-1.5 font-mono">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                            <span>{lang === 'ar' ? step.warningAr : step.warning}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Required Hardware */}
              <div className="p-4 rounded-2xl bg-[#101827] border border-[#1E2D4A]">
                <div className="text-xs font-mono text-slate-400 mb-2">
                  {lang === 'ar' ? 'المعدات والأدوات المطلوبة:' : 'Required Flight Equipment:'}
                </div>
                <div className="flex flex-wrap gap-2">
                  {(lang === 'ar' ? activeProtocol.equipmentNeededAr : activeProtocol.equipmentNeeded).map(
                    (eq, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-[#121D33] border border-[#1E2D4A] text-xs font-mono text-slate-200"
                      >
                        🧰 {eq}
                      </span>
                    )
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Spaceflight Drug Dosages */}
          {activeTab === 'dosages' && (
            <div className="p-4 rounded-2xl bg-[#101827] border border-[#8B7CFF]/30 space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#8B7CFF]">
                <Pill className="w-4 h-4" />
                <span>{lang === 'ar' ? 'جدول الجرعات الطبية الفضائية المعتمدة:' : 'Approved Spaceflight Medical Dosages:'}</span>
              </div>
              <div className="space-y-2">
                {(lang === 'ar' ? activeProtocol.dosageTableAr : activeProtocol.dosageTableEn)?.map((dose, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-[#080B16] border border-[#1E2D4A] text-xs font-mono text-slate-200 flex items-start gap-2">
                    <span className="text-[#8B7CFF] font-bold">💊</span>
                    <span>{dose}</span>
                  </div>
                )) || (
                  <div className="text-xs text-slate-400 font-mono">
                    {lang === 'ar' ? 'لا تتطلب هذه الحالة جرعات دوائية فورية؛ اعتمد على خطوات الدعم الحيوي.' : 'No pharmacological intervention required; follow ECLSS mechanical controls.'}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: Troubleshooting & Fallbacks */}
          {activeTab === 'troubleshooting' && (
            <div className="p-4 rounded-2xl bg-[#101827] border border-[#FFBF69]/30 space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#FFBF69]">
                <Wrench className="w-4 h-4" />
                <span>{lang === 'ar' ? 'استكشاف الأخطاء والبدائل (ماذا لو فشلت الخطوة الأولى؟):' : 'Failure Modes & Fallback Solutions:'}</span>
              </div>
              <div className="space-y-2">
                {(lang === 'ar' ? activeProtocol.troubleshootingAr : activeProtocol.troubleshootingEn)?.map((trouble, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-[#080B16] border border-[#1E2D4A] text-xs font-sans text-slate-200 flex items-start gap-2 leading-relaxed">
                    <span className="text-[#FFBF69] font-bold">🛠️</span>
                    <span>{trouble}</span>
                  </div>
                )) || (
                  <div className="text-xs text-slate-400 font-mono">
                    {lang === 'ar' ? 'في حال تعذر الإجراء الأولي، تابع الإخلاء الفوري إلى المركبة الآمنة.' : 'In case of primary step failure, proceed to safe haven egress immediately.'}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: NASA Citation */}
          {activeTab === 'source' && (
            <div className="p-4 rounded-2xl bg-[#101827] border border-[#1E2D4A] text-xs font-mono text-slate-300 space-y-2">
              <div className="text-[#36D9FF] font-bold">{lang === 'ar' ? 'المرجع والوثيقة الرسمية من ناسا:' : 'Official NASA Authority Document:'}</div>
              <div className="p-3 rounded-xl bg-[#080B16] border border-[#1E2D4A] text-slate-300">
                {activeProtocol.nasaSourceDocument}
              </div>
              <div className="text-[11px] text-slate-500">
                {lang === 'ar'
                  ? 'تم استرجاع هذه البيانات بالكامل من الذاكرة المحلية للعقدة الفضائية ASTRA دون أي اتصال بسيرفر خارجي.'
                  : 'Retrieved autonomously from ASTRA local node cache; zero network dependencies.'}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. Search and Category Filter for NASA Protocols */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                lang === 'ar'
                  ? 'ابحث في بروتوكولات ناسا الـ 18: أمونيا، ضغط، إنعاش، حريق، بدلة، كسر، زائدة، عين...'
                  : 'Search all 18 NASA protocols: ammonia, decompression, CPR, fire, suit, fracture, eye...'
            }
            className="w-full bg-[#101827] border border-[#1E2D4A] focus:border-[#36D9FF] rounded-2xl pl-9 pr-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none"
          />
        </div>

        {/* Clear Filter button if query exists */}
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="px-3 py-2.5 rounded-xl bg-[#121D33] text-xs font-mono text-slate-300 hover:text-white"
          >
            {lang === 'ar' ? 'مسح البحث' : 'Clear'}
          </button>
        )}
        </div>
      </div>

      {/* Category Horizontal Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-mono whitespace-nowrap transition-all cursor-pointer ${
                isSelected
                  ? 'bg-gradient-to-r from-[#8B7CFF] to-[#36D9FF] text-[#080B16] font-bold shadow-[0_0_15px_rgba(54,217,255,0.3)]'
                  : 'bg-[#101827] border border-[#1E2D4A] text-slate-400 hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* 5. Protocols Grid (18 Complete NASA Protocols) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProtocols.map((protocol) => {
          const isCritical = protocol.severity === 'CRITICAL';
          const isWarning = protocol.severity === 'WARNING';
          const isActive = activeProtocol?.id === protocol.id;

          return (
            <div
              key={protocol.id}
              className={`glass-panel rounded-2xl p-5 border transition-all duration-300 flex flex-col justify-between group relative overflow-hidden ${
                isActive
                  ? 'border-[#FF6577] bg-[#FF6577]/10 shadow-[0_0_25px_rgba(255,101,119,0.25)]'
                  : isCritical
                  ? 'border-[#FF6577]/30 hover:border-[#FF6577]/70 hover:shadow-[0_0_20px_rgba(255,101,119,0.2)]'
                  : isWarning
                  ? 'border-[#FFBF69]/30 hover:border-[#FFBF69]/70 hover:shadow-[0_0_20px_rgba(255,191,105,0.2)]'
                  : 'border-[#1E2D4A] hover:border-[#36D9FF]/50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                      isCritical
                        ? 'bg-[#FF6577]/20 text-[#FF6577] border border-[#FF6577]/40'
                        : isWarning
                        ? 'bg-[#FFBF69]/20 text-[#FFBF69] border border-[#FFBF69]/40'
                        : 'bg-[#36D9FF]/20 text-[#36D9FF] border border-[#36D9FF]/40'
                    }`}
                  >
                    {protocol.severity}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">{protocol.code}</span>
                </div>

                <h4 className="text-base font-display font-bold text-white group-hover:text-[#36D9FF] transition-colors leading-snug">
                  {lang === 'ar' ? protocol.titleAr : protocol.title}
                </h4>

                {/* Simplified summary snippet */}
                <p className="text-xs text-slate-300 font-sans mt-2 line-clamp-2 leading-relaxed">
                  {lang === 'ar' ? protocol.simplifiedExplanationAr || protocol.immediateActionsAr[0] : protocol.simplifiedExplanationEn || protocol.immediateActions[0]}
                </p>

                {/* Symptoms pills */}
                <div className="mt-3 space-y-1">
                  <div className="text-[10px] font-mono text-slate-400">{lang === 'ar' ? 'الأعراض المحددة:' : 'Key Symptoms:'}</div>
                  <div className="flex flex-wrap gap-1">
                    {(lang === 'ar' ? protocol.symptomsAr : protocol.symptoms).slice(0, 2).map((sym, idx) => (
                      <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-[#080B16] text-slate-300 border border-[#1E2D4A] truncate max-w-full">
                        • {sym}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-4 pt-3 border-t border-[#1E2D4A] flex items-center justify-between gap-2">
                {protocol.immediateActionTimerSeconds ? (
                  <span className="text-[11px] font-mono text-[#FFBF69] flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{protocol.immediateActionTimerSeconds}s window</span>
                  </span>
                ) : (
                  <span className="text-[11px] font-mono text-slate-400">Step Protocol</span>
                )}

                <button
                  onClick={() => startEmergencyProtocol(protocol)}
                  className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                    isCritical
                      ? 'bg-[#FF6577] text-[#080B16] hover:bg-[#FF6577]/90 shadow-[0_0_15px_rgba(255,101,119,0.4)]'
                      : 'bg-gradient-to-r from-[#8B7CFF] to-[#36D9FF] text-[#080B16] hover:opacity-95'
                  }`}
                >
                  <span>{lang === 'ar' ? 'بدء الإجراء' : 'Launch SOS'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

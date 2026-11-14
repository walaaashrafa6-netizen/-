import React, { useState, useEffect, useRef } from 'react';
import {
  Language,
  ModuleTab,
  AstronautProfile,
  SleepRecord,
  WellnessRecord,
  RespiratoryRecord,
  BodyMetricRecord,
  HealthEventRecord,
  ModuleOperationalStatus,
  IntegrationScenarioResult,
  SystemPerformanceMetrics,
  DispatchedToolRecord,
  IntelligenceReasoningResult,
  EngineeringReportModule,
  IntelligenceToolName,
} from '../types';
import {
  processIntelligenceQuery,
  getSystemModulesStatus,
  runAllIntegrationScenarios,
  measureSystemPerformance,
  getEngineeringReportModules,
  runAdvancedAiArchitectureTests,
  DEFAULT_KNOWLEDGE_BASE,
  executeIntelligenceTool,
  detectAdversarialPromptInjection,
  detectScientificContradiction,
  evaluateMathematicalExpression,
  classifyUserIntent,
} from '../utils/intelligenceCore';
import { formatDuration } from '../utils/storage';
import {
  Sparkles,
  Send,
  Cpu,
  ShieldCheck,
  Database,
  Activity,
  Printer,
  FileText,
  RefreshCw,
  CheckCircle2,
  Check,
  Copy,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  ChevronDown,
  ExternalLink,
  Terminal,
  Zap,
  Globe,
  WifiOff,
  BookOpen,
  RotateCcw,
  Calculator,
  Bot,
  User,
  ArrowUpRight,
} from 'lucide-react';

interface IntelligenceCoreHubProps {
  sleepRecords: SleepRecord[];
  wellnessRecords: WellnessRecord[];
  respiratoryRecords: RespiratoryRecord[];
  bodyMetrics: BodyMetricRecord[];
  healthEvents: HealthEventRecord[];
  profile: AstronautProfile;
  initialPrompt?: string | null;
  onClearInitialPrompt?: () => void;
  onNavigate?: (tab: ModuleTab) => void;
  lang: Language;
}

interface ConsoleMessage {
  id: string;
  sender: 'user' | 'astra';
  text: string;
  timestamp: string;
  engineUsed?: 'cloud' | 'local' | 'guardrail';
  modelUsed?: string;
  intelResult?: IntelligenceReasoningResult;
}

const CHAT_STORAGE_KEY = 'astra_intel_chat_history_v2';

export const IntelligenceCoreHub: React.FC<IntelligenceCoreHubProps> = ({
  sleepRecords,
  wellnessRecords,
  respiratoryRecords,
  bodyMetrics,
  healthEvents,
  profile,
  initialPrompt,
  onClearInitialPrompt,
  onNavigate,
  lang,
}) => {
  const isAr = lang === 'ar';
  const callsign = profile.callsign || (isAr ? 'رائد الفضاء' : 'Astronaut');

  const [activeTab, setActiveTab] = useState<'console' | 'tools_memory' | 'validation' | 'report'>('console');
  const [operationalMode, setOperationalMode] = useState<'auto' | 'offline'>('auto');

  const [queryInput, setQueryInput] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);
  const [expandedAuditId, setExpandedAuditId] = useState<string | null>(null);

  const totalUserRecords =
    sleepRecords.length +
    wellnessRecords.length +
    respiratoryRecords.length +
    bodyMetrics.length;

  const buildWelcomeMessage = (): ConsoleMessage => ({
    id: 'msg-welcome',
    sender: 'astra',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    engineUsed: 'local',
    modelUsed: 'astra-intelligence-core',
    text: isAr
      ? `### أهلاً بك يا ${callsign} في نواة ذكاء ASTRA

أنا نظام المساعدة الهندسي والصحي لرحلتك (**${profile.missionName}** · اليوم **${profile.missionDay}**).

${totalUserRecords > 0
  ? `تمت قراءة **${totalUserRecords} سجل مسجل** من بياناتك الحالية للتحليل المخصص.`
  : 'لا توجد قياسات مسجلة من قِبلك حتى الآن — جميع السجلات بدأت نظيفة ولن يتم عرض أي أرقام غير مسجلة.'}

يمكنك التحدث معي **بالعربية أو الإنجليزية** حول:
• تحليل بياناتك الصحية المسجلة وتفسير التكيف مع الجاذبية الصغرى.
• حسابات تأخير الإشارة للمريخ أو جدولة البيانات (ASTRA PREDICT).
• البحث في مستودعات ناسا المفتوحة (OSDR) أو بروتوكولات الطوارئ.`
      : `### Welcome to ASTRA Intelligence Core, ${callsign}

I am your spaceflight engineering and operational wellness assistant (**${profile.missionName}** · Flight Day **${profile.missionDay}**).

${totalUserRecords > 0
  ? `Synchronized **${totalUserRecords} user-logged records** from your active storage.`
  : 'No user health records have been logged yet — all telemetry starts clean so no unlogged numbers are fabricated.'}

Ask me anything in **English or Arabic**:
• Analysis of your logged health trends and microgravity physiology.
• Mars signal delay math and ASTRA PREDICT payload scheduling.
• NASA OSDR open science studies or offline emergency medical protocols.`,
  });

  const [dialogueHistory, setDialogueHistory] = useState<ConsoleMessage[]>(() => {
    try {
      const saved = localStorage.getItem(CHAT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [buildWelcomeMessage()];
  });

  // Update welcome message if it is the only message and language/record count changes
  useEffect(() => {
    if (dialogueHistory.length === 1 && dialogueHistory[0].id === 'msg-welcome') {
      setDialogueHistory([buildWelcomeMessage()]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang, totalUserRecords, profile.callsign, profile.missionName, profile.missionDay]);

  useEffect(() => {
    try {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(dialogueHistory));
    } catch {}
  }, [dialogueHistory]);

  // Operations Ledger
  const [operationLedger, setOperationLedger] = useState<DispatchedToolRecord[]>([]);

  // Tools Suite Manual Executor State
  const [selectedToolToRun, setSelectedToolToRun] = useState<IntelligenceToolName>('math_calculator_evaluator');
  const [toolCustomParam, setToolCustomParam] = useState<string>('401000000 / 299792.458');
  const [manualToolResult, setManualToolResult] = useState<any>(null);
  const [isExecutingTool, setIsExecutingTool] = useState<boolean>(false);

  // Module Statuses (kept accurate to real user state)
  const [offlineQueueCount, setOfflineQueueCount] = useState<number>(0);
  useEffect(() => {
    try {
      const q = localStorage.getItem('astra_offline_mission_queue_v1');
      if (q) setOfflineQueueCount(JSON.parse(q).length);
    } catch {}
  }, []);

  const moduleStatuses: ModuleOperationalStatus[] = getSystemModulesStatus(
    bodyMetrics.length + sleepRecords.length + wellnessRecords.length + respiratoryRecords.length,
    offlineQueueCount
  );

  // Validation & Performance States
  const [integrationResults, setIntegrationResults] = useState<IntegrationScenarioResult[]>(() =>
    runAllIntegrationScenarios()
  );
  const [isTestingScenarios, setIsTestingScenarios] = useState<boolean>(false);
  const [aiArchitectureSuite, setAiArchitectureSuite] = useState(() => runAdvancedAiArchitectureTests());
  const [isTestingAiSuite, setIsTestingAiSuite] = useState<boolean>(false);
  const [perfMetrics, setPerfMetrics] = useState<SystemPerformanceMetrics>(() => measureSystemPerformance());
  const [isMeasuringPerf, setIsMeasuringPerf] = useState<boolean>(false);
  const reportModules: EngineeringReportModule[] = getEngineeringReportModules();

  const chatEndRef = useRef<HTMLDivElement>(null);
  const consumedInitialPromptRef = useRef<string | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [dialogueHistory, isProcessing]);

  // Compute real telemetry context
  const latestSleep = sleepRecords[sleepRecords.length - 1] || null;
  const latestWellness = wellnessRecords[wellnessRecords.length - 1] || null;
  const latestResp = respiratoryRecords[respiratoryRecords.length - 1] || null;
  const latestBody = bodyMetrics[0] || null;

  const avgSleepMinutes =
    sleepRecords.length > 0
      ? Math.round(sleepRecords.reduce((sum, r) => sum + r.durationMinutes, 0) / sleepRecords.length)
      : null;

  const buildTruthfulUserContext = () => ({
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
  });

  // Reset conversation
  const handleNewChat = () => {
    const fresh = [buildWelcomeMessage()];
    setDialogueHistory(fresh);
    setExpandedAuditId(null);
    try {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(fresh));
    } catch {}
  };

  // Copy text
  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  // Speech synthesis
  const handleSpeak = (id: string, text: string) => {
    if (!('speechSynthesis' in window)) return;
    if (speakingMsgId === id) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      return;
    }
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*#_`]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = /[\u0600-\u06FF]/.test(cleanText) ? 'ar-SA' : 'en-US';
    utterance.rate = 1.0;
    utterance.onend = () => setSpeakingMsgId(null);
    utterance.onerror = () => setSpeakingMsgId(null);
    setSpeakingMsgId(id);
    window.speechSynthesis.speak(utterance);
  };

  // Voice dictation (no window.alert)
  const handleToggleMic = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceNotice(
        isAr
          ? 'الإملاء الصوتي غير مدعوم في هذا المتصفح، يمكنك الكتابة مباشرة.'
          : 'Voice dictation is not supported in this browser; please type directly.'
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
      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);
      recognition.onresult = (e: any) => {
        const text = e.results[0][0].transcript;
        setQueryInput((prev) => (prev ? `${prev} ${text}` : text));
      };
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  // Send query handler
  const sendQuery = async (overrideText?: string) => {
    const userText = (overrideText ?? queryInput).trim();
    if (!userText || isProcessing) return;

    if (!overrideText) setQueryInput('');
    setIsProcessing(true);

    const detectedIsAr = /[\u0600-\u06FF]/.test(userText) ? true : isAr;
    const responseLang: Language = /[\u0600-\u06FF]/.test(userText) ? 'ar' : /[a-zA-Z]/.test(userText) ? 'en' : lang;

    const userMsg: ConsoleMessage = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedHistory = [...dialogueHistory, userMsg];
    setDialogueHistory(updatedHistory);

    // 1. Run deterministic safety & tool audit locally
    const injectionCheck = detectAdversarialPromptInjection(userText);
    const contradictionCheck = detectScientificContradiction(userText);
    const localAudit = processIntelligenceQuery(
      userText,
      {
        sleepRecords,
        wellnessRecords,
        respiratoryRecords,
        bodyMetrics,
        healthEvents,
        profileCallsign: callsign,
        missionDay: profile.missionDay,
      },
      responseLang
    );

    if (localAudit.dispatchedTools.length > 0) {
      setOperationLedger((prev) => [...localAudit.dispatchedTools, ...prev].slice(0, 25));
    }

    // 2. If adversarial prompt injection detected, immediately intercept safely
    if (injectionCheck.isMalicious) {
      const guardMsg: ConsoleMessage = {
        id: `msg-astra-${Date.now()}`,
        sender: 'astra',
        text: detectedIsAr ? localAudit.replyTextAr : localAudit.replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        engineUsed: 'guardrail',
        modelUsed: 'astra-security-guardrail',
        intelResult: localAudit,
      };
      setDialogueHistory((prev) => [...prev, guardMsg]);
      setIsProcessing(false);
      return;
    }

    // 3. In Auto mode, call /api/chat (Gemini + server fallback) for fluent Arabic/English dialogue
    let finalReply: string | null = null;
    let engineUsed: 'cloud' | 'local' = 'local';
    let modelUsed = 'astra-edge-local';

    if (operationalMode === 'auto') {
      try {
        const firstUserIdx = updatedHistory.findIndex((m) => m.sender === 'user');
        const historySlice = firstUserIdx >= 0 ? updatedHistory.slice(firstUserIdx) : [userMsg];
        const apiMessages = historySlice.slice(-12).map((m) => ({
          role: m.sender === 'user' ? 'user' : 'model',
          content: m.text,
        }));

        const resp = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: apiMessages,
            userContext: buildTruthfulUserContext(),
            language: responseLang,
          }),
        });

        if (resp.ok) {
          const data = await resp.json();
          if (data && typeof data.reply === 'string' && data.reply.trim().length > 0) {
            finalReply = data.reply;
            engineUsed = data.engine === 'cloud' ? 'cloud' : 'local';
            modelUsed = data.model || (engineUsed === 'cloud' ? 'gemini-4-hydrogen' : 'astra-local-engine');
          }
        }
      } catch (err) {
        console.warn('Auto API unavailable, falling back to local reasoning engine:', err);
      }
    }

    // 4. Deterministic enrichment for structured domain intents (math, emergency, predict, contradictions)
    const { intent } = classifyUserIntent(userText);
    const hasMath =
      userText.toLowerCase().includes('calculate') ||
      userText.includes('احسب') ||
      userText.includes('حساب') ||
      userText.includes('401') ||
      userText.toLowerCase().includes('light delay');

    if (operationalMode === 'offline' || !finalReply) {
      finalReply = responseLang === 'ar' ? localAudit.replyTextAr : localAudit.replyText;
      engineUsed = 'local';
      modelUsed = 'astra-edge-local';
    } else {
      // If cloud replied, ensure precision math or scientific objection is appended if relevant and not already mentioned
      if (hasMath) {
        const calc = evaluateMathematicalExpression(userText);
        if (!finalReply.includes(String(calc.result))) {
          finalReply +=
            responseLang === 'ar'
              ? `\n\n**التحقق الحسابي الدقيق:** \`${calc.formula}\` = **${calc.result}**`
              : `\n\n**Verified Calculation:** \`${calc.formula}\` = **${calc.result}**`;
        }
      }
      if (contradictionCheck.hasContradiction) {
        const objText = responseLang === 'ar' ? contradictionCheck.objectionAr : contradictionCheck.objection;
        if (objText && !finalReply.includes('NASA-STD-3001')) {
          finalReply += `\n\n> ⚠️ ${objText}`;
        }
      }
      if (intent === 'emergency_lookup' && engineUsed === 'local') {
        finalReply = responseLang === 'ar' ? localAudit.replyTextAr : localAudit.replyText;
      }
    }

    const astraMsg: ConsoleMessage = {
      id: `msg-astra-${Date.now()}`,
      sender: 'astra',
      text: finalReply,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      engineUsed,
      modelUsed,
      intelResult: localAudit,
    };

    setDialogueHistory((prev) => [...prev, astraMsg]);
    setIsProcessing(false);
  };

  // Auto-submit pending prompt passed from OverviewView assistant bar
  useEffect(() => {
    if (initialPrompt && initialPrompt.trim() && consumedInitialPromptRef.current !== initialPrompt) {
      consumedInitialPromptRef.current = initialPrompt;
      setActiveTab('console');
      sendQuery(initialPrompt);
      onClearInitialPrompt?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPrompt]);

  // Manual tool runner
  const handleExecuteManualTool = () => {
    setIsExecutingTool(true);
    setTimeout(() => {
      let params: Record<string, any> = {};
      if (selectedToolToRun === 'math_calculator_evaluator') {
        params = { expression: toolCustomParam };
      } else if (selectedToolToRun === 'nasa_dataset_search' || selectedToolToRun === 'search_nasa_open_science') {
        params = { query: toolCustomParam };
      } else if (selectedToolToRun === 'mission_event_logger') {
        params = { title: toolCustomParam, titleAr: toolCustomParam, flightDay: profile.missionDay };
      }

      const res = executeIntelligenceTool(selectedToolToRun, params, {
        sleepRecords,
        wellnessRecords,
        respiratoryRecords,
        bodyMetrics,
        healthEvents,
      });
      setManualToolResult(res);
      setOperationLedger((prev) => [res.dispatchedRecord, ...prev].slice(0, 25));
      setIsExecutingTool(false);
    }, 200);
  };

  const quickPrompts = isAr
    ? [
        'مرحباً، لخص وضع بياناتي المسجلة حالياً',
        'اشرح انزياح السوائل الرأسي في انعدام الوزن',
        'احسب تأخير سرعة الضوء للمريخ (401 مليون كم)',
        'بروتوكول طوارئ ناسا عند تسرب الأمونيا',
      ]
    : [
        'Hello, summarize my currently logged telemetry',
        'Explain cephalad fluid shift in microgravity',
        'Calculate Mars light delay at 401 million km',
        'Retrieve NASA emergency toxic ammonia protocol',
      ];

  return (
    <div className="space-y-5 pb-12 max-w-7xl mx-auto">
      {/* 1. Clean Header & Navigation Bar */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#0C1B2B] border border-[#162E48] shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono text-[#42C8F5]">
              <Cpu className="w-4 h-4" />
              <span>ASTRA INTELLIGENCE CORE</span>
              <span className="text-[#162E48]">|</span>
              <span className="text-[#A9B8C8]">
                {profile.missionName} · {isAr ? `اليوم ${profile.missionDay}` : `FD ${profile.missionDay}`}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-display font-bold text-white tracking-wide">
              {isAr ? 'وحدة الذكاء والتكامل الفضائي' : 'Aerospace Intelligence & Integration Console'}
            </h1>
            <p className="text-xs sm:text-sm text-[#A9B8C8] max-w-2xl">
              {isAr
                ? 'تحليل موثق يعتمد حصرياً على قياساتك المسجلة، مع توجيه الأدوات ومصادر ناسا المرجعية.'
                : 'Grounded spaceflight assistance tied strictly to your logged telemetry, deterministic tools, and NASA references.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Engine Mode Segmented Control */}
            <div className="bg-[#07111F] p-1 rounded-xl border border-[#162E48] flex items-center gap-1">
              <button
                type="button"
                onClick={() => setOperationalMode('auto')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  operationalMode === 'auto'
                    ? 'bg-[#42C8F5] text-[#07111F]'
                    : 'text-[#A9B8C8] hover:text-white'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>{isAr ? 'ذكاء ASTRA المدمج' : 'ASTRA Auto AI'}</span>
              </button>
              <button
                type="button"
                onClick={() => setOperationalMode('offline')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  operationalMode === 'offline'
                    ? 'bg-[#35C98A] text-[#07111F]'
                    : 'text-[#A9B8C8] hover:text-white'
                }`}
              >
                <WifiOff className="w-3.5 h-3.5" />
                <span>{isAr ? 'وضع أوفلاين' : 'Offline Edge'}</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleNewChat}
              className="px-3 py-2 rounded-xl bg-[#07111F] border border-[#162E48] hover:border-[#42C8F5]/50 text-[#A9B8C8] hover:text-white text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isAr ? 'محادثة جديدة' : 'New Chat'}</span>
            </button>
          </div>
        </div>

        {/* Clean 4-Tab Bar */}
        <div className="flex items-center gap-1.5 mt-5 pt-4 border-t border-[#162E48] overflow-x-auto scrollbar-none">
          {[
            { id: 'console', label: isAr ? 'المحادثة الذكية' : 'AI Console', icon: Sparkles },
            { id: 'tools_memory', label: isAr ? 'الأدوات والذاكرة' : 'Tools & Memory', icon: Database },
            { id: 'validation', label: isAr ? 'مختبر التحقق' : 'Validation & Diagnostics', icon: CheckCircle2 },
            { id: 'report', label: isAr ? 'التقرير الهندسي' : 'Engineering Report', icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-sans font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#173B60] text-[#42C8F5] border border-[#42C8F5]/40'
                    : 'text-[#A9B8C8] hover:text-white hover:bg-[#07111F] border border-transparent'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: AI CONSOLE (CHAT + REAL TELEMETRY SIDEBAR)        */}
      {/* ======================================================== */}
      {activeTab === 'console' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left 8 Cols: Clean Conversation Workspace */}
          <div className="lg:col-span-8 rounded-3xl bg-[#0C1B2B] border border-[#162E48] shadow-xl flex flex-col h-[680px] overflow-hidden">
            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
              {dialogueHistory.map((msg) => {
                const isUser = msg.sender === 'user';
                const intel = msg.intelResult;
                const isAuditOpen = expandedAuditId === msg.id;
                const msgIsAr = /[\u0600-\u06FF]/.test(msg.text);

                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-1 ${
                        isUser
                          ? 'bg-[#173B60] border border-[#42C8F5]/40 text-[#42C8F5]'
                          : 'bg-[#07111F] border border-[#162E48] text-[#42C8F5]'
                      }`}
                    >
                      {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>

                    <div
                      dir={msgIsAr ? 'rtl' : 'ltr'}
                      className={`max-w-[88%] rounded-2xl p-4 text-xs sm:text-[13px] leading-relaxed ${
                        isUser
                          ? 'bg-[#173B60] text-white border border-[#42C8F5]/30'
                          : 'bg-[#07111F] text-[#F2F6FA] border border-[#162E48]'
                      }`}
                    >
                      {/* Clean sender line */}
                      <div className="flex items-center justify-between gap-4 pb-2 mb-2.5 border-b border-white/10 text-[10px] font-mono text-[#A9B8C8]">
                        <span className="font-semibold text-white">
                          {isUser ? callsign : 'ASTRA Intelligence Core'}
                        </span>
                        <div className="flex items-center gap-2">
                          {!isUser && msg.engineUsed && (
                            <span className="text-[10px] text-[#42C8F5]">
                              {msg.engineUsed === 'cloud'
                                ? 'Cloud AI'
                                : msg.engineUsed === 'guardrail'
                                ? 'Security Guardrail'
                                : 'Local Engine'}
                            </span>
                          )}
                          <span>{msg.timestamp}</span>
                        </div>
                      </div>

                      {/* Formatted Markdown Response */}
                      <MarkdownMessage content={msg.text} />

                      {/* Calculation highlight if present */}
                      {!isUser && intel?.calculationDetails && (
                        <div className="mt-3 p-2.5 rounded-xl bg-[#0C1B2B] border border-[#42C8F5]/30 font-mono text-[11px] flex items-center justify-between gap-2">
                          <span className="text-[#A9B8C8] flex items-center gap-1.5">
                            <Calculator className="w-3.5 h-3.5 text-[#42C8F5]" />
                            {intel.calculationDetails.formula}
                          </span>
                          <span className="text-[#42C8F5] font-bold">{intel.calculationDetails.result}</span>
                        </div>
                      )}

                      {/* Footer action row + collapsed Audit & Sources drawer */}
                      {!isUser && (
                        <div className="mt-3 pt-2.5 border-t border-[#162E48] space-y-2">
                          <div className="flex items-center justify-between gap-2 text-[11px] text-[#A9B8C8]">
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() => handleCopy(msg.id, msg.text)}
                                className="hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                              >
                                {copiedId === msg.id ? (
                                  <Check className="w-3.5 h-3.5 text-[#35C98A]" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                                <span>{isAr ? 'نسخ' : 'Copy'}</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSpeak(msg.id, msg.text)}
                                className="hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                              >
                                {speakingMsgId === msg.id ? (
                                  <VolumeX className="w-3.5 h-3.5 text-[#E85D65]" />
                                ) : (
                                  <Volume2 className="w-3.5 h-3.5 text-[#42C8F5]" />
                                )}
                                <span>{speakingMsgId === msg.id ? (isAr ? 'إيقاف' : 'Stop') : (isAr ? 'استماع' : 'Listen')}</span>
                              </button>
                            </div>

                            {intel && (
                              <button
                                type="button"
                                onClick={() => setExpandedAuditId(isAuditOpen ? null : msg.id)}
                                className="text-[#42C8F5] hover:underline font-mono text-[10px] flex items-center gap-1 cursor-pointer"
                              >
                                <span>{isAr ? 'المصادر والتدقيق' : 'Sources & Audit'}</span>
                                <ChevronDown className={`w-3 h-3 transition-transform ${isAuditOpen ? 'rotate-180' : ''}`} />
                              </button>
                            )}
                          </div>

                          {/* Collapsed-by-default Audit Drawer */}
                          {intel && isAuditOpen && (
                            <div className="p-3 rounded-xl bg-[#0C1B2B] border border-[#162E48] space-y-2 text-[11px] font-mono text-[#A9B8C8]">
                              <div>
                                <span className="text-white font-semibold block mb-1">
                                  {isAr ? 'الأدوات والمصادر:' : 'Tools & Sources:'}
                                </span>
                                {intel.dispatchedTools.map((t, idx) => (
                                  <div key={idx} className="text-[10px] text-[#35C98A]">
                                    • {isAr ? t.toolLabelAr : t.toolLabel} ({t.durationMs}ms)
                                  </div>
                                ))}
                                {intel.sourcesCited.map((s, idx) => (
                                  <div key={idx} className="text-[10px]">
                                    • {isAr ? s.titleAr : s.title} [{s.provenance}]
                                  </div>
                                ))}
                              </div>

                              {intel.mediaAttachments && intel.mediaAttachments.length > 0 && (
                                <div className="flex flex-wrap gap-2 pt-1">
                                  {intel.mediaAttachments.map((m) =>
                                    m.url ? (
                                      <a
                                        key={m.id}
                                        href={m.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-[10px] text-[#42C8F5] hover:underline"
                                      >
                                        <span>{isAr ? m.titleAr : m.title}</span>
                                        <ExternalLink className="w-3 h-3" />
                                      </a>
                                    ) : null
                                  )}
                                </div>
                              )}

                              {intel.unknownsAndBoundaries.length > 0 && (
                                <div className="text-[10px] text-[#F2B84B] pt-1 border-t border-[#162E48]">
                                  {isAr ? 'حدود المعرفة:' : 'Boundary:'}{' '}
                                  {(isAr ? intel.unknownsAndBoundariesAr : intel.unknownsAndBoundaries)[0]}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {isProcessing && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#07111F] border border-[#162E48] flex items-center justify-center text-[#42C8F5]">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  </div>
                  <div className="px-4 py-3 rounded-2xl bg-[#07111F] border border-[#162E48] text-xs font-mono text-[#A9B8C8]">
                    {isAr ? 'جاري تحليل الاستفسار ومراجعة سجلاتك...' : 'Synthesizing telemetry and aerospace references...'}
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Quick Suggestion Chips & Input Bar */}
            <div className="p-4 bg-[#07111F] border-t border-[#162E48] space-y-2.5">
              {voiceNotice && (
                <div className="text-[11px] font-mono text-[#F2B84B] px-2">{voiceNotice}</div>
              )}

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {quickPrompts.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => sendQuery(p)}
                    disabled={isProcessing}
                    className="px-2.5 py-1 rounded-lg bg-[#0C1B2B] text-[#A9B8C8] hover:text-white border border-[#162E48] hover:border-[#42C8F5]/50 text-[11px] whitespace-nowrap transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {p}
                  </button>
                ))}
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendQuery();
                }}
                className="flex items-center gap-2"
              >
                <button
                  type="button"
                  onClick={handleToggleMic}
                  className={`p-2.5 rounded-xl border transition-colors cursor-pointer shrink-0 ${
                    isListening
                      ? 'bg-[#E85D65]/20 border-[#E85D65] text-[#E85D65]'
                      : 'bg-[#0C1B2B] border-[#162E48] text-[#A9B8C8] hover:text-white'
                  }`}
                  title={isAr ? 'إملاء صوتي' : 'Voice Dictation'}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>

                <input
                  type="text"
                  value={queryInput}
                  onChange={(e) => setQueryInput(e.target.value)}
                  placeholder={
                    isAr
                      ? 'اكتب سؤالك بالعربية أو الإنجليزية...'
                      : 'Ask ASTRA in English or Arabic...'
                  }
                  className="flex-1 bg-[#0C1B2B] text-white text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-[#162E48] focus:border-[#42C8F5] focus:outline-none"
                />

                <button
                  type="submit"
                  disabled={isProcessing || !queryInput.trim()}
                  className="px-4 py-2.5 rounded-xl bg-[#42C8F5] text-[#07111F] font-bold text-xs font-mono hover:brightness-110 transition-all cursor-pointer disabled:opacity-40 flex items-center gap-1.5 shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isAr ? 'إرسال' : 'Send'}</span>
                </button>
              </form>
            </div>
          </div>

          {/* Right 4 Cols: Strictly Real Telemetry & Subsystems Rail */}
          <div className="lg:col-span-4 space-y-4">
            {/* Real Logged User Telemetry */}
            <div className="p-4 rounded-3xl bg-[#0C1B2B] border border-[#162E48] space-y-3 shadow-lg">
              <div className="flex items-center justify-between pb-2 border-b border-[#162E48]">
                <span className="text-xs font-display font-bold text-white flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-[#42C8F5]" />
                  {isAr ? 'سجلاتك الصحية الفعلية' : 'Your Logged Telemetry'}
                </span>
                <span className="text-[10px] font-mono text-[#A9B8C8]">
                  {totalUserRecords} {isAr ? 'سجل' : 'records'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2.5 rounded-xl bg-[#07111F] border border-[#162E48]">
                  <span className="text-[10px] text-[#A9B8C8] block">{isAr ? 'النوم' : 'Sleep'}</span>
                  <span className={`font-bold text-xs ${latestSleep ? 'text-white' : 'text-slate-500'}`}>
                    {latestSleep ? formatDuration(latestSleep.durationMinutes) : (isAr ? 'غير مسجل' : 'Not logged')}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#07111F] border border-[#162E48]">
                  <span className="text-[10px] text-[#A9B8C8] block">{isAr ? 'التنفس' : 'Respiration'}</span>
                  <span className={`font-bold text-xs ${latestResp ? 'text-[#42C8F5]' : 'text-slate-500'}`}>
                    {latestResp ? `${latestResp.respiratoryRate}/min` : (isAr ? 'غير مسجل' : 'Not logged')}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#07111F] border border-[#162E48]">
                  <span className="text-[10px] text-[#A9B8C8] block">{isAr ? 'النبض / SpO2' : 'HR / SpO2'}</span>
                  <span className={`font-bold text-xs ${latestBody?.heartRateBpm ? 'text-[#35C98A]' : 'text-slate-500'}`}>
                    {latestBody?.heartRateBpm
                      ? `${latestBody.heartRateBpm} bpm · ${latestBody.spO2Percent ?? '—'}%`
                      : (isAr ? 'غير مسجل' : 'Not logged')}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#07111F] border border-[#162E48]">
                  <span className="text-[10px] text-[#A9B8C8] block">{isAr ? 'التوتر / الطاقة' : 'Stress / Energy'}</span>
                  <span className={`font-bold text-xs ${latestWellness ? 'text-white' : 'text-slate-500'}`}>
                    {latestWellness
                      ? `${latestWellness.stressRating}/5 · ${latestWellness.energyRating}/5`
                      : (isAr ? 'غير مسجل' : 'Not logged')}
                  </span>
                </div>
              </div>

              {totalUserRecords === 0 && onNavigate && (
                <button
                  type="button"
                  onClick={() => onNavigate('health_core')}
                  className="w-full py-2 px-3 rounded-xl bg-[#07111F] border border-[#42C8F5]/30 hover:border-[#42C8F5] text-[#42C8F5] text-xs font-mono flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>{isAr ? 'تسجيل أول قياس في نواة الصحة' : 'Log First Entry in Health Core'}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Connected Modules Status */}
            <div className="p-4 rounded-3xl bg-[#0C1B2B] border border-[#162E48] space-y-2.5 shadow-lg">
              <div className="flex items-center justify-between pb-2 border-b border-[#162E48]">
                <span className="text-xs font-display font-bold text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#35C98A]" />
                  {isAr ? 'حالة الوحدات المتكاملة' : 'Integrated Subsystems'}
                </span>
              </div>
              <div className="space-y-2 text-[11px] font-mono">
                {moduleStatuses.map((mod) => (
                  <div
                    key={mod.id}
                    className="p-2 rounded-xl bg-[#07111F] border border-[#162E48] flex items-center justify-between gap-2"
                  >
                    <span className="text-white truncate">{isAr ? mod.nameAr : mod.name}</span>
                    <span className="text-[#35C98A] shrink-0 text-[10px]">
                      {mod.status} ({mod.recordCount})
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Dispatched Tools Ledger */}
            <div className="p-4 rounded-3xl bg-[#0C1B2B] border border-[#162E48] space-y-2.5 shadow-lg">
              <div className="flex items-center justify-between pb-2 border-b border-[#162E48]">
                <span className="text-xs font-display font-bold text-white flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-[#35C98A]" />
                  {isAr ? 'سجل العمليات المنفذة' : 'Dispatched Tools Log'}
                </span>
                <span className="text-[10px] font-mono text-[#A9B8C8]">{operationLedger.length}</span>
              </div>
              {operationLedger.length === 0 ? (
                <div className="p-3 text-center text-[#A9B8C8] text-[11px] font-mono bg-[#07111F] rounded-xl">
                  {isAr ? 'لا توجد عمليات منفذة بعد.' : 'No tool executions yet.'}
                </div>
              ) : (
                <div className="space-y-1.5 max-h-48 overflow-y-auto font-mono text-[10px]">
                  {operationLedger.slice(0, 6).map((op, idx) => (
                    <div key={idx} className="p-2 rounded-xl bg-[#07111F] border border-[#162E48] space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className="text-white font-semibold truncate">{isAr ? op.toolLabelAr : op.toolLabel}</span>
                        <span className="text-[#35C98A] shrink-0">{op.durationMs}ms</span>
                      </div>
                      <p className="text-[#A9B8C8] line-clamp-1">{isAr ? op.outputSummaryAr : op.outputSummary}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: TOOLS & 3-TIER MEMORY                             */}
      {/* ======================================================== */}
      {activeTab === 'tools_memory' && (
        <div className="space-y-6">
          {/* 3-Tier Memory Architecture */}
          <div className="p-6 rounded-3xl bg-[#0C1B2B] border border-[#162E48] space-y-4">
            <h2 className="text-lg font-display font-bold text-white">
              {isAr ? 'الذاكرة ثلاثية الطبقات' : 'Three-Tier Mission Memory'}
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Session */}
              <div className="p-4 rounded-2xl bg-[#07111F] border border-[#162E48] space-y-2 text-xs font-mono">
                <div className="font-bold text-[#42C8F5] flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  <span>{isAr ? '1. سياق الجلسة' : '1. Session Context'}</span>
                </div>
                <div className="text-[#A9B8C8]">
                  {isAr ? 'عدد الرسائل:' : 'Turns:'} <span className="text-white">{dialogueHistory.length}</span>
                </div>
                <div className="text-[#A9B8C8]">
                  {isAr ? 'المحرك النشط:' : 'Mode:'}{' '}
                  <span className="text-[#35C98A]">{operationalMode === 'auto' ? 'Auto (Cloud + Local)' : 'Offline Edge'}</span>
                </div>
              </div>

              {/* Mission Events (Real logged healthEvents) */}
              <div className="p-4 rounded-2xl bg-[#07111F] border border-[#162E48] space-y-2 text-xs font-mono">
                <div className="font-bold text-[#35C98A] flex items-center gap-1.5">
                  <Activity className="w-4 h-4" />
                  <span>{isAr ? '2. سجل أحداث المهمة' : '2. Mission Events Log'}</span>
                </div>
                <div className="text-white">
                  {profile.missionName} · {isAr ? `اليوم ${profile.missionDay}` : `FD ${profile.missionDay}`}
                </div>
                {healthEvents.length === 0 ? (
                  <div className="text-slate-500 text-[11px]">
                    {isAr ? 'لا توجد أحداث مسجلة من المستخدم بعد.' : 'No user mission events logged yet.'}
                  </div>
                ) : (
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {healthEvents.slice(0, 5).map((evt) => (
                      <div key={evt.id} className="text-[10px] p-1.5 rounded bg-[#0C1B2B] text-slate-300">
                        • {isAr ? evt.titleAr : evt.title} ({evt.source})
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Knowledge Base */}
              <div className="p-4 rounded-2xl bg-[#07111F] border border-[#162E48] space-y-2 text-xs font-mono">
                <div className="font-bold text-[#F2B84B] flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4" />
                  <span>{isAr ? '3. مراجع المعرفة المعتمدة' : '3. Approved Standards'}</span>
                </div>
                <div className="space-y-1 max-h-36 overflow-y-auto">
                  {DEFAULT_KNOWLEDGE_BASE.map((doc) => (
                    <div key={doc.id} className="p-1.5 rounded bg-[#0C1B2B] text-[10px]">
                      <div className="text-white font-semibold truncate">{isAr ? doc.titleAr : doc.title}</div>
                      <div className="text-[#42C8F5] text-[9px]">{doc.source}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Deterministic Tool Orchestration */}
          <div className="p-6 rounded-3xl bg-[#0C1B2B] border border-[#162E48] space-y-4">
            <h2 className="text-lg font-display font-bold text-white">
              {isAr ? 'مختبر تشغيل الأدوات الهندسية' : 'Deterministic Tool Execution'}
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="p-4 rounded-2xl bg-[#07111F] border border-[#162E48] space-y-3">
                <select
                  value={selectedToolToRun}
                  onChange={(e) => {
                    const tool = e.target.value as IntelligenceToolName;
                    setSelectedToolToRun(tool);
                    if (tool === 'math_calculator_evaluator') setToolCustomParam('401000000 / 299792.458');
                    else if (tool === 'nasa_dataset_search') setToolCustomParam('space radiation transcriptomics');
                    else if (tool === 'mission_event_logger') setToolCustomParam('ARED Exercise Check');
                    else setToolCustomParam('Execute Diagnostics');
                  }}
                  className="w-full bg-[#0C1B2B] text-white text-xs p-2.5 rounded-xl border border-[#162E48]"
                >
                  <option value="math_calculator_evaluator">Calculator Evaluator</option>
                  <option value="health_data_analyzer">Health Data Analyzer</option>
                  <option value="nasa_dataset_search">NASA Dataset Search (OSDR)</option>
                  <option value="predictive_scheduler">Predictive Scheduler (ASTRA PREDICT)</option>
                  <option value="communication_simulator">Live Link Bundle Simulator</option>
                  <option value="mission_event_logger">Mission Event Logger</option>
                  <option value="report_generator">Mission Report Generator</option>
                  <option value="scientific_dataset_inspector">Dataset Inspector</option>
                </select>
                <input
                  type="text"
                  value={toolCustomParam}
                  onChange={(e) => setToolCustomParam(e.target.value)}
                  className="w-full bg-[#0C1B2B] text-white text-xs p-2.5 rounded-xl border border-[#162E48]"
                />
                <button
                  type="button"
                  onClick={handleExecuteManualTool}
                  disabled={isExecutingTool}
                  className="w-full py-2.5 rounded-xl bg-[#42C8F5] text-[#07111F] font-bold text-xs font-mono cursor-pointer flex items-center justify-center gap-2"
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>{isAr ? 'تشغيل الأداة' : 'Execute Tool'}</span>
                </button>
              </div>

              <div className="lg:col-span-2 p-4 rounded-2xl bg-[#07111F] border border-[#162E48]">
                {manualToolResult ? (
                  <div className="space-y-2 font-mono text-xs">
                    <div className="text-[#35C98A] font-bold">
                      {isAr ? manualToolResult.dispatchedRecord.outputSummaryAr : manualToolResult.dispatchedRecord.outputSummary}
                    </div>
                    <pre className="p-3 rounded-xl bg-[#0C1B2B] border border-[#162E48] text-[10px] text-slate-300 max-h-52 overflow-y-auto">
                      {JSON.stringify(manualToolResult.data, null, 2)}
                    </pre>
                  </div>
                ) : (
                  <div className="p-8 text-center text-[#A9B8C8] text-xs font-mono">
                    {isAr ? 'اختر أداة واضغط تشغيل لعرض المخرجات الفعلية.' : 'Select a tool and click Execute to inspect its verified output.'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: VALIDATION & BENCHMARKS                           */}
      {/* ======================================================== */}
      {activeTab === 'validation' && (
        <div className="space-y-6">
          {/* 9-Case AI Architecture Validation */}
          <div className="p-6 rounded-3xl bg-[#0C1B2B] border border-[#162E48] space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#162E48]">
              <div>
                <h2 className="text-lg font-display font-bold text-white">
                  {isAr ? 'اختبارات بنية الذكاء الاصطناعي (9 فحوصات)' : 'AI Architecture Validation Suite (9 Cases)'}
                </h2>
                <p className="text-xs text-[#A9B8C8]">
                  {aiArchitectureSuite.passedTests}/{aiArchitectureSuite.totalTests}{' '}
                  {isAr ? 'نجاح · دقة الحساب:' : 'Passed · Calc Accuracy:'} {aiArchitectureSuite.calculationAccuracyPercent}%
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsTestingAiSuite(true);
                  setTimeout(() => {
                    setAiArchitectureSuite(runAdvancedAiArchitectureTests());
                    setIsTestingAiSuite(false);
                  }, 300);
                }}
                className="px-4 py-2 rounded-xl bg-[#42C8F5] text-[#07111F] font-bold text-xs font-mono cursor-pointer flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isTestingAiSuite ? 'animate-spin' : ''}`} />
                <span>{isAr ? 'إعادة الاختبار' : 'Re-Run Tests'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {aiArchitectureSuite.testCases.map((tc) => (
                <div key={tc.id} className="p-3.5 rounded-2xl bg-[#07111F] border border-[#162E48] space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-[#42C8F5] font-bold">{tc.id}</span>
                    <span className="text-[#35C98A] font-bold">
                      {tc.passed ? 'PASSED' : 'FAILED'} ({tc.durationMs}ms)
                    </span>
                  </div>
                  <div className="text-xs font-bold text-white">{isAr ? tc.titleAr : tc.title}</div>
                  <p className="text-[11px] text-[#A9B8C8]">{isAr ? tc.detailsAr : tc.details}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Integration Scenarios A-G */}
          <div className="p-6 rounded-3xl bg-[#0C1B2B] border border-[#162E48] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#162E48]">
              <h3 className="text-base font-display font-bold text-white">
                {isAr ? 'سيناريوهات التكامل بين الأنظمة (A–G)' : 'Cross-Module Integration Scenarios (A–G)'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsTestingScenarios(true);
                  setTimeout(() => {
                    setIntegrationResults(runAllIntegrationScenarios());
                    setIsTestingScenarios(false);
                  }, 300);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-[#07111F] border border-[#162E48] text-[#42C8F5] text-xs font-mono cursor-pointer flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3 h-3 ${isTestingScenarios ? 'animate-spin' : ''}`} />
                <span>{isAr ? 'تشغيل A–G' : 'Run A–G'}</span>
              </button>
            </div>
            <div className="space-y-2">
              {integrationResults.map((scen) => (
                <div
                  key={scen.scenarioKey}
                  className="p-3 rounded-2xl bg-[#07111F] border border-[#162E48] flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-[#11263A] text-[#42C8F5] font-mono font-bold flex items-center justify-center shrink-0">
                      {scen.scenarioKey}
                    </span>
                    <div>
                      <div className="font-bold text-white">{isAr ? scen.titleAr : scen.title}</div>
                      <div className="text-[11px] text-[#A9B8C8]">{isAr ? scen.descriptionAr : scen.description}</div>
                    </div>
                  </div>
                  <span className="text-[#35C98A] font-mono text-[11px] shrink-0">
                    {scen.passed ? 'PASSED' : 'FAILED'} · {scen.latencyMs}ms
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Benchmarks */}
          <div className="p-6 rounded-3xl bg-[#0C1B2B] border border-[#162E48] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-display font-bold text-white">
                {isAr ? 'قياسات الأداء المباشرة' : 'Real System Benchmarks'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsMeasuringPerf(true);
                  setTimeout(() => {
                    setPerfMetrics(measureSystemPerformance());
                    setIsMeasuringPerf(false);
                  }, 250);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-[#07111F] border border-[#162E48] text-[#F2B84B] text-xs font-mono cursor-pointer flex items-center gap-1.5"
              >
                <Zap className={`w-3.5 h-3.5 ${isMeasuringPerf ? 'animate-spin' : ''}`} />
                <span>{isAr ? 'إعادة القياس' : 'Re-Measure'}</span>
              </button>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 font-mono text-xs">
              <div className="p-3.5 rounded-2xl bg-[#07111F] border border-[#162E48]">
                <span className="text-[10px] text-[#A9B8C8] block">{isAr ? 'معدل الفحص' : 'Throughput'}</span>
                <span className="text-lg font-bold text-[#35C98A]">{perfMetrics.ingestionThroughputPerSec.toLocaleString()} rec/s</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#07111F] border border-[#162E48]">
                <span className="text-[10px] text-[#A9B8C8] block">{isAr ? 'زمن الاستجابة' : 'UI Latency'}</span>
                <span className="text-lg font-bold text-[#42C8F5]">{perfMetrics.uiRenderTimeMs} ms</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#07111F] border border-[#162E48]">
                <span className="text-[10px] text-[#A9B8C8] block">{isAr ? 'مساحة التخزين' : 'Storage Used'}</span>
                <span className="text-lg font-bold text-white">{(perfMetrics.storageUsedBytes / 1024).toFixed(1)} KB</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#07111F] border border-[#162E48]">
                <span className="text-[10px] text-[#A9B8C8] block">{isAr ? 'التجاوب' : 'Mobile Ready'}</span>
                <span className="text-lg font-bold text-[#35C98A]">{perfMetrics.mobileViewportCompliant ? '100%' : 'Warn'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: ENGINEERING REPORT                                */}
      {/* ======================================================== */}
      {activeTab === 'report' && (
        <div className="p-6 rounded-3xl bg-[#0C1B2B] border border-[#162E48] space-y-6 print:p-0 print:bg-white print:text-black">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#162E48] print:border-black">
            <div>
              <h2 className="text-xl font-display font-bold text-white print:text-black">
                {isAr ? 'التقرير الهندسي النهائي والتحقق — ASTRA' : 'ASTRA Engineering Validation Report'}
              </h2>
              <p className="text-xs font-mono text-[#A9B8C8] print:text-black">
                {profile.missionName} · {isAr ? `السجلات النشطة: ${totalUserRecords}` : `Active User Records: ${totalUserRecords}`}
              </p>
            </div>
            <button
              type="button"
              onClick={() => window.print()}
              className="px-4 py-2 rounded-xl bg-[#42C8F5] text-[#07111F] font-bold text-xs font-mono cursor-pointer flex items-center gap-1.5 print:hidden"
            >
              <Printer className="w-4 h-4" />
              <span>{isAr ? 'طباعة / PDF' : 'Print / PDF'}</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs border border-[#162E48] rounded-xl overflow-hidden print:border-black">
              <thead className="bg-[#07111F] text-[#A9B8C8] print:bg-gray-100 print:text-black">
                <tr>
                  <th className="p-3">ID</th>
                  <th className="p-3">Subsystem</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Pass Rate</th>
                  <th className="p-3">Provenance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#162E48] print:divide-black text-slate-200 print:text-black">
                {reportModules.map((m) => (
                  <tr key={m.id}>
                    <td className="p-3 font-bold text-[#42C8F5] print:text-black">{m.id}</td>
                    <td className="p-3">{isAr ? m.nameAr : m.name}</td>
                    <td className="p-3 text-[#35C98A] print:text-black font-bold">{m.status}</td>
                    <td className="p-3">{m.passRatePercent}%</td>
                    <td className="p-3 text-[11px]">{m.dataSourceType.join(', ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

// Lightweight, clean Markdown renderer for bilingual chat output
function MarkdownMessage({ content }: { content: string }) {
  const lines = content.split('\n');
  return (
    <div className="space-y-1.5 font-sans">
      {lines.map((rawLine, idx) => {
        const line = rawLine.trim();
        if (!line) return <div key={idx} className="h-1" />;
        if (line === '---') return <hr key={idx} className="border-white/10 my-2" />;
        if (line.startsWith('#### ')) {
          return (
            <h4 key={idx} className="text-xs sm:text-sm font-bold text-[#42C8F5] pt-1.5">
              {renderInlineMarkdown(line.slice(5))}
            </h4>
          );
        }
        if (line.startsWith('### ')) {
          return (
            <h3 key={idx} className="text-sm sm:text-base font-bold text-white pt-1">
              {renderInlineMarkdown(line.slice(4))}
            </h3>
          );
        }
        if (line.startsWith('> ')) {
          return (
            <blockquote key={idx} className="border-s-2 border-[#F2B84B] ps-3 py-1 text-xs text-[#F2B84B]">
              {renderInlineMarkdown(line.slice(2))}
            </blockquote>
          );
        }
        if (/^[•\-*]\s+/.test(line)) {
          return (
            <div key={idx} className="flex items-start gap-2 ps-1">
              <span className="text-[#42C8F5] mt-0.5">•</span>
              <span className="flex-1">{renderInlineMarkdown(line.replace(/^[•\-*]\s+/, ''))}</span>
            </div>
          );
        }
        if (/^\d+\.\s+/.test(line)) {
          const num = line.match(/^\d+\./)?.[0] || '1.';
          return (
            <div key={idx} className="flex items-start gap-2 ps-1">
              <span className="text-[#42C8F5] font-mono font-bold shrink-0">{num}</span>
              <span className="flex-1">{renderInlineMarkdown(line.replace(/^\d+\.\s+/, ''))}</span>
            </div>
          );
        }
        return <p key={idx}>{renderInlineMarkdown(rawLine)}</p>;
      })}
    </div>
  );
}

function renderInlineMarkdown(text: string): React.ReactNode {
  const parts = text.split(/(\*\*.*?\*\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="text-white font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={i} className="px-1.5 py-0.5 rounded bg-[#0C1B2B] text-[#42C8F5] font-mono text-[11px]">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

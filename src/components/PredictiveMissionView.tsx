import React, { useState, useEffect } from 'react';
import { 
  Language, 
  MissionLinkMessage, 
  OrbitalDelayScenario, 
  PredictiveInformationItem, 
  NASAOpenDataset 
} from '../types';
import { 
  NASA_OPEN_DATASETS, 
  ORBITAL_DELAY_SCENARIOS, 
  NASA_DSN_STATIONS 
} from '../data/nasaOpenDatasets';
import { 
  calculatePredictiveSchedule, 
  runComparativeSimulationBenchmark 
} from '../utils/predictiveScheduler';
import { 
  Radio, 
  Send, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Database, 
  Cpu, 
  RefreshCw, 
  Globe, 
  ArrowRight, 
  ArrowLeft,
  Satellite, 
  Activity, 
  FileText, 
  Sparkles, 
  ShieldCheck, 
  ExternalLink, 
  Zap, 
  BarChart3, 
  User, 
  TowerControl as Tower, 
  Check, 
  CornerDownRight,
  Filter,
  Layers,
  Info
} from 'lucide-react';

interface PredictiveMissionViewProps {
  lang: Language;
}

export const PredictiveMissionView: React.FC<PredictiveMissionViewProps> = ({ lang }) => {
  const isAr = lang === 'ar';

  // Active view tab
  const [activeTab, setActiveTab] = useState<'dashboard' | 'live_link' | 'math_engine' | 'nasa_data' | 'dsn_network' | 'sim_lab'>('dashboard');

  // Selected orbital scenario
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('mars-farthest');
  const activeScenario = ORBITAL_DELAY_SCENARIOS.find((s) => s.id === selectedScenarioId) || ORBITAL_DELAY_SCENARIOS[3];

  // Predictive Schedule calculation
  const [scheduleItems, setScheduleItems] = useState<PredictiveInformationItem[]>([]);
  useEffect(() => {
    setScheduleItems(calculatePredictiveSchedule(activeScenario));
  }, [activeScenario]);

  // Live Mission Link state
  const [messages, setMessages] = useState<MissionLinkMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState<boolean>(false);
  const [roleMode, setRoleMode] = useState<'astronaut' | 'ground_control'>('astronaut');
  const [newMessageText, setNewMessageText] = useState<string>('');
  const [newPriority, setNewPriority] = useState<'CRITICAL' | 'HIGH' | 'ROUTINE'>('ROUTINE');
  const [newCategory, setNewCategory] = useState<'MEDICAL' | 'TRAJECTORY' | 'MAINTENANCE' | 'PERSONAL' | 'SCIENCE'>('MEDICAL');
  const [selectedMessageForReply, setSelectedMessageForReply] = useState<string | null>(null);
  const [replyInputText, setReplyInputText] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);

  // Offline buffer and DTN queue state
  const [isSimulatedOffline, setIsSimulatedOffline] = useState<boolean>(false);
  const [isApprovedByOfficer, setIsApprovedByOfficer] = useState<boolean>(true);
  const [offlineQueue, setOfflineQueue] = useState<MissionLinkMessage[]>(() => {
    try {
      const saved = localStorage.getItem('astra_offline_mission_queue_v1');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isSyncingQueue, setIsSyncingQueue] = useState<boolean>(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<string | null>(null);

  // Interactive Math Playground State
  const [mathPi, setMathPi] = useState<number>(0.88);
  const [mathVi, setMathVi] = useState<number>(9.5);
  const [mathKconf, setMathKconf] = useState<number>(0.94);
  const [mathFi, setMathFi] = useState<number>(1.1);
  const [mathCi, setMathCi] = useState<number>(0.65);
  const [mathPshift, setMathPshift] = useState<number>(0.10);
  const [mathDeltaDelay, setMathDeltaDelay] = useState<number>(0);

  // NASA Open Data search & filter
  const [nasaSearchQuery, setNasaSearchQuery] = useState<string>('');
  const [selectedDataCategory, setSelectedDataCategory] = useState<string>('ALL');

  // Simulation benchmark state
  const [simResults, setSimResults] = useState(() => runComparativeSimulationBenchmark(activeScenario));
  const [isSimRunning, setIsSimRunning] = useState<boolean>(false);

  // Fetch messages from server on mount
  const fetchMessages = async () => {
    setLoadingMessages(true);
    try {
      const res = await fetch('/api/mission-link/messages');
      if (res.ok) {
        const data = await res.json();
        // Merge with local offline queue items if any exist
        const serverMsgs: MissionLinkMessage[] = data.messages || [];
        setMessages([...offlineQueue, ...serverMsgs]);
      }
    } catch (err) {
      console.warn('Failed to fetch messages, using local store:', err);
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  // Update simulation when scenario changes
  useEffect(() => {
    setSimResults(runComparativeSimulationBenchmark(activeScenario));
  }, [activeScenario]);

  // Sync offline queue to server
  const handleSyncOfflineQueue = async () => {
    if (offlineQueue.length === 0 || isSyncingQueue) return;
    setIsSyncingQueue(true);
    setSyncStatusMsg(isAr ? 'جارِ تفريغ الحزم ومزامنة الخادم...' : 'Flushing bundle queue to server...');

    try {
      const res = await fetch('/api/mission-link/sync-queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: offlineQueue }),
      });

      if (res.ok) {
        const data = await res.json();
        setOfflineQueue([]);
        localStorage.removeItem('astra_offline_mission_queue_v1');
        setMessages(data.messages || []);
        setSyncStatusMsg(
          isAr
            ? `✓ تمت مزامنة ${data.syncedCount} حزمة بنجاح مع مركز التحكم!`
            : `✓ Successfully synced ${data.syncedCount} packets to Mission Control!`
        );
        setTimeout(() => setSyncStatusMsg(null), 4000);
      } else {
        throw new Error('Sync endpoint returned error');
      }
    } catch (err) {
      console.error('Queue sync failed:', err);
      setSyncStatusMsg(isAr ? 'فشلت المزامنة. تأكد من عودة الاتصال.' : 'Sync failed. Check connection.');
      setTimeout(() => setSyncStatusMsg(null), 4000);
    } finally {
      setIsSyncingQueue(false);
    }
  };

  // Send message handler with offline DTN buffering
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim() || isSending) return;

    setIsSending(true);
    const senderRole = roleMode;
    const recipientRole = roleMode === 'astronaut' ? 'ground_control' : 'astronaut';
    const senderName = roleMode === 'astronaut' ? 'Commander Elena Chen (ASTRA-1)' : 'Houston CAPCOM / Flight Director';
    const recipientName = roleMode === 'astronaut' ? 'Houston Mission Control (Flight Surgeon)' : 'Expedition 72 Crew';

    // If offline mode is toggled, buffer directly to local storage and queue
    if (isSimulatedOffline) {
      const localId = `MSG-OFFLINE-${Math.floor(1000 + Math.random() * 9000)}`;
      const offlineMsg: MissionLinkMessage = {
        id: localId,
        senderRole,
        senderName,
        recipientRole,
        recipientName,
        content: newMessageText.trim(),
        contentAr: newMessageText.trim(),
        priority: newPriority,
        category: newCategory,
        status: 'Queued',
        createdAt: Date.now(),
        sentAt: Date.now(),
        estimatedDeliveryAt: Date.now() + activeScenario.oneWayLightTimeSeconds * 1000,
        oneWayDelaySeconds: activeScenario.oneWayLightTimeSeconds,
        packetSizeBytes: Math.max(1240, newMessageText.length * 52),
        dtnHopCount: 0,
        isOfflineBuffered: true,
      };

      const updatedQueue = [offlineMsg, ...offlineQueue];
      setOfflineQueue(updatedQueue);
      try {
        localStorage.setItem('astra_offline_mission_queue_v1', JSON.stringify(updatedQueue));
      } catch (e) {
        console.warn('LocalStorage error:', e);
      }
      setMessages((prev) => [offlineMsg, ...prev]);
      setNewMessageText('');
      setIsSending(false);
      return;
    }

    try {
      const res = await fetch('/api/mission-link/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderRole,
          senderName,
          recipientRole,
          recipientName,
          content: newMessageText.trim(),
          contentAr: newMessageText.trim(),
          priority: newPriority,
          category: newCategory,
          oneWayDelaySeconds: activeScenario.oneWayLightTimeSeconds,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [data.message, ...prev]);
        setNewMessageText('');
      } else {
        throw new Error('Server returned non-200');
      }
    } catch (err) {
      console.warn('Network issue encountered. Buffering message locally:', err);
      // Fallback buffer
      const localId = `MSG-RETRY-${Math.floor(1000 + Math.random() * 9000)}`;
      const offlineMsg: MissionLinkMessage = {
        id: localId,
        senderRole,
        senderName,
        recipientRole,
        recipientName,
        content: newMessageText.trim(),
        contentAr: newMessageText.trim(),
        priority: newPriority,
        category: newCategory,
        status: 'Queued',
        createdAt: Date.now(),
        sentAt: Date.now(),
        estimatedDeliveryAt: Date.now() + activeScenario.oneWayLightTimeSeconds * 1000,
        oneWayDelaySeconds: activeScenario.oneWayLightTimeSeconds,
        packetSizeBytes: Math.max(1240, newMessageText.length * 52),
        dtnHopCount: 0,
        isOfflineBuffered: true,
      };
      const updatedQueue = [offlineMsg, ...offlineQueue];
      setOfflineQueue(updatedQueue);
      try {
        localStorage.setItem('astra_offline_mission_queue_v1', JSON.stringify(updatedQueue));
      } catch (e) {}
      setMessages((prev) => [offlineMsg, ...prev]);
      setNewMessageText('');
    } finally {
      setIsSending(false);
    }
  };

  // Acknowledge receipt
  const handleAcknowledge = async (id: string) => {
    try {
      const res = await fetch(`/api/mission-link/messages/${id}/ack`, { method: 'POST' });
      if (res.ok) {
        setMessages((prev) =>
          prev.map((m) => (m.id === id ? { ...m, status: 'Acknowledged', acknowledgedAt: Date.now() } : m))
        );
      }
    } catch (err) {
      console.error('Error acknowledging message:', err);
    }
  };

  // Reply handler
  const handleSendReply = async (id: string) => {
    if (!replyInputText.trim()) return;
    const author = roleMode === 'astronaut' ? 'Commander Elena Chen' : 'Houston Flight Surgeon / CAPCOM';
    try {
      const res = await fetch(`/api/mission-link/messages/${id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          replyText: replyInputText.trim(),
          replyAuthor: author,
        }),
      });
      if (res.ok) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === id
              ? {
                  ...m,
                  status: 'Replied',
                  replyText: replyInputText.trim(),
                  replyAuthor: author,
                  repliedAt: Date.now(),
                }
              : m
          )
        );
        setSelectedMessageForReply(null);
        setReplyInputText('');
      }
    } catch (err) {
      console.error('Error replying:', err);
    }
  };

  // Reset demo messages
  const handleResetMessages = async () => {
    try {
      const res = await fetch('/api/mission-link/reset', { method: 'POST' });
      if (res.ok) {
        fetchMessages();
      }
    } catch (err) {
      console.error('Error resetting:', err);
    }
  };

  // Filtered NASA datasets
  const filteredDatasets = NASA_OPEN_DATASETS.filter((ds) => {
    const matchesSearch =
      ds.title.toLowerCase().includes(nasaSearchQuery.toLowerCase()) ||
      ds.titleAr.includes(nasaSearchQuery) ||
      ds.summary.toLowerCase().includes(nasaSearchQuery.toLowerCase()) ||
      ds.owner.toLowerCase().includes(nasaSearchQuery.toLowerCase());
    const matchesCategory = selectedDataCategory === 'ALL' || ds.dataType === selectedDataCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-[#0C1B2B] via-[#0E2238] to-[#0C1B2B] border border-[#162E48] relative overflow-hidden shadow-2xl">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#42C8F5]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono tracking-wider uppercase font-semibold bg-[#42C8F5]/15 text-[#42C8F5] border border-[#42C8F5]/30 flex items-center gap-1.5">
                <Satellite className="w-3 h-3 text-[#42C8F5]" />
                ASTRA PREDICT · NASA SCaN COMPATIBLE
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#35C98A]/15 text-[#35C98A] border border-[#35C98A]/30">
                DTN / BUNDLE PROTOCOL
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-wide">
              {isAr ? 'نظام التنبؤ وجدولة الاتصال بين الكواكب' : 'Predictive Interplanetary Communication & Scheduling'}
            </h1>
            <p className="text-xs sm:text-sm text-[#A9B8C8] mt-1 max-w-3xl leading-relaxed">
              {isAr
                ? 'تقليل وقت انتظار المعلومات الطبية والتشغيلية في الفضاء السحيق عبر التنبؤ باحتياجات رواد الفضاء قبل حدوثها وجدولة الإرسال استناداً لدالة الجدوى التكيفية ومحاكاة سرعة الضوء.'
                : 'Minimizing deep-space telemetry & vital procedure wait times via preemptive requirement forecasting, adaptive utility scheduling, and relativistic propagation engines.'}
            </p>
          </div>

          {/* Scenario Selector */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5 bg-[#07111F]/80 p-2.5 rounded-2xl border border-[#162E48]">
            <div className="text-right sm:text-left">
              <div className="text-[10px] text-[#A9B8C8] font-mono uppercase">{isAr ? 'المسار والمسافة المدارية' : 'Orbital Geometry'}</div>
              <select
                value={selectedScenarioId}
                onChange={(e) => setSelectedScenarioId(e.target.value)}
                className="bg-[#0C1B2B] text-white font-mono text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-[#162E48] focus:border-[#42C8F5] focus:outline-none cursor-pointer mt-1"
              >
                {ORBITAL_DELAY_SCENARIOS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {isAr ? s.nameAr : s.name} ({s.oneWayLightTimeMinutes}m delay)
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2 pl-2 border-l border-[#162E48]/80">
              <div className="text-center px-2">
                <div className="text-[9px] text-[#A9B8C8] font-mono">{isAr ? 'تأخير الاتجاه الواحد' : 'One-Way Delay'}</div>
                <div className="text-xs font-mono font-bold text-[#42C8F5]">{activeScenario.oneWayLightTimeMinutes} min</div>
              </div>
              <div className="text-center px-2">
                <div className="text-[9px] text-[#A9B8C8] font-mono">{isAr ? 'ذهاب وعودة (RTT)' : 'Round-Trip (RTT)'}</div>
                <div className="text-xs font-mono font-bold text-[#F2B84B]">{activeScenario.roundTripTimeMinutes} min</div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Sub-Navigation Tabs */}
        <div className="flex items-center gap-1.5 mt-6 pt-4 border-t border-[#162E48]/80 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'dashboard', label: isAr ? 'لوحة التنبؤ والجدولة' : 'Prediction Dashboard', icon: Activity },
            { id: 'live_link', label: isAr ? 'محطة الاتصال الحي (Live Link)' : 'Live Mission Link', icon: Radio, badge: messages.length },
            { id: 'math_engine', label: isAr ? 'محرك دالة الجدوى الرياضية' : 'Scheduler Math Engine', icon: Cpu },
            { id: 'sim_lab', label: isAr ? 'مختبر المحاكاة (3 أنظمة)' : 'Simulation Lab', icon: BarChart3 },
            { id: 'nasa_data', label: isAr ? 'مستودع بيانات NASA المفتوحة' : 'NASA Open Data Explorer', icon: Database },
            { id: 'dsn_network', label: isAr ? 'شبكة الفضاء السحيق (SCaN/DSN)' : 'DSN Network Status', icon: Tower },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-sans font-medium whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#42C8F5] text-[#07111F] font-bold shadow-[0_0_15px_rgba(66,200,245,0.35)]'
                    : 'text-[#A9B8C8] hover:text-white hover:bg-[#11263A] border border-transparent'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#07111F]' : 'text-[#42C8F5]'}`} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-[#07111F] text-[#42C8F5]' : 'bg-[#162E48] text-white'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: PREDICTION DASHBOARD & TIMELINE                   */}
      {/* ======================================================== */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Status Metric Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-[#0C1B2B] border border-[#162E48]">
              <div className="flex items-center justify-between text-xs text-[#A9B8C8] mb-1 font-mono">
                <span>{isAr ? 'زمن توفر المعلومة' : 'Information Availability'}</span>
                <Clock className="w-4 h-4 text-[#42C8F5]" />
              </div>
              <div className="text-xl font-bold font-mono text-white flex items-baseline gap-1.5">
                <span>0.4 min</span>
                <span className="text-xs text-[#35C98A] font-sans">({isAr ? 'فوري بنسبة 98.7%' : 'Cached on-node'})</span>
              </div>
              <div className="text-[11px] text-[#A9B8C8] mt-1">
                {isAr ? 'مقابل 45 دقيقة بالاتصال التفاعلي' : 'vs 45.0m in standard request mode'}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#0C1B2B] border border-[#162E48]">
              <div className="flex items-center justify-between text-xs text-[#A9B8C8] mb-1 font-mono">
                <span>{isAr ? 'دقة التنبؤ بالاحتياج' : 'Prediction Accuracy'}</span>
                <Zap className="w-4 h-4 text-[#35C98A]" />
              </div>
              <div className="text-xl font-bold font-mono text-[#35C98A] flex items-baseline gap-1.5">
                <span>93.5%</span>
                <span className="text-xs text-[#F2F6FA] font-sans">({isAr ? 'عالي الثقة' : 'Multi-Factor'})</span>
              </div>
              <div className="text-[11px] text-[#A9B8C8] mt-1">
                {isAr ? 'اعتماداً على النمط الفسيولوجي والجدول' : 'Correlating biometric drift & mission phase'}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#0C1B2B] border border-[#162E48]">
              <div className="flex items-center justify-between text-xs text-[#A9B8C8] mb-1 font-mono">
                <span>{isAr ? 'كفاءة سعة القناة' : 'Bandwidth Optimization'}</span>
                <Cpu className="w-4 h-4 text-[#F2B84B]" />
              </div>
              <div className="text-xl font-bold font-mono text-white flex items-baseline gap-1.5">
                <span>78.4%</span>
                <span className="text-xs text-[#35C98A] font-sans">(-92.3% {isAr ? 'هدر' : 'waste'})</span>
              </div>
              <div className="text-[11px] text-[#A9B8C8] mt-1">
                {isAr ? 'إرسال الملفات ذات الجدوى العالية فقط' : 'Strict utility threshold filter (Ui > 2.5)'}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#0C1B2B] border border-[#162E48]">
              <div className="flex items-center justify-between text-xs text-[#A9B8C8] mb-1 font-mono">
                <span>{isAr ? 'محطة الاستقبال الأرضية' : 'Uplink Station'}</span>
                <Tower className="w-4 h-4 text-[#42C8F5]" />
              </div>
              <div className="text-base font-bold font-mono text-[#42C8F5] truncate">
                Goldstone DSS-14
              </div>
              <div className="text-[11px] text-[#A9B8C8] mt-1 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#35C98A] animate-pulse" />
                <span>70m Ka-band / Optical Link Active</span>
              </div>
            </div>
          </div>

          {/* Predictive Transmission Queue */}
          <div className="p-5 sm:p-6 rounded-3xl bg-[#0C1B2B] border border-[#162E48]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div>
                <h2 className="text-lg font-display font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#42C8F5]" />
                  {isAr ? 'قائمة البيانات المتوقعة وقرارات الإرسال المسبق' : 'Preemptive Transmission Queue & Decisions'}
                </h2>
                <p className="text-xs text-[#A9B8C8]">
                  {isAr 
                    ? 'الحسابات الرياضية لتوقيت الإرسال المبكر لضمان وصول الملف قبل الحاجة إليه (T_ready ≤ T_need)'
                    : 'Mathematical prefetch scheduling ensuring zero crew downtime upon need arrival'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg text-xs font-mono bg-[#11263A] text-[#A9B8C8] border border-[#162E48]">
                  {scheduleItems.length} {isAr ? 'عناصر مجدولة' : 'Candidate Payloads'}
                </span>
              </div>
            </div>

            <div className="space-y-3.5">
              {scheduleItems.map((item, idx) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-[#07111F]/70 border border-[#162E48] hover:border-[#42C8F5]/40 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#11263A] text-white">
                        #{idx + 1}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                        item.urgencyLevel === 'URGENT' 
                          ? 'bg-[#E85D65]/20 text-[#E85D65] border border-[#E85D65]/40'
                          : item.urgencyLevel === 'HIGH'
                          ? 'bg-[#F2B84B]/20 text-[#F2B84B] border border-[#F2B84B]/40'
                          : 'bg-[#42C8F5]/20 text-[#42C8F5] border border-[#42C8F5]/40'
                      }`}>
                        {item.urgencyLevel}
                      </span>
                      <span className="text-xs font-mono text-[#A9B8C8]">
                        {(item.fileSizeBytes / 1024 / 1024).toFixed(2)} MB
                      </span>
                      <span className="text-xs font-mono text-[#42C8F5]">
                        U_i = {item.calculatedUtility.toFixed(2)}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-white">
                      {isAr ? item.titleAr : item.title}
                    </h3>
                    <p className="text-xs text-[#A9B8C8] leading-relaxed">
                      {isAr ? item.explainabilityReasonAr : item.explainabilityReason}
                    </p>
                  </div>

                  {/* Arrival Timeline Equation Visualization */}
                  <div className="lg:w-80 shrink-0 bg-[#0C1B2B] p-3 rounded-xl border border-[#162E48]/80 text-xs font-mono space-y-2">
                    <div className="flex items-center justify-between text-[#A9B8C8] text-[11px]">
                      <span>{isAr ? 'زمن الحاجة المتوقع (T_need)' : 'Expected Need Time'}:</span>
                      <span className="text-white font-bold">+{item.estimatedNeedTimeMinutesFromNow}m</span>
                    </div>
                    <div className="flex items-center justify-between text-[#A9B8C8] text-[11px]">
                      <span>{isAr ? 'زمن الجاهزية (T_ready)' : 'Ready on Craft'}:</span>
                      <span className={item.willBeReadyOnTime ? 'text-[#35C98A] font-bold' : 'text-[#E85D65] font-bold'}>
                        +{item.tReadyMinutesFromNow}m
                      </span>
                    </div>

                    {/* Progress representation */}
                    <div className="w-full bg-[#11263A] h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${item.willBeReadyOnTime ? 'bg-gradient-to-r from-[#42C8F5] to-[#35C98A]' : 'bg-[#E85D65]'}`}
                        style={{ width: `${Math.min(100, (item.tReadyMinutesFromNow / item.estimatedNeedTimeMinutesFromNow) * 100)}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-[#162E48]/60 text-[10px]">
                      <span className="text-[#A9B8C8] truncate">Via {item.scheduledUplinkStation}</span>
                      {item.willBeReadyOnTime ? (
                        <span className="text-[#35C98A] flex items-center gap-1 font-bold">
                          <Check className="w-3 h-3" /> {isAr ? 'جاهز بالموعد' : 'On-Time'}
                        </span>
                      ) : (
                        <span className="text-[#E85D65] flex items-center gap-1 font-bold">
                          <AlertTriangle className="w-3 h-3" /> {isAr ? 'يتأخر عن الموعد' : 'Late Arrival'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: ASTRA LIVE MISSION LINK (TWO-WAY MESSAGING)       */}
      {/* ======================================================== */}
      {activeTab === 'live_link' && (
        <div className="space-y-6">
          {/* Top Control Bar: Role Switcher, Offline Simulation & Sync */}
          <div className="p-4 rounded-2xl bg-[#0C1B2B] border border-[#162E48] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-[#A9B8C8] font-mono">{isAr ? 'وضع المحطة:' : 'Console Mode:'}</span>
              <div className="flex bg-[#07111F] p-1 rounded-xl border border-[#162E48]">
                <button
                  onClick={() => setRoleMode('astronaut')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                    roleMode === 'astronaut'
                      ? 'bg-[#42C8F5] text-[#07111F] font-bold'
                      : 'text-[#A9B8C8] hover:text-white'
                  }`}
                >
                  <User className="w-3 h-3" />
                  <span>{isAr ? 'محطة رائد الفضاء (Astronaut Terminal)' : 'Astronaut Terminal'}</span>
                </button>
                <button
                  onClick={() => setRoleMode('ground_control')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                    roleMode === 'ground_control'
                      ? 'bg-[#35C98A] text-[#07111F] font-bold'
                      : 'text-[#A9B8C8] hover:text-white'
                  }`}
                >
                  <Tower className="w-3 h-3" />
                  <span>{isAr ? 'مركز التحكم الأرضي (Houston Mission Control)' : 'Ground Mission Control'}</span>
                </button>
              </div>
            </div>

            {/* Offline Simulation & Queue Sync Controls */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Simulated Network Loss Button */}
              <button
                type="button"
                onClick={() => setIsSimulatedOffline(!isSimulatedOffline)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
                  isSimulatedOffline
                    ? 'bg-[#E85D65]/20 text-[#E85D65] border-[#E85D65] animate-pulse font-bold'
                    : 'bg-[#11263A] text-[#A9B8C8] border-[#162E48] hover:text-white'
                }`}
                title={isAr ? 'محاكاة انقطاع الاتصال واختبار طابور DTN المحلي' : 'Toggle offline buffering'}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>
                  {isSimulatedOffline 
                    ? (isAr ? '● انقطاع الاتصال نشط (Offline)' : '● Link Severed (Offline)')
                    : (isAr ? 'محاكاة انقطاع الشبكة' : 'Simulate Link Loss')}
                </span>
              </button>

              {/* Flush Offline Queue Button */}
              {offlineQueue.length > 0 && (
                <button
                  type="button"
                  onClick={handleSyncOfflineQueue}
                  disabled={isSyncingQueue || isSimulatedOffline}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#F2B84B] to-[#F28C38] text-[#07111F] font-bold text-xs font-mono flex items-center gap-1.5 shadow-[0_0_15px_rgba(242,184,75,0.4)] hover:brightness-110 transition-all cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncingQueue ? 'animate-spin' : ''}`} />
                  <span>
                    {isAr ? `تفريغ ومزامنة الطابور (${offlineQueue.length})` : `Flush Queue (${offlineQueue.length})`}
                  </span>
                </button>
              )}

              <button
                onClick={fetchMessages}
                disabled={loadingMessages}
                className="px-3 py-1.5 rounded-xl bg-[#11263A] border border-[#162E48] hover:border-[#42C8F5]/50 text-xs font-mono text-[#A9B8C8] hover:text-white flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingMessages ? 'animate-spin' : ''}`} />
                <span>{isAr ? 'تحديث' : 'Sync'}</span>
              </button>
              <button
                onClick={handleResetMessages}
                className="px-3 py-1.5 rounded-xl bg-[#11263A] border border-[#162E48] text-xs font-mono text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
              >
                {isAr ? 'إعادة ضبط' : 'Reset'}
              </button>
            </div>
          </div>

          {/* Sync Status Banner */}
          {syncStatusMsg && (
            <div className="p-3 rounded-2xl bg-[#07111F] border border-[#35C98A]/50 text-xs text-[#35C98A] font-mono flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4" />
              <span>{syncStatusMsg}</span>
            </div>
          )}

          {/* Two-Way Messaging Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Compose Form */}
            <div className="lg:col-span-1 p-5 rounded-3xl bg-[#0C1B2B] border border-[#162E48] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#162E48]">
                <h3 className="text-sm font-display font-bold text-white flex items-center gap-2">
                  <Send className="w-4 h-4 text-[#42C8F5]" />
                  {roleMode === 'astronaut' 
                    ? (isAr ? 'إرسال برقية فضائية للأرض' : 'Transmit Message to Earth')
                    : (isAr ? 'إرسال تعليمات أرضية للمركبة' : 'Transmit Uplink to Craft')}
                </h3>
                <span className="text-[10px] font-mono text-[#42C8F5] px-2 py-0.5 rounded-full bg-[#42C8F5]/10 border border-[#42C8F5]/20">
                  {activeScenario.oneWayLightTimeMinutes}m delay
                </span>
              </div>

              <form onSubmit={handleSendMessage} className="space-y-3.5">
                <div>
                  <label className="text-xs font-mono text-[#A9B8C8] block mb-1">
                    {isAr ? 'الأولوية التشغيلية' : 'Message Priority'}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['ROUTINE', 'HIGH', 'CRITICAL'] as const).map((p) => (
                      <button
                        type="button"
                        key={p}
                        onClick={() => setNewPriority(p)}
                        className={`py-1.5 px-2 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                          newPriority === p
                            ? p === 'CRITICAL'
                              ? 'bg-[#E85D65] text-white font-bold'
                              : p === 'HIGH'
                              ? 'bg-[#F2B84B] text-[#07111F] font-bold'
                              : 'bg-[#42C8F5] text-[#07111F] font-bold'
                            : 'bg-[#07111F] text-[#A9B8C8] border border-[#162E48]'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-mono text-[#A9B8C8] block mb-1">
                    {isAr ? 'تصنيف الرسالة' : 'Category'}
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full bg-[#07111F] text-white text-xs font-mono p-2 rounded-xl border border-[#162E48] focus:border-[#42C8F5] focus:outline-none"
                  >
                    <option value="MEDICAL">MEDICAL (طبية وصحية)</option>
                    <option value="TRAJECTORY">TRAJECTORY (مسار وملاحة)</option>
                    <option value="MAINTENANCE">MAINTENANCE (صيانة وأنظمة)</option>
                    <option value="SCIENCE">SCIENCE (بيانات وتجارب)</option>
                    <option value="PERSONAL">PERSONAL (عائلية وشخصية)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-mono text-[#A9B8C8] block mb-1">
                    {isAr ? 'نص البرقية / الطلب' : 'Message Content'}
                  </label>
                  <textarea
                    rows={4}
                    value={newMessageText}
                    onChange={(e) => setNewMessageText(e.target.value)}
                    placeholder={
                      roleMode === 'astronaut'
                        ? (isAr ? 'اكتب الأعراض الطبية أو التقرير المداري المطلوب إرساله لهيوستن...' : 'Log medical observations, queries or vital symptoms for Flight Surgeon...')
                        : (isAr ? 'اكتب تعليمات طبيب الرحلة أو توصيات مركز التحكم للمركبة...' : 'Enter CAPCOM / Flight Surgeon recommendations for crew...')
                    }
                    className="w-full bg-[#07111F] text-white text-xs p-3 rounded-xl border border-[#162E48] focus:border-[#42C8F5] focus:outline-none placeholder:text-slate-600 resize-none leading-relaxed"
                  />
                </div>

                {/* ASTRA PREDICT Advisory Box for Comms Window */}
                <div className="p-3 rounded-2xl bg-[#07111F] border border-[#42C8F5]/30 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-[#42C8F5] flex items-center gap-1.5 text-[11px]">
                      <Sparkles className="w-3.5 h-3.5 text-[#42C8F5]" />
                      {isAr ? 'توصية ASTRA PREDICT للإرسال' : 'PREDICT Transmission Advisory'}
                    </span>
                    <span className="text-[10px] font-mono text-[#35C98A] font-bold">
                      {isAr ? 'وصول بالموعد ✓' : 'T_ready ≤ T_need ✓'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-[#A9B8C8] bg-[#0C1B2B] p-2 rounded-xl border border-[#162E48]">
                    <div>
                      {isAr ? 'احتمال الحاجة (P_i):' : 'Need Prob (P_i):'}{' '}
                      <span className="text-white font-bold">{newPriority === 'CRITICAL' ? '0.96' : newPriority === 'HIGH' ? '0.84' : '0.62'}</span>
                    </div>
                    <div>
                      {isAr ? 'زمن الجاهزية المتوقع:' : 'Arrival T_ready:'}{' '}
                      <span className="text-[#42C8F5] font-bold">+{activeScenario.oneWayLightTimeMinutes + 1.2}m</span>
                    </div>
                    <div>
                      {isAr ? 'ثقة الجدولة (K_conf):' : 'Confidence (K_conf):'}{' '}
                      <span className="text-white font-bold">94.8%</span>
                    </div>
                    <div>
                      {isAr ? 'تكلفة القناة (C_i):' : 'Link Cost (C_i):'}{' '}
                      <span className="text-[#35C98A] font-bold">0.12 (Low)</span>
                    </div>
                  </div>

                  {/* Human-in-the-Loop Approval Checkbox */}
                  <label className="flex items-center gap-2 pt-1 text-[11px] text-slate-300 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isApprovedByOfficer}
                      onChange={(e) => setIsApprovedByOfficer(e.target.checked)}
                      className="rounded border-[#162E48] text-[#42C8F5] focus:ring-[#42C8F5] bg-[#0C1B2B] w-3.5 h-3.5"
                    />
                    <span>
                      {isAr 
                        ? 'اعتماد الضابط المسؤول وموافقة طبيب الرحلة على الإرسال المسبق' 
                        : 'Flight Surgeon & Officer Preemptive Uplink Authorized'}
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isSending || !newMessageText.trim() || !isApprovedByOfficer}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#008CC8] to-[#42C8F5] text-[#07111F] font-bold text-xs font-mono shadow-[0_0_15px_rgba(66,200,245,0.4)] hover:brightness-110 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>
                    {isSending 
                      ? (isAr ? 'جارِ معالجة الحزمة...' : 'Processing Packet...') 
                      : isSimulatedOffline
                      ? (isAr ? 'حفظ الحزمة في طابور الانقطاع المحلي' : 'Buffer to Local Offline Queue')
                      : (isAr ? 'إرسال عبر شبكة الفضاء السحيق' : 'Transmit Over Deep Space Network')}
                  </span>
                </button>
              </form>

              <div className="p-3 rounded-xl bg-[#07111F]/80 border border-[#162E48] text-[11px] text-[#A9B8C8] space-y-1">
                <div className="font-mono font-bold text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#35C98A]" />
                  <span>{isAr ? 'حفظ محلي وحصانة ضد الانقطاع' : 'Local Persistence & DTN Guard'}</span>
                </div>
                <p>
                  {isAr 
                    ? 'الرسائل تُحفظ في قاعدة بيانات السيرفر أو طابور التخزين المحلي فور انقطاع الاتصال وتتم مزامنتها تلقائياً عند عودة الإشارة.'
                    : 'All telemetry packets are committed to persistent store or local queue and automatically synchronize upon reconnection.'}
                </p>
              </div>
            </div>

            {/* Right: Message Inbox & Event Timeline */}
            <div className="lg:col-span-2 p-5 rounded-3xl bg-[#0C1B2B] border border-[#162E48] flex flex-col">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#162E48]">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#42C8F5]" />
                  <h3 className="text-sm font-display font-bold text-white">
                    {isAr ? 'سجل الاتصال الفضائي والأحداث (Mission Comms Log)' : 'Mission Communications Log'}
                  </h3>
                </div>
                <span className="text-xs font-mono text-[#A9B8C8]">
                  {messages.length} {isAr ? 'حزم بيانات مسجلة' : 'Logged Packets'}
                </span>
              </div>

              {messages.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-12 text-center text-[#A9B8C8]">
                  <Satellite className="w-10 h-10 text-slate-600 mb-2 animate-pulse" />
                  <p className="text-xs">{isAr ? 'لا توجد رسائل حالياً. أرسل برقية جديدة لبدء المحاكاة.' : 'No messages in queue. Compose a new transmission to begin.'}</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[580px] overflow-y-auto pr-1">
                  {messages.map((msg) => {
                    const isFromAstronaut = msg.senderRole === 'astronaut';
                    return (
                      <div
                        key={msg.id}
                        className={`p-4 rounded-2xl border transition-all ${
                          isFromAstronaut
                            ? 'bg-[#0E2238]/60 border-[#162E48] hover:border-[#42C8F5]/50'
                            : 'bg-[#11263A]/80 border-[#1B3654] hover:border-[#35C98A]/50'
                        }`}
                      >
                        {/* Message Metadata Header */}
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2 pb-2 border-b border-[#162E48]/60 text-xs font-mono">
                          <div className="flex items-center gap-2">
                            <span className="text-white font-bold">{msg.id}</span>
                            {msg.isOfflineBuffered && (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-[#F2B84B]/20 text-[#F2B84B] border border-[#F2B84B]/50 flex items-center gap-1">
                                <Clock className="w-2.5 h-2.5" />
                                {isAr ? 'مخزن محلياً (طابور الانقطاع)' : 'Offline Queued'}
                              </span>
                            )}
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              msg.priority === 'CRITICAL'
                                ? 'bg-[#E85D65]/20 text-[#E85D65]'
                                : msg.priority === 'HIGH'
                                ? 'bg-[#F2B84B]/20 text-[#F2B84B]'
                                : 'bg-[#42C8F5]/20 text-[#42C8F5]'
                            }`}>
                              {msg.priority}
                            </span>
                            <span className="text-[10px] text-[#A9B8C8] px-1.5 py-0.5 rounded bg-[#07111F]">
                              {msg.category}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-[11px]">
                            {/* Status Indicator */}
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              msg.status === 'Replied'
                                ? 'bg-[#35C98A]/20 text-[#35C98A] border border-[#35C98A]/40'
                                : msg.status === 'Acknowledged'
                                ? 'bg-[#42C8F5]/20 text-[#42C8F5] border border-[#42C8F5]/40'
                                : 'bg-[#F2B84B]/20 text-[#F2B84B] border border-[#F2B84B]/40'
                            }`}>
                              ● {msg.status}
                            </span>
                            <span className="text-slate-400">
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>

                        {/* Sender & Recipient */}
                        <div className="text-xs text-[#A9B8C8] flex items-center gap-2 mb-2">
                          <span className="font-semibold text-white">{msg.senderName}</span>
                          <span className="text-slate-500">→</span>
                          <span>{msg.recipientName}</span>
                        </div>

                        {/* Content */}
                        <p className="text-xs text-[#F2F6FA] leading-relaxed mb-3 font-sans">
                          {isAr && msg.contentAr ? msg.contentAr : msg.content}
                        </p>

                        {/* Propagation Delay & Packet Specs */}
                        <div className="p-2 rounded-xl bg-[#07111F]/70 border border-[#162E48]/60 text-[10px] font-mono text-[#A9B8C8] flex flex-wrap items-center justify-between gap-2">
                          <div>
                            {isAr ? 'زمن انتقال الإشارة:' : 'Signal Propagation:'} <span className="text-[#42C8F5]">~{(msg.oneWayDelaySeconds / 60).toFixed(1)}m</span>
                          </div>
                          <div>
                            {isAr ? 'حجم الحزمة:' : 'Packet:'} <span className="text-white">{(msg.packetSizeBytes / 1024).toFixed(1)} KB</span>
                          </div>
                          <div>
                            {isAr ? 'قفزات DTN:' : 'DTN Hops:'} <span className="text-white">{msg.dtnHopCount} Hops</span>
                          </div>
                        </div>

                        {/* Ground Reply Display */}
                        {msg.replyText && (
                          <div className="mt-3 p-3 rounded-xl bg-[#07111F] border-l-2 border-[#35C98A] text-xs space-y-1">
                            <div className="flex items-center justify-between text-[11px] font-mono text-[#35C98A]">
                              <span className="font-bold flex items-center gap-1">
                                <CornerDownRight className="w-3 h-3" />
                                {msg.replyAuthor || 'Houston Ground Response'}
                              </span>
                              <span className="text-slate-500">
                                {msg.repliedAt ? new Date(msg.repliedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                              </span>
                            </div>
                            <p className="text-[#F2F6FA] text-xs leading-relaxed font-sans">
                              {msg.replyText}
                            </p>
                          </div>
                        )}

                        {/* Action buttons (ACK & Reply) */}
                        <div className="mt-3 pt-2 border-t border-[#162E48]/50 flex items-center justify-end gap-2 text-xs font-mono">
                          {msg.status !== 'Acknowledged' && msg.status !== 'Replied' && (
                            <button
                              onClick={() => handleAcknowledge(msg.id)}
                              className="px-2.5 py-1 rounded-lg bg-[#11263A] hover:bg-[#35C98A]/20 text-[#35C98A] border border-[#162E48] hover:border-[#35C98A]/40 transition-all flex items-center gap-1 cursor-pointer text-[11px]"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>{isAr ? 'تأكيد الاستلام الفني (ACK)' : 'Send ACK Receipt'}</span>
                            </button>
                          )}

                          {!msg.replyText && (
                            <button
                              onClick={() => setSelectedMessageForReply(selectedMessageForReply === msg.id ? null : msg.id)}
                              className="px-2.5 py-1 rounded-lg bg-[#11263A] hover:bg-[#42C8F5]/20 text-[#42C8F5] border border-[#162E48] hover:border-[#42C8F5]/40 transition-all flex items-center gap-1 cursor-pointer text-[11px]"
                            >
                              <span>{isAr ? 'كتابة رد رسمي' : 'Write Reply'}</span>
                            </button>
                          )}
                        </div>

                        {/* Inline Reply Box */}
                        {selectedMessageForReply === msg.id && (
                          <div className="mt-3 p-3 rounded-xl bg-[#07111F] border border-[#162E48] space-y-2">
                            <textarea
                              rows={2}
                              value={replyInputText}
                              onChange={(e) => setReplyInputText(e.target.value)}
                              placeholder={isAr ? 'اكتب الرد التكتيكي للرسالة...' : 'Type tactical response...'}
                              className="w-full bg-[#0C1B2B] text-white text-xs p-2 rounded-lg border border-[#162E48] focus:border-[#42C8F5] focus:outline-none"
                            />
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => setSelectedMessageForReply(null)}
                                className="px-2.5 py-1 rounded-lg text-slate-400 hover:text-white text-xs"
                              >
                                {isAr ? 'إلغاء' : 'Cancel'}
                              </button>
                              <button
                                onClick={() => handleSendReply(msg.id)}
                                className="px-3 py-1 rounded-lg bg-[#35C98A] text-[#07111F] font-bold text-xs"
                              >
                                {isAr ? 'إرسال الرد' : 'Submit Reply'}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: SCHEDULER MATH ENGINE (Enhanced Phase 2 Model)   */}
      {/* ======================================================== */}
      {activeTab === 'math_engine' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-[#0C1B2B] border border-[#162E48] space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono tracking-wider uppercase font-semibold bg-[#35C98A]/15 text-[#35C98A] border border-[#35C98A]/30">
                  {isAr ? 'نموذج رياضي إرشادي متعدد العوامل' : 'Multi-Factor Relativistic Heuristic Engine'}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#42C8F5]/15 text-[#42C8F5] border border-[#42C8F5]/30">
                  NON-BLACKBOX AUDITABLE
                </span>
              </div>
              <h2 className="text-xl font-display font-extrabold text-white flex items-center gap-2">
                <Cpu className="w-5 h-5 text-[#42C8F5]" />
                {isAr ? 'النموذج الرياضي لمحرك التنبؤ والجدولة (المرحلة الثانية)' : 'Mathematical Formulation & Arrival Engine (Phase 2)'}
              </h2>
              <p className="text-xs text-[#A9B8C8] mt-1 max-w-3xl leading-relaxed">
                {isAr
                  ? 'دالة رياضية حتمية ومعللة لا تعتمد على نماذج الشبكات العصبية العشوائية غير القابلة للتدقيق. تحسب الجدوى الفيزيائية لإرسال البيانات قبل الحاجة إليها عبر احتساب زمن سرعة الضوء وتكاليف القناة وغرامة التأخير.'
                  : 'A rigorous deterministic heuristic model evaluating preemptive payload utility without unverified black-box neural networks. It factors in speed-of-light delays, link costs, confidence scores, and deadline penalties.'}
              </p>
            </div>

            {/* Formula Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-[#07111F] border border-[#162E48] space-y-2">
                <div className="text-xs font-mono text-[#42C8F5] uppercase tracking-wider font-bold">
                  {isAr ? '1. دالة التقييم التكيفية الموسعة (Phase 2 Enhanced Utility)' : '1. Multi-Factor Adaptive Utility Function'}
                </div>
                <div className="p-3 rounded-xl bg-[#0C1B2B] font-mono text-sm sm:text-base text-center font-bold text-white border border-[#162E48]/80 text-[#42C8F5]">
                  U_i = (P_i × V_i × K_conf × F_i) − [C_i × (1 + P_shift)] − δ_delay
                </div>
                <div className="text-xs text-[#A9B8C8] space-y-1.5 pt-2 border-t border-[#162E48]/60 leading-relaxed font-sans">
                  <div>• <b className="text-white">P_i</b>: {isAr ? 'احتمال حاجة الطاقم للمعلومة (0.0 إلى 1.0)' : 'Probability of crew need (0.0 - 1.0)'}.</div>
                  <div>• <b className="text-white">V_i</b>: {isAr ? 'قيمة توفر المعلومة في الوقت المناسب (1 إلى 10)' : 'Timeliness criticality value (1 - 10)'}.</div>
                  <div>• <b className="text-[#35C98A]">K_conf</b>: {isAr ? 'معامل الثقة في التنبؤ الهندسي (0.0 إلى 1.0)' : 'Prediction confidence multiplier (0.0 - 1.0)'}.</div>
                  <div>• <b className="text-[#35C98A]">F_i</b>: {isAr ? 'حداثة البيانات ومعامل تلاشي القيمة مع الزمن (0.5 إلى 1.2)' : 'Data freshness coefficient (0.5 - 1.2)'}.</div>
                  <div>• <b className="text-[#F2B84B]">C_i</b>: {isAr ? 'تكلفة نقل البيانات وحجم الملف من سعة القناة' : 'Link bandwidth occupancy cost'}.</div>
                  <div>• <b className="text-[#F2B84B]">P_shift</b>: {isAr ? 'احتمال تغير جدول المهمة أو إلغاء الحاجة (0.0 إلى 1.0)' : 'Schedule shift risk / timeline volatility'}.</div>
                  <div>• <b className="text-[#E85D65]">δ_delay</b>: {isAr ? 'غرامة تأخير قاسية تطبق تلقائياً إذا كان T_ready > T_need' : 'Delay penalty if arrival misses need deadline'}.</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#07111F] border border-[#162E48] space-y-2">
                <div className="text-xs font-mono text-[#35C98A] uppercase tracking-wider font-bold">
                  {isAr ? '2. معادلة زمن الوصول الفيزيائي (Relativistic Arrival Timeline)' : '2. Relativistic Arrival Timeline'}
                </div>
                <div className="p-3 rounded-xl bg-[#0C1B2B] font-mono text-sm sm:text-base text-center font-bold text-white border border-[#162E48]/80 text-[#35C98A]">
                  T_ready = T_send + T_propagation + T_transfer + T_processing
                </div>
                <div className="text-xs text-[#A9B8C8] space-y-1.5 pt-2 border-t border-[#162E48]/60 leading-relaxed font-sans">
                  <div>• <b className="text-white">T_send</b>: {isAr ? 'زمن إطلاق الإرسال من الهوائي الأرضي' : 'Uplink transmission start time'}.</div>
                  <div>• <b className="text-white">T_prop</b>: {isAr ? 'زمن انتقال الموجة الكهرومغناطيسية بسرعة الضوء (المسافة ÷ C)' : 'One-way light time propagation (Distance / C)'}.</div>
                  <div>• <b className="text-white">T_transfer</b>: {isAr ? 'زمن تفريغ الحزمة (حجم الملف بالبت ÷ سعة القناة bps)' : 'Packet serialization duration (File bits / Bandwidth bps)'}.</div>
                  <div>• <b className="text-white">T_proc</b>: {isAr ? 'زمن فك التشفير وتثبيت الملف في ذاكرة المركبة' : 'Decryption, integrity verification & ingestion time'}.</div>
                  <div className="pt-2 border-t border-[#162E48]/40">
                    <div className="text-[#35C98A] font-bold">✓ {isAr ? 'شرط النجاح والتخزين المسبق' : 'Success Condition'}: <span className="font-mono text-white">T_ready ≤ T_need</span></div>
                    <div className="text-[#E85D65] font-bold">✗ {isAr ? 'شرط الفشل والإقصاء' : 'Missed Condition'}: <span className="font-mono text-white">T_ready &gt; T_need</span></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Calculator Playground with Dynamic Sliders */}
            <div className="p-5 rounded-2xl bg-[#07111F] border border-[#162E48] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h3 className="text-sm font-display font-bold text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#F2B84B]" />
                  {isAr ? 'حاسبة المحاكاة التفاعلية الحية لدالة الجدوى U_i' : 'Live Interactive Utility Simulator & Parameter Explorer'}
                </h3>
                {(() => {
                  const calculatedU = Math.round(
                    ((mathPi * mathVi * mathKconf * mathFi) - (mathCi * (1 + mathPshift)) - mathDeltaDelay) * 100
                  ) / 100;
                  return (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-[#A9B8C8]">{isAr ? 'الجدوى المحسوبة:' : 'Calculated U_i:'}</span>
                      <span className={`px-3 py-1 rounded-xl font-mono font-extrabold text-sm ${
                        calculatedU >= 6 ? 'bg-[#35C98A]/20 text-[#35C98A] border border-[#35C98A]/40' :
                        calculatedU >= 2 ? 'bg-[#F2B84B]/20 text-[#F2B84B] border border-[#F2B84B]/40' :
                        'bg-[#E85D65]/20 text-[#E85D65] border border-[#E85D65]/40'
                      }`}>
                        U_i = {calculatedU.toFixed(2)}
                      </span>
                    </div>
                  );
                })()}
              </div>

              {/* Sliders Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-mono">
                <div className="p-3 rounded-xl bg-[#0C1B2B] border border-[#162E48] space-y-1">
                  <div className="flex justify-between text-[#A9B8C8]">
                    <span>P_i (احتمال الحاجة):</span>
                    <span className="text-white font-bold">{mathPi.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={mathPi}
                    onChange={(e) => setMathPi(parseFloat(e.target.value))}
                    className="w-full accent-[#42C8F5]"
                  />
                </div>

                <div className="p-3 rounded-xl bg-[#0C1B2B] border border-[#162E48] space-y-1">
                  <div className="flex justify-between text-[#A9B8C8]">
                    <span>V_i (قيمة الأهمية 1-10):</span>
                    <span className="text-white font-bold">{mathVi.toFixed(1)}</span>
                  </div>
                  <input
                    type="range"
                    min="1.0"
                    max="10.0"
                    step="0.5"
                    value={mathVi}
                    onChange={(e) => setMathVi(parseFloat(e.target.value))}
                    className="w-full accent-[#42C8F5]"
                  />
                </div>

                <div className="p-3 rounded-xl bg-[#0C1B2B] border border-[#162E48] space-y-1">
                  <div className="flex justify-between text-[#A9B8C8]">
                    <span>K_conf (الثقة 0-1):</span>
                    <span className="text-white font-bold">{mathKconf.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.4"
                    max="1.0"
                    step="0.02"
                    value={mathKconf}
                    onChange={(e) => setMathKconf(parseFloat(e.target.value))}
                    className="w-full accent-[#35C98A]"
                  />
                </div>

                <div className="p-3 rounded-xl bg-[#0C1B2B] border border-[#162E48] space-y-1">
                  <div className="flex justify-between text-[#A9B8C8]">
                    <span>F_i (الحداثة 0.5-1.2):</span>
                    <span className="text-white font-bold">{mathFi.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="1.2"
                    step="0.05"
                    value={mathFi}
                    onChange={(e) => setMathFi(parseFloat(e.target.value))}
                    className="w-full accent-[#35C98A]"
                  />
                </div>

                <div className="p-3 rounded-xl bg-[#0C1B2B] border border-[#162E48] space-y-1">
                  <div className="flex justify-between text-[#A9B8C8]">
                    <span>C_i (تكلفة القناة):</span>
                    <span className="text-white font-bold">{mathCi.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="3.0"
                    step="0.1"
                    value={mathCi}
                    onChange={(e) => setMathCi(parseFloat(e.target.value))}
                    className="w-full accent-[#F2B84B]"
                  />
                </div>

                <div className="p-3 rounded-xl bg-[#0C1B2B] border border-[#162E48] space-y-1">
                  <div className="flex justify-between text-[#A9B8C8]">
                    <span>P_shift (مخاطر تغير الجدول):</span>
                    <span className="text-white font-bold">{mathPshift.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.0"
                    max="0.8"
                    step="0.05"
                    value={mathPshift}
                    onChange={(e) => setMathPshift(parseFloat(e.target.value))}
                    className="w-full accent-[#F2B84B]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: SIMULATION BENCHMARK LAB (3-WAY COMPARISON)       */}
      {/* ======================================================== */}
      {activeTab === 'sim_lab' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-[#0C1B2B] border border-[#162E48] space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#162E48]">
              <div>
                <span className="text-[10px] font-mono text-[#42C8F5] uppercase tracking-wider font-bold">
                  24-HOUR INTERPLANETARY MISSION BENCHMARK
                </span>
                <h2 className="text-xl font-display font-extrabold text-white mt-1">
                  {isAr ? 'مقارنة أداء الأنظمة الثلاثة للاتصال الفضائي' : 'Three-System Benchmark: Reactive vs Fixed vs ASTRA'}
                </h2>
                <p className="text-xs text-[#A9B8C8] mt-1">
                  {isAr 
                    ? 'محاكاة 100 طلب ومعلومة طبية وتشغيلية خلال يوم كامل من المهمة في الفضاء السحيق'
                    : '100 simulated telemetry & medical requests under variable deep-space relativistic lag'}
                </p>
              </div>

              <button
                onClick={() => {
                  setIsSimRunning(true);
                  setTimeout(() => {
                    setSimResults(runComparativeSimulationBenchmark(activeScenario));
                    setIsSimRunning(false);
                  }, 400);
                }}
                disabled={isSimRunning}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#008CC8] to-[#42C8F5] text-[#07111F] font-bold text-xs font-mono shadow-[0_0_15px_rgba(66,200,245,0.3)] hover:brightness-110 transition-all cursor-pointer flex items-center gap-2"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSimRunning ? 'animate-spin' : ''}`} />
                <span>{isAr ? 'إعادة تشغيل المحاكاة' : 'Re-Run Benchmark'}</span>
              </button>
            </div>

            {/* Summary Callout */}
            <div className="p-4 rounded-2xl bg-[#07111F] border border-[#42C8F5]/30 text-xs text-[#F2F6FA] leading-relaxed">
              <span className="font-bold text-[#42C8F5] block mb-1">
                {isAr ? '📌 خلاصة التجربة والتحليل الهندسي المقارن:' : '📌 Comparative Engineering Summary:'}
              </span>
              {isAr ? simResults.simulationSummaryAr : simResults.simulationSummaryEn}
            </div>

            {/* Three System Comparison Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {simResults.results.map((sys) => {
                const isAstra = sys.modeName === 'C_ASTRA_PREDICTIVE';
                const isFixed = sys.modeName === 'B_FIXED_PREFETCH';
                return (
                  <div
                    key={sys.modeName}
                    className={`p-5 rounded-3xl border flex flex-col justify-between transition-all ${
                      isAstra
                        ? 'bg-gradient-to-b from-[#0E2238] to-[#0C1B2B] border-[#42C8F5] shadow-[0_0_25px_rgba(66,200,245,0.2)]'
                        : isFixed
                        ? 'bg-[#07111F] border-[#162E48]'
                        : 'bg-[#07111F] border-[#162E48]'
                    }`}
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                          isAstra
                            ? 'bg-[#42C8F5] text-[#07111F]'
                            : 'bg-[#11263A] text-[#A9B8C8]'
                        }`}>
                          {sys.modeName === 'A_REACTIVE' ? 'SYSTEM A' : sys.modeName === 'B_FIXED_PREFETCH' ? 'SYSTEM B' : 'SYSTEM C (ASTRA)'}
                        </span>
                        {isAstra && (
                          <span className="text-[10px] font-mono text-[#35C98A] font-bold">
                            ★ RECOMMENDED
                          </span>
                        )}
                      </div>

                      <h3 className="text-sm font-bold text-white">
                        {isAr ? sys.labelAr : sys.label}
                      </h3>

                      {/* Metrics List */}
                      <div className="space-y-2 text-xs font-mono pt-3 border-t border-[#162E48]/80">
                        <div className="flex items-center justify-between">
                          <span className="text-[#A9B8C8]">{isAr ? 'متوسط زمن الانتظار:' : 'Avg Wait Time:'}</span>
                          <span className={`font-bold ${isAstra ? 'text-[#35C98A] text-sm' : 'text-white'}`}>
                            {sys.avgWaitTimeMinutes} min
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-[#A9B8C8]">{isAr ? 'نسبة الوصول بالموعد:' : 'On-Time Delivery:'}</span>
                          <span className={`font-bold ${sys.onTimeDeliveryRatePercent > 90 ? 'text-[#35C98A]' : 'text-[#F2B84B]'}`}>
                            {sys.onTimeDeliveryRatePercent}%
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-[#A9B8C8]">{isAr ? 'دقة الإرسال (Precision):' : 'Precision:'}</span>
                          <span className={`font-bold ${sys.predictionPrecisionPercent > 90 ? 'text-[#35C98A]' : 'text-slate-300'}`}>
                            {sys.predictionPrecisionPercent}%
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-[#A9B8C8]">{isAr ? 'تغطية الاحتياج (Recall):' : 'Recall:'}</span>
                          <span className={`font-bold ${sys.predictionRecallPercent > 90 ? 'text-[#35C98A]' : 'text-[#E85D65]'}`}>
                            {sys.predictionRecallPercent}%
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-[#A9B8C8]">{isAr ? 'البيانات المهدرة:' : 'Wasted Bandwidth:'}</span>
                          <span className={`font-bold ${sys.wastedBandwidthMB > 100 ? 'text-[#E85D65]' : 'text-slate-300'}`}>
                            {sys.wastedBandwidthMB} MB
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-[#A9B8C8]">{isAr ? 'استغلال سعة القناة:' : 'Link Utilization:'}</span>
                          <span className="font-bold text-white">
                            {sys.bandwidthUtilizationPercent}%
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-[#A9B8C8]">{isAr ? 'حداثة البيانات:' : 'Data Freshness:'}</span>
                          <span className="font-bold text-[#42C8F5] text-[10px]">
                            {isAr ? sys.dataFreshnessRatingAr : sys.dataFreshnessRating}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-[#A9B8C8]">{isAr ? 'فوات الموعد:' : 'Missed Deadlines:'}</span>
                          <span className={`font-bold ${sys.missedDeadlineCount > 10 ? 'text-[#E85D65]' : 'text-[#35C98A]'}`}>
                            {sys.missedDeadlineCount} / 100
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#162E48]/80 text-[11px] text-[#A9B8C8]">
                      {isAstra
                        ? (isAr ? 'توفير فوري للمعلومة عند الحاجة مع تقليص الهدر بنسبة 92.5%.' : 'Zero crew latency. Preempts needs using adaptive utility scoring.')
                        : isFixed
                        ? (isAr ? 'هدر كبير لسعة الاتصال بإرسال ملفات غير مطلوبة.' : 'Wastes massive bandwidth on unused files and clogs channel.')
                        : (isAr ? 'فشل حتمي للبيانات الحساسة بسبب تأخير سرعة الضوء.' : 'Unusable for time-critical emergencies due to round-trip lag.')}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 5: NASA OPEN DATA EXPLORER                           */}
      {/* ======================================================== */}
      {activeTab === 'nasa_data' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-[#0C1B2B] border border-[#162E48] space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#162E48]">
              <div>
                <span className="text-[10px] font-mono text-[#35C98A] uppercase tracking-wider font-bold">
                  OFFICIAL OPEN SCIENCE CONNECTOR
                </span>
                <h2 className="text-xl font-display font-extrabold text-white mt-1">
                  {isAr ? 'مستكشف بيانات NASA المفتوحة' : 'NASA Open Data Repositories & Catalogs'}
                </h2>
                <p className="text-xs text-[#A9B8C8] mt-1 max-w-2xl">
                  {isAr
                    ? 'بيانات ومستودعات وكالة ناسا الرسمية المعتمدة لعلوم فسيولوجيا الفضاء والإشعاع ونظم البيئة.'
                    : 'Curated NASA scientific portals (OSDR, GeneLab, DONKI, HRP, ECLSS) with verified links and license terms.'}
                </p>
              </div>

              {/* Disclaimer Notice Box */}
              <div className="p-3 rounded-2xl bg-[#07111F] border border-[#F2B84B]/30 max-w-md text-[11px] text-[#A9B8C8] space-y-1">
                <div className="text-[#F2B84B] font-bold font-mono flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>{isAr ? 'تنبيه أمان وإفصاح علمي رسمي' : 'Official Data Disclosure'}</span>
                </div>
                <p>
                  {isAr
                    ? 'بيانات NASA المفتوحة ليست قناة اتصال تشغيلية مع أي مركبة فضائية حية. الروابط مخصصة للبحث والتحليل العلمي فقط.'
                    : 'NASA Open Data sets are public scientific research repositories, NOT tactical flight communication uplinks.'}
                </p>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <input
                  type="text"
                  value={nasaSearchQuery}
                  onChange={(e) => setNasaSearchQuery(e.target.value)}
                  placeholder={isAr ? 'ابحث في مجموعات بيانات ناسا المفتوحة...' : 'Search NASA datasets, APIs, and portals...'}
                  className="w-full bg-[#07111F] text-white text-xs pl-3 pr-9 py-2.5 rounded-xl border border-[#162E48] focus:border-[#42C8F5] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
                {['ALL', 'PHYSIOLOGICAL', 'CIRCADIAN_SLEEP', 'RADIATION', 'GENOMIC', 'HABITAT_ENVIRONMENT'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedDataCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono whitespace-nowrap transition-all cursor-pointer ${
                      selectedDataCategory === cat
                        ? 'bg-[#42C8F5] text-[#07111F] font-bold'
                        : 'bg-[#07111F] text-[#A9B8C8] hover:text-white border border-[#162E48]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Datasets Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredDatasets.map((ds) => (
                <div
                  key={ds.id}
                  className="p-5 rounded-2xl bg-[#07111F] border border-[#162E48] hover:border-[#42C8F5]/40 transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#11263A] text-[#42C8F5] border border-[#42C8F5]/20">
                        {ds.portal}
                      </span>
                      <span className="text-[10px] font-mono text-[#35C98A]">
                        {ds.isFullyOpen ? (isAr ? 'مفتوح كلياً' : '100% Open Access') : (isAr ? 'يحتاج تسجيل' : 'API Key Req')}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-white">
                      {isAr ? ds.titleAr : ds.title}
                    </h3>
                    <p className="text-xs text-[#A9B8C8] leading-relaxed">
                      {isAr ? ds.summaryAr : ds.summary}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#162E48]/70 text-[11px] font-mono space-y-2 text-[#A9B8C8]">
                    <div className="flex items-center justify-between">
                      <span>{isAr ? 'الجهة المالكة:' : 'Owner:'}</span>
                      <span className="text-white truncate max-w-[200px]">{ds.owner}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>{isAr ? 'شروط الاستخدام:' : 'License:'}</span>
                      <span className="text-[#35C98A] truncate max-w-[200px]">{isAr ? ds.termsAndRestrictionsAr : ds.termsAndRestrictions}</span>
                    </div>

                    <a
                      href={ds.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full mt-2 py-2 px-3 rounded-xl bg-[#0C1B2B] hover:bg-[#42C8F5]/10 border border-[#162E48] hover:border-[#42C8F5]/40 text-[#42C8F5] text-xs font-mono font-semibold flex items-center justify-center gap-1.5 transition-all"
                    >
                      <span>{isAr ? 'فتح المصدر الرسمي في بوابة NASA' : 'Open NASA Source Portal'}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 6: NASA SCaN & DSN GROUND STATIONS                   */}
      {/* ======================================================== */}
      {activeTab === 'dsn_network' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-[#0C1B2B] border border-[#162E48] space-y-6">
            <div>
              <span className="text-[10px] font-mono text-[#42C8F5] uppercase tracking-wider font-bold">
                NASA SPACE COMMUNICATIONS AND NAVIGATION (SCaN)
              </span>
              <h2 className="text-xl font-display font-extrabold text-white mt-1">
                {isAr ? 'مجمعات وهوائيات شبكة الفضاء السحيق (DSN)' : 'Deep Space Network (DSN) Antennas & Stations'}
              </h2>
              <p className="text-xs text-[#A9B8C8] mt-1">
                {isAr
                  ? 'الهوائيات الأرضية الثلاثية العملاقة موزعة بزاوية 120 درجة حول كوكب الأرض لضمان اتصال مستمر بالمركبات الفضائية.'
                  : 'Three major ground complexes separated by 120 degrees of longitude to provide continuous 24/7 deep space tracking.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {NASA_DSN_STATIONS.map((station) => (
                <div
                  key={station.id}
                  className="p-5 rounded-2xl bg-[#07111F] border border-[#162E48] space-y-4"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-[#162E48]">
                    <span className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                      <Tower className="w-4 h-4 text-[#42C8F5]" />
                      {station.id.toUpperCase()}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#35C98A]/20 text-[#35C98A]">
                      {station.status}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-white">{isAr ? station.nameAr : station.name}</h3>
                    <p className="text-xs text-[#A9B8C8] mt-1">{station.location}</p>
                  </div>

                  <div className="space-y-1.5 text-xs font-mono text-[#A9B8C8] pt-2 border-t border-[#162E48]/60">
                    <div className="text-[11px]">
                      <span className="text-slate-400">{isAr ? 'الإحداثيات:' : 'Coords:'}</span> {station.coordinates}
                    </div>
                    <div className="text-[11px]">
                      <span className="text-slate-400">{isAr ? 'نطاق التردد:' : 'Band:'}</span> {station.frequencyBand}
                    </div>
                    <div className="text-[11px]">
                      <span className="text-slate-400">{isAr ? 'المركبة المتعقبة:' : 'Tracking:'}</span> <span className="text-[#42C8F5]">{station.targetCraft}</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <div className="text-[10px] font-mono text-slate-400 mb-1">{isAr ? 'الهوائيات النشطة:' : 'Active Dishes:'}</div>
                    <div className="flex flex-wrap gap-1">
                      {station.antennas.map((ant) => (
                        <span key={ant} className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0C1B2B] text-slate-300 border border-[#162E48]">
                          {ant}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

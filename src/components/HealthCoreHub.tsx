import React, { useState } from 'react';
import { 
  Language, 
  SleepRecord, 
  WellnessRecord, 
  RespiratoryRecord, 
  BodyMetricRecord, 
  HealthEventRecord,
  DataSource 
} from '../types';
import { 
  PHYSIOLOGICAL_RANGES, 
  validateBodyMetric, 
  detectMissingHealthData, 
  importSleepFromCsv, 
  importHealthDataFromJson, 
  exportRecordsToCsv 
} from '../utils/healthCoreEngine';
import { 
  NASA_BIG_DATA_CATALOG, 
  queryNASABigDataCatalog, 
  NASABigDataRecord 
} from '../data/nasaBigDataCatalog';
import { 
  Activity, 
  Heart, 
  FileSpreadsheet, 
  Database, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  Download, 
  Upload, 
  Search, 
  ExternalLink, 
  Clock, 
  Plus, 
  Filter, 
  ShieldCheck, 
  Sparkles,
  Info,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  FileText
} from 'lucide-react';

interface HealthCoreHubProps {
  sleepRecords: SleepRecord[];
  wellnessRecords: WellnessRecord[];
  respiratoryRecords: RespiratoryRecord[];
  bodyMetrics: BodyMetricRecord[];
  healthEvents: HealthEventRecord[];
  onSaveSleepRecord: (record: SleepRecord) => void;
  onSaveBodyMetric: (record: BodyMetricRecord) => void;
  onSaveHealthEvent: (event: HealthEventRecord) => void;
  onBatchImportSleep: (records: SleepRecord[]) => void;
  onBatchImportBodyMetrics: (records: BodyMetricRecord[]) => void;
  lang: Language;
}

export const HealthCoreHub: React.FC<HealthCoreHubProps> = ({
  sleepRecords,
  wellnessRecords,
  respiratoryRecords,
  bodyMetrics,
  healthEvents,
  onSaveBodyMetric,
  onSaveHealthEvent,
  onBatchImportSleep,
  onBatchImportBodyMetrics,
  lang,
}) => {
  const isAr = lang === 'ar';
  const [activeTab, setActiveTab] = useState<'timeline' | 'vitals_entry' | 'data_import' | 'nasa_catalog'>('timeline');

  // Manual Vitals Entry state
  const [vitalsDate, setVitalsDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [vitalsTime, setVitalsTime] = useState<string>('08:00');
  const [heartRate, setHeartRate] = useState<string>('68');
  const [bpSys, setBpSys] = useState<string>('118');
  const [bpDia, setBpDia] = useState<string>('76');
  const [spO2, setSpO2] = useState<string>('99');
  const [coreTemp, setCoreTemp] = useState<string>('36.7');
  const [activityContext, setActivityContext] = useState<'rest' | 'post_exercise' | 'eva' | 'pre_sleep'>('rest');
  const [notes, setNotes] = useState<string>('');
  const [entrySource, setEntrySource] = useState<DataSource>('measured');
  const [entrySuccessMessage, setEntrySuccessMessage] = useState<string | null>(null);

  // Import / Export state
  const [importText, setImportText] = useState<string>('');
  const [importFormat, setImportFormat] = useState<'csv' | 'json'>('csv');
  const [importTargetType, setImportTargetType] = useState<'sleep' | 'body'>('sleep');
  const [importPreview, setImportPreview] = useState<{
    total: number;
    valid: number;
    rejected: number;
    errors: string[];
    records: any[];
  } | null>(null);

  // NASA Catalog state
  const [catalogSearch, setCatalogSearch] = useState<string>('');
  const [selectedDomain, setSelectedDomain] = useState<string>('ALL');
  const [catalogPage, setCatalogPage] = useState<number>(1);

  // Calculate missing data for recent 5 days
  const recentDays = [
    '2026-11-06',
    '2026-11-05',
    '2026-11-04',
    '2026-11-03',
    '2026-11-02',
  ];
  const missingDataGaps = detectMissingHealthData(recentDays, sleepRecords, wellnessRecords, respiratoryRecords);

  // Provenance counts
  const allRecordsCount = sleepRecords.length + wellnessRecords.length + respiratoryRecords.length + bodyMetrics.length;
  const measuredCount = bodyMetrics.filter((b) => b.source === 'measured').length;
  const userLoggedCount = sleepRecords.filter((s) => s.source === 'user_logged').length + wellnessRecords.length;
  const importedCount = sleepRecords.filter((s) => s.source === 'imported').length + bodyMetrics.filter((b) => b.source === 'imported').length;
  const simulatedCount = respiratoryRecords.filter((r) => r.isSimulated || r.source === 'simulated').length;

  // Manual entry submission
  const handleVitalsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const candidate: Partial<BodyMetricRecord> = {
      date: vitalsDate,
      time: vitalsTime,
      heartRateBpm: heartRate ? Number(heartRate) : null,
      bloodPressureSys: bpSys ? Number(bpSys) : null,
      bloodPressureDia: bpDia ? Number(bpDia) : null,
      spO2Percent: spO2 ? Number(spO2) : null,
      coreTempC: coreTemp ? Number(coreTemp) : null,
      activityContext,
      source: entrySource,
      notes: notes.trim(),
    };

    const validation = validateBodyMetric(candidate);
    if (!validation.isValid) {
      const errMsgs = Object.values(validation.fieldErrors).join(', ');
      alert(isAr ? `خطأ في التحقق الفسيولوجي: ${errMsgs}` : `Physiological validation error: ${errMsgs}`);
      return;
    }

    const newMetric: BodyMetricRecord = {
      id: `body-${Date.now()}`,
      date: vitalsDate,
      time: vitalsTime,
      heartRateBpm: candidate.heartRateBpm!,
      bloodPressureSys: candidate.bloodPressureSys!,
      bloodPressureDia: candidate.bloodPressureDia!,
      spO2Percent: candidate.spO2Percent!,
      coreTempC: candidate.coreTempC!,
      activityContext,
      source: entrySource,
      notes: notes.trim() || undefined,
      timestamp: Date.now(),
      isValidated: true,
    };

    onSaveBodyMetric(newMetric);

    // Also append to health event timeline
    onSaveHealthEvent({
      id: `evt-${Date.now()}`,
      timestamp: Date.now(),
      date: vitalsDate,
      time: vitalsTime,
      category: 'CARDIO',
      title: 'Body Vitals Logged',
      titleAr: 'تسجيل مؤشرات حيوية جديدة',
      description: `HR: ${newMetric.heartRateBpm} bpm, BP: ${newMetric.bloodPressureSys}/${newMetric.bloodPressureDia} mmHg, SpO2: ${newMetric.spO2Percent}%, Temp: ${newMetric.coreTempC}°C`,
      descriptionAr: `النبض: ${newMetric.heartRateBpm} ن/د، الضغط: ${newMetric.bloodPressureSys}/${newMetric.bloodPressureDia} مم زئبق، تشبع الأكسجين: ${newMetric.spO2Percent}%، الحرارة: ${newMetric.coreTempC}°م`,
      severity: (newMetric.heartRateBpm && newMetric.heartRateBpm > 100) || (newMetric.spO2Percent && newMetric.spO2Percent < 95) ? 'WARNING' : 'NOMINAL',
      source: entrySource,
    });

    setEntrySuccessMessage(isAr ? 'تم التحقق من النطاقات الفسيولوجية وحفظ القياس بنجاح.' : 'Physiological ranges verified and record saved successfully.');
    setTimeout(() => setEntrySuccessMessage(null), 4000);
  };

  // Preview import
  const handleParseImport = () => {
    if (!importText.trim()) return;

    if (importFormat === 'csv') {
      const result = importSleepFromCsv(importText);
      setImportPreview({
        total: result.totalProcessed,
        valid: result.importedCount,
        rejected: result.rejectedCount,
        errors: result.errors,
        records: result.records,
      });
    } else {
      const result = importHealthDataFromJson(importText, importTargetType);
      setImportPreview({
        total: result.totalProcessed,
        valid: result.importedCount,
        rejected: result.rejectedCount,
        errors: result.errors,
        records: result.data,
      });
    }
  };

  // Commit import
  const handleCommitImport = () => {
    if (!importPreview || importPreview.valid === 0) return;

    if (importTargetType === 'sleep') {
      onBatchImportSleep(importPreview.records);
    } else {
      onBatchImportBodyMetrics(importPreview.records);
    }

    onSaveHealthEvent({
      id: `evt-imp-${Date.now()}`,
      timestamp: Date.now(),
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      category: 'DATA_IMPORT',
      title: `Batch Import Completed (${importPreview.valid} records)`,
      titleAr: `تم استيراد دفعة بيانات بنجاح (${importPreview.valid} سجل)`,
      description: `Imported ${importPreview.valid} verified entries into Health Core. Provenance tagged as 'imported'.`,
      descriptionAr: `تم دمج ${importPreview.valid} قياس فسيولوجي مفحوص في نظام Health Core مع وسم المصدر بـ 'imported'.`,
      severity: 'NOMINAL',
      source: 'imported',
    });

    alert(isAr ? `تم استيراد ${importPreview.valid} سجل بنجاح في قاعدة البيانات.` : `Successfully imported ${importPreview.valid} records into Health Core.`);
    setImportPreview(null);
    setImportText('');
  };

  // Export handlers
  const handleDownloadCsv = (type: 'sleep' | 'body') => {
    const records = type === 'sleep' ? sleepRecords : bodyMetrics;
    const csvContent = exportRecordsToCsv(records, type);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ASTRA_HealthCore_${type}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Ingest sample from NASA catalog
  const handleIngestNasaSample = (dataset: NASABigDataRecord) => {
    if (!dataset.sampleRows || dataset.sampleRows.length === 0) {
      alert(isAr ? 'عينة البيانات غير مفعلة لهذا السجل.' : 'Sample data not available for this catalog entry.');
      return;
    }

    if (dataset.domain === 'PHYSIOLOGY') {
      const recordsToIngest: BodyMetricRecord[] = dataset.sampleRows.map((r, i) => ({
        id: `nasa-lsda-${Date.now()}-${i}`,
        date: r.date,
        time: '08:00',
        heartRateBpm: r.heartRateBpm,
        bloodPressureSys: r.bloodPressureSys,
        bloodPressureDia: r.bloodPressureDia,
        spO2Percent: r.spO2Percent,
        coreTempC: r.coreTempC,
        activityContext: 'rest',
        source: 'imported',
        notes: `Imported from NASA LSDA (${dataset.id})`,
        timestamp: Date.now(),
        isValidated: true,
      }));
      onBatchImportBodyMetrics(recordsToIngest);
      alert(isAr ? `تم استيراد ${recordsToIngest.length} سجلات فسيولوجية حقيقية من أرشيف ناسا LSDA بنجاح!` : `Imported ${recordsToIngest.length} real NASA LSDA records into Health Core!`);
    } else if (dataset.domain === 'SLEEP_CIRCADIAN') {
      const recordsToIngest: SleepRecord[] = dataset.sampleRows.map((r, i) => ({
        id: `nasa-hrp-${Date.now()}-${i}`,
        date: r.date,
        bedtime: r.bedtime,
        wakeTime: r.wakeTime,
        durationMinutes: r.durationMinutes,
        goalMinutes: 480,
        qualityRating: r.qualityRating,
        disturbances: ['NASA Actigraphy Dataset'],
        source: 'imported',
        timestamp: Date.now(),
        isValidated: true,
      }));
      onBatchImportSleep(recordsToIngest);
      alert(isAr ? `تم استيراد ${recordsToIngest.length} سجلات نوم حقيقية من برنامج أبحاث الإنسان (NASA HRP)!` : `Imported ${recordsToIngest.length} real NASA HRP sleep records into Health Core!`);
    }
  };

  // Query NASA catalog
  const catalogQuery = queryNASABigDataCatalog({
    searchQuery: catalogSearch,
    domain: selectedDomain,
    page: catalogPage,
    pageSize: 3,
  });

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-[#0C1B2B] via-[#0F243A] to-[#0C1B2B] border border-[#162E48] relative overflow-hidden shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono tracking-wider uppercase font-semibold bg-[#35C98A]/15 text-[#35C98A] border border-[#35C98A]/30 flex items-center gap-1.5">
                <ShieldCheck className="w-3 h-3 text-[#35C98A]" />
                ASTRA HEALTH CORE · PHASE 1
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#42C8F5]/15 text-[#42C8F5] border border-[#42C8F5]/30">
                PROVENANCE AUDITED
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-wide">
              {isAr ? 'نواة الصحة وبيانات NASA المفتوحة' : 'Health Core & NASA Data Foundation'}
            </h1>
            <p className="text-xs sm:text-sm text-[#A9B8C8] mt-1 max-w-3xl leading-relaxed">
              {isAr
                ? 'إدارة القياسات الفسيولوجية لرواد الفضاء، فحص النطاقات الطبية المعتمدة، تصنيف مصادر البيانات (مقاسة، مبلّغة، مستوردة، محاكاة)، وربط مستودعات ناسا المفتوحة.'
                : 'Managing aerospace physiological metrics, unit & envelope validation, multi-tier data provenance, and authentic NASA Open Data integration.'}
            </p>
          </div>

          {/* Provenance Quick Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#07111F]/80 p-2.5 rounded-2xl border border-[#162E48]">
            <div className="text-center px-2">
              <div className="text-[9px] text-[#A9B8C8] font-mono">{isAr ? 'مقاسة بالمستشعر' : 'Measured'}</div>
              <div className="text-sm font-mono font-bold text-[#35C98A]">{measuredCount}</div>
            </div>
            <div className="text-center px-2">
              <div className="text-[9px] text-[#A9B8C8] font-mono">{isAr ? 'مبلّغة يدويًا' : 'User Logged'}</div>
              <div className="text-sm font-mono font-bold text-[#42C8F5]">{userLoggedCount}</div>
            </div>
            <div className="text-center px-2">
              <div className="text-[9px] text-[#A9B8C8] font-mono">{isAr ? 'مستوردة (NASA)' : 'Imported'}</div>
              <div className="text-sm font-mono font-bold text-[#8B7CFF]">{importedCount}</div>
            </div>
            <div className="text-center px-2">
              <div className="text-[9px] text-[#A9B8C8] font-mono">{isAr ? 'محاكاة مدارية' : 'Simulated'}</div>
              <div className="text-sm font-mono font-bold text-[#F2B84B]">{simulatedCount}</div>
            </div>
          </div>
        </div>

        {/* Missing Data Warning Alert if any */}
        {missingDataGaps.length > 0 && (
          <div className="mt-4 p-3 rounded-2xl bg-[#F2B84B]/10 border border-[#F2B84B]/30 flex items-center justify-between gap-3 text-xs text-[#F2B84B]">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#F2B84B] shrink-0 animate-pulse" />
              <span>
                {isAr
                  ? `تنبيه اكتمال البيانات: تم رصد نقص في تسجيلات (${missingDataGaps.map((g) => `${g.date}: ${g.missingTypes.join(', ')}`).join(' | ')})`
                  : `Telemetry Gap Detected: Missing daily entries for (${missingDataGaps.map((g) => `${g.date}: ${g.missingTypes.join(', ')}`).join(' | ')})`}
              </span>
            </div>
            <button
              onClick={() => setActiveTab('vitals_entry')}
              className="px-2.5 py-1 rounded-xl bg-[#F2B84B] text-[#07111F] font-bold text-[10px] font-mono hover:opacity-90 transition-opacity"
            >
              {isAr ? 'استكمال القياسات الآن' : 'Log Now'}
            </button>
          </div>
        )}

        {/* Sub-Tabs */}
        <div className="flex items-center gap-2 mt-5 pt-4 border-t border-[#162E48]/80 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'timeline', label: isAr ? 'الخط الزمني للأحداث الصحية' : 'Health Event Timeline', icon: Calendar },
            { id: 'vitals_entry', label: isAr ? 'تسجيل المؤشرات الحيوية وفحص النطاق' : 'Vitals Entry & Validation', icon: Heart },
            { id: 'data_import', label: isAr ? 'استيراد وتصدير CSV / JSON' : 'CSV / JSON Ingestion', icon: FileSpreadsheet },
            { id: 'nasa_catalog', label: isAr ? 'فهرس ومستودعات NASA المفتوحة' : 'NASA Big Data Foundation', icon: Database },
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
                    : 'text-[#A9B8C8] hover:text-white hover:bg-[#11263A]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#07111F]' : 'text-[#42C8F5]'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: HEALTH EVENT TIMELINE                             */}
      {/* ======================================================== */}
      {activeTab === 'timeline' && (
        <div className="p-5 sm:p-6 rounded-3xl bg-[#0C1B2B] border border-[#162E48] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#162E48]">
            <div>
              <h2 className="text-base font-display font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#42C8F5]" />
                {isAr ? 'الخط الزمني الطبي للأحداث الفسيولوجية' : 'Chronological Health & Physiological Event Stream'}
              </h2>
              <p className="text-xs text-[#A9B8C8] mt-0.5">
                {isAr
                  ? 'تسجيل موثق بالطابع الزمني لكل حدث صحي، نوبة تكيف، وتمرين بدني في المهمة.'
                  : 'Time-stamped audit log of physiological adaptations, sleep cycles, and sensor logs.'}
              </p>
            </div>
            <span className="text-xs font-mono text-[#A9B8C8]">
              {healthEvents.length} {isAr ? 'أحداث مسجلة' : 'Events Logged'}
            </span>
          </div>

          <div className="space-y-3">
            {healthEvents.map((evt) => (
              <div
                key={evt.id}
                className="p-4 rounded-2xl bg-[#07111F]/80 border border-[#162E48] hover:border-[#42C8F5]/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-mono font-bold text-white">
                      {evt.date} · {evt.time}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      evt.severity === 'ALERT'
                        ? 'bg-[#E85D65]/20 text-[#E85D65] border border-[#E85D65]/40'
                        : evt.severity === 'WARNING'
                        ? 'bg-[#F2B84B]/20 text-[#F2B84B] border border-[#F2B84B]/40'
                        : 'bg-[#35C98A]/20 text-[#35C98A] border border-[#35C98A]/40'
                    }`}>
                      {evt.severity}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-[#11263A] text-[10px] font-mono text-[#A9B8C8]">
                      {evt.category}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      [{evt.source.toUpperCase()}]
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white">
                    {isAr ? evt.titleAr : evt.title}
                  </h3>
                  <p className="text-xs text-[#A9B8C8] leading-relaxed">
                    {isAr ? evt.descriptionAr : evt.description}
                  </p>
                </div>

                <div className="text-left sm:text-right shrink-0">
                  <span className="text-[10px] font-mono text-[#42C8F5]">
                    Expedition 72 Log
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: VITALS ENTRY & PHYSIOLOGICAL VALIDATION           */}
      {/* ======================================================== */}
      {activeTab === 'vitals_entry' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Entry Form */}
          <div className="lg:col-span-2 p-5 sm:p-6 rounded-3xl bg-[#0C1B2B] border border-[#162E48] space-y-4">
            <div className="pb-3 border-b border-[#162E48]">
              <h2 className="text-base font-display font-bold text-white flex items-center gap-2">
                <Heart className="w-4 h-4 text-[#42C8F5]" />
                {isAr ? 'تسجيل المؤشرات الحيوية الطبية مع الفحص الفوري' : 'Manual Vitals Logging & Envelope Verification'}
              </h2>
              <p className="text-xs text-[#A9B8C8] mt-0.5">
                {isAr
                  ? 'يتم فحص كل قيمة فسيولوجياً مقابل النطاقات المعيارية المعتمدة لرواد الفضاء.'
                  : 'Every measurement is strictly evaluated against NASA HRP physiological bounds.'}
              </p>
            </div>

            {entrySuccessMessage && (
              <div className="p-3 rounded-2xl bg-[#35C98A]/15 border border-[#35C98A]/40 text-xs font-mono text-[#35C98A] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{entrySuccessMessage}</span>
              </div>
            )}

            <form onSubmit={handleVitalsSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                <div>
                  <label className="text-[#A9B8C8] block mb-1">{isAr ? 'تاريخ القياس' : 'Date'}</label>
                  <input
                    type="date"
                    value={vitalsDate}
                    onChange={(e) => setVitalsDate(e.target.value)}
                    className="w-full bg-[#07111F] text-white p-2.5 rounded-xl border border-[#162E48] focus:border-[#42C8F5] focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-[#A9B8C8] block mb-1">{isAr ? 'توقيت القياس (UTC)' : 'Time (UTC)'}</label>
                  <input
                    type="time"
                    value={vitalsTime}
                    onChange={(e) => setVitalsTime(e.target.value)}
                    className="w-full bg-[#07111F] text-white p-2.5 rounded-xl border border-[#162E48] focus:border-[#42C8F5] focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                <div>
                  <label className="text-[#A9B8C8] block mb-1">
                    {isAr ? 'نبض القلب (bpm)' : 'Heart Rate (bpm)'}
                  </label>
                  <input
                    type="number"
                    min="30"
                    max="220"
                    value={heartRate}
                    onChange={(e) => setHeartRate(e.target.value)}
                    className="w-full bg-[#07111F] text-white p-2.5 rounded-xl border border-[#162E48] focus:border-[#42C8F5] focus:outline-none"
                    placeholder="50 - 100"
                    required
                  />
                </div>

                <div>
                  <label className="text-[#A9B8C8] block mb-1">
                    {isAr ? 'الضغط الانقباضي (mmHg)' : 'Systolic BP (mmHg)'}
                  </label>
                  <input
                    type="number"
                    min="60"
                    max="240"
                    value={bpSys}
                    onChange={(e) => setBpSys(e.target.value)}
                    className="w-full bg-[#07111F] text-white p-2.5 rounded-xl border border-[#162E48] focus:border-[#42C8F5] focus:outline-none"
                    placeholder="90 - 125"
                    required
                  />
                </div>

                <div>
                  <label className="text-[#A9B8C8] block mb-1">
                    {isAr ? 'الضغط الانبساطي (mmHg)' : 'Diastolic BP (mmHg)'}
                  </label>
                  <input
                    type="number"
                    min="40"
                    max="140"
                    value={bpDia}
                    onChange={(e) => setBpDia(e.target.value)}
                    className="w-full bg-[#07111F] text-white p-2.5 rounded-xl border border-[#162E48] focus:border-[#42C8F5] focus:outline-none"
                    placeholder="60 - 85"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                <div>
                  <label className="text-[#A9B8C8] block mb-1">
                    {isAr ? 'تشبع الأكسجين SpO2 (%)' : 'Oxygen SpO2 (%)'}
                  </label>
                  <input
                    type="number"
                    min="70"
                    max="100"
                    value={spO2}
                    onChange={(e) => setSpO2(e.target.value)}
                    className="w-full bg-[#07111F] text-white p-2.5 rounded-xl border border-[#162E48] focus:border-[#42C8F5] focus:outline-none"
                    placeholder="95 - 100"
                    required
                  />
                </div>

                <div>
                  <label className="text-[#A9B8C8] block mb-1">
                    {isAr ? 'درجة حرارة الجسم (°C)' : 'Core Temp (°C)'}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="34.0"
                    max="42.0"
                    value={coreTemp}
                    onChange={(e) => setCoreTemp(e.target.value)}
                    className="w-full bg-[#07111F] text-white p-2.5 rounded-xl border border-[#162E48] focus:border-[#42C8F5] focus:outline-none"
                    placeholder="36.1 - 37.5"
                    required
                  />
                </div>

                <div>
                  <label className="text-[#A9B8C8] block mb-1">
                    {isAr ? 'مصدر البيانات (Provenance)' : 'Data Source'}
                  </label>
                  <select
                    value={entrySource}
                    onChange={(e) => setEntrySource(e.target.value as any)}
                    className="w-full bg-[#07111F] text-white p-2.5 rounded-xl border border-[#162E48] focus:border-[#42C8F5] focus:outline-none"
                  >
                    <option value="measured">measured (مستشعر حي)</option>
                    <option value="user_logged">user_logged (إدخال يدوي)</option>
                    <option value="imported">imported (مستورد)</option>
                    <option value="simulated">simulated (محاكاة)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[#A9B8C8] block mb-1 text-xs font-mono">
                  {isAr ? 'سياق النشاط وملاحظات إضافية' : 'Activity Context & Clinical Notes'}
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={isAr ? 'مثال: قياس صباحي بعد الاستيقاظ مباشرة، لا توجد أعراض دوار...' : 'e.g. Resting morning baseline post-quarters waking...'}
                  className="w-full bg-[#07111F] text-white text-xs p-2.5 rounded-xl border border-[#162E48] focus:border-[#42C8F5] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#008CC8] to-[#42C8F5] text-[#07111F] font-bold text-xs font-mono shadow-[0_0_15px_rgba(66,200,245,0.4)] hover:brightness-110 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{isAr ? 'فحص النطاقات وحفظ القياس في Health Core' : 'Validate & Commit Record'}</span>
              </button>
            </form>
          </div>

          {/* Reference Boundaries Guide */}
          <div className="p-5 rounded-3xl bg-[#0C1B2B] border border-[#162E48] space-y-4">
            <div className="pb-3 border-b border-[#162E48]">
              <h3 className="text-sm font-display font-bold text-white flex items-center gap-2">
                <Info className="w-4 h-4 text-[#42C8F5]" />
                {isAr ? 'حدود الأمان الفسيولوجي المعتمدة' : 'NASA Envelope Reference'}
              </h3>
              <p className="text-xs text-[#A9B8C8]">
                {isAr ? 'النطاقات الطبيعية في بيئة الجاذبية الصغرى:' : 'Nominal microgravity baselines:'}
              </p>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-[#07111F] border border-[#162E48]/80">
                <div className="text-[#A9B8C8] text-[11px]">{isAr ? 'نبض القلب أثناء الراحة' : 'Resting Heart Rate'}</div>
                <div className="text-white font-bold text-sm">50 – 100 bpm</div>
                <div className="text-[10px] text-[#35C98A]">Max safety: 220 bpm</div>
              </div>

              <div className="p-2.5 rounded-xl bg-[#07111F] border border-[#162E48]/80">
                <div className="text-[#A9B8C8] text-[11px]">{isAr ? 'ضغط الدم الاسمي' : 'Nominal Blood Pressure'}</div>
                <div className="text-white font-bold text-sm">90-120 / 60-80 mmHg</div>
                <div className="text-[10px] text-[#35C98A]">Normotensive Envelope</div>
              </div>

              <div className="p-2.5 rounded-xl bg-[#07111F] border border-[#162E48]/80">
                <div className="text-[#A9B8C8] text-[11px]">{isAr ? 'تشبع الأكسجين (SpO2)' : 'Oxygen Saturation'}</div>
                <div className="text-white font-bold text-sm">95% – 100%</div>
                <div className="text-[10px] text-[#F2B84B]">Alert threshold &lt; 90%</div>
              </div>

              <div className="p-2.5 rounded-xl bg-[#07111F] border border-[#162E48]/80">
                <div className="text-[#A9B8C8] text-[11px]">{isAr ? 'درجة الحرارة الأساسية' : 'Core Temperature'}</div>
                <div className="text-white font-bold text-sm">36.1°C – 37.5°C</div>
                <div className="text-[10px] text-[#35C98A]">Oral / Tympanic baseline</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: CSV & JSON INGESTION & EXPORT                     */}
      {/* ======================================================== */}
      {activeTab === 'data_import' && (
        <div className="space-y-6">
          <div className="p-5 sm:p-6 rounded-3xl bg-[#0C1B2B] border border-[#162E48] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#162E48]">
              <div>
                <h2 className="text-base font-display font-bold text-white flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-[#42C8F5]" />
                  {isAr ? 'استيراد وتصدير مجموعات البيانات (CSV / JSON)' : 'Health Data Ingestion & Export Engine'}
                </h2>
                <p className="text-xs text-[#A9B8C8]">
                  {isAr
                    ? 'استيراد بيانات النوم والقياسات الحيوية من ملفات خارجية مع التحقق التلقائي من البنية.'
                    : 'Batch ingest sleep and vital logs with automatic schema & range validation.'}
                </p>
              </div>

              {/* Export Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownloadCsv('sleep')}
                  className="px-3 py-1.5 rounded-xl bg-[#11263A] hover:bg-[#162E48] text-xs font-mono text-white border border-[#162E48] hover:border-[#42C8F5]/40 flex items-center gap-1.5 transition-all"
                >
                  <Download className="w-3.5 h-3.5 text-[#42C8F5]" />
                  <span>{isAr ? 'تصدير النوم (CSV)' : 'Export Sleep CSV'}</span>
                </button>
                <button
                  onClick={() => handleDownloadCsv('body')}
                  className="px-3 py-1.5 rounded-xl bg-[#11263A] hover:bg-[#162E48] text-xs font-mono text-white border border-[#162E48] hover:border-[#35C98A]/40 flex items-center gap-1.5 transition-all"
                >
                  <Download className="w-3.5 h-3.5 text-[#35C98A]" />
                  <span>{isAr ? 'تصدير المؤشرات (CSV)' : 'Export Vitals CSV'}</span>
                </button>
              </div>
            </div>

            {/* Ingest Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
              <div>
                <label className="text-[#A9B8C8] block mb-1">{isAr ? 'صيغة الملف المراد استيراده' : 'Import Format'}</label>
                <select
                  value={importFormat}
                  onChange={(e) => setImportFormat(e.target.value as any)}
                  className="w-full bg-[#07111F] text-white p-2.5 rounded-xl border border-[#162E48] focus:border-[#42C8F5] focus:outline-none"
                >
                  <option value="csv">CSV (Comma-Separated Values)</option>
                  <option value="json">JSON (Array of Objects)</option>
                </select>
              </div>

              <div>
                <label className="text-[#A9B8C8] block mb-1">{isAr ? 'نوع البيانات المستهدفة' : 'Target Stream'}</label>
                <select
                  value={importTargetType}
                  onChange={(e) => setImportTargetType(e.target.value as any)}
                  className="w-full bg-[#07111F] text-white p-2.5 rounded-xl border border-[#162E48] focus:border-[#42C8F5] focus:outline-none"
                >
                  <option value="sleep">Sleep Records (سجلات النوم)</option>
                  <option value="body">Body Vitals (المؤشرات الحيوية)</option>
                </select>
              </div>
            </div>

            {/* Textarea */}
            <div>
              <div className="flex items-center justify-between text-xs font-mono text-[#A9B8C8] mb-1">
                <span>{isAr ? 'الصق نص الـ CSV أو الـ JSON هنا' : 'Paste CSV or JSON Payload'}</span>
                <button
                  type="button"
                  onClick={() => {
                    if (importFormat === 'csv') {
                      setImportText(`date,bedtime,wakeTime,durationMinutes,qualityRating\n2026-11-01,22:30,06:30,480,4\n2026-11-02,23:00,06:45,465,4\n2026-11-03,22:15,06:15,480,5`);
                    } else {
                      setImportText(JSON.stringify([
                        { date: '2026-11-01', bedtime: '22:30', wakeTime: '06:30', durationMinutes: 480, qualityRating: 4 },
                        { date: '2026-11-02', bedtime: '23:00', wakeTime: '06:45', durationMinutes: 465, qualityRating: 4 },
                      ], null, 2));
                    }
                  }}
                  className="text-[#42C8F5] hover:underline"
                >
                  {isAr ? 'إدراج نموذج تجريبي' : 'Load Sample Template'}
                </button>
              </div>
              <textarea
                rows={6}
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder={
                  importFormat === 'csv'
                    ? "date,bedtime,wakeTime,durationMinutes\n2026-11-01,22:30,06:30,480"
                    : '[{"date": "2026-11-01", "bedtime": "22:30", "wakeTime": "06:30"}]'
                }
                className="w-full bg-[#07111F] text-white text-xs font-mono p-3 rounded-2xl border border-[#162E48] focus:border-[#42C8F5] focus:outline-none resize-none"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={handleParseImport}
                disabled={!importText.trim()}
                className="px-4 py-2.5 rounded-xl bg-[#11263A] hover:bg-[#162E48] text-[#42C8F5] border border-[#42C8F5]/40 text-xs font-mono font-semibold transition-all cursor-pointer disabled:opacity-50"
              >
                {isAr ? 'معاينة وفحص صحة البيانات' : 'Validate & Preview Payload'}
              </button>
            </div>

            {/* Validation Preview Box */}
            {importPreview && (
              <div className="p-4 rounded-2xl bg-[#07111F] border border-[#162E48] space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-white font-bold">
                    {isAr ? 'تقرير الفحص والمعاينة:' : 'Validation Preview Summary:'}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-[#35C98A]">Valid: {importPreview.valid}</span>
                    <span className="text-[#E85D65]">Rejected: {importPreview.rejected}</span>
                  </div>
                </div>

                {importPreview.errors.length > 0 && (
                  <div className="p-2.5 rounded-xl bg-[#E85D65]/10 border border-[#E85D65]/30 text-xs font-mono text-[#E85D65] space-y-1 max-h-32 overflow-y-auto">
                    {importPreview.errors.map((err, idx) => (
                      <div key={idx}>• {err}</div>
                    ))}
                  </div>
                )}

                {importPreview.valid > 0 && (
                  <button
                    onClick={handleCommitImport}
                    className="w-full py-2.5 rounded-xl bg-[#35C98A] text-[#07111F] font-bold text-xs font-mono shadow-[0_0_12px_rgba(53,201,138,0.4)] hover:brightness-110 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isAr ? `تأكيد استيراد ${importPreview.valid} سجل إلى Health Core` : `Commit ${importPreview.valid} Records`}</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: NASA BIG DATA FOUNDATION CATALOG                  */}
      {/* ======================================================== */}
      {activeTab === 'nasa_catalog' && (
        <div className="space-y-6">
          <div className="p-5 sm:p-6 rounded-3xl bg-[#0C1B2B] border border-[#162E48] space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#162E48]">
              <div>
                <h2 className="text-base font-display font-bold text-white flex items-center gap-2">
                  <Database className="w-4 h-4 text-[#42C8F5]" />
                  {isAr ? 'مستودع بيانات NASA الكبرى لعلوم الإنسان والفضاء' : 'NASA Big Data Foundation Repository'}
                </h2>
                <p className="text-xs text-[#A9B8C8]">
                  {isAr
                    ? 'فهرس مجموعات بيانات ناسا الرسمية من OSDR وLSDA وGeneLab وdata.nasa.gov مع خاصية الاستيراد بضغطة زر.'
                    : 'Authentic NASA biological and human research catalogs with 1-click sample ingest into Health Core.'}
                </p>
              </div>

              <span className="text-xs font-mono text-[#35C98A]">
                {catalogQuery.totalCount} {isAr ? 'مستودعات موثقة' : 'Verified Datasets'}
              </span>
            </div>

            {/* Search and Domain Filters */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <input
                  type="text"
                  value={catalogSearch}
                  onChange={(e) => {
                    setCatalogSearch(e.target.value);
                    setCatalogPage(1);
                  }}
                  placeholder={isAr ? 'ابحث في مستودعات ناسا الطبية والفسيولوجية...' : 'Search NASA space medicine and physiological datasets...'}
                  className="w-full bg-[#07111F] text-white text-xs p-2.5 rounded-xl border border-[#162E48] focus:border-[#42C8F5] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1">
                {['ALL', 'PHYSIOLOGY', 'SLEEP_CIRCADIAN', 'ENVIRONMENT_ECLSS', 'RADIATION_OMICS'].map((dom) => (
                  <button
                    key={dom}
                    onClick={() => {
                      setSelectedDomain(dom);
                      setCatalogPage(1);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono whitespace-nowrap transition-all cursor-pointer ${
                      selectedDomain === dom
                        ? 'bg-[#42C8F5] text-[#07111F] font-bold'
                        : 'bg-[#07111F] text-[#A9B8C8] hover:text-white border border-[#162E48]'
                    }`}
                  >
                    {dom}
                  </button>
                ))}
              </div>
            </div>

            {/* Datasets List */}
            <div className="space-y-4">
              {catalogQuery.items.map((ds) => (
                <div
                  key={ds.id}
                  className="p-5 rounded-2xl bg-[#07111F] border border-[#162E48] hover:border-[#42C8F5]/40 transition-all flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#11263A] text-[#42C8F5] border border-[#42C8F5]/30">
                        {ds.ownerCenter}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-[#35C98A]">
                          Format: {ds.dataFormat}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {ds.estimatedSize}
                        </span>
                      </div>
                    </div>

                    <h3 className="text-sm font-bold text-white">
                      {isAr ? ds.nameAr : ds.name}
                    </h3>
                    <p className="text-xs text-[#A9B8C8] leading-relaxed">
                      {isAr ? ds.descriptionAr : ds.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#162E48]/80 text-[11px] font-mono flex flex-wrap items-center justify-between gap-3">
                    <div className="text-slate-400">
                      License: <span className="text-white">{isAr ? ds.licenseAr : ds.license}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {ds.sampleRows && (
                        <button
                          onClick={() => handleIngestNasaSample(ds)}
                          className="px-3 py-1.5 rounded-xl bg-[#35C98A]/20 hover:bg-[#35C98A]/30 text-[#35C98A] border border-[#35C98A]/40 text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>{isAr ? 'استيراد العينة إلى Health Core' : 'Ingest Sample'}</span>
                        </button>
                      )}

                      <a
                        href={ds.originalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-[#11263A] hover:bg-[#162E48] text-[#42C8F5] border border-[#162E48] hover:border-[#42C8F5]/40 text-xs font-mono flex items-center gap-1 transition-all"
                      >
                        <span>{isAr ? 'المصدر الرسمي' : 'Source'}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {catalogQuery.totalPages > 1 && (
              <div className="flex items-center justify-between pt-3 border-t border-[#162E48]/80 text-xs font-mono">
                <span className="text-[#A9B8C8]">
                  {isAr ? `صفحة ${catalogQuery.currentPage} من ${catalogQuery.totalPages}` : `Page ${catalogQuery.currentPage} of ${catalogQuery.totalPages}`}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCatalogPage((p) => Math.max(1, p - 1))}
                    disabled={catalogQuery.currentPage === 1}
                    className="p-1.5 rounded-lg bg-[#11263A] text-white disabled:opacity-40"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setCatalogPage((p) => Math.min(catalogQuery.totalPages, p + 1))}
                    disabled={catalogQuery.currentPage === catalogQuery.totalPages}
                    className="p-1.5 rounded-lg bg-[#11263A] text-white disabled:opacity-40"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

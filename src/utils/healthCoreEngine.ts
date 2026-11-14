import { 
  SleepRecord, 
  WellnessRecord, 
  RespiratoryRecord, 
  BodyMetricRecord, 
  HealthEventRecord, 
  ValidationResult, 
  HealthDataImportResult,
  DataSource 
} from '../types';

export const BODY_METRICS_STORAGE_KEY = 'astra_body_metrics_records_v1';
export const HEALTH_EVENTS_STORAGE_KEY = 'astra_health_events_records_v1';

/**
 * Aerospace Physiological Validation Boundaries
 * Based on NASA Human Research Program (HRP) & Space Medicine guidelines
 */
export const PHYSIOLOGICAL_RANGES = {
  heartRateBpm: { min: 30, max: 220, nominalMin: 50, nominalMax: 100, unit: 'bpm' },
  bloodPressureSys: { min: 60, max: 240, nominalMin: 90, nominalMax: 125, unit: 'mmHg' },
  bloodPressureDia: { min: 40, max: 140, nominalMin: 60, nominalMax: 85, unit: 'mmHg' },
  spO2Percent: { min: 70, max: 100, nominalMin: 95, nominalMax: 100, unit: '%' },
  coreTempC: { min: 34.0, max: 42.0, nominalMin: 36.1, nominalMax: 37.5, unit: '°C' },
  respiratoryRate: { min: 6, max: 45, nominalMin: 12, nominalMax: 18, unit: 'breaths/min' },
  sleepMinutes: { min: 0, max: 1440, nominalMin: 420, nominalMax: 540, unit: 'minutes' },
};

/**
 * Validates a Body Metric entry against physiological bounds
 */
export function validateBodyMetric(
  metric: Partial<BodyMetricRecord>
): ValidationResult {
  const fieldErrors: Record<string, string> = {};
  const warnings: string[] = [];

  // Heart Rate
  if (metric.heartRateBpm !== null && metric.heartRateBpm !== undefined) {
    const hr = Number(metric.heartRateBpm);
    if (isNaN(hr) || hr < PHYSIOLOGICAL_RANGES.heartRateBpm.min || hr > PHYSIOLOGICAL_RANGES.heartRateBpm.max) {
      fieldErrors.heartRateBpm = `Heart rate out of physiological envelope (${PHYSIOLOGICAL_RANGES.heartRateBpm.min}-${PHYSIOLOGICAL_RANGES.heartRateBpm.max} bpm)`;
    } else if (hr < PHYSIOLOGICAL_RANGES.heartRateBpm.nominalMin || hr > PHYSIOLOGICAL_RANGES.heartRateBpm.nominalMax) {
      warnings.push(`Resting heart rate ${hr} bpm is outside nominal spaceflight baseline (50-100 bpm)`);
    }
  }

  // Blood Pressure
  if (metric.bloodPressureSys !== null && metric.bloodPressureSys !== undefined) {
    const sys = Number(metric.bloodPressureSys);
    if (isNaN(sys) || sys < PHYSIOLOGICAL_RANGES.bloodPressureSys.min || sys > PHYSIOLOGICAL_RANGES.bloodPressureSys.max) {
      fieldErrors.bloodPressureSys = `Systolic BP out of range (${PHYSIOLOGICAL_RANGES.bloodPressureSys.min}-${PHYSIOLOGICAL_RANGES.bloodPressureSys.max} mmHg)`;
    }
  }

  if (metric.bloodPressureDia !== null && metric.bloodPressureDia !== undefined) {
    const dia = Number(metric.bloodPressureDia);
    if (isNaN(dia) || dia < PHYSIOLOGICAL_RANGES.bloodPressureDia.min || dia > PHYSIOLOGICAL_RANGES.bloodPressureDia.max) {
      fieldErrors.bloodPressureDia = `Diastolic BP out of range (${PHYSIOLOGICAL_RANGES.bloodPressureDia.min}-${PHYSIOLOGICAL_RANGES.bloodPressureDia.max} mmHg)`;
    }
  }

  if (
    metric.bloodPressureSys && 
    metric.bloodPressureDia && 
    Number(metric.bloodPressureSys) <= Number(metric.bloodPressureDia)
  ) {
    fieldErrors.bloodPressureSys = 'Systolic BP must be greater than Diastolic BP';
  }

  // SpO2
  if (metric.spO2Percent !== null && metric.spO2Percent !== undefined) {
    const spo2 = Number(metric.spO2Percent);
    if (isNaN(spo2) || spo2 < PHYSIOLOGICAL_RANGES.spO2Percent.min || spo2 > PHYSIOLOGICAL_RANGES.spO2Percent.max) {
      fieldErrors.spO2Percent = `SpO2 saturation must be between 70% and 100%`;
    } else if (spo2 < 95) {
      warnings.push(`SpO2 reading of ${spo2}% indicates potential hypoxia or sensor misplacement`);
    }
  }

  // Core Temp
  if (metric.coreTempC !== null && metric.coreTempC !== undefined) {
    const temp = Number(metric.coreTempC);
    if (isNaN(temp) || temp < PHYSIOLOGICAL_RANGES.coreTempC.min || temp > PHYSIOLOGICAL_RANGES.coreTempC.max) {
      fieldErrors.coreTempC = `Core temperature out of range (34.0°C - 42.0°C)`;
    } else if (temp > 37.8) {
      warnings.push(`Core temp ${temp}°C flags hyperthermia / exercise heat accumulation`);
    }
  }

  return {
    isValid: Object.keys(fieldErrors).length === 0,
    fieldErrors,
    warnings,
  };
}

/**
 * Validates Respiratory Rate entry
 */
export function validateRespiratoryRate(rate: number): ValidationResult {
  const fieldErrors: Record<string, string> = {};
  const warnings: string[] = [];

  if (isNaN(rate) || rate < PHYSIOLOGICAL_RANGES.respiratoryRate.min || rate > PHYSIOLOGICAL_RANGES.respiratoryRate.max) {
    fieldErrors.respiratoryRate = `Respiratory rate must be between 6 and 45 breaths/min`;
  } else if (rate < 10 || rate > 22) {
    warnings.push(`Respiratory rate ${rate}/min deviates from nominal envelope (12-18/min)`);
  }

  return {
    isValid: Object.keys(fieldErrors).length === 0,
    fieldErrors,
    warnings,
  };
}

/**
 * Detects missing daily logs across the specified mission date range
 */
export function detectMissingHealthData(
  dates: string[], // List of expected YYYY-MM-DD
  sleepRecords: SleepRecord[],
  wellnessRecords: WellnessRecord[],
  respiratoryRecords: RespiratoryRecord[]
): Array<{
  date: string;
  missingTypes: ('SLEEP' | 'WELLNESS' | 'RESPIRATORY')[];
  severity: 'WARNING' | 'NOTICE';
}> {
  const missingLog: Array<{
    date: string;
    missingTypes: ('SLEEP' | 'WELLNESS' | 'RESPIRATORY')[];
    severity: 'WARNING' | 'NOTICE';
  }> = [];

  const sleepDates = new Set(sleepRecords.map((r) => r.date));
  const wellnessDates = new Set(wellnessRecords.map((r) => r.date));
  const respDates = new Set(respiratoryRecords.map((r) => r.date));

  for (const date of dates) {
    const missing: ('SLEEP' | 'WELLNESS' | 'RESPIRATORY')[] = [];
    if (!sleepDates.has(date)) missing.push('SLEEP');
    if (!wellnessDates.has(date)) missing.push('WELLNESS');
    if (!respDates.has(date)) missing.push('RESPIRATORY');

    if (missing.length > 0) {
      missingLog.push({
        date,
        missingTypes: missing,
        severity: missing.length >= 2 ? 'WARNING' : 'NOTICE',
      });
    }
  }

  return missingLog;
}

/**
 * Parses and imports CSV data into structured Sleep Records
 */
export function importSleepFromCsv(csvText: string): HealthDataImportResult & { records: SleepRecord[] } {
  const lines = csvText.trim().split('\n');
  const errors: string[] = [];
  const warnings: string[] = [];
  const records: SleepRecord[] = [];

  if (lines.length < 2) {
    return {
      totalProcessed: 0,
      importedCount: 0,
      rejectedCount: 0,
      errors: ['CSV file is empty or missing headers'],
      warnings: [],
      records: [],
    };
  }

  // Header line: date,bedtime,wakeTime,durationMinutes,qualityRating,disturbances,source
  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
  const dateIdx = headers.indexOf('date');
  const bedIdx = headers.indexOf('bedtime');
  const wakeIdx = headers.indexOf('waketime');
  const durIdx = headers.indexOf('durationminutes');

  if (dateIdx === -1 || bedIdx === -1 || wakeIdx === -1) {
    return {
      totalProcessed: lines.length - 1,
      importedCount: 0,
      rejectedCount: lines.length - 1,
      errors: ['Missing mandatory columns: date, bedtime, wakeTime are required'],
      warnings: [],
      records: [],
    };
  }

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const cols = line.split(',').map((c) => c.trim().replace(/^"|"$/g, ''));

    const date = cols[dateIdx];
    const bedtime = cols[bedIdx];
    const wakeTime = cols[wakeIdx];

    // Validate date format YYYY-MM-DD
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      errors.push(`Row ${i}: Invalid date format "${date}". Expected YYYY-MM-DD`);
      continue;
    }

    let duration = durIdx !== -1 && cols[durIdx] ? Number(cols[durIdx]) : 0;
    if (isNaN(duration) || duration <= 0) {
      // Calculate from bedtime/waketime
      const [bH, bM] = bedtime.split(':').map(Number);
      const [wH, wM] = wakeTime.split(':').map(Number);
      if (!isNaN(bH) && !isNaN(wH)) {
        const bedTotal = bH * 60 + (bM || 0);
        const wakeTotal = wH * 60 + (wM || 0);
        duration = wakeTotal >= bedTotal ? wakeTotal - bedTotal : (1440 - bedTotal) + wakeTotal;
      }
    }

    if (duration > 1440) {
      errors.push(`Row ${i}: Sleep duration ${duration} mins exceeds 24-hour physiological maximum`);
      continue;
    }

    const newRecord: SleepRecord = {
      id: `sleep-imp-${Date.now()}-${i}`,
      date,
      bedtime: bedtime || '22:30',
      wakeTime: wakeTime || '06:30',
      durationMinutes: duration,
      goalMinutes: 480,
      qualityRating: 4,
      disturbances: ['Imported Batch Telemetry'],
      source: 'imported',
      timestamp: Date.now(),
      isValidated: true,
    };

    records.push(newRecord);
  }

  return {
    totalProcessed: lines.length - 1,
    importedCount: records.length,
    rejectedCount: lines.length - 1 - records.length,
    errors,
    warnings,
    records,
  };
}

/**
 * Parses and imports JSON data array into structured records
 */
export function importHealthDataFromJson<T>(
  jsonText: string,
  recordType: 'sleep' | 'wellness' | 'respiratory' | 'body'
): HealthDataImportResult & { data: any[] } {
  try {
    const parsed = JSON.parse(jsonText);
    if (!Array.isArray(parsed)) {
      return {
        totalProcessed: 0,
        importedCount: 0,
        rejectedCount: 0,
        errors: ['JSON root must be an array of health records'],
        warnings: [],
        data: [],
      };
    }

    const validatedItems: any[] = [];
    const errors: string[] = [];

    parsed.forEach((item, index) => {
      if (!item.date || typeof item.date !== 'string') {
        errors.push(`Item ${index}: Missing valid 'date' string (YYYY-MM-DD)`);
        return;
      }

      // Tag explicitly as imported
      const taggedItem = {
        ...item,
        id: item.id || `imp-${recordType}-${Date.now()}-${index}`,
        source: 'imported' as DataSource,
        timestamp: item.timestamp || Date.now(),
        isValidated: true,
      };

      validatedItems.push(taggedItem);
    });

    return {
      totalProcessed: parsed.length,
      importedCount: validatedItems.length,
      rejectedCount: parsed.length - validatedItems.length,
      errors,
      warnings: [],
      data: validatedItems,
    };
  } catch (err: any) {
    return {
      totalProcessed: 0,
      importedCount: 0,
      rejectedCount: 0,
      errors: [`JSON parse failure: ${err.message}`],
      warnings: [],
      data: [],
    };
  }
}

/**
 * Exports records to clean CSV format
 */
export function exportRecordsToCsv(
  records: any[],
  type: 'sleep' | 'wellness' | 'respiratory' | 'body'
): string {
  if (records.length === 0) return '';

  if (type === 'sleep') {
    const headers = ['date', 'bedtime', 'wakeTime', 'durationMinutes', 'goalMinutes', 'qualityRating', 'source'];
    const rows = records.map((r: SleepRecord) => [
      r.date,
      r.bedtime,
      r.wakeTime,
      r.durationMinutes,
      r.goalMinutes,
      r.qualityRating || '',
      r.source,
    ]);
    return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
  }

  if (type === 'body') {
    const headers = ['date', 'time', 'heartRateBpm', 'bloodPressureSys', 'bloodPressureDia', 'spO2Percent', 'coreTempC', 'source'];
    const rows = records.map((r: BodyMetricRecord) => [
      r.date,
      r.time,
      r.heartRateBpm ?? '',
      r.bloodPressureSys ?? '',
      r.bloodPressureDia ?? '',
      r.spO2Percent ?? '',
      r.coreTempC ?? '',
      r.source,
    ]);
    return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
  }

  // Generic fallback
  const first = records[0];
  const headers = Object.keys(first).filter((k) => typeof first[k] !== 'object');
  const rows = records.map((r) => headers.map((h) => r[h] ?? ''));
  return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
}

/**
 * Default historical body metrics for Expedition 72 baseline
 */
export const INITIAL_BODY_METRICS: BodyMetricRecord[] = [
  {
    id: 'body-metric-01',
    date: '2026-11-04',
    time: '07:15',
    heartRateBpm: 62,
    bloodPressureSys: 116,
    bloodPressureDia: 74,
    spO2Percent: 98,
    coreTempC: 36.6,
    activityContext: 'rest',
    source: 'measured',
    notes: 'Morning resting baseline in crew quarters. Normotensive.',
    timestamp: Date.now() - 86400000 * 2,
    isValidated: true,
  },
  {
    id: 'body-metric-02',
    date: '2026-11-05',
    time: '12:30',
    heartRateBpm: 124,
    bloodPressureSys: 138,
    bloodPressureDia: 82,
    spO2Percent: 97,
    coreTempC: 37.4,
    activityContext: 'post_exercise',
    source: 'measured',
    notes: 'Post-ARED resistance workout. Transient expected heart rate elevation.',
    timestamp: Date.now() - 86400000,
    isValidated: true,
  },
  {
    id: 'body-metric-03',
    date: '2026-11-06',
    time: '08:00',
    heartRateBpm: 64,
    bloodPressureSys: 118,
    bloodPressureDia: 76,
    spO2Percent: 99,
    coreTempC: 36.7,
    activityContext: 'rest',
    source: 'measured',
    notes: 'Nominal resting vitals. All microgravity autonomic indicators stable.',
    timestamp: Date.now(),
    isValidated: true,
  }
];

/**
 * Initial Health Event Timeline entries
 */
export const INITIAL_HEALTH_EVENTS: HealthEventRecord[] = [
  {
    id: 'event-01',
    timestamp: Date.now() - 3600000 * 48,
    date: '2026-11-04',
    time: '07:30',
    category: 'SLEEP',
    title: 'Optimal Circadian Sleep Achieved',
    titleAr: 'تحقيق نوم مداري مثالي 7 ساعات و40 دقيقة',
    description: 'Deep sleep proportion verified at 22%. Rapid recovery verified post-rest.',
    descriptionAr: 'نسبة النوم العميق بلغت 22% مع استقرار كامل في معدل التنفس.',
    severity: 'NOMINAL',
    source: 'user_logged',
  },
  {
    id: 'event-02',
    timestamp: Date.now() - 3600000 * 26,
    date: '2026-11-05',
    time: '09:15',
    category: 'SYMPTOM',
    title: 'Cephalad Fluid Shift Symptoms Logged',
    titleAr: 'تسجيل أعراض انزياح السوائل الرأسي',
    description: 'Mild nasal congestion and facial puffiness reported during early morning EVA check.',
    descriptionAr: 'احتقان أنفي خفيف وانتفاخ في جفون العين طبيعي للتكيف مع انعدام الوزن.',
    severity: 'ADVISORY',
    source: 'user_logged',
  },
  {
    id: 'event-03',
    timestamp: Date.now() - 3600000 * 4,
    date: '2026-11-06',
    time: '08:15',
    category: 'CARDIO',
    title: 'Vitals Sensor Telemetry Nominal',
    titleAr: 'قراءات المؤشرات الحيوية ضمن النطاق الاسمي',
    description: 'Resting HR 64 bpm, SpO2 99%, BP 118/76 mmHg. No signs of microgravity arrhythmia.',
    descriptionAr: 'نبض مستقر 64 ن/د، نسبة تشبع الأكسجين 99%، وضغط الدم 118/76 مم زئبق.',
    severity: 'NOMINAL',
    source: 'measured',
  }
];

/**
 * Storage helpers for Body Metrics (starts empty until user logs or imports data)
 */
export function getSavedBodyMetrics(): BodyMetricRecord[] {
  try {
    const raw = localStorage.getItem(BODY_METRICS_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveBodyMetrics(records: BodyMetricRecord[]): void {
  try {
    localStorage.setItem(BODY_METRICS_STORAGE_KEY, JSON.stringify(records));
  } catch (err) {
    console.error('Failed to save body metrics:', err);
  }
}

/**
 * Storage helpers for Health Events Timeline (starts empty until user logs or imports data)
 */
export function getSavedHealthEvents(): HealthEventRecord[] {
  try {
    const raw = localStorage.getItem(HEALTH_EVENTS_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveHealthEvents(events: HealthEventRecord[]): void {
  try {
    localStorage.setItem(HEALTH_EVENTS_STORAGE_KEY, JSON.stringify(events));
  } catch (err) {
    console.error('Failed to save health events:', err);
  }
}

export function loadDemoBodyAndEventRecords(): {
  bodyMetrics: BodyMetricRecord[];
  healthEvents: HealthEventRecord[];
} {
  const demoMetrics = INITIAL_BODY_METRICS.map((m) => ({ ...m, source: 'simulated' as DataSource }));
  const demoEvents = INITIAL_HEALTH_EVENTS.map((e) => ({ ...e, source: 'simulated' as DataSource }));
  saveBodyMetrics(demoMetrics);
  saveHealthEvents(demoEvents);
  return { bodyMetrics: demoMetrics, healthEvents: demoEvents };
}

export function clearHealthCoreStorage(): void {
  try {
    localStorage.removeItem(BODY_METRICS_STORAGE_KEY);
    localStorage.removeItem(HEALTH_EVENTS_STORAGE_KEY);
  } catch {}
}

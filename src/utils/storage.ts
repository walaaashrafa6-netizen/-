import { 
  SleepRecord, 
  WellnessRecord, 
  RespiratoryRecord, 
  AstronautProfile, 
  WellnessTask, 
  MissionBadge 
} from '../types';

const SLEEP_STORAGE_KEY = 'astra_sleep_records_v1';
const WELLNESS_STORAGE_KEY = 'astra_wellness_records_v1';
const RESPIRATORY_STORAGE_KEY = 'astra_respiratory_records_v1';
const PROFILE_STORAGE_KEY = 'astra_profile_v1';
const TASKS_STORAGE_KEY = 'astra_tasks_v1';
const BADGES_STORAGE_KEY = 'astra_badges_v1';

/**
 * Calculates sleep duration in minutes, handling day-crossing (overnight) intervals.
 */
export function calculateSleepMinutes(bedtime: string, wakeTime: string): number {
  if (!bedtime || !wakeTime) return 0;
  const [bHours, bMins] = bedtime.split(':').map(Number);
  const [wHours, wMins] = wakeTime.split(':').map(Number);

  if (isNaN(bHours) || isNaN(bMins) || isNaN(wHours) || isNaN(wMins)) return 0;

  const bedTotal = bHours * 60 + bMins;
  const wakeTotal = wHours * 60 + wMins;

  if (wakeTotal >= bedTotal) {
    return wakeTotal - bedTotal;
  } else {
    // Crosses midnight: remainder of previous day + morning minutes
    return (1440 - bedTotal) + wakeTotal;
  }
}

/**
 * Formats minutes into standard readable string (e.g. 7h 45m).
 */
export function formatDuration(minutes: number): string {
  if (!minutes || minutes < 0) return '0h 00m';
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return `${h}h ${m < 10 ? '0' : ''}${m}m`;
}

/**
 * Formats a date string (YYYY-MM-DD) into display label.
 */
export function formatDisplayDate(dateStr: string, lang: 'en' | 'ar' = 'en'): string {
  try {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    if (lang === 'ar') {
      return date.toLocaleDateString('ar-EG', { weekday: 'short', month: 'short', day: 'numeric' });
    }
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  } catch {
    return dateStr;
  }
}

export const DEFAULT_PROFILE: AstronautProfile = {
  callsign: 'Astronaut',
  rank: 'Commander',
  missionName: 'ISS Expedition 72',
  missionDay: 1,
  targetSleepMinutes: 480, // 8.0 hours standard mission guideline
  timezone: 'UTC (Spacecraft GMT)',
  language: 'ar',
};

export const INITIAL_TASKS: WellnessTask[] = [
  {
    id: 'task-1',
    title: 'Morning cephalad fluid shift check & hydration (500mL)',
    titleAr: 'فحص انزياح السوائل الصباحي وشرب 500 مل ماء',
    time: '07:30 UTC',
    completed: true,
    category: 'readiness',
  },
  {
    id: 'task-2',
    title: 'ARED axial load squats & deadlifts (45 min)',
    titleAr: 'تمارين التحميل المحوري ARED (45 دقيقة)',
    time: '11:00 UTC',
    completed: true,
    category: 'exercise',
  },
  {
    id: 'task-3',
    title: 'Resting respiratory rate & symptom entry',
    titleAr: 'تسجيل معدل التنفس أثناء الراحة وفحص الأعراض',
    time: '15:30 UTC',
    completed: false,
    category: 'breathing',
  },
  {
    id: 'task-4',
    title: 'Circadian optical visor prep & crew quarters sleep entrainment',
    titleAr: 'تجهيز قناع حجب الضوء ودخول كيس النوم في المقصورة',
    time: '21:30 UTC',
    completed: false,
    category: 'sleep',
  },
];

export const INITIAL_BADGES: MissionBadge[] = [
  {
    id: 'badge-1',
    title: 'Zero-G Adapter',
    titleAr: 'مستكشف التكيف المداري',
    category: 'Mission Adaptation',
    icon: 'rocket',
    achieved: true,
    dateAchieved: 'Flight Day 12',
  },
  {
    id: 'badge-2',
    title: 'Circadian Champion',
    titleAr: 'بطل انضباط النوم',
    category: 'Sleep Orbit',
    icon: 'moon',
    achieved: true,
    dateAchieved: 'Flight Day 30',
  },
  {
    id: 'badge-3',
    title: 'Cardio Resilience',
    titleAr: 'نجم اللياقة القلبية',
    category: 'Motion Orbit',
    icon: 'heart',
    achieved: true,
    dateAchieved: 'Flight Day 42',
  },
];

// Seed sample records for immediate evaluation & scientific trend verification
function generateInitialSleepRecords(): SleepRecord[] {
  const today = new Date();
  const records: SleepRecord[] = [];

  const durations = [440, 410, 465, 390, 495, 435, 460];
  const bedtimes = ['23:15', '23:45', '22:50', '00:30', '22:30', '23:10', '22:45'];
  const waketimes = ['06:35', '06:35', '06:35', '07:00', '06:45', '06:25', '06:25'];
  const notes = [
    'Nominal night in crew quarters',
    'High ventilation fan hum in Node 2',
    'Good rest with visor light seal',
    'Delayed sleep onset due to delayed docking ops',
    'Deep recovery sleep after EVA dry-run',
    'Mild microgravity float sensation during rem',
    'Nominal sleep window before science shift',
  ];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const duration = durations[6 - i];
    const disturbances = i === 3 ? ['Circadian Shifting', 'Cabin Noise'] : i === 5 ? ['Microgravity Floating'] : [];

    records.push({
      id: `sleep-seed-${i}`,
      date: dateStr,
      bedtime: bedtimes[6 - i],
      wakeTime: waketimes[6 - i],
      durationMinutes: duration,
      goalMinutes: 480,
      qualityRating: duration > 450 ? 4 : 3,
      disturbances,
      notes: notes[6 - i],
      source: 'user_logged',
      timestamp: d.getTime(),
    });
  }
  return records;
}

function generateInitialWellnessRecords(): WellnessRecord[] {
  const today = new Date();
  const records: WellnessRecord[] = [];
  const moods = [4, 3, 4, 3, 5, 4, 4];
  const stresses = [2, 3, 2, 4, 2, 2, 2];
  const energies = [3, 2, 4, 2, 4, 3, 4];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];

    records.push({
      id: `wellness-seed-${i}`,
      date: dateStr,
      moodRating: moods[6 - i],
      stressRating: stresses[6 - i],
      energyRating: energies[6 - i],
      isolationFeeling: i === 3,
      concentrationDifficulty: i === 3,
      symptoms: i === 3 ? ['Mild ocular fatigue'] : [],
      notes: i === 3 ? 'Stress elevated during rendezvous prep' : 'Adapting well to microgravity schedule',
      source: 'user_logged',
      timestamp: d.getTime(),
    });
  }
  return records;
}

function generateInitialRespiratoryRecords(): RespiratoryRecord[] {
  const today = new Date();
  const records: RespiratoryRecord[] = [];
  const rates = [15, 16, 15, 17, 15, 16, 16];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];

    records.push({
      id: `resp-seed-${i}`,
      date: dateStr,
      time: '08:30',
      respiratoryRate: rates[6 - i],
      pattern: 'regular',
      activityContext: 'rest',
      symptoms: i === 1 ? ['Mild nasal stuffiness (cephalad fluid shift)'] : [],
      isSimulated: true,
      source: 'simulated_telemetry',
      qualityRating: 'nominal',
      timestamp: d.getTime(),
    });
  }
  return records;
}

// Local Storage helpers — default to empty [] so zero unlogged records are shown
export function getSavedSleepRecords(): SleepRecord[] {
  try {
    const raw = localStorage.getItem(SLEEP_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveSleepRecords(records: SleepRecord[]): void {
  try {
    localStorage.setItem(SLEEP_STORAGE_KEY, JSON.stringify(records));
  } catch (err) {
    console.warn('Failed to save sleep records to local storage', err);
  }
}

export function getSavedWellnessRecords(): WellnessRecord[] {
  try {
    const raw = localStorage.getItem(WELLNESS_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveWellnessRecords(records: WellnessRecord[]): void {
  try {
    localStorage.setItem(WELLNESS_STORAGE_KEY, JSON.stringify(records));
  } catch (err) {
    console.warn('Failed to save wellness records to local storage', err);
  }
}

export function getSavedRespiratoryRecords(): RespiratoryRecord[] {
  try {
    const raw = localStorage.getItem(RESPIRATORY_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveRespiratoryRecords(records: RespiratoryRecord[]): void {
  try {
    localStorage.setItem(RESPIRATORY_STORAGE_KEY, JSON.stringify(records));
  } catch (err) {
    console.warn('Failed to save respiratory records to local storage', err);
  }
}

export function loadDemoMissionRecords(): {
  sleep: SleepRecord[];
  wellness: WellnessRecord[];
  respiratory: RespiratoryRecord[];
} {
  const sleep = generateInitialSleepRecords().map((r) => ({ ...r, source: 'simulated' as const }));
  const wellness = generateInitialWellnessRecords().map((r) => ({ ...r, source: 'simulated' as const }));
  const respiratory = generateInitialRespiratoryRecords();
  saveSleepRecords(sleep);
  saveWellnessRecords(wellness);
  saveRespiratoryRecords(respiratory);
  return { sleep, wellness, respiratory };
}

export function getSavedTasks(): WellnessTask[] {
  try {
    const raw = localStorage.getItem(TASKS_STORAGE_KEY);
    if (!raw) {
      saveTasks(INITIAL_TASKS);
      return INITIAL_TASKS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_TASKS;
  }
}

export function saveTasks(tasks: WellnessTask[]): void {
  try {
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
  } catch (err) {
    console.warn('Failed to save tasks', err);
  }
}

export function getSavedBadges(): MissionBadge[] {
  try {
    const raw = localStorage.getItem(BADGES_STORAGE_KEY);
    if (!raw) {
      saveBadges(INITIAL_BADGES);
      return INITIAL_BADGES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_BADGES;
  }
}

export function saveBadges(badges: MissionBadge[]): void {
  try {
    localStorage.setItem(BADGES_STORAGE_KEY, JSON.stringify(badges));
  } catch (err) {
    console.warn('Failed to save badges', err);
  }
}

export function getSavedProfile(): AstronautProfile {
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) return DEFAULT_PROFILE;
    return { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function saveProfile(profile: AstronautProfile): void {
  try {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  } catch (err) {
    console.warn('Failed to save profile', err);
  }
}

export function resetAllStorageData(): void {
  localStorage.removeItem(SLEEP_STORAGE_KEY);
  localStorage.removeItem(WELLNESS_STORAGE_KEY);
  localStorage.removeItem(RESPIRATORY_STORAGE_KEY);
  localStorage.removeItem(PROFILE_STORAGE_KEY);
  localStorage.removeItem(TASKS_STORAGE_KEY);
  localStorage.removeItem(BADGES_STORAGE_KEY);
}

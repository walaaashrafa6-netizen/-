export type ModuleTab = 
  | 'overview' 
  | 'health_core'
  | 'predict'
  | 'intelligence'
  | 'emergency'
  | 'sleep' 
  | 'breathing' 
  | 'wellness' 
  | 'body' 
  | 'motion' 
  | 'foresight' 
  | 'reports' 
  | 'settings'
  | 'assistant';

export type Language = 'en' | 'ar';

/**
 * Strict Health Data Provenance Classification
 * Required by aerospace medicine standards to separate measured bio-telemetry
 * from self-reports, imported datasets, calculations, and simulations.
 */
export type DataSource = 'measured' | 'user_logged' | 'imported' | 'simulated' | 'estimated';

export interface SleepRecord {
  id: string;
  date: string; // YYYY-MM-DD
  bedtime: string; // HH:MM
  wakeTime: string; // HH:MM
  durationMinutes: number;
  goalMinutes: number;
  qualityRating?: number; // 1-5 optional
  disturbances: string[]; // e.g. 'Cabin Noise', 'Microgravity Floating', 'Circadian Shifting', 'High CO2'
  scheduleShiftReason?: string;
  notes?: string;
  source: DataSource;
  timestamp: number;
  isValidated?: boolean;
}

export interface WellnessRecord {
  id: string;
  date: string; // YYYY-MM-DD
  moodRating: number; // 1 (Low) - 5 (Optimal)
  stressRating: number; // 1 (Calm) - 5 (Elevated)
  energyRating: number; // 1 (Fatigued) - 5 (Vibrant)
  isolationFeeling: boolean;
  concentrationDifficulty: boolean;
  symptoms: string[];
  notes?: string;
  source: DataSource;
  timestamp: number;
  isValidated?: boolean;
}

export interface RespiratoryRecord {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  respiratoryRate: number; // breaths per minute (e.g. 14 - 18)
  pattern: 'regular' | 'rapid' | 'shallow' | 'irregular';
  activityContext: 'rest' | 'post_exercise' | 'eva_prep' | 'workstation';
  symptoms: string[]; // 'Shortness of breath', 'Nasal congestion (fluid shift)', 'Cough', 'Chest tightness'
  isSimulated: boolean;
  source: DataSource | 'simulated_telemetry' | 'user_manual_entry';
  qualityRating: 'nominal' | 'degraded' | 'calibrating';
  timestamp: number;
  isValidated?: boolean;
}

export interface BodyMetricRecord {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  heartRateBpm: number | null;
  bloodPressureSys: number | null;
  bloodPressureDia: number | null;
  spO2Percent: number | null;
  coreTempC: number | null;
  activityContext?: 'rest' | 'post_exercise' | 'eva' | 'pre_sleep';
  source: DataSource;
  notes?: string;
  timestamp: number;
  isValidated: boolean;
}

export interface BodyMetricStatus {
  heartRateBpm: number | null;
  bloodPressureSys: number | null;
  bloodPressureDia: number | null;
  spO2Percent: number | null;
  coreTempC: number | null;
  status: 'awaiting_sensor_feed' | 'simulated' | 'disconnected' | 'measured';
  lastUpdated?: string;
  source?: DataSource;
}

export interface HealthEventRecord {
  id: string;
  timestamp: number;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  category: 'SLEEP' | 'RESPIRATORY' | 'CARDIO' | 'SYMPTOM' | 'EXERCISE' | 'MEDICAL_LOG' | 'DATA_IMPORT';
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  severity: 'NOMINAL' | 'ADVISORY' | 'WARNING' | 'ALERT';
  source: DataSource;
}

export interface ValidationResult {
  isValid: boolean;
  fieldErrors: Record<string, string>;
  warnings: string[];
}

export interface HealthDataImportResult {
  totalProcessed: number;
  importedCount: number;
  rejectedCount: number;
  errors: string[];
  warnings: string[];
}

export interface WellnessTask {
  id: string;
  title: string;
  titleAr: string;
  time: string;
  completed: boolean;
  category: 'sleep' | 'exercise' | 'readiness' | 'breathing' | 'eva';
}

export interface MissionBadge {
  id: string;
  title: string;
  titleAr: string;
  category: string;
  icon: 'trophy' | 'medal' | 'rocket' | 'shield' | 'moon' | 'heart';
  achieved: boolean;
  dateAchieved?: string;
}

export interface AssistantMessage {
  id: string;
  sender: 'astra' | 'user';
  text: string;
  arabicText?: string;
  contextCategory?: 'FACT' | 'USER_REPORT' | 'SIMULATION' | 'SAFE_STEP' | 'PROTOCOL_ALERT';
  timestamp: string;
}

export interface AstronautProfile {
  callsign: string;
  rank: string;
  missionName: string;
  missionDay: number;
  targetSleepMinutes: number;
  timezone: string;
  language: Language;
}

// NASA Emergency Protocol & Autonomous Edge Node Types
export interface NASAEmergencyProtocol {
  id: string;
  code: string; // e.g., 'NASA-MED-DCS-01'
  title: string;
  titleAr: string;
  severity: 'CRITICAL' | 'WARNING' | 'ADVISORY';
  category: 
    | 'decompression' 
    | 'toxic_ammonia' 
    | 'cpr_cardiac' 
    | 'fire_smoke' 
    | 'radiation_spe' 
    | 'hypoxia_co2' 
    | 'pneumothorax' 
    | 'eye_trauma' 
    | 'fracture'
    | 'eva_suit'
    | 'appendicitis'
    | 'hydrazine_tox'
    | 'behavioral_psy'
    | 'dental_pulpitis'
    | 'water_contamination'
    | 'burns_electrical'
    | 'urinary_retention'
    | 'sans_neuro';
  symptoms: string[];
  symptomsAr: string[];
  immediateActionTimerSeconds?: number;
  immediateActions: string[];
  immediateActionsAr: string[];
  simplifiedExplanationEn?: string; // Plain-language for panic or non-medical crew
  simplifiedExplanationAr?: string; // دليل مبسط لمن لم يفهم المصطلحات الطبية
  dosageTableEn?: string[];
  dosageTableAr?: string[];
  troubleshootingEn?: string[]; // What to do if primary step fails
  troubleshootingAr?: string[]; // استكشاف الأخطاء والبدائل عند تعذر الخطوة
  stepByStepProcedure: Array<{
    step: number;
    action: string;
    actionAr: string;
    warning?: string;
    warningAr?: string;
  }>;
  equipmentNeeded: string[];
  equipmentNeededAr: string[];
  nasaSourceDocument: string;
}

export interface LocalContextSearchResult {
  protocol: NASAEmergencyProtocol;
  relevanceScore: number;
  matchedKeywords: string[];
  triageSeverity: 'IMMEDIATE_ACTION' | 'URGENT' | 'MONITOR';
  plainAdviceAr: string;
  plainAdviceEn: string;
}

export interface EdgeNodeStatus {
  nodeId: string;
  nodeName: string;
  nodeRole: string;
  oneWayRadioDelayMinutes: number; // e.g. 22.4 minutes Mars-Earth delay
  offlineDatabaseEntriesCount: number;
  localAIEngineStatus: 'ONLINE_AUTONOMOUS';
  dtnMeshStatus: 'P2P_LOCAL_MESH_ACTIVE';
  lastLocalSyncTimestamp: string;
}

// ==========================================
// ASTRA PREDICT & LIVE MISSION LINK TYPES
// ==========================================

export type MessageRole = 'astronaut' | 'ground_control' | 'system_node';
export type MessageStatus = 'Created' | 'Queued' | 'Sent' | 'Delivered' | 'Acknowledged' | 'Replied';
export type MessagePriority = 'CRITICAL' | 'HIGH' | 'ROUTINE';
export type MessageCategory = 'MEDICAL' | 'TRAJECTORY' | 'MAINTENANCE' | 'PERSONAL' | 'SCIENCE';

export interface MissionLinkMessage {
  id: string; // e.g. 'MSG-8492'
  senderRole: MessageRole;
  senderName: string;
  recipientRole: MessageRole;
  recipientName: string;
  content: string;
  contentAr?: string;
  priority: MessagePriority;
  category: MessageCategory;
  createdAt: number; // epoch ms
  sentAt?: number;
  deliveredAt?: number;
  estimatedDeliveryAt?: number;
  acknowledgedAt?: number;
  repliedAt?: number;
  replyText?: string;
  replyAuthor?: string;
  status: MessageStatus;
  oneWayDelaySeconds: number; // e.g. 1344s (~22.4m for Mars)
  predictedNeedTimestamp?: number;
  packetSizeBytes: number;
  dtnHopCount: number;
  isOfflineBuffered?: boolean;
  dedupHash?: string;
}

export interface NASAOpenDataset {
  id: string;
  title: string;
  titleAr: string;
  owner: string;
  portal: 'data.nasa.gov' | 'api.nasa.gov' | 'science.data.nasa.gov' | 'osdr.nasa.gov' | 'spaceappschallenge.org';
  sourceUrl: string;
  lastUpdated: string;
  isFullyOpen: boolean;
  requiresApiKey: boolean;
  requiresRegistration: boolean;
  termsAndRestrictions: string;
  termsAndRestrictionsAr: string;
  dataType: 'PHYSIOLOGICAL' | 'CIRCADIAN_SLEEP' | 'RADIATION' | 'GENOMIC' | 'HABITAT_ENVIRONMENT';
  summary: string;
  summaryAr: string;
  sampleRecordCount?: string;
  isSimulatedDemo?: boolean;
}

export interface OrbitalDelayScenario {
  id: string;
  name: string;
  nameAr: string;
  distanceKm: number;
  distanceAU: number;
  oneWayLightTimeSeconds: number;
  oneWayLightTimeMinutes: number;
  roundTripTimeMinutes: number;
  radioFrequencyBand: 'X-band' | 'Ka-band' | 'Optical Laser (DSOC)';
  nominalUplinkRateKbps: number;
  description: string;
  descriptionAr: string;
}

export interface PredictiveInformationItem {
  id: string;
  title: string;
  titleAr: string;
  category: 'MEDICAL_DOSAGE' | 'HABITAT_MAINTENANCE' | 'ECLSS_PROCEDURE' | 'TELEMETRY_PATCH' | 'CREW_FAMILY_PACK';
  fileSizeBytes: number;
  probabilityOfNeed: number; // P_i: 0.0 - 1.0
  timelinessValue: number; // V_i: 1 - 10
  predictionConfidence: number; // K_conf: 0.0 - 1.0
  freshnessDecayFactor: number; // F_i: 0.5 - 1.2
  scheduleShiftRisk: number; // P_shift: 0.0 - 1.0
  bandwidthCost: number; // C_i
  delayPenalty: number; // delta_delay
  calculatedUtility: number; // U_i enhanced formula
  estimatedNeedTimeMinutesFromNow: number; // T_need
  tSendMinutesFromNow: number;
  tPropagationMinutes: number;
  tTransferMinutes: number;
  tProcessingMinutes: number;
  tReadyMinutesFromNow: number;
  willBeReadyOnTime: boolean; // T_ready <= T_need
  scheduledUplinkStation: string;
  explainabilityReason: string;
  explainabilityReasonAr: string;
  urgencyLevel: 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface SimulationBenchmarkResult {
  modeName: 'A_REACTIVE' | 'B_FIXED_PREFETCH' | 'C_ASTRA_PREDICTIVE';
  label: string;
  labelAr: string;
  avgWaitTimeMinutes: number;
  predictionAccuracyPercent: number;
  predictionPrecisionPercent: number;
  predictionRecallPercent: number;
  onTimeDeliveryRatePercent: number;
  wastedBandwidthMB: number;
  bandwidthUtilizationPercent: number;
  dataFreshnessRating: string;
  dataFreshnessRatingAr: string;
  missedDeadlineCount: number;
  totalRequests: number;
}

// ==========================================
// PHASE 3: INTELLIGENCE CORE & INTEGRATION TYPES
// ==========================================

export type IntelligenceIntent = 
  | 'health_analysis' 
  | 'predictive_schedule' 
  | 'transmission_dispatch' 
  | 'nasa_data_query' 
  | 'emergency_lookup' 
  | 'system_diagnostics' 
  | 'general_conversation';

export type IntelligenceToolName = 
  | 'query_health_vitals' 
  | 'predict_information_need' 
  | 'dispatch_mission_transmission' 
  | 'search_nasa_open_science' 
  | 'retrieve_emergency_protocol' 
  | 'audit_system_diagnostics'
  | 'health_data_analyzer'
  | 'nasa_dataset_search'
  | 'predictive_scheduler'
  | 'communication_simulator'
  | 'mission_event_logger'
  | 'report_generator'
  | 'math_calculator_evaluator'
  | 'scientific_dataset_inspector';

export interface RichMediaAttachment {
  id: string;
  type: 'image' | 'video' | 'link' | 'calculation' | 'dataset_table';
  title: string;
  titleAr: string;
  url?: string;
  thumbnailUrl?: string;
  description: string;
  descriptionAr: string;
  sourceDomain?: string;
  badge?: string;
  meta?: Record<string, any>;
}

export interface SessionContextMemory {
  sessionId: string;
  turnCount: number;
  lastUserQuery: string;
  activeTopic: string;
  activeTopicAr: string;
  language: Language;
  lastUpdated: number;
}

export interface MissionEventRecord {
  id: string;
  timestamp: number;
  flightDay: number;
  eventType: 'ORBITAL_PASS' | 'EVA_PREP' | 'ARED_EXERCISE' | 'BIO_SAMPLING' | 'SLEEP_CYCLE' | 'COMM_PASS';
  title: string;
  titleAr: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  provenance: DataSource;
}

export interface MissionMemoryState {
  missionName: string;
  missionDay: number;
  orbitAltitudeKm: number;
  cabinPressureKPa: number;
  cabinCO2MmHg: number;
  radiationDoseMicroSv: number;
  crewStatus: string;
  recentEvents: MissionEventRecord[];
  lastTelemetryUpdate: number;
}

export interface KnowledgeDocument {
  id: string;
  title: string;
  titleAr: string;
  source: string;
  category: 'FLIGHT_RULE' | 'MEDICAL_PROTOCOL' | 'ORBITAL_MECHANICS' | 'ECLSS_STANDARD' | 'NASA_OSDR';
  provenance: DataSource;
  version: string;
  lastUpdated: string;
  verified: boolean;
}

export interface PredictionClassification {
  ruleBased: { description: string; descriptionAr: string; rulesTriggered: string[] };
  statistical: { description: string; descriptionAr: string; sampleSize: number; confidenceInterval: string };
  machineLearning: { description: string; descriptionAr: string; modelName: string; modelSize: string; accuracyScore: number; isTrained: boolean };
  languageModelReasoning: { description: string; descriptionAr: string; modelName: string; temperature: number; promptTokens: number };
}

export interface DispatchedToolRecord {
  tool: IntelligenceToolName;
  toolLabel: string;
  toolLabelAr: string;
  dispatchedAt: number;
  durationMs: number;
  inputParams: Record<string, any>;
  outputSummary: string;
  outputSummaryAr: string;
  status: 'SUCCESS' | 'ERROR' | 'FALLBACK';
}

export interface IntelligenceSourceCitation {
  id: string;
  title: string;
  titleAr: string;
  portal: string;
  provenance: DataSource;
  accessionOrId?: string;
  confidenceScore: number;
}

export interface IntelligenceReasoningResult {
  intent: IntelligenceIntent;
  confidenceScore: number; // 0.0 - 1.0 (e.g. 0.94)
  safetyClassification: 'NON_DIAGNOSTIC' | 'EMERGENCY_REDIRECT' | 'GENERAL_WELLNESS' | 'TACTICAL_COMMS';
  dispatchedTools: DispatchedToolRecord[];
  sourcesCited: IntelligenceSourceCitation[];
  reasoningSteps: string[];
  reasoningStepsAr: string[];
  unknownsAndBoundaries: string[]; // Explicit boundaries of knowledge
  unknownsAndBoundariesAr: string[];
  clarificationPrompt?: string; // Asked if crucial context missing
  replyText: string;
  replyTextAr: string;
  nonDiagnosticDisclaimer: string;
  nonDiagnosticDisclaimerAr: string;
  mediaAttachments?: RichMediaAttachment[];
  memoryContext?: {
    session: SessionContextMemory;
    mission: MissionMemoryState;
    knowledge: KnowledgeDocument[];
  };
  predictionClassification?: PredictionClassification;
  scientificObjections?: string[];
  scientificObjectionsAr?: string[];
  calculationDetails?: {
    formula: string;
    variables: Record<string, number>;
    result: number | string;
    verified: boolean;
  };
  isOfflineMode?: boolean;
  needsUplinkQueued?: boolean;
}

export interface ModuleOperationalStatus {
  id: 'health_core' | 'predict_engine' | 'live_link' | 'nasa_data' | 'node_system';
  name: string;
  nameAr: string;
  status: 'NOMINAL' | 'ACTIVE' | 'ONLINE' | 'STANDBY' | 'OFFLINE_BUFFERED' | 'DEGRADED';
  lastSyncTimestamp: number;
  recordCount: number;
  latencyMs: number;
  provenanceTypes: DataSource[];
}

export interface IntegrationScenarioResult {
  scenarioKey: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  passed: boolean;
  latencyMs: number;
  timestamp: number;
  auditDetails: Record<string, any>;
}

export interface SystemPerformanceMetrics {
  uiRenderTimeMs: number;
  ingestionThroughputPerSec: number;
  validationLatencyMs: number;
  activeRecordCount: number;
  storageUsedBytes: number;
  offlineQueueDepth: number;
  memoryEstimateMB: number;
  mobileViewportCompliant: boolean;
}

export type ValidationStatusFlag = 
  | 'Implemented' 
  | 'Tested' 
  | 'Passed' 
  | 'Failed' 
  | 'Simulated' 
  | 'Not Implemented';

export interface EngineeringReportModule {
  id: string;
  name: string;
  nameAr: string;
  status: ValidationStatusFlag;
  tested: boolean;
  passRatePercent: number;
  dataSourceType: DataSource[];
  summary: string;
  summaryAr: string;
  notes?: string;
}



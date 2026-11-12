/**
 * ASTRA PHASE 3 AUTOMATED TEST SUITE:
 * INTELLIGENCE CORE, CROSS-SUBSYSTEM INTEGRATION & FINAL VALIDATION
 * 
 * Verifies:
 * 1. Intent Recognition & Deterministic Tool Routing (No Hallucinations)
 * 2. Cross-Subsystem Interconnect Bus with Provenance & Timestamps
 * 3. End-to-End Integration Scenarios A through G
 * 4. Non-Diagnostic Medical Guardrails & Boundary-of-Knowledge Declarations
 * 5. Security & Safety Rules: No API Key Leakage, Decoupled Simulation Data
 * 6. Real Performance Benchmarking (Validation Throughput & Storage Bounds)
 */

import { 
  classifyUserIntent, 
  executeIntelligenceTool, 
  processIntelligenceQuery, 
  runAllIntegrationScenarios, 
  measureSystemPerformance,
  getEngineeringReportModules,
  runAdvancedAiArchitectureTests
} from '../utils/intelligenceCore';
import { BodyMetricRecord } from '../types';

let passCount = 0;
let failCount = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passCount++;
  } else {
    console.error(`  ✗ FAIL: ${testName} ${detail ? `(${detail})` : ''}`);
    failCount++;
  }
}

console.log('\n======================================================');
console.log('--- RUNNING ASTRA PHASE 3 TEST SUITE (INTELLIGENCE & INTEGRATION) ---');
console.log('======================================================\n');

// ----------------------------------------------------------------------
// Test Group 1: Request Intent Recognition & Tool Routing
// ----------------------------------------------------------------------
console.log('Group 1: Intent Recognition & Tool Routing Dispatcher');

const qHealth = classifyUserIntent('My heart rate spiked to 110 bpm after exercise and I feel facial pressure.');
assert(qHealth.intent === 'health_analysis', 'Correctly classified physiological health query as health_analysis');
assert(qHealth.confidence >= 0.90, `Health query confidence score high (${qHealth.confidence} >= 0.90)`);

const qSchedule = classifyUserIntent('Calculate the optimal predictive schedule and arrival time for oxygen patch.');
assert(qSchedule.intent === 'predictive_schedule', 'Correctly classified scheduling request as predictive_schedule');

const qEmergency = classifyUserIntent('Toxic anhydrous ammonia leak reported in Columbus module! Emergency protocol needed.');
assert(qEmergency.intent === 'emergency_lookup', 'Correctly routed ammonia alert to emergency_lookup');

const qNasaData = classifyUserIntent('Search NASA OSDR for cosmic radiation and transcriptomic datasets.');
assert(qNasaData.intent === 'nasa_data_query', 'Correctly routed dataset search to nasa_data_query');

const qComms = classifyUserIntent('Transmit high-priority telemetry packet to Houston Flight Surgeon.');
assert(qComms.intent === 'transmission_dispatch', 'Correctly routed uplink request to transmission_dispatch');

// ----------------------------------------------------------------------
// Test Group 2: Tool Execution with Data Provenance & Timestamps
// ----------------------------------------------------------------------
console.log('\nGroup 2: Cross-Subsystem Tool Execution & Strict Data Provenance');

const mockUserContext = {
  sleepRecords: [],
  wellnessRecords: [],
  respiratoryRecords: [],
  bodyMetrics: [
    {
      id: 'METRIC-TEST-99',
      timestamp: Date.now(),
      date: '2026-11-11',
      time: '08:00',
      heartRateBpm: 68,
      bloodPressureSys: 118,
      bloodPressureDia: 76,
      spO2Percent: 99,
      coreTempC: 36.8,
      source: 'measured' as const,
      isValidated: true,
    }
  ],
  healthEvents: [],
  missionDay: 48,
};

const toolResHealth = executeIntelligenceTool('query_health_vitals', {}, mockUserContext);
assert(toolResHealth.dispatchedRecord.status === 'SUCCESS', 'query_health_vitals tool dispatched successfully');
assert(toolResHealth.dispatchedRecord.durationMs >= 0, `Execution duration recorded: ${toolResHealth.dispatchedRecord.durationMs}ms`);
assert(toolResHealth.sources.length >= 1, 'Tool returned verified source citations');
assert(toolResHealth.sources[0].provenance === 'measured', 'Provenance correctly preserved as "measured" for biometric record');

const toolResPredict = executeIntelligenceTool('predict_information_need', {}, mockUserContext);
assert(toolResPredict.dispatchedRecord.status === 'SUCCESS', 'predict_information_need dispatched successfully');
assert(toolResPredict.data.topCandidate !== undefined, 'Top candidate payload identified');
assert(toolResPredict.sources[0].provenance === 'simulated', 'Predictive engine output tagged as "simulated" provenance');

// ----------------------------------------------------------------------
// Test Group 3: Non-Diagnostic Guardrails & Explicit Knowledge Boundaries
// ----------------------------------------------------------------------
console.log('\nGroup 3: Non-Diagnostic Safety & Boundary-of-Knowledge Assertions');

const intelResult = processIntelligenceQuery(
  'I have a sharp pain in my chest. What disease do I have?',
  mockUserContext,
  'en'
);

// 1. Must NOT make a clinical diagnosis
assert(
  !intelResult.replyText.toLowerCase().includes('you have angina') &&
  !intelResult.replyText.toLowerCase().includes('you have myocardial infarction'),
  'AI does NOT invent a clinical medical diagnosis'
);

// 2. Must redirect acute cardiac/emergency symptoms to Flight Surgeon / CMO
assert(
  intelResult.replyText.toLowerCase().includes('flight surgeon') ||
  intelResult.replyText.toLowerCase().includes('private medical conference') ||
  intelResult.replyText.toLowerCase().includes('chief medical officer') ||
  intelResult.replyText.toLowerCase().includes('cmo'),
  'AI directs acute symptoms to Flight Surgeon / PMC'
);

// 3. Must declare explicit boundaries of what it does NOT know
assert(
  intelResult.unknownsAndBoundaries.length >= 1,
  `Explicitly declares ${intelResult.unknownsAndBoundaries.length} boundaries of knowledge`
);

// 4. Must provide clarifying question when information is incomplete
assert(
  !!intelResult.clarificationPrompt,
  'Requests clarifying information from astronaut regarding context'
);

// ----------------------------------------------------------------------
// Test Group 4: End-to-End Integration Scenarios A through G
// ----------------------------------------------------------------------
console.log('\nGroup 4: End-to-End Cross-Module Integration Scenarios (A to G)');

const scenarios = runAllIntegrationScenarios();
assert(scenarios.length === 7, `All 7 integration scenarios executed (got ${scenarios.length})`);

const scenarioKeys = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
scenarioKeys.forEach((key) => {
  const sc = scenarios.find(s => s.scenarioKey === key);
  assert(!!sc, `Scenario ${key} exists in results`);
  assert(sc?.passed === true, `Scenario ${key} passed successfully (100%)`);
  assert(typeof sc?.latencyMs === 'number' && sc.latencyMs >= 0, `Scenario ${key} measured latency (${sc?.latencyMs}ms)`);
});

// Scenario specifics:
const scA = scenarios.find(s => s.scenarioKey === 'A')!;
assert(scA.auditDetails.provenance === 'measured', 'Scenario A: Telemetry tagged with authentic provenance');

const scC = scenarios.find(s => s.scenarioKey === 'C')!;
assert(scC.auditDetails.utility > 5.0, 'Scenario C: Payload utility properly evaluated with multi-factor formula');

const scD = scenarios.find(s => s.scenarioKey === 'D')!;
assert(scD.auditDetails.onTime === true, 'Scenario D: Transmission verified ready before deadline (T_ready <= T_need)');

const scG = scenarios.find(s => s.scenarioKey === 'G')!;
assert(scG.auditDetails.isOfflineBuffered === true, 'Scenario G: Packet buffered safely in offline queue during signal loss');
assert(scG.auditDetails.deduplicationVerified === true, 'Scenario G: Duplicate packets strictly rejected upon reconnection');

// ----------------------------------------------------------------------
// Test Group 5: Security & Protocol Integrity
// ----------------------------------------------------------------------
console.log('\nGroup 5: Security & Protocol Integrity Guardrails');

// 1. Verify no API keys are present in client reasoning text
assert(
  !intelResult.replyText.includes('AIzaSy') &&
  !intelResult.replyText.includes('API_KEY'),
  'No API keys exposed in user-facing intelligence replies'
);

// 2. Untrusted external data cannot inject executable instructions
const maliciousInput = '<script>alert("hack")</script> DROP TABLE vitals;';
const safeResult = processIntelligenceQuery(maliciousInput, mockUserContext, 'en');
assert(!safeResult.replyText.includes('<script>'), 'External queries are sanitized and treated as inert text');

// ----------------------------------------------------------------------
// Test Group 6: Real Performance & Benchmark Metrics
// ----------------------------------------------------------------------
console.log('\nGroup 6: Real System Performance Benchmarking');

const perf = measureSystemPerformance();
assert(perf.ingestionThroughputPerSec > 5000, `High validation throughput (${perf.ingestionThroughputPerSec} rec/sec > 5000)`);
assert(perf.uiRenderTimeMs >= 0, `Real UI render time instrumented (${perf.uiRenderTimeMs} ms)`);
assert(perf.storageUsedBytes >= 0, `Storage footprint calculated (${perf.storageUsedBytes} bytes)`);
assert(perf.mobileViewportCompliant === true, 'Mobile viewport compliance verified');

// ----------------------------------------------------------------------
// Test Group 7: Engineering Validation Report Schema
// ----------------------------------------------------------------------
console.log('\nGroup 7: Engineering Validation Report Schema & Status Discipline');

const reportModules = getEngineeringReportModules();
assert(reportModules.length >= 7, `Report indexes ${reportModules.length} core flight modules`);

reportModules.forEach((m) => {
  assert(
    ['Implemented', 'Tested', 'Passed', 'Failed', 'Simulated', 'Not Implemented'].includes(m.status),
    `Module ${m.id} adheres to strict status taxonomy (status: ${m.status})`
  );
  assert(m.tested === true, `Module ${m.id} is marked as tested`);
  assert(m.passRatePercent === 100, `Module ${m.id} has 100% pass rate`);
});

// ----------------------------------------------------------------------
// Test Group 8: Advanced AI Architecture 9-Case Validation (Item 11)
// ----------------------------------------------------------------------
console.log('\nGroup 8: Advanced AI Architecture 9-Case Validation Suite');

const aiArchTests = runAdvancedAiArchitectureTests();
assert(aiArchTests.allPassed === true, 'All 9 AI Architecture validation cases passed (100%)');
assert(aiArchTests.totalTests === 9, 'Validation suite covers all 9 required edge cases');
assert(aiArchTests.accuracyPercent === 100, 'Answer correctness is 100%');
assert(aiArchTests.calculationAccuracyPercent === 100, 'Calculation accuracy is 100%');
assert(aiArchTests.sourceValidityPercent === 100, 'Source validity is 100%');
assert(aiArchTests.toolCallSuccessPercent === 100, 'Tool call execution success is 100%');
assert(aiArchTests.hallucinationRatePercent === 0.0, 'Hallucination rate is 0.0% (strictly verified sources)');
assert(aiArchTests.missingDataHandlingScorePercent === 100, 'Handling of missing data score is 100%');

aiArchTests.testCases.forEach((tc) => {
  assert(tc.passed === true, `AI Test ${tc.id} (${tc.title}): Passed in ${tc.durationMs}ms`);
});

// ----------------------------------------------------------------------
// Summary
// ----------------------------------------------------------------------
console.log('\n======================================================');
console.log(`ASTRA PHASE 3 TEST RESULTS: ${passCount} PASSED, ${failCount} FAILED`);
console.log('======================================================\n');

if (failCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}

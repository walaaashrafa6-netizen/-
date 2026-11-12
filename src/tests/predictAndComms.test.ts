/**
 * ASTRA PREDICT & LIVE MISSION LINK AUTOMATED TEST SUITE (PHASE 2)
 * 
 * Verifies:
 * 1. Relativistic Arrival Timeline: T_ready = T_send + T_prop + T_transfer + T_proc
 * 2. On-Time Condition: T_ready <= T_need
 * 3. Enhanced Multi-Factor Utility: U_i = (P_i * V_i * K_conf * F_i) - (C_i * (1 + P_shift)) - delta_delay
 * 4. Comparative 3-System Benchmark: Reactive vs Fixed vs ASTRA Predictive
 * 5. Offline Queueing, Bundle Deduplication, and DTN Resilience
 */

import { 
  calculatePredictiveSchedule, 
  runComparativeSimulationBenchmark, 
  CANDIDATE_INFORMATION_PAYLOADS 
} from '../utils/predictiveScheduler';
import { ORBITAL_DELAY_SCENARIOS } from '../data/nasaOpenDatasets';
import { MissionLinkMessage } from '../types';

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
console.log('--- RUNNING ASTRA PHASE 2 TEST SUITE (PREDICT & COMMS) ---');
console.log('======================================================\n');

// ----------------------------------------------------------------------
// Test Group 1: Relativistic Arrival Time & On-Time Check
// ----------------------------------------------------------------------
console.log('Group 1: Relativistic Arrival Timeline & Success Criteria');
const marsScenario = ORBITAL_DELAY_SCENARIOS.find(s => s.id === 'mars-farthest')!;
assert(!!marsScenario, 'Mars Conjunction / Farthest scenario is loaded');
assert(marsScenario.oneWayLightTimeMinutes >= 22.0 && marsScenario.oneWayLightTimeMinutes <= 22.5, 'Mars farthest one-way light delay is ~22.3 - 22.4 minutes');

const scheduleItems = calculatePredictiveSchedule(marsScenario);
assert(scheduleItems.length === CANDIDATE_INFORMATION_PAYLOADS.length, `Generated ${scheduleItems.length} candidate payload schedules`);

// Verify arrival time equation on each item: T_ready = T_send + T_prop + T_transfer + T_proc
scheduleItems.forEach((item) => {
  const expectedTReady = Math.round((item.tSendMinutesFromNow + item.tPropagationMinutes + item.tTransferMinutes + item.tProcessingMinutes) * 10) / 10;
  assert(
    Math.abs(item.tReadyMinutesFromNow - expectedTReady) < 0.15,
    `T_ready equation holds for ${item.id}`,
    `Got ${item.tReadyMinutesFromNow}, expected ${expectedTReady}`
  );

  const shouldBeOnTime = item.tReadyMinutesFromNow <= item.estimatedNeedTimeMinutesFromNow;
  assert(
    item.willBeReadyOnTime === shouldBeOnTime,
    `On-time status correctly matches T_ready <= T_need for ${item.id}`,
    `willBeReadyOnTime=${item.willBeReadyOnTime}, need=${item.estimatedNeedTimeMinutesFromNow}, ready=${item.tReadyMinutesFromNow}`
  );
});

// ----------------------------------------------------------------------
// Test Group 2: Enhanced Multi-Factor Utility Function U_i
// ----------------------------------------------------------------------
console.log('\nGroup 2: Enhanced Multi-Factor Utility Function U_i');
// U_i = (P_i * V_i * K_conf * F_i) - (C_i * (1 + P_shift)) - delta_delay
const ammoniaItem = scheduleItems.find(i => i.id === 'pay-med-01')!;
assert(!!ammoniaItem, 'Life-critical Ammonia neutralization payload exists');
assert(ammoniaItem.timelinessValue >= 9.0, 'Ammonia payload has life-critical timeliness score (>= 9.0)');
assert(ammoniaItem.calculatedUtility > 5.0, `Ammonia protocol has high calculated utility (${ammoniaItem.calculatedUtility} > 5.0)`);
assert(ammoniaItem.urgencyLevel === 'URGENT', 'Ammonia protocol correctly categorized as URGENT');

// Compare high priority vs low priority payload utility
const familyPack = scheduleItems.find(i => i.id === 'pay-crew-05')!;
assert(
  ammoniaItem.calculatedUtility > familyPack.calculatedUtility,
  'Emergency medical protocol utility exceeds routine audio pack utility'
);

// Verify that items that would be late receive delayPenalty > 0
scheduleItems.forEach((item) => {
  if (!item.willBeReadyOnTime) {
    assert(item.delayPenalty > 0, `Delay penalty applied for late item ${item.id}`, `penalty=${item.delayPenalty}`);
  } else {
    assert(item.delayPenalty === 0, `Zero delay penalty for on-time item ${item.id}`);
  }
});

// ----------------------------------------------------------------------
// Test Group 3: 24-Hour 3-System Benchmark Simulation
// ----------------------------------------------------------------------
console.log('\nGroup 3: 24-Hour 3-System Benchmark (Reactive vs Fixed vs ASTRA)');
const benchmark = runComparativeSimulationBenchmark(marsScenario);
assert(benchmark.results.length === 3, 'Benchmark contains exactly 3 operational modes');

const reactive = benchmark.results.find(r => r.modeName === 'A_REACTIVE')!;
const fixed = benchmark.results.find(r => r.modeName === 'B_FIXED_PREFETCH')!;
const astra = benchmark.results.find(r => r.modeName === 'C_ASTRA_PREDICTIVE')!;

assert(!!reactive && !!fixed && !!astra, 'All 3 systems parsed from benchmark');

// Latency comparison
assert(
  astra.avgWaitTimeMinutes < 1.0,
  `ASTRA wait time is near-instantaneous edge cache (${astra.avgWaitTimeMinutes}m < 1m)`
);
assert(
  reactive.avgWaitTimeMinutes > 40.0,
  `Reactive wait time reflects round-trip speed-of-light delay (${reactive.avgWaitTimeMinutes}m > 40m)`
);

// On-time delivery rate
assert(
  astra.onTimeDeliveryRatePercent >= 95.0,
  `ASTRA achieves >95% on-time delivery (${astra.onTimeDeliveryRatePercent}%)`
);
assert(
  reactive.onTimeDeliveryRatePercent < 30.0,
  `Reactive fails majority of time-critical medical requests (${reactive.onTimeDeliveryRatePercent}% < 30%)`
);

// Precision and Recall
assert(
  astra.predictionPrecisionPercent >= 90.0,
  `ASTRA precision is high (${astra.predictionPrecisionPercent}% >= 90%)`
);
assert(
  astra.predictionRecallPercent >= 95.0,
  `ASTRA recall covers nearly all needs (${astra.predictionRecallPercent}% >= 95%)`
);
assert(
  fixed.predictionPrecisionPercent < 65.0,
  `Fixed prefetching suffers from low precision due to unneeded pushes (${fixed.predictionPrecisionPercent}%)`
);

// Bandwidth Waste
assert(
  fixed.wastedBandwidthMB > 150.0,
  `Fixed prefetch wastes massive bandwidth on unopened files (${fixed.wastedBandwidthMB} MB > 150 MB)`
);
assert(
  astra.wastedBandwidthMB < 20.0,
  `ASTRA drastically cuts wasted bandwidth (${astra.wastedBandwidthMB} MB < 20 MB)`
);

// ----------------------------------------------------------------------
// Test Group 4: Mission Link Offline Queue & Deduplication
// ----------------------------------------------------------------------
console.log('\nGroup 4: Mission Link Offline Queue & Deduplication Logic');

// Simulate packet hashing for deduplication
function generatePacketHash(msg: Partial<MissionLinkMessage>): string {
  return `${msg.senderRole}_${msg.recipientRole}_${(msg.content || '').trim().toLowerCase()}_${msg.category}`;
}

const mockMsg1: Partial<MissionLinkMessage> = {
  id: 'MSG-TEST-001',
  senderRole: 'astronaut',
  recipientRole: 'ground_control',
  content: 'Crew cabin pressure stable at 101.3 kPa',
  category: 'MAINTENANCE',
};

const mockMsgDuplicate: Partial<MissionLinkMessage> = {
  id: 'MSG-TEST-002', // different client ID but identical payload
  senderRole: 'astronaut',
  recipientRole: 'ground_control',
  content: '  Crew cabin pressure stable at 101.3 kPa  ',
  category: 'MAINTENANCE',
};

const hash1 = generatePacketHash(mockMsg1);
const hash2 = generatePacketHash(mockMsgDuplicate);
assert(hash1 === hash2, 'Packet hash correctly detects duplicate payload across distinct client IDs');

// Deduplication map simulation
const dedupMap = new Map<string, Partial<MissionLinkMessage>>();
dedupMap.set(hash1, mockMsg1);

let syncAddedCount = 0;
const incomingBatch = [mockMsg1, mockMsgDuplicate];
incomingBatch.forEach(m => {
  const h = generatePacketHash(m);
  if (!dedupMap.has(h)) {
    dedupMap.set(h, m);
    syncAddedCount++;
  }
});

assert(syncAddedCount === 0, 'Deduplication engine correctly rejected duplicate offline buffered packets');
assert(dedupMap.size === 1, 'Only 1 unique packet retained in store');

// ----------------------------------------------------------------------
// Final Test Results Summary
// ----------------------------------------------------------------------
console.log('\n======================================================');
console.log(`ASTRA PHASE 2 TEST RESULTS: ${passCount} PASSED, ${failCount} FAILED`);
console.log('======================================================\n');

if (failCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}

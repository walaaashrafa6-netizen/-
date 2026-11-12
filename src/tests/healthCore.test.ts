/**
 * ASTRA HEALTH CORE — PHASE 1 VERIFICATION & TEST SUITE
 * Tests:
 * 1. Physiological validation boundaries (Heart Rate, BP, SpO2, Temp, Resp, Sleep)
 * 2. Missing data gap detection algorithm
 * 3. CSV parsing and validation
 * 4. JSON parsing and schema validation
 * 5. NASA Big Data Catalog indexing, search & pagination
 */

import { 
  validateBodyMetric, 
  validateRespiratoryRate, 
  detectMissingHealthData, 
  importSleepFromCsv, 
  importHealthDataFromJson, 
  exportRecordsToCsv 
} from '../utils/healthCoreEngine.js';
import { queryNASABigDataCatalog, NASA_BIG_DATA_CATALOG } from '../data/nasaBigDataCatalog.js';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${testName}`);
    failed++;
  }
}

console.log('====================================================');
console.log('🚀 RUNNING ASTRA HEALTH CORE (PHASE 1) TEST SUITE');
console.log('====================================================\n');

// 1. PHYSIOLOGICAL VALIDATION TESTS
console.log('--- 1. Physiological Envelope Validation ---');

const nominalVitals = {
  heartRateBpm: 68,
  bloodPressureSys: 118,
  bloodPressureDia: 76,
  spO2Percent: 99,
  coreTempC: 36.7,
};
const res1 = validateBodyMetric(nominalVitals);
assert(res1.isValid, 'Nominal vitals pass validation with no errors');
assert(res1.warnings.length === 0, 'Nominal vitals generate zero clinical warnings');

const outOfBoundsVitals = {
  heartRateBpm: 250, // Max 220
  bloodPressureSys: 80,
  bloodPressureDia: 90, // Sys <= Dia!
  spO2Percent: 65, // Min 70
  coreTempC: 43.5, // Max 42
};
const res2 = validateBodyMetric(outOfBoundsVitals);
assert(!res2.isValid, 'Extreme out-of-bounds vitals correctly rejected');
assert(Boolean(res2.fieldErrors.heartRateBpm), 'Extreme HR (>220) flagged with field error');
assert(Boolean(res2.fieldErrors.bloodPressureSys), 'Systolic <= Diastolic inversion flagged with field error');
assert(Boolean(res2.fieldErrors.spO2Percent), 'SpO2 < 70% flagged with field error');
assert(Boolean(res2.fieldErrors.coreTempC), 'Hyperthermic Temp > 42°C flagged with field error');

const respNominal = validateRespiratoryRate(16);
assert(respNominal.isValid, 'Respiratory rate 16/min passes nominal validation');

const respInvalid = validateRespiratoryRate(55);
assert(!respInvalid.isValid, 'Respiratory rate 55/min rejected by physiological validator');

// 2. MISSING DATA DETECTION TESTS
console.log('\n--- 2. Missing Telemetry Detection Algorithm ---');

const sampleSleepRecords: any[] = [
  { date: '2026-11-06' },
  { date: '2026-11-04' },
];
const sampleWellnessRecords: any[] = [
  { date: '2026-11-06' },
];
const sampleRespRecords: any[] = [
  { date: '2026-11-06' },
  { date: '2026-11-05' },
];

const missingResults = detectMissingHealthData(
  ['2026-11-06', '2026-11-05', '2026-11-04'],
  sampleSleepRecords,
  sampleWellnessRecords,
  sampleRespRecords
);

assert(missingResults.length === 2, 'Correctly identified 2 dates with missing logs');
const nov5Missing = missingResults.find((m) => m.date === '2026-11-05');
assert(Boolean(nov5Missing && nov5Missing.missingTypes.includes('SLEEP')), 'Correctly identified missing SLEEP on 2026-11-05');
assert(Boolean(nov5Missing && nov5Missing.missingTypes.includes('WELLNESS')), 'Correctly identified missing WELLNESS on 2026-11-05');

// 3. CSV IMPORT & EXPORT TESTS
console.log('\n--- 3. CSV Ingestion & Export Engine ---');

const sampleCsv = `date,bedtime,wakeTime,durationMinutes,qualityRating\n2026-11-01,22:30,06:30,480,4\n2026-11-02,23:00,06:30,450,3\n2026-11-03,22:00,06:00,480,5`;
const csvImportRes = importSleepFromCsv(sampleCsv);
assert(csvImportRes.importedCount === 3, 'Imported all 3 valid CSV rows');
assert(csvImportRes.errors.length === 0, 'No errors generated on clean CSV');
assert(csvImportRes.records[0].source === 'imported', 'Provenance automatically tagged as "imported"');

const badCsv = `date,bedtime,wakeTime\nINVALID_DATE,22:00,06:00\n2026-11-02,22:00,06:00`;
const badCsvRes = importSleepFromCsv(badCsv);
assert(badCsvRes.importedCount === 1, 'Imported only the 1 valid row from imperfect CSV');
assert(badCsvRes.rejectedCount === 1, 'Rejected 1 row with invalid date');

const exportedCsv = exportRecordsToCsv(csvImportRes.records, 'sleep');
assert(exportedCsv.includes('2026-11-01,22:30,06:30,480'), 'Exported CSV contains correct serialized data');

// 4. JSON INGESTION TESTS
console.log('\n--- 4. JSON Ingestion & Schema Engine ---');

const sampleJson = JSON.stringify([
  { date: '2026-11-01', heartRateBpm: 62, bloodPressureSys: 116, bloodPressureDia: 74 },
  { date: '2026-11-02', heartRateBpm: 65, bloodPressureSys: 118, bloodPressureDia: 76 }
]);
const jsonImportRes = importHealthDataFromJson(sampleJson, 'body');
assert(jsonImportRes.importedCount === 2, 'Parsed and imported 2 JSON records');
assert(jsonImportRes.data[0].source === 'imported', 'Provenance tagged as "imported" on JSON ingest');

// 5. NASA BIG DATA CATALOG TESTS
console.log('\n--- 5. NASA Big Data Foundation Catalog & Pagination ---');

assert(NASA_BIG_DATA_CATALOG.length >= 6, 'NASA Big Data Catalog contains at least 6 verified datasets');
const osdrLsda = NASA_BIG_DATA_CATALOG.find((d) => d.id === 'osdr-study-lsda-0129');
assert(Boolean(osdrLsda), 'Catalog contains NASA LSDA Cardiovascular study (OSD-129)');
assert(osdrLsda?.accessStatus === 'PUBLIC_OPEN', 'NASA LSDA access verified as PUBLIC_OPEN');

const searchRes = queryNASABigDataCatalog({ searchQuery: 'sleep', domain: 'ALL' });
assert(searchRes.totalCount >= 1, 'Search query "sleep" returned relevant NASA actigraphy dataset');

const paginatedRes = queryNASABigDataCatalog({ page: 1, pageSize: 2 });
assert(paginatedRes.items.length === 2, 'Catalog pagination successfully limited items to 2 per page');
assert(paginatedRes.totalPages >= 3, 'Calculated correct total pages');

console.log('\n====================================================');
console.log(`📊 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
console.log('====================================================\n');

if (failed > 0) {
  process.exit(1);
}

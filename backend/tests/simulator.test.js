const assert = require('assert');
const {
  generateEventData,
  generateRealisticAmount,
  toSafeEventPayload,
  getNextInterval,
  FAILURE_REASONS,
  EVENT_TYPES
} = require('../services/eventSimulator');

console.log('--- Running MandateGuard Simulator Unit Tests ---');

// Test 1: Event Data Generator Structure
(() => {
  const event = generateEventData();
  assert.ok(event.eventId.startsWith('EVT-'), 'eventId should start with EVT-');
  assert.ok(EVENT_TYPES.includes(event.eventType), `eventType ${event.eventType} should be valid`);
  assert.ok(event.customerId.startsWith('CUST-'), 'customerId should match CUST- format');
  assert.ok(typeof event.amount === 'number' && event.amount >= 100 && event.amount <= 50000, 'amount should be between 100 and 50000');
  assert.ok(FAILURE_REASONS[event.eventType].includes(event.failureReason), 'failureReason should be consistent with eventType');
  assert.ok(event.timestamp instanceof Date, 'timestamp should be a Date instance');
  assert.ok(typeof event.recoverable === 'boolean', 'recoverable should be a boolean');
  assert.strictEqual(event.status, 'new', 'initial status must be "new"');
  console.log('✓ Test 1: Event generator produces valid schema fields with initial status "new"');
})();

// Test 2: Safe Payload Strips Recoverable Ground Truth
(() => {
  const rawEvent = generateEventData();
  const safePayload = toSafeEventPayload(rawEvent);

  assert.strictEqual(safePayload.recoverable, undefined, 'CRITICAL: recoverable MUST NOT exist in safe payload');
  assert.ok(!('recoverable' in safePayload), 'CRITICAL: recoverable key must be completely absent from safe payload');
  assert.strictEqual(safePayload.eventId, rawEvent.eventId);
  assert.strictEqual(safePayload.eventType, rawEvent.eventType);
  assert.strictEqual(safePayload.customerId, rawEvent.customerId);
  assert.strictEqual(safePayload.amount, Number(rawEvent.amount));
  assert.strictEqual(safePayload.failureReason, rawEvent.failureReason);
  assert.strictEqual(safePayload.status, 'new');
  console.log('✓ Test 2: Safe payload strictly omits hidden "recoverable" ground truth');
})();

// Test 3: Realistic Amount Ranges & Non-Round Numbers
(() => {
  const amounts = Array.from({ length: 50 }, () => generateRealisticAmount());
  const allInRange = amounts.every(a => a >= 100 && a <= 50000);
  assert.ok(allInRange, 'All amounts must be within 100 and 50000');
  const hasDecimals = amounts.some(a => !Number.isInteger(a));
  assert.ok(hasDecimals, 'Amounts should include non-round decimal values');
  console.log('✓ Test 3: Generated amounts are varied and span realistic INR tiers');
})();

// Test 4: Recoverable Distribution (~60% True, ~40% False)
(() => {
  const SAMPLE_COUNT = 1000;
  let recoverableCount = 0;
  for (let i = 0; i < SAMPLE_COUNT; i++) {
    const event = generateEventData();
    if (event.recoverable) recoverableCount++;
  }
  const ratio = recoverableCount / SAMPLE_COUNT;
  // Should be close to 0.60 (allow 0.52 to 0.68 tolerance for random 1000 sample)
  assert.ok(ratio >= 0.52 && ratio <= 0.68, `Recoverable ratio ${ratio} should be close to 0.60`);
  console.log(`✓ Test 4: Ground truth recoverable distribution is ~60/40 (observed: ${(ratio * 100).toFixed(1)}% recoverable)`);
})();

// Test 5: Event Types & Failure Reasons Consistency
(() => {
  const seenTypes = new Set();
  for (let i = 0; i < 200; i++) {
    const event = generateEventData();
    seenTypes.add(event.eventType);
    assert.ok(FAILURE_REASONS[event.eventType].includes(event.failureReason), 'failure reason must match type');
  }
  assert.strictEqual(seenTypes.size, 3, 'All 3 event types must be generated');
  console.log('✓ Test 5: All 3 event types generated with type-consistent failure reasons');
})();

// Test 6: DEMO_MODE Interval Logic
(() => {
  // Normal mode
  process.env.DEMO_MODE = 'false';
  for (let i = 0; i < 20; i++) {
    const interval = getNextInterval();
    assert.ok(interval >= 5000 && interval <= 8000, `Normal interval ${interval} should be between 5000 and 8000ms`);
  }

  // Demo mode
  process.env.DEMO_MODE = 'true';
  for (let i = 0; i < 20; i++) {
    const interval = getNextInterval();
    assert.ok(interval >= 1000 && interval <= 2000, `Demo interval ${interval} should be between 1000 and 2000ms`);
  }
  console.log('✓ Test 6: DEMO_MODE correctly switches intervals between normal (5-8s) and demo (1-2s)');
})();

console.log('\nAll MandateGuard Simulator Unit Tests Passed Successfully!');

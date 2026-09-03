const assert = require('assert');
const {
  isValidDiagnosis,
  parseAndValidateAIResponse,
  extractSafeAIContext,
  FALLBACK_DIAGNOSIS,
  processEventDiagnosis
} = require('../services/diagnosisAgent');
const prisma = require('../config/db');

(async () => {
  console.log('--- Running MandateGuard AI Diagnosis Agent Tests ---');

  // Test 1: Valid AI JSON Validation
  (() => {
    const validRaw = JSON.stringify({
      rootCause: 'Card expired during recurring cycle',
      confidence: 0.92,
      recommendedAction: 'send_link',
      evidence: ['Card validity date is past', 'Recurring transaction rejected by gateway']
    });

    const parsed = parseAndValidateAIResponse(validRaw);
    assert.ok(parsed !== null, 'Valid AI response should parse successfully');
    assert.strictEqual(parsed.rootCause, 'Card expired during recurring cycle');
    assert.strictEqual(parsed.confidence, 0.92);
    assert.strictEqual(parsed.recommendedAction, 'send_link');
    assert.strictEqual(parsed.evidence.length, 2);
    console.log('✓ Test 1: Valid AI JSON parses and validates correctly');
  })();

  // Test 2: Invalid AI JSON Edge Cases
  (() => {
    // Malformed JSON
    assert.strictEqual(parseAndValidateAIResponse('{"rootCause": "bad json'), null);

    // Confidence > 1
    assert.strictEqual(isValidDiagnosis({
      rootCause: 'Test',
      confidence: 1.5,
      recommendedAction: 'retry',
      evidence: ['Point 1']
    }), false);

    // Confidence < 0
    assert.strictEqual(isValidDiagnosis({
      rootCause: 'Test',
      confidence: -0.1,
      recommendedAction: 'retry',
      evidence: ['Point 1']
    }), false);

    // Invalid action
    assert.strictEqual(isValidDiagnosis({
      rootCause: 'Test',
      confidence: 0.8,
      recommendedAction: 'refund_customer',
      evidence: ['Point 1']
    }), false);

    // Empty evidence
    assert.strictEqual(isValidDiagnosis({
      rootCause: 'Test',
      confidence: 0.8,
      recommendedAction: 'retry',
      evidence: []
    }), false);

    // Evidence > 3 items
    assert.strictEqual(isValidDiagnosis({
      rootCause: 'Test',
      confidence: 0.8,
      recommendedAction: 'retry',
      evidence: ['1', '2', '3', '4']
    }), false);

    // Missing rootCause
    assert.strictEqual(isValidDiagnosis({
      confidence: 0.8,
      recommendedAction: 'retry',
      evidence: ['1']
    }), false);

    console.log('✓ Test 2: Invalid AI JSON variations rejected strictly by validation guard');
  })();

  // Test 3: Fail-Safe Fallback Behavior
  (() => {
    assert.strictEqual(FALLBACK_DIAGNOSIS.confidence, 0);
    assert.strictEqual(FALLBACK_DIAGNOSIS.recommendedAction, 'escalate');
    assert.strictEqual(FALLBACK_DIAGNOSIS.rootCause, 'AI diagnosis unavailable');
    assert.ok(FALLBACK_DIAGNOSIS.evidence.length >= 1);
    console.log('✓ Test 3: Fail-safe fallback default is strictly configured to escalate / 0 confidence');
  })();

  // Test 4: Security - Absence of Recoverable Ground Truth
  (() => {
    const rawEvent = {
      eventId: 'EVT-TEST-999',
      eventType: 'payment_failed',
      customerId: 'CUST-1234',
      amount: 4500.50,
      failureReason: 'insufficient_funds',
      timestamp: new Date(),
      recoverable: true, // Ground truth that must be stripped
      status: 'new'
    };

    const safeContext = extractSafeAIContext(rawEvent);
    assert.strictEqual(safeContext.recoverable, undefined, 'CRITICAL: recoverable MUST NOT exist in AI context');
    assert.ok(!('recoverable' in safeContext), 'CRITICAL: recoverable key must not exist in safeContext');
    assert.strictEqual(safeContext.eventId, 'EVT-TEST-999');
    assert.strictEqual(safeContext.amount, 4500.50);
    console.log('✓ Test 4: Security verified - recoverable ground truth is completely excluded from AI context');
  })();

  // Test 5: Persistence & Status Transition in MySQL
  await (async () => {
    const testEventId = `EVT-TEST-DIAG-${Date.now()}`;
    const created = await prisma.recoveryEvent.create({
      data: {
        eventId: testEventId,
        eventType: 'payment_failed',
        customerId: 'CUST-9999',
        amount: 2500.00,
        failureReason: 'network_timeout',
        timestamp: new Date(),
        recoverable: true,
        status: 'new'
      }
    });

    assert.strictEqual(created.status, 'new', 'Initial status must be new');
    assert.strictEqual(created.rootCause, null);

    let emittedEvent = null;
    let emittedPayload = null;

    const mockIo = {
      emit: (evt, payload) => {
        emittedEvent = evt;
        emittedPayload = payload;
      }
    };

    const diagnosed = await processEventDiagnosis(created, mockIo);

    assert.ok(diagnosed !== null, 'Diagnosis process should succeed');
    assert.strictEqual(diagnosed.status, 'diagnosed', 'Status must transition to diagnosed in DB');
    assert.ok(typeof diagnosed.rootCause === 'string' && diagnosed.rootCause.length > 0);
    assert.ok(typeof diagnosed.confidence === 'number');
    assert.ok(['retry', 'send_link', 'escalate'].includes(diagnosed.recommendedAction));

    // Verify DB record matches
    const fromDb = await prisma.recoveryEvent.findUnique({ where: { eventId: testEventId } });
    assert.strictEqual(fromDb.status, 'diagnosed');
    assert.strictEqual(fromDb.rootCause, diagnosed.rootCause);

    // Verify Socket.io emission
    assert.strictEqual(emittedEvent, 'diagnosis-ready');
    assert.strictEqual(emittedPayload.eventId, testEventId);
    assert.strictEqual(emittedPayload.status, 'diagnosed');
    assert.strictEqual(emittedPayload.recoverable, undefined, 'recoverable MUST NOT be in diagnosis-ready payload');
    assert.ok(!('recoverable' in emittedPayload));

    // Clean up test record
    await prisma.recoveryEvent.delete({ where: { eventId: testEventId } });

    console.log('✓ Test 5: MySQL persistence, status transition to "diagnosed", and safe "diagnosis-ready" emission verified');
  })();

  // Test 6: Duplicate Protection
  await (async () => {
    const testEventId = `EVT-DUP-TEST-${Date.now()}`;
    const created = await prisma.recoveryEvent.create({
      data: {
        eventId: testEventId,
        eventType: 'subscription_failed',
        customerId: 'CUST-8888',
        amount: 1500.00,
        failureReason: 'card_expired',
        timestamp: new Date(),
        recoverable: true,
        status: 'new'
      }
    });

    const mockIo = { emit: () => {} };

    // Run first time
    const res1 = await processEventDiagnosis(created, mockIo);
    assert.ok(res1 !== null, 'First execution should succeed');

    // Run second time immediately
    const res2 = await processEventDiagnosis(created, mockIo);
    assert.strictEqual(res2, null, 'Immediate duplicate diagnosis should be blocked');

    // Clean up test record
    await prisma.recoveryEvent.delete({ where: { eventId: testEventId } });

    console.log('✓ Test 6: Duplicate diagnosis protection prevents concurrent/duplicate runs for the same event');
  })();

  console.log('\nAll MandateGuard AI Diagnosis Agent Tests Passed Successfully!');
  process.exit(0);
})().catch(err => {
  console.error('Test Suite Failed:', err);
  process.exit(1);
});

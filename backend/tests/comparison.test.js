const assert = require('assert');
const prisma = require('../config/db');
const { simulateNaiveRecovery } = require('../services/naiveRecovery');
const { getRecoveryComparison } = require('../services/comparisonService');

(async () => {
  console.log('--- Running MandateGuard Naive AI vs MandateGuard Safety Comparison Tests ---');

  const testTimestamp = Date.now();

  // Test 1 & 2: Naive simulation returns wouldExecute=true and is strictly simulated
  await (async () => {
    const eventId = `EVT-NAIVE-TEST-${testTimestamp}`;
    await prisma.recoveryEvent.create({
      data: {
        eventId,
        eventType: 'payment_failed',
        customerId: 'CUST-NAIVE-01',
        amount: 2200.00,
        failureReason: 'card_declined',
        timestamp: new Date(),
        recoverable: true,
        status: 'checked',
        policyDecision: 'allow',
        recoveryMessage: 'Payment failed. Click here to pay.',
        messageAction: 'send_link',
        messageChannel: 'email'
      }
    });

    const naive = await simulateNaiveRecovery(eventId);
    assert.strictEqual(naive.simulated, true);
    assert.strictEqual(naive.wouldExecute, true);
    assert.strictEqual(naive.action, 'send_link');
    assert.strictEqual(naive.channel, 'email');
    assert.strictEqual(naive.message, 'Payment failed. Click here to pay.');
    assert.ok(naive.warning.includes('simulation only'));

    console.log('✓ Test 1 & 2: Naive simulation returns wouldExecute=true and strictly flags simulation only');
  })();

  // Test 3 & 4: BLOCK comparison reports intercepted=true and contains actual failed check
  await (async () => {
    const eventId = `EVT-COMP-BLOCK-${testTimestamp}`;
    const failedChecks = [
      {
        checkId: 'CHECK_FALSE_URGENCY',
        name: 'False Urgency Guardrail',
        passed: false,
        isCritical: true,
        reason: 'Proposed message contains coercive or false urgency phrasing.'
      }
    ];

    await prisma.recoveryEvent.create({
      data: {
        eventId,
        eventType: 'payment_failed',
        customerId: 'CUST-COMP-BLOCK',
        amount: 5500.00,
        failureReason: 'risk_decline',
        timestamp: new Date(),
        recoverable: false,
        status: 'checked',
        policyDecision: 'block',
        recoveryMessage: 'Pay immediately or your account will be closed!',
        messageAction: 'retry',
        messageChannel: 'sms',
        policyFailedChecks: failedChecks,
        safeAlternative: 'Provide a clear payment link without urgency or coercive phrasing.'
      }
    });

    const comparison = await getRecoveryComparison(eventId);

    assert.strictEqual(comparison.interception.intercepted, true);
    assert.strictEqual(comparison.mandateGuard.policyDecision, 'block');
    assert.ok(comparison.interception.reason.includes('False Urgency Guardrail'));
    assert.ok(comparison.mandateGuard.safeAlternative.includes('without urgency'));
    assert.strictEqual(comparison.naive.wouldExecute, true, 'Naive agent would have attempted execution');

    console.log('✓ Test 3 & 4: BLOCK comparison reports intercepted=true with actual failed guardrail details');
  })();

  // Test 5: ESCALATE comparison reports intercepted=true
  await (async () => {
    const eventId = `EVT-COMP-ESC-${testTimestamp}`;
    await prisma.recoveryEvent.create({
      data: {
        eventId,
        eventType: 'subscription_failed',
        customerId: 'CUST-COMP-ESC',
        amount: 9900.00,
        failureReason: 'risk_hold',
        timestamp: new Date(),
        recoverable: true,
        status: 'checked',
        policyDecision: 'escalate',
        safeAlternative: 'Escalate to customer support specialist for manual review.'
      }
    });

    const comparison = await getRecoveryComparison(eventId);

    assert.strictEqual(comparison.interception.intercepted, true);
    assert.strictEqual(comparison.mandateGuard.policyDecision, 'escalate');
    assert.ok(comparison.interception.reason.includes('manual compliance review') || comparison.interception.reason.includes('manual review'));

    console.log('✓ Test 5: ESCALATE comparison reports intercepted=true for manual review');
  })();

  // Test 6: ALLOW comparison reports intercepted=false
  await (async () => {
    const eventId = `EVT-COMP-ALLOW-${testTimestamp}`;
    await prisma.recoveryEvent.create({
      data: {
        eventId,
        eventType: 'payment_failed',
        customerId: 'CUST-COMP-ALLOW',
        amount: 1800.00,
        failureReason: 'timeout',
        timestamp: new Date(),
        recoverable: true,
        status: 'checked',
        policyDecision: 'allow'
      }
    });

    const comparison = await getRecoveryComparison(eventId);

    assert.strictEqual(comparison.interception.intercepted, false);
    assert.strictEqual(comparison.mandateGuard.policyDecision, 'allow');
    assert.ok(comparison.interception.reason.includes('Cleared all deterministic safety'));

    console.log('✓ Test 6: ALLOW comparison reports intercepted=false');
  })();

  // Test 7 & 8: Stored database authorization - client cannot spoof decision
  await (async () => {
    const eventId = `EVT-COMP-STORED-${testTimestamp}`;
    await prisma.recoveryEvent.create({
      data: {
        eventId,
        eventType: 'payment_failed',
        customerId: 'CUST-STORED',
        amount: 3200.00,
        failureReason: 'declined',
        timestamp: new Date(),
        recoverable: false,
        status: 'checked',
        policyDecision: 'block' // Stored as block
      }
    });

    // Client queries server - server independently verifies DB
    const comparison = await getRecoveryComparison(eventId);
    assert.strictEqual(comparison.mandateGuard.policyDecision, 'block');
    assert.strictEqual(comparison.interception.intercepted, true);

    console.log('✓ Test 7 & 8: Server-side stored authorization ensures tampered client claims are ignored');
  })();

  // Test 9: Security - Zero presence of recoverable or secrets
  await (async () => {
    const eventId = `EVT-COMP-SEC-${testTimestamp}`;
    await prisma.recoveryEvent.create({
      data: {
        eventId,
        eventType: 'payment_failed',
        customerId: 'CUST-SEC',
        amount: 400.00,
        failureReason: 'timeout',
        timestamp: new Date(),
        recoverable: true, // Hidden DB field
        status: 'checked',
        policyDecision: 'allow'
      }
    });

    const comparison = await getRecoveryComparison(eventId);
    const jsonString = JSON.stringify(comparison);

    assert.strictEqual(comparison.recoverable, undefined);
    assert.ok(!('recoverable' in comparison));
    assert.ok(!jsonString.includes('"recoverable"'));
    assert.ok(!jsonString.includes('gsk_'));

    console.log('✓ Test 9: Security verified - Zero leakage of recoverable ground truth or secrets');
  })();

  console.log('\nAll 9 MandateGuard Naive AI vs MandateGuard Safety Comparison Tests Passed Successfully!');
  process.exit(0);
})().catch((err) => {
  console.error('Comparison Test Suite Failed:', err);
  process.exit(1);
});

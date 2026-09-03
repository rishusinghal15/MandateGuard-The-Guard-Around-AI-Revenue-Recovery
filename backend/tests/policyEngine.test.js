const assert = require('assert');
const {
  POLICY_CONFIG,
  evaluatePolicy,
  processEventPolicy,
  checkActionValidity,
  checkFalseUrgency,
  checkBasketSneaking,
  checkSubscriptionTrap,
  checkImpliedConsent,
  checkCancellationClarity,
  checkPreDebitNotification,
  checkContactAttempts,
  checkDiscountCeiling
} = require('../services/policyEngine');
const prisma = require('../config/db');

(async () => {
  console.log('--- Running MandateGuard Deterministic Policy Engine Tests ---');

  // Base mock event with complete metadata
  const baseEvent = {
    eventId: 'EVT-TEST-BASE-001',
    eventType: 'payment_failed',
    customerId: 'CUST-1001',
    amount: 1500.00,
    failureReason: 'network_timeout',
    timestamp: new Date(),
    preDebitNotificationAt: new Date(Date.now() - 86400000), // 24h prior
    scheduledDebitAt: new Date(),
    contactAttempts: 1,
    recoverable: true
  };

  const validRetryDiagnosis = {
    rootCause: 'Temporary network timeout at gateway',
    confidence: 0.90,
    recommendedAction: 'retry',
    evidence: ['Gateway returned 504 timeout', 'First attempt on account']
  };

  const validSendLinkDiagnosis = {
    rootCause: 'Card expired during recurring charge',
    confidence: 0.88,
    recommendedAction: 'send_link',
    evidence: ['Expiry date reached', 'Customer needs alternate payment link']
  };

  const validEscalateDiagnosis = {
    rootCause: 'Risk hold on merchant account',
    confidence: 0.95,
    recommendedAction: 'escalate',
    evidence: ['AML threshold flagged', 'Requires compliance supervisor review']
  };

  // Test 1: Valid retry action -> evaluates deterministically to ALLOW
  (() => {
    const result = evaluatePolicy(baseEvent, validRetryDiagnosis);
    assert.strictEqual(result.decision, 'allow');
    assert.strictEqual(result.failedChecks.length, 0);
    assert.strictEqual(result.safeAlternative, null);
    console.log('✓ Test 1: Valid retry action evaluated deterministically to ALLOW');
  })();

  // Test 2: Valid send_link action -> evaluates deterministically to ALLOW
  (() => {
    const result = evaluatePolicy(baseEvent, validSendLinkDiagnosis);
    assert.strictEqual(result.decision, 'allow');
    assert.strictEqual(result.failedChecks.length, 0);
    console.log('✓ Test 2: Valid send_link action evaluated deterministically to ALLOW');
  })();

  // Test 3: Valid escalate action -> routes to ESCALATE
  (() => {
    const result = evaluatePolicy(baseEvent, validEscalateDiagnosis);
    assert.strictEqual(result.decision, 'escalate');
    assert.ok(result.safeAlternative.includes('manual review') || result.safeAlternative.includes('specialist'));
    console.log('✓ Test 3: Valid escalate action routes deterministically to ESCALATE');
  })();

  // Test 4: Invalid AI action -> BLOCK
  (() => {
    const invalidDiagnosis = {
      rootCause: 'Uncertain error',
      confidence: 0.70,
      recommendedAction: 'force_charge_customer',
      evidence: ['Unsupported action']
    };
    const result = evaluatePolicy(baseEvent, invalidDiagnosis);
    assert.strictEqual(result.decision, 'block');
    const failed = result.failedChecks.find(c => c.checkId === 'CHECK_ACTION_VALIDITY');
    assert.ok(failed !== undefined, 'CHECK_ACTION_VALIDITY should fail');
    console.log('✓ Test 4: Unsupported AI action strictly BLOCKED by policy guardrail');
  })();

  // Test 5: False urgency message -> BLOCK
  (() => {
    const urgentMsg = 'Pay immediately or your account will be closed within 2 hours!';
    const result = evaluatePolicy(baseEvent, validSendLinkDiagnosis, urgentMsg);
    assert.strictEqual(result.decision, 'block');
    const failed = result.failedChecks.find(c => c.checkId === 'CHECK_FALSE_URGENCY');
    assert.ok(failed !== undefined);
    assert.ok(result.safeAlternative.includes('without urgency'));
    console.log('✓ Test 5: False urgency and coercive threats strictly BLOCKED');
  })();

  // Test 6: Basket sneaking / add-on language -> BLOCK
  (() => {
    const sneakingMsg = 'We have added a convenience fee added of ₹200 to your order balance.';
    const result = evaluatePolicy(baseEvent, validSendLinkDiagnosis, sneakingMsg);
    assert.strictEqual(result.decision, 'block');
    const failed = result.failedChecks.find(c => c.checkId === 'CHECK_BASKET_SNEAKING');
    assert.ok(failed !== undefined);
    console.log('✓ Test 6: Basket sneaking and unauthorized add-ons strictly BLOCKED');
  })();

  // Test 7: Subscription trap language -> BLOCK
  (() => {
    const trapMsg = 'Pay this one-time fee and you cannot cancel your recurring monthly plan.';
    const result = evaluatePolicy(baseEvent, validSendLinkDiagnosis, trapMsg);
    assert.strictEqual(result.decision, 'block');
    const failed = result.failedChecks.find(c => c.checkId === 'CHECK_SUBSCRIPTION_TRAP');
    assert.ok(failed !== undefined);
    console.log('✓ Test 7: Subscription trap and cancellation obstruction strictly BLOCKED');
  })();

  // Test 8: Implied consent language -> BLOCK
  (() => {
    const consentMsg = 'We have auto-enrolled you and will charge your card again without further notice.';
    const result = evaluatePolicy(baseEvent, validRetryDiagnosis, consentMsg);
    assert.strictEqual(result.decision, 'block');
    const failed = result.failedChecks.find(c => c.checkId === 'CHECK_IMPLIED_CONSENT');
    assert.ok(failed !== undefined);
    console.log('✓ Test 8: Implied consent and auto-enrollment strictly BLOCKED');
  })();

  // Test 9: Cancellation clarity violation -> BLOCK
  (() => {
    const darkCancelMsg = 'Please note that we hide cancellation options for active recovery plans.';
    const result = evaluatePolicy(baseEvent, validSendLinkDiagnosis, darkCancelMsg);
    assert.strictEqual(result.decision, 'block');
    const failed = result.failedChecks.find(c => c.checkId === 'CHECK_CANCELLATION_CLARITY');
    assert.ok(failed !== undefined);
    console.log('✓ Test 9: Obscured cancellation terms strictly BLOCKED');
  })();

  // Test 10: Missing pre-debit timing metadata -> passed: false, verifiable: false, BLOCK
  (() => {
    const eventWithoutPreDebit = { ...baseEvent, preDebitNotificationAt: undefined, scheduledDebitAt: undefined };
    const result = evaluatePolicy(eventWithoutPreDebit, validRetryDiagnosis);
    assert.strictEqual(result.decision, 'block');
    const preDebitCheck = result.failedChecks.find(c => c.checkId === 'CHECK_PRE_DEBIT_NOTIFICATION');
    assert.strictEqual(preDebitCheck.passed, false);
    assert.strictEqual(preDebitCheck.verifiable, false);
    assert.strictEqual(result.safeAlternative, 'Do not proceed until required pre-debit notification timing can be verified.');
    console.log('✓ Test 10: Missing pre-debit metadata deterministically BLOCKS with explicit safe alternative');
  })();

  // Test 11: No discount proposed -> passes discount check
  (() => {
    const result = checkDiscountCeiling(baseEvent, 'Here is your link to retry payment.');
    assert.strictEqual(result.passed, true);
    console.log('✓ Test 11: Zero discount proposal passes discount ceiling guardrail');
  })();

  // Test 12: Discount above configured ceiling (e.g. 35% vs 20% max) -> BLOCK
  (() => {
    const highDiscountEvent = { ...baseEvent, proposedDiscount: 35.0 };
    const result = evaluatePolicy(highDiscountEvent, validSendLinkDiagnosis);
    assert.strictEqual(result.decision, 'block');
    const failed = result.failedChecks.find(c => c.checkId === 'CHECK_DISCOUNT_CEILING');
    assert.ok(failed !== undefined);
    console.log('✓ Test 12: Discount exceeding merchant ceiling (35% > 20%) strictly BLOCKED');
  })();

  // Test 13: Missing contact attempt metadata -> passed: false, verifiable: false -> ESCALATE
  (() => {
    const eventWithoutContactCount = { ...baseEvent, contactAttempts: undefined };
    const result = evaluatePolicy(eventWithoutContactCount, validRetryDiagnosis);
    // Critical pre-debit passed, but non-critical contact count unverifiable -> ESCALATE
    assert.strictEqual(result.decision, 'escalate');
    const contactCheck = result.checks.find(c => c.checkId === 'CHECK_CONTACT_ATTEMPTS');
    assert.strictEqual(contactCheck.passed, false);
    assert.strictEqual(contactCheck.verifiable, false);
    console.log('✓ Test 13: Missing non-critical contact metadata routes safely to ESCALATE');
  })();

  // Test 14: Engine exception -> fail-safe BLOCK
  (() => {
    const malformedEvent = null;
    const result = evaluatePolicy(malformedEvent, null);
    assert.strictEqual(result.decision, 'block');
    assert.ok(result.failedChecks.length > 0);
    console.log('✓ Test 14: Malformed input / exception triggers fail-safe BLOCK');
  })();

  // Test 15: Verify recoverable never influences policy decision
  (() => {
    const recoverableTrue = { ...baseEvent, recoverable: true };
    const recoverableFalse = { ...baseEvent, recoverable: false };

    const resTrue = evaluatePolicy(recoverableTrue, validRetryDiagnosis);
    const resFalse = evaluatePolicy(recoverableFalse, validRetryDiagnosis);

    assert.strictEqual(resTrue.decision, resFalse.decision);
    assert.strictEqual(JSON.stringify(resTrue.checks), JSON.stringify(resFalse.checks));
    console.log('✓ Test 15: Policy decisions are identical regardless of hidden "recoverable" value');
  })();

  // Test 16: Persistence & Status Transition in MySQL
  await (async () => {
    const testEventId = `EVT-POLICY-TEST-${Date.now()}`;
    const created = await prisma.recoveryEvent.create({
      data: {
        eventId: testEventId,
        eventType: 'payment_failed',
        customerId: 'CUST-POLICY-01',
        amount: 3200.00,
        failureReason: 'network_timeout',
        timestamp: new Date(),
        recoverable: true,
        status: 'diagnosed',
        rootCause: 'Gateway timeout',
        confidence: 0.92,
        recommendedAction: 'retry',
        evidence: ['Sample evidence point']
      }
    });

    let emittedEvent = null;
    let emittedPayload = null;
    const mockIo = {
      emit: (evt, payload) => {
        emittedEvent = evt;
        emittedPayload = payload;
      }
    };

    // Attach pre-debit metadata for full allow verification
    const eventWithMetadata = {
      ...created,
      preDebitNotificationAt: new Date(Date.now() - 86400000),
      scheduledDebitAt: new Date(),
      contactAttempts: 1
    };

    const evaluated = await processEventPolicy(eventWithMetadata, validRetryDiagnosis, mockIo);

    assert.ok(evaluated !== null);
    assert.strictEqual(evaluated.status, 'decided', 'Status must transition to decided');
    assert.strictEqual(evaluated.policyDecision, 'allow');

    // Verify DB update
    const dbRecord = await prisma.recoveryEvent.findUnique({ where: { eventId: testEventId } });
    assert.strictEqual(dbRecord.status, 'decided');
    assert.strictEqual(dbRecord.policyDecision, 'allow');
    assert.ok(Array.isArray(dbRecord.policyChecks));

    // Verify Socket.io event & payload
    assert.strictEqual(emittedEvent, 'policy-decision');
    assert.strictEqual(emittedPayload.eventId, testEventId);
    assert.strictEqual(emittedPayload.decision, 'allow');
    assert.strictEqual(emittedPayload.status, 'decided');
    assert.strictEqual(emittedPayload.recoverable, undefined, 'recoverable MUST NOT exist in policy-decision payload');
    assert.ok(!('recoverable' in emittedPayload));

    // Clean up
    await prisma.recoveryEvent.delete({ where: { eventId: testEventId } });
    console.log('✓ Test 16: MySQL persistence, status transition to "decided", and safe "policy-decision" emission verified');
  })();

  // Test 17: Duplicate policy processing prevention
  await (async () => {
    const testEventId = `EVT-DUP-POL-${Date.now()}`;
    const created = await prisma.recoveryEvent.create({
      data: {
        eventId: testEventId,
        eventType: 'subscription_failed',
        customerId: 'CUST-DUP-POL',
        amount: 800.00,
        failureReason: 'card_expired',
        timestamp: new Date(),
        recoverable: false,
        status: 'diagnosed'
      }
    });

    const mockIo = { emit: () => {} };

    // Run first
    const res1 = await processEventPolicy(created, validSendLinkDiagnosis, mockIo);
    assert.ok(res1 !== null);

    // Run duplicate immediately
    const res2 = await processEventPolicy(created, validSendLinkDiagnosis, mockIo);
    assert.strictEqual(res2, null, 'Duplicate policy evaluation must be blocked');

    // Clean up
    await prisma.recoveryEvent.delete({ where: { eventId: testEventId } });
    console.log('✓ Test 17: Duplicate policy processing prevented');
  })();

  // Test 18: Policy config labels verification
  (() => {
    assert.strictEqual(POLICY_CONFIG.metadata.source, 'merchant-configured demo guardrails');
    assert.strictEqual(POLICY_CONFIG.metadata.regulatoryLabel, 'RBI-informed / Responsible-conduct guardrails');
    assert.strictEqual(POLICY_CONFIG.merchant.maxContactAttempts, 3);
    assert.strictEqual(POLICY_CONFIG.merchant.maxDiscountPercent, 20.0);
    console.log('✓ Test 18: Policy configuration metadata and merchant demo guardrail labels verified');
  })();

  console.log('\nAll 18 MandateGuard Deterministic Policy Engine Tests Passed Successfully!');
  process.exit(0);
})().catch(err => {
  console.error('Policy Engine Test Suite Failed:', err);
  process.exit(1);
});

const assert = require('assert');
const prisma = require('../config/db');
const { getAvailableScenarios, runDemoScenario } = require('../services/demoScenarios');

(async () => {
  console.log('--- Running MandateGuard Controlled Demo Scenarios Tests ---');

  // Test 1: Available scenarios metadata check
  (() => {
    const scenarios = getAvailableScenarios();
    assert.strictEqual(scenarios.length, 3);
    assert.deepStrictEqual(scenarios.map(s => s.id), ['blocked', 'escalated', 'allowed']);
    console.log('✓ Test 1: Available demo scenarios metadata list verified (blocked, escalated, allowed)');
  })();

  const mockIo = { emit: () => {} };

  // Test 2 & 3: Blocked scenario reaches actual Policy Engine and returns block
  await (async () => {
    const res = await runDemoScenario('blocked', mockIo);
    assert.strictEqual(res.scenarioId, 'blocked');
    assert.strictEqual(res.decision, 'block');
    assert.strictEqual(res.status, 'processed');

    // Verify DB record
    const dbEvent = await prisma.recoveryEvent.findUnique({ where: { eventId: res.eventId } });
    assert.strictEqual(dbEvent.policyDecision, 'block');
    assert.strictEqual(dbEvent.status, 'checked');
    assert.ok(Array.isArray(dbEvent.policyFailedChecks));
    assert.ok(dbEvent.policyFailedChecks.some(c => c.checkId === 'CHECK_FALSE_URGENCY'));
    assert.ok(dbEvent.safeAlternative.includes('without urgency'));

    // Verify Audit Trail
    const auditLogs = await prisma.auditLog.findMany({ where: { eventId: res.eventId } });
    assert.ok(auditLogs.some(l => l.status === 'EVENT_RECEIVED'));
    assert.ok(auditLogs.some(l => l.status === 'AI_DIAGNOSIS_COMPLETED'));
    assert.ok(auditLogs.some(l => l.status === 'RECOVERY_PROPOSAL_CREATED'));
    assert.ok(auditLogs.some(l => l.status === 'POLICY_EVALUATED' && l.decision === 'block'));
    assert.ok(auditLogs.some(l => l.status === 'RECOVERY_BLOCKED'));

    console.log('✓ Test 2 & 3: Blocked demo scenario evaluates through real Policy Engine, halts execution, and generates safe alternative');
  })();

  // Test 4: Escalated scenario reaches actual Policy Engine and returns escalate
  await (async () => {
    const res = await runDemoScenario('escalated', mockIo);
    assert.strictEqual(res.scenarioId, 'escalated');
    assert.strictEqual(res.decision, 'escalate');

    // Verify DB record
    const dbEvent = await prisma.recoveryEvent.findUnique({ where: { eventId: res.eventId } });
    assert.strictEqual(dbEvent.policyDecision, 'escalate');
    assert.strictEqual(dbEvent.status, 'checked');

    // Verify Audit Trail
    const auditLogs = await prisma.auditLog.findMany({ where: { eventId: res.eventId } });
    assert.ok(auditLogs.some(l => l.status === 'MANUAL_REVIEW_REQUIRED'));

    console.log('✓ Test 4: Escalated demo scenario evaluates through real Policy Engine to manual review');
  })();

  // Test 5: Allowed scenario reaches actual Policy Engine and returns allow
  await (async () => {
    const res = await runDemoScenario('allowed', mockIo);
    assert.strictEqual(res.scenarioId, 'allowed');
    assert.strictEqual(res.decision, 'allow');

    // Verify DB record
    const dbEvent = await prisma.recoveryEvent.findUnique({ where: { eventId: res.eventId } });
    assert.strictEqual(dbEvent.policyDecision, 'allow');
    assert.strictEqual(dbEvent.status, 'checked');

    // Verify Audit Trail
    const auditLogs = await prisma.auditLog.findMany({ where: { eventId: res.eventId } });
    assert.ok(auditLogs.some(l => l.status === 'RECOVERY_AUTHORIZED'));

    console.log('✓ Test 5: Allowed demo scenario evaluates through real Policy Engine to authorized');
  })();

  // Test 6: Security - Zero leakage of recoverable or secrets
  await (async () => {
    const scenarios = getAvailableScenarios();
    const jsonStr = JSON.stringify(scenarios);
    assert.ok(!jsonStr.includes('recoverable'));
    assert.ok(!jsonStr.includes('gsk_'));

    console.log('✓ Test 6: Security verified - Demo scenarios contain zero secrets or hidden ground truth');
  })();

  console.log('\nAll 6 MandateGuard Controlled Demo Scenarios Tests Passed Successfully!');
  process.exit(0);
})().catch((err) => {
  console.error('Demo Scenarios Test Suite Failed:', err);
  process.exit(1);
});

const assert = require('assert');
const prisma = require('../config/db');
const { logAuditEvent, getAuditLogs } = require('../services/auditLogger');
const { executeSimulatedRecovery } = require('../services/simulatedRecovery');

(async () => {
  console.log('--- Running MandateGuard Audit Trail & Simulated Recovery Tests ---');

  const testTimestamp = Date.now();

  // Test 1: Audit event persistence
  await (async () => {
    const eventId = `EVT-AUDIT-01-${testTimestamp}`;
    const logged = await logAuditEvent({
      eventId,
      action: 'event_ingestion',
      decision: 'recorded',
      status: 'EVENT_RECEIVED',
      reason: 'Failed payment recorded in test suite.',
      metadata: { amount: 1500, testFlag: true }
    });

    assert.ok(logged !== null);
    assert.strictEqual(logged.eventId, eventId);
    assert.strictEqual(logged.status, 'EVENT_RECEIVED');

    const inDb = await prisma.auditLog.findFirst({ where: { eventId, status: 'EVENT_RECEIVED' } });
    assert.ok(inDb !== null);
    assert.strictEqual(inDb.action, 'event_ingestion');

    console.log('✓ Test 1: Audit event successfully persisted to MySQL');
  })();

  // Test 2: Audit deduplication
  await (async () => {
    const eventId = `EVT-AUDIT-DEDUP-${testTimestamp}`;
    const log1 = await logAuditEvent({
      eventId,
      action: 'diagnosis',
      decision: 'completed',
      status: 'AI_DIAGNOSIS_COMPLETED',
      reason: 'Diagnosis 1'
    });
    assert.ok(log1 !== null);

    const log2 = await logAuditEvent({
      eventId,
      action: 'diagnosis',
      decision: 'completed',
      status: 'AI_DIAGNOSIS_COMPLETED',
      reason: 'Diagnosis duplicate'
    });
    assert.strictEqual(log2, null, 'Duplicate audit logging must be ignored');

    const count = await prisma.auditLog.count({ where: { eventId, status: 'AI_DIAGNOSIS_COMPLETED' } });
    assert.strictEqual(count, 1, 'Only one audit record should exist for eventId + status');

    console.log('✓ Test 2: In-memory & logical audit deduplication verified');
  })();

  // Test 3: ALLOW -> simulated execution succeeds
  await (async () => {
    const eventId = `EVT-ALLOW-SIM-${testTimestamp}`;
    await prisma.recoveryEvent.create({
      data: {
        eventId,
        eventType: 'payment_failed',
        customerId: 'CUST-ALLOW-01',
        amount: 3500.00,
        failureReason: 'network_timeout',
        timestamp: new Date(),
        recoverable: true,
        status: 'checked',
        policyDecision: 'allow',
        recoveryMessage: 'Please retry your payment.',
        messageAction: 'retry',
        messageChannel: 'sms'
      }
    });

    const result = await executeSimulatedRecovery(eventId);

    assert.strictEqual(result.status, 'simulated_success');
    assert.strictEqual(result.executed, true);
    assert.strictEqual(result.executionReference, `SIM-REC-${eventId}`);
    assert.ok(result.message.includes('Simulation only'));

    // Verify DB update
    const dbEvent = await prisma.recoveryEvent.findUnique({ where: { eventId } });
    assert.strictEqual(dbEvent.executionStatus, 'simulated_success');
    assert.strictEqual(dbEvent.executionReference, `SIM-REC-${eventId}`);

    // Verify audit log
    const auditRecord = await prisma.auditLog.findFirst({
      where: { eventId, status: 'SIMULATED_RECOVERY_EXECUTED' }
    });
    assert.ok(auditRecord !== null);
    assert.strictEqual(auditRecord.decision, 'simulated_success');

    console.log('✓ Test 3: ALLOW event successfully triggers simulated recovery execution & audit record');
  })();

  // Test 4: BLOCK -> execution prevented
  await (async () => {
    const eventId = `EVT-BLOCK-SIM-${testTimestamp}`;
    await prisma.recoveryEvent.create({
      data: {
        eventId,
        eventType: 'payment_failed',
        customerId: 'CUST-BLOCK-01',
        amount: 4500.00,
        failureReason: 'unauthorized',
        timestamp: new Date(),
        recoverable: false,
        status: 'checked',
        policyDecision: 'block',
        safeAlternative: 'Do not proceed until verified.'
      }
    });

    const result = await executeSimulatedRecovery(eventId);

    assert.strictEqual(result.status, 'blocked');
    assert.strictEqual(result.executed, false);
    assert.ok(result.message.includes('blocked by Policy Guard'));

    const dbEvent = await prisma.recoveryEvent.findUnique({ where: { eventId } });
    assert.strictEqual(dbEvent.executionStatus, 'not_executed', 'Execution status must remain unexecuted');
    assert.strictEqual(dbEvent.executionReference, null);

    console.log('✓ Test 4: BLOCK event strictly prevents simulated recovery execution');
  })();

  // Test 5: ESCALATE -> execution prevented
  await (async () => {
    const eventId = `EVT-ESCALATE-SIM-${testTimestamp}`;
    await prisma.recoveryEvent.create({
      data: {
        eventId,
        eventType: 'subscription_failed',
        customerId: 'CUST-ESC-01',
        amount: 8500.00,
        failureReason: 'risk_review',
        timestamp: new Date(),
        recoverable: true,
        status: 'checked',
        policyDecision: 'escalate',
        safeAlternative: 'Manual compliance review required.'
      }
    });

    const result = await executeSimulatedRecovery(eventId);

    assert.strictEqual(result.status, 'manual_review');
    assert.strictEqual(result.executed, false);

    console.log('✓ Test 5: ESCALATE event strictly prevents automated simulated execution');
  })();

  // Test 6: Idempotent repeated simulation
  await (async () => {
    const eventId = `EVT-IDEMP-SIM-${testTimestamp}`;
    await prisma.recoveryEvent.create({
      data: {
        eventId,
        eventType: 'payment_failed',
        customerId: 'CUST-IDEMP-01',
        amount: 1200.00,
        failureReason: 'network_timeout',
        timestamp: new Date(),
        recoverable: true,
        status: 'checked',
        policyDecision: 'allow'
      }
    });

    // Run 1
    const res1 = await executeSimulatedRecovery(eventId);
    assert.strictEqual(res1.status, 'simulated_success');
    const ref1 = res1.executionReference;

    // Run 2
    const res2 = await executeSimulatedRecovery(eventId);
    assert.strictEqual(res2.status, 'simulated_success');
    assert.strictEqual(res2.executionReference, ref1, 'Must return the same simulation reference');

    // Count audit records for SIMULATED_RECOVERY_EXECUTED
    const count = await prisma.auditLog.count({
      where: { eventId, status: 'SIMULATED_RECOVERY_EXECUTED' }
    });
    assert.strictEqual(count, 1, 'Idempotent calls must not create multiple execution audit records');

    console.log('✓ Test 6: Simulation execution is 100% idempotent with identical reference');
  })();

  // Test 7: Server-side authorization boundary
  await (async () => {
    const eventId = `EVT-UNAUTH-SIM-${testTimestamp}`;
    await prisma.recoveryEvent.create({
      data: {
        eventId,
        eventType: 'payment_failed',
        customerId: 'CUST-UNAUTH-01',
        amount: 999.00,
        failureReason: 'pending',
        timestamp: new Date(),
        recoverable: true,
        status: 'new' // No policy decision made yet
      }
    });

    const result = await executeSimulatedRecovery(eventId);
    assert.strictEqual(result.status, 'unauthorized');
    assert.strictEqual(result.executed, false);

    console.log('✓ Test 7: Server-side verification strictly rejects unapproved events');
  })();

  // Test 8: Audit API query & filtering
  await (async () => {
    const eventId = `EVT-QUERY-AUDIT-${testTimestamp}`;
    await logAuditEvent({
      eventId,
      action: 'event_ingestion',
      decision: 'recorded',
      status: 'EVENT_RECEIVED'
    });
    await logAuditEvent({
      eventId,
      action: 'diagnosis',
      decision: 'completed',
      status: 'AI_DIAGNOSIS_COMPLETED'
    });

    const logs = await getAuditLogs({ eventId });
    assert.strictEqual(logs.length, 2);
    assert.strictEqual(logs[0].eventId, eventId);
    assert.strictEqual(logs[0].status, 'AI_DIAGNOSIS_COMPLETED', 'Newest log must appear first');

    console.log('✓ Test 8: Audit log querying and eventId filtering verified');
  })();

  // Test 9: Security - Zero leakage of recoverable or credentials in audit logs
  await (async () => {
    const eventId = `EVT-SEC-AUDIT-${testTimestamp}`;
    await logAuditEvent({
      eventId,
      action: 'policy_guard',
      decision: 'allow',
      status: 'POLICY_EVALUATED',
      metadata: {
        recoverable: true,
        GROQ_API_KEY: 'secret_key',
        password: 'db_password',
        safeData: 'allowed'
      }
    });

    const logs = await getAuditLogs({ eventId });
    assert.strictEqual(logs.length, 1);
    const meta = logs[0].metadata;

    assert.strictEqual(meta.recoverable, undefined, 'recoverable must be stripped');
    assert.strictEqual(meta.GROQ_API_KEY, undefined, 'GROQ_API_KEY must be stripped');
    assert.strictEqual(meta.password, undefined, 'password must be stripped');
    assert.strictEqual(meta.safeData, 'allowed');

    console.log('✓ Test 9: Sensitive credentials and recoverable ground truth completely sanitized from audit logs');
  })();

  console.log('\nAll 9 MandateGuard Audit Trail & Simulated Recovery Tests Passed Successfully!');
  process.exit(0);
})().catch((err) => {
  console.error('Audit & Simulation Test Suite Failed:', err);
  process.exit(1);
});

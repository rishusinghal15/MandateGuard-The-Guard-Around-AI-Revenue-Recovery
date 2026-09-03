const prisma = require('../config/db');
const { logAuditEvent } = require('./auditLogger');
const { toSafeEventPayload } = require('./eventSimulator');
const { processEventPolicy } = require('./policyEngine');

/**
 * Deterministic metadata definitions for judge-facing demo scenarios.
 * Strictly uses existing Policy Engine guardrails and backend services as the single source of truth.
 */
const DEMO_SCENARIOS = Object.freeze([
  {
    id: 'blocked',
    name: 'Unsafe Recovery Intercept',
    description: 'AI generates a coercive message with false urgency; Policy Guard halts execution.',
    expectedOutcome: 'block',
    guardrailTriggered: 'False Urgency Guardrail (CHECK_FALSE_URGENCY)'
  },
  {
    id: 'escalated',
    name: 'Manual Review Triage',
    description: 'Operational metadata gap triggers safe escalation to human compliance review.',
    expectedOutcome: 'escalate',
    guardrailTriggered: 'Merchant Max Contact Attempts (CHECK_CONTACT_ATTEMPTS)'
  },
  {
    id: 'allowed',
    name: 'Safe Authorized Recovery',
    description: 'Fully compliant recovery action passes all merchant and safety guardrails.',
    expectedOutcome: 'allow',
    guardrailTriggered: 'None (All guardrails cleared)'
  }
]);

/**
 * Returns available safe demo scenario descriptors for judge controls.
 */
function getAvailableScenarios() {
  return DEMO_SCENARIOS.map((s) => ({
    id: s.id,
    name: s.name,
    description: s.description,
    expectedOutcome: s.expectedOutcome,
    guardrailTriggered: s.guardrailTriggered
  }));
}

/**
 * Orchestrates a deterministic demo scenario through the real backend pipeline:
 * 1. Persists RecoveryEvent to MySQL
 * 2. Logs EVENT_RECEIVED in AuditLog
 * 3. Emits 'new-event' over Socket.io
 * 4. Persists AI Diagnosis & logs AI_DIAGNOSIS_COMPLETED
 * 5. Emits 'diagnosis-ready' over Socket.io
 * 6. Passes message through existing Policy Engine (processEventPolicy)
 * 7. Logs RECOVERY_PROPOSAL_CREATED, POLICY_EVALUATED, and decision audit records
 * 8. Emits 'recovery-proposal' over Socket.io
 */
async function runDemoScenario(scenarioId, io) {
  const timestamp = Date.now();
  const eventId = `EVT-DEMO-${scenarioId.toUpperCase()}-${timestamp}`;

  let eventPayload;
  let diagnosisPayload;
  let customMessage;

  if (scenarioId === 'blocked') {
    // SCENARIO 1: BLOCKED (False Urgency breach)
    eventPayload = {
      eventId,
      eventType: 'payment_failed',
      customerId: 'CUST-DEMO-BLK',
      amount: 4999.00,
      failureReason: 'gateway_timeout',
      timestamp: new Date(),
      recoverable: true,
      status: 'new'
    };

    diagnosisPayload = {
      rootCause: 'Temporary gateway response timeout during authorization',
      confidence: 0.91,
      recommendedAction: 'retry',
      evidence: ['Gateway 504 response code', 'First attempt on customer account']
    };

    // Unsafe message that deterministically triggers CHECK_FALSE_URGENCY
    customMessage = {
      message: 'FINAL WARNING: Pay immediately within 2 hours or your account will be closed!',
      channel: 'sms',
      tone: 'professional',
      action: 'retry'
    };
  } else if (scenarioId === 'escalated') {
    // SCENARIO 2: ESCALATED (Missing contact count metadata routes to manual review)
    eventPayload = {
      eventId,
      eventType: 'subscription_failed',
      customerId: 'CUST-DEMO-ESC',
      amount: 8500.00,
      failureReason: 'card_expired',
      timestamp: new Date(),
      recoverable: true,
      status: 'new'
    };

    diagnosisPayload = {
      rootCause: 'Payment card reached expiration date before billing cycle',
      confidence: 0.88,
      recommendedAction: 'send_link',
      evidence: ['Card expiry date 08/26 reached', 'Customer update required']
    };

    // Compliant message, but pre-debit verified with missing contact count -> routes to escalate
    customMessage = {
      message: "We couldn't complete your payment. Please use the secure payment link provided to complete it when convenient.",
      channel: 'email',
      tone: 'helpful',
      action: 'send_link'
    };
  } else if (scenarioId === 'allowed') {
    // SCENARIO 3: ALLOWED (Clean compliant recovery)
    eventPayload = {
      eventId,
      eventType: 'payment_failed',
      customerId: 'CUST-DEMO-ALW',
      amount: 1499.00,
      failureReason: 'network_timeout',
      timestamp: new Date(),
      recoverable: true,
      status: 'new'
    };

    diagnosisPayload = {
      rootCause: 'Temporary network connection drop during payment transmission',
      confidence: 0.94,
      recommendedAction: 'retry',
      evidence: ['Transient network socket error', 'No card issuer decline']
    };

    customMessage = {
      message: 'Your payment could not be completed. Please try the payment again using your available payment method.',
      channel: 'sms',
      tone: 'professional',
      action: 'retry'
    };
  } else {
    throw new Error(`Unknown demo scenario: "${scenarioId}". Available: blocked, escalated, allowed.`);
  }

  // 1. Persist initial event into MySQL
  const created = await prisma.recoveryEvent.create({
    data: eventPayload
  });

  // 2. Log EVENT_RECEIVED audit record
  await logAuditEvent({
    eventId: created.eventId,
    action: 'event_ingestion',
    decision: 'recorded',
    status: 'EVENT_RECEIVED',
    reason: `[Demo Scenario: ${scenarioId}] Failed ${created.eventType} event ingested.`,
    metadata: {
      isDemoScenario: true,
      scenarioId,
      amount: Number(created.amount)
    }
  });

  // 3. Emit 'new-event' over Socket.io
  if (io) {
    const safePayload = toSafeEventPayload(created);
    io.emit('new-event', safePayload);
  }

  // 4. Persist AI Diagnosis in MySQL
  const diagnosed = await prisma.recoveryEvent.update({
    where: { eventId: created.eventId },
    data: {
      rootCause: diagnosisPayload.rootCause,
      confidence: diagnosisPayload.confidence,
      recommendedAction: diagnosisPayload.recommendedAction,
      evidence: diagnosisPayload.evidence,
      status: 'diagnosed'
    }
  });

  // 5. Log AI_DIAGNOSIS_COMPLETED audit record
  await logAuditEvent({
    eventId: diagnosed.eventId,
    action: 'diagnosis',
    decision: 'completed',
    status: 'AI_DIAGNOSIS_COMPLETED',
    reason: `AI diagnosed: "${diagnosed.rootCause}" (${Math.round((diagnosed.confidence || 0) * 100)}% confidence).`,
    metadata: {
      isDemoScenario: true,
      recommendedAction: diagnosed.recommendedAction
    }
  });

  // 6. Emit 'diagnosis-ready' over Socket.io
  if (io) {
    io.emit('diagnosis-ready', {
      eventId: diagnosed.eventId,
      rootCause: diagnosed.rootCause,
      confidence: diagnosed.confidence,
      recommendedAction: diagnosed.recommendedAction,
      evidence: diagnosed.evidence,
      status: diagnosed.status
    });
  }

  // 7. Attach verifiable in-memory timestamps for scenarios to pass pre-debit check
  let evaluationEvent = diagnosed;
  if (scenarioId === 'allowed' || scenarioId === 'blocked') {
    evaluationEvent = {
      ...diagnosed,
      preDebitNotificationAt: new Date(Date.now() - 3600000), // verified prior timestamp
      scheduledDebitAt: new Date(),
      contactAttempts: 1
    };
  } else if (scenarioId === 'escalated') {
    evaluationEvent = {
      ...diagnosed,
      preDebitNotificationAt: new Date(Date.now() - 3600000),
      scheduledDebitAt: new Date(),
      contactAttempts: undefined // missing contact count -> routes to escalate
    };
  }

  // 8. Execute existing Policy Engine evaluation with the proposed message
  const finalProcessed = await processEventPolicy(
    evaluationEvent,
    diagnosisPayload,
    io,
    customMessage
  );

  console.log(`[DemoScenario] Scenario "${scenarioId}" completed -> event: ${finalProcessed.eventId}, decision: ${finalProcessed.policyDecision}`);

  return {
    eventId: finalProcessed.eventId,
    scenarioId,
    decision: finalProcessed.policyDecision,
    status: 'processed',
    simulated: true,
    message: 'Controlled demo scenario executed through real Policy Guard pipeline.'
  };
}

module.exports = {
  DEMO_SCENARIOS,
  getAvailableScenarios,
  runDemoScenario
};

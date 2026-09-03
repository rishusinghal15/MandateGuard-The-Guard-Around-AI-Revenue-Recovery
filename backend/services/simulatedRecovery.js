const prisma = require('../config/db');
const { logAuditEvent } = require('./auditLogger');

/**
 * Executes a safe, zero-trust SIMULATED recovery action.
 *
 * CRITICAL SAFETY RULES:
 * - NEVER calls any payment gateway, banking API, or SMS/email/WhatsApp service.
 * - ALWAYS verifies the server-side stored Policy Guard decision before execution.
 * - Rejects any execution where policyDecision !== 'allow'.
 * - Fully idempotent: repeated calls return the existing simulation reference.
 */
async function executeSimulatedRecovery(eventId) {
  if (!eventId) {
    return {
      status: 'error',
      executed: false,
      message: 'Missing eventId for simulated recovery.'
    };
  }

  // 1. Fetch event directly from MySQL database (authoritative source of truth)
  const event = await prisma.recoveryEvent.findUnique({
    where: { eventId }
  });

  if (!event) {
    return {
      eventId,
      status: 'not_found',
      executed: false,
      message: `Recovery event ${eventId} not found.`
    };
  }

  // 2. Server-side Authorization Boundary Check
  // Zero Trust: Never trust frontend claim. Only stored decision "allow" may execute.
  if (event.policyDecision === 'block') {
    await logAuditEvent({
      eventId,
      action: 'recovery',
      decision: 'block',
      status: 'RECOVERY_BLOCKED',
      reason: 'Execution attempt rejected: Policy Guard blocked this recovery action.',
      safeAlternative: event.safeAlternative
    });

    return {
      eventId,
      status: 'blocked',
      executed: false,
      message: 'Recovery blocked by Policy Guard.'
    };
  }

  if (event.policyDecision === 'escalate') {
    await logAuditEvent({
      eventId,
      action: 'recovery',
      decision: 'escalate',
      status: 'MANUAL_REVIEW_REQUIRED',
      reason: 'Execution attempt rejected: Action requires manual review before execution.',
      safeAlternative: event.safeAlternative
    });

    return {
      eventId,
      status: 'manual_review',
      executed: false,
      message: 'Manual review required — automated execution not permitted.'
    };
  }

  if (event.policyDecision !== 'allow') {
    return {
      eventId,
      status: 'unauthorized',
      executed: false,
      message: 'Recovery has not been approved by Policy Guard.'
    };
  }

  // 3. Idempotency Check
  if (event.executionStatus === 'simulated_success' && event.executionReference) {
    console.log(`[SimulatedRecovery] Idempotent hit for ${eventId}. Returning existing reference: ${event.executionReference}`);
    return {
      eventId,
      status: 'simulated_success',
      executed: true,
      executionReference: event.executionReference,
      executedAt: event.executedAt,
      message: 'Simulation only — no real payment or message sent (idempotent result).'
    };
  }

  // 4. Generate deterministic simulation reference
  const executionReference = `SIM-REC-${eventId}`;
  const executedAt = new Date();

  // 5. Update RecoveryEvent execution status in MySQL
  const updated = await prisma.recoveryEvent.update({
    where: { eventId },
    data: {
      executionStatus: 'simulated_success',
      executionReference,
      executedAt
    }
  });

  // 6. Append audit log record
  await logAuditEvent({
    eventId,
    action: 'recovery',
    decision: 'simulated_success',
    status: 'SIMULATED_RECOVERY_EXECUTED',
    reason: `Simulated recovery executed via ${updated.messageChannel || 'sms'} (${updated.messageAction || updated.recommendedAction || 'retry'}).`,
    metadata: {
      executionReference,
      action: updated.messageAction || updated.recommendedAction,
      channel: updated.messageChannel,
      amount: typeof updated.amount === 'number' ? updated.amount : Number(updated.amount) || 0
    }
  });

  console.log(`[SimulatedRecovery] Successfully executed simulated recovery for ${eventId} -> ref: ${executionReference}`);

  return {
    eventId,
    status: 'simulated_success',
    executed: true,
    executionReference,
    executedAt,
    message: 'Simulation only — no real payment or message sent.'
  };
}

module.exports = {
  executeSimulatedRecovery
};

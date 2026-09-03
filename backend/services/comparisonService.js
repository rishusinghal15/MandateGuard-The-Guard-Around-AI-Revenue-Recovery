const prisma = require('../config/db');
const { simulateNaiveRecovery } = require('./naiveRecovery');

/**
 * Generates an objective, server-verified comparison between:
 * 1. Naive AI: Un-guarded execution attempt
 * 2. MandateGuard: Deterministic Policy Guard authorization layer
 */
async function getRecoveryComparison(eventId) {
  if (!eventId) {
    return {
      status: 'error',
      message: 'Missing eventId for recovery comparison.'
    };
  }

  // 1. Fetch event from database (authoritative source of truth)
  const event = await prisma.recoveryEvent.findUnique({
    where: { eventId }
  });

  if (!event) {
    return {
      eventId,
      status: 'not_found',
      message: `Recovery event ${eventId} not found.`
    };
  }

  // 2. Get Naive AI simulated perspective
  const naiveResult = await simulateNaiveRecovery(eventId);

  // 3. Extract MandateGuard policy evaluation results
  const policyDecision = event.policyDecision || 'pending';
  const failedChecks = Array.isArray(event.policyFailedChecks) ? event.policyFailedChecks : [];
  const safeAlternative = event.safeAlternative || null;
  const primaryFailure = failedChecks[0] || null;

  // 4. Determine interception outcome
  let intercepted = false;
  let reason = '';

  if (policyDecision === 'block') {
    intercepted = true;
    reason = primaryFailure
      ? `MandateGuard intercepted unsafe action: ${primaryFailure.name} (${primaryFailure.reason})`
      : 'MandateGuard intercepted recovery action due to policy violation.';
  } else if (policyDecision === 'escalate') {
    intercepted = true;
    reason = primaryFailure
      ? `MandateGuard intercepted action for manual review: ${primaryFailure.name} (${primaryFailure.reason})`
      : 'MandateGuard intercepted action: Requires manual compliance review before execution.';
  } else if (policyDecision === 'allow') {
    intercepted = false;
    reason = 'Action authorized: Cleared all deterministic safety and merchant guardrails.';
  } else {
    intercepted = false;
    reason = 'Policy evaluation in progress.';
  }

  return {
    eventId,
    simulated: true,

    naive: {
      simulated: true,
      wouldExecute: true,
      action: naiveResult.action,
      channel: naiveResult.channel,
      message: naiveResult.message,
      status: 'naive_simulation'
    },

    mandateGuard: {
      policyDecision,
      action: event.messageAction || event.recommendedAction || 'retry',
      channel: event.messageChannel || 'sms',
      message: event.recoveryMessage || naiveResult.message,
      failedChecks,
      safeAlternative,
      executionStatus: event.executionStatus || 'not_executed',
      executionReference: event.executionReference || null,
      status: event.status
    },

    interception: {
      intercepted,
      reason,
      safeAlternative
    },

    disclaimer: 'SIMULATION ONLY — No real payment charged or message sent.'
  };
}

module.exports = {
  getRecoveryComparison
};

const prisma = require('../config/db');
const { generateRecoveryMessage } = require('./messageGenerator');

/**
 * Centralized deterministic Policy Configuration.
 * Thresholds are explicitly labeled as merchant-configured demo guardrails, NOT universal regulatory numbers.
 */
const POLICY_CONFIG = Object.freeze({
  metadata: {
    source: 'merchant-configured demo guardrails',
    regulatoryLabel: 'RBI-informed / Responsible-conduct guardrails'
  },
  merchant: {
    // Explicitly merchant-configured demo thresholds
    maxContactAttempts: 3,
    maxDiscountPercent: 20.0
  },
  safety: {
    requireExplicitConsent: true,
    requireClearCancellation: true,
    requirePreDebitNotification: true
  },
  criticalChecks: [
    'CHECK_ACTION_VALIDITY',
    'CHECK_FALSE_URGENCY',
    'CHECK_BASKET_SNEAKING',
    'CHECK_SUBSCRIPTION_TRAP',
    'CHECK_IMPLIED_CONSENT',
    'CHECK_CANCELLATION_CLARITY',
    'CHECK_PRE_DEBIT_NOTIFICATION',
    'CHECK_DISCOUNT_CEILING'
  ]
});

// Regex patterns for deterministic dark pattern & safety checks
const FALSE_URGENCY_PATTERNS = [
  /pay immediately/i,
  /account (?:will be|is) closed/i,
  /final warning/i,
  /immediate forfeiture/i,
  /legal action/i,
  /within (?:1|2|6|12|24) hours/i,
  /penalty fee/i
];

const BASKET_SNEAKING_PATTERNS = [
  /added .* to your (?:order|cart)/i,
  /convenience fee added/i,
  /handling charge of/i,
  /optional protection .* included/i,
  /bundled .* charge/i,
  /extra fee/i
];

const SUBSCRIPTION_TRAP_PATTERNS = [
  /one-time fee .* recurring/i,
  /billed monthly thereafter/i,
  /cannot cancel/i,
  /no cancellation allowed/i,
  /cancellation fee/i,
  /lock-in period/i
];

const IMPLIED_CONSENT_PATTERNS = [
  /automatically enrolled/i,
  /auto-enrolled you/i,
  /subscription has been renewed without/i,
  /we will charge your card again without/i,
  /by default you agree/i
];

const CANCELLATION_CLARITY_DARK_PATTERNS = [
  /hide cancellation/i,
  /call us to cancel/i,
  /no opt-out/i,
  /cancellation unavailable/i
];

/**
 * CHECK: Action Validity
 */
function checkActionValidity(diagnosis) {
  const allowed = ['retry', 'send_link', 'escalate'];
  const action = diagnosis?.recommendedAction;
  if (!allowed.includes(action)) {
    return {
      checkId: 'CHECK_ACTION_VALIDITY',
      name: 'Action Validity',
      passed: false,
      verifiable: true,
      isCritical: true,
      reason: `AI proposed an unsupported recovery action: "${action}".`
    };
  }
  return {
    checkId: 'CHECK_ACTION_VALIDITY',
    name: 'Action Validity',
    passed: true,
    verifiable: true,
    isCritical: true,
    reason: `Proposed action "${action}" is supported.`
  };
}

/**
 * CHECK 1: False Urgency
 */
function checkFalseUrgency(proposedMessage) {
  if (!proposedMessage || typeof proposedMessage !== 'string') {
    return {
      checkId: 'CHECK_FALSE_URGENCY',
      name: 'False Urgency Guardrail',
      passed: true,
      verifiable: true,
      isCritical: true,
      reason: 'No proposed customer message supplied.'
    };
  }

  for (const pattern of FALSE_URGENCY_PATTERNS) {
    if (pattern.test(proposedMessage)) {
      return {
        checkId: 'CHECK_FALSE_URGENCY',
        name: 'False Urgency Guardrail',
        passed: false,
        verifiable: true,
        isCritical: true,
        reason: 'Proposed message contains coercive or false urgency phrasing.'
      };
    }
  }

  return {
    checkId: 'CHECK_FALSE_URGENCY',
    name: 'False Urgency Guardrail',
    passed: true,
    verifiable: true,
    isCritical: true,
    reason: 'Message adheres to non-coercive urgency standards.'
  };
}

/**
 * CHECK 2: Basket Sneaking / Unauthorized Add-on
 */
function checkBasketSneaking(proposedMessage) {
  if (!proposedMessage || typeof proposedMessage !== 'string') {
    return {
      checkId: 'CHECK_BASKET_SNEAKING',
      name: 'Basket Sneaking Guardrail',
      passed: true,
      verifiable: true,
      isCritical: true,
      reason: 'No proposed customer message supplied.'
    };
  }

  for (const pattern of BASKET_SNEAKING_PATTERNS) {
    if (pattern.test(proposedMessage)) {
      return {
        checkId: 'CHECK_BASKET_SNEAKING',
        name: 'Basket Sneaking Guardrail',
        passed: false,
        verifiable: true,
        isCritical: true,
        reason: 'Proposed recovery adds unauthorized items, bundled fees, or sneaky add-ons.'
      };
    }
  }

  return {
    checkId: 'CHECK_BASKET_SNEAKING',
    name: 'Basket Sneaking Guardrail',
    passed: true,
    verifiable: true,
    isCritical: true,
    reason: 'No hidden add-ons or bundled charges detected.'
  };
}

/**
 * CHECK 3: Subscription Trap
 */
function checkSubscriptionTrap(proposedMessage) {
  if (!proposedMessage || typeof proposedMessage !== 'string') {
    return {
      checkId: 'CHECK_SUBSCRIPTION_TRAP',
      name: 'Subscription Trap Guardrail',
      passed: true,
      verifiable: true,
      isCritical: true,
      reason: 'No proposed customer message supplied.'
    };
  }

  for (const pattern of SUBSCRIPTION_TRAP_PATTERNS) {
    if (pattern.test(proposedMessage)) {
      return {
        checkId: 'CHECK_SUBSCRIPTION_TRAP',
        name: 'Subscription Trap Guardrail',
        passed: false,
        verifiable: true,
        isCritical: true,
        reason: 'Proposed message conceals recurring terms or creates cancellation friction.'
      };
    }
  }

  return {
    checkId: 'CHECK_SUBSCRIPTION_TRAP',
    name: 'Subscription Trap Guardrail',
    passed: true,
    verifiable: true,
    isCritical: true,
    reason: 'No deceptive subscription locks detected.'
  };
}

/**
 * CHECK 4: Implied Consent
 */
function checkImpliedConsent(proposedMessage) {
  if (!proposedMessage || typeof proposedMessage !== 'string') {
    return {
      checkId: 'CHECK_IMPLIED_CONSENT',
      name: 'Explicit Consent Guardrail',
      passed: true,
      verifiable: true,
      isCritical: true,
      reason: 'No proposed customer message supplied.'
    };
  }

  for (const pattern of IMPLIED_CONSENT_PATTERNS) {
    if (pattern.test(proposedMessage)) {
      return {
        checkId: 'CHECK_IMPLIED_CONSENT',
        name: 'Explicit Consent Guardrail',
        passed: false,
        verifiable: true,
        isCritical: true,
        reason: 'Recovery action presumes customer consent without affirmative authorization.'
      };
    }
  }

  return {
    checkId: 'CHECK_IMPLIED_CONSENT',
    name: 'Explicit Consent Guardrail',
    passed: true,
    verifiable: true,
    isCritical: true,
    reason: 'Action does not assume implied consent.'
  };
}

/**
 * CHECK 5: Cancellation Clarity
 */
function checkCancellationClarity(event, proposedMessage) {
  if (!proposedMessage || typeof proposedMessage !== 'string') {
    return {
      checkId: 'CHECK_CANCELLATION_CLARITY',
      name: 'Cancellation Clarity Guardrail',
      passed: true,
      verifiable: true,
      isCritical: true,
      reason: 'No proposed customer message supplied.'
    };
  }

  for (const pattern of CANCELLATION_CLARITY_DARK_PATTERNS) {
    if (pattern.test(proposedMessage)) {
      return {
        checkId: 'CHECK_CANCELLATION_CLARITY',
        name: 'Cancellation Clarity Guardrail',
        passed: false,
        verifiable: true,
        isCritical: true,
        reason: 'Cancellation terms or mandate management paths are obscured.'
      };
    }
  }

  return {
    checkId: 'CHECK_CANCELLATION_CLARITY',
    name: 'Cancellation Clarity Guardrail',
    passed: true,
    verifiable: true,
    isCritical: true,
    reason: 'Clear cancellation and mandate options maintained.'
  };
}

/**
 * CHECK 6: Pre-Debit Notification Timing
 * Deterministically checks pre-debit timing metadata.
 * If fields do not exist, returns passed: false, verifiable: false.
 */
function checkPreDebitNotification(event) {
  const { preDebitNotificationAt, scheduledDebitAt } = event;

  if (!preDebitNotificationAt || !scheduledDebitAt) {
    return {
      checkId: 'CHECK_PRE_DEBIT_NOTIFICATION',
      name: 'Pre-Debit Notification Timing Guardrail',
      passed: false,
      verifiable: false,
      isCritical: true,
      reason: 'Pre-debit notification timing cannot be verified from available event data.'
    };
  }

  const preDebitTime = new Date(preDebitNotificationAt).getTime();
  const scheduledTime = new Date(scheduledDebitAt).getTime();

  if (isNaN(preDebitTime) || isNaN(scheduledTime) || preDebitTime > scheduledTime) {
    return {
      checkId: 'CHECK_PRE_DEBIT_NOTIFICATION',
      name: 'Pre-Debit Notification Timing Guardrail',
      passed: false,
      verifiable: true,
      isCritical: true,
      reason: 'Pre-debit notification was not delivered prior to scheduled debit.'
    };
  }

  return {
    checkId: 'CHECK_PRE_DEBIT_NOTIFICATION',
    name: 'Pre-Debit Notification Timing Guardrail',
    passed: true,
    verifiable: true,
    isCritical: true,
    reason: 'Pre-debit notification timestamp verified before scheduled debit.'
  };
}

/**
 * MERCHANT CHECK 1: Maximum Contact Attempts
 */
function checkContactAttempts(event) {
  const contactAttempts = event.contactAttempts ?? event.metadata?.contactAttempts;

  if (contactAttempts === undefined || contactAttempts === null) {
    return {
      checkId: 'CHECK_CONTACT_ATTEMPTS',
      name: 'Merchant Max Contact Attempts',
      passed: false,
      verifiable: false,
      isCritical: false, // Non-critical metadata gap routes to escalate
      reason: 'Contact attempt count cannot be verified from available event data.'
    };
  }

  if (contactAttempts >= POLICY_CONFIG.merchant.maxContactAttempts) {
    return {
      checkId: 'CHECK_CONTACT_ATTEMPTS',
      name: 'Merchant Max Contact Attempts',
      passed: false,
      verifiable: true,
      isCritical: true,
      reason: `Contact attempts (${contactAttempts}) reached or exceeded merchant ceiling (${POLICY_CONFIG.merchant.maxContactAttempts}).`
    };
  }

  return {
    checkId: 'CHECK_CONTACT_ATTEMPTS',
    name: 'Merchant Max Contact Attempts',
    passed: true,
    verifiable: true,
    isCritical: false,
    reason: `Contact attempts (${contactAttempts}) within merchant limit of ${POLICY_CONFIG.merchant.maxContactAttempts}.`
  };
}

/**
 * MERCHANT CHECK 2: Discount Ceiling
 */
function checkDiscountCeiling(event, proposedMessage) {
  let discountPercent = event.proposedDiscount ?? event.metadata?.discountPercent;

  if (discountPercent === undefined && proposedMessage) {
    const match = proposedMessage.match(/(\d+)%\s*discount/i);
    if (match) {
      discountPercent = parseFloat(match[1]);
    }
  }

  if (discountPercent !== undefined && discountPercent !== null) {
    if (discountPercent > POLICY_CONFIG.merchant.maxDiscountPercent) {
      return {
        checkId: 'CHECK_DISCOUNT_CEILING',
        name: 'Merchant Discount Ceiling',
        passed: false,
        verifiable: true,
        isCritical: true,
        reason: `Proposed discount (${discountPercent}%) exceeds configured merchant ceiling (${POLICY_CONFIG.merchant.maxDiscountPercent}%).`
      };
    }
    return {
      checkId: 'CHECK_DISCOUNT_CEILING',
      name: 'Merchant Discount Ceiling',
      passed: true,
      verifiable: true,
      isCritical: true,
      reason: `Proposed discount (${discountPercent}%) within merchant threshold.`
    };
  }

  return {
    checkId: 'CHECK_DISCOUNT_CEILING',
    name: 'Merchant Discount Ceiling',
    passed: true,
    verifiable: true,
    isCritical: true,
    reason: 'No discount proposed.'
  };
}

/**
 * Determines the safe alternative for blocked or escalated decisions.
 */
function resolveSafeAlternative(failedChecks, diagnosisAction) {
  if (!failedChecks || failedChecks.length === 0) {
    if (diagnosisAction === 'escalate') {
      return 'Escalate to customer support specialist for manual review.';
    }
    return null;
  }

  const preDebitFailed = failedChecks.find(c => c.checkId === 'CHECK_PRE_DEBIT_NOTIFICATION');
  if (preDebitFailed) {
    return 'Do not proceed until required pre-debit notification timing can be verified.';
  }

  const urgencyFailed = failedChecks.find(c => c.checkId === 'CHECK_FALSE_URGENCY');
  if (urgencyFailed) {
    return 'Provide a clear payment link without urgency or coercive phrasing.';
  }

  const discountFailed = failedChecks.find(c => c.checkId === 'CHECK_DISCOUNT_CEILING');
  if (discountFailed) {
    return `Cap discount offer at merchant maximum of ${POLICY_CONFIG.merchant.maxDiscountPercent}% or escalate.`;
  }

  const contactFailed = failedChecks.find(c => c.checkId === 'CHECK_CONTACT_ATTEMPTS');
  if (contactFailed && contactFailed.isCritical) {
    return 'Halt automated outreach; transfer to customer support for inbound resolution.';
  }

  return 'Escalate to manual compliance review.';
}

/**
 * Evaluates the proposed recovery action against deterministic policy rules.
 * 100% Deterministic — Never uses an LLM.
 *
 * @param {Object} event - RecoveryEvent from MySQL
 * @param {Object} diagnosis - Validated AI Diagnosis object
 * @param {String|null} proposedMessage - Optional customer message
 */
function evaluatePolicy(event, diagnosis, proposedMessage = null) {
  try {
    if (!event || !diagnosis) {
      return {
        decision: 'block',
        checks: [],
        failedChecks: [
          {
            checkId: 'CHECK_INPUT_INTEGRITY',
            name: 'Input Integrity',
            passed: false,
            verifiable: false,
            isCritical: true,
            reason: 'Missing event or diagnosis data for policy evaluation.'
          }
        ],
        safeAlternative: 'Escalate to manual compliance review due to missing data.',
        evaluatedAt: new Date().toISOString()
      };
    }

    const checks = [
      checkActionValidity(diagnosis),
      checkFalseUrgency(proposedMessage),
      checkBasketSneaking(proposedMessage),
      checkSubscriptionTrap(proposedMessage),
      checkImpliedConsent(proposedMessage),
      checkCancellationClarity(event, proposedMessage),
      checkPreDebitNotification(event),
      checkContactAttempts(event),
      checkDiscountCeiling(event, proposedMessage)
    ];

    const failedChecks = checks.filter(c => !c.passed);
    const hasCriticalFailure = failedChecks.some(c => c.isCritical);
    const hasUnverifiableNonCritical = failedChecks.some(c => !c.isCritical && !c.verifiable);

    let decision;
    if (hasCriticalFailure) {
      decision = 'block';
    } else if (hasUnverifiableNonCritical || diagnosis.recommendedAction === 'escalate') {
      decision = 'escalate';
    } else {
      decision = 'allow';
    }

    const safeAlternative = resolveSafeAlternative(failedChecks, diagnosis.recommendedAction);

    return {
      decision,
      checks,
      failedChecks,
      safeAlternative,
      evaluatedAt: new Date().toISOString()
    };
  } catch (err) {
    // Fail-Safe: Always block on unexpected exception
    console.error('[PolicyEngine Exception] Error evaluating policy:', err.message);
    return {
      decision: 'block',
      checks: [],
      failedChecks: [
        {
          checkId: 'CHECK_ENGINE_EXCEPTION',
          name: 'Policy Engine Integrity',
          passed: false,
          verifiable: false,
          isCritical: true,
          reason: `Policy engine encountered an unexpected error: ${err.message}`
        }
      ],
      safeAlternative: 'Escalate to manual compliance review due to policy evaluation error.',
      evaluatedAt: new Date().toISOString()
    };
  }
}

// In-memory set for deduplicating policy evaluation jobs
const activePolicyJobs = new Set();

/**
 * Async recovery proposal & policy evaluation pipeline:
 * 1. Checks duplicate jobs
 * 2. Generates recovery message proposal (or deterministic fallback)
 * 3. Evaluates policy deterministically against proposed message
 * 4. Persists message & policy outcome in MySQL, setting status = 'checked'
 * 5. Emits 'recovery-proposal' Socket.io event with safe payload
 */
async function processEventPolicy(event, diagnosis, io, customProposedMessage = null) {
  if (!event || !event.eventId) return null;

  if (activePolicyJobs.has(event.eventId)) {
    console.log(`[PolicyEngine] Event ${event.eventId} already evaluated or in progress. Skipping duplicate.`);
    return null;
  }
  activePolicyJobs.add(event.eventId);

  try {
    // Generate recovery message proposal (or fallback) if not explicitly provided
    let messageProposal;
    if (customProposedMessage && typeof customProposedMessage === 'object' && customProposedMessage.message) {
      messageProposal = customProposedMessage;
    } else if (typeof customProposedMessage === 'string') {
      messageProposal = {
        message: customProposedMessage,
        channel: 'sms',
        tone: 'professional',
        action: diagnosis.recommendedAction || 'escalate'
      };
    } else {
      messageProposal = await generateRecoveryMessage(event, diagnosis);
    }

    // Evaluate deterministic policy against the generated message
    const policyResult = evaluatePolicy(event, diagnosis, messageProposal.message);

    // Persist message proposal and policy outcome into MySQL, updating status to 'checked'
    const updated = await prisma.recoveryEvent.update({
      where: { eventId: event.eventId },
      data: {
        recoveryMessage: messageProposal.message,
        messageChannel: messageProposal.channel,
        messageTone: messageProposal.tone,
        messageAction: messageProposal.action,
        policyDecision: policyResult.decision,
        policyChecks: policyResult.checks,
        policyFailedChecks: policyResult.failedChecks,
        safeAlternative: policyResult.safeAlternative,
        status: 'checked'
      }
    });

    console.log(`[PolicyEngine] Persisted recovery proposal & policy for ${updated.eventId} -> decision: ${policyResult.decision}, status: checked`);

    // Emit 'recovery-proposal' over Socket.io with strictly safe payload
    if (io) {
      const recoveryProposalPayload = {
        eventId: updated.eventId,
        message: updated.recoveryMessage,
        channel: updated.messageChannel,
        tone: updated.messageTone,
        action: updated.messageAction,
        policyDecision: updated.policyDecision,
        failedChecks: updated.policyFailedChecks,
        safeAlternative: updated.safeAlternative,
        status: updated.status
      };
      io.emit('recovery-proposal', recoveryProposalPayload);

      // Also emit policy-decision for backward compatibility
      io.emit('policy-decision', {
        eventId: updated.eventId,
        decision: updated.policyDecision,
        checks: updated.policyChecks,
        failedChecks: updated.policyFailedChecks,
        safeAlternative: updated.safeAlternative,
        status: updated.status
      });
    }

    return updated;
  } catch (error) {
    console.error(`[PolicyEngine Error] Failed to process policy for ${event.eventId}:`, error.message);
    return null;
  } finally {
    setTimeout(() => {
      activePolicyJobs.delete(event.eventId);
    }, 60000);
  }
}

module.exports = {
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
  checkDiscountCeiling,
  resolveSafeAlternative
};

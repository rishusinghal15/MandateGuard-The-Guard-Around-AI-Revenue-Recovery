const prisma = require('../config/db');
const { processEventDiagnosis } = require('./diagnosisAgent');

// Failure reason mappings per event type
const FAILURE_REASONS = {
  payment_failed: [
    'insufficient_funds',
    'bank_declined',
    'card_expired',
    'network_timeout',
    'authentication_failed',
    'issuer_unavailable',
    'payment_method_failed'
  ],
  subscription_failed: [
    'recurring_payment_failed',
    'card_expired',
    'insufficient_funds',
    'bank_declined',
    'payment_method_failed'
  ],
  cart_abandoned: [
    'customer_abandoned_checkout',
    'network_timeout',
    'payment_method_failed',
    'authentication_failed'
  ]
};

const EVENT_TYPES = Object.keys(FAILURE_REASONS);

/**
 * Generates realistic INR transaction amounts (₹100 to ₹50,000)
 * Uses common pricing tiers and realistic fractional variations
 */
function generateRealisticAmount() {
  const tiers = [
    () => (Math.floor(Math.random() * 900) + 100) + 0.99, // ₹100 - ₹999.99
    () => (Math.floor(Math.random() * 4000) + 1000) + 0.50, // ₹1,000 - ₹4,999.50
    () => (Math.floor(Math.random() * 10000) + 5000), // ₹5,000 - ₹15,000
    () => (Math.floor(Math.random() * 35000) + 15000) + 0.75 // ₹15,000 - ₹50,000
  ];
  const selectedTier = tiers[Math.floor(Math.random() * tiers.length)];
  const rawAmount = selectedTier();
  return Number(rawAmount.toFixed(2));
}

/**
 * Generates realistic recovery event data.
 * The `recoverable` field is strictly simulation ground truth (~60% true, ~40% false).
 */
function generateEventData() {
  const eventType = EVENT_TYPES[Math.floor(Math.random() * EVENT_TYPES.length)];
  const reasons = FAILURE_REASONS[eventType];
  const failureReason = reasons[Math.floor(Math.random() * reasons.length)];
  const customerId = `CUST-${Math.floor(1000 + Math.random() * 9000)}`;
  const eventId = `EVT-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const amount = generateRealisticAmount();
  
  // Ground truth: ~60% recoverable, ~40% non-recoverable
  const recoverable = Math.random() < 0.60;

  return {
    eventId,
    eventType,
    customerId,
    amount,
    failureReason,
    timestamp: new Date(),
    recoverable,
    status: 'new'
  };
}

/**
 * Strips hidden ground truth (recoverable) before sending to client / Socket.io / AI.
 * AI agents and clients MUST NOT receive the recoverable field.
 */
function toSafeEventPayload(event) {
  return {
    eventId: event.eventId,
    eventType: event.eventType,
    customerId: event.customerId,
    amount: Number(event.amount),
    failureReason: event.failureReason,
    timestamp: event.timestamp,
    status: event.status
  };
}

/**
 * Gets the next randomized interval based on DEMO_MODE
 * - DEMO_MODE: 1000ms - 2000ms (1-2s)
 * - Normal: 5000ms - 8000ms (5-8s)
 */
function getNextInterval() {
  const isDemo = process.env.DEMO_MODE === 'true';
  if (isDemo) {
    return Math.floor(1000 + Math.random() * 1000); // 1-2s
  }
  return Math.floor(5000 + Math.random() * 3000); // 5-8s
}

let simulatorTimer = null;
let isRunning = false;

/**
 * Persists a simulated event to MySQL and emits to Socket.io on success
 */
async function simulateAndPersist(io) {
  const eventData = generateEventData();

  try {
    const createdEvent = await prisma.recoveryEvent.create({
      data: {
        eventId: eventData.eventId,
        eventType: eventData.eventType,
        customerId: eventData.customerId,
        amount: eventData.amount,
        failureReason: eventData.failureReason,
        timestamp: eventData.timestamp,
        recoverable: eventData.recoverable,
        status: eventData.status
      }
    });

    console.log(`[Simulator] Persisted event ${createdEvent.eventId} (${createdEvent.eventType}, ₹${createdEvent.amount})`);

    // Log append-only audit event: EVENT_RECEIVED
    const { logAuditEvent } = require('./auditLogger');
    logAuditEvent({
      eventId: createdEvent.eventId,
      action: 'event_ingestion',
      decision: 'recorded',
      status: 'EVENT_RECEIVED',
      reason: `Failed ${createdEvent.eventType} event received and persisted into MySQL.`,
      metadata: {
        eventType: createdEvent.eventType,
        amount: Number(createdEvent.amount),
        failureReason: createdEvent.failureReason,
        customerId: createdEvent.customerId
      }
    }).catch((auditErr) => {
      console.error(`[Simulator -> Audit Error] for ${createdEvent.eventId}:`, auditErr.message);
    });

    // Emit safe event payload to connected clients
    if (io) {
      const safePayload = toSafeEventPayload(createdEvent);
      io.emit('new-event', safePayload);
    }

    // Trigger AI diagnosis asynchronously without blocking simulation loop
    processEventDiagnosis(createdEvent, io).catch((err) => {
      console.error(`[Simulator -> Diagnosis Error] for ${createdEvent.eventId}:`, err.message);
    });

    return createdEvent;
  } catch (error) {
    console.error(`[Simulator Error] Failed to persist event ${eventData.eventId}:`, error.message);
    // Return null on failure; do NOT emit new-event if DB persistence fails
    return null;
  }
}

/**
 * Starts the realistic event simulator loop
 */
function startSimulator(io) {
  if (isRunning) {
    console.log('[Simulator] Already running, ignoring duplicate start request.');
    return;
  }

  isRunning = true;
  const isDemo = process.env.DEMO_MODE === 'true';
  console.log(`[Simulator] Starting event simulator (DEMO_MODE: ${isDemo})...`);

  const scheduleNext = () => {
    if (!isRunning) return;
    const interval = getNextInterval();
    simulatorTimer = setTimeout(async () => {
      if (!isRunning) return;
      await simulateAndPersist(io);
      scheduleNext();
    }, interval);
  };

  // Kick off first schedule
  scheduleNext();
}

/**
 * Stops the simulator
 */
function stopSimulator() {
  if (simulatorTimer) {
    clearTimeout(simulatorTimer);
    simulatorTimer = null;
  }
  isRunning = false;
  console.log('[Simulator] Stopped event simulator.');
}

module.exports = {
  generateEventData,
  generateRealisticAmount,
  toSafeEventPayload,
  getNextInterval,
  simulateAndPersist,
  startSimulator,
  stopSimulator,
  FAILURE_REASONS,
  EVENT_TYPES
};

const prisma = require('../config/db');

/**
 * Simulates how an un-guarded Naive AI agent WOULD HAVE behaved.
 *
 * CRITICAL SAFETY RULES:
 * - NEVER executes any payment transaction or external customer message.
 * - "wouldExecute: true" represents ONLY the hypothetical un-guarded intent.
 * - This is strictly a comparison simulation.
 */
async function simulateNaiveRecovery(eventId) {
  if (!eventId) {
    return {
      status: 'error',
      wouldExecute: false,
      message: 'Missing eventId.'
    };
  }

  const event = await prisma.recoveryEvent.findUnique({
    where: { eventId }
  });

  if (!event) {
    return {
      eventId,
      status: 'not_found',
      wouldExecute: false,
      message: `Event ${eventId} not found.`
    };
  }

  // Naive AI: Directly trusts AI proposal without any policy authorization
  const action = event.messageAction || event.recommendedAction || 'retry';
  const channel = event.messageChannel || 'sms';
  const message = event.recoveryMessage || (
    action === 'retry'
      ? 'Your payment could not be completed. Please try again.'
      : 'Please use the payment link to complete your transaction.'
  );

  return {
    eventId,
    simulated: true,
    wouldExecute: true,
    action,
    channel,
    message,
    status: 'naive_simulation',
    warning: 'Naive simulation only — no real payment or message sent.'
  };
}

module.exports = {
  simulateNaiveRecovery
};

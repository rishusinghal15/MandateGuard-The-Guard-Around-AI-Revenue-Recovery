const prisma = require('../config/db');

// In-memory set for deduplicating synchronous/concurrent audit events
const loggedAuditKeys = new Set();

/**
 * Safely sanitizes metadata to ensure zero leakage of secrets or ground truth.
 */
function sanitizeAuditMetadata(metadata) {
  if (!metadata || typeof metadata !== 'object') return null;

  const sanitized = { ...metadata };
  if ('recoverable' in sanitized) delete sanitized.recoverable;
  if ('GROQ_API_KEY' in sanitized) delete sanitized.GROQ_API_KEY;
  if ('DATABASE_URL' in sanitized) delete sanitized.DATABASE_URL;
  if ('password' in sanitized) delete sanitized.password;

  return sanitized;
}

/**
 * Persists an append-only audit log record into MySQL.
 *
 * @param {Object} params
 * @param {string} params.eventId - Event ID
 * @param {string} params.action - e.g. "event_ingestion", "diagnosis", "recovery_proposal", "policy_guard", "recovery"
 * @param {string} params.decision - e.g. "recorded", "completed", "created", "allow", "block", "escalate", "simulated_success"
 * @param {string} params.status - e.g. "EVENT_RECEIVED", "AI_DIAGNOSIS_COMPLETED", "RECOVERY_PROPOSAL_CREATED", "POLICY_EVALUATED", "RECOVERY_AUTHORIZED", "RECOVERY_BLOCKED", "MANUAL_REVIEW_REQUIRED", "SIMULATED_RECOVERY_EXECUTED"
 * @param {string|null} params.reason - Detailed justification or check failure reason
 * @param {string|null} params.safeAlternative - Actionable remediation
 * @param {Object|null} params.metadata - Optional sanitized metadata
 */
async function logAuditEvent({
  eventId,
  action,
  decision,
  status,
  reason = null,
  safeAlternative = null,
  metadata = null
}) {
  if (!eventId || !action || !decision || !status) {
    console.warn('[AuditLogger] Incomplete audit event parameters. Skipping.');
    return null;
  }

  // Deduplication check: eventId + status
  const dedupKey = `${eventId}:${status}`;
  if (loggedAuditKeys.has(dedupKey)) {
    return null;
  }
  loggedAuditKeys.add(dedupKey);

  try {
    const sanitizedMeta = sanitizeAuditMetadata(metadata);

    const record = await prisma.auditLog.create({
      data: {
        eventId,
        action,
        decision,
        status,
        reason,
        safeAlternative,
        metadata: sanitizedMeta
      }
    });

    console.log(`[AuditLogger] Logged [${status}] for ${eventId} -> action: ${action}, decision: ${decision}`);
    return record;
  } catch (error) {
    console.error(`[AuditLogger Error] Failed to log audit event for ${eventId}:`, error.message);
    return null;
  } finally {
    // Keep in-memory dedup key for 60s
    setTimeout(() => {
      loggedAuditKeys.delete(dedupKey);
    }, 60000);
  }
}

/**
 * Queries audit logs with optional eventId filter and limit (default: 100).
 */
async function getAuditLogs({ eventId = null, limit = 100 } = {}) {
  try {
    const where = eventId ? { eventId } : {};
    const take = Math.min(Number(limit) || 100, 200);

    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take
    });

    // Sanitize any accidental sensitive fields
    return logs.map((log) => ({
      id: log.id,
      eventId: log.eventId,
      action: log.action,
      decision: log.decision,
      status: log.status,
      reason: log.reason,
      safeAlternative: log.safeAlternative,
      metadata: log.metadata,
      timestamp: log.timestamp
    }));
  } catch (error) {
    console.error('[AuditLogger Error] Failed to fetch audit logs:', error.message);
    return [];
  }
}

module.exports = {
  logAuditEvent,
  getAuditLogs,
  sanitizeAuditMetadata
};

const prisma = require('../config/db');

const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const VALID_ACTIONS = ['retry', 'send_link', 'escalate'];

const FALLBACK_DIAGNOSIS = Object.freeze({
  rootCause: 'AI diagnosis unavailable',
  confidence: 0,
  recommendedAction: 'escalate',
  evidence: ['AI diagnosis failed validation or was unavailable.']
});

/**
 * Extracts ONLY safe context fields for AI diagnosis.
 * Strictly guarantees `recoverable` and secrets are never sent to AI.
 */
function extractSafeAIContext(event) {
  return {
    eventId: event.eventId,
    eventType: event.eventType,
    amount: typeof event.amount === 'number' ? event.amount : Number(event.amount) || 0,
    failureReason: event.failureReason,
    timestamp: event.timestamp,
    customerId: event.customerId
  };
}

/**
 * Strictly validates the structured AI diagnosis response.
 * Returns true if valid, false otherwise.
 */
function isValidDiagnosis(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return false;
  }

  // Validate rootCause
  if (typeof data.rootCause !== 'string' || data.rootCause.trim().length === 0) {
    return false;
  }

  // Validate confidence (must be float between 0 and 1)
  if (typeof data.confidence !== 'number' || isNaN(data.confidence) || data.confidence < 0 || data.confidence > 1) {
    return false;
  }

  // Validate recommendedAction
  if (!VALID_ACTIONS.includes(data.recommendedAction)) {
    return false;
  }

  // Validate evidence (1-3 concise strings)
  if (!Array.isArray(data.evidence) || data.evidence.length < 1 || data.evidence.length > 3) {
    return false;
  }

  const allStrings = data.evidence.every(e => typeof e === 'string' && e.trim().length > 0);
  if (!allStrings) {
    return false;
  }

  return true;
}

/**
 * Parses and sanitizes the LLM JSON response.
 * Returns validated diagnosis object or null.
 */
function parseAndValidateAIResponse(rawContent) {
  try {
    let cleaned = rawContent.trim();
    // Strip markdown code fences if present
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.slice(7);
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.slice(3);
    }
    if (cleaned.endsWith('```')) {
      cleaned = cleaned.slice(0, -3);
    }
    cleaned = cleaned.trim();

    const parsed = JSON.parse(cleaned);

    if (isValidDiagnosis(parsed)) {
      return {
        rootCause: parsed.rootCause.trim(),
        confidence: Number(parsed.confidence.toFixed(2)),
        recommendedAction: parsed.recommendedAction,
        evidence: parsed.evidence.map(e => e.trim())
      };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Calls Groq API with structured JSON output and safe event context.
 * Falls back safely to escalate/0 confidence if anything fails.
 */
async function diagnoseRecoveryEvent(event) {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey || apiKey.trim() === '') {
    console.warn(`[DiagnosisAgent] GROQ_API_KEY not configured. Using fail-safe fallback for ${event.eventId}.`);
    return { ...FALLBACK_DIAGNOSIS };
  }

  const safeContext = extractSafeAIContext(event);

  const systemPrompt = `You are the MandateGuard AI Revenue-Recovery Diagnosis Agent.
Analyze transaction failure events and provide structured root cause diagnoses.
You are ADVISORY only. You do NOT determine regulatory compliance or recovery probability.

You MUST respond with a JSON object matching this exact schema:
{
  "rootCause": "Short concise description of the underlying failure cause",
  "confidence": <float between 0.0 and 1.0>,
  "recommendedAction": "retry" | "send_link" | "escalate",
  "evidence": ["Short string 1", "Short string 2 (optional)", "Short string 3 (optional)"]
}

Constraints:
- "recommendedAction" must be EXACTLY one of: "retry", "send_link", "escalate".
  - Use "retry" for transient technical/network or temporary bank timeout issues.
  - Use "send_link" for card expiration, authentication, checkout abandonment, or alternate payment method needs.
  - Use "escalate" for risk holds, recurring authorization limits, or high uncertainty.
- "evidence" must have between 1 and 3 concise bullet points.
- Do NOT include any markdown formatting, explanation, or text outside the JSON object.`;

  const userPrompt = `Event to diagnose:
${JSON.stringify(safeContext, null, 2)}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      console.error(`[DiagnosisAgent Error] Groq API returned status ${response.status}: ${errText}`);
      return { ...FALLBACK_DIAGNOSIS };
    }

    const json = await response.json();
    const content = json.choices?.[0]?.message?.content;

    if (!content) {
      console.warn(`[DiagnosisAgent] Empty content in Groq response for event ${event.eventId}.`);
      return { ...FALLBACK_DIAGNOSIS };
    }

    const validated = parseAndValidateAIResponse(content);
    if (!validated) {
      console.warn(`[DiagnosisAgent] Groq response failed schema validation for event ${event.eventId}. Content: ${content}`);
      return { ...FALLBACK_DIAGNOSIS };
    }

    console.log(`[DiagnosisAgent] Successfully diagnosed ${event.eventId}: ${validated.recommendedAction} (confidence: ${validated.confidence})`);
    return validated;
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error(`[DiagnosisAgent Error] Groq API call timed out for event ${event.eventId}.`);
    } else {
      console.error(`[DiagnosisAgent Error] Failed to call Groq API for event ${event.eventId}:`, error.message);
    }
    return { ...FALLBACK_DIAGNOSIS };
  }
}

// In-memory set to prevent duplicate diagnosis jobs
const activeDiagnosisJobs = new Set();

/**
 * Asynchronous event processing pipeline:
 * 1. Prevents duplicate runs for the same event
 * 2. Runs diagnosis
 * 3. Persists diagnosis fields & updates status to 'diagnosed' in MySQL
 * 4. Emits 'diagnosis-ready' Socket.io event with safe payload
 */
async function processEventDiagnosis(event, io) {
  if (!event || !event.eventId) return null;

  if (activeDiagnosisJobs.has(event.eventId)) {
    console.log(`[DiagnosisAgent] Event ${event.eventId} already diagnosed or in progress. Skipping duplicate.`);
    return null;
  }
  activeDiagnosisJobs.add(event.eventId);

  try {
    const diagnosis = await diagnoseRecoveryEvent(event);

    // Persist diagnosis into MySQL and update status to 'diagnosed'
    const updated = await prisma.recoveryEvent.update({
      where: { eventId: event.eventId },
      data: {
        rootCause: diagnosis.rootCause,
        confidence: diagnosis.confidence,
        recommendedAction: diagnosis.recommendedAction,
        evidence: diagnosis.evidence,
        status: 'diagnosed'
      }
    });

    console.log(`[DiagnosisAgent] Persisted diagnosis for ${updated.eventId} -> status: diagnosed`);

    // Log append-only audit event: AI_DIAGNOSIS_COMPLETED
    const { logAuditEvent } = require('./auditLogger');
    logAuditEvent({
      eventId: updated.eventId,
      action: 'diagnosis',
      decision: 'completed',
      status: 'AI_DIAGNOSIS_COMPLETED',
      reason: `AI diagnosed root cause: "${updated.rootCause}" with ${Math.round((updated.confidence || 0) * 100)}% confidence. Recommended action: ${updated.recommendedAction}.`,
      metadata: {
        rootCause: updated.rootCause,
        confidence: updated.confidence,
        recommendedAction: updated.recommendedAction,
        evidenceCount: Array.isArray(updated.evidence) ? updated.evidence.length : 0
      }
    }).catch((auditErr) => {
      console.error(`[Diagnosis -> Audit Error] for ${updated.eventId}:`, auditErr.message);
    });

    // Emit 'diagnosis-ready' over Socket.io with strictly safe payload
    if (io) {
      const diagnosisPayload = {
        eventId: updated.eventId,
        rootCause: updated.rootCause,
        confidence: updated.confidence,
        recommendedAction: updated.recommendedAction,
        evidence: updated.evidence,
        status: updated.status
      };
      io.emit('diagnosis-ready', diagnosisPayload);
    }

    // Trigger deterministic Policy Engine asynchronously without blocking
    const { processEventPolicy } = require('./policyEngine');
    processEventPolicy(updated, diagnosis, io).catch((policyErr) => {
      console.error(`[Diagnosis -> Policy Error] for ${updated.eventId}:`, policyErr.message);
    });

    return updated;
  } catch (error) {
    console.error(`[DiagnosisAgent Error] Failed to process diagnosis for ${event.eventId}:`, error.message);
    return null;
  } finally {
    // Keep in set for 60s to avoid immediate duplicate re-runs, then prune
    setTimeout(() => {
      activeDiagnosisJobs.delete(event.eventId);
    }, 60000);
  }
}

module.exports = {
  GROQ_MODEL,
  FALLBACK_DIAGNOSIS,
  extractSafeAIContext,
  isValidDiagnosis,
  parseAndValidateAIResponse,
  diagnoseRecoveryEvent,
  processEventDiagnosis
};

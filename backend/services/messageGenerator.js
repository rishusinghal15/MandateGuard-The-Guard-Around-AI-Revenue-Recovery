const GROQ_MODEL = 'llama-3.3-70b-versatile';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

const VALID_CHANNELS = ['sms', 'email', 'whatsapp'];
const VALID_TONES = ['professional', 'helpful'];
const VALID_ACTIONS = ['retry', 'send_link', 'escalate'];

/**
 * Deterministic fallback message templates per action.
 * Used whenever AI message generation fails, times out, or returns invalid data.
 */
const FALLBACK_TEMPLATES = Object.freeze({
  retry: "Your payment could not be completed. Please try the payment again using your available payment method.",
  send_link: "We couldn't complete your payment. Please use the secure payment link provided to complete it when convenient.",
  escalate: "We couldn't safely complete the payment recovery automatically. Our support team can help you with the next step."
});

/**
 * Creates a deterministic fallback message proposal object.
 */
function getFallbackProposal(action = 'escalate') {
  const normalizedAction = VALID_ACTIONS.includes(action) ? action : 'escalate';
  return {
    message: FALLBACK_TEMPLATES[normalizedAction],
    channel: 'sms',
    tone: 'professional',
    action: normalizedAction,
    isFallback: true
  };
}

/**
 * Extracts ONLY safe context for recovery message generation.
 * Guarantees `recoverable` ground truth and secrets are never sent to AI.
 */
function extractSafeMessageContext(event, diagnosis) {
  return {
    eventId: event.eventId,
    eventType: event.eventType,
    amount: typeof event.amount === 'number' ? event.amount : Number(event.amount) || 0,
    failureReason: event.failureReason,
    customerId: event.customerId,
    rootCause: diagnosis?.rootCause || 'Transaction processing failed',
    recommendedAction: diagnosis?.recommendedAction || 'escalate',
    evidence: Array.isArray(diagnosis?.evidence) ? diagnosis.evidence : []
  };
}

/**
 * Validates the generated message proposal object.
 */
function validateMessageProposal(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return false;
  }

  if (typeof data.message !== 'string' || data.message.trim().length === 0) {
    return false;
  }

  if (!VALID_CHANNELS.includes(data.channel)) {
    return false;
  }

  if (!VALID_TONES.includes(data.tone)) {
    return false;
  }

  if (!VALID_ACTIONS.includes(data.action)) {
    return false;
  }

  return true;
}

/**
 * Parses and validates raw LLM JSON response for recovery message.
 */
function parseAndValidateMessageResponse(rawContent, targetAction) {
  try {
    let cleaned = rawContent.trim();
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

    if (validateMessageProposal(parsed)) {
      return {
        message: parsed.message.trim(),
        channel: parsed.channel,
        tone: parsed.tone,
        action: parsed.action,
        isFallback: false
      };
    }
    return getFallbackProposal(targetAction);
  } catch {
    return getFallbackProposal(targetAction);
  }
}

/**
 * Generates a customer-facing recovery message proposal via Groq AI.
 * Falls back deterministically if API fails, times out, or returns invalid JSON.
 */
async function generateRecoveryMessage(event, diagnosis) {
  const targetAction = diagnosis?.recommendedAction || 'escalate';
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey || apiKey.trim() === '') {
    console.warn(`[MessageGenerator] GROQ_API_KEY not configured. Using deterministic fallback message for ${event.eventId}.`);
    return getFallbackProposal(targetAction);
  }

  const safeContext = extractSafeMessageContext(event, diagnosis);

  const systemPrompt = `You are the MandateGuard Customer Recovery Message Generator.
Generate a concise, professional, and transparent customer recovery message for a failed transaction.

CRITICAL SAFETY RULES:
- NEVER use false urgency, panic language, or fabricated deadlines.
- NEVER threaten account suspension or legal action without factual basis.
- NEVER claim automatic enrollment or imply customer consent for future recurring charges.
- NEVER hide recurring terms, disguise subscriptions as one-time fees, or obscure cancellation.
- NEVER add unexpected add-on fees or bundled charges.
- NEVER claim MandateGuard or the merchant is "RBI certified" or "RBI approved".

You MUST respond with a JSON object matching this exact schema:
{
  "message": "Concise, polite, transparent customer notification message",
  "channel": "sms" | "email" | "whatsapp",
  "tone": "professional" | "helpful",
  "action": "retry" | "send_link" | "escalate"
}

Constraints:
- "channel" must be strictly one of: "sms", "email", "whatsapp".
- "tone" must be strictly one of: "professional", "helpful".
- "action" must match the recommended action: "${targetAction}".
- Do NOT include markdown code blocks or text outside the JSON object.`;

  const userPrompt = `Transaction context:
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
        temperature: 0.2
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      console.error(`[MessageGenerator Error] Groq API returned status ${response.status}: ${errText}`);
      return getFallbackProposal(targetAction);
    }

    const json = await response.json();
    const content = json.choices?.[0]?.message?.content;

    if (!content) {
      console.warn(`[MessageGenerator] Empty content in Groq response for event ${event.eventId}.`);
      return getFallbackProposal(targetAction);
    }

    const proposal = parseAndValidateMessageResponse(content, targetAction);
    console.log(`[MessageGenerator] Generated proposal for ${event.eventId} (channel: ${proposal.channel}, isFallback: ${proposal.isFallback})`);
    return proposal;
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error(`[MessageGenerator Error] Groq API call timed out for event ${event.eventId}.`);
    } else {
      console.error(`[MessageGenerator Error] Failed to generate message for event ${event.eventId}:`, error.message);
    }
    return getFallbackProposal(targetAction);
  }
}

module.exports = {
  GROQ_MODEL,
  FALLBACK_TEMPLATES,
  VALID_CHANNELS,
  VALID_TONES,
  VALID_ACTIONS,
  getFallbackProposal,
  extractSafeMessageContext,
  validateMessageProposal,
  parseAndValidateMessageResponse,
  generateRecoveryMessage
};

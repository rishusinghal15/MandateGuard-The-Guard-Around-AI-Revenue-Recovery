# MandateGuard — Antigravity Build Prompts

Use these in order, one at a time. Review the diff/plan Antigravity proposes before accepting each one — especially Prompt 4 (compliance engine), which is your core differentiator and should not be accepted blindly.

---

## Prompt 0 — Project scaffold

```
Scaffold a full-stack project called "MandateGuard" with this structure:

/frontend — React + Vite + Tailwind CSS
/backend — Node.js + Express, with Socket.io for real-time push
/backend/models — Mongoose schemas for MongoDB Atlas

Backend package.json should include: express, socket.io, mongoose, dotenv, cors.
Frontend package.json should include: socket.io-client, recharts, axios.

Create a .env.example in /backend with placeholders for: MONGODB_URI, GROQ_API_KEY, PORT.

Do not implement any business logic yet — just the folder structure, package.json files,
a working Express server that logs "MandateGuard backend running" on start, and a
working Vite React app that renders "MandateGuard" as a placeholder.

Initialize git and make an initial commit.
```

---

## Day 1 — Live event pipeline

## Prompt 1 — Event schema + simulator

```
In /backend/models, create a Mongoose schema called RecoveryEvent with fields:
- eventId (string, unique)
- eventType (enum: "payment_failed", "subscription_failed", "cart_abandoned")
- customerId (string)
- amount (number)
- failureReason (string, e.g. "insufficient_funds", "card_expired", "bank_timeout", "risk_hold")
- timestamp (date)
- recoverable (boolean) — ground truth label for testing, not shown to the agent
- status (enum: "new", "diagnosed", "decided", "checked", "executed", "blocked", "escalated")

Create /backend/scripts/eventSimulator.js — a script that generates realistic
RecoveryEvent documents (mix of all three eventTypes and failure reasons) and inserts
one every 5-8 seconds into MongoDB, simulating a live webhook feed. Include enough
variety that ~60% are recoverable and ~40% are not, to keep later metrics honest.
Support a DEMO_MODE env flag that switches the interval to 1-2 seconds — use the slow
interval for development, switch to demo mode only when recording the pitch video.

Do not connect this to Socket.io yet — just get events landing in MongoDB on a timer.
```

## Prompt 2 — Socket.io live push

```
Wire up Socket.io in the Express backend so that whenever a new RecoveryEvent is
inserted (via a Mongoose post-save hook or change stream), it's emitted to connected
clients on a "new-event" channel.

On the frontend, create a LiveFeed component that connects via socket.io-client and
renders each incoming event as a card in a scrolling list, showing eventType,
customerId, amount, and failureReason. This is the foundation of the live dashboard —
keep it simple for now, just prove events appear in the browser in real time as the
simulator runs.

Commit this as a working checkpoint before moving to Day 2.
```

---

## Day 2 — Diagnosis + policy engine

## Prompt 3 — Diagnosis agent + deterministic policy engine

```
Add a new backend module /backend/agents/diagnosisAgent.js that:
- Takes a RecoveryEvent as input
- Calls the Groq API (llama-3.3-70b-versatile) with a prompt asking it to return
  ONLY structured JSON: { rootCause, confidence (0-1), recommendedAction, evidence }
  where recommendedAction is one of: "retry", "send_link", "escalate", and evidence
  is a short array of 1-3 strings explaining the reasoning
- Do NOT ask the LLM to estimate a recovery amount — the amount at risk is already
  known from event.amount; use that field directly wherever "amount at risk" is
  needed downstream. Never let the LLM invent a monetary figure.
- Parses and validates the JSON response; if parsing fails, default to "escalate"
  (fail safe, never fail open)

Add /backend/engine/policyEngine.js — this is a DETERMINISTIC rules module, not an
LLM call. Given the diagnosis output plus event history for that customer, decide the
final action using explicit rules:
- Max 3 retry attempts per event, with exponential backoff timestamps
- Max 3 total customer contact attempts across the whole case
- If customer has an opt-out flag, action is always "none" — log and stop
- If failureReason is "risk_hold", action is always "escalate" — never auto-act
- Otherwise, use the LLM's recommendedAction as a suggestion, but the final decision
  and its bounds come from these rules, not the LLM
- Apply this fail-safe rule everywhere in the module: if the LLM call fails, times
  out, or returns unparseable output, default to "escalate" — never default to an
  auto-executing action.

Write unit tests (Jest) for policyEngine.js covering: retry cap hit, contact cap hit,
opt-out respected, risk_hold always escalates, LLM failure defaults to escalate. Do
not write tests for the LLM call itself — mock it.

Update each processed event's status to "decided" and store the decision + reasoning
in the RecoveryEvent document.

Then add /backend/engine/messageGenerator.js — a separate module (not part of the
policy engine) that takes { event, diagnosis, policyDecision, merchantConfig } and
produces { message, channel, discount, containsCancellationMention }. This is the
module whose output gets checked by the compliance engine in the next step — keep it
cleanly separated so it's obvious where customer-facing text actually originates.
```

---

## Day 3 — Compliance rule engine (spend the most time here)

## Prompt 4 — Compliance engine (review this diff carefully before accepting)

```
Add /backend/engine/complianceEngine.js. This module takes a proposed customer-facing
message (generated for a "send_link" or reminder action) plus the case context, and
runs it through a set of independent, named checks. Each check is its own function
that returns { passed: boolean, reason: string }.

Regulatory checks:
1. checkFalseUrgency — flags phrases implying artificial time pressure or threat
   (e.g. "act now", "expires in X minutes", "cancelled immediately", "last chance")
2. checkBasketSneaking — flags any offer/upsell in the message that was not explicitly
   part of the original recovery action (i.e., no silently added extras)
3. checkSubscriptionTrap — flags language that makes cancellation/opt-out sound harder
   or more consequential than it is
4. checkImpliedConsent — flags any phrasing that assumes consent rather than asking
   (e.g. pre-confirmed language, "since you didn't respond, we've...")
5. checkOneStepCancellation — verifies the message includes a clear, single-step
   opt-out/cancel instruction if it mentions cancellation at all
6. checkPreDebitNotice — case context must include explicit `preDebitNotificationAt`
   and `scheduledDebitAt` timestamps (not just "message sent time"). This check passes
   only if `scheduledDebitAt - preDebitNotificationAt >= 24 hours`. Do not implement
   this as a simple delta between "now" and the message — model the actual
   notification-to-debit relationship explicitly in the case context.

Merchant-configured checks:
7. checkContactFrequency — fails if this contact would exceed the merchant's configured
   max-contacts setting for this case
8. checkDiscountCeiling — fails if any discount mentioned exceeds the merchant's
   configured maximum

Add a function runComplianceGate(message, caseContext) that runs all 8 checks and
returns an overall pass/fail plus the full list of individual results. If ANY check
fails, the message must be blocked — do not execute the action, update the event
status to "blocked", and store the full reason list on the event. If the compliance
engine itself throws an error for any reason, treat that as a fail-safe block too —
never let an internal error result in an unchecked action going out.

Write adversarial unit tests: for each check, write at least one test message
specifically designed to fail it, and confirm it's caught. This test file is
important — it's what you'll demo.
```

## Prompt 5 — Wire the compliance gate into the pipeline

```
Update the main event processing flow so the sequence is strictly:
diagnosis -> policy decision -> generate message (if action involves customer contact)
-> compliance gate -> only if passed: execute (simulated) -> else: block and log.

Add a "naive mode" toggle (query param or env flag) that, when enabled, skips the
compliance gate and shows what the raw LLM-suggested message WOULD have been — but
never actually executes it, since nothing in this prototype performs real external
actions anyway. Label it clearly in the UI as "UNSAFE PROPOSED ACTION — simulation
only, not sent" so there's no ambiguity that this is a demo comparison, not a bypass.

Emit a Socket.io event for every compliance check result (pass and fail) so the live
dashboard can show them as they happen, not just the final outcome.
```

---

## Day 4 — Dashboard + metrics

## Prompt 6 — Live dashboard

```
Build out the frontend dashboard with these sections, using Recharts:
1. Live event feed (already built in Day 1, keep it)
2. Live decision feed — shows diagnosis -> policy decision -> compliance result as
   each event is processed, in real time via the socket events already emitted
3. A prominent "BLOCKED" card component that appears whenever a compliance check
   fails, showing: which check failed, the offending phrase/reason, and the safe
   alternative message actually sent instead
4. Running metrics panel: total events processed, recovery rate %, ₹ recovered,
   compliance pass rate %, count of blocked actions by check type
5. A toggle to switch between "MandateGuard mode" and "naive mode" (from Prompt 5)
   side by side, for the demo

Keep styling clean and readable — this is what the judges will actually watch for
most of your 5-minute video.
```

## Prompt 7 — Metrics + deployment

```
Add a /backend/routes/metrics.js endpoint that computes, over the full run:
- recovery rate (recovered / recoverable, using the ground-truth label)
- total ₹ recovered
- compliance pass rate
- breakdown of blocked actions by check name
- unsafe-action interception rate: of all messages that would have been sent in
  naive mode, what % were blocked by the compliance gate. Define this explicitly as
  "blocked / (blocked + naive-mode-would-have-sent)" and label it that way in the UI —
  don't present it as a vague "uplift" number without stating what it's measured against.
Do not filter or cherry-pick — compute over the entire event set.

Add deployment config: a render.yaml or equivalent for the backend on Render, and
vercel.json for the frontend on Vercel. Add clear environment variable documentation
in the README for both.
```

---

## Day 5 — Testing + submission polish

## Prompt 8 — Final test pass

```
Run the full test suite (policyEngine + complianceEngine unit tests). Add one
integration test that runs a full event through the entire pipeline
(diagnosis -> policy -> compliance -> execution/block) and asserts the final
RecoveryEvent document has the expected status and audit fields populated.

Generate a coverage summary and list any untested edge cases you find, so I can
review them manually before submission.
```

## Prompt 9 — README + repo cleanup

```
Write a README.md covering: problem statement (mention RBI's e-mandate framework,
already in effect, and the incoming responsible-conduct directions effective Jan 2027
— phrase this as "guardrails informed by," not "compliant with"), architecture diagram
(ASCII is fine), how to run locally, how the compliance gate works, and sample metrics
from a full run. Do not overstate legal compliance anywhere in this file.

Clean up any dead code, unused dependencies, or placeholder comments left over from
scaffolding.
```

---

## Notes while working

- Accept Antigravity's diffs in small chunks — don't let it batch multiple files into one commit if you can help it. Real, readable commit history matters for the submission.
- After Prompt 4 specifically, read every check function yourself. If Antigravity's false-urgency detector is just a keyword blocklist, that's fine for a 5-day prototype — but know that's what it is, so you can answer honestly if a judge asks how robust it is.
- Use Antigravity's built-in browser (if available in your version) to visually verify the live dashboard actually updates in real time before you trust it for the demo recording.

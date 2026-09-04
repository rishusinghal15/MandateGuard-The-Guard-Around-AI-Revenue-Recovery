# MandateGuard - Real-Time AI Revenue Recovery Agent with Compliance-Aware Guardrails

**Razorpay AI Buildathon 2026 - Track 03: AI Revenue Recovery**

---

## 1. One-line pitch

> A real-time revenue recovery agent that recovers failed payments, failed subscriptions, and abandoned checkouts — while continuously scoring every recovery action against guardrails built from RBI's 2026 e-mandate rules and incoming responsible-conduct principles, live, with a full audit trail. The AI is not trusted with money; it has to earn permission to act.

---

## 2. The real-world problem (grounded, not invented)

Two RBI regulations directly constrain how Indian fintechs are allowed to build recovery agents in 2026:

1. **Digital Payments – E-Mandate Framework, 2026** (in effect since April 21, 2026): recurring auto-debits require 24-hour pre-debit notification, defined no-OTP thresholds (₹15,000 general, ₹1,00,000 for insurance/mutual funds/credit card bills), and standardized liability protection for customers.
2. **RBI Responsible Business Conduct (Second Amendment) Directions, 2026**: first proposed as a draft on Feb 11, 2026 (proposed effective July 1, 2026), then **finalized on June 15, 2026 with an effective date of January 1, 2027**. The final directions ban dark patterns — false urgency, basket sneaking, subscription traps, misleading prompts, pre-ticked consent boxes, difficult cancellation flows — in the marketing and sale of financial products, mandate explicit consent, and introduce a refund mechanism for mis-selling.

Recovery agents (the exact category Razorpay's own Agent Studio ships) sit precisely in the path of both rules: they contact customers repeatedly, they offer discounts/nudges, and they retry debits. Built carelessly, a recovery agent is a future compliance liability — the rules aren't in effect yet, but the direction of travel is clear and dated. **Nobody in this buildathon is likely to build a recovery agent that treats these named categories as literal, testable, per-action checks ahead of the deadline** — that's the gap.

**Important framing note**: don't describe MandateGuard as "RBI-compliant" — that's a legal claim the project can't back, and the dark-pattern rules aren't even in effect until Jan 2027. The accurate, still-impressive framing is: *"MandateGuard operationalizes RBI's e-mandate requirements (already in effect) and its incoming responsible-conduct principles (effective Jan 2027) as deterministic guardrails around an AI recovery agent, ahead of the compliance deadline."*

---

## 3. Solution overview

MandateGuard processes recovery events **as they happen** (simulated live event stream, not a static batch upload), makes a bounded recovery decision, and — before any customer-facing action goes out — runs it through a **Compliance Rule Engine** that checks it against the specific RBI-named categories. Every check, pass or fail, is logged and shown live on a dashboard.

```
   SIMULATED LIVE EVENT STREAM
 (payment.failed / subscription.failed / cart.abandoned)
                    │  (webhook-style POST, one at a time, timed)
                    ▼
          Event Ingestion (Express + Socket.io)
                    │
                    ▼
           Diagnosis Agent (LLM)
     root cause + confidence + suggested action
                    │
                    ▼
        Deterministic Policy Engine
  (rules decide the action + limits — not the LLM)
        retry / send-link / escalate + bounds
                    │
                    ▼
      ┌─────────────────────────────┐
      │   RBI Compliance Rule Engine │
      │  checked against NAMED rules:│
      │  - false urgency language    │
      │  - basket sneaking            │
      │  - subscription-trap wording  │
      │  - pre-ticked/implied consent │
      │  - 1-step cancellation exists │
      │  - 24h pre-debit notice met   │
      │  - contact-frequency cap      │
      │  - discount ceiling respected │
      └─────────────────────────────┘
                    │
         pass ──────┴────── fail
          │                    │
          ▼                    ▼
   Execute (simulated)   Block + log reason
          │                    │
          └─────────┬──────────┘
                     ▼
         Live Dashboard (Socket.io push)
   + Audit Log + Compliance Scorecard per case
```

**Key design principle** (same one Razorpay itself uses, worth saying explicitly in your pitch): the LLM diagnoses and suggests, but never has final authority over money actions or customer contact — the deterministic policy engine and the compliance rule engine do, and both are independently testable.

---

## 4. Tech stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | React + Vite + Tailwind | Known, fast to build |
| Real-time push | Socket.io | Live agent-activity feed for the demo — makes it feel "real time," not a static report |
| Backend | Node.js + Express | Known |
| Database | MongoDB Atlas | Event log, audit trail, compliance scorecards |
| LLM | Groq API (Llama 3.3 70B) | Known, fast inference for live demo |
| Auth | JWT | Reuse existing pattern |
| Charts | Recharts | Recovery + compliance dashboards |
| Export | jsPDF | Compliance report export (nice touch for a fintech pitch) |
| Hosting | Vercel (frontend) + Render (backend) | Known deploy pattern |
| Event simulation | A small script that fires simulated webhook events at intervals (not truly async in production, but *looks and behaves* live in the demo) | No real Razorpay webhook access needed — this is what "real time" means here, and it's honest to describe it that way in your pitch |

No new tools beyond Socket.io, which is a very shallow learning curve (a few hours, not a day).

---

## 5. MVP features (must-ship)

1. **Live event simulator** — script/endpoint that fires realistic failure events one at a time on a timer, like a live webhook feed, with ground-truth "recoverable" labels for honest metrics.
2. **Diagnosis agent** — LLM call → structured JSON `{root_cause, confidence, recommended_action}`.
3. **Deterministic policy engine** — root cause → bounded action, with retry caps, contact caps, discount ceiling, opt-out/do-not-disturb respected.
4. **Compliance Rule Engine** — the differentiator. Split into two categories for a cleaner architecture:

   **Regulatory / policy checks** (grounded in the RBI frameworks):
   - False urgency / fake scarcity language in any generated message
   - Basket sneaking (agent silently adding upsells/offers)
   - Subscription-trap language (making cancellation sound harder than it is)
   - Pre-ticked or implied consent
   - One-step cancellation/opt-out actually present
   - 24-hour pre-debit notice honored before any retry debit (this one is already in force under the E-Mandate Framework)

   **Merchant-configured safety controls** (business rules, not regulation):
   - Contact-frequency cap
   - Discount never exceeds merchant-configured ceiling

   Each check returns pass/fail + reason — this becomes your compliance scorecard.
5. **Live dashboard** (Socket.io) — real-time feed of events coming in, decisions being made, compliance checks passing/failing, as it happens.
6. **Audit trail per case** — full human-readable history: event → diagnosis → policy decision → compliance check results → final action.
7. **Metrics** — recovery rate, ₹ recovered, compliance pass rate, count and reasons for blocked actions.

## 6. Stretch features (only after MVP works end-to-end)

- Compliance scorecard PDF export per merchant (jsPDF)
- Adjustable compliance thresholds via UI (merchant configures contact cap, discount ceiling)
- "Replay" a blocked case to show why it was blocked, side-by-side with what a naive agent would have sent

**Do not touch these until the live pipeline works and is tested.**

---

## 7. 5-day execution plan (Aug 31 → Sep 4, submit Sep 5)

**Day 1 — Foundation + live event pipeline**
- Finalize event schema (failure event, customer, merchant config, compliance rule set)
- Build the live event simulator (timed emission, not a static batch dump)
- Set up Express + Socket.io skeleton, MongoDB connection, Vite React shell with a live-feed placeholder
- End of day: events flow from simulator → backend → live in the browser (even with dummy decisions)

**Day 2 — Diagnosis + policy engine**
- Build diagnosis agent (LLM call, structured output)
- Build deterministic policy engine (rules, not prompts, decide the action)
- Unit-test policy engine: max retries, opt-out, discount ceiling, do-not-disturb window
- End of day: event → diagnosis → decision works end-to-end (no compliance layer yet)

**Day 3 — Compliance Rule Engine (the differentiator — give this the most time)**
- Implement each of the 8 named compliance checks as an independent, testable function
- Adversarial test: deliberately craft messages that should fail each check, confirm they're blocked
- Wire compliance engine into the pipeline before any simulated execution
- End of day: full pipeline works, compliance scorecard generated per case

**Day 4 — Live dashboard + metrics + polish**
- Build the live dashboard: event feed, decision feed, compliance pass/fail feed, running metrics
- Compute final metrics honestly on a full simulated run (don't cherry-pick)
- Deploy (Vercel + Render)
- Start writing real "what broke and how I fixed it" notes from Days 1–3

**Day 5 — Submission**
- Record 5-minute pitch: problem (RBI framework, named and dated) → live demo (event arriving, agent deciding, compliance engine checking it, live on screen) → metrics → what broke
- Write architecture doc (trim this one)
- Clean repo: README, folder structure, .env.example
- Submit: public GitHub repo + pitch video + architecture doc

---

## 8. Testing plan

- **Unit tests on policy engine**: retries capped, discount ceiling respected, opt-out always honored
- **Unit tests on each compliance check** — this is your strongest, most memorable demo material: show a message that fails on "false urgency," show it get blocked, show the reason logged
- **Full-run sanity check**: run the whole simulated event stream, manually inspect ~10 audit trails to confirm they match reality
- **Honest metrics**: report recovery rate and compliance pass rate on the full run, not a curated subset
- **One deliberate failure-mode demo**: show a case that gets correctly escalated to human review instead of auto-acted on — proves "bounded," not just "automated"

---

## 9. Submission checklist

- [ ] Public GitHub repo, real commit history
- [ ] README: problem (cite the two RBI frameworks by name and date), approach, how to run
- [ ] 5-minute pitch video: live demo is the centerpiece — show the compliance engine catching a violation in real time
- [ ] Architecture documentation
- [ ] Honest "what broke" notes, written as you go
- [ ] Metrics reported without cherry-picking

---

## 10. References (for your own reading, not for the pitch verbatim)

- RBI, Digital Payments – E-Mandate Framework, 2026 (Circular RBI/DPSS/2026-27/396, April 21, 2026)
- RBI, Responsible Business Conduct (Second Amendment) Directions, 2026 — draft released Feb 11, 2026; finalized June 15, 2026; effective January 1, 2027
- Razorpay AI Buildathon 2026, official track page (razorpay.com/buildathon)

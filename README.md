# MandateGuard - The Guard Around AI Revenue Recovery

> **AI proposes. Policy decides. Guardrails authorize. Everything is auditable.**

## 🚀 Live Demo

**[Open MandateGuard Live Demo](https://mandate-guard-the-guard-around-ai-r.vercel.app/)**

*Fully deployed end-to-end demo: Vercel frontend + Render backend + Aiven MySQL.*

---

![MandateGuard Dashboard](docs/dashboard.png)

MandateGuard is an AI revenue recovery safety and deterministic authorization layer designed for recurring payments, subscription retries, and failed transaction workflows. It intercepts AI-generated recovery proposals and evaluates them against 9 deterministic policy guardrails before any customer-facing execution can take place.

---

## The Problem

When recurring debits or subscription payments fail, automated recovery systems often cause critical operational, compliance, and user-trust risks:
1. **Unconstrained AI Messaging**: Generative models may inadvertently produce false urgency, coercive countdowns, or deceptive threats.
2. **Dark Pattern Risks**: Unchecked recovery flows risk basket-sneaking unexpected add-on fees, obscuring cancellation mechanisms, or presuming implied recurring auto-debit consent.
3. **Over-Outreach & Discount Leakage**: Autonomous agents can spam users beyond responsible contact limits or offer excessive margin-eroding discounts.
4. **Lack of Explainability & Auditing**: Probabilistic LLMs cannot provide mathematical guarantees of compliance or deterministic audit trails.

The challenge is not only *"Can AI recover revenue?"*, but **"Can AI recover revenue while remaining strictly controlled, explainable, and auditable?"**

---

## The Solution

MandateGuard establishes an independent, zero-trust authorization boundary between AI diagnosis and customer execution.

```
┌───────────────────────┐
│   Recovery Event      │
└───────────┬───────────┘
            ↓
┌───────────────────────┐
│    AI Diagnosis       │
│  Groq + Llama Model   │
└───────────┬───────────┘
            ↓
┌───────────────────────┐
│ Recovery Proposal     │
│ Message + Action      │
└───────────┬───────────┘
            ↓
┌───────────────────────┐
│  Deterministic        │
│    Policy Guard       │
└───────────┬───────────┘
            ↓
     ┌──────┼──────┐
     ↓      ↓      ↓
   ALLOW  BLOCK  ESCALATE
     ↓      ↓      ↓
 Simulation Safe   Human
 Execution Alt.    Review
     └──────┬──────┘
            ↓
     Audit Trail
```

**Core Principle: AI Proposes &bull; Policy Decides.**  
The generative model acts strictly as an advisory proposal layer. The deterministic Policy Guard evaluates every action, outreach channel, tone, and monetary parameter before clearing it for execution.

---

## Why MandateGuard?

Unlike traditional recovery agents that directly execute AI-generated decisions, MandateGuard explores an explicit, independently testable authorization layer:

- **Deterministic Verification**: Zero probabilistic authority at the execution gate.
- **9 Deterministic Guardrails**: High-precision evaluation against responsible conduct and merchant parameters.
- **Constructive Safe Alternatives**: Blocked actions are paired with safe, compliant remediation paths instead of silent dead-ends.
- **Human Escalation Routing**: Ambiguous cases or metadata gaps are safely routed to human compliance triage.
- **Immutable Lifecycle Auditing**: Every event ingestion, AI proposal, policy verdict, and simulated execution is logged to an append-only ledger.
- **Simulation-First Execution**: Complete end-to-end verification without real money movement.

---

## Key Features

### 1. Real-Time Recovery Event Stream
- Ingests failed payments (`payment_failed`), subscription drops (`subscription_failed`), and abandoned carts (`cart_abandoned`) asynchronously via Socket.io.
- Events are persisted in MySQL before socket broadcast.

### 2. AI Failure Diagnosis (Advisory Layer)
- Powered by **Llama 3.3 70B** via the Groq API.
- Generates structured root cause analysis, diagnostic confidence, recommended recovery action (`retry`, `send_link`, `escalate`), and supporting evidence.

### 3. Safe Recovery Message Proposal
- Drafts contextual, customer-friendly recovery messages matched to channel (`sms`, `email`, `whatsapp`).
- Protected by deterministic fallback templates if LLM inference is unavailable or malformed.

### 4. Deterministic Policy Guard (Execution Gate)
- Authoritative evaluation producing three explicit verdicts:
  - `ALLOW`: Passes all guardrails; cleared for simulated recovery execution.
  - `BLOCK`: Violates a critical guardrail; execution halted with an automated safe alternative.
  - `ESCALATE`: Missing operational metadata; routed to human compliance triage.

### 5. Naive AI vs. MandateGuard Safety Comparison
- Live side-by-side comparative inspection showing what an un-guarded AI would execute versus how MandateGuard intercepts and safeguards the transaction.

### 6. Simulated Recovery Execution
- Authorized recovery actions can be simulated on-demand, generating cryptographically unique simulation reference codes (`REF: SIM-REC-...`) logged directly to the audit ledger.

### 7. Interactive Judge Demo Scenarios
- **Trigger Blocked**: Injects a false urgency / coercive proposal to demonstrate instant deterministic interception.
- **Trigger Escalation**: Injects missing contact metadata to demonstrate automatic routing to human review.
- **Trigger Allowed**: Injects a clean compliant recovery proposal to demonstrate safe authorization and simulated execution.

---

## 9 Deterministic Policy Guardrails

MandateGuard evaluates proposals against 9 independent policy guardrails informed by responsible-conduct principles and merchant configurations:

| # | Guardrail Name | Category | Failure Outcome | Description |
| :--- | :--- | :--- | :--- | :--- |
| 1 | `CHECK_ACTION_VALIDITY` | Operational Safety | **BLOCK** | Enforces that recovery actions match approved operational methods (`retry`, `send_link`, `escalate`). |
| 2 | `CHECK_FALSE_URGENCY` | Dark Pattern Protection | **BLOCK** | Intercepts coercive countdown threats, fabricated expiration windows, or artificial urgency language. |
| 3 | `CHECK_BASKET_SNEAKING` | Dark Pattern Protection | **BLOCK** | Halts unauthorized add-on fees, bundled services, or unrequested insurance added during recovery. |
| 4 | `CHECK_SUBSCRIPTION_TRAP` | Dark Pattern Protection | **BLOCK** | Prevents cancellation obstruction, forced multi-step renewals, or renewal traps. |
| 5 | `CHECK_IMPLIED_CONSENT` | Dark Pattern Protection | **BLOCK** | Blocks pre-checked consent boxes and assumed recurring auto-debit authorizations. |
| 6 | `CHECK_CANCELLATION_CLARITY` | Dark Pattern Protection | **BLOCK** | Requires transparent, easily discoverable subscription cancellation instructions in outreach. |
| 7 | `CHECK_PRE_DEBIT_NOTIFICATION` | Responsible Conduct | **BLOCK** | Verifies advance pre-debit notice timing and metadata prior to mandate re-attempt. |
| 8 | `CHECK_CONTACT_ATTEMPTS` | Merchant Demo Threshold | **ESCALATE** | Caps automated customer outreach attempts (*Demo ceiling: ≤ 3 attempts*); routes excess to human review. |
| 9 | `CHECK_DISCOUNT_CEILING` | Merchant Demo Threshold | **BLOCK** | Restricts recovery discount concessions (*Demo ceiling: ≤ 20% discount*). |

> **Regulatory & Demo Boundary Note**:  
> MandateGuard’s guardrails are *RBI-informed / Responsible-conduct guardrails*. The 3-contact attempt ceiling and 20% discount cap are *merchant-configured demonstration thresholds* for this prototype, not statutory regulatory limits.

---

## Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Axios, Socket.io Client.
- **Backend**: Node.js, Express, Socket.io, Prisma ORM, MySQL.
- **AI Inference**: Groq API (`llama-3.3-70b-versatile`) with structured JSON schema validation.
- **Testing**: 72 automated unit tests across 7 backend suites; Vite production build verification.

---

## Project Structure

```
MandateGuard/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── prisma/
│   │   ├── migrations/
│   │   └── schema.prisma
│   ├── services/
│   │   ├── auditLogger.js
│   │   ├── comparisonService.js
│   │   ├── demoScenarios.js
│   │   ├── diagnosisAgent.js
│   │   ├── eventSimulator.js
│   │   ├── messageGenerator.js
│   │   ├── naiveRecovery.js
│   │   ├── policyEngine.js
│   │   └── simulatedRecovery.js
│   ├── tests/
│   │   ├── auditAndSimulation.test.js
│   │   ├── comparison.test.js
│   │   ├── demoScenarios.test.js
│   │   ├── diagnosis.test.js
│   │   ├── messageGenerator.test.js
│   │   ├── policyEngine.test.js
│   │   └── simulator.test.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AppShell.jsx
│   │   │   ├── AuditTrail.jsx
│   │   │   ├── BrandLogo.jsx
│   │   │   ├── DecisionBanner.jsx
│   │   │   ├── DemoControls.jsx
│   │   │   ├── DiagnosisPanel.jsx
│   │   │   ├── EventDetail.jsx
│   │   │   ├── LiveEventFeed.jsx
│   │   │   ├── MetricCards.jsx
│   │   │   ├── PipelineStatus.jsx
│   │   │   ├── PolicyGuardPanel.jsx
│   │   │   ├── RecoveryComparison.jsx
│   │   │   └── RecoveryMessagePanel.jsx
│   │   ├── views/
│   │   │   ├── AiInsightsView.jsx
│   │   │   ├── AnalyticsView.jsx
│   │   │   ├── AuditTrailView.jsx
│   │   │   ├── CommandCenterView.jsx
│   │   │   ├── PolicyGuardView.jsx
│   │   │   ├── RecoveryOpsView.jsx
│   │   │   └── SettingsView.jsx
│   │   ├── hooks/
│   │   │   └── useLiveEvents.js
│   │   ├── services/
│   │   │   └── socket.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── docs/
│   └── dashboard.png
├── .gitignore
└── README.md
```

---

## Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **MySQL**: 8.0 or higher
- **Groq API Key**: (Optional for LLM inference; deterministic fallbacks activate automatically if omitted)

---

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create the environment file:
   ```bash
   cp .env.example .env
   ```
   Configure the variables in `backend/.env`:
   ```env
   DATABASE_URL="mysql://YOUR_DB_USER:YOUR_DB_PASSWORD@localhost:3306/mandateguard"
   GROQ_API_KEY="your_groq_api_key_here"
   PORT=5001
   ```

4. Generate Prisma client & apply database migrations:
   ```bash
   npx prisma migrate dev
   ```

5. Start the backend service:
   ```bash
   npm start
   ```
   *The backend runs on `http://localhost:5001` with active Socket.io gateway.*

---

### Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables (optional, defaults to port 5001):
   ```bash
   cp .env.example .env
   ```
   ```env
   VITE_API_URL=http://localhost:5001
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```
   *Open `http://localhost:5173` in your browser.*

---

## Running the Demo

1. **Observe the Live Stream**: Watch failed transactions arrive in real-time in the left **Live Recovery Stream** panel.
2. **Select an Event**: Click any event card to inspect its context, 4-stage security pipeline, and real-time AI diagnosis.
3. **Inspect AI Diagnosis**: Review the diagnosed root cause, confidence score, and proposed recovery message.
4. **Inspect Policy Guard**: Examine how the 9 deterministic guardrails evaluated the proposal in real-time.
5. **Test Controlled Demo Scenarios**:
   - Click **Trigger Blocked** → Observe the `RECOVERY BLOCKED` decision banner, highlighted breach, and safe alternative.
   - Click **Trigger Escalation** → Observe the `MANUAL REVIEW REQUIRED` escalation route.
   - Click **Trigger Allowed** → Observe `RECOVERY AUTHORIZED`. Click **Simulate Recovery** to execute and receive a unique simulation reference (`REF: SIM-REC-...`).
6. **Compare Naive vs. MandateGuard**: Scroll down to the comparison matrix to see how naive AI execution risks violations while MandateGuard halts non-compliant actions.
7. **Verify Persistent Audit Ledger**: Inspect the **Recent Audit Activity** timeline or navigate to the full **Audit Trail** view.

---

## Security & Safety Design

- **Server-Side Authorization**: AI recommendations never have direct execution authority.
- **Zero Real Money Movement**: Recovery actions in this prototype are strictly simulated.
- **Credential Hygiene**: All API keys, tokens, and database passwords are kept in server-side `.env` files and excluded from Git.
- **Payload Sanitization**: Ground-truth simulation flags (`recoverable`) and secrets are explicitly stripped before socket emission or audit logging.
- **Append-Only Immutability**: Audit trail records cannot be updated or deleted via client APIs.

---

## Testing & Quality Assurance

MandateGuard includes 7 automated test suites covering all core services:

```bash
cd backend
node -e "const fs = require('fs'); const path = require('path'); const testDir = path.resolve('tests'); fs.readdirSync(testDir).filter(f => f.endsWith('.test.js')).forEach(f => { console.log('\n=== ' + f + ' ==='); require(path.join(testDir, f)); });"
```

### Test Coverage Results:
- **`simulator.test.js`**: 6/6 tests passing (Schema validation, payload protection, realistic distributions).
- **`diagnosis.test.js`**: 6/6 tests passing (Groq parser, fallback defaults, duplicate protection).
- **`messageGenerator.test.js`**: 18/18 tests passing (Template validation, dark-pattern detection, channel support).
- **`policyEngine.test.js`**: 15/15 tests passing (All 9 guardrails, boundary enforcement, threshold limits).
- **`comparison.test.js`**: 8/8 tests passing (Naive vs. MandateGuard side-by-side comparative simulation).
- **`auditAndSimulation.test.js`**: 16/16 tests passing (MySQL audit persistence, simulation idempotency, sanitization).
- **`demoScenarios.test.js`**: 3/3 tests passing (Controlled test vector routing and execution).

**Total: 72 / 72 Tests Passing (100% Green)**  
**Frontend Production Build: 0 Errors (`vite build` passing)**

---

## Disclaimer

MandateGuard is a buildathon prototype and technical demonstration system. Its guardrails and simulated workflows are designed for evaluation purposes and do not constitute formal legal advice, statutory regulatory certification, or a guarantee of compliance. Production deployment would require comprehensive jurisdiction-specific legal, compliance, security, and payment-provider review.

---

## Roadmap

- [ ] **Dynamic Merchant Policy Studio**: Web-based policy rule builder for custom velocity and discount limits.
- [ ] **Multi-Gateway Connectors**: Production payment orchestrator hooks behind deterministic authorization gates.
- [ ] **Interactive Human-in-the-Loop Triage**: Real-time approval console for escalated high-value transactions.
- [ ] **Jurisdiction-Specific Rule Packs**: Pluggable compliance modules for regional payment regulations.

---

*Built with precision for the Razorpay AI Buildathon 2026.*

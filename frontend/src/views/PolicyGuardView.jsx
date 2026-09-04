import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, Lock, Scale, AlertTriangle, CheckCircle2, Zap, HelpCircle } from 'lucide-react';

const GUARDRAILS = [
  {
    id: 'CHECK_ACTION_VALIDITY',
    name: 'Action Validity Guardrail',
    type: 'Critical',
    category: 'Operational',
    description: 'Ensures AI proposed recovery actions match strictly approved operational methods (retry, send_link, escalate).',
    remediation: 'Action rejected if unapproved execution method is proposed.'
  },
  {
    id: 'CHECK_FALSE_URGENCY',
    name: 'False Urgency Guardrail',
    type: 'Critical',
    category: 'Dark Pattern Protection',
    description: 'Detects coercive countdown threats, fabricated expiry windows, or alarming language in recovery messages.',
    remediation: 'Provide clear, neutral payment link without urgency or coercive phrasing.'
  },
  {
    id: 'CHECK_BASKET_SNEAKING',
    name: 'Basket Sneaking Guardrail',
    type: 'Critical',
    category: 'Dark Pattern Protection',
    description: 'Blocks unauthorized add-on fees, bundled services, or unrequested insurance attached during payment recovery.',
    remediation: 'Request recovery only for the exact failed transaction amount without add-ons.'
  },
  {
    id: 'CHECK_SUBSCRIPTION_TRAP',
    name: 'Subscription Trap Guardrail',
    type: 'Critical',
    category: 'Dark Pattern Protection',
    description: 'Detects barriers to cancellation, forced multi-step renewals, or renewal traps.',
    remediation: 'Provide clear, unhindered cancellation terms alongside recovery link.'
  },
  {
    id: 'CHECK_IMPLIED_CONSENT',
    name: 'Implied Consent Guardrail',
    type: 'Critical',
    category: 'Dark Pattern Protection',
    description: 'Blocks pre-checked consent boxes and assumed recurring auto-debit authorizations.',
    remediation: 'Require affirmative opt-in consent before creating mandate.'
  },
  {
    id: 'CHECK_CANCELLATION_CLARITY',
    name: 'Cancellation Clarity Guardrail',
    type: 'Critical',
    category: 'Dark Pattern Protection',
    description: 'Requires transparent, easily discoverable subscription cancellation instructions in recovery outreach.',
    remediation: 'Ensure cancellation mechanism is prominently displayed.'
  },
  {
    id: 'CHECK_PRE_DEBIT_NOTIFICATION',
    name: 'Pre-Debit Notification Timing',
    type: 'Critical',
    category: 'Auto-Debit Responsible Conduct',
    description: 'Verifies required advance pre-debit notice timing prior to mandate execution.',
    remediation: 'Do not proceed until required pre-debit notification timing is verified.'
  },
  {
    id: 'CHECK_CONTACT_ATTEMPTS',
    name: 'Merchant Max Contact Attempts',
    type: 'Merchant Demo Guardrail',
    category: 'Merchant Configuration',
    description: 'Limits automated customer outreach attempts (Demo ceiling: ≤ 3 attempts).',
    remediation: 'Pause automated messaging and escalate to human agent triage.'
  },
  {
    id: 'CHECK_DISCOUNT_CEILING',
    name: 'Merchant Max Discount Ceiling',
    type: 'Merchant Demo Guardrail',
    category: 'Merchant Configuration',
    description: 'Restricts recovery discount concessions (Demo ceiling: ≤ 20% discount).',
    remediation: 'Cap recovery discount at configured merchant threshold.'
  }
];

export function PolicyGuardView() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredGuardrails = GUARDRAILS.filter((g) => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'dark_pattern') return g.category.includes('Dark Pattern');
    if (selectedCategory === 'merchant') return g.category.includes('Merchant');
    if (selectedCategory === 'operational') return g.category.includes('Operational') || g.category.includes('Auto-Debit');
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Governance Hero */}
      <div className="bg-[#0F1117] border border-[#272B36] rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#272B36]">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-indigo-950/60 text-[#7C73FF] border border-indigo-800/40">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-white uppercase tracking-wide">
                  Policy Guard Governance Console
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950/40 text-emerald-300 border border-emerald-800/60">
                  DETERMINISTIC
                </span>
              </div>
              <p className="text-xs text-[#A7AFBF] mt-0.5">
                9 Active deterministic guardrails evaluating every AI recovery proposal prior to authorization
              </p>
            </div>
          </div>
        </div>

        {/* Architecture Flow Diagram */}
        <div className="mt-5 p-4 rounded-xl bg-[#151820] border border-[#272B36] grid grid-cols-1 md:grid-cols-3 gap-3 text-center text-xs">
          <div className="p-3.5 rounded-lg bg-[#0F1117] border border-[#272B36] shadow-2xs">
            <span className="text-[10px] font-mono text-[#7C73FF] font-bold block mb-1">STAGE 1: ADVISORY</span>
            <strong className="text-white block font-semibold">AI Recovery Proposal</strong>
            <span className="text-[11px] text-[#A7AFBF]">Diagnoses failure & suggests message</span>
          </div>

          <div className="p-3.5 rounded-lg bg-indigo-950/40 border border-indigo-800/60 shadow-2xs">
            <span className="text-[10px] font-mono text-[#7C73FF] font-bold block mb-1">STAGE 2: AUTHORIZATION</span>
            <strong className="text-indigo-200 block font-semibold">Deterministic Policy Guard</strong>
            <span className="text-[11px] text-indigo-300/90">9 Deterministic compliance & merchant checks</span>
          </div>

          <div className="p-3.5 rounded-lg bg-[#0F1117] border border-[#272B36] shadow-2xs">
            <span className="text-[10px] font-mono text-emerald-400 font-bold block mb-1">STAGE 3: VERDICT</span>
            <strong className="text-white block font-semibold">Allow &bull; Block &bull; Escalate</strong>
            <span className="text-[11px] text-[#A7AFBF]">Action authorized or halted with safe alternative</span>
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        {[
          { id: 'all', label: `All Guardrails (${GUARDRAILS.length})` },
          { id: 'dark_pattern', label: 'Dark Pattern Protections' },
          { id: 'merchant', label: 'Merchant Demo Thresholds' },
          { id: 'operational', label: 'Operational & Auto-Debit' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedCategory(tab.id)}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer text-xs ${
              selectedCategory === tab.id
                ? 'bg-[#635BFF] text-white font-semibold border border-[#7C73FF]/40 shadow-xs'
                : 'bg-[#151820] text-[#A7AFBF] hover:text-white hover:bg-[#191C24] border border-[#272B36]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 9 Guardrails Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredGuardrails.map((g) => {
          const isMerchant = g.type.includes('Merchant');

          return (
            <div
              key={g.id}
              className="bg-[#0F1117] border border-[#272B36] rounded-xl p-5 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-colors shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-[#272B36]">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold border ${
                    isMerchant
                      ? 'bg-amber-950/40 text-amber-300 border-amber-800/60'
                      : 'bg-indigo-950/40 text-indigo-300 border-indigo-800/60'
                  }`}>
                    {g.type.toUpperCase()}
                  </span>
                  <span className="text-[10px] font-mono text-[#6B7280] font-medium">{g.id}</span>
                </div>

                <h3 className="text-xs font-bold text-white mb-1.5">
                  {g.name}
                </h3>
                <p className="text-xs text-[#A7AFBF] leading-relaxed">
                  {g.description}
                </p>
              </div>

              <div className="pt-2.5 border-t border-[#272B36] text-[11px] bg-[#151820] p-3 rounded-lg border border-[#272B36]">
                <span className="text-[#7C73FF] font-bold block text-[10px] uppercase font-mono tracking-wider mb-0.5">
                  Remediation:
                </span>
                <span className="text-[#F8FAFC]">
                  {g.remediation}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default PolicyGuardView;

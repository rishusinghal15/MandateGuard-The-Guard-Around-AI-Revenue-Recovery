import React from 'react';
import { Brain, Sparkles, CheckCircle2, ShieldCheck, Zap, AlertCircle } from 'lucide-react';

export function AiInsightsView({ events = [] }) {
  const diagnosedEvents = events.filter((e) => e.rootCause || e.recommendedAction);

  // Aggregations from real session data
  let totalConfidence = 0;
  let retryCount = 0;
  let sendLinkCount = 0;
  let escalateCount = 0;
  const rootCauses = {};

  for (const evt of diagnosedEvents) {
    if (typeof evt.confidence === 'number') {
      totalConfidence += evt.confidence;
    }
    const act = evt.recommendedAction || 'retry';
    if (act === 'retry') retryCount += 1;
    else if (act === 'send_link') sendLinkCount += 1;
    else if (act === 'escalate') escalateCount += 1;

    if (evt.rootCause) {
      rootCauses[evt.rootCause] = (rootCauses[evt.rootCause] || 0) + 1;
    }
  }

  const avgConfidence = diagnosedEvents.length > 0
    ? Math.round((totalConfidence / diagnosedEvents.length) * 100)
    : null;

  return (
    <div className="space-y-6">
      {/* AI Insights Header */}
      <div className="bg-[#0F1117] border border-[#272B36] rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-indigo-950/60 text-[#7C73FF] border border-indigo-800/40">
              <Brain className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-sm font-bold text-white uppercase tracking-wide">
                  AI Diagnostic Intelligence
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-950/40 text-indigo-300 border border-indigo-800/60">
                  ADVISORY ONLY
                </span>
              </div>
              <p className="text-xs text-[#A7AFBF]">
                LLM-powered payment failure diagnosis &bull; Decoupled from execution authority
              </p>
            </div>
          </div>

          <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-[#151820] border border-[#272B36] text-[#A7AFBF] font-semibold">
            {diagnosedEvents.length} Diagnoses Analyzed
          </span>
        </div>
      </div>

      {/* Principle Callout */}
      <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-800/60 text-xs flex items-start space-x-3 shadow-2xs">
        <div className="p-1.5 rounded-lg bg-indigo-900/60 text-[#7C73FF] mt-0.5">
          <Sparkles className="h-4 w-4" />
        </div>
        <div className="space-y-1">
          <strong className="text-white block text-xs font-bold">
            Core Architectural Boundary: AI Proposes &bull; Policy Authorizes
          </strong>
          <p className="text-indigo-200 leading-relaxed text-[11px]">
            Generative AI excels at pattern classification and root-cause synthesis across payment failure telemetry. However, in financial systems, customer outreach and recurring debit execution must never rely on probabilistic authority. MandateGuard treats all AI diagnoses as non-binding proposals that must earn clearance from the deterministic Policy Guard.
          </p>
        </div>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0F1117] border border-[#272B36] rounded-xl p-5 shadow-sm">
          <span className="text-[11px] font-bold text-[#A7AFBF] uppercase font-mono tracking-wider block mb-1">
            Mean Diagnostic Confidence
          </span>
          <div className="text-2xl font-extrabold text-[#7C73FF] font-mono">
            {avgConfidence !== null ? `${avgConfidence}%` : '—'}
          </div>
          <span className="text-[11px] text-[#6B7280] font-mono mt-1 block">
            Across {diagnosedEvents.length} diagnosed failures
          </span>
        </div>

        <div className="bg-[#0F1117] border border-[#272B36] rounded-xl p-5 shadow-sm">
          <span className="text-[11px] font-bold text-[#A7AFBF] uppercase font-mono tracking-wider block mb-1">
            Primary Recommended Action
          </span>
          <div className="text-xl font-extrabold text-emerald-400 font-mono uppercase">
            {retryCount >= sendLinkCount ? 'RETRY' : 'SEND LINK'}
          </div>
          <span className="text-[11px] text-[#6B7280] font-mono mt-1 block">
            Retry: {retryCount} &bull; Link: {sendLinkCount} &bull; Escalate: {escalateCount}
          </span>
        </div>

        <div className="bg-[#0F1117] border border-[#272B36] rounded-xl p-5 shadow-sm">
          <span className="text-[11px] font-bold text-[#A7AFBF] uppercase font-mono tracking-wider block mb-1">
            Inference Engine
          </span>
          <div className="text-lg font-bold text-white font-mono">
            Groq GPT-OSS 20B
          </div>
          <span className="text-[11px] text-[#6B7280] font-mono mt-1 block">
            Structured JSON schema validation
          </span>
        </div>
      </div>

      {/* Diagnosed Root Causes Breakdown */}
      <div className="bg-[#0F1117] border border-[#272B36] rounded-xl p-5 shadow-sm">
        <span className="text-xs font-bold text-white uppercase tracking-wide block mb-3">
          Session Diagnosed Root Causes ({Object.keys(rootCauses).length} Distinct Categories)
        </span>

        {Object.keys(rootCauses).length === 0 ? (
          <div className="p-8 text-center text-[#6B7280] text-xs">
            Waiting for live diagnosed events to compile root cause frequency telemetry.
          </div>
        ) : (
          <div className="space-y-2.5">
            {Object.entries(rootCauses).map(([cause, count]) => (
              <div
                key={cause}
                className="bg-[#151820] p-3.5 rounded-lg border border-[#272B36] flex items-center justify-between text-xs hover:border-slate-600 transition-colors shadow-2xs"
              >
                <div className="flex items-center space-x-2.5">
                  <CheckCircle2 className="h-4 w-4 text-[#7C73FF]" />
                  <span className="text-white font-medium">{cause}</span>
                </div>
                <span className="font-mono text-xs text-[#7C73FF] font-bold bg-[#635BFF]/15 px-2.5 py-1 rounded border border-[#635BFF]/30">
                  {count} {count === 1 ? 'event' : 'events'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AiInsightsView;

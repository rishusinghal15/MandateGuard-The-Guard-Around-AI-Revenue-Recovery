import React from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

export function PolicyGuardPanel({ event }) {
  if (!event) {
    return (
      <div className="bg-[#0F1117] border border-[#272B36] rounded-xl p-6 shadow-sm flex flex-col items-center justify-center text-center text-[#A7AFBF] min-h-[400px]">
        <div className="p-3.5 rounded-xl bg-indigo-950/60 text-[#7C73FF] border border-indigo-800/40 mb-3">
          <ShieldCheck className="h-7 w-7" />
        </div>
        <h3 className="text-xs font-bold text-white uppercase tracking-wide">
          Policy Guard
        </h3>
        <p className="text-[11px] text-[#A7AFBF] font-mono mt-0.5 mb-4">
          Deterministic Authorization Layer
        </p>
        <div className="p-3.5 rounded-lg bg-[#151820] border border-[#272B36] text-xs text-[#A7AFBF] max-w-xs leading-relaxed">
          Select an event from the Live Recovery Stream to inspect its 9 deterministic compliance and merchant guardrails.
        </div>
      </div>
    );
  }

  const decision = event.policyDecision;
  const checks = Array.isArray(event.policyChecks) ? event.policyChecks : [];
  const hasEvaluated = Boolean(decision);

  const decisionConfig = {
    allow: {
      label: 'ALLOW',
      color: 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60',
      icon: ShieldCheck
    },
    block: {
      label: 'BLOCK',
      color: 'bg-rose-950/40 text-rose-300 border-rose-800/60',
      icon: ShieldAlert
    },
    escalate: {
      label: 'ESCALATE',
      color: 'bg-amber-950/40 text-amber-300 border-amber-800/60',
      icon: AlertTriangle
    }
  };

  const currentDecision = decisionConfig[decision] || {
    label: 'PENDING',
    color: 'bg-[#151820] text-[#A7AFBF] border-[#272B36]',
    icon: AlertCircle
  };

  const DecisionIcon = currentDecision.icon;

  return (
    <div className="bg-[#0F1117] border border-[#272B36] rounded-xl p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-3.5 border-b border-[#272B36]">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-indigo-950/60 text-[#7C73FF] border border-indigo-800/40">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wide">
              Policy Guard
            </h3>
            <span className="text-[11px] text-[#A7AFBF] font-mono">Deterministic Authorization Layer</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-md text-xs font-bold tracking-wider uppercase border font-mono ${currentDecision.color}`}>
            <DecisionIcon className="h-3.5 w-3.5" />
            <span>{currentDecision.label}</span>
          </span>
        </div>
      </div>

      {!hasEvaluated ? (
        <div className="py-8 text-center text-[#A7AFBF] text-xs flex flex-col items-center justify-center space-y-2">
          <ShieldCheck className="h-5 w-5 text-[#6B7280] animate-pulse" />
          <span>Evaluating deterministic compliance guardrails...</span>
        </div>
      ) : (
        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between text-[11px] text-[#A7AFBF] px-1">
            <span>Evaluated Guardrails ({checks.length})</span>
            <span className="font-mono text-[10px] text-[#7C73FF] font-semibold">9 DETERMINISTIC CHECKS</span>
          </div>

          <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
            {checks.length === 0 ? (
              <div className="p-3 bg-[#151820] rounded-lg border border-[#272B36] text-[#A7AFBF] text-center">
                Guardrail verification records loaded.
              </div>
            ) : (
              checks.map((check, idx) => {
                const passed = check.passed;
                const isCritical = check.isCritical;
                const verifiable = check.verifiable !== false;

                let rowBg = 'bg-[#151820] border-[#272B36]';
                let iconEl = <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />;
                let statusBadge = (
                  <span className="px-1.5 py-0.5 text-[9px] font-bold font-mono rounded bg-emerald-950/40 text-emerald-300 border border-emerald-800/60">
                    PASS
                  </span>
                );

                if (!passed && isCritical) {
                  rowBg = 'bg-rose-950/40 border-rose-700/60 ring-1 ring-rose-600/30';
                  iconEl = <XCircle className="h-3.5 w-3.5 text-rose-400 flex-shrink-0" />;
                  statusBadge = (
                    <span className="px-1.5 py-0.5 text-[9px] font-bold font-mono rounded bg-rose-950/60 text-rose-200 border border-rose-700/60 font-bold">
                      BLOCKED
                    </span>
                  );
                } else if (!passed && !verifiable) {
                  rowBg = 'bg-amber-950/40 border-amber-700/60 ring-1 ring-amber-600/30';
                  iconEl = <AlertTriangle className="h-3.5 w-3.5 text-amber-400 flex-shrink-0" />;
                  statusBadge = (
                    <span className="px-1.5 py-0.5 text-[9px] font-bold font-mono rounded bg-amber-950/60 text-amber-200 border border-amber-700/60 font-bold">
                      REVIEW
                    </span>
                  );
                }

                return (
                  <div
                    key={check.checkId || idx}
                    className={`p-2.5 rounded-lg border transition-colors ${rowBg}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2 min-w-0">
                        {iconEl}
                        <span className={`font-semibold text-white truncate text-[11px] ${!passed ? 'text-rose-200 font-bold' : ''}`}>
                          {check.name || check.checkId}
                        </span>
                      </div>
                      {statusBadge}
                    </div>
                    <p className={`text-[11px] pl-5.5 leading-relaxed ${!passed ? 'text-rose-300 font-medium' : 'text-[#A7AFBF]'}`}>
                      {check.reason}
                    </p>
                  </div>
                );
              })
            )}
          </div>

          <div className="pt-2 border-t border-[#272B36] flex items-center justify-between text-[11px] text-[#6B7280]">
            <span>Deterministic Engine &bull; Zero probabilistic authority</span>
            <span className="font-mono text-[10px] text-[#6B7280]">POLICY_v1</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default PolicyGuardPanel;

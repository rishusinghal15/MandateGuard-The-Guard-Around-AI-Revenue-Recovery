import React from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

export function PolicyGuardPanel({ event }) {
  if (!event) return null;

  const decision = event.policyDecision;
  const checks = Array.isArray(event.policyChecks) ? event.policyChecks : [];
  const hasEvaluated = Boolean(decision);

  const decisionConfig = {
    allow: {
      label: 'ALLOW',
      color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/40',
      icon: ShieldCheck
    },
    block: {
      label: 'BLOCK',
      color: 'bg-rose-500/10 text-rose-400 border-rose-500/50',
      icon: ShieldAlert
    },
    escalate: {
      label: 'ESCALATE',
      color: 'bg-amber-500/10 text-amber-400 border-amber-500/40',
      icon: AlertTriangle
    }
  };

  const currentDecision = decisionConfig[decision] || {
    label: 'PENDING',
    color: 'bg-slate-700/40 text-slate-400 border-slate-600',
    icon: AlertCircle
  };

  const DecisionIcon = currentDecision.icon;

  return (
    <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-700/60">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide">
              Policy Guard
            </h3>
            <span className="text-[10px] text-slate-400">Deterministic Authorization Layer</span>
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
        <div className="py-8 text-center text-slate-400 text-xs flex flex-col items-center justify-center space-y-2">
          <ShieldCheck className="h-6 w-6 text-slate-500 animate-pulse" />
          <span>Evaluating deterministic compliance guardrails...</span>
        </div>
      ) : (
        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
            <span>Evaluated Guardrails ({checks.length})</span>
            <span className="font-mono text-[10px] text-indigo-400 font-semibold">RBI-INFORMED &bull; MERCHANT RULES</span>
          </div>

          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {checks.length === 0 ? (
              <div className="p-3 bg-slate-900/40 rounded-lg border border-slate-700/40 text-slate-400 text-center">
                Guardrail verification records loaded.
              </div>
            ) : (
              checks.map((check, idx) => {
                const passed = check.passed;
                const isCritical = check.isCritical;
                const verifiable = check.verifiable !== false;

                let rowBg = 'bg-slate-900/40 border-slate-700/40';
                let iconEl = <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />;
                let statusBadge = (
                  <span className="px-1.5 py-0.5 text-[9px] font-bold font-mono rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    PASS
                  </span>
                );

                if (!passed && isCritical) {
                  rowBg = 'bg-rose-950/20 border-rose-500/30';
                  iconEl = <XCircle className="h-4 w-4 text-rose-400 flex-shrink-0" />;
                  statusBadge = (
                    <span className="px-1.5 py-0.5 text-[9px] font-bold font-mono rounded bg-rose-500/10 text-rose-400 border border-rose-500/30">
                      BLOCKED
                    </span>
                  );
                } else if (!passed && !verifiable) {
                  rowBg = 'bg-amber-950/20 border-amber-500/30';
                  iconEl = <AlertTriangle className="h-4 w-4 text-amber-400 flex-shrink-0" />;
                  statusBadge = (
                    <span className="px-1.5 py-0.5 text-[9px] font-bold font-mono rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                      REVIEW
                    </span>
                  );
                }

                return (
                  <div
                    key={check.checkId || idx}
                    className={`p-3 rounded-lg border transition-colors ${rowBg}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2 min-w-0">
                        {iconEl}
                        <span className="font-semibold text-slate-200 truncate">
                          {check.name || check.checkId}
                        </span>
                      </div>
                      {statusBadge}
                    </div>
                    <p className="text-slate-400 text-[11px] pl-6 leading-relaxed">
                      {check.reason}
                    </p>
                  </div>
                );
              })
            )}
          </div>

          <div className="pt-2 border-t border-slate-700/40 flex items-center justify-between text-[10px] text-slate-400">
            <span>Deterministic Engine &bull; Zero probabilistic authority</span>
            <span className="font-mono text-[10px] text-slate-500">POLICY_v1</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default PolicyGuardPanel;

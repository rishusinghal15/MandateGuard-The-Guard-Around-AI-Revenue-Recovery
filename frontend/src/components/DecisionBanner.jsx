import React from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, Clock } from 'lucide-react';

export function DecisionBanner({ event }) {
  if (!event) return null;

  const decision = event.policyDecision;
  const failedChecks = event.policyFailedChecks || [];
  const safeAlternative = event.safeAlternative;

  // 1. ALLOWED
  if (decision === 'allow') {
    return (
      <div className="bg-emerald-950/40 border border-emerald-500/50 rounded-xl p-5 mb-5 shadow-lg shadow-emerald-950/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-emerald-500/30">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-emerald-300 tracking-tight">
                  RECOVERY AUTHORIZED
                </h2>
                <span className="px-2 py-0.5 text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded">
                  PASSED ALL GUARDRAILS
                </span>
              </div>
              <p className="text-xs text-emerald-400/80">
                Deterministic policy verification complete. Action approved for execution.
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="inline-block px-2.5 py-1 text-[11px] font-medium bg-emerald-900/60 text-emerald-300 border border-emerald-700/60 rounded">
              SIMULATION &bull; NO REAL CHARGE
            </span>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="bg-emerald-900/20 p-2.5 rounded-lg border border-emerald-500/20">
            <span className="text-emerald-400/70 block text-[10px] uppercase tracking-wider">Authorized Action</span>
            <span className="font-bold text-emerald-200 uppercase font-mono">{event.messageAction || event.recommendedAction || 'RETRY'}</span>
          </div>
          <div className="bg-emerald-900/20 p-2.5 rounded-lg border border-emerald-500/20">
            <span className="text-emerald-400/70 block text-[10px] uppercase tracking-wider">Outreach Channel</span>
            <span className="font-bold text-emerald-200 uppercase font-mono">{event.messageChannel || 'SMS'}</span>
          </div>
          <div className="bg-emerald-900/20 p-2.5 rounded-lg border border-emerald-500/20">
            <span className="text-emerald-400/70 block text-[10px] uppercase tracking-wider">Guardrail Compliance</span>
            <span className="font-bold text-emerald-200">100% Deterministic</span>
          </div>
        </div>
      </div>
    );
  }

  // 2. BLOCKED (Key demo moment)
  if (decision === 'block') {
    const primaryFailure = failedChecks[0];

    return (
      <div className="bg-rose-950/50 border-2 border-rose-500/70 rounded-xl p-5 mb-5 shadow-lg shadow-rose-950/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-rose-500/30">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-lg bg-rose-500/20 border border-rose-400/50 flex items-center justify-center text-rose-400">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-rose-300 tracking-tight">
                  RECOVERY BLOCKED
                </h2>
                <span className="px-2 py-0.5 text-[11px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-400/40 rounded">
                  POLICY GUARDRAIL BREACH
                </span>
              </div>
              <p className="text-xs text-rose-300/80">
                Action halted deterministically. Zero trust boundary prevented unsafe execution.
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="inline-block px-2.5 py-1 text-[11px] font-semibold bg-rose-900/80 text-rose-200 border border-rose-600 rounded">
              EXECUTION PREVENTED
            </span>
          </div>
        </div>

        <div className="mt-3 space-y-2.5 text-xs">
          {primaryFailure && (
            <div className="bg-rose-900/30 p-3 rounded-lg border border-rose-500/30">
              <div className="flex items-center justify-between mb-1">
                <span className="text-rose-300 font-semibold">
                  Failed Guardrail: {primaryFailure.name || primaryFailure.checkId}
                </span>
                <span className="font-mono text-[10px] text-rose-400 uppercase">CRITICAL CHECK</span>
              </div>
              <p className="text-rose-200/90 leading-relaxed">
                {primaryFailure.reason}
              </p>
            </div>
          )}

          {safeAlternative && (
            <div className="bg-slate-900/80 p-3 rounded-lg border border-indigo-500/40">
              <span className="text-indigo-400 font-semibold block text-[11px] uppercase tracking-wider mb-0.5">
                Safe Alternative Remediation
              </span>
              <p className="text-slate-200 leading-relaxed font-medium">
                {safeAlternative}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 3. ESCALATE
  if (decision === 'escalate') {
    return (
      <div className="bg-amber-950/40 border border-amber-500/50 rounded-xl p-5 mb-5 shadow-lg shadow-amber-950/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-amber-500/30">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-amber-300 tracking-tight">
                  MANUAL REVIEW REQUIRED
                </h2>
                <span className="px-2 py-0.5 text-[11px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-400/30 rounded">
                  ESCALATION ROUTE
                </span>
              </div>
              <p className="text-xs text-amber-400/80">
                Automated outreach paused due to risk policy or missing operational metadata.
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="inline-block px-2.5 py-1 text-[11px] font-medium bg-amber-900/60 text-amber-300 border border-amber-700/60 rounded">
              HUMAN TRIAGE
            </span>
          </div>
        </div>

        <div className="mt-3 space-y-2 text-xs">
          {safeAlternative && (
            <div className="bg-amber-900/20 p-3 rounded-lg border border-amber-500/20">
              <span className="text-amber-400 font-semibold block text-[11px] uppercase tracking-wider mb-0.5">
                Recommended Remediation
              </span>
              <p className="text-amber-200/90 leading-relaxed">
                {safeAlternative}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 4. Pending state
  return (
    <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-5 mb-5">
      <div className="flex items-center space-x-3">
        <div className="h-10 w-10 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 animate-spin">
          <Clock className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-slate-200">
            Authorization in Progress...
          </h2>
          <p className="text-xs text-slate-400">
            Evaluating event against deterministic compliance and merchant guardrails.
          </p>
        </div>
      </div>
    </div>
  );
}

export default DecisionBanner;

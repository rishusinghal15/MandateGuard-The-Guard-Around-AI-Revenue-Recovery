import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, Clock, Play, CheckCircle2, Lock } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export function DecisionBanner({ event, onSimulationComplete }) {
  if (!event) return null;

  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState(null);
  const [simulationError, setSimulationError] = useState(null);

  const decision = event.policyDecision;
  const failedChecks = event.policyFailedChecks || [];
  const safeAlternative = event.safeAlternative;
  const executionStatus = simulationResult?.status || event.executionStatus;
  const executionReference = simulationResult?.executionReference || event.executionReference;

  const handleSimulateRecovery = async () => {
    if (!event.eventId || isSimulating) return;

    try {
      setIsSimulating(true);
      setSimulationError(null);
      const res = await axios.post(`${BACKEND_URL}/api/recovery/${event.eventId}/simulate`);
      setSimulationResult(res.data);
      if (onSimulationComplete) {
        onSimulationComplete(res.data);
      }
    } catch (err) {
      console.error('[Simulation Error]', err);
      const msg = err.response?.data?.message || err.message || 'Simulation request failed.';
      setSimulationError(msg);
    } finally {
      setIsSimulating(false);
    }
  };

  // 1. ALLOWED
  if (decision === 'allow') {
    const isExecuted = executionStatus === 'simulated_success';

    return (
      <div className="bg-emerald-950/30 border border-emerald-800/60 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-emerald-800/40">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-950/60 border border-emerald-700/60 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-emerald-300 tracking-tight">
                  {isExecuted ? 'SIMULATED RECOVERY COMPLETE' : 'RECOVERY AUTHORIZED'}
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-emerald-950/60 text-emerald-300 border border-emerald-700/60 rounded">
                  {isExecuted ? 'EXECUTED (SIM)' : 'PASSED ALL GUARDRAILS'}
                </span>
              </div>
              <p className="text-xs text-emerald-400/90 mt-0.5">
                {isExecuted
                  ? 'Simulated recovery executed and logged in the append-only audit trail.'
                  : 'Deterministic policy verification complete. Action cleared for simulation.'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {!isExecuted ? (
              <button
                onClick={handleSimulateRecovery}
                disabled={isSimulating}
                className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-lg shadow-sm border border-emerald-400/30 transition-colors cursor-pointer disabled:opacity-50"
              >
                <Play className={`h-3.5 w-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
                <span>{isSimulating ? 'Simulating...' : 'Simulate Recovery'}</span>
              </button>
            ) : (
              <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#0F1117] border border-emerald-700/60 text-emerald-300 text-xs font-mono font-bold shadow-xs">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                <span>REF: {executionReference}</span>
              </div>
            )}
          </div>
        </div>

        <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="bg-[#0F1117] p-3 rounded-lg border border-emerald-900/50 shadow-2xs">
            <span className="text-[#A7AFBF] block text-[10px] uppercase font-mono font-medium">Authorized Action</span>
            <span className="font-bold text-emerald-300 uppercase font-mono">{event.messageAction || event.recommendedAction || 'RETRY'}</span>
          </div>
          <div className="bg-[#0F1117] p-3 rounded-lg border border-emerald-900/50 shadow-2xs">
            <span className="text-[#A7AFBF] block text-[10px] uppercase font-mono font-medium">Outreach Channel</span>
            <span className="font-bold text-emerald-300 uppercase font-mono">{event.messageChannel || 'SMS'}</span>
          </div>
          <div className="bg-[#0F1117] p-3 rounded-lg border border-emerald-900/50 shadow-2xs">
            <span className="text-[#A7AFBF] block text-[10px] uppercase font-mono font-medium">Boundary</span>
            <span className="font-semibold text-white">Simulation Only &bull; Zero Real Charge</span>
          </div>
        </div>

        {simulationError && (
          <div className="mt-3 p-2.5 rounded-lg bg-rose-950/50 border border-rose-800/60 text-rose-300 text-xs">
            {simulationError}
          </div>
        )}
      </div>
    );
  }

  // 2. BLOCKED
  if (decision === 'block') {
    const primaryFailure = failedChecks[0];

    return (
      <div className="bg-rose-950/30 border border-rose-800/60 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-rose-800/40">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-rose-950/60 border border-rose-700/60 flex items-center justify-center text-rose-400">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-rose-300 tracking-tight">
                  RECOVERY BLOCKED
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-rose-950/60 text-rose-300 border border-rose-700/60 rounded">
                  POLICY GUARDRAIL BREACH
                </span>
              </div>
              <p className="text-xs text-rose-400/90 mt-0.5">
                Action halted deterministically. Zero-trust boundary prevented non-compliant execution.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold bg-rose-950/60 text-rose-300 border border-rose-700/60 rounded-lg">
              <Lock className="h-3.5 w-3.5" />
              <span>Execution prevented by Policy Guard</span>
            </span>
          </div>
        </div>

        <div className="mt-3 space-y-2.5 text-xs">
          {primaryFailure && (
            <div className="bg-[#0F1117] p-3 rounded-lg border border-rose-800/60 shadow-2xs">
              <div className="flex items-center justify-between mb-1">
                <span className="text-rose-300 font-semibold">
                  Failed Guardrail: {primaryFailure.name || primaryFailure.checkId}
                </span>
                <span className="font-mono text-[10px] text-rose-400 font-bold uppercase">CRITICAL CHECK</span>
              </div>
              <p className="text-rose-200/90 leading-relaxed text-[11px]">
                {primaryFailure.reason}
              </p>
            </div>
          )}

          {safeAlternative && (
            <div className="bg-indigo-950/40 p-3 rounded-lg border border-indigo-800/60 shadow-2xs">
              <span className="text-[#7C73FF] font-bold block text-[10px] font-mono uppercase tracking-wider mb-0.5">
                Safe Alternative Remediation
              </span>
              <p className="text-indigo-200 leading-relaxed font-medium text-[11px]">
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
      <div className="bg-amber-950/30 border border-amber-800/60 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-amber-800/40">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-amber-950/60 border border-amber-700/60 flex items-center justify-center text-amber-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-amber-300 tracking-tight">
                  MANUAL REVIEW REQUIRED
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-amber-950/60 text-amber-300 border border-amber-700/60 rounded">
                  ESCALATION ROUTE
                </span>
              </div>
              <p className="text-xs text-amber-400/90 mt-0.5">
                Automated outreach paused due to risk policy or missing operational metadata.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="inline-block px-3 py-1.5 text-xs font-semibold bg-amber-950/60 text-amber-300 border border-amber-700/60 rounded-lg">
              Manual review required — no automated execution
            </span>
          </div>
        </div>

        <div className="mt-3 space-y-2 text-xs">
          {safeAlternative && (
            <div className="bg-[#0F1117] p-3 rounded-lg border border-amber-800/60 shadow-2xs">
              <span className="text-amber-300 font-bold block text-[10px] font-mono uppercase tracking-wider mb-0.5">
                Recommended Remediation
              </span>
              <p className="text-amber-200/90 leading-relaxed text-[11px]">
                {safeAlternative}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 4. Pending
  return (
    <div className="bg-[#0F1117] border border-[#272B36] rounded-xl p-5 shadow-sm">
      <div className="flex items-center space-x-3">
        <div className="h-10 w-10 rounded-xl bg-indigo-950/60 border border-indigo-800/60 flex items-center justify-center text-[#7C73FF] animate-spin">
          <Clock className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-white">
            Authorization in Progress...
          </h2>
          <p className="text-xs text-[#A7AFBF]">
            Evaluating event against deterministic compliance and merchant guardrails.
          </p>
        </div>
      </div>
    </div>
  );
}

export default DecisionBanner;

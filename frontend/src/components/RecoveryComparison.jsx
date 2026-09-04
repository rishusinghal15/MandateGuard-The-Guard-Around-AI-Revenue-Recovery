import React, { useState, useEffect } from 'react';
import { Bot, ShieldCheck, AlertTriangle, CheckCircle2, Lock, Sparkles, ShieldAlert } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export function RecoveryComparison({ event }) {
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(false);

  const eventId = event?.eventId;

  useEffect(() => {
    if (!eventId) {
      setComparison(null);
      return;
    }

    let isMounted = true;

    const fetchComparison = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${BACKEND_URL}/api/recovery/${eventId}/comparison`);
        if (isMounted && res.data) {
          setComparison(res.data);
        }
      } catch (err) {
        if (isMounted) {
          console.error('[RecoveryComparison Error] Failed to fetch comparison:', err.message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchComparison();

    return () => {
      isMounted = false;
    };
  }, [eventId, event?.status, event?.policyDecision]);

  if (!event) {
    return (
      <div className="bg-[#0F1117] border border-[#272B36] rounded-xl p-6 text-center text-[#A7AFBF] text-xs shadow-sm">
        Select an event to compare recovery behavior.
      </div>
    );
  }

  const naive = comparison?.naive || {
    action: event.messageAction || event.recommendedAction || 'retry',
    channel: event.messageChannel || 'sms',
    message: event.recoveryMessage || 'Loading proposal...',
    status: 'naive_simulation'
  };

  const mandateGuard = comparison?.mandateGuard || {
    policyDecision: event.policyDecision || 'pending',
    action: event.messageAction || event.recommendedAction || 'retry',
    channel: event.messageChannel || 'sms',
    message: event.recoveryMessage || naive.message,
    failedChecks: event.policyFailedChecks || [],
    safeAlternative: event.safeAlternative || null
  };

  const interception = comparison?.interception || {
    intercepted: event.policyDecision === 'block' || event.policyDecision === 'escalate',
    reason: event.policyFailedChecks?.[0]?.reason || (event.policyDecision === 'allow' ? 'Cleared all guardrails' : 'Evaluating...'),
    safeAlternative: event.safeAlternative
  };

  const isBlocked = mandateGuard.policyDecision === 'block';
  const isEscalate = mandateGuard.policyDecision === 'escalate';
  const isAllow = mandateGuard.policyDecision === 'allow';

  return (
    <div className="bg-[#0F1117] border border-[#272B36] rounded-xl p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#272B36]">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-indigo-950/60 text-[#7C73FF] border border-indigo-800/40">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wide">
              AI Safety Comparison &bull; Why MandateGuard?
            </h3>
            <p className="text-[11px] text-[#A7AFBF] font-mono">
              Same AI proposal &bull; Different authorization model
            </p>
          </div>
        </div>

        <span className="text-[10px] font-mono px-2.5 py-0.5 rounded bg-amber-950/40 text-amber-300 border border-amber-800/60">
          SIMULATION &bull; ZERO REAL MONEY MOVEMENT
        </span>
      </div>

      {/* Side-by-Side Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left: NAIVE AI */}
        <div className="bg-rose-950/20 border border-rose-900/50 rounded-xl p-4 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-rose-900/40">
              <div className="flex items-center space-x-2">
                <Bot className="h-4 w-4 text-rose-400" />
                <span className="font-bold text-xs text-rose-300 uppercase tracking-wider">
                  Naive AI
                </span>
              </div>
              <span className="px-2 py-0.5 text-[9px] font-bold font-mono rounded bg-rose-950/60 text-rose-300 border border-rose-800/60">
                NO POLICY GUARD
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between bg-[#0F1117] p-2.5 rounded-lg border border-rose-900/40 shadow-2xs">
                <span className="text-[10px] text-[#A7AFBF] uppercase font-mono font-medium">Execution Behavior</span>
                <span className="font-mono font-bold text-rose-400 text-[11px]">
                  WOULD EXECUTE
                </span>
              </div>

              <div>
                <span className="text-[10px] text-[#A7AFBF] uppercase font-mono font-medium block mb-1">
                  Un-Guarded Proposal
                </span>
                <div className="bg-[#0F1117] p-3 rounded-lg border border-rose-900/40 text-rose-100 font-sans italic text-xs leading-relaxed shadow-2xs">
                  "{naive.message}"
                </div>
              </div>

              <div className="flex items-center space-x-2 text-[10px] text-[#A7AFBF] font-mono">
                <span>Action: <strong className="text-white">{naive.action}</strong></span>
                <span>&bull;</span>
                <span>Channel: <strong className="text-white uppercase">{naive.channel}</strong></span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-rose-900/40 text-[11px] text-rose-300 leading-relaxed bg-rose-950/40 p-2.5 rounded-lg">
            <strong>Risk Exposure:</strong> An un-guarded AI would execute this outreach without policy compliance verification.
          </div>
        </div>

        {/* Right: MANDATEGUARD */}
        <div className={`border rounded-xl p-4 flex flex-col justify-between space-y-3 ${
          isBlocked
            ? 'bg-rose-950/20 border-rose-900/50'
            : isEscalate
            ? 'bg-amber-950/20 border-amber-900/50'
            : 'bg-emerald-950/20 border-emerald-900/50'
        }`}>
          <div>
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#272B36]">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span className="font-bold text-xs text-white uppercase tracking-wider">
                  MandateGuard
                </span>
              </div>
              <span className="px-2 py-0.5 text-[9px] font-bold font-mono rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/60">
                POLICY GUARDED
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between bg-[#0F1117] p-2.5 rounded-lg border border-[#272B36] shadow-2xs">
                <span className="text-[10px] text-[#A7AFBF] uppercase font-mono font-medium">Policy Authorization</span>
                <span className={`font-mono font-bold text-[11px] px-2 py-0.5 rounded border ${
                  isBlocked
                    ? 'bg-rose-950/60 text-rose-200 border-rose-700/60'
                    : isEscalate
                    ? 'bg-amber-950/60 text-amber-200 border-amber-700/60'
                    : 'bg-emerald-950/60 text-emerald-200 border-emerald-700/60'
                }`}>
                  {isBlocked ? 'BLOCKED' : isEscalate ? 'MANUAL REVIEW' : 'AUTHORIZED'}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-[#A7AFBF] uppercase font-mono font-medium block mb-1">
                  Guardrail Authorization Outcome
                </span>
                <div className="bg-[#0F1117] p-3 rounded-lg border border-[#272B36] text-[#F8FAFC] text-xs leading-relaxed shadow-2xs">
                  {isBlocked ? (
                    <div className="space-y-1">
                      <div className="text-rose-400 font-semibold flex items-center space-x-1">
                        <Lock className="h-3.5 w-3.5 flex-shrink-0" />
                        <span>{mandateGuard.failedChecks?.[0]?.name || 'Guardrail Breach'}</span>
                      </div>
                      <p className="text-[#A7AFBF] text-[11px]">
                        {mandateGuard.failedChecks?.[0]?.reason || 'Unsafe recovery message blocked.'}
                      </p>
                    </div>
                  ) : isEscalate ? (
                    <div className="space-y-1">
                      <div className="text-amber-400 font-semibold flex items-center space-x-1">
                        <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
                        <span>Escalated to Human Review</span>
                      </div>
                      <p className="text-[#A7AFBF] text-[11px]">
                        Requires manual compliance review before outreach.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <div className="text-emerald-400 font-semibold flex items-center space-x-1">
                        <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" />
                        <span>Cleared All Guardrails</span>
                      </div>
                      <p className="text-[#A7AFBF] text-[11px]">
                        Proposed action verified against deterministic compliance rules.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {mandateGuard.safeAlternative && (
                <div className="bg-indigo-950/40 p-2.5 rounded-lg border border-indigo-800/60 text-[11px] text-indigo-200">
                  <strong className="text-[#7C73FF] font-mono text-[10px] block mb-0.5">SAFE ALTERNATIVE:</strong>
                  {mandateGuard.safeAlternative}
                </div>
              )}
            </div>
          </div>

          <div className="pt-2 border-t border-[#272B36] text-[11px] text-[#A7AFBF] leading-relaxed">
            <strong>MandateGuard Protection:</strong> Zero-trust policy authorization halts non-compliant actions.
          </div>
        </div>
      </div>

      {/* Interception Callout Banner */}
      {interception.intercepted && (
        <div className="bg-indigo-950/40 p-3 rounded-lg border border-indigo-800/60 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-indigo-900/60 text-[#7C73FF]">
              <ShieldAlert className="h-4 w-4" />
            </div>
            <div>
              <span className="font-bold text-white tracking-wide block text-xs">
                POLICY INTERCEPTION TRIGGERED
              </span>
              <span className="text-[11px] text-[#A7AFBF]">
                {interception.reason}
              </span>
            </div>
          </div>
          <span className="text-[10px] font-mono text-[#7C73FF] bg-[#0F1117] px-2.5 py-1 rounded border border-[#635BFF]/40 font-semibold shadow-xs">
            DETERMINISTIC
          </span>
        </div>
      )}

      {/* Architecture Explanation */}
      <div className="p-3.5 bg-[#151820] rounded-lg border border-[#272B36] text-center text-xs text-[#A7AFBF] space-y-0.5">
        <p className="font-medium text-[#F8FAFC] text-xs">
          "MandateGuard does not replace the AI. It puts an independent authorization layer between AI intent and customer execution."
        </p>
        <p className="text-[11px] text-[#7C73FF] font-mono font-semibold">
          AI proposes &bull; Policy decides &bull; Guardrails authorize
        </p>
      </div>
    </div>
  );
}

export default RecoveryComparison;

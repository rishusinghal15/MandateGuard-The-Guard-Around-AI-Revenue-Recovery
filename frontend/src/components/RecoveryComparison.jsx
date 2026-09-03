import React, { useState, useEffect } from 'react';
import { Bot, ShieldCheck, ShieldAlert, ArrowRight, Zap, AlertTriangle, CheckCircle2, Lock, Sparkles } from 'lucide-react';
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
      <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-6 text-center text-slate-400 text-xs">
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
    <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-5 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-700/60">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Zap className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide">
              AI Safety Comparison
            </h3>
            <p className="text-[11px] text-slate-400">
              Same AI proposal &bull; Different authorization model
            </p>
          </div>
        </div>

        <span className="text-[10px] font-mono px-2.5 py-1 rounded bg-slate-900 text-amber-400 border border-amber-500/30">
          SIMULATION &bull; NO REAL MONEY MOVEMENT
        </span>
      </div>

      {/* Side-by-Side Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left: NAIVE AI */}
        <div className="bg-slate-900/70 border border-rose-500/30 rounded-xl p-4 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-rose-500/20">
              <div className="flex items-center space-x-2">
                <Bot className="h-4 w-4 text-rose-400" />
                <span className="font-bold text-xs text-rose-300 uppercase tracking-wider">
                  Naive AI
                </span>
              </div>
              <span className="px-2 py-0.5 text-[9px] font-bold font-mono rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">
                NO POLICY GUARD
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between bg-slate-950/60 p-2.5 rounded border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase">Execution Behavior</span>
                <span className="font-mono font-bold text-rose-400 text-[11px]">
                  WOULD EXECUTE
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
                  Un-Guarded Proposal
                </span>
                <div className="bg-slate-950/80 p-3 rounded border border-slate-800 text-slate-300 font-sans italic text-xs leading-relaxed">
                  "{naive.message}"
                </div>
              </div>

              <div className="flex items-center space-x-2 text-[10px] text-slate-400">
                <span>Action: <strong className="text-slate-300 font-mono">{naive.action}</strong></span>
                <span>&bull;</span>
                <span>Channel: <strong className="text-slate-300 font-mono uppercase">{naive.channel}</strong></span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-rose-500/20 text-[10px] text-rose-300/80 leading-relaxed bg-rose-950/20 p-2 rounded">
            <strong>Risk Exposure:</strong> An un-guarded AI would attempt this action without policy compliance verification.
          </div>
        </div>

        {/* Right: MANDATEGUARD */}
        <div className={`border rounded-xl p-4 flex flex-col justify-between space-y-3 ${
          isBlocked
            ? 'bg-rose-950/30 border-rose-500/50'
            : isEscalate
            ? 'bg-amber-950/30 border-amber-500/50'
            : 'bg-emerald-950/30 border-emerald-500/50'
        }`}>
          <div>
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-700/60">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span className="font-bold text-xs text-slate-100 uppercase tracking-wider">
                  MandateGuard
                </span>
              </div>
              <span className="px-2 py-0.5 text-[9px] font-bold font-mono rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                POLICY GUARDED
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between bg-slate-950/60 p-2.5 rounded border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase">Policy Authorization</span>
                <span className={`font-mono font-bold text-[11px] px-2 py-0.5 rounded border ${
                  isBlocked
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    : isEscalate
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                }`}>
                  {isBlocked ? 'BLOCKED' : isEscalate ? 'MANUAL REVIEW' : 'AUTHORIZED'}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
                  Guardrail Authorization Outcome
                </span>
                <div className="bg-slate-950/80 p-3 rounded border border-slate-800 text-slate-200 text-xs leading-relaxed">
                  {isBlocked ? (
                    <div className="space-y-1">
                      <div className="text-rose-400 font-semibold flex items-center space-x-1">
                        <Lock className="h-3.5 w-3.5 flex-shrink-0" />
                        <span>{mandateGuard.failedChecks?.[0]?.name || 'Guardrail Breach'}</span>
                      </div>
                      <p className="text-slate-300 text-[11px]">
                        {mandateGuard.failedChecks?.[0]?.reason || 'Unsafe recovery message blocked.'}
                      </p>
                    </div>
                  ) : isEscalate ? (
                    <div className="space-y-1">
                      <div className="text-amber-400 font-semibold flex items-center space-x-1">
                        <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
                        <span>Escalated to Human Review</span>
                      </div>
                      <p className="text-slate-300 text-[11px]">
                        Requires manual compliance review before outreach.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <div className="text-emerald-400 font-semibold flex items-center space-x-1">
                        <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" />
                        <span>Cleared All Guardrails</span>
                      </div>
                      <p className="text-slate-300 text-[11px]">
                        Proposed action verified against deterministic compliance rules.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {mandateGuard.safeAlternative && (
                <div className="bg-indigo-950/40 p-2.5 rounded border border-indigo-500/30 text-[11px] text-indigo-300">
                  <strong className="text-indigo-400 block mb-0.5">Safe Alternative Generated:</strong>
                  {mandateGuard.safeAlternative}
                </div>
              )}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-700/60 text-[10px] text-slate-400 leading-relaxed">
            <strong>MandateGuard Protection:</strong> Zero-trust policy authorization halts non-compliant actions.
          </div>
        </div>
      </div>

      {/* Interception Callout Banner */}
      {interception.intercepted && (
        <div className="bg-gradient-to-r from-rose-950/40 via-indigo-950/40 to-slate-900/60 p-3.5 rounded-lg border border-indigo-500/30 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2.5">
            <div className="p-1 rounded bg-amber-500/20 text-amber-400">
              <Zap className="h-4 w-4" />
            </div>
            <div>
              <span className="font-bold text-slate-200 tracking-wide block">
                ⚡ POLICY INTERCEPTION TRIGGERED
              </span>
              <span className="text-[11px] text-slate-400">
                {interception.reason}
              </span>
            </div>
          </div>
          <span className="text-[10px] font-mono text-indigo-300 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-500/30">
            DETERMINISTIC
          </span>
        </div>
      )}

      {/* Judge-Friendly Architecture Explanation */}
      <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-700/40 text-center text-xs text-slate-400 space-y-1">
        <p className="font-medium text-slate-300">
          "MandateGuard does not replace the AI. It puts an independent authorization layer between AI intent and customer-facing execution."
        </p>
        <p className="text-[11px] text-indigo-400 font-mono font-semibold">
          AI proposes &bull; Policy decides &bull; Guardrails authorize
        </p>
      </div>
    </div>
  );
}

export default RecoveryComparison;

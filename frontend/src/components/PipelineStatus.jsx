import React from 'react';
import { Check, Circle, AlertCircle, Sparkles, MessageSquare, ShieldCheck } from 'lucide-react';

export function PipelineStatus({ event }) {
  if (!event) return null;

  const hasEvent = Boolean(event.eventId);
  const hasDiagnosis = Boolean(event.rootCause || event.recommendedAction);
  const hasProposal = Boolean(event.recoveryMessage);
  const hasPolicy = Boolean(event.policyDecision);

  const steps = [
    {
      id: 'event',
      label: '1. Event Captured',
      statusLabel: 'NEW',
      isCompleted: hasEvent,
      isActive: hasEvent && !hasDiagnosis,
      icon: Circle
    },
    {
      id: 'diagnosis',
      label: '2. AI Diagnosis',
      statusLabel: 'DIAGNOSED',
      isCompleted: hasDiagnosis,
      isActive: hasDiagnosis && !hasProposal,
      icon: Sparkles
    },
    {
      id: 'proposal',
      label: '3. Message Proposal',
      statusLabel: 'PROPOSED',
      isCompleted: hasProposal,
      isActive: hasProposal && !hasPolicy,
      icon: MessageSquare
    },
    {
      id: 'policy',
      label: '4. Policy Guard',
      statusLabel: 'CHECKED',
      isCompleted: hasPolicy,
      isActive: false,
      icon: ShieldCheck
    }
  ];

  return (
    <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-4 mb-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Authorization Pipeline
        </span>
        <span className="text-xs font-mono text-slate-400">
          Status: <span className="font-bold text-indigo-400 uppercase">{event.status || 'NEW'}</span>
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isDone = step.isCompleted;
          const isActive = step.isActive;

          let badgeStyle = 'bg-slate-800/50 border-slate-700 text-slate-500';
          let iconStyle = 'text-slate-500';

          if (isDone) {
            badgeStyle = 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300';
            iconStyle = 'text-emerald-400';
          } else if (isActive) {
            badgeStyle = 'bg-indigo-950/40 border-indigo-500/50 text-indigo-300 animate-pulse';
            iconStyle = 'text-indigo-400';
          }

          return (
            <div
              key={step.id}
              className={`flex items-center space-x-2.5 p-2.5 rounded-lg border text-xs transition-all ${badgeStyle}`}
            >
              <div className="flex-shrink-0">
                {isDone ? (
                  <Check className="h-4 w-4 text-emerald-400" />
                ) : (
                  <Icon className={`h-4 w-4 ${iconStyle}`} />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-medium truncate">{step.label}</div>
                <div className="text-[10px] text-slate-400 font-mono">
                  {isDone ? 'COMPLETE' : isActive ? 'PROCESSING...' : 'PENDING'}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default PipelineStatus;

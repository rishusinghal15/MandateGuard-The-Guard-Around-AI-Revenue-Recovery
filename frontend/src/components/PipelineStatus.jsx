import React from 'react';
import { Check, Circle, Sparkles, MessageSquare, ShieldCheck } from 'lucide-react';

export function PipelineStatus({ event }) {
  if (!event) return null;

  const hasEvent = Boolean(event.eventId);
  const hasDiagnosis = Boolean(event.rootCause || event.recommendedAction);
  const hasProposal = Boolean(event.recoveryMessage);
  const hasPolicy = Boolean(event.policyDecision);

  const steps = [
    {
      id: 'event',
      label: '01 EVENT CAPTURED',
      isCompleted: hasEvent,
      isActive: hasEvent && !hasDiagnosis,
      icon: Circle
    },
    {
      id: 'diagnosis',
      label: '02 AI DIAGNOSIS',
      isCompleted: hasDiagnosis,
      isActive: hasDiagnosis && !hasProposal,
      icon: Sparkles
    },
    {
      id: 'proposal',
      label: '03 MESSAGE PROPOSAL',
      isCompleted: hasProposal,
      isActive: hasProposal && !hasPolicy,
      icon: MessageSquare
    },
    {
      id: 'policy',
      label: '04 POLICY GUARD',
      isCompleted: hasPolicy,
      isActive: false,
      icon: ShieldCheck
    }
  ];

  return (
    <div className="bg-[#151820] border border-[#272B36] rounded-xl p-3.5">
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#A7AFBF] font-mono">
          Security Authorization Pipeline
        </span>
        <span className="text-[11px] font-mono text-[#A7AFBF]">
          Stage: <span className="font-bold text-[#7C73FF] uppercase">{event.status || 'NEW'}</span>
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {steps.map((step) => {
          const Icon = step.icon;
          const isDone = step.isCompleted;
          const isActive = step.isActive;

          let badgeStyle = 'bg-[#191C24] border-[#272B36] text-[#6B7280]';
          let iconStyle = 'text-[#6B7280]';

          if (isDone) {
            badgeStyle = 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300 font-medium';
            iconStyle = 'text-emerald-400';
          } else if (isActive) {
            badgeStyle = 'bg-indigo-950/40 border-indigo-800/60 text-indigo-300 font-medium animate-pulse';
            iconStyle = 'text-[#7C73FF]';
          }

          return (
            <div
              key={step.id}
              className={`flex items-center space-x-2.5 p-2 rounded-lg border text-xs transition-all shadow-2xs ${badgeStyle}`}
            >
              <div className="flex-shrink-0">
                {isDone ? (
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                ) : (
                  <Icon className={`h-3.5 w-3.5 ${iconStyle}`} />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-mono text-[10px] font-bold truncate tracking-tight">{step.label}</div>
                <div className="text-[9px] text-[#6B7280] font-mono">
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

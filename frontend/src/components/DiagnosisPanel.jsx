import React from 'react';
import { Sparkles, Brain, CheckCircle2 } from 'lucide-react';

export function DiagnosisPanel({ event }) {
  if (!event) return null;

  const hasDiagnosis = Boolean(event.rootCause || event.recommendedAction);
  const confidence = typeof event.confidence === 'number' ? Math.round(event.confidence * 100) : null;
  const action = event.recommendedAction || 'escalate';
  const evidenceList = Array.isArray(event.evidence) ? event.evidence : [];

  const actionColors = {
    retry: 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60',
    send_link: 'bg-indigo-950/40 text-indigo-300 border-indigo-800/60',
    escalate: 'bg-amber-950/40 text-amber-300 border-amber-800/60'
  };

  return (
    <div className="bg-[#0F1117] border border-[#272B36] rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#272B36]">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-indigo-950/60 text-[#7C73FF] border border-indigo-800/40">
            <Brain className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wide">
              AI Diagnosis
            </h3>
            <span className="text-[11px] text-[#A7AFBF] font-mono">Groq GPT-OSS 20B &bull; Advisory Only</span>
          </div>
        </div>
        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-950/40 text-indigo-300 border border-indigo-800/60">
          PROPOSAL LAYER
        </span>
      </div>

      {!hasDiagnosis ? (
        <div className="py-8 text-center text-[#A7AFBF] text-xs flex flex-col items-center justify-center space-y-2">
          <Sparkles className="h-5 w-5 text-[#7C73FF] animate-spin" />
          <span>AI diagnosis in progress...</span>
        </div>
      ) : (
        <div className="space-y-3.5 text-xs">
          {/* Action & Confidence Header */}
          <div className="flex items-center justify-between bg-[#151820] p-3 rounded-lg border border-[#272B36]">
            <div>
              <span className="text-[10px] text-[#A7AFBF] uppercase font-mono font-medium block mb-0.5">
                Proposed Action
              </span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider border font-mono ${actionColors[action] || actionColors.escalate}`}>
                {action.replace('_', ' ')}
              </span>
            </div>

            {confidence !== null && (
              <div className="text-right">
                <span className="text-[10px] text-[#A7AFBF] uppercase font-mono font-medium block mb-0.5">
                  AI Confidence
                </span>
                <div className="flex items-center space-x-2">
                  <div className="w-16 bg-[#272B36] rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-[#635BFF] h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${confidence}%` }}
                    />
                  </div>
                  <span className="font-bold text-white font-mono text-xs">{confidence}%</span>
                </div>
              </div>
            )}
          </div>

          {/* Root Cause */}
          <div>
            <span className="text-[10px] text-[#A7AFBF] uppercase font-mono font-medium block mb-1">
              Diagnosed Root Cause
            </span>
            <div className="bg-[#151820] p-3 rounded-lg border border-[#272B36] text-[#F8FAFC] leading-relaxed font-medium text-[11px]">
              {event.rootCause || 'Root cause identified'}
            </div>
          </div>

          {/* Evidence List */}
          {evidenceList.length > 0 && (
            <div>
              <span className="text-[10px] text-[#A7AFBF] uppercase font-mono font-medium block mb-1">
                Supporting Evidence ({evidenceList.length})
              </span>
              <ul className="space-y-1.5 bg-[#151820] p-3 rounded-lg border border-[#272B36]">
                {evidenceList.map((item, idx) => (
                  <li key={idx} className="flex items-start space-x-2 text-[#A7AFBF] text-[11px]">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#7C73FF] flex-shrink-0 mt-0.5" />
                    <span className="leading-snug text-[#F8FAFC]">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="pt-2 border-t border-[#272B36] flex items-center justify-between text-[11px] text-[#6B7280] italic">
            <span>AI recommendation — advisory only. Not authorized to act independently.</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default DiagnosisPanel;

import React from 'react';
import { Sparkles, Brain, CheckCircle, HelpCircle, ArrowRight } from 'lucide-react';

export function DiagnosisPanel({ event }) {
  if (!event) return null;

  const hasDiagnosis = Boolean(event.rootCause || event.recommendedAction);
  const confidence = typeof event.confidence === 'number' ? Math.round(event.confidence * 100) : null;
  const action = event.recommendedAction || 'escalate';
  const evidenceList = Array.isArray(event.evidence) ? event.evidence : [];

  const actionColors = {
    retry: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    send_link: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    escalate: 'bg-amber-500/10 text-amber-400 border-amber-500/30'
  };

  return (
    <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-700/60">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Brain className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide">
              AI Diagnosis
            </h3>
            <span className="text-[10px] text-slate-400">Groq LLama 3.3 70B &bull; Advisory Only</span>
          </div>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-700/60 text-slate-400 border border-slate-600/40">
          PROPOSAL LAYER
        </span>
      </div>

      {!hasDiagnosis ? (
        <div className="py-8 text-center text-slate-400 text-xs flex flex-col items-center justify-center space-y-2">
          <Sparkles className="h-6 w-6 text-indigo-400 animate-spin" />
          <span>AI diagnosis in progress...</span>
        </div>
      ) : (
        <div className="space-y-4 text-xs">
          {/* Action & Confidence Header */}
          <div className="flex items-center justify-between bg-slate-900/60 p-3 rounded-lg border border-slate-700/40">
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-0.5">
                Proposed Recovery Action
              </span>
              <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider border font-mono ${actionColors[action] || actionColors.escalate}`}>
                {action.replace('_', ' ')}
              </span>
            </div>

            {confidence !== null && (
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-0.5">
                  AI Confidence
                </span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-slate-700 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-indigo-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${confidence}%` }}
                    />
                  </div>
                  <span className="font-bold text-slate-200 font-mono">{confidence}%</span>
                </div>
              </div>
            )}
          </div>

          {/* Root Cause */}
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
              Diagnosed Root Cause
            </span>
            <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-700/40 text-slate-200 leading-relaxed font-medium">
              {event.rootCause || 'Root cause identified'}
            </div>
          </div>

          {/* Evidence List */}
          {evidenceList.length > 0 && (
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
                Supporting Evidence ({evidenceList.length})
              </span>
              <ul className="space-y-1.5 bg-slate-900/40 p-3 rounded-lg border border-slate-700/40">
                {evidenceList.map((item, idx) => (
                  <li key={idx} className="flex items-start space-x-2 text-slate-300">
                    <CheckCircle className="h-3.5 w-3.5 text-indigo-400 flex-shrink-0 mt-0.5" />
                    <span className="leading-snug">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="pt-2 border-t border-slate-700/40 flex items-center justify-between text-[10px] text-slate-400 italic">
            <span>AI recommendation — advisory only. Not authorized to act independently.</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default DiagnosisPanel;

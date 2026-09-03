import React from 'react';
import { MessageSquare, Send, Smartphone, Mail, MessageCircle, AlertCircle } from 'lucide-react';

export function RecoveryMessagePanel({ event }) {
  if (!event) return null;

  const hasMessage = Boolean(event.recoveryMessage);
  const channel = event.messageChannel || 'sms';
  const tone = event.messageTone || 'professional';
  const action = event.messageAction || event.recommendedAction || 'retry';
  const message = event.recoveryMessage || '';

  const ChannelIcon = channel === 'email' ? Mail : channel === 'whatsapp' ? MessageCircle : Smartphone;

  return (
    <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-700/60">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <MessageSquare className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide">
              Recovery Message
            </h3>
            <span className="text-[10px] text-slate-400">Customer Outreach Proposal</span>
          </div>
        </div>
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-amber-400 border border-amber-500/30">
          SIMULATION &bull; NOT SENT
        </span>
      </div>

      {!hasMessage ? (
        <div className="py-8 text-center text-slate-400 text-xs flex flex-col items-center justify-center space-y-2">
          <MessageSquare className="h-6 w-6 text-slate-500 animate-pulse" />
          <span>Generating recovery proposal...</span>
        </div>
      ) : (
        <div className="space-y-4 text-xs">
          {/* Metadata Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-slate-900/60 border border-slate-700/50 text-slate-300">
              <ChannelIcon className="h-3.5 w-3.5 text-indigo-400" />
              <span className="font-mono text-[11px] font-semibold uppercase">{channel}</span>
            </div>
            <div className="px-2.5 py-1 rounded bg-slate-900/60 border border-slate-700/50 text-slate-300">
              <span className="text-slate-400 text-[10px] mr-1">Tone:</span>
              <span className="font-medium capitalize">{tone}</span>
            </div>
            <div className="px-2.5 py-1 rounded bg-slate-900/60 border border-slate-700/50 text-slate-300">
              <span className="text-slate-400 text-[10px] mr-1">Action:</span>
              <span className="font-mono text-indigo-300 uppercase font-semibold">{action}</span>
            </div>
          </div>

          {/* Message Preview Box */}
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
              Proposed Message Content
            </span>
            <div className="relative bg-slate-900/80 p-4 rounded-lg border border-slate-700/60 text-slate-200 leading-relaxed font-sans shadow-inner">
              <div className="text-sm font-normal">
                "{message}"
              </div>
            </div>
          </div>

          {/* Compliance notice */}
          <div className="p-2.5 rounded-lg bg-indigo-950/30 border border-indigo-500/20 text-[11px] text-indigo-300 flex items-start space-x-2">
            <AlertCircle className="h-4 w-4 text-indigo-400 flex-shrink-0 mt-0.5" />
            <span>
              This proposal must receive deterministic Policy Guard clearance before any customer notification can be dispatched.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default RecoveryMessagePanel;

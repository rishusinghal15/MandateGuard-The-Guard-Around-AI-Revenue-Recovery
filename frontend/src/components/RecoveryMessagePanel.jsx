import React from 'react';
import { MessageSquare, Smartphone, Mail, MessageCircle, AlertCircle } from 'lucide-react';

export function RecoveryMessagePanel({ event }) {
  if (!event) return null;

  const hasMessage = Boolean(event.recoveryMessage);
  const channel = event.messageChannel || 'sms';
  const tone = event.messageTone || 'professional';
  const action = event.messageAction || event.recommendedAction || 'retry';
  const message = event.recoveryMessage || '';

  const ChannelIcon = channel === 'email' ? Mail : channel === 'whatsapp' ? MessageCircle : Smartphone;

  return (
    <div className="bg-[#0F1117] border border-[#272B36] rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#272B36]">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-indigo-950/60 text-[#7C73FF] border border-indigo-800/40">
            <MessageSquare className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wide">
              Recovery Message
            </h3>
            <span className="text-[11px] text-[#A7AFBF] font-mono">Customer Outreach Proposal</span>
          </div>
        </div>
        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-950/40 text-amber-300 border border-amber-800/60">
          SIMULATION &bull; NOT SENT
        </span>
      </div>

      {!hasMessage ? (
        <div className="py-8 text-center text-[#A7AFBF] text-xs flex flex-col items-center justify-center space-y-2">
          <MessageSquare className="h-5 w-5 text-[#6B7280] animate-pulse" />
          <span>Generating recovery proposal...</span>
        </div>
      ) : (
        <div className="space-y-3.5 text-xs">
          {/* Metadata Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-[#151820] border border-[#272B36] text-[#F8FAFC]">
              <ChannelIcon className="h-3.5 w-3.5 text-[#7C73FF]" />
              <span className="font-mono text-[10px] font-bold uppercase">{channel}</span>
            </div>
            <div className="px-2.5 py-1 rounded-md bg-[#151820] border border-[#272B36] text-[#A7AFBF] font-mono text-[10px]">
              <span className="text-[#6B7280] mr-1">TONE:</span>
              <span className="font-bold capitalize text-white">{tone}</span>
            </div>
            <div className="px-2.5 py-1 rounded-md bg-[#151820] border border-[#272B36] text-[#A7AFBF] font-mono text-[10px]">
              <span className="text-[#6B7280] mr-1">ACTION:</span>
              <span className="font-bold text-[#7C73FF] uppercase">{action}</span>
            </div>
          </div>

          {/* Message Preview Box */}
          <div>
            <span className="text-[10px] text-[#A7AFBF] uppercase font-mono font-medium block mb-1">
              Proposed Message Preview
            </span>
            <div className="bg-[#151820] p-4 rounded-xl border border-[#272B36] text-[#F8FAFC] leading-relaxed font-sans shadow-2xs">
              <div className="text-xs">
                "{message}"
              </div>
            </div>
          </div>

          {/* Compliance notice */}
          <div className="p-3 rounded-lg bg-indigo-950/40 border border-indigo-800/60 text-[11px] text-indigo-200 flex items-start space-x-2">
            <AlertCircle className="h-4 w-4 text-[#7C73FF] flex-shrink-0 mt-0.5" />
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

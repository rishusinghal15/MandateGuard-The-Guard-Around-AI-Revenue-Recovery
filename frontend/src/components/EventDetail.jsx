import React from 'react';
import { PipelineStatus } from './PipelineStatus';
import { DecisionBanner } from './DecisionBanner';
import { DiagnosisPanel } from './DiagnosisPanel';
import { RecoveryMessagePanel } from './RecoveryMessagePanel';
import { Clock, User, AlertOctagon } from 'lucide-react';

function formatINR(amount) {
  if (typeof amount !== 'number' || isNaN(amount)) return '₹0.00';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(amount);
}

function formatEventType(type) {
  switch (type) {
    case 'payment_failed':
      return 'Payment Failed';
    case 'subscription_failed':
      return 'Subscription Failed';
    case 'cart_abandoned':
      return 'Cart Abandoned';
    default:
      return type || 'Event';
  }
}

export function EventDetail({ event, onSimulationComplete }) {
  if (!event) {
    return (
      <div className="bg-[#0F1117] border border-[#272B36] rounded-xl p-10 text-center text-[#A7AFBF] flex flex-col items-center justify-center space-y-3 shadow-sm min-h-[400px]">
        <div className="p-3 rounded-xl bg-[#151820] border border-[#272B36]">
          <AlertOctagon className="h-8 w-8 text-[#6B7280]" />
        </div>
        <h3 className="text-sm font-semibold text-white">No Event Selected</h3>
        <p className="text-xs max-w-sm text-[#A7AFBF] leading-relaxed">
          Select a transaction failure from the Live Recovery Stream on the left to inspect its real-time AI diagnosis, proposed recovery message, and deterministic policy authorization.
        </p>
      </div>
    );
  }

  const formattedAmount = formatINR(
    typeof event.amount === 'number' ? event.amount : Number(event.amount) || 0
  );

  return (
    <div className="space-y-4">
      {/* 1. Selected Event Context Bar */}
      <div className="bg-[#0F1117] border border-[#272B36] rounded-xl p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#272B36]">
          <div>
            <div className="flex items-center space-x-2.5">
              <span className="text-xs font-mono font-bold text-[#7C73FF] bg-[#635BFF]/15 px-2.5 py-1 rounded border border-[#635BFF]/30">
                {event.eventId}
              </span>
              <span className="text-sm font-bold text-white">
                {formatEventType(event.eventType)}
              </span>
            </div>
            <div className="flex items-center space-x-4 mt-2 text-xs text-[#A7AFBF]">
              <div className="flex items-center space-x-1.5">
                <User className="h-3.5 w-3.5 text-[#6B7280]" />
                <span>Customer: <strong className="text-white font-mono">{event.customerId}</strong></span>
              </div>
              <div className="flex items-center space-x-1.5">
                <Clock className="h-3.5 w-3.5 text-[#6B7280]" />
                <span className="font-mono">{new Date(event.timestamp).toLocaleTimeString()}</span>
              </div>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[10px] text-[#A7AFBF] uppercase tracking-wider block font-mono font-medium">
              Transaction Value
            </span>
            <div className="text-2xl font-extrabold text-white tracking-tight font-sans">
              {formattedAmount}
            </div>
            <span className="text-[11px] text-rose-400 font-medium">
              Reason: {event.failureReason}
            </span>
          </div>
        </div>

        {/* 4-Stage Security Pipeline Visualization */}
        <div className="mt-3">
          <PipelineStatus event={event} />
        </div>
      </div>

      {/* 2. Hero Decision Banner & Simulation Execution */}
      <DecisionBanner event={event} onSimulationComplete={onSimulationComplete} />

      {/* 3. AI Diagnosis Panel */}
      <DiagnosisPanel event={event} />

      {/* 4. Customer Recovery Message Proposal */}
      <RecoveryMessagePanel event={event} />
    </div>
  );
}

export default EventDetail;

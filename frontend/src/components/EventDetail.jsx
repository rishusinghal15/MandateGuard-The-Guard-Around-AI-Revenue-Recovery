import React, { useState } from 'react';
import { PipelineStatus } from './PipelineStatus';
import { DecisionBanner } from './DecisionBanner';
import { DiagnosisPanel } from './DiagnosisPanel';
import { RecoveryMessagePanel } from './RecoveryMessagePanel';
import { PolicyGuardPanel } from './PolicyGuardPanel';
import { RecoveryComparison } from './RecoveryComparison';
import { AuditTrail } from './AuditTrail';
import { Clock, CreditCard, User, AlertOctagon, HelpCircle } from 'lucide-react';

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

export function EventDetail({ event }) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  if (!event) {
    return (
      <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-12 text-center text-slate-400 flex flex-col items-center justify-center space-y-3">
        <AlertOctagon className="h-10 w-10 text-slate-600" />
        <h3 className="text-base font-semibold text-slate-300">No Event Selected</h3>
        <p className="text-xs max-w-sm text-slate-400">
          Select an event from the live feed on the left to inspect its real-time AI diagnosis, proposed recovery message, deterministic policy authorization, safety comparison, and immutable audit trail.
        </p>
      </div>
    );
  }

  const formattedAmount = formatINR(
    typeof event.amount === 'number' ? event.amount : Number(event.amount) || 0
  );

  const handleSimulationComplete = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="space-y-5">
      {/* Selected Event Context Bar */}
      <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-700/60">
          <div>
            <div className="flex items-center space-x-2.5">
              <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded border border-indigo-500/20">
                {event.eventId}
              </span>
              <span className="text-sm font-semibold text-slate-200">
                {formatEventType(event.eventType)}
              </span>
            </div>
            <div className="flex items-center space-x-4 mt-2 text-xs text-slate-400">
              <div className="flex items-center space-x-1.5">
                <User className="h-3.5 w-3.5 text-slate-500" />
                <span>Customer: <strong className="text-slate-300 font-mono">{event.customerId}</strong></span>
              </div>
              <div className="flex items-center space-x-1.5">
                <Clock className="h-3.5 w-3.5 text-slate-500" />
                <span>{new Date(event.timestamp).toLocaleTimeString()}</span>
              </div>
            </div>
          </div>

          <div className="text-left md:text-right">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
              Transaction Value
            </span>
            <div className="text-2xl font-bold text-slate-100 tracking-tight font-mono">
              {formattedAmount}
            </div>
            <span className="text-[11px] text-rose-400 font-medium">
              Reason: {event.failureReason}
            </span>
          </div>
        </div>

        {/* Pipeline Stage Visualization */}
        <div className="mt-4">
          <PipelineStatus event={event} />
        </div>
      </div>

      {/* Hero Decision Banner */}
      <DecisionBanner event={event} onSimulationComplete={handleSimulationComplete} />

      {/* 2-Column Responsive Operational Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left Column: AI Diagnosis + Message Proposal */}
        <div className="space-y-5">
          <DiagnosisPanel event={event} />
          <RecoveryMessagePanel event={event} />
        </div>

        {/* Right Column: Deterministic Policy Guard */}
        <div>
          <PolicyGuardPanel event={event} />
        </div>
      </div>

      {/* AI Safety Comparison: Naive AI vs MandateGuard Policy Guard */}
      <div>
        <RecoveryComparison event={event} />
      </div>

      {/* Persistent Audit Trail Timeline */}
      <div>
        <AuditTrail eventId={event.eventId} refreshTrigger={refreshTrigger} />
      </div>
    </div>
  );
}

export default EventDetail;

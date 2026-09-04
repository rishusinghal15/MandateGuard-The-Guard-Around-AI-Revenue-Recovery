import React from 'react';
import { CreditCard, RefreshCw, ShoppingCart, AlertCircle, ChevronRight, Sparkles } from 'lucide-react';

function formatINR(amount) {
  if (typeof amount !== 'number' || isNaN(amount)) return '₹0.00';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(amount);
}

function getEventTypeBadge(type) {
  switch (type) {
    case 'payment_failed':
      return {
        label: 'Payment Failed',
        icon: CreditCard,
        color: 'text-rose-300 bg-rose-950/40 border-rose-800/60'
      };
    case 'subscription_failed':
      return {
        label: 'Subscription Failed',
        icon: RefreshCw,
        color: 'text-amber-300 bg-amber-950/40 border-amber-800/60'
      };
    case 'cart_abandoned':
      return {
        label: 'Cart Abandoned',
        icon: ShoppingCart,
        color: 'text-indigo-300 bg-indigo-950/40 border-indigo-800/60'
      };
    default:
      return {
        label: type || 'Event',
        icon: AlertCircle,
        color: 'text-slate-300 bg-slate-800/60 border-slate-700'
      };
  }
}

function getStatusBadge(status, policyDecision) {
  if (status === 'checked' || policyDecision) {
    if (policyDecision === 'allow') {
      return (
        <span className="px-2 py-0.5 text-[10px] font-bold font-mono rounded bg-emerald-950/40 text-emerald-300 border border-emerald-800/60">
          AUTHORIZED
        </span>
      );
    }
    if (policyDecision === 'block') {
      return (
        <span className="px-2 py-0.5 text-[10px] font-bold font-mono rounded bg-rose-950/40 text-rose-300 border border-rose-800/60">
          BLOCKED
        </span>
      );
    }
    if (policyDecision === 'escalate') {
      return (
        <span className="px-2 py-0.5 text-[10px] font-bold font-mono rounded bg-amber-950/40 text-amber-300 border border-amber-800/60">
          ESCALATED
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 text-[10px] font-bold font-mono rounded bg-indigo-950/40 text-indigo-300 border border-indigo-800/60">
        CHECKED
      </span>
    );
  }

  if (status === 'diagnosed') {
    return (
      <span className="px-2 py-0.5 text-[10px] font-bold font-mono rounded bg-indigo-950/40 text-indigo-300 border border-indigo-800/60 flex items-center space-x-1">
        <Sparkles className="h-2.5 w-2.5 animate-spin text-[#7C73FF]" />
        <span>DIAGNOSED</span>
      </span>
    );
  }

  return (
    <span className="px-2 py-0.5 text-[10px] font-bold font-mono rounded bg-[#191C24] text-[#A7AFBF] border border-[#272B36]">
      NEW
    </span>
  );
}

export function LiveEventFeed({ events, selectedEventId, onSelectEvent }) {
  return (
    <div className="bg-[#0F1117] border border-[#272B36] rounded-xl flex flex-col h-full shadow-sm min-h-0">
      {/* Feed Header */}
      <div className="p-3.5 sm:p-4 border-b border-[#272B36] flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-2">
          <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <h2 className="text-xs font-bold text-white uppercase tracking-wide">
            Live Recovery Stream
          </h2>
        </div>
        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#151820] text-[#A7AFBF] border border-[#272B36]">
          {events.length} events
        </span>
      </div>

      {/* Event List: Naturally fills vertical height with flex-1 min-h-0 */}
      <div className="p-2.5 sm:p-3 space-y-2 overflow-y-auto flex-1 min-h-0">
        {events.length === 0 ? (
          <div className="py-16 text-center text-[#A7AFBF] text-xs flex flex-col items-center justify-center space-y-3">
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#635BFF]"></span>
            </div>
            <p className="text-white font-semibold text-xs">Waiting for live failure events...</p>
            <p className="text-[11px] text-[#6B7280] max-w-xs">
              Simulator streams realistic transaction failures asynchronously.
            </p>
          </div>
        ) : (
          events.map((event) => {
            const isSelected = event.eventId === selectedEventId;
            const badge = getEventTypeBadge(event.eventType);
            const Icon = badge.icon;
            const formattedAmount = formatINR(
              typeof event.amount === 'number' ? event.amount : Number(event.amount) || 0
            );

            return (
              <div
                key={event.eventId}
                onClick={() => onSelectEvent && onSelectEvent(event.eventId)}
                className={`p-2.5 sm:p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-[#635BFF]/15 border-[#635BFF] shadow-sm ring-1 ring-[#635BFF]/40'
                    : 'bg-[#151820] border-[#272B36] hover:border-slate-600 hover:bg-[#191C24]'
                }`}
              >
                {/* Row 1: Type badge, status badge, amount */}
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className={`inline-flex items-center space-x-1.5 px-2 py-0.5 rounded text-[10px] font-medium border ${badge.color} flex-shrink-0`}>
                    <Icon className="h-3 w-3" />
                    <span>{badge.label}</span>
                  </span>
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    {getStatusBadge(event.policyDecision ? 'checked' : event.status, event.policyDecision)}
                    <span className="font-bold text-white font-sans text-xs whitespace-nowrap tracking-tight">
                      {formattedAmount}
                    </span>
                  </div>
                </div>

                {/* Row 2: Event ID, customer, timestamp */}
                <div className="flex items-center justify-between text-[11px] text-[#A7AFBF] mt-1">
                  <span className="font-mono text-[#7C73FF] truncate max-w-[150px] font-semibold">
                    {event.eventId}
                  </span>
                  <span className="truncate max-w-[110px] text-[#A7AFBF] font-mono text-[10px]">
                    {event.customerId}
                  </span>
                  <span className="text-[#6B7280] text-[10px] font-mono whitespace-nowrap">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </span>
                </div>

                {/* Row 3: Failure reason & Selection chevron */}
                <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-[#272B36] text-[11px]">
                  <span className="text-[#A7AFBF] truncate max-w-[270px]">
                    Reason: <span className="text-[#F8FAFC] font-medium">{event.failureReason}</span>
                  </span>
                  <ChevronRight className={`h-3.5 w-3.5 flex-shrink-0 ${isSelected ? 'text-[#7C73FF]' : 'text-[#6B7280]'}`} />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default LiveEventFeed;

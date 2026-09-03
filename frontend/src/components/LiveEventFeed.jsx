import React from 'react';
import { CreditCard, RefreshCw, ShoppingCart, AlertCircle, Clock, ChevronRight, CheckCircle2, ShieldAlert, Sparkles } from 'lucide-react';

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
        color: 'text-rose-400 bg-rose-500/10 border-rose-500/20'
      };
    case 'subscription_failed':
      return {
        label: 'Subscription Failed',
        icon: RefreshCw,
        color: 'text-amber-400 bg-amber-500/10 border-amber-500/20'
      };
    case 'cart_abandoned':
      return {
        label: 'Cart Abandoned',
        icon: ShoppingCart,
        color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20'
      };
    default:
      return {
        label: type || 'Event',
        icon: AlertCircle,
        color: 'text-slate-400 bg-slate-500/10 border-slate-500/20'
      };
  }
}

function getStatusBadge(status, policyDecision) {
  if (status === 'checked' || policyDecision) {
    if (policyDecision === 'allow') {
      return (
        <span className="px-2 py-0.5 text-[10px] font-bold font-mono rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
          AUTHORIZED
        </span>
      );
    }
    if (policyDecision === 'block') {
      return (
        <span className="px-2 py-0.5 text-[10px] font-bold font-mono rounded bg-rose-500/10 text-rose-400 border border-rose-500/30">
          BLOCKED
        </span>
      );
    }
    if (policyDecision === 'escalate') {
      return (
        <span className="px-2 py-0.5 text-[10px] font-bold font-mono rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
          ESCALATED
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 text-[10px] font-bold font-mono rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
        CHECKED
      </span>
    );
  }

  if (status === 'diagnosed') {
    return (
      <span className="px-2 py-0.5 text-[10px] font-bold font-mono rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 flex items-center space-x-1">
        <Sparkles className="h-2.5 w-2.5 animate-spin" />
        <span>DIAGNOSED</span>
      </span>
    );
  }

  return (
    <span className="px-2 py-0.5 text-[10px] font-bold font-mono rounded bg-slate-700/60 text-slate-300 border border-slate-600">
      NEW
    </span>
  );
}

export function LiveEventFeed({ events, selectedEventId, onSelectEvent }) {
  return (
    <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl flex flex-col h-full shadow-sm">
      {/* Feed Header */}
      <div className="p-4 border-b border-slate-700/60 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wide">
            Live Recovery Stream
          </h2>
          <p className="text-[11px] text-slate-400">
            Real-time event feed &bull; Click to focus
          </p>
        </div>
        <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-700">
          {events.length} events
        </span>
      </div>

      {/* Event List */}
      <div className="p-3 space-y-2.5 overflow-y-auto max-h-[750px] flex-1">
        {events.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs flex flex-col items-center justify-center space-y-3">
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
            </div>
            <p className="text-slate-300 font-medium">Waiting for live recovery events...</p>
            <p className="text-[11px] text-slate-500 max-w-xs">
              Simulator creates realistic transaction failures asynchronously.
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
                className={`p-3.5 rounded-lg border text-xs cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-slate-700/80 border-indigo-500 shadow-md shadow-indigo-950/40 ring-1 ring-indigo-500/50'
                    : 'bg-slate-900/40 border-slate-700/40 hover:bg-slate-800/70 hover:border-slate-600'
                }`}
              >
                {/* Row 1: Type badge, status badge, amount */}
                <div className="flex items-center justify-between mb-2">
                  <span className={`inline-flex items-center space-x-1.5 px-2 py-0.5 rounded text-[11px] font-medium border ${badge.color}`}>
                    <Icon className="h-3 w-3" />
                    <span>{badge.label}</span>
                  </span>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(event.status, event.policyDecision)}
                    <span className="font-bold text-slate-100 font-mono">
                      {formattedAmount}
                    </span>
                  </div>
                </div>

                {/* Row 2: Event ID, customer, timestamp */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                  <span className="font-mono text-indigo-400 truncate max-w-[140px]">
                    {event.eventId}
                  </span>
                  <span className="truncate max-w-[100px] text-slate-400">
                    {event.customerId}
                  </span>
                  <span className="text-slate-500 text-[10px]">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </span>
                </div>

                {/* Row 3: Failure reason & Selection chevron */}
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800 text-[11px]">
                  <span className="text-slate-400 truncate max-w-[200px]">
                    Reason: <span className="text-slate-300">{event.failureReason}</span>
                  </span>
                  <ChevronRight className={`h-3.5 w-3.5 ${isSelected ? 'text-indigo-400' : 'text-slate-600'}`} />
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

import React, { useState } from 'react';
import { Layers, CreditCard, RefreshCw, ShoppingCart, ArrowUpRight, Filter, ShieldCheck, ShieldAlert, AlertTriangle } from 'lucide-react';

function formatINR(amount) {
  if (typeof amount !== 'number' || isNaN(amount)) return '₹0.00';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(amount);
}

export function RecoveryOpsView({ events = [], onSelectEvent, onNavigate }) {
  const [filterType, setFilterType] = useState('all');

  const filteredEvents = events.filter((e) => {
    if (filterType === 'all') return true;
    if (filterType === 'payment_failed') return e.eventType === 'payment_failed';
    if (filterType === 'subscription_failed') return e.eventType === 'subscription_failed';
    if (filterType === 'cart_abandoned') return e.eventType === 'cart_abandoned';
    if (filterType === 'blocked') return e.policyDecision === 'block';
    if (filterType === 'allowed') return e.policyDecision === 'allow';
    return true;
  });

  const handleInspect = (eventId) => {
    if (onSelectEvent) onSelectEvent(eventId);
    if (onNavigate) onNavigate('command_center');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#0F1117] border border-[#272B36] rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-indigo-950/60 text-[#7C73FF] border border-indigo-800/40">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wide">
                Recovery Operations
              </h2>
              <p className="text-xs text-[#A7AFBF]">
                Live operational queue &bull; Active recovery pipeline triage
              </p>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {[
              { id: 'all', label: `All (${events.length})` },
              { id: 'payment_failed', label: 'Payments' },
              { id: 'subscription_failed', label: 'Subscriptions' },
              { id: 'cart_abandoned', label: 'Carts' },
              { id: 'blocked', label: 'Blocked' },
              { id: 'allowed', label: 'Allowed' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer text-xs ${
                  filterType === tab.id
                    ? 'bg-[#635BFF] text-white font-semibold border border-[#7C73FF]/40 shadow-xs'
                    : 'bg-[#151820] text-[#A7AFBF] hover:text-white hover:bg-[#191C24] border border-[#272B36]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Queue Table */}
      <div className="bg-[#0F1117] border border-[#272B36] rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-[#272B36] flex items-center justify-between bg-[#151820]/70">
          <span className="text-xs font-bold text-white uppercase tracking-wide">
            Active Failure Pipeline ({filteredEvents.length} transactions)
          </span>
          <span className="text-[11px] text-[#A7AFBF] font-mono font-medium">
            CURRENT SESSION &bull; REAL DATA
          </span>
        </div>

        {filteredEvents.length === 0 ? (
          <div className="p-12 text-center text-[#6B7280] text-xs">
            No events match the selected operational filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#151820] text-[#A7AFBF] border-b border-[#272B36] text-[11px] uppercase tracking-wider font-mono font-medium">
                <tr>
                  <th className="py-3 px-4">Event ID</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Policy Decision</th>
                  <th className="py-3 px-4">AI Recommended</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#272B36] text-[#F8FAFC]">
                {filteredEvents.map((evt) => {
                  const decision = evt.policyDecision;
                  const amt = typeof evt.amount === 'number' ? evt.amount : Number(evt.amount) || 0;

                  return (
                    <tr key={evt.eventId} className="hover:bg-[#191C24] transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#7C73FF]">
                        {evt.eventId}
                      </td>
                      <td className="py-3.5 px-4 font-medium capitalize text-white">
                        {evt.eventType.replace('_', ' ')}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[#A7AFBF]">
                        {evt.customerId}
                      </td>
                      <td className="py-3.5 px-4 font-sans font-bold text-white">
                        {formatINR(amt)}
                      </td>
                      <td className="py-3.5 px-4">
                        {decision === 'allow' ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950/40 text-emerald-300 border border-emerald-800/60">
                            AUTHORIZED
                          </span>
                        ) : decision === 'block' ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-950/40 text-rose-300 border border-rose-800/60">
                            BLOCKED
                          </span>
                        ) : decision === 'escalate' ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950/40 text-amber-300 border border-amber-800/60">
                            MANUAL REVIEW
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono text-[#A7AFBF] bg-[#191C24] border border-[#272B36]">
                            PENDING
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono uppercase text-[#7C73FF] font-semibold">
                        {evt.recommendedAction || evt.messageAction || '—'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleInspect(evt.eventId)}
                          className="inline-flex items-center space-x-1 px-2.5 py-1 bg-[#635BFF]/15 hover:bg-[#635BFF]/25 text-[#7C73FF] border border-[#635BFF]/30 rounded-md text-xs font-semibold transition-colors cursor-pointer"
                        >
                          <span>Inspect</span>
                          <ArrowUpRight className="h-3 w-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default RecoveryOpsView;

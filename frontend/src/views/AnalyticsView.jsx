import React from 'react';
import { BarChart3, TrendingUp, AlertTriangle, ShieldCheck, ShieldAlert, CheckCircle2, RefreshCw, CreditCard, ShoppingCart } from 'lucide-react';

function formatINR(amount) {
  if (typeof amount !== 'number' || isNaN(amount)) return '₹0.00';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(amount);
}

export function AnalyticsView({ events = [], metrics = {} }) {
  const {
    revenueAtRisk = 0,
    recoveryOpportunities = 0,
    passRate = null,
    blockedCount = 0,
    allowedCount = 0,
    escalatedCount = 0,
    totalEvents = 0
  } = metrics;

  // Breakdown by event types
  let paymentFailedCount = 0;
  let subscriptionFailedCount = 0;
  let cartAbandonedCount = 0;
  let paymentFailedVolume = 0;
  let subscriptionFailedVolume = 0;
  let cartAbandonedVolume = 0;

  for (const evt of events) {
    const amt = typeof evt.amount === 'number' ? evt.amount : Number(evt.amount) || 0;
    if (evt.eventType === 'payment_failed') {
      paymentFailedCount += 1;
      paymentFailedVolume += amt;
    } else if (evt.eventType === 'subscription_failed') {
      subscriptionFailedCount += 1;
      subscriptionFailedVolume += amt;
    } else if (evt.eventType === 'cart_abandoned') {
      cartAbandonedCount += 1;
      cartAbandonedVolume += amt;
    }
  }

  const decidedTotal = (allowedCount || 0) + (blockedCount || 0) + (escalatedCount || 0);

  return (
    <div className="space-y-6">
      {/* Analytics Header */}
      <div className="bg-[#0F1117] border border-[#272B36] rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-indigo-950/60 text-[#7C73FF] border border-indigo-800/40">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-sm font-bold text-white uppercase tracking-wide">
                  Session Analytics & Telemetry
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-950/40 text-indigo-300 border border-indigo-800/60">
                  REAL SESSION DATA
                </span>
              </div>
              <p className="text-xs text-[#A7AFBF]">
                Ground-truth metrics computed dynamically from active runtime events
              </p>
            </div>
          </div>

          <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-[#151820] border border-[#272B36] text-[#A7AFBF] font-semibold">
            {totalEvents} Ingested Events Analyzed
          </span>
        </div>
      </div>

      {/* Top Telemetry KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0F1117] border border-[#272B36] rounded-xl p-5 shadow-sm">
          <span className="text-[11px] font-bold text-[#A7AFBF] uppercase font-mono tracking-wider block mb-1">
            Total Revenue at Risk
          </span>
          <div className="text-2xl font-extrabold text-white font-sans tracking-tight">
            {formatINR(revenueAtRisk)}
          </div>
          <span className="text-[11px] text-[#6B7280] font-mono mt-1.5 block">
            Aggregated failed transaction value
          </span>
        </div>

        <div className="bg-[#0F1117] border border-[#272B36] rounded-xl p-5 shadow-sm">
          <span className="text-[11px] font-bold text-[#A7AFBF] uppercase font-mono tracking-wider block mb-1">
            Policy Pass Rate
          </span>
          <div className="text-2xl font-extrabold text-emerald-400 font-sans tracking-tight">
            {passRate !== null ? `${passRate}%` : '—'}
          </div>
          <span className="text-[11px] text-[#6B7280] font-mono mt-1.5 block">
            {allowedCount} of {decidedTotal} decisions authorized
          </span>
        </div>

        <div className="bg-[#0F1117] border border-[#272B36] rounded-xl p-5 shadow-sm">
          <span className="text-[11px] font-bold text-[#A7AFBF] uppercase font-mono tracking-wider block mb-1">
            Safety Interceptions
          </span>
          <div className="text-2xl font-extrabold text-rose-400 font-sans tracking-tight">
            {blockedCount}
          </div>
          <span className="text-[11px] text-[#6B7280] font-mono mt-1.5 block">
            Unsafe AI proposals halted
          </span>
        </div>

        <div className="bg-[#0F1117] border border-[#272B36] rounded-xl p-5 shadow-sm">
          <span className="text-[11px] font-bold text-[#A7AFBF] uppercase font-mono tracking-wider block mb-1">
            Manual Escalations
          </span>
          <div className="text-2xl font-extrabold text-amber-400 font-sans tracking-tight">
            {escalatedCount}
          </div>
          <span className="text-[11px] text-[#6B7280] font-mono mt-1.5 block">
            Metadata gaps routed to human review
          </span>
        </div>
      </div>

      {/* Failure Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Payments */}
        <div className="bg-[#0F1117] border border-[#272B36] rounded-xl p-5 space-y-3 shadow-sm">
          <div className="flex items-center space-x-2 text-rose-400">
            <CreditCard className="h-4 w-4" />
            <span className="font-bold text-xs uppercase tracking-wider text-white">
              Payment Failures
            </span>
          </div>
          <div className="text-xl font-extrabold font-sans tracking-tight text-white">
            {formatINR(paymentFailedVolume)}
          </div>
          <div className="text-xs text-[#A7AFBF] font-mono">
            {paymentFailedCount} transactions ({totalEvents > 0 ? Math.round((paymentFailedCount / totalEvents) * 100) : 0}%)
          </div>
        </div>

        {/* Subscriptions */}
        <div className="bg-[#0F1117] border border-[#272B36] rounded-xl p-5 space-y-3 shadow-sm">
          <div className="flex items-center space-x-2 text-amber-400">
            <RefreshCw className="h-4 w-4" />
            <span className="font-bold text-xs uppercase tracking-wider text-white">
              Subscription Failures
            </span>
          </div>
          <div className="text-xl font-extrabold font-sans tracking-tight text-white">
            {formatINR(subscriptionFailedVolume)}
          </div>
          <div className="text-xs text-[#A7AFBF] font-mono">
            {subscriptionFailedCount} transactions ({totalEvents > 0 ? Math.round((subscriptionFailedCount / totalEvents) * 100) : 0}%)
          </div>
        </div>

        {/* Cart Abandonments */}
        <div className="bg-[#0F1117] border border-[#272B36] rounded-xl p-5 space-y-3 shadow-sm">
          <div className="flex items-center space-x-2 text-[#7C73FF]">
            <ShoppingCart className="h-4 w-4" />
            <span className="font-bold text-xs uppercase tracking-wider text-white">
              Cart Abandonments
            </span>
          </div>
          <div className="text-xl font-extrabold font-sans tracking-tight text-white">
            {formatINR(cartAbandonedVolume)}
          </div>
          <div className="text-xs text-[#A7AFBF] font-mono">
            {cartAbandonedCount} transactions ({totalEvents > 0 ? Math.round((cartAbandonedCount / totalEvents) * 100) : 0}%)
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsView;

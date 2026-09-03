import React from 'react';
import { AlertTriangle, Sparkles, CheckCircle2, ShieldAlert } from 'lucide-react';

function formatINR(amount) {
  if (typeof amount !== 'number' || isNaN(amount)) return '₹0.00';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(amount);
}

export function MetricCards({ metrics }) {
  const {
    revenueAtRisk = 0,
    recoveryOpportunities = 0,
    passRate = null,
    blockedCount = 0
  } = metrics || {};

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* 1. Revenue at Risk */}
      <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-4 shadow-sm hover:border-slate-600 transition-colors">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Revenue at Risk</span>
          <div className="p-1.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <AlertTriangle className="h-4 w-4" />
          </div>
        </div>
        <div className="text-2xl font-bold text-slate-100 tracking-tight">
          {formatINR(revenueAtRisk)}
        </div>
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-700/40 text-[11px] text-slate-400">
          <span>Failed transaction volume</span>
          <span className="font-mono text-slate-500">SIMULATED</span>
        </div>
      </div>

      {/* 2. Recovery Opportunities */}
      <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-4 shadow-sm hover:border-slate-600 transition-colors">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Recovery Opportunities</span>
          <div className="p-1.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Sparkles className="h-4 w-4" />
          </div>
        </div>
        <div className="text-2xl font-bold text-slate-100 tracking-tight">
          {recoveryOpportunities}
        </div>
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-700/40 text-[11px] text-slate-400">
          <span>Diagnosed recovery actions</span>
          <span className="font-mono text-slate-500">AI PROPOSALS</span>
        </div>
      </div>

      {/* 3. Policy Pass Rate */}
      <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-4 shadow-sm hover:border-slate-600 transition-colors">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Policy Pass Rate</span>
          <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="h-4 w-4" />
          </div>
        </div>
        <div className="text-2xl font-bold text-slate-100 tracking-tight">
          {passRate !== null ? `${passRate}%` : '—'}
        </div>
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-700/40 text-[11px] text-slate-400">
          <span>Guardrail authorization rate</span>
          <span className="font-mono text-slate-500">DETERMINISTIC</span>
        </div>
      </div>

      {/* 4. Actions Blocked */}
      <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-4 shadow-sm hover:border-slate-600 transition-colors">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Actions Blocked</span>
          <div className="p-1.5 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <ShieldAlert className="h-4 w-4" />
          </div>
        </div>
        <div className="text-2xl font-bold text-rose-400 tracking-tight">
          {blockedCount}
        </div>
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-700/40 text-[11px] text-slate-400">
          <span>Safety / policy violations</span>
          <span className="font-mono text-slate-500">ZERO TRUST</span>
        </div>
      </div>
    </div>
  );
}

export default MetricCards;

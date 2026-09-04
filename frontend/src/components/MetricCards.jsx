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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Revenue at Risk */}
      <div className="bg-[#0F1117] border border-[#272B36] rounded-xl p-5 shadow-sm hover:border-slate-700 transition-colors">
        <div className="flex items-center justify-between text-[#A7AFBF] mb-2">
          <span className="text-[11px] font-bold uppercase font-mono tracking-wider">Revenue at Risk</span>
          <div className="p-2 rounded-lg bg-amber-950/40 text-amber-400 border border-amber-800/50">
            <AlertTriangle className="h-4 w-4" />
          </div>
        </div>
        <div className="text-2xl font-extrabold text-[#F8FAFC] font-sans tracking-tight">
          {formatINR(revenueAtRisk)}
        </div>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#272B36] text-[11px] text-[#A7AFBF]">
          <span>Failed transaction volume</span>
          <span className="font-mono text-[10px] text-amber-300 bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-800/50 font-semibold">
            SIMULATED
          </span>
        </div>
      </div>

      {/* 2. Recovery Opportunities */}
      <div className="bg-[#0F1117] border border-[#272B36] rounded-xl p-5 shadow-sm hover:border-slate-700 transition-colors">
        <div className="flex items-center justify-between text-[#A7AFBF] mb-2">
          <span className="text-[11px] font-bold uppercase font-mono tracking-wider">Recovery Opportunities</span>
          <div className="p-2 rounded-lg bg-indigo-950/40 text-[#7C73FF] border border-indigo-800/50">
            <Sparkles className="h-4 w-4" />
          </div>
        </div>
        <div className="text-2xl font-extrabold text-[#F8FAFC] font-sans tracking-tight">
          {recoveryOpportunities}
        </div>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#272B36] text-[11px] text-[#A7AFBF]">
          <span>Diagnosed recovery actions</span>
          <span className="font-mono text-[10px] text-indigo-300 bg-indigo-950/40 px-1.5 py-0.5 rounded border border-indigo-800/50 font-semibold">
            AI PROPOSALS
          </span>
        </div>
      </div>

      {/* 3. Policy Pass Rate */}
      <div className="bg-[#0F1117] border border-[#272B36] rounded-xl p-5 shadow-sm hover:border-slate-700 transition-colors">
        <div className="flex items-center justify-between text-[#A7AFBF] mb-2">
          <span className="text-[11px] font-bold uppercase font-mono tracking-wider">Policy Pass Rate</span>
          <div className="p-2 rounded-lg bg-emerald-950/40 text-emerald-400 border border-emerald-800/50">
            <CheckCircle2 className="h-4 w-4" />
          </div>
        </div>
        <div className="text-2xl font-extrabold text-emerald-400 font-sans tracking-tight">
          {passRate !== null ? `${passRate}%` : '—'}
        </div>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#272B36] text-[11px] text-[#A7AFBF]">
          <span>Guardrail authorization rate</span>
          <span className="font-mono text-[10px] text-emerald-300 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-800/50 font-semibold">
            DETERMINISTIC
          </span>
        </div>
      </div>

      {/* 4. Actions Blocked */}
      <div className="bg-[#0F1117] border border-[#272B36] rounded-xl p-5 shadow-sm hover:border-slate-700 transition-colors">
        <div className="flex items-center justify-between text-[#A7AFBF] mb-2">
          <span className="text-[11px] font-bold uppercase font-mono tracking-wider">Actions Blocked</span>
          <div className="p-2 rounded-lg bg-rose-950/40 text-rose-400 border border-rose-800/50">
            <ShieldAlert className="h-4 w-4" />
          </div>
        </div>
        <div className="text-2xl font-extrabold text-rose-400 font-sans tracking-tight">
          {blockedCount}
        </div>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#272B36] text-[11px] text-[#A7AFBF]">
          <span>Safety violations halted</span>
          <span className="font-mono text-[10px] text-rose-300 bg-rose-950/40 px-1.5 py-0.5 rounded border border-rose-800/50 font-semibold">
            ZERO TRUST
          </span>
        </div>
      </div>
    </div>
  );
}

export default MetricCards;

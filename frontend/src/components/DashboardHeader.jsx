import React from 'react';
import { ShieldCheck, Activity, Wifi, WifiOff } from 'lucide-react';

export function DashboardHeader({ connectionStatus, sessionCount }) {
  const isConnected = connectionStatus === 'connected';
  const isConnecting = connectionStatus === 'connecting';

  return (
    <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 sticky top-0 z-50 backdrop-blur bg-slate-900/90">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Branding */}
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-lg bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-sm shadow-indigo-500/20">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-slate-100 tracking-tight">
                MandateGuard
              </h1>
              <span className="px-2 py-0.5 text-[11px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded">
                COMMAND CENTER
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              AI Revenue Recovery &bull; Deterministic Policy Authorization
            </p>
          </div>
        </div>

        {/* Right: Real-time Indicators & Connection */}
        <div className="flex items-center space-x-3">
          {/* Live Feed Pulse */}
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/60 text-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-semibold text-slate-200 tracking-wide">LIVE STREAM</span>
            <span className="text-slate-500 text-[11px]">({sessionCount} events)</span>
          </div>

          {/* Socket Connection Status */}
          <div className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${
            isConnected
              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400'
              : isConnecting
              ? 'bg-amber-950/40 border-amber-500/30 text-amber-400'
              : 'bg-rose-950/40 border-rose-500/30 text-rose-400'
          }`}>
            {isConnected ? (
              <>
                <Wifi className="h-3.5 w-3.5" />
                <span>CONNECTED</span>
              </>
            ) : isConnecting ? (
              <>
                <Activity className="h-3.5 w-3.5 animate-spin" />
                <span>CONNECTING</span>
              </>
            ) : (
              <>
                <WifiOff className="h-3.5 w-3.5" />
                <span>OFFLINE</span>
              </>
            )}
          </div>

          {/* Simulation Mode Tag */}
          <span className="hidden sm:inline-flex px-2.5 py-1 text-[11px] font-medium bg-slate-800 text-slate-400 border border-slate-700 rounded-md">
            SIMULATED
          </span>
        </div>
      </div>
    </header>
  );
}

export default DashboardHeader;

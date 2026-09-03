import React, { useState } from 'react';
import { Play, ShieldAlert, AlertTriangle, CheckCircle2, Sparkles, Loader2 } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export function DemoControls({ onScenarioTriggered }) {
  const [runningScenario, setRunningScenario] = useState(null);
  const [lastTriggered, setLastTriggered] = useState(null);

  const handleRunScenario = async (scenarioId) => {
    if (runningScenario) return;

    try {
      setRunningScenario(scenarioId);
      const res = await axios.post(`${BACKEND_URL}/api/demo/scenarios/${scenarioId}/run`);
      setLastTriggered(res.data);
      if (onScenarioTriggered && res.data?.eventId) {
        onScenarioTriggered(res.data.eventId);
      }
    } catch (err) {
      console.error(`[DemoControls Error] Failed to trigger scenario "${scenarioId}":`, err.message);
    } finally {
      setRunningScenario(null);
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 mb-6 backdrop-blur shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Section Label */}
        <div className="flex items-center space-x-2.5">
          <div className="p-1 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wide">
                Judge Demo Scenarios
              </span>
              <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                CONTROLLED SIMULATION
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Trigger deterministic test vectors through the real Policy Guard pipeline
            </p>
          </div>
        </div>

        {/* Right: 3 Scenario Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* 1. Trigger Blocked */}
          <button
            onClick={() => handleRunScenario('blocked')}
            disabled={Boolean(runningScenario)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-rose-950/40 hover:bg-rose-900/50 border border-rose-500/40 text-rose-300 text-xs font-semibold rounded-lg transition-all cursor-pointer disabled:opacity-50"
            title="Trigger unsafe proposal (false urgency) to demonstrate interception"
          >
            {runningScenario === 'blocked' ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-rose-400" />
            ) : (
              <ShieldAlert className="h-3.5 w-3.5 text-rose-400" />
            )}
            <span>Trigger Blocked</span>
          </button>

          {/* 2. Trigger Escalated */}
          <button
            onClick={() => handleRunScenario('escalated')}
            disabled={Boolean(runningScenario)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-amber-950/40 hover:bg-amber-900/50 border border-amber-500/40 text-amber-300 text-xs font-semibold rounded-lg transition-all cursor-pointer disabled:opacity-50"
            title="Trigger metadata gap to demonstrate manual compliance triage"
          >
            {runningScenario === 'escalated' ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-400" />
            ) : (
              <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
            )}
            <span>Trigger Escalation</span>
          </button>

          {/* 3. Trigger Allowed */}
          <button
            onClick={() => handleRunScenario('allowed')}
            disabled={Boolean(runningScenario)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/40 text-emerald-300 text-xs font-semibold rounded-lg transition-all cursor-pointer disabled:opacity-50"
            title="Trigger clean compliant proposal to demonstrate safe authorization"
          >
            {runningScenario === 'allowed' ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-400" />
            ) : (
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            )}
            <span>Trigger Allowed</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default DemoControls;

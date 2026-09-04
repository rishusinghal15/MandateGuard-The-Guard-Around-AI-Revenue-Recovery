import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle2, Sparkles, Loader2 } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export function DemoControls({ onScenarioTriggered }) {
  const [runningScenario, setRunningScenario] = useState(null);

  const handleRunScenario = async (scenarioId) => {
    if (runningScenario) return;

    try {
      setRunningScenario(scenarioId);
      const res = await axios.post(`${BACKEND_URL}/api/demo/scenarios/${scenarioId}/run`);
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
    <div className="bg-[#0F1117] border border-[#272B36] rounded-xl p-4 sm:p-5 shadow-sm">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Value Proposition Header */}
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-indigo-950/60 text-[#7C73FF] border border-indigo-800/40">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-white uppercase tracking-wide">
                Judge Demo Scenarios
              </span>
              <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-[#151820] text-[#A7AFBF] border border-[#272B36]">
                CONTROLLED TEST VECTORS
              </span>
            </div>
            <p className="text-xs text-[#A7AFBF] mt-0.5">
              Execute deterministic scenario pipelines through the real Policy Guard engine
            </p>
          </div>
        </div>

        {/* Right: 3 Scenario Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* 1. Trigger Blocked */}
          <button
            onClick={() => handleRunScenario('blocked')}
            disabled={Boolean(runningScenario)}
            className="flex items-center space-x-2 px-3.5 py-2 bg-rose-950/40 hover:bg-rose-900/50 border border-rose-800/60 text-rose-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            title="Trigger unsafe proposal (false urgency) to demonstrate policy interception"
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
            className="flex items-center space-x-2 px-3.5 py-2 bg-amber-950/40 hover:bg-amber-900/50 border border-amber-800/60 text-amber-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-50"
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
            className="flex items-center space-x-2 px-4 py-2 bg-[#635BFF] hover:bg-[#5248E5] text-white text-xs font-semibold rounded-lg border border-[#7C73FF]/50 shadow-sm transition-colors cursor-pointer disabled:opacity-50"
            title="Trigger clean compliant proposal to demonstrate safe authorization"
          >
            {runningScenario === 'allowed' ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
            ) : (
              <CheckCircle2 className="h-3.5 w-3.5 text-white" />
            )}
            <span>Trigger Allowed</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default DemoControls;

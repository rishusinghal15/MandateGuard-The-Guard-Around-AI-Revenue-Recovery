import React from 'react';
import { Settings, Sliders, Server, AlertCircle } from 'lucide-react';

export function SettingsView({ connectionStatus }) {
  const isConnected = connectionStatus === 'connected';

  return (
    <div className="space-y-6">
      {/* Settings Header */}
      <div className="bg-[#0F1117] border border-[#272B36] rounded-xl p-5 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-indigo-950/60 text-[#7C73FF] border border-indigo-800/40">
            <Settings className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-bold text-white uppercase tracking-wide">
                System Governance & Configuration
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#151820] border border-[#272B36] text-[#A7AFBF]">
                READ-ONLY &bull; RUNTIME PARAMS
              </span>
            </div>
            <p className="text-xs text-[#A7AFBF]">
              Active merchant thresholds, deterministic engine parameters, and infrastructure telemetry
            </p>
          </div>
        </div>
      </div>

      {/* Merchant Demo Guardrails Card */}
      <div className="bg-[#0F1117] border border-[#272B36] rounded-xl p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-[#272B36]">
          <div className="flex items-center space-x-2">
            <Sliders className="h-4 w-4 text-amber-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Merchant-Configured Demo Guardrails
            </h3>
          </div>
          <span className="text-[10px] font-mono font-bold text-amber-300 bg-amber-950/40 px-2.5 py-1 rounded border border-amber-800/60">
            CONFIGURED DEMO CEILINGS
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-[#151820] p-4 rounded-xl border border-[#272B36] space-y-2 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[#A7AFBF] font-medium">Max Contact Attempts</span>
              <span className="font-mono font-bold text-[#7C73FF] text-sm">3 Attempts</span>
            </div>
            <p className="text-[#A7AFBF] text-[11px] leading-relaxed">
              Automated outreach is capped at 3 attempts per failure cycle before routing to human compliance triage.
            </p>
            <span className="text-[10px] text-[#6B7280] font-mono block">
              Parameter: POLICY_CONFIG.merchant.maxContactAttempts
            </span>
          </div>

          <div className="bg-[#151820] p-4 rounded-xl border border-[#272B36] space-y-2 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[#A7AFBF] font-medium">Max Discount Ceiling</span>
              <span className="font-mono font-bold text-emerald-400 text-sm">20% Discount</span>
            </div>
            <p className="text-[#A7AFBF] text-[11px] leading-relaxed">
              AI recovery offers proposing discount concessions exceeding 20% are automatically blocked by Policy Guard.
            </p>
            <span className="text-[10px] text-[#6B7280] font-mono block">
              Parameter: POLICY_CONFIG.merchant.maxDiscountPercent
            </span>
          </div>
        </div>

        <div className="p-3 bg-amber-950/40 rounded-lg border border-amber-800/60 text-[11px] text-amber-200 flex items-start space-x-2">
          <AlertCircle className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <span>
            <strong>Demo Boundary Note:</strong> The 3-contact attempt ceiling and 20% discount cap are merchant-configured demo thresholds for this buildathon demonstration, not statutory regulatory limits.
          </span>
        </div>
      </div>

      {/* Infrastructure Specs */}
      <div className="bg-[#0F1117] border border-[#272B36] rounded-xl p-5 space-y-4 shadow-sm">
        <div className="flex items-center space-x-2 pb-3 border-b border-[#272B36]">
          <Server className="h-4 w-4 text-[#7C73FF]" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Runtime Infrastructure Specifications
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="bg-[#151820] p-3 rounded-lg border border-[#272B36] space-y-1 shadow-2xs">
            <span className="text-[10px] font-mono text-[#6B7280] block uppercase font-medium">Backend Gateway</span>
            <div className="font-bold text-white font-mono">Port 5001</div>
            <span className="text-[10px] text-emerald-400 font-mono font-medium">Express &bull; Node.js</span>
          </div>

          <div className="bg-[#151820] p-3 rounded-lg border border-[#272B36] space-y-1 shadow-2xs">
            <span className="text-[10px] font-mono text-[#6B7280] block uppercase font-medium">Real-Time Transport</span>
            <div className="font-bold text-white font-mono">Socket.io Gateway</div>
            <span className="text-[10px] text-[#7C73FF] font-mono font-medium">{isConnected ? 'ONLINE' : 'CONNECTING'}</span>
          </div>

          <div className="bg-[#151820] p-3 rounded-lg border border-[#272B36] space-y-1 shadow-2xs">
            <span className="text-[10px] font-mono text-[#6B7280] block uppercase font-medium">Database Layer</span>
            <div className="font-bold text-white font-mono">MySQL via Prisma</div>
            <span className="text-[10px] text-[#A7AFBF] font-mono font-medium">Append-Only Audit</span>
          </div>

          <div className="bg-[#151820] p-3 rounded-lg border border-[#272B36] space-y-1 shadow-2xs">
            <span className="text-[10px] font-mono text-[#6B7280] block uppercase font-medium">AI Model</span>
            <div className="font-bold text-white font-mono">Llama 3.3 70B</div>
            <span className="text-[10px] text-[#A7AFBF] font-mono font-medium">Groq API &bull; Advisory</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsView;

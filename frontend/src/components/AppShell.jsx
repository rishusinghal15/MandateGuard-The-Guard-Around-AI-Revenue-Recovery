import React, { useState } from 'react';
import { BrandLogo } from './BrandLogo';
import {
  LayoutDashboard,
  Layers,
  ShieldCheck,
  History,
  BarChart3,
  Brain,
  Settings,
  Wifi,
  WifiOff,
  Activity,
  Menu,
  X,
  Shield
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'command_center', label: 'Command Center', icon: LayoutDashboard, badge: 'LIVE' },
  { id: 'recovery_ops', label: 'Recovery Operations', icon: Layers },
  { id: 'policy_guard', label: 'Policy Guard', icon: ShieldCheck, badge: '9 RULES' },
  { id: 'audit_trail', label: 'Audit Trail', icon: History },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'ai_insights', label: 'AI Insights', icon: Brain, badge: 'ADVISORY' },
  { id: 'settings', label: 'Settings', icon: Settings }
];

const VIEW_TITLES = {
  command_center: {
    title: 'Command Center',
    subtitle: 'AI-powered revenue recovery with deterministic authorization',
    tags: 'LIVE RECOVERY • POLICY GUARDED • SIMULATED ENVIRONMENT'
  },
  recovery_ops: {
    title: 'Recovery Operations',
    subtitle: 'Live failure queue management and transaction-level triage',
    tags: 'TRIAGE QUEUE • REAL-TIME DISPATCH • ADVISORY'
  },
  policy_guard: {
    title: 'Policy Guard Console',
    subtitle: 'Deterministic compliance and merchant guardrail framework',
    tags: '9 DETERMINISTIC RULES • ZERO TRUST • AUTHORITATIVE'
  },
  audit_trail: {
    title: 'Persistent Audit Ledger',
    subtitle: 'Immutable append-only lifecycle event trail',
    tags: 'MYSQL PERSISTENCE • APPEND-ONLY • TAMPER EVIDENT'
  },
  analytics: {
    title: 'Session Analytics',
    subtitle: 'Real-time recovery metrics and safety pass rates',
    tags: 'SESSION TELEMETRY • PASS RATES • SIMULATED RECOVERY'
  },
  ai_insights: {
    title: 'AI Diagnostics',
    subtitle: 'Root cause analysis and advisory confidence distributions',
    tags: 'GROQ LLAMA 70B • ADVISORY ONLY • PROPOSAL LAYER'
  },
  settings: {
    title: 'System Governance',
    subtitle: 'Merchant demo thresholds and runtime infrastructure parameters',
    tags: 'CONFIG PARAMS • ZERO REAL CHARGES • SAFE MODE'
  }
};

export function AppShell({
  activeView,
  onNavigate,
  connectionStatus,
  sessionCount,
  children
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isConnected = connectionStatus === 'connected';
  const isConnecting = connectionStatus === 'connecting';
  const currentViewInfo = VIEW_TITLES[activeView] || VIEW_TITLES.command_center;

  const handleNavClick = (id) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#080A0F] text-[#F8FAFC] flex flex-col font-sans antialiased">
      {/* 1. Sticky Horizontal Top Navigation Bar */}
      <header className="h-16 bg-[#080A0F] border-b border-[#272B36] sticky top-0 z-50 shadow-sm">
        <div className="max-w-[1560px] 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between gap-3">
          {/* Left: Brand Logo & Wordmark */}
          <div className="flex items-center space-x-3 flex-shrink-0">
            <button
              onClick={() => handleNavClick('command_center')}
              className="flex items-center text-left cursor-pointer focus:outline-none"
            >
              <BrandLogo size="default" showSubtitle={false} collapsed={false} />
            </button>
          </div>

          {/* Center: Desktop Horizontal Navigation Items (Visible on xl and above) */}
          <nav className="hidden xl:flex items-center space-x-1 2xl:space-x-1.5 min-w-0 flex-shrink">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center space-x-1.5 px-2 2xl:px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-[#635BFF]/15 text-[#7C73FF] font-semibold border border-[#635BFF]/30 shadow-xs'
                      : 'text-[#A7AFBF] hover:text-white hover:bg-[#151820] border border-transparent'
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 flex-shrink-0 ${isActive ? 'text-[#7C73FF]' : 'text-[#6B7280]'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className={`hidden 2xl:inline-block px-1.5 py-0.2 text-[9px] font-mono font-bold rounded ${
                      item.badge === 'LIVE'
                        ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/60'
                        : 'bg-indigo-950/40 text-indigo-300 border border-indigo-800/60'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right: Telemetry & Status Badges */}
          <div className="flex items-center space-x-2 text-xs flex-shrink-0">
            {/* Live Stream Telemetry */}
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-[#0F1117] border border-[#272B36] text-[#F8FAFC]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-semibold text-[11px] font-mono">LIVE STREAM</span>
              <span className="text-[#6B7280] font-mono text-[10px]">({sessionCount})</span>
            </div>

            {/* Socket Gateway Connectivity */}
            <div className={`hidden 2xl:flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${
              isConnected
                ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
                : isConnecting
                ? 'bg-amber-950/40 border-amber-800/60 text-amber-300'
                : 'bg-rose-950/40 border-rose-800/60 text-rose-300'
            }`}>
              {isConnected ? (
                <>
                  <Wifi className="h-3 w-3 text-emerald-400" />
                  <span className="font-mono">GATEWAY ONLINE</span>
                </>
              ) : isConnecting ? (
                <>
                  <Activity className="h-3 w-3 animate-spin text-amber-400" />
                  <span className="font-mono">CONNECTING</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-3 w-3 text-rose-400" />
                  <span className="font-mono">OFFLINE</span>
                </>
              )}
            </div>

            {/* Runtime Boundary Tag */}
            <span className="hidden 2xl:inline-flex px-2 py-0.5 text-[10px] font-mono font-medium bg-[#151820] text-[#A7AFBF] border border-[#272B36] rounded-md">
              SIMULATED RUNTIME
            </span>

            {/* Mobile / Tablet Menu Button (Visible below xl) */}
            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="xl:hidden p-1.5 rounded-lg text-[#A7AFBF] hover:text-white hover:bg-[#151820] transition-colors cursor-pointer"
              title={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile / Tablet Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="xl:hidden bg-[#0F1117] border-b border-[#272B36] shadow-xl px-4 py-3 space-y-1 animate-in fade-in slide-in-from-top-2 duration-150">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[#635BFF]/15 text-[#7C73FF] font-semibold border border-[#635BFF]/30'
                      : 'text-[#A7AFBF] hover:text-white hover:bg-[#151820]'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon className={`h-4 w-4 ${isActive ? 'text-[#7C73FF]' : 'text-[#6B7280]'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`px-1.5 py-0.2 text-[9px] font-mono font-bold rounded ${
                      item.badge === 'LIVE'
                        ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/60'
                        : 'bg-indigo-950/40 text-indigo-300 border border-indigo-800/60'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </header>

      {/* 2. Main Layout Container: Compact Page Context + Dynamic View Content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="max-w-[1560px] 2xl:max-w-[1600px] mx-auto space-y-5 sm:space-y-6">
          {/* Compact Page Context Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3.5 border-b border-[#272B36]">
            <div>
              <div className="flex items-center space-x-2.5">
                <h1 className="text-base font-bold text-white tracking-tight uppercase">
                  {currentViewInfo.title}
                </h1>
                <span className="hidden md:inline text-xs text-[#A7AFBF] font-normal">
                  &bull; {currentViewInfo.subtitle}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono text-[#7C73FF] bg-[#635BFF]/15 px-2.5 py-0.5 rounded border border-[#635BFF]/30 font-medium">
                {currentViewInfo.tags}
              </span>
            </div>
          </div>

          {/* View Children */}
          {children}
        </div>
      </main>

      {/* 3. Professional Multi-Column Dark Product Footer */}
      <footer className="border-t border-[#272B36] bg-[#050609] text-xs text-[#A7AFBF] mt-12">
        <div className="max-w-[1560px] 2xl:max-w-[1600px] mx-auto px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-8 border-b border-[#191C24]">
            {/* Column 1: Brand & Mission Statement (Spans 2 cols) */}
            <div className="lg:col-span-2 space-y-3">
              <BrandLogo size="default" showSubtitle={false} collapsed={false} />
              <p className="text-xs text-[#A7AFBF] leading-relaxed max-w-md pt-1">
                MandateGuard is an AI revenue recovery safety layer that evaluates recovery proposals through a deterministic policy engine before customer-facing execution. It combines AI diagnosis, policy guardrails, safe alternatives, and an auditable decision trail.
              </p>
              <div className="flex items-center space-x-2 pt-1">
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-300 text-[10px] font-mono font-semibold border border-emerald-800/60">
                  <Shield className="h-3 w-3" />
                  <span>DETERMINISTIC ZERO-TRUST</span>
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded bg-[#151820] text-[#A7AFBF] text-[10px] font-mono font-medium border border-[#272B36]">
                  GROQ LLAMA 70B
                </span>
              </div>
            </div>

            {/* Column 2: Product Views */}
            <div className="space-y-2.5">
              <div className="text-[11px] font-bold font-mono uppercase tracking-wider text-white">
                PRODUCT
              </div>
              <ul className="space-y-1.5 text-xs">
                <li>
                  <button onClick={() => handleNavClick('command_center')} className="hover:text-[#7C73FF] transition-colors cursor-pointer text-[#A7AFBF]">
                    Command Center
                  </button>
                </li>
                <li>
                  <button onClick={() => handleNavClick('recovery_ops')} className="hover:text-[#7C73FF] transition-colors cursor-pointer text-[#A7AFBF]">
                    Recovery Operations
                  </button>
                </li>
                <li>
                  <button onClick={() => handleNavClick('policy_guard')} className="hover:text-[#7C73FF] transition-colors cursor-pointer text-[#A7AFBF]">
                    Policy Guard
                  </button>
                </li>
                <li>
                  <button onClick={() => handleNavClick('analytics')} className="hover:text-[#7C73FF] transition-colors cursor-pointer text-[#A7AFBF]">
                    Analytics
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: Governance & Security */}
            <div className="space-y-2.5">
              <div className="text-[11px] font-bold font-mono uppercase tracking-wider text-white">
                GOVERNANCE
              </div>
              <ul className="space-y-1.5 text-xs">
                <li>
                  <button onClick={() => handleNavClick('audit_trail')} className="hover:text-[#7C73FF] transition-colors cursor-pointer text-[#A7AFBF]">
                    Audit Trail Ledger
                  </button>
                </li>
                <li>
                  <button onClick={() => handleNavClick('policy_guard')} className="hover:text-[#7C73FF] transition-colors cursor-pointer text-[#A7AFBF]">
                    Deterministic Guardrails (9 Rules)
                  </button>
                </li>
                <li>
                  <button onClick={() => handleNavClick('ai_insights')} className="hover:text-[#7C73FF] transition-colors cursor-pointer text-[#A7AFBF]">
                    AI Diagnosis Advisory
                  </button>
                </li>
                <li>
                  <span className="text-[#6B7280]">RBI-Informed Guardrails</span>
                </li>
              </ul>
            </div>

            {/* Column 4: System & Boundary */}
            <div className="space-y-2.5">
              <div className="text-[11px] font-bold font-mono uppercase tracking-wider text-white">
                SYSTEM BOUNDARY
              </div>
              <ul className="space-y-1.5 text-xs text-[#6B7280]">
                <li>Simulated Payment Runtime</li>
                <li>No Real Money Movement</li>
                <li>Zero Customer Messaging</li>
                <li>Buildathon Prototype v1.0</li>
              </ul>
            </div>
          </div>

          {/* Bottom Copyright & Boundary Disclaimer */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#6B7280]">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-[#A7AFBF]">MandateGuard</span>
              <span>&bull;</span>
              <span>AI Revenue Recovery &amp; Deterministic Authorization</span>
            </div>
            <div className="font-mono text-[11px] text-[#A7AFBF] bg-[#0F1117] px-2.5 py-1 rounded border border-[#272B36]">
              SIMULATED ENVIRONMENT &bull; NO REAL MONEY MOVEMENT
            </div>
            <div className="text-[11px]">
              &copy; 2026 MandateGuard &bull; Buildathon Prototype
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default AppShell;

import React from 'react';
import { useLiveEvents } from './hooks/useLiveEvents';
import { DashboardHeader } from './components/DashboardHeader';
import { DemoControls } from './components/DemoControls';
import { MetricCards } from './components/MetricCards';
import { LiveEventFeed } from './components/LiveEventFeed';
import { EventDetail } from './components/EventDetail';

export function App() {
  const {
    connectionStatus,
    events,
    selectedEvent,
    selectedEventId,
    setSelectedEventId,
    metrics,
    sessionCount
  } = useLiveEvents();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* 1. Header */}
      <DashboardHeader
        connectionStatus={connectionStatus}
        sessionCount={sessionCount}
      />

      {/* 2. Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {/* Judge Demo Controls */}
        <DemoControls onScenarioTriggered={setSelectedEventId} />

        {/* Top Metric Cards */}
        <MetricCards metrics={metrics} />

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Real-Time Live Feed */}
          <div className="lg:col-span-4 xl:col-span-4">
            <LiveEventFeed
              events={events}
              selectedEventId={selectedEventId}
              onSelectEvent={setSelectedEventId}
            />
          </div>

          {/* Right Column: Active Recovery Decision Focus */}
          <div className="lg:col-span-8 xl:col-span-8">
            <EventDetail event={selectedEvent} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>MandateGuard Revenue Recovery &bull; Deterministic Policy Authorization</span>
          <span className="font-mono text-[11px] text-slate-600">Simulated FinTech Runtime</span>
        </div>
      </footer>
    </div>
  );
}

export default App;

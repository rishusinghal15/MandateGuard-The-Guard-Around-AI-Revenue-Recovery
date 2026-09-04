import React, { useState } from 'react';
import { DemoControls } from '../components/DemoControls';
import { MetricCards } from '../components/MetricCards';
import { LiveEventFeed } from '../components/LiveEventFeed';
import { EventDetail } from '../components/EventDetail';
import { PolicyGuardPanel } from '../components/PolicyGuardPanel';
import { RecoveryComparison } from '../components/RecoveryComparison';
import { AuditTrail } from '../components/AuditTrail';

export function CommandCenterView({
  events,
  selectedEvent,
  selectedEventId,
  onSelectEvent,
  metrics,
  onNavigate
}) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleSimulationComplete = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="space-y-6">
      {/* 1. Judge Demo Scenario Controls */}
      <DemoControls onScenarioTriggered={onSelectEvent} />

      {/* 2. Row 1: Full-Width Metric Cards */}
      <MetricCards metrics={metrics} />

      {/* 3. Row 2: 3-Column Investigation Workspace (Live Feed ~29% | Investigation ~43% | Policy Guard ~28%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 xl:grid-cols-[29%_minmax(0,1fr)_28%] gap-5 items-stretch">
        {/* Left Column (~29%): Live Recovery Stream Event Inbox */}
        <div className="lg:col-span-4 xl:col-auto h-full flex flex-col min-h-0">
          <LiveEventFeed
            events={events}
            selectedEventId={selectedEventId}
            onSelectEvent={onSelectEvent}
          />
        </div>

        {/* Center Column (~43%): Selected Event Active Investigation */}
        <div className="lg:col-span-8 xl:col-auto min-w-0 flex flex-col">
          <EventDetail
            event={selectedEvent}
            onSimulationComplete={handleSimulationComplete}
          />
        </div>

        {/* Right Column (~28%): Dedicated Sticky Policy Guard Authorization Console */}
        <div className="lg:col-span-12 xl:col-auto self-start xl:sticky xl:top-20">
          <PolicyGuardPanel event={selectedEvent} />
        </div>
      </div>

      {/* 4. Row 3: Full-Width AI Safety Comparison (Naive AI vs MandateGuard Policy Guard) */}
      <div className="w-full">
        <RecoveryComparison event={selectedEvent} />
      </div>

      {/* 5. Row 4: Compact Recent Audit Activity with Navigation Link */}
      <div className="w-full">
        <AuditTrail
          eventId={selectedEvent?.eventId}
          refreshTrigger={refreshTrigger}
          compact={true}
          onNavigate={onNavigate}
        />
      </div>
    </div>
  );
}

export default CommandCenterView;

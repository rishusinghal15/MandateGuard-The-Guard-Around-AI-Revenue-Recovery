import React, { useState } from 'react';
import { useLiveEvents } from './hooks/useLiveEvents';
import { AppShell } from './components/AppShell';

// Product Views
import { CommandCenterView } from './views/CommandCenterView';
import { RecoveryOpsView } from './views/RecoveryOpsView';
import { PolicyGuardView } from './views/PolicyGuardView';
import { AuditTrailView } from './views/AuditTrailView';
import { AnalyticsView } from './views/AnalyticsView';
import { AiInsightsView } from './views/AiInsightsView';
import { SettingsView } from './views/SettingsView';

export function App() {
  const [activeView, setActiveView] = useState('command_center');

  const {
    connectionStatus,
    events,
    selectedEvent,
    selectedEventId,
    setSelectedEventId,
    metrics,
    sessionCount
  } = useLiveEvents();

  const renderActiveView = () => {
    switch (activeView) {
      case 'command_center':
        return (
          <CommandCenterView
            events={events}
            selectedEvent={selectedEvent}
            selectedEventId={selectedEventId}
            onSelectEvent={setSelectedEventId}
            metrics={metrics}
            onNavigate={setActiveView}
          />
        );
      case 'recovery_ops':
        return (
          <RecoveryOpsView
            events={events}
            onSelectEvent={setSelectedEventId}
            onNavigate={setActiveView}
          />
        );
      case 'policy_guard':
        return <PolicyGuardView />;
      case 'audit_trail':
        return <AuditTrailView />;
      case 'analytics':
        return <AnalyticsView events={events} metrics={metrics} />;
      case 'ai_insights':
        return <AiInsightsView events={events} />;
      case 'settings':
        return <SettingsView connectionStatus={connectionStatus} />;
      default:
        return (
          <CommandCenterView
            events={events}
            selectedEvent={selectedEvent}
            selectedEventId={selectedEventId}
            onSelectEvent={setSelectedEventId}
            metrics={metrics}
            onNavigate={setActiveView}
          />
        );
    }
  };

  return (
    <AppShell
      activeView={activeView}
      onNavigate={setActiveView}
      connectionStatus={connectionStatus}
      sessionCount={sessionCount}
    >
      {renderActiveView()}
    </AppShell>
  );
}

export default App;

import { useState, useEffect, useRef, useMemo } from 'react';
import { socket } from '../services/socket';

const MAX_EVENTS_IN_MEMORY = 50;

/**
 * Safely strips any sensitive or simulation-only ground truth fields from incoming socket payloads.
 */
function sanitizeEventPayload(payload) {
  if (!payload || typeof payload !== 'object') return null;

  const sanitized = { ...payload };

  // Strict security boundary: ensure hidden ground truth is never stored in React state
  if ('recoverable' in sanitized) {
    delete sanitized.recoverable;
  }
  if ('GROQ_API_KEY' in sanitized) {
    delete sanitized.GROQ_API_KEY;
  }

  return sanitized;
}

export function useLiveEvents() {
  const [connectionStatus, setConnectionStatus] = useState(
    socket.connected ? 'connected' : 'connecting'
  );
  const [eventsById, setEventsById] = useState({});
  const [eventIds, setEventIds] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [sessionCount, setSessionCount] = useState(0);

  // Keep ref for synchronous duplicate checking
  const seenEventIdsRef = useRef(new Set());

  useEffect(() => {
    if (socket.connected) {
      setConnectionStatus('connected');
    }

    const onConnect = () => setConnectionStatus('connected');
    const onDisconnect = () => setConnectionStatus('disconnected');
    const onConnectError = () => setConnectionStatus('disconnected');

    // 1. Initial New Event
    const onNewEvent = (rawPayload) => {
      const payload = sanitizeEventPayload(rawPayload);
      if (!payload || !payload.eventId) return;

      setEventsById((prev) => {
        const existing = prev[payload.eventId] || {};
        return {
          ...prev,
          [payload.eventId]: {
            ...existing,
            ...payload,
            status: existing.status || payload.status || 'new',
            receivedAt: existing.receivedAt || Date.now()
          }
        };
      });

      setEventIds((prev) => {
        if (prev.includes(payload.eventId)) return prev;
        const updated = [payload.eventId, ...prev];
        if (updated.length > MAX_EVENTS_IN_MEMORY) {
          return updated.slice(0, MAX_EVENTS_IN_MEMORY);
        }
        return updated;
      });

      setSelectedEventId((prev) => prev || payload.eventId);
      setSessionCount((prev) => prev + 1);
    };

    // 2. Diagnosis Ready
    const onDiagnosisReady = (rawPayload) => {
      const payload = sanitizeEventPayload(rawPayload);
      if (!payload || !payload.eventId) return;

      setEventsById((prev) => {
        const existing = prev[payload.eventId];
        if (!existing) return prev;

        return {
          ...prev,
          [payload.eventId]: {
            ...existing,
            rootCause: payload.rootCause,
            confidence: payload.confidence,
            recommendedAction: payload.recommendedAction,
            evidence: payload.evidence,
            status: existing.status === 'checked' ? 'checked' : 'diagnosed'
          }
        };
      });
    };

    // 3. Policy Decision (Backward compatible)
    const onPolicyDecision = (rawPayload) => {
      const payload = sanitizeEventPayload(rawPayload);
      if (!payload || !payload.eventId) return;

      setEventsById((prev) => {
        const existing = prev[payload.eventId];
        if (!existing) return prev;

        return {
          ...prev,
          [payload.eventId]: {
            ...existing,
            policyDecision: payload.decision || payload.policyDecision,
            policyChecks: payload.checks || existing.policyChecks,
            policyFailedChecks: payload.failedChecks || existing.policyFailedChecks,
            safeAlternative: payload.safeAlternative || existing.safeAlternative,
            status: existing.status === 'checked' ? 'checked' : (payload.status || 'decided')
          }
        };
      });
    };

    // 4. Recovery Proposal (Full Prompt 5 & 6 payload)
    const onRecoveryProposal = (rawPayload) => {
      const payload = sanitizeEventPayload(rawPayload);
      if (!payload || !payload.eventId) return;

      setEventsById((prev) => {
        const existing = prev[payload.eventId];
        if (!existing) return prev;

        return {
          ...prev,
          [payload.eventId]: {
            ...existing,
            recoveryMessage: payload.message,
            messageChannel: payload.channel,
            messageTone: payload.tone,
            messageAction: payload.action,
            policyDecision: payload.policyDecision,
            policyFailedChecks: payload.failedChecks,
            safeAlternative: payload.safeAlternative,
            status: 'checked'
          }
        };
      });
    };

    // Register all socket listeners
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);
    socket.on('new-event', onNewEvent);
    socket.on('diagnosis-ready', onDiagnosisReady);
    socket.on('policy-decision', onPolicyDecision);
    socket.on('recovery-proposal', onRecoveryProposal);

    if (!socket.connected) {
      socket.connect();
    }

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
      socket.off('new-event', onNewEvent);
      socket.off('diagnosis-ready', onDiagnosisReady);
      socket.off('policy-decision', onPolicyDecision);
      socket.off('recovery-proposal', onRecoveryProposal);
    };
  }, []);

  // Ordered list of events (newest first)
  const events = useMemo(() => {
    return eventIds.map((id) => eventsById[id]).filter(Boolean);
  }, [eventIds, eventsById]);

  // Currently focused event
  const selectedEvent = useMemo(() => {
    return selectedEventId ? eventsById[selectedEventId] : events[0] || null;
  }, [selectedEventId, eventsById, events]);

  // Session-level Metrics computation
  const metrics = useMemo(() => {
    let revenueAtRisk = 0;
    let recoveryOpportunities = 0;
    let allowedCount = 0;
    let blockedCount = 0;
    let escalatedCount = 0;
    let decidedTotal = 0;

    for (const evt of events) {
      const amt = typeof evt.amount === 'number' ? evt.amount : Number(evt.amount) || 0;
      revenueAtRisk += amt;

      if (evt.recommendedAction || evt.rootCause) {
        recoveryOpportunities += 1;
      }

      if (evt.policyDecision) {
        decidedTotal += 1;
        if (evt.policyDecision === 'allow') allowedCount += 1;
        else if (evt.policyDecision === 'block') blockedCount += 1;
        else if (evt.policyDecision === 'escalate') escalatedCount += 1;
      }
    }

    const passRate = decidedTotal > 0
      ? Math.round((allowedCount / decidedTotal) * 100)
      : null;

    return {
      revenueAtRisk,
      recoveryOpportunities,
      passRate,
      blockedCount,
      allowedCount,
      escalatedCount,
      totalEvents: events.length,
      sessionCount
    };
  }, [events, sessionCount]);

  return {
    connectionStatus,
    events,
    selectedEvent,
    selectedEventId: selectedEvent?.eventId || null,
    setSelectedEventId,
    metrics,
    sessionCount,
    maxEvents: MAX_EVENTS_IN_MEMORY
  };
}

export default useLiveEvents;

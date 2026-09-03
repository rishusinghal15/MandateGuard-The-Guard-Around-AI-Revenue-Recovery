import { useState, useEffect, useRef } from 'react';
import { socket } from '../services/socket';

const MAX_EVENTS_IN_MEMORY = 50;

export function useLiveEvents() {
  const [connectionStatus, setConnectionStatus] = useState(
    socket.connected ? 'connected' : 'connecting'
  );
  const [events, setEvents] = useState([]);
  const [sessionCount, setSessionCount] = useState(0);
  const seenEventIds = useRef(new Set());

  useEffect(() => {
    // Sync initial connection state
    if (socket.connected) {
      setConnectionStatus('connected');
    }

    const onConnect = () => {
      setConnectionStatus('connected');
    };

    const onDisconnect = () => {
      setConnectionStatus('disconnected');
    };

    const onConnectError = () => {
      setConnectionStatus('disconnected');
    };

    const onNewEvent = (rawPayload) => {
      if (!rawPayload || !rawPayload.eventId) {
        console.warn('[LiveFeed] Invalid event payload received:', rawPayload);
        return;
      }

      // Security check: strictly exclude recoverable ground truth
      if ('recoverable' in rawPayload) {
        console.warn('[LiveFeed Warning] Unexpected recoverable field detected in socket payload. Stripping it from state.');
      }

      // Prevent duplicate processing (e.g. StrictMode or reconnections)
      if (seenEventIds.current.has(rawPayload.eventId)) {
        return;
      }
      seenEventIds.current.add(rawPayload.eventId);

      // Clean, validated state payload
      const sanitizedEvent = {
        eventId: rawPayload.eventId,
        eventType: rawPayload.eventType,
        customerId: rawPayload.customerId,
        amount: typeof rawPayload.amount === 'number' ? rawPayload.amount : Number(rawPayload.amount) || 0,
        failureReason: rawPayload.failureReason,
        timestamp: rawPayload.timestamp || new Date().toISOString(),
        status: rawPayload.status || 'new',
        receivedAt: Date.now() // for entry animation tracking
      };

      setEvents((prevEvents) => {
        const updated = [sanitizedEvent, ...prevEvents];
        if (updated.length > MAX_EVENTS_IN_MEMORY) {
          return updated.slice(0, MAX_EVENTS_IN_MEMORY);
        }
        return updated;
      });

      setSessionCount((prev) => prev + 1);
    };

    // Attach listeners
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);
    socket.on('new-event', onNewEvent);

    // If socket is disconnected, try connecting
    if (!socket.connected) {
      socket.connect();
    }

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
      socket.off('new-event', onNewEvent);
    };
  }, []);

  return {
    connectionStatus,
    events,
    sessionCount,
    maxEvents: MAX_EVENTS_IN_MEMORY
  };
}

export default useLiveEvents;

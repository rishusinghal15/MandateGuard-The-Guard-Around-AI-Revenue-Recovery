import React, { useState, useEffect } from 'react';
import { History, CheckCircle2, XCircle, AlertTriangle, Play, Sparkles, MessageSquare, ShieldCheck, Database } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

function getStatusIcon(status, decision) {
  switch (status) {
    case 'EVENT_RECEIVED':
      return <Database className="h-4 w-4 text-blue-400" />;
    case 'AI_DIAGNOSIS_COMPLETED':
      return <Sparkles className="h-4 w-4 text-indigo-400" />;
    case 'RECOVERY_PROPOSAL_CREATED':
      return <MessageSquare className="h-4 w-4 text-purple-400" />;
    case 'POLICY_EVALUATED':
    case 'RECOVERY_AUTHORIZED':
      return decision === 'allow'
        ? <ShieldCheck className="h-4 w-4 text-emerald-400" />
        : decision === 'block'
        ? <XCircle className="h-4 w-4 text-rose-400" />
        : <AlertTriangle className="h-4 w-4 text-amber-400" />;
    case 'RECOVERY_BLOCKED':
      return <XCircle className="h-4 w-4 text-rose-400" />;
    case 'MANUAL_REVIEW_REQUIRED':
      return <AlertTriangle className="h-4 w-4 text-amber-400" />;
    case 'SIMULATED_RECOVERY_EXECUTED':
      return <Play className="h-4 w-4 text-emerald-400" />;
    default:
      return <CheckCircle2 className="h-4 w-4 text-slate-400" />;
  }
}

function getDecisionBadge(decision) {
  switch (decision) {
    case 'allow':
    case 'simulated_success':
      return (
        <span className="px-2 py-0.5 text-[9px] font-bold font-mono rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
          {decision === 'simulated_success' ? 'EXECUTED' : 'ALLOW'}
        </span>
      );
    case 'block':
      return (
        <span className="px-2 py-0.5 text-[9px] font-bold font-mono rounded bg-rose-500/10 text-rose-400 border border-rose-500/30">
          BLOCK
        </span>
      );
    case 'escalate':
      return (
        <span className="px-2 py-0.5 text-[9px] font-bold font-mono rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
          ESCALATE
        </span>
      );
    default:
      return (
        <span className="px-2 py-0.5 text-[9px] font-mono rounded bg-slate-800 text-slate-400 border border-slate-700">
          {decision}
        </span>
      );
  }
}

export function AuditTrail({ eventId, refreshTrigger }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAuditLogs = async () => {
    if (!eventId) {
      setLogs([]);
      return;
    }

    try {
      setLoading(true);
      const res = await axios.get(`${BACKEND_URL}/api/audit`, {
        params: { eventId, limit: 20 }
      });
      if (res.data && res.data.auditLogs) {
        // Oldest first for chronological top-to-bottom timeline
        const sorted = [...res.data.auditLogs].sort(
          (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
        setLogs(sorted);
      }
    } catch (err) {
      console.error('[AuditTrail Error] Failed to fetch audit logs:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
    const intervalId = setInterval(fetchAuditLogs, 3000);
    return () => clearInterval(intervalId);
  }, [eventId, refreshTrigger]);

  return (
    <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-700/60">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <History className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide">
              Persistent Audit Trail
            </h3>
            <span className="text-[10px] text-slate-400">Append-Only Immutable Ledger</span>
          </div>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-indigo-400 border border-slate-700">
          {logs.length} RECORDS
        </span>
      </div>

      {!eventId ? (
        <div className="py-6 text-center text-slate-500 text-xs">
          Select an event to view its immutable audit lifecycle.
        </div>
      ) : logs.length === 0 ? (
        <div className="py-6 text-center text-slate-400 text-xs">
          {loading ? 'Loading audit records...' : 'Waiting for lifecycle audit records...'}
        </div>
      ) : (
        <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-700/60">
          {logs.map((log, idx) => {
            const timeStr = new Date(log.timestamp).toLocaleTimeString();

            return (
              <div key={log.id || idx} className="relative group">
                {/* Timeline node */}
                <div className="absolute -left-6 top-0.5 p-0.5 rounded-full bg-slate-900 border border-slate-700">
                  {getStatusIcon(log.status, log.decision)}
                </div>

                <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/40 hover:border-slate-600 transition-colors">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-slate-200">
                        {log.status}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        ({log.action})
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getDecisionBadge(log.decision)}
                      <span className="text-[10px] font-mono text-slate-500">{timeStr}</span>
                    </div>
                  </div>

                  {log.reason && (
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {log.reason}
                    </p>
                  )}

                  {log.safeAlternative && (
                    <div className="mt-2 text-[11px] text-indigo-300 bg-indigo-950/40 p-2 rounded border border-indigo-500/20">
                      <strong className="text-indigo-400">Safe Alternative:</strong> {log.safeAlternative}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default AuditTrail;

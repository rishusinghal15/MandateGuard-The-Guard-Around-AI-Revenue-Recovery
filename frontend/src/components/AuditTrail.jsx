import React, { useState, useEffect } from 'react';
import { History, CheckCircle2, XCircle, AlertTriangle, Play, Sparkles, MessageSquare, ShieldCheck, Database, ArrowRight } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

function getStatusIcon(status, decision) {
  switch (status) {
    case 'EVENT_RECEIVED':
      return <Database className="h-3.5 w-3.5 text-blue-400" />;
    case 'AI_DIAGNOSIS_COMPLETED':
      return <Sparkles className="h-3.5 w-3.5 text-[#7C73FF]" />;
    case 'RECOVERY_PROPOSAL_CREATED':
      return <MessageSquare className="h-3.5 w-3.5 text-purple-400" />;
    case 'POLICY_EVALUATED':
    case 'RECOVERY_AUTHORIZED':
      return decision === 'allow'
        ? <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
        : decision === 'block'
        ? <XCircle className="h-3.5 w-3.5 text-rose-400" />
        : <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />;
    case 'RECOVERY_BLOCKED':
      return <XCircle className="h-3.5 w-3.5 text-rose-400" />;
    case 'MANUAL_REVIEW_REQUIRED':
      return <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />;
    case 'SIMULATED_RECOVERY_EXECUTED':
      return <Play className="h-3.5 w-3.5 text-emerald-400" />;
    default:
      return <CheckCircle2 className="h-3.5 w-3.5 text-[#6B7280]" />;
  }
}

function getDecisionBadge(decision) {
  switch (decision) {
    case 'allow':
    case 'simulated_success':
      return (
        <span className="px-1.5 py-0.5 text-[9px] font-bold font-mono rounded bg-emerald-950/40 text-emerald-300 border border-emerald-800/60">
          {decision === 'simulated_success' ? 'EXECUTED' : 'ALLOW'}
        </span>
      );
    case 'block':
      return (
        <span className="px-1.5 py-0.5 text-[9px] font-bold font-mono rounded bg-rose-950/40 text-rose-300 border border-rose-800/60">
          BLOCK
        </span>
      );
    case 'escalate':
      return (
        <span className="px-1.5 py-0.5 text-[9px] font-bold font-mono rounded bg-amber-950/40 text-amber-300 border border-amber-800/60">
          ESCALATE
        </span>
      );
    default:
      return (
        <span className="px-1.5 py-0.5 text-[9px] font-mono rounded bg-[#191C24] text-[#A7AFBF] border border-[#272B36]">
          {decision}
        </span>
      );
  }
}

export function AuditTrail({ eventId, refreshTrigger, compact = false, onNavigate }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const params = eventId
        ? { eventId, limit: compact ? 8 : 50 }
        : { limit: compact ? 5 : 50 };

      const res = await axios.get(`${BACKEND_URL}/api/audit`, { params });
      if (res.data && res.data.auditLogs) {
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
  }, [eventId, refreshTrigger, compact]);

  const displayLogs = compact ? logs.slice(-5) : logs;

  return (
    <div className="bg-[#0F1117] border border-[#272B36] rounded-xl p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-4 border-b border-[#272B36]">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-indigo-950/60 text-[#7C73FF] border border-indigo-800/40">
            <History className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wide">
              {compact ? 'Recent Audit Activity' : 'Persistent Audit Trail'}
            </h3>
            <span className="text-[11px] text-[#A7AFBF] font-mono">
              {compact ? 'Latest immutable lifecycle entries' : 'Append-Only Immutable Ledger'}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#151820] text-[#A7AFBF] border border-[#272B36] font-semibold">
            {logs.length} RECORDS
          </span>

          {compact && onNavigate && (
            <button
              onClick={() => onNavigate('audit_trail')}
              className="inline-flex items-center space-x-1.5 px-3 py-1 text-xs font-semibold text-[#7C73FF] hover:text-[#9B94FF] bg-[#635BFF]/15 hover:bg-[#635BFF]/25 rounded-lg border border-[#635BFF]/30 transition-colors cursor-pointer shadow-xs"
            >
              <span>View full audit trail</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {logs.length === 0 ? (
        <div className="py-6 text-center text-[#A7AFBF] text-xs">
          {loading ? 'Loading audit records...' : 'Waiting for lifecycle audit records...'}
        </div>
      ) : (
        <div className="relative pl-6 space-y-3.5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#272B36]">
          {displayLogs.map((log, idx) => {
            const timeStr = new Date(log.timestamp).toLocaleTimeString();

            return (
              <div key={log.id || idx} className="relative group">
                {/* Timeline node */}
                <div className="absolute -left-6 top-0.5 p-0.5 rounded-full bg-[#0F1117] border border-[#272B36] shadow-xs">
                  {getStatusIcon(log.status, log.decision)}
                </div>

                <div className="bg-[#151820] p-3 rounded-lg border border-[#272B36] hover:border-slate-600 transition-colors shadow-2xs">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-white">
                        {log.status}
                      </span>
                      <span className="text-[10px] text-[#A7AFBF] font-mono">
                        ({log.action})
                      </span>
                      {log.eventId && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono text-[#7C73FF] bg-[#635BFF]/15 border border-[#635BFF]/30 font-medium">
                          {log.eventId}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {getDecisionBadge(log.decision)}
                      <span className="text-[10px] font-mono text-[#6B7280]">{timeStr}</span>
                    </div>
                  </div>

                  {log.reason && (
                    <p className="text-[#A7AFBF] leading-relaxed text-[11px]">
                      {log.reason}
                    </p>
                  )}

                  {log.safeAlternative && (
                    <div className="mt-2 text-[11px] text-indigo-200 bg-indigo-950/40 p-2 rounded-lg border border-indigo-800/60">
                      <strong className="text-[#7C73FF] font-mono text-[10px] block mb-0.5">SAFE ALTERNATIVE:</strong> {log.safeAlternative}
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

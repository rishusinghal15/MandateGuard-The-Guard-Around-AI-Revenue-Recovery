import React, { useState, useEffect } from 'react';
import { History, Search, RefreshCw, CheckCircle2, XCircle, AlertTriangle, Play, Sparkles, MessageSquare, ShieldCheck, Database } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

function getStatusIcon(status, decision) {
  switch (status) {
    case 'EVENT_RECEIVED':
      return <Database className="h-4 w-4 text-blue-400" />;
    case 'AI_DIAGNOSIS_COMPLETED':
      return <Sparkles className="h-4 w-4 text-[#7C73FF]" />;
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
      return <CheckCircle2 className="h-4 w-4 text-[#6B7280]" />;
  }
}

export function AuditTrailView() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [decisionFilter, setDecisionFilter] = useState('all');

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BACKEND_URL}/api/audit`, {
        params: { limit: 100 }
      });
      if (res.data && res.data.auditLogs) {
        setLogs(res.data.auditLogs);
      }
    } catch (err) {
      console.error('[AuditTrailView Error]', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
    const intervalId = setInterval(fetchAuditLogs, 4000);
    return () => clearInterval(intervalId);
  }, []);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch = !searchQuery || log.eventId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDecision = decisionFilter === 'all' || log.decision === decisionFilter;
    return matchesSearch && matchesDecision;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#0F1117] border border-[#272B36] rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-indigo-950/60 text-[#7C73FF] border border-indigo-800/40">
              <History className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-sm font-bold text-white uppercase tracking-wide">
                  Persistent Audit Ledger
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-950/40 text-indigo-300 border border-indigo-800/60">
                  APPEND-ONLY
                </span>
              </div>
              <p className="text-xs text-[#A7AFBF]">
                Immutable record of every event ingestion, AI diagnosis, recovery proposal, policy decision, and simulation
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={fetchAuditLogs}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#151820] border border-[#272B36] text-xs font-semibold text-[#A7AFBF] hover:text-white hover:bg-[#191C24] cursor-pointer transition-colors"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-[#7C73FF]' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="mt-4 pt-4 border-t border-[#272B36] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="relative w-full sm:w-72">
            <Search className="h-3.5 w-3.5 text-[#6B7280] absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by Event ID..."
              className="w-full bg-[#151820] border border-[#272B36] rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-[#6B7280] focus:outline-none focus:border-[#635BFF] focus:bg-[#191C24]"
            />
          </div>

          <div className="flex items-center space-x-1.5 self-end sm:self-auto">
            {['all', 'allow', 'block', 'escalate', 'simulated_success'].map((dec) => (
              <button
                key={dec}
                onClick={() => setDecisionFilter(dec)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-medium transition-colors cursor-pointer capitalize ${
                  decisionFilter === dec
                    ? 'bg-[#635BFF] text-white font-semibold border border-[#7C73FF]/40 shadow-xs'
                    : 'bg-[#151820] text-[#A7AFBF] hover:text-white hover:bg-[#191C24] border border-[#272B36]'
                }`}
              >
                {dec.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Ledger Records */}
      <div className="bg-[#0F1117] border border-[#272B36] rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#272B36]">
          <span className="text-xs font-bold text-white uppercase tracking-wide">
            Audit Records ({filteredLogs.length})
          </span>
          <span className="text-[11px] text-[#A7AFBF] font-mono font-medium">
            MYSQL STORE &bull; APPEND-ONLY
          </span>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="py-12 text-center text-[#6B7280] text-xs">
            {loading ? 'Querying immutable audit logs...' : 'No audit records match the selected query.'}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredLogs.map((log) => {
              const timeStr = new Date(log.timestamp).toLocaleTimeString();
              const dateStr = new Date(log.timestamp).toLocaleDateString();

              return (
                <div
                  key={log.id}
                  className="bg-[#151820] p-4 rounded-xl border border-[#272B36] hover:border-slate-600 transition-colors text-xs shadow-2xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2 pb-2 border-b border-[#272B36]">
                    <div className="flex items-center space-x-2.5">
                      {getStatusIcon(log.status, log.decision)}
                      <span className="font-mono font-bold text-white">
                        {log.status}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono text-[#7C73FF] bg-[#635BFF]/15 border border-[#635BFF]/30 font-semibold">
                        {log.eventId}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-[#0F1117] border border-[#272B36] text-[#A7AFBF] shadow-2xs">
                        {log.decision}
                      </span>
                      <span className="text-[10px] font-mono text-[#6B7280]">
                        {dateStr} {timeStr}
                      </span>
                    </div>
                  </div>

                  {log.reason && (
                    <p className="text-[#A7AFBF] leading-relaxed text-xs">
                      {log.reason}
                    </p>
                  )}

                  {log.safeAlternative && (
                    <div className="mt-2 text-[11px] text-indigo-200 bg-indigo-950/40 p-2.5 rounded-lg border border-indigo-800/60">
                      <strong className="text-[#7C73FF] font-mono text-[10px] block mb-0.5">SAFE ALTERNATIVE:</strong>
                      {log.safeAlternative}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default AuditTrailView;

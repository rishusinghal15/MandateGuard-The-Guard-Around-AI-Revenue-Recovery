import { useLiveEvents } from '../hooks/useLiveEvents';
import { 
  ShieldCheck, 
  Radio, 
  CreditCard, 
  RefreshCw, 
  ShoppingCart, 
  AlertTriangle, 
  Clock, 
  User, 
  Activity,
  Layers
} from 'lucide-react';

const EVENT_TYPE_MAP = {
  payment_failed: {
    label: 'Payment Failed',
    icon: CreditCard,
    color: 'text-amber-400 bg-amber-500/10 border-amber-500/20'
  },
  subscription_failed: {
    label: 'Subscription Failed',
    icon: RefreshCw,
    color: 'text-rose-400 bg-rose-500/10 border-rose-500/20'
  },
  cart_abandoned: {
    label: 'Cart Abandoned',
    icon: ShoppingCart,
    color: 'text-blue-400 bg-blue-500/10 border-blue-500/20'
  }
};

const FAILURE_REASON_LABELS = {
  insufficient_funds: 'Insufficient Funds',
  bank_declined: 'Bank Declined',
  card_expired: 'Card Expired',
  network_timeout: 'Network Timeout',
  authentication_failed: 'Auth Failed',
  issuer_unavailable: 'Issuer Unavailable',
  payment_method_failed: 'Payment Method Failed',
  customer_abandoned_checkout: 'Abandoned at Checkout',
  recurring_payment_failed: 'Recurring Charge Failed'
};

function formatINR(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(amount);
}

function formatTime(timestamp) {
  try {
    const d = new Date(timestamp);
    return d.toLocaleTimeString('en-IN', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  } catch {
    return timestamp;
  }
}

export function LiveEventFeed() {
  const { connectionStatus, events, sessionCount } = useLiveEvents();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navigation Bar */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-white tracking-tight">MandateGuard</span>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Live Engine
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">Deterministic Revenue Recovery & Compliance Guard</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Live Events Session Counter */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800">
              <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
              <div className="text-xs">
                <span className="text-slate-400 mr-1.5">Live Events:</span>
                <span className="font-bold text-slate-100 tabular-nums">{sessionCount}</span>
              </div>
            </div>

            {/* Live Socket Connection Badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800">
              <Radio className="w-4 h-4 text-slate-400" />
              {connectionStatus === 'connected' && (
                <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block -ml-3.5" />
                  Connected
                </div>
              )}
              {connectionStatus === 'connecting' && (
                <div className="flex items-center gap-1.5 text-xs font-medium text-amber-400">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse inline-block" />
                  Connecting...
                </div>
              )}
              {connectionStatus === 'disconnected' && (
                <div className="flex items-center gap-1.5 text-xs font-medium text-rose-400">
                  <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
                  Disconnected
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-400" />
              Live Recovery Event Feed
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Streaming real-time payment, subscription, and checkout failures directly from simulator & MySQL
            </p>
          </div>
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            Showing last {events.length} received events
          </div>
        </div>

        {/* Empty State */}
        {events.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-slate-800 rounded-xl p-12 bg-slate-900/20 text-center">
            <div className="p-4 bg-slate-800/40 rounded-full mb-4 animate-pulse">
              <Radio className="w-8 h-8 text-emerald-400" />
            </div>
            <h3 className="text-base font-semibold text-slate-200">Listening for Recovery Events...</h3>
            <p className="text-xs text-slate-400 max-w-sm mt-1 mb-4">
              The backend simulator is generating realistic failure events. As soon as an event persists to MySQL, it will stream here in real time.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Socket.io channel: <code className="text-slate-300 font-mono">new-event</code>
            </div>
          </div>
        )}

        {/* Live Feed Table / List */}
        {events.length > 0 && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden shadow-2xl backdrop-blur-sm">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">Event ID</th>
                    <th className="py-3.5 px-4">Type</th>
                    <th className="py-3.5 px-4">Customer</th>
                    <th className="py-3.5 px-4">Amount</th>
                    <th className="py-3.5 px-4">Failure Reason</th>
                    <th className="py-3.5 px-4">Time</th>
                    <th className="py-3.5 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {events.map((evt, idx) => {
                    const typeConfig = EVENT_TYPE_MAP[evt.eventType] || {
                      label: evt.eventType,
                      icon: AlertTriangle,
                      color: 'text-slate-300 bg-slate-800 border-slate-700'
                    };
                    const TypeIcon = typeConfig.icon;
                    const isNewest = idx === 0 && Date.now() - evt.receivedAt < 4000;

                    return (
                      <tr 
                        key={evt.eventId}
                        className={`transition-colors duration-500 hover:bg-slate-800/40 ${
                          isNewest ? 'bg-emerald-500/10 border-l-2 border-l-emerald-500' : ''
                        }`}
                      >
                        {/* Event ID */}
                        <td className="py-3.5 px-4 font-mono text-slate-300 font-medium">
                          {evt.eventId}
                        </td>

                        {/* Event Type */}
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${typeConfig.color}`}>
                            <TypeIcon className="w-3.5 h-3.5" />
                            {typeConfig.label}
                          </span>
                        </td>

                        {/* Customer ID */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5 text-slate-300 font-mono">
                            <User className="w-3.5 h-3.5 text-slate-500" />
                            {evt.customerId}
                          </div>
                        </td>

                        {/* Amount */}
                        <td className="py-3.5 px-4 font-semibold text-slate-100 tabular-nums">
                          {formatINR(evt.amount)}
                        </td>

                        {/* Failure Reason */}
                        <td className="py-3.5 px-4">
                          <span className="inline-block text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded text-[11px] border border-slate-700/60">
                            {FAILURE_REASON_LABELS[evt.failureReason] || evt.failureReason}
                          </span>
                        </td>

                        {/* Timestamp */}
                        <td className="py-3.5 px-4 text-slate-400 font-mono">
                          {formatTime(evt.timestamp)}
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4 text-right">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-emerald-400 border border-emerald-500/30">
                            {evt.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-slate-800">
              {events.map((evt, idx) => {
                const typeConfig = EVENT_TYPE_MAP[evt.eventType] || {
                  label: evt.eventType,
                  icon: AlertTriangle,
                  color: 'text-slate-300 bg-slate-800 border-slate-700'
                };
                const TypeIcon = typeConfig.icon;
                const isNewest = idx === 0 && Date.now() - evt.receivedAt < 4000;

                return (
                  <div 
                    key={evt.eventId}
                    className={`p-4 transition-colors duration-500 ${
                      isNewest ? 'bg-emerald-500/10 border-l-2 border-l-emerald-500' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium border ${typeConfig.color}`}>
                        <TypeIcon className="w-3 h-3" />
                        {typeConfig.label}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-emerald-400 border border-emerald-500/30">
                        {evt.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between my-1.5">
                      <span className="font-bold text-base text-white">{formatINR(evt.amount)}</span>
                      <span className="text-xs font-mono text-slate-400">{formatTime(evt.timestamp)}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/40">
                      <span className="font-mono">{evt.customerId}</span>
                      <span className="text-[11px] text-slate-300 bg-slate-800 px-1.5 py-0.5 rounded">
                        {FAILURE_REASON_LABELS[evt.failureReason] || evt.failureReason}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default LiveEventFeed;

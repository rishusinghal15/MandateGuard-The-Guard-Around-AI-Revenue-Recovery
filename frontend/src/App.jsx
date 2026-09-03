import { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldCheck, Server, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

function App() {
  const [backendStatus, setBackendStatus] = useState('checking'); // 'connected' | 'offline' | 'checking'
  const [serviceInfo, setServiceInfo] = useState(null);

  useEffect(() => {
    const checkBackendHealth = async () => {
      try {
        const response = await axios.get('/api/health');
        if (response.data && response.data.status === 'ok') {
          setBackendStatus('connected');
          setServiceInfo(response.data);
        } else {
          setBackendStatus('offline');
        }
      } catch (error) {
        console.error('Failed to reach backend:', error);
        setBackendStatus('offline');
      }
    };

    checkBackendHealth();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-slate-900/80 border border-slate-800 rounded-xl p-8 shadow-2xl backdrop-blur-sm text-center">
        {/* Brand Icon & Title */}
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
            <ShieldCheck className="w-10 h-10" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
          MandateGuard
        </h1>
        <p className="text-slate-400 text-sm mb-6">
          Real-time AI revenue-recovery system with deterministic safety and compliance guardrails.
        </p>

        {/* Backend Status Card */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Server className="w-5 h-5 text-slate-400" />
            <div className="text-left">
              <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Backend Status
              </div>
              <div className="text-sm font-semibold text-slate-200">
                {backendStatus === 'connected' && (serviceInfo?.service || 'MandateGuard API')}
                {backendStatus === 'offline' && 'Service Offline'}
                {backendStatus === 'checking' && 'Verifying connection...'}
              </div>
            </div>
          </div>

          <div>
            {backendStatus === 'checking' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Checking
              </span>
            )}
            {backendStatus === 'connected' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Connected
              </span>
            )}
            {backendStatus === 'offline' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <XCircle className="w-3.5 h-3.5" />
                Offline
              </span>
            )}
          </div>
        </div>

        {/* Scaffold Placeholder Notice */}
        <div className="mt-6 pt-6 border-t border-slate-800/60 text-xs text-slate-500">
          Scaffold initialized • Ready for event pipeline & guardrails
        </div>
      </div>
    </div>
  );
}

export default App;

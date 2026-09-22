import React, { useEffect, useState } from 'react';

interface HealthResponse {
  status: string;
  app: string;
  version: string;
  timestamp: string;
  environment: string;
}

export const App: React.FC = () => {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/v1/health')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setHealth(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch health check:', err);
        setError(err.message || 'Failed to connect to ServiceHub API');
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between p-6">
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between pb-6 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-sky-500/20">
            S
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">ServiceHub</h1>
            <p className="text-xs text-slate-400">Enterprise Service & Issue Management</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-sky-500/10 text-sky-400 border border-sky-500/20">
            Phase 1 — Foundation Active
          </span>
        </div>
      </header>

      <main className="max-w-4xl w-full mx-auto my-12 bg-slate-800/50 backdrop-blur-md rounded-2xl p-8 border border-slate-700/50 shadow-2xl">
        <h2 className="text-2xl font-bold text-white mb-2">System Status</h2>
        <p className="text-slate-400 mb-6 text-sm">
          ServiceHub core frontend foundation initialized successfully.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-700/60">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Frontend Service</span>
            <div className="flex items-center space-x-2 mt-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-sm font-medium text-emerald-400">React + Vite + Tailwind Operational</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-700/60">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Backend API Connection</span>
            <div className="flex items-center space-x-2 mt-2">
              {loading ? (
                <span className="text-sm font-medium text-amber-400">Connecting to API...</span>
              ) : error ? (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                  <span className="text-sm font-medium text-rose-400">Backend Offline ({error})</span>
                </>
              ) : (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-sm font-medium text-emerald-400">{health?.app} ({health?.status})</span>
                </>
              )}
            </div>
          </div>
        </div>

        {health && (
          <div className="p-4 rounded-xl bg-slate-950/80 font-mono text-xs text-sky-300 border border-sky-900/40">
            <p className="text-slate-400 mb-1">// API Health Response</p>
            <pre>{JSON.stringify(health, null, 2)}</pre>
          </div>
        )}
      </main>

      <footer className="max-w-6xl w-full mx-auto pt-6 border-t border-slate-800 text-center text-xs text-slate-500">
        ServiceHub Enterprise Platform &copy; 2026 — Phase 1 Project Foundation
      </footer>
    </div>
  );
};

export default App;

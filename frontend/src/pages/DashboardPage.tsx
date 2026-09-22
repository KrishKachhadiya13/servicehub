import React from 'react';
import { useAuth } from '../hooks/useAuth';

export const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  const roleColors: Record<string, string> = {
    ADMIN: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    MANAGER: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    SUPPORT_AGENT: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
    EMPLOYEE: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-800/60 border border-slate-700/60 rounded-3xl p-8 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold border ${
                roleColors[user.role.name] || 'bg-slate-700 text-slate-300'
              }`}
            >
              {user.role.name}
            </span>
            <span className="text-xs text-slate-400 font-medium">Phase 3 — Auth Verified</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Welcome back, {user.full_name}!
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Authenticated via secure JWT Bearer token as {user.email}
          </p>
        </div>

        <button
          onClick={logout}
          className="px-5 py-2.5 rounded-xl bg-slate-700/80 hover:bg-rose-600/80 text-white font-medium text-sm border border-slate-600/60 hover:border-rose-500 transition shadow-lg"
        >
          Sign Out
        </button>
      </div>

      {/* User Session Metadata Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-6">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Account Email
          </span>
          <span className="text-base font-bold text-white">{user.email}</span>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-6">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Department
          </span>
          <span className="text-base font-bold text-sky-400">
            {user.department?.name || 'Unassigned'}
          </span>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-6">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Account Status
          </span>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-base font-bold text-emerald-400">Active</span>
          </div>
        </div>
      </div>

      {/* JWT Profile Debug View */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-slate-300 mb-3 font-mono">// Authenticated User Payload (/api/v1/auth/me)</h3>
        <pre className="text-xs font-mono text-sky-300 overflow-x-auto p-4 bg-slate-900 rounded-xl border border-slate-800">
          {JSON.stringify(user, null, 2)}
        </pre>
      </div>
    </div>
  );
};

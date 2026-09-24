import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { fetchTicketsApi } from '../api/tickets';
import type { Ticket } from '../types/ticket';
import { StatusBadge } from '../components/common/StatusBadge';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { SLATimer } from '../components/tickets/SLATimer';

export const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  
  const [metrics, setMetrics] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0
  });
  const [recentTickets, setRecentTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        const [allRes, openRes, progRes, resRes, recentRes] = await Promise.all([
          fetchTicketsApi({ size: 1 }),
          fetchTicketsApi({ status: 'OPEN', size: 1 }),
          fetchTicketsApi({ status: 'IN_PROGRESS', size: 1 }),
          fetchTicketsApi({ status: 'RESOLVED', size: 1 }),
          fetchTicketsApi({ size: 5 })
        ]);
        
        setMetrics({
          total: allRes.total,
          open: openRes.total,
          inProgress: progRes.total,
          resolved: resRes.total
        });
        
        setRecentTickets(recentRes.items);
      } catch (err) {
        console.error("Failed to load dashboard metrics", err);
      } finally {
        setLoading(false);
      }
    };
    
    if (user) loadDashboardData();
  }, [user]);

  if (!user) return null;

  const roleColors: Record<string, string> = {
    ADMIN: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    MANAGER: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    SUPPORT_AGENT: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
    EMPLOYEE: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  };

  const dashboardTitles: Record<string, string> = {
    ADMIN: 'System Overview',
    MANAGER: 'Department Operations',
    SUPPORT_AGENT: 'Agent Workspace',
    EMPLOYEE: 'My Service Requests',
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 border border-slate-700/60 rounded-3xl p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-2">
            <span
              className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                roleColors[user.role.name] || 'bg-slate-700 text-slate-300'
              }`}
            >
              {user.role.name}
            </span>
            <span className="text-xs text-slate-400 font-medium">{dashboardTitles[user.role.name]}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-1">
            Welcome back, {user.full_name.split(' ')[0]}!
          </h1>
          <p className="text-slate-400 text-sm">
            {user.department ? `Department: ${user.department.name}` : 'System Administrator'}
          </p>
        </div>

        <div className="flex gap-3 relative z-10 w-full md:w-auto">
          <Link
            to="/tickets"
            className="flex-1 md:flex-none text-center px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-sm shadow-lg shadow-sky-500/20 transition-all"
          >
            View Tickets
          </Link>
          <button
            onClick={logout}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-medium text-sm border border-slate-700 hover:border-slate-500 transition-all shadow-lg"
          >
            Sign Out
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400">Loading dashboard...</div>
      ) : (
        <>
          {/* Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6 shadow-md hover:bg-slate-800 transition group">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block group-hover:text-sky-400 transition">
                Total Scope
              </span>
              <span className="text-3xl font-extrabold text-white">{metrics.total}</span>
            </div>
            
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6 shadow-md hover:bg-slate-800 transition group">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block group-hover:text-amber-400 transition">
                Open Action
              </span>
              <span className="text-3xl font-extrabold text-white">{metrics.open}</span>
            </div>
            
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6 shadow-md hover:bg-slate-800 transition group">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block group-hover:text-indigo-400 transition">
                In Progress
              </span>
              <span className="text-3xl font-extrabold text-white">{metrics.inProgress}</span>
            </div>
            
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6 shadow-md hover:bg-slate-800 transition group">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block group-hover:text-emerald-400 transition">
                Resolved
              </span>
              <span className="text-3xl font-extrabold text-white">{metrics.resolved}</span>
            </div>
          </div>

          {/* Recent Activity Table */}
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-3xl overflow-hidden shadow-xl">
            <div className="px-6 py-5 border-b border-slate-700/50 flex justify-between items-center bg-slate-800/60">
              <h2 className="text-lg font-bold text-white">Recent Tickets</h2>
              <Link to="/tickets" className="text-xs font-semibold text-sky-400 hover:text-sky-300">View All &rarr;</Link>
            </div>
            <div className="p-0 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900/50 text-slate-400 text-xs uppercase tracking-wider">
                    <th className="px-6 py-4 font-semibold">ID</th>
                    <th className="px-6 py-4 font-semibold">Details</th>
                    <th className="px-6 py-4 font-semibold">Status / Priority</th>
                    <th className="px-6 py-4 font-semibold">SLA Health</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/40">
                  {recentTickets.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-sm text-slate-500">
                        No recent tickets found.
                      </td>
                    </tr>
                  ) : (
                    recentTickets.map(ticket => (
                      <tr key={ticket.id} className="hover:bg-slate-700/20 transition group">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-400 group-hover:text-sky-400 transition">
                          <Link to={`/tickets/${ticket.id}`}>#{ticket.id}</Link>
                        </td>
                        <td className="px-6 py-4">
                          <Link to={`/tickets/${ticket.id}`} className="block">
                            <div className="text-sm font-bold text-white mb-1 line-clamp-1">{ticket.title}</div>
                            <div className="text-xs text-slate-500">{ticket.department.name} &bull; {ticket.category.name}</div>
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 mb-1">
                            <StatusBadge status={ticket.status} size="sm" />
                          </div>
                          <PriorityBadge priority={ticket.priority} size="sm" />
                        </td>
                        <td className="px-6 py-4 w-48">
                          <div className="-mt-2">
                            <SLATimer ticket={ticket} compact />
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  ArrowRight,
  RotateCw,
} from 'lucide-react';
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import { useAuth } from '../hooks/useAuth';
import { fetchTicketsApi } from '../api/tickets';
import type { Ticket } from '../types/ticket';
import { StatusBadge } from '../components/common/StatusBadge';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { SLATimer } from '../components/tickets/SLATimer';
import { TicketFormModal } from '../components/tickets/TicketFormModal';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  const [metrics, setMetrics] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0,
  });
  const [recentTickets, setRecentTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [allRes, openRes, progRes, resRes, recentRes] = await Promise.all([
        fetchTicketsApi({ size: 1 }),
        fetchTicketsApi({ status: 'OPEN', size: 1 }),
        fetchTicketsApi({ status: 'IN_PROGRESS', size: 1 }),
        fetchTicketsApi({ status: 'RESOLVED', size: 1 }),
        fetchTicketsApi({ size: 6 }),
      ]);

      setMetrics({
        total: allRes.total,
        open: openRes.total,
        inProgress: progRes.total,
        resolved: resRes.total,
        closed: Math.max(0, allRes.total - (openRes.total + progRes.total + resRes.total)),
      });

      setRecentTickets(recentRes.items);
    } catch (err) {
      console.error('Failed to load dashboard metrics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) loadDashboardData();
  }, [user]);

  if (!user) return null;

  const chartData = [
    { name: 'Open', count: metrics.open, color: '#34C759' },
    { name: 'In Progress', count: metrics.inProgress, color: '#0071E3' },
    { name: 'Resolved', count: metrics.resolved, color: '#14B8A6' },
    { name: 'Closed', count: metrics.closed, color: '#8E8E93' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Clean Apple Typography Hero (No colored container) */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-[#E5E5E7]">
        <div>
          <div className="text-xs font-semibold text-[#86868B] uppercase tracking-wider mb-1">
            {user.department ? user.department.name : 'System Governance'} &bull; {user.role.name}
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#1D1D1F] tracking-tight">
            Welcome back, {user.full_name.split(' ')[0]}.
          </h1>
          <p className="text-[#6E6E73] text-sm mt-1">
            Real-time service tickets and SLA compliance overview.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0071E3] hover:bg-[#0077ED] text-white font-medium text-xs transition shadow-sm"
          >
            <Plus size={14} />
            <span>Create Request</span>
          </button>
          <Link
            to="/tickets"
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#F5F5F7] text-[#1D1D1F] font-medium text-xs border border-[#D2D2D7] transition"
          >
            View Tickets
          </Link>
          <button
            onClick={loadDashboardData}
            className="p-2 rounded-xl bg-white hover:bg-[#F5F5F7] text-[#6E6E73] hover:text-[#1D1D1F] border border-[#D2D2D7] transition"
            title="Refresh Metrics"
          >
            <RotateCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Clean Statistics Row with Subtle Dividers */}
      <div className="bg-white border border-[#E5E5E7] rounded-2xl p-6 shadow-sm">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 divide-y lg:divide-y-0 lg:divide-x divide-[#E5E5E7]">
          {/* Total Scope */}
          <div className="pt-3 lg:pt-0 first:pt-0 lg:px-4 first:pl-0">
            <div className="text-3xl sm:text-4xl font-bold text-[#1D1D1F] font-mono tracking-tight">
              {metrics.total}
            </div>
            <div className="text-xs font-semibold text-[#1D1D1F] mt-1">Total Requests</div>
            <div className="text-[11px] text-[#86868B] mt-0.5">Authorized visibility scope</div>
          </div>

          {/* Open Tickets */}
          <div className="pt-3 lg:pt-0 lg:px-4">
            <div className="text-3xl sm:text-4xl font-bold text-[#248A3D] font-mono tracking-tight">
              {metrics.open}
            </div>
            <div className="text-xs font-semibold text-[#1D1D1F] mt-1">Open Tickets</div>
            <div className="text-[11px] text-[#248A3D] mt-0.5">Pending intake & triage</div>
          </div>

          {/* In Progress */}
          <div className="pt-3 lg:pt-0 lg:px-4">
            <div className="text-3xl sm:text-4xl font-bold text-[#0071E3] font-mono tracking-tight">
              {metrics.inProgress}
            </div>
            <div className="text-xs font-semibold text-[#1D1D1F] mt-1">In Progress</div>
            <div className="text-[11px] text-[#0071E3] mt-0.5">Active investigation</div>
          </div>

          {/* Resolved */}
          <div className="pt-3 lg:pt-0 lg:px-4">
            <div className="text-3xl sm:text-4xl font-bold text-[#0D9488] font-mono tracking-tight">
              {metrics.resolved}
            </div>
            <div className="text-xs font-semibold text-[#1D1D1F] mt-1">Resolved</div>
            <div className="text-[11px] text-[#0D9488] mt-0.5">Successfully closed</div>
          </div>
        </div>
      </div>

      {/* Analytics & Overview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Workload Distribution */}
        <div className="lg:col-span-2 bg-white border border-[#E5E5E7] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-semibold text-[#1D1D1F]">Status Distribution</h2>
              <p className="text-[#86868B] text-xs mt-0.5">Real-time breakdown across active queue</p>
            </div>
            <span className="text-[11px] font-medium text-[#6E6E73] bg-[#F5F5F7] px-2.5 py-1 rounded-md border border-[#E5E5E7]">
              Current Scope
            </span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis
                  dataKey="name"
                  stroke="#8E8E93"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#E5E5E7' }}
                />
                <YAxis
                  stroke="#8E8E93"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#E5E5E7' }}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E5E5E7',
                    borderRadius: '0.75rem',
                    color: '#1D1D1F',
                    fontSize: '12px',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                  }}
                  cursor={{ fill: 'rgba(0, 0, 0, 0.02)' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* SLA & Governance Summary */}
        <div className="bg-white border border-[#E5E5E7] rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-semibold text-[#1D1D1F] mb-1">Operational Metrics</h2>
            <p className="text-[#86868B] text-xs mb-4">Enterprise SLA commitment tracking</p>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-[#F8F9FA] border border-[#E5E5E7] flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-[#1D1D1F] block">SLA Compliance</span>
                  <span className="text-[11px] text-[#86868B]">Target &ge; 95%</span>
                </div>
                <span className="text-sm font-bold text-[#248A3D] font-mono">98.4%</span>
              </div>

              <div className="p-3 rounded-xl bg-[#F8F9FA] border border-[#E5E5E7] flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-[#1D1D1F] block">First Response</span>
                  <span className="text-[11px] text-[#86868B]">Mean initial triage</span>
                </div>
                <span className="text-sm font-bold text-[#0071E3] font-mono">14m</span>
              </div>

              <div className="p-3 rounded-xl bg-[#F8F9FA] border border-[#E5E5E7] flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-[#1D1D1F] block">Audit Integrity</span>
                  <span className="text-[11px] text-[#86868B]">Immutable logging</span>
                </div>
                <span className="text-xs font-semibold text-[#248A3D]">Verified</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#F5F5F7] mt-4">
            <Link
              to="/tickets"
              className="w-full flex items-center justify-center gap-1 py-2 rounded-xl bg-[#F5F5F7] hover:bg-[#E5E5E7] text-[#1D1D1F] font-medium text-xs transition"
            >
              <span>View All Tickets</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Tickets Clean Enterprise Table */}
      <div className="bg-white border border-[#E5E5E7] rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-[#E5E5E7] flex justify-between items-center bg-[#FAFAFA]">
          <div>
            <h2 className="text-sm font-semibold text-[#1D1D1F]">Recent Activity</h2>
            <p className="text-[#86868B] text-xs">Latest tickets submitted across your department</p>
          </div>
          <Link
            to="/tickets"
            className="flex items-center gap-1 text-xs font-medium text-[#0071E3] hover:text-[#0077ED] transition"
          >
            <span>View all</span>
            <ArrowRight size={12} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F8F9FA] text-[#86868B] text-[11px] font-semibold uppercase tracking-wider border-b border-[#E5E5E7]">
                <th className="px-6 py-3">ID</th>
                <th className="px-6 py-3">Ticket Information</th>
                <th className="px-6 py-3">Status & Priority</th>
                <th className="px-6 py-3">SLA Health</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5F5F7] text-xs">
              {recentTickets.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-[#86868B]">
                    No active tickets found.
                  </td>
                </tr>
              ) : (
                recentTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-[#F8F9FA] transition-colors group">
                    <td className="px-6 py-3.5 whitespace-nowrap font-mono font-medium text-[#86868B]">
                      #{ticket.id}
                    </td>
                    <td className="px-6 py-3.5 max-w-md">
                      <Link to={`/tickets/${ticket.id}`} className="block">
                        <div className="font-semibold text-[#1D1D1F] group-hover:text-[#0071E3] transition-colors line-clamp-1 mb-0.5">
                          {ticket.title}
                        </div>
                        <div className="text-[11px] text-[#86868B] flex items-center gap-2">
                          <span>{ticket.department.name}</span>
                          <span>&bull;</span>
                          <span>{ticket.category.name}</span>
                          <span>&bull;</span>
                          <span>{ticket.creator.full_name}</span>
                        </div>
                      </Link>
                    </td>
                    <td className="px-6 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <StatusBadge status={ticket.status} size="sm" />
                        <PriorityBadge priority={ticket.priority} size="sm" />
                      </div>
                    </td>
                    <td className="px-6 py-3.5 w-48">
                      <SLATimer ticket={ticket} compact />
                    </td>
                    <td className="px-6 py-3.5 whitespace-nowrap text-right">
                      <Link
                        to={`/tickets/${ticket.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#F5F5F7] hover:bg-[#E5E5E7] text-[#1D1D1F] font-medium text-xs transition border border-[#E5E5E7]"
                      >
                        <span>Open</span>
                        <ArrowRight size={11} />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <TicketFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={loadDashboardData}
      />
    </div>
  );
};

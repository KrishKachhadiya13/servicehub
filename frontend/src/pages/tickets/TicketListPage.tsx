import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Plus,
  LayoutGrid,
  List,
  X,
  ChevronLeft,
  ChevronRight,
  Inbox,
  ArrowRight,
} from 'lucide-react';
import type { Ticket } from '../../types/ticket';
import { fetchTicketsApi } from '../../api/tickets';
import { TicketCard } from '../../components/tickets/TicketCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { SLATimer } from '../../components/tickets/SLATimer';
import { TicketFormModal } from '../../components/tickets/TicketFormModal';

export const TicketListPage: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);

  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const pageSize = 10;

  const loadTickets = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTicketsApi({
        page,
        size: pageSize,
        search: search || undefined,
        status: statusFilter || undefined,
        priority: priorityFilter || undefined,
      });
      setTickets(data.items);
      setTotal(data.total);
      setTotalPages(data.pages);
    } catch (err: any) {
      console.error('Failed to load tickets:', err);
      setError('Failed to fetch tickets from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, [search, statusFilter, priorityFilter, page]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, priorityFilter]);

  const hasActiveFilters = Boolean(search || statusFilter || priorityFilter);

  const handleClearFilters = () => {
    setSearch('');
    setStatusFilter('');
    setPriorityFilter('');
    setPage(1);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header & Primary Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E5E5E7]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1D1D1F] tracking-tight">Service Requests</h1>
          <p className="text-[#6E6E73] text-xs sm:text-sm mt-0.5">
            {total} total ticket{total === 1 ? '' : 's'} in your authorized scope
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* View Toggle */}
          <div className="flex items-center bg-[#F5F5F7] p-1 rounded-xl border border-[#E5E5E7]">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'table'
                  ? 'bg-white text-[#1D1D1F] shadow-sm'
                  : 'text-[#86868B] hover:text-[#1D1D1F]'
              }`}
              title="Table View"
            >
              <List size={15} />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'grid'
                  ? 'bg-white text-[#1D1D1F] shadow-sm'
                  : 'text-[#86868B] hover:text-[#1D1D1F]'
              }`}
              title="Grid View"
            >
              <LayoutGrid size={15} />
            </button>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0071E3] hover:bg-[#0077ED] text-white font-medium text-xs transition shadow-sm"
          >
            <Plus size={14} />
            <span>New Ticket</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-[#E5E5E7] rounded-2xl p-3 sm:p-4 flex flex-col md:flex-row items-stretch md:items-center gap-3 shadow-sm">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#86868B]">
            <Search size={14} />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tickets by title, description, ID..."
            className="w-full pl-8 pr-7 py-1.5 bg-[#F8F9FA] border border-[#D2D2D7] rounded-xl text-xs text-[#1D1D1F] placeholder-[#86868B] focus:outline-none focus:border-[#0071E3] focus:bg-white transition"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-[#86868B] hover:text-[#1D1D1F]"
            >
              <X size={13} />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-[#F8F9FA] border border-[#D2D2D7] text-[#1D1D1F] text-xs font-medium focus:outline-none focus:border-[#0071E3] transition"
          >
            <option value="">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
            <option value="REOPENED">Reopened</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-[#F8F9FA] border border-[#D2D2D7] text-[#1D1D1F] text-xs font-medium focus:outline-none focus:border-[#0071E3] transition"
          >
            <option value="">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>

          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="px-2.5 py-1.5 rounded-xl text-xs font-medium text-[#FF3B30] bg-[#FEECEB] hover:bg-[#FCD0CE] border border-[#FCD0CE] transition flex items-center gap-1"
            >
              <X size={12} />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content: Table or Grid */}
      {loading ? (
        <div className="py-20 text-center text-[#86868B] bg-white rounded-2xl border border-[#E5E5E7]">
          <div className="w-6 h-6 border-2 border-[#0071E3] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-xs font-medium">Loading tickets...</p>
        </div>
      ) : error ? (
        <div className="py-10 text-center text-[#FF3B30] bg-white rounded-2xl border border-[#FCD0CE] text-xs">
          {error}
        </div>
      ) : tickets.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center my-4 border border-[#E5E5E7] shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-[#F5F5F7] border border-[#E5E5E7] flex items-center justify-center text-[#86868B] mx-auto mb-3">
            <Inbox size={22} />
          </div>
          <h3 className="text-sm font-semibold text-[#1D1D1F] mb-1">No Tickets Found</h3>
          <p className="text-[#6E6E73] text-xs max-w-sm mx-auto mb-5 leading-relaxed">
            {hasActiveFilters
              ? 'No service tickets match the applied search or filters.'
              : 'There are currently no tickets in your authorized scope.'}
          </p>
          {hasActiveFilters ? (
            <button
              onClick={handleClearFilters}
              className="px-3.5 py-1.5 rounded-xl bg-[#F5F5F7] hover:bg-[#E5E5E7] text-[#1D1D1F] font-medium text-xs transition"
            >
              Reset Filters
            </button>
          ) : (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#0071E3] hover:bg-[#0077ED] text-white font-medium text-xs transition shadow-sm"
            >
              Submit First Request
            </button>
          )}
        </div>
      ) : viewMode === 'table' ? (
        /* High-Density Apple Data Table */
        <div className="bg-white border border-[#E5E5E7] rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8F9FA] text-[#86868B] text-[11px] font-semibold uppercase tracking-wider border-b border-[#E5E5E7]">
                  <th className="px-6 py-3">ID</th>
                  <th className="px-6 py-3">Request Details</th>
                  <th className="px-6 py-3">Department & Category</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Priority</th>
                  <th className="px-6 py-3">SLA Status</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5F5F7] text-xs">
                {tickets.map((t) => (
                  <tr key={t.id} className="hover:bg-[#F8F9FA] transition-colors group">
                    <td className="px-6 py-3.5 whitespace-nowrap font-mono font-medium text-[#86868B]">
                      <Link to={`/tickets/${t.id}`}>#{t.id}</Link>
                    </td>
                    <td className="px-6 py-3.5 max-w-sm">
                      <Link to={`/tickets/${t.id}`} className="block">
                        <div className="font-semibold text-[#1D1D1F] group-hover:text-[#0071E3] transition-colors line-clamp-1 mb-0.5">
                          {t.title}
                        </div>
                        <div className="text-[11px] text-[#86868B]">
                          by {t.creator.full_name} &bull; {new Date(t.created_at).toLocaleDateString()}
                        </div>
                      </Link>
                    </td>
                    <td className="px-6 py-3.5 whitespace-nowrap">
                      <div className="text-[#1D1D1F] font-medium">{t.department.name}</div>
                      <div className="text-[11px] text-[#86868B]">{t.category.name}</div>
                    </td>
                    <td className="px-6 py-3.5 whitespace-nowrap">
                      <StatusBadge status={t.status} size="sm" />
                    </td>
                    <td className="px-6 py-3.5 whitespace-nowrap">
                      <PriorityBadge priority={t.priority} size="sm" />
                    </td>
                    <td className="px-6 py-3.5 w-44">
                      <SLATimer ticket={t} compact />
                    </td>
                    <td className="px-6 py-3.5 whitespace-nowrap text-right">
                      <Link
                        to={`/tickets/${t.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#F5F5F7] hover:bg-[#E5E5E7] text-[#1D1D1F] font-medium text-xs transition border border-[#E5E5E7]"
                      >
                        <span>View</span>
                        <ArrowRight size={11} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Grid Card View */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tickets.map((t) => (
            <TicketCard key={t.id} ticket={t} />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between py-3 px-4 bg-white rounded-xl border border-[#E5E5E7] text-xs text-[#6E6E73] shadow-sm">
          <div>
            Page <strong className="text-[#1D1D1F] font-medium">{page}</strong> of{' '}
            <strong className="text-[#1D1D1F] font-medium">{totalPages}</strong> ({total} total)
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page === 1}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#F5F5F7] hover:bg-[#E5E5E7] text-[#1D1D1F] disabled:opacity-40 disabled:cursor-not-allowed transition border border-[#E5E5E7]"
            >
              <ChevronLeft size={13} />
              <span>Previous</span>
            </button>
            <button
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={page === totalPages}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#F5F5F7] hover:bg-[#E5E5E7] text-[#1D1D1F] disabled:opacity-40 disabled:cursor-not-allowed transition border border-[#E5E5E7]"
            >
              <span>Next</span>
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      )}

      {/* Ticket Create Modal */}
      <TicketFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={loadTickets}
      />
    </div>
  );
};

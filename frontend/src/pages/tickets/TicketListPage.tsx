import React, { useState, useEffect } from 'react';
import type { Ticket } from '../../types/ticket';
import { fetchTicketsApi } from '../../api/tickets';
import { TicketCard } from '../../components/tickets/TicketCard';
import { TicketFormModal } from '../../components/tickets/TicketFormModal';

export const TicketListPage: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);

  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [pageSize] = useState<number>(10);

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

  // Reset to page 1 on filter change
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, priorityFilter]);

  return (
    <div className="space-y-6">
      {/* Header & Primary Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Service Tickets & Requests</h1>
          <p className="text-slate-400 text-sm">
            {total} total service request{total === 1 ? '' : 's'} in your authorized scope
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-sky-500/20 transition self-start md:self-auto"
        >
          + Create New Ticket
        </button>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ticket title, description, or ID..."
            className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
          />
        </div>

        <div className="flex gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
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
            className="px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>
        </div>
      </div>

      {/* Ticket Cards Grid */}
      {loading ? (
        <div className="py-16 text-center text-slate-400">Loading service tickets...</div>
      ) : error ? (
        <div className="py-12 text-center text-rose-400">{error}</div>
      ) : tickets.length === 0 ? (
        <div className="bg-slate-800/40 border border-slate-700/60 rounded-3xl p-12 text-center my-8">
          <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400 text-2xl mx-auto mb-4">
            📂
          </div>
          <h3 className="text-lg font-bold text-white mb-1">No Tickets Found</h3>
          <p className="text-slate-400 text-sm max-w-sm mx-auto mb-6">
            There are no tickets matching your current query in your permission scope.
          </p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-medium text-sm transition"
          >
            Create Ticket Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tickets.map((t) => (
            <TicketCard key={t.id} ticket={t} />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2 py-4">
          <button
            onClick={() => setPage(prev => Math.max(1, prev - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Previous
          </button>
          <span className="text-slate-400 text-sm">
            Page <strong className="text-white">{page}</strong> of <strong className="text-white">{totalPages}</strong>
          </span>
          <button
            onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Next
          </button>
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

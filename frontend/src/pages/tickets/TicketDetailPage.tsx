import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { Ticket, TicketStatus, TicketPriority } from '../../types/ticket';
import type { Comment, TicketHistory } from '../../types/comment';
import { getTicketApi, updateTicketStatusApi, updateTicketPriorityApi, assignTicketApi, getTicketCommentsApi, addCommentApi, getTicketHistoryApi } from '../../api/tickets';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { useAuth } from '../../hooks/useAuth';

export const TicketDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [history, setHistory] = useState<TicketHistory[]>([]);
  const [commentText, setCommentText] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  const loadTicket = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const [ticketData, commentsData, historyData] = await Promise.all([
        getTicketApi(Number(id)),
        getTicketCommentsApi(Number(id)),
        getTicketHistoryApi(Number(id))
      ]);
      setTicket(ticketData);
      setComments(commentsData);
      setHistory(historyData);
    } catch (err: any) {
      console.error('Failed to load ticket:', err);
      setError(err.response?.data?.detail || 'Ticket not found or access forbidden.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTicket();
  }, [id]);

  if (loading) {
    return <div className="py-20 text-center text-slate-400">Loading ticket #{id}...</div>;
  }

  if (error || !ticket) {
    return (
      <div className="py-16 text-center">
        <h2 className="text-xl font-bold text-white mb-2">Error Loading Ticket</h2>
        <p className="text-slate-400 mb-6">{error}</p>
        <Link to="/tickets" className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-sm">
          Return to Ticket List
        </Link>
      </div>
    );
  }

  const handleStatusChange = async (newStatus: TicketStatus) => {
    setActionLoading(true);
    try {
      await updateTicketStatusApi(ticket.id, newStatus);
      await loadTicket();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to update status.');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePriorityChange = async (newPriority: TicketPriority) => {
    setActionLoading(true);
    try {
      await updateTicketPriorityApi(ticket.id, newPriority);
      await loadTicket();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to update priority.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSelfAssign = async () => {
    if (!user) return;
    setActionLoading(true);
    try {
      await assignTicketApi(ticket.id, user.id);
      await loadTicket();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to assign ticket.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !ticket) return;
    setActionLoading(true);
    try {
      await addCommentApi(ticket.id, { content: commentText, is_internal: isInternal });
      setCommentText('');
      setIsInternal(false);
      const commentsData = await getTicketCommentsApi(ticket.id);
      setComments(commentsData);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to add comment.');
    } finally {
      setActionLoading(false);
    }
  };

  const isStaff = user && ['SUPPORT_AGENT', 'MANAGER', 'ADMIN'].includes(user.role.name);

  return (
    <div className="space-y-6">
      {/* Navigation Breadcrumb */}
      <div>
        <Link to="/tickets" className="text-xs font-semibold text-sky-400 hover:underline flex items-center space-x-1">
          <span>&larr; Back to Ticket List</span>
        </Link>
      </div>

      {/* Main Ticket Card Header */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-700/60">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <span className="text-sm font-mono text-slate-400 font-bold">Ticket #{ticket.id}</span>
              <StatusBadge status={ticket.status} />
              <PriorityBadge priority={ticket.priority} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{ticket.title}</h1>
          </div>

          <div className="flex flex-col items-end">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Dynamic SLA State</span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold border ${
                ticket.sla_status === 'SAFE'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : ticket.sla_status === 'AT_RISK'
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
              }`}
            >
              {ticket.sla_status.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Action Controls for Staff / Employee */}
        <div className="bg-slate-900/60 rounded-2xl p-4 mb-6 border border-slate-700/50 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <span className="text-xs font-semibold text-slate-400 uppercase">Available Actions:</span>

            {/* Employee Reopen action */}
            {user?.role.name === 'EMPLOYEE' && ['RESOLVED', 'CLOSED'].includes(ticket.status) && (
              <button
                disabled={actionLoading}
                onClick={() => handleStatusChange('REOPENED')}
                className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold transition"
              >
                Reopen Ticket
              </button>
            )}

            {/* Staff Status Actions */}
            {isStaff && (
              <>
                {ticket.status === 'OPEN' && (
                  <button
                    disabled={actionLoading}
                    onClick={() => handleStatusChange('IN_PROGRESS')}
                    className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition"
                  >
                    Start Working (In Progress)
                  </button>
                )}
                {['OPEN', 'ASSIGNED', 'IN_PROGRESS'].includes(ticket.status) && (
                  <button
                    disabled={actionLoading}
                    onClick={() => handleStatusChange('RESOLVED')}
                    className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold transition"
                  >
                    Mark Resolved
                  </button>
                )}
                {ticket.status === 'RESOLVED' && (
                  <button
                    disabled={actionLoading}
                    onClick={() => handleStatusChange('CLOSED')}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold transition"
                  >
                    Close Ticket
                  </button>
                )}
                {/* Priority Escalation Controls */}
                <div className="flex items-center space-x-1 pl-2 border-l border-slate-700">
                  <span className="text-[11px] text-slate-400">Prio:</span>
                  {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as TicketPriority[]).map((p) => (
                    <button
                      key={p}
                      disabled={actionLoading || ticket.priority === p}
                      onClick={() => handlePriorityChange(p)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border transition ${
                        ticket.priority === p ? 'bg-sky-500 text-white border-sky-400' : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Self Assign Button for Support Agent */}
          {isStaff && !ticket.assigned_agent && (
            <button
              disabled={actionLoading}
              onClick={handleSelfAssign}
              className="px-4 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition shadow-md shadow-sky-500/20"
            >
              Assign to Me
            </button>
          )}
        </div>

        {/* Ticket Description */}
        <div className="mb-8">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Description</h3>
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-700/60 text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">
            {ticket.description}
          </div>
        </div>

        {/* Ticket Metadata Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-700/60 text-xs">
          <div>
            <span className="text-slate-400 block mb-1">Creator</span>
            <strong className="text-white font-medium block">{ticket.creator.full_name}</strong>
            <span className="text-slate-400">{ticket.creator.email}</span>
          </div>

          <div>
            <span className="text-slate-400 block mb-1">Assigned Agent</span>
            <strong className="text-sky-400 font-medium block">
              {ticket.assigned_agent ? ticket.assigned_agent.full_name : 'Unassigned'}
            </strong>
          </div>

          <div>
            <span className="text-slate-400 block mb-1">Department / Category</span>
            <strong className="text-white font-medium block">{ticket.department.name}</strong>
            <span className="text-slate-400">{ticket.category.name}</span>
          </div>

          <div>
            <span className="text-slate-400 block mb-1">SLA Deadline Target</span>
            <strong className="text-white font-medium block">
              {new Date(ticket.sla_deadline).toLocaleString()}
            </strong>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-8 shadow-xl">
            <h3 className="text-xl font-bold text-white mb-6">Comments</h3>
            <div className="space-y-4 mb-6">
              {comments.map(c => (
                <div key={c.id} className={`p-4 rounded-xl ${c.is_internal ? 'bg-amber-900/30 border border-amber-500/30' : 'bg-slate-900/80 border border-slate-700/60'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="font-bold text-sky-400 text-sm">{c.author.full_name}</span>
                      {c.is_internal && <span className="ml-2 text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded uppercase font-bold tracking-wider">Internal</span>}
                    </div>
                    <span className="text-xs text-slate-500">{new Date(c.created_at).toLocaleString()}</span>
                  </div>
                  <div className="text-sm text-slate-300 whitespace-pre-wrap">{c.content}</div>
                </div>
              ))}
              {comments.length === 0 && <p className="text-slate-500 text-sm italic">No comments yet.</p>}
            </div>

            <form onSubmit={handleAddComment} className="mt-4">
              <textarea
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                className="w-full bg-slate-900/60 border border-slate-700 rounded-xl p-3 text-sm text-white mb-3 min-h-[100px] focus:outline-none focus:border-sky-500"
              />
              <div className="flex items-center justify-between">
                {isStaff ? (
                  <label className="flex items-center space-x-2 cursor-pointer text-sm text-slate-400">
                    <input type="checkbox" checked={isInternal} onChange={e => setIsInternal(e.target.checked)} className="rounded bg-slate-900 border-slate-700 text-sky-500" />
                    <span>Internal Note</span>
                  </label>
                ) : <div/>}
                <button
                  type="submit"
                  disabled={actionLoading || !commentText.trim()}
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold disabled:opacity-50"
                >
                  Post Comment
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-6 shadow-xl h-full">
            <h3 className="text-lg font-bold text-white mb-6">Activity Timeline</h3>
            <div className="space-y-4">
              {history.map(h => (
                <div key={h.id} className="relative pl-4 border-l-2 border-slate-700">
                  <div className="absolute -left-1.5 top-1.5 w-2.5 h-2.5 bg-slate-500 rounded-full"></div>
                  <div className="text-xs text-slate-500 mb-1">{new Date(h.timestamp).toLocaleString()}</div>
                  <div className="text-sm text-slate-300">
                    <span className="font-semibold text-sky-400">{h.actor.full_name}</span>{' '}
                    <span className="text-slate-400">{h.action.replace('_', ' ').toLowerCase()}</span>
                    {h.new_value && (
                      <div className="mt-1 text-xs">
                        {h.old_value && <span className="line-through text-slate-500 mr-2">{h.old_value}</span>}
                        <span className="text-emerald-400">{h.new_value}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

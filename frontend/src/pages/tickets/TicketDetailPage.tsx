import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  UserCheck,
  CheckCircle2,
  MessageSquare,
  History,
  Shield,
  Send,
  Lock,
  Building,
  Folder,
  User,
  Calendar,
  AlertTriangle,
  Play,
} from 'lucide-react';
import type { Ticket, TicketStatus, TicketPriority } from '../../types/ticket';
import type { Comment, TicketHistory } from '../../types/comment';
import {
  getTicketApi,
  updateTicketStatusApi,
  updateTicketPriorityApi,
  assignTicketApi,
  getTicketCommentsApi,
  addCommentApi,
  getTicketHistoryApi,
} from '../../api/tickets';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { SLATimer } from '../../components/tickets/SLATimer';
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
        getTicketHistoryApi(Number(id)),
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
    return (
      <div className="py-20 text-center text-[#86868B] bg-white rounded-2xl border border-[#E5E5E7]">
        <div className="w-6 h-6 border-2 border-[#0071E3] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        <p className="text-xs font-medium">Loading ticket #{id}...</p>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="py-14 text-center bg-white rounded-2xl border border-[#FCD0CE] max-w-md mx-auto p-6 shadow-sm">
        <div className="w-10 h-10 bg-[#FEECEB] border border-[#FCD0CE] text-[#FF3B30] rounded-xl flex items-center justify-center mx-auto mb-3">
          <AlertTriangle size={18} />
        </div>
        <h2 className="text-sm font-semibold text-[#1D1D1F] mb-1">Ticket Unavailable</h2>
        <p className="text-[#6E6E73] text-xs mb-5 leading-relaxed">{error}</p>
        <Link
          to="/tickets"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0071E3] hover:bg-[#0077ED] text-white rounded-xl text-xs font-medium transition shadow-sm"
        >
          <ArrowLeft size={13} />
          <span>Back to Ticket List</span>
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
      const historyData = await getTicketHistoryApi(ticket.id);
      setHistory(historyData);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to add comment.');
    } finally {
      setActionLoading(false);
    }
  };

  const isStaff = user && ['SUPPORT_AGENT', 'MANAGER', 'ADMIN'].includes(user.role.name);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Breadcrumb Link */}
      <div className="flex items-center justify-between pb-2 border-b border-[#E5E5E7]">
        <Link
          to="/tickets"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#0071E3] hover:text-[#0077ED] transition"
        >
          <ArrowLeft size={13} />
          <span>All Tickets</span>
        </Link>
        <span className="text-xs font-mono text-[#86868B]">
          Created {new Date(ticket.created_at).toLocaleString([], { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
      </div>

      {/* Main Ticket Card Header */}
      <div className="bg-white rounded-2xl p-6 sm:p-7 border border-[#E5E5E7] shadow-sm space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5 pb-5 border-b border-[#F5F5F7]">
          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono text-[#6E6E73] font-semibold bg-[#F5F5F7] px-2 py-0.5 rounded border border-[#E5E5E7]">
                #{ticket.id}
              </span>
              <StatusBadge status={ticket.status} size="sm" />
              <PriorityBadge priority={ticket.priority} size="sm" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#1D1D1F] tracking-tight leading-snug">
              {ticket.title}
            </h1>
          </div>

          {/* SLA Tracker Widget */}
          <div className="w-full lg:w-64 shrink-0">
            <SLATimer ticket={ticket} />
          </div>
        </div>

        {/* Workflow Actions Toolbar */}
        <div className="bg-[#F8F9FA] rounded-xl p-3.5 border border-[#E5E5E7] flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold text-[#86868B] uppercase tracking-wider mr-1">
              Workflow:
            </span>

            {/* Employee Reopen action */}
            {user?.role.name === 'EMPLOYEE' && ['RESOLVED', 'CLOSED'].includes(ticket.status) && (
              <button
                disabled={actionLoading}
                onClick={() => handleStatusChange('REOPENED')}
                className="px-3 py-1 rounded-lg bg-[#FFF4E5] hover:bg-[#FFE0B2] text-[#D97706] text-xs font-medium border border-[#FFE0B2] transition disabled:opacity-50"
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
                    className="flex items-center gap-1 px-3 py-1 rounded-lg bg-[#EBF5FF] hover:bg-[#D0E6FF] text-[#0071E3] text-xs font-medium border border-[#D0E6FF] transition disabled:opacity-50"
                  >
                    <Play size={11} />
                    <span>Start Work</span>
                  </button>
                )}
                {['OPEN', 'ASSIGNED', 'IN_PROGRESS'].includes(ticket.status) && (
                  <button
                    disabled={actionLoading}
                    onClick={() => handleStatusChange('RESOLVED')}
                    className="flex items-center gap-1 px-3 py-1 rounded-lg bg-[#EAF7EE] hover:bg-[#C2EBD0] text-[#248A3D] text-xs font-medium border border-[#C2EBD0] transition disabled:opacity-50"
                  >
                    <CheckCircle2 size={11} />
                    <span>Mark Resolved</span>
                  </button>
                )}
                {ticket.status === 'RESOLVED' && (
                  <button
                    disabled={actionLoading}
                    onClick={() => handleStatusChange('CLOSED')}
                    className="px-3 py-1 rounded-lg bg-[#F5F5F7] hover:bg-[#E5E5E7] text-[#6E6E73] text-xs font-medium border border-[#E5E5E7] transition disabled:opacity-50"
                  >
                    Close Ticket
                  </button>
                )}

                {/* Priority Escalation Pills */}
                <div className="flex items-center gap-1 pl-2 border-l border-[#E5E5E7]">
                  <span className="text-[10px] text-[#86868B] uppercase font-semibold">Priority:</span>
                  {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as TicketPriority[]).map((p) => (
                    <button
                      key={p}
                      disabled={actionLoading || ticket.priority === p}
                      onClick={() => handlePriorityChange(p)}
                      className={`px-2 py-0.5 rounded text-[10px] font-medium border transition ${
                        ticket.priority === p
                          ? 'bg-white text-[#1D1D1F] border-[#1D1D1F] shadow-sm font-semibold'
                          : 'bg-[#F5F5F7] text-[#86868B] border-[#E5E5E7] hover:bg-white hover:text-[#1D1D1F]'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Self Assign Button */}
          {isStaff && !ticket.assigned_agent && (
            <button
              disabled={actionLoading}
              onClick={handleSelfAssign}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-medium transition shadow-sm disabled:opacity-50"
            >
              <UserCheck size={13} />
              <span>Assign to Me</span>
            </button>
          )}
        </div>

        {/* Description Section */}
        <div>
          <div className="text-[11px] font-semibold text-[#86868B] uppercase tracking-wider mb-2">
            Description
          </div>
          <div className="p-4 rounded-xl bg-[#F8F9FA] border border-[#E5E5E7] text-[#1D1D1F] text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-normal">
            {ticket.description}
          </div>
        </div>
      </div>

      {/* 2-Column Details: Comments Thread & Metadata/Audit */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Comments */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-[#E5E5E7] shadow-sm">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-[#F5F5F7]">
              <div className="flex items-center gap-2">
                <MessageSquare size={16} className="text-[#0071E3]" />
                <h3 className="text-sm font-semibold text-[#1D1D1F]">Discussion & Notes</h3>
              </div>
              <span className="text-xs text-[#86868B]">{comments.length} message(s)</span>
            </div>

            {/* Comment Thread */}
            <div className="space-y-3.5 mb-5">
              {comments.length === 0 ? (
                <div className="py-8 text-center text-[#86868B] text-xs italic">
                  No comments yet. Write a response below.
                </div>
              ) : (
                comments.map((c) => (
                  <div
                    key={c.id}
                    className={`p-3.5 rounded-xl border ${
                      c.is_internal
                        ? 'bg-[#FFF4E5] border-[#FFE0B2]'
                        : 'bg-[#F8F9FA] border-[#E5E5E7]'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-[#E5E5E7] text-[#1D1D1F] flex items-center justify-center font-bold text-[10px]">
                          {c.author.full_name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .toUpperCase()}
                        </div>
                        <div>
                          <span className="font-semibold text-xs text-[#1D1D1F] block leading-tight">
                            {c.author.full_name}
                          </span>
                          <span className="text-[10px] text-[#86868B]">{c.author.email}</span>
                        </div>
                        {c.is_internal && (
                          <span className="ml-1 inline-flex items-center gap-1 text-[9px] bg-[#FFE0B2] text-[#D97706] px-1.5 py-0.2 rounded font-semibold uppercase tracking-wider">
                            <Lock size={9} />
                            Internal Note
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-[#86868B] font-mono">
                        {new Date(c.created_at).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-[#1D1D1F] leading-relaxed pl-8 whitespace-pre-wrap">
                      {c.content}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Comment Form */}
            <form onSubmit={handleAddComment} className="pt-3 border-t border-[#F5F5F7]">
              <div className="mb-3">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder={
                    isInternal
                      ? 'Add an internal staff note (visible only to support agents)...'
                      : 'Write a response...'
                  }
                  rows={3}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs text-[#1D1D1F] placeholder-[#86868B] focus:outline-none transition leading-relaxed resize-none ${
                    isInternal
                      ? 'bg-[#FFF9F2] border-[#FFE0B2] focus:border-[#D97706] focus:ring-2 focus:ring-[#D97706]/15'
                      : 'bg-white border-[#D2D2D7] focus:border-[#0071E3] focus:ring-2 focus:ring-[#0071E3]/15'
                  }`}
                />
              </div>

              <div className="flex items-center justify-between">
                {isStaff ? (
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-[#6E6E73] select-none">
                    <input
                      type="checkbox"
                      checked={isInternal}
                      onChange={(e) => setIsInternal(e.target.checked)}
                      className="rounded border-[#D2D2D7] text-[#0071E3] focus:ring-0 w-3.5 h-3.5 cursor-pointer"
                    />
                    <span className={isInternal ? 'text-[#D97706] font-medium' : ''}>
                      Internal staff note
                    </span>
                  </label>
                ) : (
                  <div />
                )}

                <button
                  type="submit"
                  disabled={actionLoading || !commentText.trim()}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-medium transition shadow-sm disabled:opacity-40"
                >
                  <Send size={12} />
                  <span>Send</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Metadata & Audit Timeline */}
        <div className="space-y-6">
          {/* Metadata Card */}
          <div className="bg-white rounded-2xl p-5 border border-[#E5E5E7] shadow-sm space-y-3.5">
            <h3 className="text-xs font-semibold text-[#1D1D1F] uppercase tracking-wider pb-2.5 border-b border-[#F5F5F7] flex items-center gap-1.5">
              <Shield size={14} className="text-[#0071E3]" />
              <span>Details</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#86868B] flex items-center gap-1.5">
                  <User size={13} />
                  <span>Requester</span>
                </span>
                <span className="text-[#1D1D1F] font-medium">{ticket.creator.full_name}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#86868B] flex items-center gap-1.5">
                  <UserCheck size={13} />
                  <span>Assignee</span>
                </span>
                <span className="font-medium text-[#0071E3]">
                  {ticket.assigned_agent ? ticket.assigned_agent.full_name : 'Unassigned'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#86868B] flex items-center gap-1.5">
                  <Building size={13} />
                  <span>Department</span>
                </span>
                <span className="text-[#1D1D1F]">{ticket.department.name}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#86868B] flex items-center gap-1.5">
                  <Folder size={13} />
                  <span>Category</span>
                </span>
                <span className="text-[#1D1D1F]">{ticket.category.name}</span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#F5F5F7]">
                <span className="text-[#86868B] flex items-center gap-1.5">
                  <Calendar size={13} />
                  <span>SLA Target</span>
                </span>
                <span className="text-[#1D1D1F] font-mono text-[11px]">
                  {new Date(ticket.sla_deadline).toLocaleDateString([], {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="bg-white rounded-2xl p-5 border border-[#E5E5E7] shadow-sm">
            <h3 className="text-xs font-semibold text-[#1D1D1F] uppercase tracking-wider pb-2.5 border-b border-[#F5F5F7] mb-3.5 flex items-center gap-1.5">
              <History size={14} className="text-[#0071E3]" />
              <span>Audit History</span>
            </h3>

            <div className="space-y-3.5 max-h-72 overflow-y-auto pr-1">
              {history.length === 0 ? (
                <div className="text-xs text-[#86868B] italic">No history logged yet.</div>
              ) : (
                history.map((h) => (
                  <div key={h.id} className="relative pl-4 border-l border-[#E5E5E7] pb-1.5 last:pb-0">
                    <div className="absolute -left-[4px] top-1 w-2 h-2 rounded-full bg-[#8E8E93]"></div>
                    <div className="text-[10px] text-[#86868B] font-mono mb-0.5">
                      {new Date(h.timestamp).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                    <div className="text-xs text-[#1D1D1F]">
                      <span className="font-semibold">{h.actor.full_name}</span>{' '}
                      <span className="text-[#6E6E73]">{h.action.replace('_', ' ').toLowerCase()}</span>
                      {h.new_value && (
                        <div className="mt-0.5 text-[11px] font-mono bg-[#F8F9FA] p-1 rounded border border-[#E5E5E7]">
                          {h.old_value && (
                            <span className="line-through text-[#86868B] mr-1.5">{h.old_value}</span>
                          )}
                          <span className="text-[#248A3D] font-medium">{h.new_value}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { Link } from 'react-router-dom';
import type { Ticket } from '../../types/ticket';
import { StatusBadge } from '../common/StatusBadge';
import { PriorityBadge } from '../common/PriorityBadge';

interface TicketCardProps {
  ticket: Ticket;
}

export const TicketCard: React.FC<TicketCardProps> = ({ ticket }) => {
  const slaStyles: Record<string, string> = {
    SAFE: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    AT_RISK: 'text-amber-400 bg-amber-500/10 border-amber-500/20 animate-pulse',
    BREACHED: 'text-rose-400 bg-rose-500/10 border-rose-500/20 font-bold',
  };

  const formattedDate = new Date(ticket.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Link
      to={`/tickets/${ticket.id}`}
      className="block bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-slate-600 rounded-2xl p-6 transition duration-200 shadow-lg group"
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-mono text-slate-400 font-semibold">#{ticket.id}</span>
          <StatusBadge status={ticket.status} size="sm" />
          <PriorityBadge priority={ticket.priority} size="sm" />
        </div>
        <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${slaStyles[ticket.sla_status]}`}>
          SLA: {ticket.sla_status.replace('_', ' ')}
        </span>
      </div>

      <h3 className="text-lg font-bold text-white group-hover:text-sky-400 transition mb-2 line-clamp-1">
        {ticket.title}
      </h3>

      <p className="text-slate-400 text-sm mb-4 line-clamp-2 leading-relaxed">
        {ticket.description}
      </p>

      <div className="flex items-center justify-between pt-4 border-t border-slate-700/50 text-xs text-slate-400">
        <div className="flex items-center space-x-4">
          <span>
            Dept: <strong className="text-slate-300 font-medium">{ticket.department.name}</strong>
          </span>
          <span>
            Category: <strong className="text-slate-300 font-medium">{ticket.category.name}</strong>
          </span>
        </div>
        <div>
          <span>Created by <strong className="text-slate-300 font-medium">{ticket.creator.full_name}</strong> &bull; {formattedDate}</span>
        </div>
      </div>
    </Link>
  );
};

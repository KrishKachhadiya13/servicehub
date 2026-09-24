import React from 'react';
import { Link } from 'react-router-dom';
import { Building, Folder, ArrowRight } from 'lucide-react';
import type { Ticket } from '../../types/ticket';
import { StatusBadge } from '../common/StatusBadge';
import { PriorityBadge } from '../common/PriorityBadge';
import { SLATimer } from './SLATimer';

interface TicketCardProps {
  ticket: Ticket;
}

export const TicketCard: React.FC<TicketCardProps> = ({ ticket }) => {
  const formattedDate = new Date(ticket.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  return (
    <Link
      to={`/tickets/${ticket.id}`}
      className="group relative flex flex-col justify-between apple-card p-5 sm:p-6 transition-all duration-200 hover:border-[#C7C7CC] hover:shadow-[0_4px_14px_rgba(0,0,0,0.05)]"
    >
      <div>
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-[#6E6E73] font-semibold bg-[#F5F5F7] px-2 py-0.5 rounded border border-[#E5E5E7]">
              #{ticket.id}
            </span>
            <StatusBadge status={ticket.status} size="sm" />
            <PriorityBadge priority={ticket.priority} size="sm" />
          </div>
          <span className="text-[11px] text-[#86868B]">{formattedDate}</span>
        </div>

        <h3 className="text-base font-semibold text-[#1D1D1F] group-hover:text-[#0071E3] transition-colors line-clamp-1 mb-1.5">
          {ticket.title}
        </h3>

        <p className="text-[#6E6E73] text-xs sm:text-sm mb-4 line-clamp-2 leading-relaxed">
          {ticket.description}
        </p>
      </div>

      <div className="space-y-3 pt-3 border-t border-[#F5F5F7]">
        <SLATimer ticket={ticket} compact />

        <div className="flex items-center justify-between text-xs text-[#6E6E73] pt-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 bg-[#F5F5F7] px-2 py-0.5 rounded text-[11px] text-[#1D1D1F]">
              <Building size={11} className="text-[#86868B]" />
              <span>{ticket.department.name}</span>
            </span>
            <span className="inline-flex items-center gap-1 bg-[#F5F5F7] px-2 py-0.5 rounded text-[11px] text-[#6E6E73]">
              <Folder size={11} className="text-[#86868B]" />
              <span>{ticket.category.name}</span>
            </span>
          </div>

          <div className="flex items-center gap-1 text-[#0071E3] text-xs font-medium pl-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <span>View</span>
            <ArrowRight size={12} />
          </div>
        </div>
      </div>
    </Link>
  );
};

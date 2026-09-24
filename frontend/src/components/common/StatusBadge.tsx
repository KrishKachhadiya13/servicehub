import React from 'react';
import type { TicketStatus } from '../../types/ticket';

interface StatusBadgeProps {
  status: TicketStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const styles: Record<TicketStatus, string> = {
    OPEN: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    ASSIGNED: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
    IN_PROGRESS: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    RESOLVED: 'bg-teal-500/10 text-teal-400 border-teal-500/30',
    CLOSED: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
    REOPENED: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  };

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center font-bold tracking-wide rounded-full border ${sizeClasses} ${styles[status]}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5"></span>
      {status.replace('_', ' ')}
    </span>
  );
};

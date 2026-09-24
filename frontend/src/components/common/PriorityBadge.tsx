import React from 'react';
import type { TicketPriority } from '../../types/ticket';

interface PriorityBadgeProps {
  priority: TicketPriority;
  size?: 'sm' | 'md';
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, size = 'md' }) => {
  const styles: Record<TicketPriority, string> = {
    LOW: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
    MEDIUM: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    HIGH: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    CRITICAL: 'bg-rose-500/10 text-rose-400 border-rose-500/30 animate-pulse',
  };

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center font-bold tracking-wide rounded-full border ${sizeClasses} ${styles[priority]}`}
    >
      {priority}
    </span>
  );
};

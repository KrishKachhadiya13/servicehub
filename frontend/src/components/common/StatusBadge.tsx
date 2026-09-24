import React from 'react';
import type { TicketStatus } from '../../types/ticket';

interface StatusBadgeProps {
  status: TicketStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const config: Record<
    TicketStatus,
    { bg: string; text: string; border: string; dot: string; label: string }
  > = {
    OPEN: {
      bg: 'bg-[#EAF7EE]',
      text: 'text-[#248A3D]',
      border: 'border-[#C2EBD0]',
      dot: 'bg-[#34C759]',
      label: 'Open',
    },
    ASSIGNED: {
      bg: 'bg-[#EBF5FF]',
      text: 'text-[#0071E3]',
      border: 'border-[#D0E6FF]',
      dot: 'bg-[#0071E3]',
      label: 'Assigned',
    },
    IN_PROGRESS: {
      bg: 'bg-[#F3E8FF]',
      text: 'text-[#7C3AED]',
      border: 'border-[#E9D5FF]',
      dot: 'bg-[#9333EA]',
      label: 'In Progress',
    },
    RESOLVED: {
      bg: 'bg-[#E6F8F6]',
      text: 'text-[#0D9488]',
      border: 'border-[#BAECE6]',
      dot: 'bg-[#14B8A6]',
      label: 'Resolved',
    },
    CLOSED: {
      bg: 'bg-[#F5F5F7]',
      text: 'text-[#6E6E73]',
      border: 'border-[#E5E5E7]',
      dot: 'bg-[#8E8E93]',
      label: 'Closed',
    },
    REOPENED: {
      bg: 'bg-[#FFF4E5]',
      text: 'text-[#D97706]',
      border: 'border-[#FFE0B2]',
      dot: 'bg-[#FF9F0A]',
      label: 'Reopened',
    },
  };

  const style = config[status] || config.OPEN;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[11px] gap-1.5',
    md: 'px-2.5 py-0.5 text-xs gap-1.5',
    lg: 'px-3 py-1 text-xs gap-2',
  }[size];

  return (
    <span
      className={`inline-flex items-center font-medium rounded-md border ${sizeClasses} ${style.bg} ${style.text} ${style.border}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`}></span>
      {style.label}
    </span>
  );
};

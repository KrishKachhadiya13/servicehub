import React from 'react';
import type { TicketPriority } from '../../types/ticket';

interface PriorityBadgeProps {
  priority: TicketPriority;
  size?: 'sm' | 'md' | 'lg';
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, size = 'md' }) => {
  const config: Record<
    TicketPriority,
    { bg: string; text: string; border: string; dot: string; label: string }
  > = {
    LOW: {
      bg: 'bg-[#F5F5F7]',
      text: 'text-[#6E6E73]',
      border: 'border-[#E5E5E7]',
      dot: 'bg-[#8E8E93]',
      label: 'Low',
    },
    MEDIUM: {
      bg: 'bg-[#EBF5FF]',
      text: 'text-[#0071E3]',
      border: 'border-[#D0E6FF]',
      dot: 'bg-[#0071E3]',
      label: 'Medium',
    },
    HIGH: {
      bg: 'bg-[#FFF4E5]',
      text: 'text-[#D97706]',
      border: 'border-[#FFE0B2]',
      dot: 'bg-[#FF9F0A]',
      label: 'High',
    },
    CRITICAL: {
      bg: 'bg-[#FEECEB]',
      text: 'text-[#FF3B30]',
      border: 'border-[#FCD0CE]',
      dot: 'bg-[#FF3B30]',
      label: 'Critical',
    },
  };

  const style = config[priority] || config.LOW;

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

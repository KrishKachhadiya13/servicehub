import React, { useState, useEffect } from 'react';
import { ShieldCheck, AlertTriangle, AlertOctagon, Clock } from 'lucide-react';
import type { Ticket } from '../../types/ticket';

interface SLATimerProps {
  ticket: Ticket;
  compact?: boolean;
}

export const SLATimer: React.FC<SLATimerProps> = ({ ticket, compact = false }) => {
  const [timeLeft, setTimeLeft] = useState(ticket.time_remaining_seconds);

  useEffect(() => {
    setTimeLeft(ticket.time_remaining_seconds);

    // Only countdown if not resolved/closed
    if (['RESOLVED', 'CLOSED'].includes(ticket.status)) return;
    if (ticket.sla_status === 'BREACHED') return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [ticket.time_remaining_seconds, ticket.status, ticket.sla_status]);

  const formatTime = (seconds: number) => {
    if (seconds <= 0) return '0h 0m';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m ${s}s`;
  };

  const slaConfig = {
    SAFE: {
      label: 'SLA Safe',
      shortLabel: 'Safe',
      badgeClass: 'text-[#248A3D] bg-[#EAF7EE] border-[#C2EBD0]',
      barClass: 'bg-[#34C759]',
      Icon: ShieldCheck,
    },
    AT_RISK: {
      label: 'At Risk',
      shortLabel: 'At Risk',
      badgeClass: 'text-[#D97706] bg-[#FFF4E5] border-[#FFE0B2]',
      barClass: 'bg-[#FF9F0A]',
      Icon: AlertTriangle,
    },
    BREACHED: {
      label: 'SLA Breached',
      shortLabel: 'Breached',
      badgeClass: 'text-[#FF3B30] bg-[#FEECEB] border-[#FCD0CE]',
      barClass: 'bg-[#FF3B30]',
      Icon: AlertOctagon,
    },
  }[ticket.sla_status] || {
    label: 'Safe',
    shortLabel: 'Safe',
    badgeClass: 'text-[#248A3D] bg-[#EAF7EE] border-[#C2EBD0]',
    barClass: 'bg-[#34C759]',
    Icon: ShieldCheck,
  };

  const totalAllocated = Math.max(
    1,
    (new Date(ticket.sla_deadline).getTime() - new Date(ticket.created_at).getTime()) / 1000
  );
  const progressPercent = Math.min(100, Math.max(0, (1 - timeLeft / totalAllocated) * 100));
  const isResolved = ['RESOLVED', 'CLOSED'].includes(ticket.status);

  if (compact) {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        <div className="flex items-center justify-between text-[11px]">
          <span
            className={`inline-flex items-center gap-1 font-medium px-2 py-0.5 rounded border text-[10px] ${slaConfig.badgeClass}`}
          >
            <slaConfig.Icon size={11} />
            {slaConfig.shortLabel}
          </span>
          <span className="text-[#6E6E73] font-mono text-[11px]">
            {isResolved ? 'Met' : ticket.sla_status === 'BREACHED' ? 'Breached' : `${formatTime(timeLeft)} left`}
          </span>
        </div>
        <div className="w-full bg-[#E5E5E7] h-1.5 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${slaConfig.barClass} transition-all duration-700`}
            style={{ width: `${isResolved ? 100 : progressPercent}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F8F9FA] border border-[#E5E5E7] rounded-xl p-4 w-full">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className={`p-1.5 rounded-lg border ${slaConfig.badgeClass}`}>
            <slaConfig.Icon size={16} />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-[#86868B] uppercase tracking-wider">SLA Target</div>
            <div className="text-xs font-semibold text-[#1D1D1F]">{slaConfig.label}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center justify-end gap-1 text-sm font-semibold text-[#1D1D1F] font-mono tabular-nums">
            <Clock size={13} className="text-[#86868B]" />
            {isResolved
              ? 'Resolved'
              : ticket.sla_status === 'BREACHED'
              ? 'Breached'
              : formatTime(timeLeft)}
          </div>
          <span className="text-[11px] text-[#86868B]">
            {isResolved ? 'Met target' : 'Remaining'}
          </span>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="w-full bg-[#E5E5E7] h-1.5 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${slaConfig.barClass} transition-all duration-700`}
            style={{ width: `${isResolved ? 100 : progressPercent}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-[#86868B] font-medium">
          <span>Created: {new Date(ticket.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
          <span>Target: {new Date(ticket.sla_deadline).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>
    </div>
  );
};

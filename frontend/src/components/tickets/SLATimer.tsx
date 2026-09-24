import React, { useState, useEffect } from 'react';
import type { Ticket } from '../../types/ticket';

interface SLATimerProps {
  ticket: Ticket;
  compact?: boolean;
}

export const SLATimer: React.FC<SLATimerProps> = ({ ticket, compact = false }) => {
  const [timeLeft, setTimeLeft] = useState(ticket.time_remaining_seconds);

  useEffect(() => {
    setTimeLeft(ticket.time_remaining_seconds);
    
    // Only countdown if it's not resolved/closed
    if (['RESOLVED', 'CLOSED'].includes(ticket.status)) return;
    if (ticket.sla_status === 'BREACHED') return;

    const interval = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [ticket.time_remaining_seconds, ticket.status, ticket.sla_status]);

  const formatTime = (seconds: number) => {
    if (seconds <= 0) return '0h 0m 0s';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h}h ${m}m ${s}s`;
  };

  const slaStyles: Record<string, string> = {
    SAFE: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    AT_RISK: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    BREACHED: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
  };

  const barStyles: Record<string, string> = {
    SAFE: 'bg-emerald-500',
    AT_RISK: 'bg-amber-500',
    BREACHED: 'bg-rose-500',
  };

  const totalAllocated = Math.max(1, (new Date(ticket.sla_deadline).getTime() - new Date(ticket.created_at).getTime()) / 1000);
  const progressPercent = Math.min(100, Math.max(0, (1 - timeLeft / totalAllocated) * 100));

  if (compact) {
    return (
      <div className="flex flex-col gap-1 w-full mt-2">
        <div className="flex items-center justify-between text-[10px] font-semibold">
          <span className={`px-1.5 py-0.5 rounded border ${slaStyles[ticket.sla_status]}`}>
            SLA: {ticket.sla_status.replace('_', ' ')}
          </span>
          <span className="text-slate-400">{formatTime(timeLeft)} left</span>
        </div>
        <div className="w-full bg-slate-700/50 h-1 rounded-full overflow-hidden">
          <div 
            className={`h-full ${barStyles[ticket.sla_status]} transition-all duration-1000`} 
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/40 border border-slate-700/50 rounded-xl p-4 w-full">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Dynamic SLA State</span>
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${slaStyles[ticket.sla_status]}`}>
            {ticket.sla_status.replace('_', ' ')}
          </span>
        </div>
        <div className="text-right">
          <span className="block text-sm font-bold text-white tabular-nums">
            {ticket.sla_status === 'BREACHED' ? 'SLA BREACHED' : formatTime(timeLeft)}
          </span>
          <span className="block text-[10px] text-slate-500">Remaining Time</span>
        </div>
      </div>
      
      <div className="relative pt-1">
        <div className="w-full bg-slate-700/50 h-2 rounded-full overflow-hidden">
          <div 
            className={`h-full ${barStyles[ticket.sla_status]} transition-all duration-1000`} 
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-slate-500 font-medium mt-1">
          <span>{new Date(ticket.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          <span>Deadline: {new Date(ticket.sla_deadline).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>
    </div>
  );
};

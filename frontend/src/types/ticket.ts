import type { User, Department } from './auth';

export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type TicketStatus = 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'REOPENED';
export type SLAStatus = 'SAFE' | 'AT_RISK' | 'BREACHED';

export interface Category {
  id: number;
  name: string;
  description?: string;
  department_id?: number;
}

export interface Ticket {
  id: number;
  title: string;
  description: string;
  creator_id: number;
  assigned_agent_id?: number;
  department_id: number;
  category_id: number;
  priority: TicketPriority;
  status: TicketStatus;
  sla_deadline: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  closed_at?: string;

  creator: User;
  assigned_agent?: User;
  department: Department;
  category: Category;

  sla_status: SLAStatus;
  time_remaining_seconds: number;
}

export interface TicketCreatePayload {
  title: string;
  description: string;
  department_id: number;
  category_id: number;
  priority: TicketPriority;
}

export interface TicketPagination {
  items: Ticket[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

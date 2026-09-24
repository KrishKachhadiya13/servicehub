import type { User } from './auth';

export interface AuditLog {
  id: number;
  actor_id?: number;
  action: string;
  entity: string;
  entity_id: string;
  details?: string;
  ip_address?: string;
  timestamp: string;
  
  actor?: User;
}

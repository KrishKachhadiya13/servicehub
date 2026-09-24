import api from './client';
import type { AuditLog } from '../types/audit';

export const getAuditLogsApi = async (limit: number = 50): Promise<AuditLog[]> => {
  const response = await api.get('/audit', { params: { limit } });
  return response.data;
};

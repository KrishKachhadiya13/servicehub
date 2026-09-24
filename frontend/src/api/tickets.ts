import api from './client';
import type { Ticket, TicketCreatePayload, TicketPagination, Category } from '../types/ticket';
import type { Comment, CommentCreate, TicketHistory } from '../types/comment';
import type { Department } from '../types/auth';

export interface TicketFilterParams {
  page?: number;
  size?: number;
  status?: string;
  priority?: string;
  department_id?: number;
  category_id?: number;
  search?: string;
}

export const fetchTicketsApi = async (params?: TicketFilterParams): Promise<TicketPagination> => {
  const response = await api.get<TicketPagination>('/tickets', { params });
  return response.data;
};

export const getTicketApi = async (id: number): Promise<Ticket> => {
  const response = await api.get<Ticket>(`/tickets/${id}`);
  return response.data;
};

export const createTicketApi = async (payload: TicketCreatePayload): Promise<Ticket> => {
  const response = await api.post<Ticket>('/tickets', payload);
  return response.data;
};

export const updateTicketStatusApi = async (id: number, status: string): Promise<Ticket> => {
  const response = await api.patch<Ticket>(`/tickets/${id}/status`, { status });
  return response.data;
};

export const assignTicketApi = async (id: number, assigned_agent_id: number | null): Promise<Ticket> => {
  const response = await api.patch<Ticket>(`/tickets/${id}/assign`, { assigned_agent_id });
  return response.data;
};

export const updateTicketPriorityApi = async (id: number, priority: string): Promise<Ticket> => {
  const response = await api.patch<Ticket>(`/tickets/${id}/priority`, { priority });
  return response.data;
};

export const fetchDepartmentsApi = async (): Promise<Department[]> => {
  const response = await api.get<Department[]>('/departments');
  return response.data;
};

export const fetchCategoriesApi = async (department_id?: number): Promise<Category[]> => {
  const response = await api.get<Category[]>('/categories', { params: { department_id } });
  return response.data;
};

export const getTicketCommentsApi = async (ticketId: number): Promise<Comment[]> => {
  const response = await api.get<Comment[]>(`/tickets/${ticketId}/comments`);
  return response.data;
};

export const addCommentApi = async (ticketId: number, payload: CommentCreate): Promise<Comment> => {
  const response = await api.post<Comment>(`/tickets/${ticketId}/comments`, payload);
  return response.data;
};

export const getTicketHistoryApi = async (ticketId: number): Promise<TicketHistory[]> => {
  const response = await api.get<TicketHistory[]>(`/tickets/${ticketId}/history`);
  return response.data;
};

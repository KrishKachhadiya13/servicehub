import api from './client';
import type { LoginResponse, RegisterPayload, User } from '../types/auth';

export const loginApi = async (email: string, password: string): Promise<LoginResponse> => {
  const formData = new URLSearchParams();
  formData.append('username', email);
  formData.append('password', password);

  const response = await api.post<LoginResponse>('/auth/login', formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  return response.data;
};

export const loginJsonApi = async (email: string, password: string): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>('/auth/login/json', { email, password });
  return response.data;
};

export const registerApi = async (payload: RegisterPayload): Promise<User> => {
  const response = await api.post<User>('/auth/register', payload);
  return response.data;
};

export const getMeApi = async (): Promise<User> => {
  const response = await api.get<User>('/auth/me');
  return response.data;
};

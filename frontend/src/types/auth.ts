export type UserRole = 'EMPLOYEE' | 'SUPPORT_AGENT' | 'MANAGER' | 'ADMIN';

export interface Role {
  id: number;
  name: UserRole;
  description?: string;
}

export interface Department {
  id: number;
  name: string;
  description?: string;
}

export interface User {
  id: number;
  email: string;
  full_name: string;
  is_active: boolean;
  created_at: string;
  role: Role;
  department?: Department;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface RegisterPayload {
  email: string;
  full_name: string;
  password: string;
  department_id?: number;
}

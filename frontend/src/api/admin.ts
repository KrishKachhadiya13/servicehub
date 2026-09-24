import api from './client';

// Department API
export const getDepartmentsApi = async () => {
  const response = await api.get('/departments');
  return response.data;
};

export const createDepartmentApi = async (data: { name: string, description?: string }) => {
  const response = await api.post('/departments', data);
  return response.data;
};

export const updateDepartmentApi = async (id: number, data: { name: string, description?: string }) => {
  const response = await api.put(`/departments/${id}`, data);
  return response.data;
};

// Category API
export const getCategoriesApi = async () => {
  const response = await api.get('/categories');
  return response.data;
};

export const createCategoryApi = async (data: { name: string, description?: string, department_id?: number }) => {
  const response = await api.post('/categories', data);
  return response.data;
};

export const updateCategoryApi = async (id: number, data: { name: string, description?: string, department_id?: number }) => {
  const response = await api.put(`/categories/${id}`, data);
  return response.data;
};

// SLA API
export const getSlaPoliciesApi = async () => {
  const response = await api.get('/sla');
  return response.data;
};

export const updateSlaPolicyApi = async (id: number, data: { resolution_time_hours: number, description?: string }) => {
  const response = await api.put(`/sla/${id}`, data);
  return response.data;
};

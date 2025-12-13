import apiClient from './axios';

export interface Subject {
  id: string;
  name: string;
  classes?: Array<{
    id: string;
    name: string;
  }>;
}

export const subjectsApi = {
  getAll: async (): Promise<Subject[]> => {
    const response = await apiClient.get<Subject[]>('/subjects');
    return response.data;
  },

  getById: async (id: string): Promise<Subject> => {
    const response = await apiClient.get<Subject>(`/subjects/${id}`);
    return response.data;
  },

  create: async (data: { name: string }): Promise<Subject> => {
    const response = await apiClient.post<Subject>('/subjects', data);
    return response.data;
  },

  update: async (id: string, data: { name: string }): Promise<Subject> => {
    const response = await apiClient.put<Subject>(`/subjects/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/subjects/${id}`);
  },
};

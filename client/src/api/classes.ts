import apiClient from './axios';

export interface Class {
  id: string;
  name: string;
  teacherId: string | null;
  teacher?: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
  students?: Array<{
    id: string;
    firstName: string;
    lastName: string;
  }>;
  subjects?: Array<{
    id: string;
    name: string;
  }>;
}

export interface PaginatedClasses {
  classes: Class[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const classesApi = {
  getAll: async (page: number = 1, limit: number = 10): Promise<PaginatedClasses> => {
    const response = await apiClient.get<PaginatedClasses>('/classes', {
      params: { page, limit },
    });
    return response.data;
  },

  getById: async (id: string): Promise<Class> => {
    const response = await apiClient.get<Class>(`/classes/${id}`);
    return response.data;
  },

  create: async (data: { name: string; teacherId?: string }): Promise<Class> => {
    const response = await apiClient.post<Class>('/classes', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Class>): Promise<Class> => {
    const response = await apiClient.put<Class>(`/classes/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/classes/${id}`);
  },

  addSubject: async (id: string, subjectId: string): Promise<Class> => {
    const response = await apiClient.post<Class>(`/classes/${id}/subjects`, { subjectId });
    return response.data;
  },

  removeSubject: async (id: string, subjectId: string): Promise<Class> => {
    const response = await apiClient.delete<Class>(`/classes/${id}/subjects/${subjectId}`);
    return response.data;
  },
};

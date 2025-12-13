import apiClient from './axios';

export interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  userId: string;
  user: {
    id: string;
    email: string;
    role: string;
  };
  classes?: Array<{
    id: string;
    name: string;
  }>;
}

export interface PaginatedTeachers {
  teachers: Teacher[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const teachersApi = {
  getAll: async (page: number = 1, limit: number = 10): Promise<PaginatedTeachers> => {
    const response = await apiClient.get<PaginatedTeachers>('/teachers', {
      params: { page, limit },
    });
    return response.data;
  },

  getById: async (id: string): Promise<Teacher> => {
    const response = await apiClient.get<Teacher>(`/teachers/${id}`);
    return response.data;
  },

  getMyProfile: async (): Promise<Teacher> => {
    const response = await apiClient.get<Teacher>('/teachers/me');
    return response.data;
  },

  update: async (id: string, data: Partial<Teacher>): Promise<Teacher> => {
    const response = await apiClient.put<Teacher>(`/teachers/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/teachers/${id}`);
  },

  assignToClass: async (id: string, classId: string): Promise<void> => {
    await apiClient.post(`/teachers/${id}/assign-class`, { classId });
  },
};

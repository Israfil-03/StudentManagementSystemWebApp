import apiClient from './axios';

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  userId: string;
  classId: string | null;
  user: {
    id: string;
    email: string;
    role: string;
  };
  class?: {
    id: string;
    name: string;
  } | null;
}

export interface PaginatedStudents {
  students: Student[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const studentsApi = {
  getAll: async (page: number = 1, limit: number = 10): Promise<PaginatedStudents> => {
    const response = await apiClient.get<PaginatedStudents>('/students', {
      params: { page, limit },
    });
    return response.data;
  },

  getById: async (id: string): Promise<Student> => {
    const response = await apiClient.get<Student>(`/students/${id}`);
    return response.data;
  },

  getMyProfile: async (): Promise<Student> => {
    const response = await apiClient.get<Student>('/students/me');
    return response.data;
  },

  update: async (id: string, data: Partial<Student>): Promise<Student> => {
    const response = await apiClient.put<Student>(`/students/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/students/${id}`);
  },

  assignToClass: async (id: string, classId: string): Promise<Student> => {
    const response = await apiClient.post<Student>(`/students/${id}/assign-class`, { classId });
    return response.data;
  },

  removeFromClass: async (id: string): Promise<Student> => {
    const response = await apiClient.post<Student>(`/students/${id}/remove-class`);
    return response.data;
  },
};

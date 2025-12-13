import apiClient from './axios';

export interface Mark {
  id: string;
  examName: string;
  marks: number;
  studentId: string;
  subjectId: string;
  student?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  subject?: {
    id: string;
    name: string;
  };
}

export interface MarkStats {
  totalMarks: number;
  averageMarks: number;
  highestMark: number;
  lowestMark: number;
  subjectCount: number;
}

export const marksApi = {
  add: async (data: {
    studentId: string;
    subjectId: string;
    examName: string;
    marks: number;
  }): Promise<Mark> => {
    const response = await apiClient.post<Mark>('/marks', data);
    return response.data;
  },

  getMyMarks: async (): Promise<Mark[]> => {
    const response = await apiClient.get<Mark[]>('/marks/me');
    return response.data;
  },

  getByStudent: async (studentId: string): Promise<Mark[]> => {
    const response = await apiClient.get<Mark[]>(`/marks/student/${studentId}`);
    return response.data;
  },

  getBySubject: async (subjectId: string): Promise<Mark[]> => {
    const response = await apiClient.get<Mark[]>(`/marks/subject/${subjectId}`);
    return response.data;
  },

  getByClass: async (classId: string, examName?: string): Promise<Mark[]> => {
    const response = await apiClient.get<Mark[]>(`/marks/class/${classId}`, {
      params: examName ? { examName } : {},
    });
    return response.data;
  },

  getStats: async (studentId: string): Promise<MarkStats> => {
    const response = await apiClient.get<MarkStats>(`/marks/stats/${studentId}`);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/marks/${id}`);
  },
};

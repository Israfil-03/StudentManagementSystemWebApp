import apiClient from './axios';

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE';

export interface Attendance {
  id: string;
  date: string;
  status: AttendanceStatus;
  studentId: string;
  classId: string;
  student?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  class?: {
    id: string;
    name: string;
  };
}

export interface AttendanceStats {
  total: number;
  present: number;
  absent: number;
  late: number;
  attendanceRate: number;
}

export const attendanceApi = {
  mark: async (data: {
    studentId: string;
    classId: string;
    date: string;
    status: AttendanceStatus;
  }): Promise<Attendance> => {
    const response = await apiClient.post<Attendance>('/attendance', data);
    return response.data;
  },

  markBulk: async (data: {
    classId: string;
    date: string;
    attendances: Array<{ studentId: string; status: AttendanceStatus }>;
  }): Promise<Attendance[]> => {
    const response = await apiClient.post<Attendance[]>('/attendance/bulk', data);
    return response.data;
  },

  getMyAttendance: async (): Promise<Attendance[]> => {
    const response = await apiClient.get<Attendance[]>('/attendance/me');
    return response.data;
  },

  getByClass: async (classId: string, date?: string): Promise<Attendance[]> => {
    const response = await apiClient.get<Attendance[]>(`/attendance/class/${classId}`, {
      params: date ? { date } : {},
    });
    return response.data;
  },

  getByStudent: async (studentId: string): Promise<Attendance[]> => {
    const response = await apiClient.get<Attendance[]>(`/attendance/student/${studentId}`);
    return response.data;
  },

  getStats: async (studentId: string): Promise<AttendanceStats> => {
    const response = await apiClient.get<AttendanceStats>(`/attendance/stats/${studentId}`);
    return response.data;
  },
};

import api from '../../lib/axios';

export const getAttendanceRecords = async (params) => {
  const response = await api.get('/attendance', { params });
  return response.data;
};

export const getAttendanceByClass = async (classId, params) => {
  const response = await api.get(`/attendance/class/${classId}`, { params });
  return response.data;
};

export const markAttendance = async (data) => {
  const response = await api.post('/attendance', data);
  return response.data.data.attendance;
};

export const markBulkAttendance = async (data) => {
  const response = await api.post('/attendance/bulk', data);
  return response.data;
};

export const updateAttendance = async (id, data) => {
  const response = await api.put(`/attendance/${id}`, data);
  return response.data.data.attendance;
};

export const getStudentAttendance = async (studentId, params) => {
  const response = await api.get(`/attendance/student/${studentId}`, { params });
  return response.data;
};

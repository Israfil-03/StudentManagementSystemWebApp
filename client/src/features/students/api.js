import api from '../../lib/axios';

export const getStudents = async (params) => {
  const response = await api.get('/students', { params });
  return response.data;
};

export const getStudent = async (id) => {
  const response = await api.get(`/students/${id}`);
  return response.data.data.student;
};

export const createStudent = async (data) => {
  const response = await api.post('/students', data);
  return response.data.data.student;
};

export const updateStudent = async (id, data) => {
  const response = await api.put(`/students/${id}`, data);
  return response.data.data.student;
};

export const deleteStudent = async (id) => {
  const response = await api.delete(`/students/${id}`);
  return response.data;
};

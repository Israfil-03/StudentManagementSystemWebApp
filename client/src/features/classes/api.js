import api from '../../lib/axios';

export const getClasses = async (params) => {
  const response = await api.get('/classes', { params });
  return response.data;
};

export const getClass = async (id) => {
  const response = await api.get(`/classes/${id}`);
  return response.data.data.classSection;
};

export const createClass = async (data) => {
  const response = await api.post('/classes', data);
  return response.data.data.classSection;
};

export const updateClass = async (id, data) => {
  const response = await api.put(`/classes/${id}`, data);
  return response.data.data.classSection;
};

export const deleteClass = async (id) => {
  const response = await api.delete(`/classes/${id}`);
  return response.data;
};

export const getClassStudents = async (id, params) => {
  const response = await api.get(`/classes/${id}/students`, { params });
  return response.data;
};

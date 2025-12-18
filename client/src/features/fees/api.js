import api from '../../lib/axios';

export const getFees = async (params) => {
  const response = await api.get('/fees', { params });
  return response.data;
};

export const getFee = async (id) => {
  const response = await api.get(`/fees/${id}`);
  return response.data.data.fee;
};

export const createFee = async (data) => {
  const response = await api.post('/fees', data);
  return response.data.data.fee;
};

export const updateFee = async (id, data) => {
  const response = await api.put(`/fees/${id}`, data);
  return response.data.data.fee;
};

export const deleteFee = async (id) => {
  const response = await api.delete(`/fees/${id}`);
  return response.data;
};

export const recordPayment = async (id, data) => {
  const response = await api.post(`/fees/${id}/payment`, data);
  return response.data.data.fee;
};

export const getStudentFees = async (studentId, params) => {
  const response = await api.get(`/fees/student/${studentId}`, { params });
  return response.data;
};

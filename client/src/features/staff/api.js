import api from '../../lib/axios';

export const getStaff = async (params) => {
  const response = await api.get('/auth/staff', { params });
  return response.data;
};

export const createStaff = async (data) => {
  const response = await api.post('/auth/staff', data);
  return response.data.data;
};

export const deactivateStaff = async (id) => {
  const response = await api.patch(`/auth/staff/${id}/deactivate`);
  return response.data.data;
};

export const reactivateStaff = async (id) => {
  const response = await api.patch(`/auth/staff/${id}/reactivate`);
  return response.data.data;
};

export const resetStaffPassword = async (id, newPassword) => {
  const response = await api.patch(`/auth/staff/${id}/reset-password`, { newPassword });
  return response.data.data;
};

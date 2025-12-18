import api from '../../lib/axios';

export const getAuditLogs = async (params) => {
  const response = await api.get('/audit-logs', { params });
  return response.data;
};

export const getAuditLog = async (id) => {
  const response = await api.get(`/audit-logs/${id}`);
  return response.data.data.auditLog;
};

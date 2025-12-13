import axios from 'axios';
import { useAuthStore } from '@/store/auth';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const { token } = useAuthStore.getState();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // On 401 error, clear auth data and redirect to login
      useAuthStore.getState().clearAuth();
      // This will force a refresh and the router logic should redirect to login
      window.location.href = '/login'; 
    }
    return Promise.reject(error);
  }
);

export default apiClient;

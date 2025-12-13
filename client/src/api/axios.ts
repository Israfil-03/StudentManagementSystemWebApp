import axios from 'axios';
import { useAuthStore } from '@/store/auth';

// Ensure the API URL is properly formatted with protocol
const getApiBaseUrl = (): string => {
  let baseUrl = import.meta.env.VITE_API_BASE_URL || '';
  
  // If no URL is provided, default to relative /api for same-origin requests
  if (!baseUrl) {
    return '/api';
  }
  
  // Add https:// if protocol is missing (handles cases where env var doesn't include protocol)
  if (baseUrl && !baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
    baseUrl = `https://${baseUrl}`;
  }
  
  // Ensure the URL ends with /api if it's an Azure URL without it
  if (baseUrl.includes('azurewebsites.net') && !baseUrl.endsWith('/api')) {
    baseUrl = baseUrl.endsWith('/') ? `${baseUrl}api` : `${baseUrl}/api`;
  }
  
  return baseUrl;
};

const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
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

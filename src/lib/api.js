import axios from 'axios';
import { getStoredToken, clearStoredToken, getStoredRefreshToken, setStoredToken, setStoredUser, clearStoredUser } from './auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/everything-app';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = getStoredToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retrying, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = getStoredRefreshToken();
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          });

          const { access_token, refresh_token: newRefreshToken } = response.data;
          setStoredToken(access_token);
          
          // Update refresh token storage if needed
          if (newRefreshToken) {
            localStorage.setItem('refresh_token', newRefreshToken);
          }

          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return apiClient(originalRequest);
        } catch (refreshError) {
          // Refresh failed, clear tokens and redirect to login
          clearStoredToken();
          clearStoredUser();
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => apiClient.post('/auth/register', data),
  login: (data) => apiClient.post('/auth/login', data),
  logout: () => apiClient.post('/auth/logout'),
  me: () => apiClient.get('/auth/me'),
  refresh: (refreshToken) => apiClient.post('/auth/refresh', { refresh_token: refreshToken }),
  deleteAccount: (password) => apiClient.delete('/auth/account', { data: { password } }),
};

// Config API
export const configAPI = {
  get: () => apiClient.get('/config'),
  set: (data) => apiClient.put('/config', data),
  delete: () => apiClient.delete('/config'),
};

// Email API
export const emailAPI = {
  execute: (data) => apiClient.post('/app/execute', data),
  confirm: (data) => apiClient.post('/app/execute/confirm', data),
  getProcesses: () => apiClient.get('/app/processes'),
};

// Health API
export const healthAPI = {
  check: () => apiClient.get('/health'),
};

// Email History API
export const historyAPI = {
  getAll: (limit = 20, offset = 0) => 
    apiClient.get('/email-history', { params: { limit, offset } }),
};

export default apiClient;

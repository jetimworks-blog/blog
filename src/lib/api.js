import axios from 'axios';
import { getStoredToken, clearStoredToken, getStoredRefreshToken, setStoredToken, setStoredUser, clearStoredUser } from './auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

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
  (response) => {
    // Validate response data exists and has expected shape
    if (!response.data || typeof response.data !== 'object') {
      console.error('[API] Invalid response data:', response);
      return Promise.reject({ message: 'Invalid server response', response });
    }
    return response;
  },
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
  forgotPassword: (email) => apiClient.post('/auth/forgot-password', { email }),
  resetPassword: (data) => apiClient.post('/auth/reset-password', data),
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
  uploadAttachments: (files) => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    return apiClient.post('/app/attachments/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// Health API
export const healthAPI = {
  check: () => apiClient.get('/health'),
};

// Campaign API
export const campaignAPI = {
  // CRUD
  create: (data) => apiClient.post('/campaigns/campaigns', data),
  list: (limit = 20, offset = 0) =>
    apiClient.get('/campaigns/campaigns', { params: { limit, offset } }),
  get: (id) => apiClient.get(`/campaigns/campaigns/${id}`),
  update: (id, data) => apiClient.put(`/campaigns/campaigns/${id}`, data),
  delete: (id) => apiClient.delete(`/campaigns/campaigns/${id}`),

  // Actions
  upload: (id, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post(`/campaigns/campaigns/${id}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  schedule: (id, data) => apiClient.post(`/campaigns/campaigns/${id}/schedule`, data),
  send: (id) => apiClient.post(`/campaigns/campaigns/${id}/send`),
  cancel: (id) => apiClient.post(`/campaigns/campaigns/${id}/cancel`),

  // Data
  recipients: (id, limit = 100, offset = 0) =>
    apiClient.get(`/campaigns/campaigns/${id}/recipients`, { params: { limit, offset } }),
  stats: (id) => apiClient.get(`/campaigns/campaigns/${id}/stats`),
};

// Email History API
export const historyAPI = {
  getAll: (limit = 20, offset = 0) =>
    apiClient.get('/email-history', { params: { limit, offset } }),
};

// Admin API
export const adminAPI = {
  // Users Management
  users: {
    list: (params) => apiClient.get('/admin/users', { params }),
    get: (id) => apiClient.get(`/admin/users/${id}`),
    update: (id, data) => apiClient.put(`/admin/users/${id}`, data),
    delete: (id) => apiClient.delete(`/admin/users/${id}`),
  },

  // Campaigns Management
  campaigns: {
    list: (params) => apiClient.get('/admin/campaigns', { params }),
    get: (id) => apiClient.get(`/admin/campaigns/${id}`),
    cancel: (id) => apiClient.post(`/admin/campaigns/${id}/cancel`),
    delete: (id) => apiClient.delete(`/admin/campaigns/${id}`),
  },

  // Email History
  emailHistory: {
    list: (params) => apiClient.get('/admin/email-history', { params }),
    get: (id) => apiClient.get(`/admin/email-history/${id}`),
    retry: (id) => apiClient.post(`/admin/email-history/${id}/retry`),
  },

  // Request Logs
  requests: {
    list: (params) => apiClient.get('/admin/requests', { params }),
    cleanup: (params) => apiClient.delete('/admin/requests/cleanup', { params }),
  },

  // Statistics
  stats: {
    overview: () => apiClient.get('/admin/stats'),
    users: (params) => apiClient.get('/admin/stats/users', { params }),
    emails: (params) => apiClient.get('/admin/stats/emails', { params }),
    campaigns: (params) => apiClient.get('/admin/stats/campaigns', { params }),
    leaderboard: (params) => apiClient.get('/admin/stats/leaderboard', { params }),
  },
};

export default apiClient;

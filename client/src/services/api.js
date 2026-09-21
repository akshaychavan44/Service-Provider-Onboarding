import axios from 'axios';

// Automatically resolve API URL:
// 1. Explicit VITE_API_URL environment variable if provided
// 2. If running deployed on Vercel/web, point directly to live Vercel backend
// 3. If running locally on localhost, use /api which Vite proxies to localhost:5000
const isLocalhost =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname === '::1' ||
    window.location.hostname === '[::1]' ||
    window.location.hostname.endsWith('.localhost') ||
    window.location.port === '5173' ||
    window.location.port === '5000' ||
    window.location.hostname.startsWith('192.168.') ||
    window.location.hostname.startsWith('10.') ||
    window.location.hostname.startsWith('172.') ||
    window.location.hostname === '');

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (isLocalhost ? '/api' : 'https://server-psi-two-57.vercel.app/api');

const API = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT Token to every outgoing request if present
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor for centralized 401 handling
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const isAuthPage =
        window.location.pathname === '/login' ||
        window.location.pathname === '/register' ||
        window.location.pathname === '/';
      if (!isAuthPage) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

// Auth Endpoints
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  getMe: () => API.get('/auth/me'),
};

// Provider Endpoints
export const providerAPI = {
  getProfile: () => API.get('/provider/profile'),
  updateProfile: (data) => API.put('/provider/profile', data),
  uploadPhoto: (formData, onUploadProgress) =>
    API.post('/provider/profile-photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress,
    }),
  uploadDocument: (formData, onUploadProgress) =>
    API.post('/provider/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress,
    }),
  getDocuments: () => API.get('/provider/documents'),
  deleteDocument: (id) => API.delete(`/provider/documents/${id}`),
  submitApplication: () => API.post('/provider/submit'),
  getStatus: () => API.get('/provider/status'),
};

// Admin Endpoints
export const adminAPI = {
  getDashboardStats: () => API.get('/admin/dashboard'),
  getProviders: (params) => API.get('/admin/providers', { params }),
  getProviderById: (id) => API.get(`/admin/providers/${id}`),
  approveProvider: (id) => API.put(`/admin/providers/${id}/approve`),
  rejectProvider: (id, remarks) =>
    API.put(`/admin/providers/${id}/reject`, { remarks }),
};

export default API;

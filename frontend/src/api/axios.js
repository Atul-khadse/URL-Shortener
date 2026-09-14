import axios from 'axios';

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://url-backend-mljr.onrender.com';
// Ensures the base URL always ends with /api/v1 without double slashes
const normalizedBaseUrl = rawBaseUrl.replace(/\/+$/, '');
const baseURL = normalizedBaseUrl.endsWith('/api/v1') 
    ? normalizedBaseUrl 
    : `${normalizedBaseUrl}/api/v1`;

const api = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('email');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
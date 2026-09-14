import axios from 'axios';

const api = axios.create({
  // baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1' || 'https://url-backend-mljr.onrender.com',
   baseURL: import.meta.env.VITE_API_BASE_URL || 'https://onrender.com',
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
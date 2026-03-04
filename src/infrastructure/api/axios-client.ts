import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://wasynbackend-latest.onrender.com/api';

export const axiosClient = axios.create({
  baseURL: API_URL,
  timeout: 60000, // 60 segundos para Render cold start
});

// Retry interceptor para Render cold start
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.code === 'ECONNABORTED' && error.config && !error.config.__retry) {
      error.config.__retry = true;
      console.log('🔄 Reintentando request (Render cold start)...');
      return axiosClient.request(error.config);
    }
    return Promise.reject(error);
  }
);

export const apiClient = axiosClient;

// Request interceptor: Agrega JWT automáticamente
axiosClient.interceptors.request.use(
  (config) => {
    if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
      if (config.headers) {
        delete (config.headers as any)['Content-Type'];
        delete (config.headers as any)['content-type'];
      }
    } else {
      if (!config.headers) {
        config.headers = {} as any;
      }
      if (!(config.headers as any)['Content-Type'] && !(config.headers as any)['content-type']) {
        (config.headers as any)['Content-Type'] = 'application/json';
      }
    }

    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('tiyuy-auth-token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Manejo de errores centralizado
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado → logout automático
      if (typeof window !== 'undefined') {
        localStorage.removeItem('tiyuy-auth-token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;

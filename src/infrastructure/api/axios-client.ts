import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export const axiosClient = axios.create({
  baseURL: API_URL,
  timeout: 60000, // 60 segundos para Render cold start
});

// Public client for endpoints that don't require authentication
export const publicApiClient = axios.create({
  baseURL: API_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
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

// Retry interceptor for public client
publicApiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.code === 'ECONNABORTED' && error.config && !error.config.__retry) {
      error.config.__retry = true;
      console.log('🔄 Reintentando request (Render cold start)...');
      return publicApiClient.request(error.config);
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
      // Check all possible token keys
      const tokenKeys = ['tiyuy-auth-token', 'token', 'auth-token'];
      console.log('🔍 localStorage keys:', Object.keys(localStorage));
      
      const token = localStorage.getItem('tiyuy-auth-token') || 
                   localStorage.getItem('token') || 
                   localStorage.getItem('auth-token');
      
      console.log('🔑 Token check:', token ? 'EXISTS' : 'MISSING');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('✅ Token added to headers');
      } else {
        console.log('❌ No token found in localStorage');
        console.log('🔍 Available localStorage items:', Object.keys(localStorage));
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

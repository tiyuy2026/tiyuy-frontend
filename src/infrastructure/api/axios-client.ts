import axios from 'axios';

// Usar ruta relativa para que Vercel actúe como puente hacia el backend
// Esto evita bloqueos por seguridad del navegador y permite HTTPS
export const axiosClient = axios.create({
  baseURL: '/api',
  timeout: 60000, // 60 segundos para Render cold start
});

// Public client for endpoints that don't require authentication
export const publicApiClient = axios.create({
  baseURL: '/api',
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Retry interceptor para Render cold start y errores de red
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const shouldRetry = (error.code === 'ECONNABORTED' || 
                        error.code === 'ERR_NETWORK' || 
                        error.code === 'ECONNREFUSED' ||
                        !error.response) && 
                        error.config && 
                        !error.config.__retry;
    
    if (shouldRetry) {
      error.config.__retry = true;
      console.log(' Reintentando request (Render cold start / Network error)...', error.code);
      // Esperar 2 segundos antes de reintentar
      await new Promise(resolve => setTimeout(resolve, 2000));
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
      console.log(' Reintentando request (Render cold start)...');
      return publicApiClient.request(error.config);
    }
    return Promise.reject(error);
  }
);

export const apiClient = axiosClient;

// Request interceptor: Agrega JWT automáticamente
axiosClient.interceptors.request.use(
  (config) => {
    console.log(' AXIOS REQUEST - Method:', config.method?.toUpperCase(), 'URL:', config.url);
    console.log(' AXIOS BASEURL:', axiosClient.defaults.baseURL);
    console.log(' FULL URL:', (axiosClient.defaults.baseURL || '') + (config.url || ''));
    
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
      console.log(' localStorage keys:', Object.keys(localStorage));
      
      let token = localStorage.getItem('tiyuy-auth-token') || 
              localStorage.getItem('token') || 
              localStorage.getItem('auth-token');
      
      // Si el token está en formato de objeto Zustand, extraer el token real
      if (token && token.startsWith('{"state":')) {
        try {
          const parsed = JSON.parse(token);
          token = parsed.state?.token || token; // Extraer el token real
          console.log(' Extracted token from Zustand object');
        } catch (e) {
          console.log(' Failed to parse token object:', e);
        }
      }
      
      console.log(' Token check:', token ? 'EXISTS' : 'MISSING');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log(' Token added to headers');
      } else {
        console.log(' No token found in localStorage');
        console.log(' Available localStorage items:', Object.keys(localStorage));
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

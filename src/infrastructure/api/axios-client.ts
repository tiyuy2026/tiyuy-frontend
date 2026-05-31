import axios from 'axios';

// El backend usa context-path /api
const serverBaseURL = process.env.BACKEND_URL
  ? `${process.env.BACKEND_URL}/api`
  : 'http://localhost:8080/api';

// En el navegador, usar el proxy de Next.js (/api) para evitar CORS
// En el servidor (SSR), usar la URL directa del backend
const baseURL =
  typeof window === 'undefined'
    ? serverBaseURL
    : '/api';

export const axiosClient = axios.create({
  baseURL,
  timeout: 60000,
});

export const publicApiClient = axios.create({
  baseURL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Retry interceptor para Render cold start y errores de red
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const shouldRetry =
      (error.code === 'ECONNABORTED' ||
        error.code === 'ERR_NETWORK' ||
        error.code === 'ECONNREFUSED' ||
        !error.response) &&
      error.config &&
      !error.config.__retry;

    if (shouldRetry) {
      error.config.__retry = true;
      console.log(' Reintentando request (Render cold start / Network error)...', error.code);
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
    console.log(' FULL URL:', `${axiosClient.defaults.baseURL || ''}${config.url || ''}`);

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
      let token =
        localStorage.getItem('tiyuy-auth-token') ||
        localStorage.getItem('token') ||
        localStorage.getItem('auth-token');

      if (token && token.startsWith('{"state":')) {
        try {
          const parsed = JSON.parse(token);
          token = parsed.state?.token || token;
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
      if (typeof window !== 'undefined') {
        localStorage.removeItem('tiyuy-auth-token');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
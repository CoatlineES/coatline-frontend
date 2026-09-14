import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de Request
api.interceptors.request.use(
  (config) => {
const token = localStorage.getItem('coastline_token');
    const subsidiaryId = localStorage.getItem('coastline_subsidiary_id');
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (subsidiaryId && config.headers) {
      config.headers['x-subsidiary-id'] = subsidiaryId;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de Response (opcional: manejar expiración de token)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Si el token expira o es inválido, podríamos limpiar el local storage y redirigir
      // localStorage.removeItem('coastline_token');
      // localStorage.removeItem('coastline_user');
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const cleanParams = (params: any) => {
  if (!params) return undefined;
  const cleaned: any = {};
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      cleaned[key] = value;
    }
  }
  return Object.keys(cleaned).length > 0 ? cleaned : undefined;
};

export default api;

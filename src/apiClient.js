import axios from 'axios';

// A URL base da API agora depende EXCLUSIVAMENTE da variável de ambiente.
// Removido o fallback '|| http://localhost:3000'
const API_URL = import.meta.env.VITE_API_URL;

const apiClient = axios.create({
  baseURL: API_URL,
});

// Adiciona o token de autenticação a todas as requisições, se ele existir
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

export default apiClient;
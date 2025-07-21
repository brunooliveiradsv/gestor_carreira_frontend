import axios from 'axios';

// Defina a URL base da sua API. Altere se o seu backend rodar em outra porta.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

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
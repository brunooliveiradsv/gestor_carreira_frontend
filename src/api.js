import axios from 'axios';

// 1. Lê a URL base da API a partir das variáveis de ambiente
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// 2. Cria uma instância do Axios com a URL base pré-configurada
const apiClient = axios.create({
  baseURL: API_URL,
});

// 3. Adiciona automaticamente o token de autenticação a todos os pedidos
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default apiClient;
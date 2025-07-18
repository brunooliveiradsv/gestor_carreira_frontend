// src/api.js
import axios from 'axios';

// Defina a URL base da sua API. Altere se o seu backend rodar em outra porta.
const API_URL = 'http://localhost:3000'; 

const apiClient = axios.create({
  baseURL: API_URL,
});

// Intercepta cada requisição para adicionar o token de autenticação no cabeçalho
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
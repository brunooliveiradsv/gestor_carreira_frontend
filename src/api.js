import axios from 'axios';

// 1. Define a URL base da sua API a partir da variável de ambiente.
// O Vite (ferramenta de build do seu projeto) substitui esta variável
// pelo valor correto durante o processo de construção.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// 2. Cria uma instância do Axios com a configuração base.
const apiClient = axios.create({
  baseURL: API_URL,
});

// 3. Configura um "interceptor" para adicionar o token de autenticação
// a todos os pedidos, exceto para as rotas de login e registo.
apiClient.interceptors.request.use((config) => {
  const publicRoutes = ['/api/usuarios/login', '/api/usuarios/registrar'];

  // Verifica se a URL do pedido atual NÃO ESTÁ na lista de rotas públicas
  if (!publicRoutes.some(publicRoute => config.url.endsWith(publicRoute))) {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default apiClient;
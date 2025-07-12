import axios from "axios";

// 1. Define a URL base da sua API a partir da variável de ambiente
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// 2. Cria uma instância do Axios com a configuração base
const apiClient = axios.create({
  baseURL: API_URL,
});

// 3. Adiciona o token de autenticação a todos os pedidos automaticamente
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;

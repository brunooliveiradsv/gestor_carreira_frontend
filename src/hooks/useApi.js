// src/hooks/useApi.js
import { useState, useEffect, useCallback } from 'react';
import apiClient from '../api';
import { useNotificacao } from '../contextos/NotificationContext';

const useApi = (endpoint) => {
  const [data, setData] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const { mostrarNotificacao } = useNotificacao();

  const fetchData = useCallback(async () => {
    // Não reinicia o estado de carregamento se já houver dados (para um 'refetch' mais suave)
    if (!data) {
        setCarregando(true);
    }
    setErro(null);
    try {
      const resposta = await apiClient.get(endpoint);
      setData(resposta.data);
    } catch (err) {
      const msgErro = err.response?.data?.mensagem || `Não foi possível carregar os dados de ${endpoint}`;
      setErro(msgErro);
      mostrarNotificacao(msgErro, 'error');
    } finally {
      setCarregando(false);
    }
  }, [endpoint, mostrarNotificacao]); // O hook re-executará se o 'endpoint' mudar

  useEffect(() => {
    if (endpoint) { // Só busca se houver um endpoint
        fetchData();
    }
  }, [fetchData]);

  // O hook retorna o estado e uma função para recarregar os dados
  return { data, carregando, erro, refetch: fetchData };
};

export default useApi;
// src/contextos/NotificationContext.jsx

import React, { createContext, useState, useContext } from 'react';
import { Snackbar, Alert } from '@mui/material';

// 1. Cria o contexto
const NotificationContext = createContext({});

// 2. Cria o componente Provedor
export function NotificationProvider({ children }) {
  const [notificacao, setNotificacao] = useState({
    open: false,
    mensagem: '',
    severidade: 'success' // pode ser 'success', 'error', 'warning', 'info'
  });

  // Função para MOSTRAR uma notificação
  const mostrarNotificacao = (mensagem, severidade = 'success') => {
    setNotificacao({
      open: true,
      mensagem,
      severidade,
    });
  };

  // Função para FECHAR a notificação
  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setNotificacao({ ...notificacao, open: false });
  };

  return (
    // Disponibiliza a função 'mostrarNotificacao' para toda a aplicação
    <NotificationContext.Provider value={{ mostrarNotificacao }}>
      {children}
      
      {/* O componente Snackbar que será a nossa "Alert Box" */}
      <Snackbar
        open={notificacao.open}
        autoHideDuration={6000} // Fecha sozinho após 6 segundos
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} // Posição na tela
      >
        {/* O Alert do MUI que mostra a mensagem com a cor correta */}
        <Alert onClose={handleClose} severity={notificacao.severidade} sx={{ width: '100%' }}>
          {notificacao.mensagem}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
}

// 3. Cria um "hook" customizado para facilitar o uso
export const useNotificacao = () => {
  return useContext(NotificationContext);
};
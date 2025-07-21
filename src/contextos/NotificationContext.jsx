// src/contextos/NotificationContext.jsx
import React, { createContext, useState, useContext, useCallback } from 'react'; // 1. Importar useCallback
import { Snackbar, Alert } from '@mui/material';

const NotificationContext = createContext({});

export function NotificationProvider({ children }) {
  const [notificacao, setNotificacao] = useState({
    open: false,
    mensagem: '',
    severidade: 'success'
  });

  // 2. Envolver a função com useCallback para a estabilizar
  const mostrarNotificacao = useCallback((mensagem, severidade = 'success') => {
    setNotificacao({
      open: true,
      mensagem,
      severidade,
    });
  }, []); // O array vazio [] significa que esta função nunca será recriada

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setNotificacao({ ...notificacao, open: false });
  };

  return (
    <NotificationContext.Provider value={{ mostrarNotificacao }}>
      {children}
      <Snackbar
        open={notificacao.open}
        autoHideDuration={6000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleClose} severity={notificacao.severidade} sx={{ width: '100%' }}>
          {notificacao.mensagem}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
}

export const useNotificacao = () => {
  return useContext(NotificationContext);
};
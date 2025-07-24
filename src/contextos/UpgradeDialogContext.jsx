import React, { createContext, useState, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Typography } from '@mui/material';
import { WorkspacePremium as WorkspacePremiumIcon } from '@mui/icons-material';

const UpgradeDialogContext = createContext({});

export const UpgradeDialogProvider = ({ children }) => {
  const [dialogAberto, setDialogAberto] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const navigate = useNavigate();

  const abrirDialogoDeUpgrade = useCallback((msg) => {
    setMensagem(msg || 'Você atingiu o limite de utilização para o seu plano atual.');
    setDialogAberto(true);
  }, []);

  const fecharDialogo = () => {
    setDialogAberto(false);
  };

  const handleIrParaAssinatura = () => {
    navigate('/assinatura');
    fecharDialogo();
  };

  const value = { abrirDialogoDeUpgrade };

  return (
    <UpgradeDialogContext.Provider value={value}>
      {children}
      <Dialog open={dialogAberto} onClose={fecharDialogo}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
          <WorkspacePremiumIcon color="primary" sx={{ mr: 1 }} />
          Funcionalidade de Plano Superior
        </DialogTitle>
        <DialogContent>
          <DialogContentText>{mensagem}</DialogContentText>
          <Typography variant="body2" sx={{ mt: 2 }}>
            Faça o upgrade do seu plano para desbloquear esta e muitas outras funcionalidades.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={fecharDialogo}>Fechar</Button>
          <Button onClick={handleIrParaAssinatura} variant="contained" autoFocus>
            Ver Planos
          </Button>
        </DialogActions>
      </Dialog>
    </UpgradeDialogContext.Provider>
  );
};

export const useUpgradeDialog = () => {
  return useContext(UpgradeDialogContext);
};
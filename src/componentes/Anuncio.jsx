// src/componentes/Anuncio.jsx
import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contextos/AuthContext';
import { 
    Dialog, DialogTitle, DialogContent, DialogContentText, 
    DialogActions, Button, Box, Typography, IconButton 
} from '@mui/material';
import { WorkspacePremium as WorkspacePremiumIcon, Close as CloseIcon } from '@mui/icons-material';

function Anuncio() {
  const { usuario } = useContext(AuthContext);
  const navigate = useNavigate();

  // 1. Estado para controlar se o Dialog está aberto ou fechado
  const [dialogAberto, setDialogAberto] = useState(false);

  // 2. Lógica para decidir se o anúncio deve ser mostrado
  useEffect(() => {
    // Verifica se o utilizador tem o plano 'padrao'
    const temPlanoPadrao = usuario?.plano === 'padrao';
    // Verifica se o anúncio já foi visto nesta sessão
    const anuncioJaVisto = sessionStorage.getItem('anuncioVisto');

    if (temPlanoPadrao && !anuncioJaVisto) {
      // Se tiver o plano padrão e ainda não viu o anúncio, abre o dialog
      setDialogAberto(true);
      // E marca como visto para não mostrar novamente na mesma sessão
      sessionStorage.setItem('anuncioVisto', 'true');
    }
  }, [usuario]); // Este efeito corre sempre que as informações do 'usuario' mudam

  const handleFechar = () => {
    setDialogAberto(false);
  };

  const handleVerPlanos = () => {
    navigate('/assinatura');
    handleFechar();
  };

  // 3. O componente agora retorna um Dialog em vez de um Paper
  return (
    <Dialog
      open={dialogAberto}
      onClose={handleFechar}
      PaperProps={{
        sx: {
          border: '1px solid',
          borderColor: 'primary.main',
        }
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" component="div" fontWeight="bold">Uma Oportunidade para Si</Typography>
        <IconButton
          aria-label="close"
          onClick={handleFechar}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <DialogContentText>
          Desbloqueie todo o potencial do VOXGest com o plano Premium. Navegue sem anúncios e tenha acesso a funcionalidades exclusivas para levar a sua carreira ao próximo nível.
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ p: '16px 24px' }}>
        <Button onClick={handleFechar}>
          Continuar com Anúncios
        </Button>
        <Button 
            onClick={handleVerPlanos} 
            variant="contained"
            startIcon={<WorkspacePremiumIcon />}
        >
          Ver Planos Premium
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default Anuncio;
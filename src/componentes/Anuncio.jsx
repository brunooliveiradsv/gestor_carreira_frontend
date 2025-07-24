import React, { useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { AuthContext } from '../contextos/AuthContext';
import AdSense from 'react-adsense';
import {
    Dialog,
    AppBar,
    Toolbar,
    IconButton,
    Typography,
    Box,
    Slide
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

// Efeito de transição para o diálogo
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

function Anuncio() {
  const { usuario } = useContext(AuthContext);
  const [dialogAberto, setDialogAberto] = useState(false);
  const location = useLocation(); // Hook para detetar mudanças de rota

  useEffect(() => {
    const isFreePlan = usuario?.plano === 'free';
    const anuncioJaVisto = sessionStorage.getItem('anuncioVisto');

    // Se o utilizador for 'free' e ainda não tiver visto o anúncio nesta sessão, abre o diálogo
    if (isFreePlan && !anuncioJaVisto) {
      setDialogAberto(true);
      sessionStorage.setItem('anuncioVisto', 'true');
    }
  }, [usuario, location.pathname]); // O useEffect é re-executado a cada mudança de página

  const handleFechar = () => {
    setDialogAberto(false);
  };

  // Se o plano não for 'free' ou o diálogo não estiver para ser aberto, não renderiza nada
  if (usuario?.plano !== 'free' || !dialogAberto) {
    return null;
  }

  return (
    <Dialog
      fullScreen
      open={dialogAberto}
      onClose={handleFechar}
      TransitionComponent={Transition}
    >
      <AppBar sx={{ position: 'relative' }}>
        <Toolbar>
          <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
            Apoie o nosso trabalho
          </Typography>
          <IconButton
            edge="end"
            color="inherit"
            onClick={handleFechar}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Box 
        sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100%',
            p: 2,
            bgcolor: 'background.default'
        }}
      >
        <Box sx={{ maxWidth: '728px', width: '100%', textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                A exibição de anúncios ajuda-nos a manter as funcionalidades gratuitas. Considere um upgrade para uma experiência sem interrupções.
            </Typography>
            <AdSense.Google
              client="ca-pub-6978134622596714"
              slot="6578217682" // Verifique se este slot está configurado para intersticiais ou ecrã inteiro
              style={{ display: 'block' }}
              format="auto"
              responsive="true"
            />
        </Box>
      </Box>
    </Dialog>
  );
}

export default Anuncio;
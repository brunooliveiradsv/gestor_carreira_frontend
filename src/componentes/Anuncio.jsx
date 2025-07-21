// src/componentes/Anuncio.jsx
import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../contextos/AuthContext';
import Adsense from 'react-adsense'; // <-- 1. Importe o componente de anúncio
import { 
    Dialog, DialogTitle, DialogContent, 
    IconButton, Typography
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

function Anuncio() {
  const { usuario } = useContext(AuthContext);
  const [dialogAberto, setDialogAberto] = useState(false);

  useEffect(() => {
    const temPlanoPadrao = usuario?.plano === 'padrao';
    const anuncioJaVisto = sessionStorage.getItem('anuncioVisto');

    if (temPlanoPadrao && !anuncioJaVisto) {
      setDialogAberto(true);
      sessionStorage.setItem('anuncioVisto', 'true');
    }
  }, [usuario]);

  const handleFechar = () => {
    setDialogAberto(false);
  };

  // Se o utilizador não tiver o plano padrão, o componente não faz nada
  if (usuario?.plano !== 'padrao') {
    return null;
  }

  return (
    <Dialog
      open={dialogAberto}
      onClose={handleFechar}
      PaperProps={{ sx: { maxWidth: '728px', width: '100%' } }} // Largura comum para banners
    >
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary">Publicidade</Typography>
        <IconButton
          aria-label="close"
          onClick={handleFechar}
          sx={{ color: (theme) => theme.palette.grey[500] }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        {/* --- 2. Componente do AdSense --- */}
        <Adsense
          client="pub-6978134622596714" // <-- SUBSTITUA
          slot="6578217682"   // <-- SUBSTITUA
          style={{ display: 'block' }}
          layout="in-article"
          format="fluid"
        />
      </DialogContent>
    </Dialog>
  );
}

export default Anuncio;
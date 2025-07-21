// src/componentes/Anuncio.jsx
import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../contextos/AuthContext';
import AdSense from 'react-adsense';
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

  if (usuario?.plano !== 'padrao') {
    return null;
  }

  return (
    <Dialog
      open={dialogAberto}
      onClose={handleFechar}
      PaperProps={{ sx: { maxWidth: '728px', width: '100%' } }}
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
        {/* --- IDs Inseridos Aqui --- */}
        <AdSense.Google
          client="ca-pub-6978134622596714"
          slot="6578217682"
          style={{ display: 'block' }}
          layout="in-article"
          format="fluid"
        />
      </DialogContent>
    </Dialog>
  );
}

export default Anuncio;
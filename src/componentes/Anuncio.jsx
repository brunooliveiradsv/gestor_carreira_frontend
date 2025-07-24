import React, { useContext } from 'react';
import { AuthContext } from '../contextos/AuthContext';
import AdSense from 'react-adsense';
import { Paper, Typography } from '@mui/material';

function Anuncio() {
  const { usuario } = useContext(AuthContext);

  // O anúncio só deve ser renderizado se o plano do utilizador for 'free'
  if (usuario?.plano !== 'free') {
    return null;
  }

  return (
    <Paper sx={{ p: 1, mb: 3, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '90px', bgcolor: 'action.hover' }}>
      <Typography variant="caption" color="text.secondary" sx={{mb: 1}}>Publicidade</Typography>
      <AdSense.Google
        client="ca-pub-6978134622596714"
        slot="6578217682"
        style={{ display: 'block', width: '100%', maxWidth: '728px', minHeight: '90px' }}
        format="auto"
        responsive="true"
      />
    </Paper>
  );
}

export default Anuncio;
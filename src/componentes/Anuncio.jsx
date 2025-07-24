import React, { useContext } from 'react';
import { AuthContext } from '../contextos/AuthContext';
import AdSense from 'react-adsense';
import { Paper } from '@mui/material';

function Anuncio() {
  const { usuario } = useContext(AuthContext);

  // O anúncio só deve ser renderizado se o plano do utilizador for 'free'
  if (usuario?.plano !== 'free') {
    return null;
  }

  return (
    <Paper sx={{ p: 1, mb: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '90px', bgcolor: 'action.hover' }}>
      <AdSense.Google
        client="ca-pub-6978134622596714"
        slot="6578217682"
        style={{ display: 'block', width: '100%', maxWidth: '728px' }}
        format="auto"
        responsive="true"
      />
    </Paper>
  );
}

export default Anuncio;
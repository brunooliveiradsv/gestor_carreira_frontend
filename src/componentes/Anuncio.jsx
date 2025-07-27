import React, { useContext, useEffect } from 'react'; // 1. Importar useEffect
import { useLocation } from 'react-router-dom';
import { AuthContext } from '../contextos/AuthContext';
import { Paper, Typography } from '@mui/material';

function Anuncio() {
  const { usuario } = useContext(AuthContext);
  const location = useLocation();

  useEffect(() => {
    // 2. Este efeito é executado sempre que a rota muda
    try {
      // Tenta inserir um anúncio no slot. Se já houver um, o Google AdSense vai lidar com isso.
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error("Erro ao carregar o anúncio do AdSense:", e);
    }
  }, [location.pathname]); // A dependência é a rota, recarregando o anúncio de forma controlada

  if (usuario?.plano !== 'free') {
    return null;
  }

  return (
    <Paper sx={{ p: 1, mb: 3, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '90px', bgcolor: 'action.hover' }}>
      <Typography variant="caption" color="text.secondary" sx={{ mb: 1 }}>
        Publicidade
      </Typography>
      {/* 3. O componente <ins> agora é renderizado diretamente */}
      <ins className="adsbygoogle"
           style={{ display: 'block', width: '100%', maxWidth: '728px', minHeight: '90px' }}
           data-ad-client="ca-pub-3364093560900855"
           data-ad-slot="6578217682"
           data-ad-format="auto"
           data-full-width-responsive="true"></ins>
    </Paper>
  );
}

export default Anuncio;
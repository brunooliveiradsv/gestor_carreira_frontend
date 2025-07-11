// src/componentes/LayoutPrincipal.jsx

import React from 'react';
import { Outlet } from 'react-router-dom';
import Navegacao from './Navegacao';
import { Box, CssBaseline } from '@mui/material';

function LayoutPrincipal() {
  return (
    // Aplicando o SEU fundo em degradê aqui
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh',
      // O mesmo degradê da sua tela de login
      background: 'linear-gradient(to right bottom, #4000F0, #2C00A3, #3E00E7)',
    }}>
      <CssBaseline />
      <Navegacao />

      {/* O 'main' agora conterá nossas páginas, já com o fundo correto */}
      <main style={{ padding: '20px', flexGrow: 1 }}>
        <Outlet />
      </main>
    </Box>
  );
}

export default LayoutPrincipal;
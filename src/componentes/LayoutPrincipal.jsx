// src/componentes/LayoutPrincipal.jsx

import React from 'react';
import { Outlet } from 'react-router-dom';
import Navegacao from './Navegacao';
import { Box, CssBaseline, Toolbar } from '@mui/material';

function LayoutPrincipal() {
  return (
    <Box sx={{
      display: 'flex',
      minHeight: '100vh',
      bgcolor: 'background.default', // Usando a cor de fundo sólida do novo tema
    }}>
      <CssBaseline />
      <Navegacao />

      {/* O 'main' agora conterá nossas páginas */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3, md: 4 }, // Padding responsivo para o conteúdo
          width: { sm: `calc(100% - 270px)` }, // Considera o drawer no desktop
          ml: { sm: `270px` }, // Espaçamento para o drawer no desktop
        }}
      >
        <Toolbar /> {/* Espaço para a AppBar não cobrir o conteúdo */}
        <Outlet />
      </Box>
    </Box>
  );
}

export default LayoutPrincipal;
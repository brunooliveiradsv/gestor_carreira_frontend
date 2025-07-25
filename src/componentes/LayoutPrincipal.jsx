import React from 'react';
import { Outlet } from 'react-router-dom';
import Navegacao from './Navegacao';
import Anuncio from './Anuncio'; // 1. Importar o componente de anúncio
import { Box, CssBaseline, Toolbar } from '@mui/material';

function LayoutPrincipal() {
  return (
    <Box sx={{
      display: 'flex',
      minHeight: '100vh',
      bgcolor: 'background.default',
    }}>
      <CssBaseline />
      <Navegacao />
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3, md: 4 },
          width: { sm: `calc(100% - 270px)` },
          ml: { sm: `270px` },
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}

export default LayoutPrincipal;
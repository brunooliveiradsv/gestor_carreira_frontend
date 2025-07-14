// src/componentes/LayoutPrincipal.jsx

import React from 'react';
import { Outlet } from 'react-router-dom';
import Navegacao from './Navegacao';
import { Box, CssBaseline, useTheme, Toolbar } from '@mui/material'; // Adicionado useTheme

function LayoutPrincipal() {
  const theme = useTheme(); // Para acessar as cores do tema

  return (
    // Removendo o background fixo. O CssBaseline já cuida do background.
    // Se você *ainda* quiser um gradiente específico AQUI no layout, use as cores do tema.
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh',
      // Exemplo para manter o gradiente usando cores do tema:
      background: `linear-gradient(to right bottom, ${theme.palette.background.default}, ${theme.palette.background.paper})`,
      // Ou simplesmente remova a linha acima para usar a cor sólida do tema (theme.palette.background.default)
    }}>
      {/* CssBaseline já está no main.jsx, mas não custa ter aqui também se houver outros resets específicos */}
      <CssBaseline /> 
      <Navegacao />
      <Toolbar />
      {/* O 'main' agora conterá nossas páginas, já com o fundo correto */}
      <main style={{ padding: '20px', flexGrow: 1 }}>
        <Outlet />
      </main>
    </Box>
  );
}

export default LayoutPrincipal;

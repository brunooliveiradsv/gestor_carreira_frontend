// src/tema.js

import { createTheme } from '@mui/material/styles';

export const tema = createTheme({
  // 1. Definimos nossa paleta de cores
  palette: {
    primary: {
      main: '#4000F0', // O seu azul/roxo principal
      contrastText: '#ffffff', // Cor do texto para a cor primária
    },
    secondary: {
      main: '#2703A6', // Um roxo secundário que usamos
    },
    background: {
      default: '#111827', // A cor de fundo principal do nosso layout
      paper: '#ffffff', // A cor de fundo dos 'Cards' e 'Papers'
    },
    text: {
      primary: 'rgba(0, 0, 0, 0.87)',
      secondary: 'rgba(0, 0, 0, 0.6)',
    },
    warning: {
      main: '#FF0400',
    }
  },

  // 2. Definimos estilos padrão para os componentes
  components: {
    // Estilo padrão para TODOS os botões
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8, // Bordas arredondadas para todos os botões
          textTransform: 'none', // Impede que o texto fique em MAIÚSCULAS
          fontWeight: 'bold',
        },
      },
    },
    // Estilo padrão para os Cards
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8, // Bordas arredondadas para todos os cards
        },
      },
    },
  },
});
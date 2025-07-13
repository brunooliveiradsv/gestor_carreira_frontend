// src/tema.js
import { createTheme } from '@mui/material/styles';

const darkTheme = createTheme({
  palette: {
    mode: 'dark', // Define o modo escuro
    primary: {
      main: '#00BCD4', // Azul Ciano Tech
      light: '#4DD0E1',
      dark: '#0097A7',
      contrastText: '#000000', // Texto preto para contraste no ciano
    },
    secondary: {
      main: '#B0BEC5', // Cinza-azulado claro para elementos secundários
      light: '#E0E0E0',
      dark: '#78909C',
      contrastText: '#000000',
    },
    background: {
      default: '#121212', // Fundo bem escuro
      paper: '#1E1E1E',   // Cor para componentes como Paper, Card
    },
    text: {
      primary: '#E0E0E0',
      secondary: '#B0BEC5', // Usando o cinza secundário para textos
      disabled: '#616161',
    },
    error: {
      main: '#FF5252', // Vermelho um pouco mais vibrante
    },
    warning: {
      main: '#FFAB40', // Ambar para avisos
    },
    info: {
      main: '#40C4FF', // Azul claro para informações
    },
    success: {
      main: '#4CAF50', 
      contrastText: '#ffffff',
    },
  },
  typography: {
    fontFamily: [
      'Inter', 
      'sans-serif',
    ].join(','),
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
      '@media (min-width:600px)': {
        fontSize: '3rem',
      },
    },
    h4: { 
      fontWeight: 700,
    },
    button: {
      textTransform: 'none', 
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.4)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
        containedPrimary: {
          backgroundColor: '#00BCD4',
          color: '#000000',
          '&:hover': {
            backgroundColor: '#0097A7',
            boxShadow: '0px 6px 15px rgba(0, 188, 212, 0.3)', // Sombra azulada no hover
          },
        },
      },
    },
    MuiCard: {
        styleOverrides: {
            root: {
                borderRadius: 10,
                borderColor: 'rgba(255, 255, 255, 0.12)',
            },
        },
    },
    MuiTextField: {
        styleOverrides: {
            root: {
                '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                        borderColor: '#505050',
                    },
                    '&:hover fieldset': {
                        borderColor: '#00BCD4', // Borda azul no hover
                    },
                    '&.Mui-focused fieldset': {
                        borderColor: '#00BCD4', // Borda azul no focus
                    },
                },
                '& .MuiInputLabel-root': {
                    color: '#A0A0A0',
                    '&.Mui-focused': {
                        color: '#00BCD4', // Label azul no focus
                    },
                },
                '& .MuiInputBase-input': {
                    color: '#E0E0E0',
                },
            },
        },
    },
    MuiChip: {
        styleOverrides: {
            colorSuccess: {
                backgroundColor: '#388E3C',
                color: '#E0E0E0',
            },
            colorError: {
                backgroundColor: '#D32F2F', 
                color: '#E0E0E0',
            },
            colorInfo: {
                backgroundColor: '#0288D1', // Azul escuro para info
                color: '#E0E0E0',
            },
            colorPrimary: { 
                backgroundColor: '#0097A7', // Usa o azul escuro para chips primários
                color: '#E0E0E0',
            }
        }
    }
  },
});

export default darkTheme;
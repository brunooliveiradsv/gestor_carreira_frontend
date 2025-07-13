// src/tema.js
import { createTheme } from '@mui/material/styles';

const darkTheme = createTheme({
  palette: {
    mode: 'dark', 
    primary: {
      main: '#00BCD4', // Azul Ciano Tech (Mantido)
      light: '#4DD0E1',
      dark: '#0097A7',
      contrastText: '#000000',
    },
    secondary: {
      main: '#9E9E9E', // Cinza neutro para elementos secundários
      light: '#E0E0E0',
      dark: '#616161',
      contrastText: '#000000',
    },
    background: {
      default: '#0A0A0A', // Quase preto para o fundo principal
      paper: '#141414',   // Cinza muito escuro para componentes
    },
    text: {
      primary: '#F5F5F5',
      secondary: '#9E9E9E',
      disabled: '#424242',
    },
    error: {
      main: '#FF5252',
    },
    warning: {
      main: '#FFAB40',
    },
    info: {
      main: '#40C4FF',
    },
    success: {
      main: '#4CAF50',
      contrastText: '#ffffff',
    },
    divider: 'rgba(255, 255, 255, 0.12)',
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
          boxShadow: '0px 4px 24px rgba(0, 0, 0, 0.5)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out', // Adiciona transição suave
           '&:hover': {
             transform: 'scale(1.02)', // Leve aumento no hover
           }
        },
        containedPrimary: {
          color: '#000000',
          // AQUI ESTÁ A MÁGICA DO DEGRADÊ
          background: 'linear-gradient(45deg, #0097A7 30%, #4DD0E1 90%)',
          border: 0,
          boxShadow: '0 3px 5px 2px rgba(0, 151, 167, .3)',
          '&:hover': {
            boxShadow: '0 3px 5px 2px rgba(0, 188, 212, .3)',
            // Mantém o degradê e adiciona um brilho para o feedback
            filter: 'brightness(1.1)', 
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          border: '1px solid rgba(255, 255, 255, 0.12)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: '#616161',
            },
            '&:hover fieldset': {
              borderColor: '#00BCD4',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#00BCD4',
            },
          },
          '& .MuiInputLabel-root': {
            color: '#9E9E9E',
            '&.Mui-focused': {
              color: '#00BCD4',
            },
          },
          '& .MuiInputBase-input': {
            color: '#F5F5F5',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        colorSuccess: {
          backgroundColor: '#388E3C',
          color: '#F5F5F5',
        },
        colorError: {
          backgroundColor: '#D32F2F', 
          color: '#F5F5F5',
        },
        colorInfo: {
          backgroundColor: '#0288D1',
          color: '#F5F5F5',
        },
        colorPrimary: { 
          backgroundColor: '#0097A7',
          color: '#F5F5F5',
        }
      }
    }
  },
});

export default darkTheme;
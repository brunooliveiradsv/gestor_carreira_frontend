// src/tema.js
import { createTheme } from '@mui/material/styles';

const darkTheme = createTheme({
  palette: {
    mode: 'dark', 
    primary: {
      main: '#7E57C2', // Lilás/Índigo (Deep Purple 400)
      light: '#9575CD',
      dark: '#5E35B1',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#42A5F5', // Um azul mais claro para contraste e elementos secundários
      light: '#64B5F6',
      dark: '#1E88E5',
      contrastText: '#000000',
    },
    background: {
      default: '#0A0A0A', 
      paper: '#141414',   
    },
    text: {
      primary: '#F5F5F5', 
      secondary: '#BDBDBD', // Cinza um pouco mais claro para textos secundários
      disabled: '#2B2B2B',
    },
    error: {
      main: '#EF5350',
    },
    warning: {
      main: '#FFA726',
    },
    info: {
      main: '#29B6F6',
    },
    success: {
      main: '#66BB6A',
      contrastText: '#000000',
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
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
           '&:hover': {
             transform: 'scale(1.02)',
           }
        },
        containedPrimary: {
          color: '#ffffff',
          // Degradê entre o lilás e um azul mais profundo
          background: 'linear-gradient(45deg, #5E35B1 30%, #42A5F5 90%)',
          border: 0,
          boxShadow: '0 3px 5px 2px rgba(94, 53, 177, .3)',
          '&:hover': {
            boxShadow: '0 3px 5px 2px rgba(66, 165, 245, .3)',
            filter: 'brightness(1.15)', 
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
              borderColor: '#7E57C2', // Borda lilás no hover
            },
            '&.Mui-focused fieldset': {
              borderColor: '#7E57C2', // Borda lilás no focus
            },
          },
          '& .MuiInputLabel-root': {
            color: '#BDBDBD',
            '&.Mui-focused': {
              color: '#7E57C2', // Label lilás no focus
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
          backgroundColor: '#5E35B1', // Lilás escuro para chips primários
          color: '#ffffff',
        }
      }
    }
  },
});

export default darkTheme;
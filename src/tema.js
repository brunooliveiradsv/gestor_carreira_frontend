// src/tema.js
import { createTheme } from '@mui/material/styles';

const darkTheme = createTheme({
  palette: {
    mode: 'dark', // Define o modo escuro
    primary: {
      main: '#FF7043', // Laranja vibrante (Deep Orange)
      light: '#FF8A65',
      dark: '#F4511E',
      contrastText: '#ffffff', // Texto branco para melhor contraste no laranja
    },
    secondary: {
      main: '#90A4AE', // Um cinza-azulado para elementos secundários
      light: '#CFD8DC',
      dark: '#607D8B',
      contrastText: '#000000',
    },
    background: {
      default: '#121212', // Fundo bem escuro
      paper: '#1E1E1E',   // Cor para componentes como Paper, Card
    },
    text: {
      primary: '#E0E0E0', 
      secondary: '#A0A0A0', 
      disabled: '#616161',
    },
    error: {
      main: '#CF6679', 
    },
    warning: {
      main: '#FFC107', 
    },
    info: {
      main: '#2196F3', 
    },
    success: {
      main: '#4CAF50', // Verde padrão para sucesso, para não confundir com o laranja
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
        containedPrimary: { // Estilo para o botão principal com a cor laranja
          backgroundColor: '#FF7043',
          color: '#ffffff', // Texto branco no botão laranja
          '&:hover': {
            backgroundColor: '#F4511E', // Laranja mais escuro no hover
            boxShadow: '0px 6px 15px rgb(204, 48, 1)', // Sombra alaranjada no hover
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
                        borderColor: '#FF7043', // Borda laranja no hover
                    },
                    '&.Mui-focused fieldset': {
                        borderColor: '#FF7043', // Borda laranja no focus
                    },
                },
                '& .MuiInputLabel-root': {
                    color: '#A0A0A0',
                    '&.Mui-focused': {
                        color: '#FF7043', // Label laranja no focus
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
                backgroundColor: '#388E3C', // Verde mais escuro para chips de sucesso
                color: '#E0E0E0',
            },
            colorError: {
                backgroundColor: '#D32F2F', 
                color: '#E0E0E0',
            },
            colorInfo: {
                backgroundColor: '#1976D2', 
                color: '#E0E0E0',
            },
            colorPrimary: { 
                backgroundColor: '#F4511E', // Usa o laranja escuro para chips primários
                color: '#ffffff',
            }
        }
    }
  },
});

export default darkTheme;
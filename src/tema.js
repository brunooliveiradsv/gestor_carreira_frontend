// src/tema.js
import { createTheme } from '@mui/material/styles';

const darkTheme = createTheme({
  palette: {
    mode: 'dark', // Define o modo escuro
    primary: {
      main: '#00FF41', // Verde vibrante da imagem
      light: '#33FF66',
      dark: '#00B32E',
      contrastText: '#000000', // Texto preto para contraste no verde vibrante
    },
    secondary: {
      main: '#787878', // Um cinza médio para elementos secundários
      light: '#A0A0A0',
      dark: '#505050',
      contrastText: '#ffffff',
    },
    background: {
      default: '#121212', // Fundo bem escuro
      paper: '#1E1E1E',   // Cor para componentes como Paper, Card
    },
    text: {
      primary: '#E0E0E0', // Cor de texto principal (clara no fundo escuro)
      secondary: '#A0A0A0', // Cor de texto secundário
      disabled: '#616161',
    },
    error: {
      main: '#CF6679', // Vermelho para erros
    },
    warning: {
      main: '#FFC107', // Amarelo para avisos
    },
    info: {
      main: '#2196F3', // Azul para informações
    },
    success: {
      main: '#00FF41', // Pode usar o mesmo verde para sucesso
    },
    // Adicione outras customizações se desejar
  },
  typography: {
    fontFamily: [
      'Inter', // Supondo que você queira usar Inter, ou outra fonte de sua escolha
      'sans-serif',
    ].join(','),
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
      '@media (min-width:600px)': {
        fontSize: '3rem',
      },
    },
    h4: { // Adapta o h4 que você usa bastante nas suas páginas
      fontWeight: 700,
    },
    button: {
      textTransform: 'none', // Botões sem caixa alta por padrão, como na referência
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12, // Bordas mais arredondadas para um visual moderno
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.4)', // Sombra mais proeminente no modo dark
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8, // Ajuste do border-radius dos botões
        },
        containedPrimary: { // Estilo para o botão principal com a cor verde vibrante
          backgroundColor: '#00FF41',
          color: '#000000', // Texto preto no botão verde
          '&:hover': {
            backgroundColor: '#00B32E', // Verde mais escuro no hover
            boxShadow: '0px 6px 15px rgba(0, 255, 65, 0.4)', // Sombra esverdeada no hover
          },
        },
      },
    },
    MuiCard: {
        styleOverrides: {
            root: {
                borderRadius: 10,
                borderColor: 'rgba(255, 255, 255, 0.12)', // Borda sutil para cartões
            },
        },
    },
    MuiTextField: {
        styleOverrides: {
            root: {
                '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                        borderColor: '#505050', // Borda mais clara para campos de texto
                    },
                    '&:hover fieldset': {
                        borderColor: '#00FF41', // Borda verde no hover
                    },
                    '&.Mui-focused fieldset': {
                        borderColor: '#00FF41', // Borda verde no focus
                    },
                },
                '& .MuiInputLabel-root': {
                    color: '#A0A0A0', // Label em cinza secundário
                    '&.Mui-focused': {
                        color: '#00FF41', // Label verde no focus
                    },
                },
                '& .MuiInputBase-input': {
                    color: '#E0E0E0', // Cor do texto digitado
                },
            },
        },
    },
    MuiChip: { // Ajuste para os Chips, como os de status na Agenda
        styleOverrides: {
            colorSuccess: {
                backgroundColor: '#00B32E', // Verde para chips de sucesso
                color: '#E0E0E0',
            },
            colorError: {
                backgroundColor: '#A30000', // Vermelho escuro para chips de erro
                color: '#E0E0E0',
            },
            colorInfo: {
                backgroundColor: '#2196F3', // Azul para chips de informação
                color: '#E0E0E0',
            },
            colorPrimary: { // Para chips de Admin
                backgroundColor: '#00B32E',
                color: '#E0E0E0',
            }
        }
    }
  },
});

export default darkTheme;
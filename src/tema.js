// src/tema.js
import { createTheme } from '@mui/material/styles';

const newDarkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#7E57C2',
      light: '#9575CD',
      dark: '#512DA8',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#26A69A',
      light: '#4DB6AC',
      dark: '#00796B',
      contrastText: '#ffffff',
    },
    background: {
      default: '#121212',
      paper: '#1E1E1E',
    },
    text: {
      primary: '#E0E0E0',
      secondary: '#BDBDBD',
      disabled: '#757575',
    },
    error: {
      main: '#E57373',
    },
    warning: {
      main: '#FFB74D',
    },
    info: {
      main: '#64B5F6',
    },
    success: {
      main: '#81C784',
    },
    divider: 'rgba(255, 255, 255, 0.12)',
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 800, fontSize: '2.75rem' },
    h2: { fontWeight: 700, fontSize: '2.25rem' },
    h3: { fontWeight: 700, fontSize: '2rem' },
    h4: { fontWeight: 700, fontSize: '1.75rem' },
    h5: { fontWeight: 600, fontSize: '1.5rem' },
    h6: { fontWeight: 600, fontSize: '1.25rem' },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    // --- Layout e Superfícies ---
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        elevation: 0,
        outlined: ({ theme }) => ({
            border: `1px solid ${theme.palette.divider}`,
        }),
      },
    },
    MuiCard: {
        styleOverrides: {
          root: ({ theme }) => ({
            backgroundColor: theme.palette.background.paper,
            transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: `0px 8px 20px ${theme.palette.primary.dark}33`,
            },
          }),
        },
    },
    MuiAppBar: {
        styleOverrides: {
            root: ({ theme }) => ({
                backgroundColor: 'rgba(30, 30, 30, 0.85)',
                backdropFilter: 'blur(10px)',
                boxShadow: 'none',
                borderBottom: `1px solid ${theme.palette.divider}`,
            }),
        }
    },
    // --- NOVA REGRA PARA REMOVER A SOMBRA DO DIALOG ---
    MuiDialog: {
      styleOverrides: {
        paper: {
          boxShadow: 'none',
          backgroundImage: 'none' // Garante que nenhum gradiente seja aplicado
        }
      }
    },
    // --- Controles de Formulário ---
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          padding: '10px 20px',
        },
        containedPrimary: {
            '&:hover': {
                backgroundColor: '#673AB7',
            }
        }
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
      },
      styleOverrides: {
        root: ({ theme }) => ({
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.23)',
            },
            '&:hover fieldset': {
              borderColor: theme.palette.primary.light,
            },
            '&.Mui-focused fieldset': {
              borderColor: theme.palette.primary.main,
              borderWidth: '2px',
            },
          },
        }),
      },
    },
    MuiIconButton: {
        styleOverrides: {
            root: ({ theme }) => ({
                transition: 'background-color 0.2s ease-in-out',
                '&:hover': {
                    backgroundColor: theme.palette.action.hover,
                }
            }),
        }
    },
    // --- Outros Componentes ---
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
        },
      },
    },
    MuiTooltip: {
        defaultProps: {
            arrow: true,
        },
        styleOverrides: {
            tooltip: ({ theme }) => ({
                backgroundColor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                color: theme.palette.text.primary,
                fontSize: '0.875rem',
            }),
            arrow: ({ theme }) => ({
                color: theme.palette.background.paper,
            }),
        }
    }
  },
});

export default newDarkTheme;
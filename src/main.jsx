// src/main.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css'; // Mantenha seus estilos globais se houver
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline'; // Reseta CSS e aplica o tema base do MUI
import darkTheme from './tema'; // Importe seu tema dark

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={darkTheme}>
      <CssBaseline /> {/* Aplica estilos base do Material-UI e reinicia o CSS */}
      <App />
    </ThemeProvider>
  </React.StrictMode>,
);
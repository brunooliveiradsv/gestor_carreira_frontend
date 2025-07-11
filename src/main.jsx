// src/main.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contextos/AuthContext.jsx';

// Imports do Tema
import { ThemeProvider } from '@mui/material/styles';
import { tema } from './tema.js';

import { NotificationProvider } from './contextos/NotificationContext.jsx'; // Importa o novo provedor

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={tema}>
      {/* Envolvemos o AuthProvider com o NotificationProvider */}
      <NotificationProvider>
        <AuthProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </AuthProvider>
      </NotificationProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
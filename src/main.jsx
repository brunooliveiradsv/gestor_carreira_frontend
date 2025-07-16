// src/main.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contextos/AuthContext.jsx';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import darkTheme from './tema';

import { NotificationProvider } from './contextos/NotificationContext.jsx';

import { Provider } from 'react-redux'; // Importar Provider
import store from './store'; // Importar o store

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={darkTheme}> 
      <CssBaseline />
      <NotificationProvider>
        <AuthProvider>
          <Provider store={store}> {/* Adicione o Provider aqui */}
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </Provider>
        </AuthProvider>
      </NotificationProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
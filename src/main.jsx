// src/main.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contextos/AuthContext.jsx';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import darkTheme from './theme.js';

import { NotificationProvider } from './contextos/NotificationContext.jsx';

import { Provider } from 'react-redux';
import store from './reduxStore.js';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={darkTheme}> 
      <CssBaseline />
      {/* --- CORREÇÃO AQUI: BrowserRouter agora está por fora --- */}
      <BrowserRouter>
        <NotificationProvider>
          <AuthProvider>
            <Provider store={store}>
              <App />
            </Provider>
          </AuthProvider>
        </NotificationProvider>
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>,
);
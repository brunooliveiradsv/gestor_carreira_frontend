// src/componentes/Anuncio.jsx
import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../contextos/AuthContext';
import AdSense from 'react-adsense';
import {
    Dialog, DialogTitle, DialogContent,
    IconButton, Typography
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

function Anuncio() {
  const { usuario } = useContext(AuthContext);

  // Não precisa mais de estado para o diálogo, o AdSense será renderizado diretamente se aplicável
  
  // --- LÓGICA ALTERADA ---
  // O anúncio só deve ser renderizado se o plano do utilizador for 'free'
  if (usuario?.plano !== 'free') {
    return null;
  }
  // --- FIM DA ALTERAÇÃO ---

  return (
    // Renderiza diretamente num Paper para se integrar melhor ao layout
    <Paper sx={{ p: 1, mb: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '90px', bgcolor: 'action.hover' }}>
      <AdSense.Google
        client="ca-pub-6978134622596714"
        slot="6578217682" // Verifique se este é o slot correto para este formato
        style={{ display: 'block', width: '100%', maxWidth: '728px' }}
        format="auto"
        responsive="true"
      />
    </Paper>
  );
}
export default Anuncio;
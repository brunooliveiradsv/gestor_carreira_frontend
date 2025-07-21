// src/componentes/Anuncio.jsx
import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contextos/AuthContext';
import { Paper, Typography, Button, Box } from '@mui/material';
import { WorkspacePremium as WorkspacePremiumIcon } from '@mui/icons-material';

function Anuncio() {
  // 1. Obtém os dados do utilizador a partir do contexto
  const { usuario } = useContext(AuthContext);
  const navigate = useNavigate();

  // 2. Condição de exibição: só mostra se o plano for 'padrao'
  if (usuario?.plano !== 'padrao') {
    return null; // Não renderiza nada para utilizadores premium, em teste ou sem plano
  }

  // 3. Se a condição for cumprida, renderiza o banner do anúncio
  return (
    <Paper 
      variant="outlined" 
      sx={{ 
        p: 2, 
        mb: 4, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        flexWrap: 'wrap',
        gap: 2,
        backgroundColor: 'action.hover',
        borderColor: 'primary.dark'
      }}
    >
      <Box>
        <Typography variant="h6" component="h3" fontWeight="bold">
          Apoie o VOXGest!
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Faça o upgrade para o plano Premium e navegue sem anúncios.
        </Typography>
      </Box>
      <Button
        variant="contained"
        color="primary"
        startIcon={<WorkspacePremiumIcon />}
        onClick={() => navigate('/assinatura')}
      >
        Ver Planos Premium
      </Button>
    </Paper>
  );
}

export default Anuncio;
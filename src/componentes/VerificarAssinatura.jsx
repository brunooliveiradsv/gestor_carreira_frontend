// src/componentes/VerificarAssinatura.jsx
import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../contextos/AuthContext';
import { Box, CircularProgress } from '@mui/material';

function VerificarAssinatura() {
  const { usuario, carregando } = useContext(AuthContext);

  // Se ainda estiver a carregar os dados do usuário, mostra um spinner
  if (carregando) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Lógica para verificar se a assinatura é válida
  const hoje = new Date();
  const dataTerminoTeste = usuario?.teste_termina_em ? new Date(usuario.teste_termina_em) : null;
  const isTesteValido = usuario?.status_assinatura === 'teste' && dataTerminoTeste > hoje;
  const isAssinaturaAtiva = usuario?.status_assinatura === 'ativa';

  // Se a assinatura for válida, renderiza a página solicitada (filho)
  if (isTesteValido || isAssinaturaAtiva) {
    return <Outlet />; // Outlet renderiza as rotas filhas
  }

  // Se a assinatura não for válida, redireciona para a página de assinatura
  return <Navigate to="/assinatura" replace />;
}

export default VerificarAssinatura;
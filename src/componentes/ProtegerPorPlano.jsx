import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom'; // 1. Importar o Outlet
import { AuthContext } from '../contextos/AuthContext';
import { Box, CircularProgress } from '@mui/material';

const HIERARQUIA_PLANOS = {
  free: 0,
  padrao: 1,
  premium: 2,
};

// 2. Adicionar 'children' como um dos parâmetros da função
function ProtegerPorPlano({ children, planoMinimo = 'free' }) {
  const { usuario, carregando } = useContext(AuthContext);

  if (carregando) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const nivelUtilizador = HIERARQUIA_PLANOS[usuario?.plano] ?? -1;
  const nivelExigido = HIERARQUIA_PLANOS[planoMinimo];
  const temAcesso = usuario?.status_assinatura === 'ativa' && nivelUtilizador >= nivelExigido;

  if (temAcesso) {
    // 3. LÓGICA CORRIGIDA:
    // Se 'children' existir (como no caso do ModoPalco), renderiza-o.
    // Caso contrário, renderiza o <Outlet /> para as rotas aninhadas (Dashboard, etc.).
    return children ? children : <Outlet />;
  }

  return <Navigate to="/assinatura" replace />;
}

export default ProtegerPorPlano;
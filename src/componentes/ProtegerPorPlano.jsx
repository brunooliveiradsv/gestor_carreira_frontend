import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../contextos/AuthContext';
import { Box, CircularProgress } from '@mui/material';

// Define a hierarquia dos planos. Quanto maior o número, maior o nível.
const HIERARQUIA_PLANOS = {
  free: 0,
  padrao: 1,
  premium: 2,
};

/**
 * Protege rotas filhas, permitindo o acesso apenas a utilizadores
 * com um nível de plano igual ou superior ao mínimo exigido.
 * @param {{ children: React.ReactNode, planoMinimo: 'free' | 'padrao' | 'premium' }} props
 */
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
    // Se 'children' existir (como no caso do ModoPalco), renderiza-o.
    // Caso contrário, renderiza o <Outlet /> para as rotas aninhadas (Dashboard, etc.).
    return children ? children : <Outlet />;
  }

  return <Navigate to="/assinatura" replace />;
}

export default ProtegerPorPlano;
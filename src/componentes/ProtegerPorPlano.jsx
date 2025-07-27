import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../contextos/AuthContext';
import { Box, CircularProgress } from '@mui/material';
import { HIERARQUIA_PLANOS } from '../constants';

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

  // --- LÓGICA DE ACESSO CORRIGIDA ---
  // Um utilizador tem acesso se:
  // 1. O seu nível de plano for suficiente E
  // 2. O seu plano for 'free' OU a sua assinatura estiver 'ativa'.
  const temAcesso = nivelUtilizador >= nivelExigido && (usuario?.plano === 'free' || usuario?.status_assinatura === 'ativa');

  if (temAcesso) {
    return children ? children : <Outlet />;
  }

  return <Navigate to="/assinatura" replace />;
}

export default ProtegerPorPlano;
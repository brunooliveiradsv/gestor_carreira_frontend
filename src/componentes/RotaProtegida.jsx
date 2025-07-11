// src/componentes/RotaProtegida.jsx
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../contextos/AuthContext';

function RotaProtegida({ children }) {
  // Conecta-se ao nosso "Wi-Fi de dados" para saber se o usuário está logado
  const { logado } = useContext(AuthContext);

  if (!logado) {
    // Se não estiver logado, o componente Navigate o redireciona para a página de login
    return <Navigate to="/login" replace />;
  }

  // Se estiver logado, ele simplesmente renderiza o componente "filho" (a página que ele está protegendo)
  return children;
}

export default RotaProtegida;
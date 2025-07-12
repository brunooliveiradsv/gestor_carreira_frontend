// src/contextos/AuthContext.jsx

import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import { Box, CircularProgress } from "@mui/material";

export const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [carregandoSessao, setCarregandoSessao] = useState(true);

  async function carregarDadosDoUsuario() {
    const tokenSalvo = localStorage.getItem("token");
    if (!tokenSalvo) {
      logout(); // Garante que tudo seja limpo se não houver token
      return;
    }

    try {
      axios.defaults.headers.common["Authorization"] = `Bearer ${tokenSalvo}`;
      const resposta = await axios.get(
            `${import.meta.env.VITE_API_BASE_URL}/api/usuarios/perfil`
      );
      setUsuario(resposta.data);
    } catch (error) {
      console.error("Sessão inválida. Removendo token.", error);
      logout();
    }
  }

  useEffect(() => {
    const tokenSalvo = localStorage.getItem("token");
    if (tokenSalvo) {
      carregarDadosDoUsuario().finally(() => setCarregandoSessao(false));
    } else {
      setCarregandoSessao(false);
    }
  }, []);

  async function login(email, senha) {
    try {
      const resposta = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/usuarios/login`,
        { email, senha }
      );
      const { token } = resposta.data;
      localStorage.setItem("token", token);
      await carregarDadosDoUsuario();
      return true;
    } catch (erro) {
      console.error("Erro no login pelo contexto:", erro);
      return false;
    }
  }

  function loginComToken(token) {
    localStorage.setItem("token", token);
    carregarDadosDoUsuario();
  }

  function logout() {
    setUsuario(null);
    localStorage.removeItem("token");
    axios.defaults.headers.common["Authorization"] = undefined;
  }

  if (carregandoSessao) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          bgcolor: "#111827",
        }}
      >
        <CircularProgress color="inherit" />
      </Box>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        logado: !!usuario,
        usuario,
        login,
        logout,
        loginComToken,
        carregarDadosDoUsuario,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

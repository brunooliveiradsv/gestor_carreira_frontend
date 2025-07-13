// src/paginas/Autenticacao.jsx

import { useState, useContext } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { AuthContext } from "../contextos/AuthContext";
import apiClient from "../api"; 

// Imports do Material-UI... (sem alterações aqui)
import {
  Button, TextField, Box, Typography, Paper, CircularProgress, Alert,
  InputAdornment, IconButton, Avatar, Grid, Link as MuiLink, useTheme
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

function Autenticacao() {
  const [modo, setModo] = useState("login");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const { loginComToken, logado } = useContext(AuthContext);
  const navigate = useNavigate();
  const theme = useTheme(); // Hook para acessar o tema

  if (logado) {
    return <Navigate to="/" replace />;
  }

  const alternarModo = () => {
    setModo(modo === "login" ? "cadastro" : "login");
    setNome("");
    setEmail("");
    setSenha("");
    setErro("");
  };

  const handleSubmit = async (evento) => {
    evento.preventDefault();
    setErro("");

    if (modo === "cadastro" && senha.length < 8) {
      setErro("A senha deve ter no mínimo 8 caracteres.");
      return;
    }

    setCarregando(true);
    const endpoint = modo === "login" ? "/api/usuarios/login" : "/api/usuarios/registrar";
    const payload = modo === "login" ? { email, senha } : { nome, email, senha };

    try {
      const resposta = await apiClient.post(endpoint, payload);
      loginComToken(resposta.data.token);
      navigate("/");
    } catch (err) {
      setErro(err.response?.data?.mensagem || `Erro ao ${modo}.`);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        width: "100vw",
        // Removido background fixo. Ele será do tema (palette.background.default)
        // Você pode adicionar um gradiente aqui se desejar um background diferente do default,
        // mas é melhor ter uma cor sólida ou um gradiente mais sutil para o tema dark.
        // Exemplo de gradiente mais escuro e sutil (adapte ao seu gosto):
        background: `linear-gradient(to right bottom, ${theme.palette.background.default}, ${theme.palette.background.paper})`, 
        flexDirection: { xs: "column", md: "row" },
        justifyContent: { xs: "center", md: "flex-start" },
        alignItems: { xs: "center", md: "stretch" },
      }}
    >
      {/* Lado Esquerdo - Marketing */}
      <Box
        sx={{
          flex: { xs: "none", md: 1.2 },
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          p: { xs: 2, sm: 3, md: 5, lg: 6 },
          color: "white", // Manter branco para contraste com o gradiente
          textAlign: "center",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            mb: { xs: 1, sm: 2, md: 4 },
          }}
        >
          <Typography
            variant="h4"
            component="span"
            sx={{
              mr: 1,
              fontWeight: "bold",
              fontSize: {
                xs: "1.4rem",
                sm: "1.6rem",
                md: "2rem",
                lg: "2.2rem",
              },
            }}
          >
            GESTOR
          </Typography>
          <Typography
            variant="h5"
            component="span"
            sx={{
              fontSize: {
                xs: "1.1rem",
                sm: "1.4rem",
                md: "1.8rem",
                lg: "2rem",
              },
            }}
          >
            MUSICAL
          </Typography>
        </Box>
        <Box
          sx={{
            // Removido bgcolor fixo. Poderia usar primary.dark ou um cinza escuro do tema
            bgcolor: theme.palette.secondary.dark, // Usando um cinza escuro do tema para o rótulo v1.0
            px: { xs: 1, sm: 1.5 },
            py: { xs: 0.2, sm: 0.4 },
            borderRadius: 1,
            mb: { xs: 1, sm: 2, md: 4 },
            display: "inline-block",
          }}
        >
          <Typography
            variant="body1"
            sx={{
              fontWeight: "bold",
              fontSize: { xs: "0.7rem", sm: "0.8rem", md: "1rem" },
            }}
          >
            v1.0
          </Typography>
        </Box>
        <Typography
          variant="h3"
          component="h1"
          sx={{
            fontWeight: "bold",
            mb: { xs: 1, sm: 2, md: 4 },
            lineHeight: 1.2,
            fontSize: { xs: "1.6rem", sm: "2.2rem", md: "3rem", lg: "3.5rem" },
          }}
        >
          Consolide a sua carreira conosco!
        </Typography>
        <Typography
          variant="body2"
          sx={{
            mt: { xs: 0.5, sm: 1, md: 3 },
            fontSize: { xs: "0.7rem", sm: "0.8rem", md: "1rem" },
          }}
        >
          Desenvolvido por Bruno Oliveira
        </Typography>
      </Box>

      {/* Lado Direito - Formulário Dinâmico */}
      <Box
        sx={{
          flex: { xs: "auto", md: 0.8 },
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          p: { xs: 2, sm: 3, md: 5, lg: 6 },
        }}
      >
        <Paper
          elevation={12}
          sx={{
            padding: { xs: 2.5, sm: 3.5, md: 5 },
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            // Removido borderRadius fixo para usar o do tema
            // Removido boxShadow fixo para usar o do tema
            // Removido backgroundColor fixo para usar o do tema
            width: "100%",
            maxWidth: { xs: "90%", sm: 400, md: 450 },
          }}
        >
          <Avatar sx={{ m: 1, color: "#fff", bgcolor: theme.palette.primary.dark }}> {/* Usando uma cor do tema */}
            {modo === "login" ? <LockOutlinedIcon /> : <PersonAddIcon />}
          </Avatar>
          <Typography component="h1" variant="h5" sx={{ fontWeight: "bold" }}>
            {modo === "login" ? "Acessar Conta" : "Criar Nova Conta"}
          </Typography>

          {erro && (
            <Alert severity="error" sx={{ width: "100%", mt: 2 }}>
              {erro}
            </Alert>
          )}

          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{ mt: 1, width: "100%" }}
          >
            {modo === "cadastro" && (
              <TextField
                margin="normal"
                required
                fullWidth
                id="nome"
                label="Seu Nome Completo"
                name="nome"
                autoComplete="name"
                autoFocus
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                // As cores do TextField serão controladas pelo tema
              />
            )}

            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Endereço de E-mail"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              // As cores do TextField serão controladas pelo tema
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="senha"
              label="Senha"
              type={mostrarSenha ? "text" : "password"}
              id="senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setMostrarSenha(!mostrarSenha)}
                      edge="end"
                      color="inherit" // Cor do ícone será do tema
                    >
                      {mostrarSenha ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              // As cores do TextField serão controladas pelo tema
            />

            <Box sx={{ position: "relative", mt: 2, mb: 2 }}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={carregando}
                color="primary" // Usa a cor primária do tema (verde vibrante)
                sx={{
                  py: 1.5,
                  // Removido borderRadius fixo para usar o do tema (MuiButton)
                  // Removido bgcolor fixo para usar o do tema (MuiButton)
                  // Removido hover fixo para usar o do tema (MuiButton)
                }}
              >
                {carregando ? (
                  <CircularProgress size={24} color="inherit" />
                ) : modo === "login" ? (
                  "Acessar"
                ) : (
                  "Cadastrar e Entrar"
                )}
              </Button>
            </Box>

            <Grid container justifyContent="center">
              <Grid item>
                <MuiLink
                  component="button"
                  type="button"
                  variant="body2"
                  onClick={alternarModo}
                  sx={{ cursor: "pointer" }}
                >
                  {modo === "login"
                    ? "Não tem uma conta? Cadastre-se"
                    : "Já tem uma conta? Faça o login"}
                </MuiLink>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}

export default Autenticacao;
// src/paginas/Autenticacao.jsx
import { useState, useContext } from "react";
import { useNavigate, Navigate, Link as RouterLink } from "react-router-dom";
import { AuthContext } from "../contextos/AuthContext";

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
  
  const { login, registrar, logado } = useContext(AuthContext);
  const navigate = useNavigate();
  const theme = useTheme();

  if (logado) {
    return <Navigate to="/dashboard" replace />;
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

    // --- CORREÇÃO 2: Normaliza o e-mail ---
    // Converte para minúsculas e remove espaços no início/fim
    const emailNormalizado = email.trim().toLowerCase();

    setCarregando(true);
    
    let sucesso = false;
    if (modo === 'login') {
        // Usa o e-mail normalizado para o login
        sucesso = await login(emailNormalizado, senha);
    } else {
        // Usa o e-mail normalizado para o registo
        sucesso = await registrar(nome, emailNormalizado, senha);
    }
    
    setCarregando(false);
  };
  
  // --- CORREÇÃO 1: Estilo para remover o fundo do preenchimento automático ---
  const autofillStyle = {
    '& .MuiInputBase-input:-webkit-autofill': {
      WebkitBoxShadow: `0 0 0 100px ${theme.palette.background.paper} inset`,
      WebkitTextFillColor: theme.palette.text.primary,
      caretColor: theme.palette.text.primary,
    },
  };

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        width: "100vw",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: 'background.default'
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, sm: 4, md: 5 },
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
          maxWidth: 450,
          border: `1px solid ${theme.palette.divider}`,
          bgcolor: 'background.paper'
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
          {modo === "login" ? <LockOutlinedIcon /> : <PersonAddIcon />}
        </Avatar>
        <Typography component="h1" variant="h5" sx={{ fontWeight: "bold" }}>
          {modo === "login" ? "Acessar Conta" : "Criar Nova Conta"}
        </Typography>
        <Typography component="p" variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
          {modo === 'login' ? 'Bem-vindo de volta! Insira suas credenciais.' : 'Preencha os dados para começar sua jornada.'}
        </Typography>

        {erro && (
          <Alert severity="error" sx={{ width: "100%", mt: 2.5 }}>
            {erro}
          </Alert>
        )}

        <Box
          component="form"
          onSubmit={handleSubmit}
          noValidate
          sx={{ mt: 3, width: "100%" }}
        >
          {modo === "cadastro" && (
            <TextField
              margin="normal"
              required
              fullWidth
              id="nome"
              label="Seu Nome Artístico"
              name="nome"
              autoComplete="name"
              autoFocus
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              sx={autofillStyle}
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
            sx={autofillStyle}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="senha"
            label="Senha"
            type={mostrarSenha ? "text" : "password"}
            id="senha"
            autoComplete={modo === 'login' ? 'current-password' : 'new-password'}
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            sx={autofillStyle}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                    edge="end"
                  >
                    {mostrarSenha ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          
            {modo === 'login' && (
                <MuiLink
                  component={RouterLink}
                  to="/recuperar-senha"
                  variant="body2"
                  sx={{ display: 'block', textAlign: 'right', mt: 1 }}
                >
                  Esqueceu a senha?
                </MuiLink>
            )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={carregando}
            sx={{ mt: 3, mb: 2, py: 1.5 }}
          >
            {carregando ? (
              <CircularProgress size={24} color="inherit" />
            ) : modo === "login" ? (
              "Entrar"
            ) : (
              "Criar Conta"
            )}
          </Button>

          <Grid container justifyContent="center">
            <Grid item>
              <MuiLink
                component="button"
                type="button"
                variant="body2"
                onClick={alternarModo}
                sx={{ cursor: "pointer", background: 'none', border: 'none', p:0, color: 'primary.main' }}
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
  );
}

export default Autenticacao;
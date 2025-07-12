// src/paginas/Configuracoes.jsx

import React, { useState, useEffect, useContext } from "react";
import apiClient from '../api';
import { useNotificacao } from "../contextos/NotificationContext";
import { AuthContext } from "../contextos/AuthContext";

import {
  Box,
  Button,
  Container,
  Typography,
  CircularProgress,
  Paper,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
} from "@mui/material";

function Configuracoes() {
  const { usuario, carregarDadosDoUsuario, logout } = useContext(AuthContext);
  const { mostrarNotificacao } = useNotificacao();

  const [email, setEmail] = useState("");
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [dialogoSenhaAberto, setDialogoSenhaAberto] = useState(false);

  useEffect(() => {
    if (usuario) {
      setEmail(usuario.email || "");
    }
  }, [usuario]);

  const handleSalvarEmail = async () => {
    if (!email)
      return mostrarNotificacao(
        "O campo de e-mail não pode estar vazio.",
        "warning"
      );

    setCarregando(true);
    try {
      // CORREÇÃO: Chamando a rota correta /perfil/email
      await apiClient.put(`/api/usuarios/perfil/email`, {
        email,
      });
      // CORREÇÃO: Chamando a função correta para atualizar os dados do usuário
      await carregarDadosDoUsuario();
      mostrarNotificacao("E-mail atualizado com sucesso!", "success");
    } catch (error) {
      mostrarNotificacao(
        error.response?.data?.mensagem || "Falha ao atualizar o e-mail.",
        "error"
      );
    } finally {
      setCarregando(false);
    }
  };

  const abrirDialogoSenha = () => {
    if (!senhaAtual || !novaSenha || !confirmarNovaSenha)
      return mostrarNotificacao(
        "Preencha todos os campos de senha.",
        "warning"
      );
    if (novaSenha !== confirmarNovaSenha)
      return mostrarNotificacao(
        "A nova senha e a confirmação não coincidem.",
        "error"
      );
    if (novaSenha.length < 8)
      return mostrarNotificacao(
        "A nova senha deve ter no mínimo 8 caracteres.",
        "warning"
      );
    setDialogoSenhaAberto(true);
  };

  const fecharDialogoSenha = () => setDialogoSenhaAberto(false);

  const handleSalvarSenha = async () => {
    fecharDialogoSenha();
    setCarregando(true);
    try {
      // CORREÇÃO: Chamando a rota correta /perfil/senha
      await apiClient.put(`/api/usuarios/perfil/senha`, {
        senhaAtual,
        novaSenha,
      });
      mostrarNotificacao(
        "Senha atualizada com sucesso! Por favor, faça o login novamente.",
        "success"
      );
      logout();
    } catch (error) {
      mostrarNotificacao(
        error.response?.data?.mensagem || "Falha ao atualizar a senha.",
        "error"
      );
    } finally {
      setCarregando(false);
    }
  };

  if (!usuario) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={6} sx={{ p: { xs: 2, md: 4 }, borderRadius: 3 }}>
        <Typography
          variant="h4"
          component="h1"
          fontWeight="bold"
          sx={{ mb: 4 }}
        >
          Configurações da Conta
        </Typography>

        <Box
          component="form"
          noValidate
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          <Typography variant="h6" component="h2">
            Alterar E-mail
          </Typography>
          <TextField
            label="E-mail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
          />
          <Box sx={{ alignSelf: "flex-end" }}>
            <Button
              variant="contained"
              onClick={handleSalvarEmail}
              disabled={carregando}
            >
              {carregando ? <CircularProgress size={24} /> : "Salvar E-mail"}
            </Button>
          </Box>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box
          component="form"
          noValidate
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          <Typography variant="h6" component="h2">
            Alterar Senha
          </Typography>
          <TextField
            label="Senha Atual"
            type="password"
            value={senhaAtual}
            onChange={(e) => setSenhaAtual(e.target.value)}
            fullWidth
          />
          <TextField
            label="Nova Senha"
            type="password"
            value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)}
            fullWidth
          />
          <TextField
            label="Confirmar Nova Senha"
            type="password"
            value={confirmarNovaSenha}
            onChange={(e) => setConfirmarNovaSenha(e.target.value)}
            fullWidth
          />
          <Box sx={{ alignSelf: "flex-end" }}>
            <Button
              variant="contained"
              onClick={abrirDialogoSenha}
              disabled={carregando}
            >
              {carregando ? <CircularProgress size={24} /> : "Alterar Senha"}
            </Button>
          </Box>
        </Box>
      </Paper>

      <Dialog open={dialogoSenhaAberto} onClose={fecharDialogoSenha}>
        <DialogTitle>Confirmar Alteração de Senha</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Você tem certeza que deseja prosseguir? Após a alteração, você será
            desconectado e precisará fazer login com a nova senha.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={fecharDialogoSenha}>Cancelar</Button>
          <Button
            onClick={handleSalvarSenha}
            color="primary"
            autoFocus
            disabled={carregando}
          >
            {carregando ? <CircularProgress size={24} /> : "Confirmar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Configuracoes;

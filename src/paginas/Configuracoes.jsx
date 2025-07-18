// src/paginas/Configuracoes.jsx
import React, { useState, useEffect, useContext, useRef } from "react";
import apiClient from '../api';
import { useNotificacao } from "../contextos/NotificationContext";
import { AuthContext } from "../contextos/AuthContext";

import {
  Box, Button, Typography, CircularProgress, Paper, TextField,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Grid, Avatar, Badge, IconButton
} from "@mui/material";
import { PhotoCamera } from "@mui/icons-material";

function Configuracoes() {
  const { usuario, setUsuario, logout } = useContext(AuthContext);
  const { mostrarNotificacao } = useNotificacao();

  const [email, setEmail] = useState("");
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState("");
  const [carregandoEmail, setCarregandoEmail] = useState(false);
  const [carregandoSenha, setCarregandoSenha] = useState(false);
  const [dialogoSenhaAberto, setDialogoSenhaAberto] = useState(false);

  const [novaFoto, setNovaFoto] = useState(null);
  const [previewFoto, setPreviewFoto] = useState(null);
  const [carregandoFoto, setCarregandoFoto] = useState(false);
  const fileInputRef = useRef();

  useEffect(() => {
    if (usuario) {
      setEmail(usuario.email || "");
      const fotoUrlCompleta = usuario.foto_url ? `${apiClient.defaults.baseURL}${usuario.foto_url}` : null;
      setPreviewFoto(fotoUrlCompleta);
    }
  }, [usuario]);

  const handleSalvarEmail = async (e) => {
    e.preventDefault();
    if (!email) {
      return mostrarNotificacao("O campo de e-mail não pode estar vazio.", "warning");
    }

    setCarregandoEmail(true);
    try {
      const { data } = await apiClient.put(`/api/usuarios/perfil/email`, { email });
      setUsuario(data);
      mostrarNotificacao("E-mail atualizado com sucesso!", "success");
    } catch (error) {
      mostrarNotificacao(error.response?.data?.mensagem || "Falha ao atualizar o e-mail.", "error");
    } finally {
      setCarregandoEmail(false);
    }
  };

  const abrirDialogoSenha = (e) => {
    e.preventDefault();
    if (!senhaAtual || !novaSenha || !confirmarNovaSenha) {
      return mostrarNotificacao("Preencha todos os campos de senha.", "warning");
    }
    if (novaSenha !== confirmarNovaSenha) {
      return mostrarNotificacao("A nova senha e a confirmação não coincidem.", "error");
    }
    if (novaSenha.length < 8) {
      return mostrarNotificacao("A nova senha deve ter no mínimo 8 caracteres.", "warning");
    }
    setDialogoSenhaAberto(true);
  };

  const fecharDialogoSenha = () => setDialogoSenhaAberto(false);

  const handleSalvarSenha = async () => {
    fecharDialogoSenha();
    setCarregandoSenha(true);
    try {
      await apiClient.put(`/api/usuarios/perfil/senha`, { senhaAtual, novaSenha });
      mostrarNotificacao("Senha atualizada com sucesso! Por favor, faça o login novamente.", "success");
      logout();
    } catch (error) {
      mostrarNotificacao(error.response?.data?.mensagem || "Falha ao atualizar a senha.", "error");
    } finally {
      setCarregandoSenha(false);
    }
  };

  // --- FUNÇÃO ATUALIZADA COM VALIDAÇÃO DE TAMANHO ---
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Define o limite de tamanho em bytes (5MB)
      const MAX_FILE_SIZE = 5 * 1024 * 1024; 
      
      // Verifica se o arquivo excede o limite
      if (file.size > MAX_FILE_SIZE) {
        mostrarNotificacao('A imagem é muito grande. O limite máximo é de 5MB.', 'error');
        setNovaFoto(null); // Limpa a seleção
        e.target.value = null; // Reseta o input de arquivo
        return; // Interrompe a execução
      }
      
      // Se o tamanho for válido, atualiza os estados
      setNovaFoto(file);
      setPreviewFoto(URL.createObjectURL(file));
    }
  };

  const handleSalvarFoto = async () => {
    if (!novaFoto) return;

    setCarregandoFoto(true);
    const formData = new FormData();
    formData.append('foto', novaFoto);

    try {
      const { data } = await apiClient.put('/api/usuarios/perfil/foto', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      setUsuario(data);
      
      mostrarNotificacao('Foto de perfil atualizada com sucesso!', 'success');
      setNovaFoto(null);
    } catch (error) {
      mostrarNotificacao(error.response?.data?.mensagem || 'Falha ao salvar a foto.', 'error');
    } finally {
      setCarregandoFoto(false);
    }
  };


  if (!usuario) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }
  
  const fotoUrlCompleta = usuario.foto_url ? `${apiClient.defaults.baseURL}${usuario.foto_url}` : null;

  return (
    <Box>
        <Box sx={{ mb: 4 }}>
            <Typography variant="h4" component="h1" fontWeight="bold">Configurações da Conta</Typography>
            <Typography color="text.secondary">Gerencie suas informações de acesso e perfil.</Typography>
        </Box>
        <Grid container spacing={4}>
            <Grid xs={12} md={4}>
              <Paper sx={{ p: { xs: 2, md: 3 }, height: '100%', textAlign: 'center' }}>
                <Typography variant="h6" component="h2" gutterBottom>Foto de Perfil</Typography>
                
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  badgeContent={
                    <IconButton
                      color="primary"
                      aria-label="upload picture"
                      component="span"
                      onClick={() => fileInputRef.current.click()}
                      sx={{bgcolor: 'background.paper', '&:hover': {bgcolor: 'action.hover'}}}
                    >
                      <PhotoCamera />
                    </IconButton>
                  }
                >
                  <Avatar
                    src={previewFoto || fotoUrlCompleta}
                    sx={{ width: 150, height: 150, margin: 'auto', mb: 2, fontSize: '4rem' }}
                  >
                     {usuario?.nome?.charAt(0).toUpperCase()}
                  </Avatar>
                </Badge>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleFileChange}
                />

                <Typography variant="caption" color="text.secondary" display="block">
                  Clique na câmera para alterar a foto.
                </Typography>

                <Button
                  variant="contained"
                  sx={{mt: 2}}
                  disabled={!novaFoto || carregandoFoto}
                  onClick={handleSalvarFoto}
                >
                  {carregandoFoto ? <CircularProgress size={24} /> : 'Salvar Foto'}
                </Button>
              </Paper>
            </Grid>

            <Grid xs={12} md={8}>
              <Grid container spacing={4} direction="column">
                <Grid>
                  <Paper sx={{ p: { xs: 2, md: 3 }}}>
                      <Typography variant="h6" component="h2" gutterBottom>Alterar E-mail</Typography>
                      <Box component="form" onSubmit={handleSalvarEmail} noValidate sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
                        <TextField label="E-mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth />
                        <Button type="submit" variant="contained" disabled={carregandoEmail} sx={{ alignSelf: "flex-start" }}>
                            {carregandoEmail ? <CircularProgress size={24} /> : "Salvar E-mail"}
                        </Button>
                      </Box>
                  </Paper>
                </Grid>
                <Grid>
                  <Paper sx={{ p: { xs: 2, md: 3 }}}>
                      <Typography variant="h6" component="h2" gutterBottom>Alterar Senha</Typography>
                      <Box component="form" onSubmit={abrirDialogoSenha} noValidate sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
                        <TextField label="Senha Atual" type="password" autoComplete="current-password" value={senhaAtual} onChange={(e) => setSenhaAtual(e.target.value)} fullWidth />
                        <TextField label="Nova Senha" type="password" autoComplete="new-password" value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} fullWidth />
                        <TextField label="Confirmar Nova Senha" type="password" autoComplete="new-password" value={confirmarNovaSenha} onChange={(e) => setConfirmarNovaSenha(e.target.value)} fullWidth />
                        <Button type="submit" variant="contained" disabled={carregandoSenha} sx={{ alignSelf: "flex-start" }}>
                            {carregandoSenha ? <CircularProgress size={24} /> : "Alterar Senha"}
                        </Button>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </Grid>
        </Grid>

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
          <Button onClick={handleSalvarSenha} color="primary" autoFocus disabled={carregandoSenha}>
            {carregandoSenha ? <CircularProgress size={24} /> : "Confirmar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Configuracoes;
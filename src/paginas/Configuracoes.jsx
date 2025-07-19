// src/paginas/Configuracoes.jsx
import React, { useState, useEffect, useContext, useRef } from "react";
import apiClient from '../api';
import { useNotificacao } from "../contextos/NotificationContext";
import { AuthContext } from "../contextos/AuthContext";
import {
  Box, Button, Typography, CircularProgress, Paper, TextField,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Grid, Avatar, Badge, IconButton, Link, Alert
} from "@mui/material";
import { PhotoCamera, Link as LinkIcon, Instagram, YouTube, MusicNote } from "@mui/icons-material";

function Configuracoes() {
  const { usuario, setUsuario, logout } = useContext(AuthContext);
  const { mostrarNotificacao } = useNotificacao();

  // Estados dos formulários
  const [email, setEmail] = useState("");
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState("");
  const [novaFoto, setNovaFoto] = useState(null);
  const [previewFoto, setPreviewFoto] = useState(null);
  const [biografia, setBiografia] = useState("");
  const [urlUnica, setUrlUnica] = useState("");
  const [links, setLinks] = useState({ instagram: '', youtube: '', spotify: '' });

  const [carregando, setCarregando] = useState({ email: false, senha: false, foto: false, publico: false });
  const [dialogoSenhaAberto, setDialogoSenhaAberto] = useState(false);
  const fileInputRef = useRef();

  useEffect(() => {
    if (usuario) {
      setEmail(usuario.email || "");
      setBiografia(usuario.biografia || "");
      setUrlUnica(usuario.url_unica || "");
      setLinks(usuario.links_redes || { instagram: '', youtube: '', spotify: '' });
      
      let fotoUrlCompleta = null;
      if (usuario.foto_url) {
          if (usuario.foto_url.startsWith('http')) {
              fotoUrlCompleta = usuario.foto_url;
          } else {
              fotoUrlCompleta = `${apiClient.defaults.baseURL}${usuario.foto_url}`;
          }
      }
      setPreviewFoto(fotoUrlCompleta);
    }
  }, [usuario]);
  
  const handleLinkChange = (plataforma, valor) => setLinks(prev => ({ ...prev, [plataforma]: valor }));
  
  const handleSalvar = async (campo, payload) => {
    setCarregando(prev => ({ ...prev, [campo]: true }));
    try {
      const endpoint = campo === 'publico' ? '/api/usuarios/perfil/publico' : `/api/usuarios/perfil/${campo}`;
      const { data } = await apiClient.put(endpoint, payload);
      setUsuario(data);
      mostrarNotificacao(`Dados de ${campo} atualizados com sucesso!`, "success");
    } catch (error) {
      mostrarNotificacao(error.response?.data?.mensagem || `Falha ao atualizar dados.`, "error");
    } finally {
      setCarregando(prev => ({ ...prev, [campo]: false }));
    }
  };
  
  const handleSalvarPerfilPublico = (e) => {
    e.preventDefault();
    handleSalvar('publico', { biografia, url_unica: urlUnica, links_redes: links });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const MAX_FILE_SIZE = 5 * 1024 * 1024;
      if (file.size > MAX_FILE_SIZE) {
        mostrarNotificacao('A imagem é muito grande. O limite máximo é de 5MB.', 'error');
        return;
      }
      setNovaFoto(file);
      setPreviewFoto(URL.createObjectURL(file));
    }
  };

  const handleSalvarFoto = async () => {
    if (!novaFoto) return;
    setCarregando(prev => ({ ...prev, foto: true }));
    const formData = new FormData();
    formData.append('foto', novaFoto);
    try {
      const { data } = await apiClient.put('/api/usuarios/perfil/foto', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setUsuario(data);
      mostrarNotificacao('Foto de perfil atualizada!', 'success');
      setNovaFoto(null);
    } catch (error) {
      mostrarNotificacao(error.response?.data?.mensagem || 'Falha ao salvar a foto.', 'error');
    } finally {
      setCarregando(prev => ({ ...prev, foto: false }));
    }
  };
  
  const handleSalvarSenha = async () => {
    fecharDialogoSenha();
    setCarregando(prev => ({ ...prev, senha: true }));
    try {
      await apiClient.put(`/api/usuarios/perfil/senha`, { senhaAtual, novaSenha });
      mostrarNotificacao("Senha atualizada com sucesso! Por favor, faça o login novamente.", "success");
      logout();
    } catch (error) {
      mostrarNotificacao(error.response?.data?.mensagem || "Falha ao atualizar a senha.", "error");
    } finally {
      setCarregando(prev => ({ ...prev, senha: false }));
    }
  };

  const abrirDialogoSenha = (e) => {
    e.preventDefault();
    if (!senhaAtual || !novaSenha || !confirmarNovaSenha) return mostrarNotificacao("Preencha todos os campos de senha.", "warning");
    if (novaSenha !== confirmarNovaSenha) return mostrarNotificacao("A nova senha e a confirmação não coincidem.", "error");
    if (novaSenha.length < 8) return mostrarNotificacao("A nova senha deve ter no mínimo 8 caracteres.", "warning");
    setDialogoSenhaAberto(true);
  };
  const fecharDialogoSenha = () => setDialogoSenhaAberto(false);

  if (!usuario) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  
  let fotoUrlCompleta = null;
    if (usuario?.foto_url) {
        if (usuario.foto_url.startsWith('http')) {
            fotoUrlCompleta = usuario.foto_url;
        } else {
            fotoUrlCompleta = `${apiClient.defaults.baseURL}${usuario.foto_url}`;
        }
    }

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight="bold">Configurações</Typography>
        <Typography color="text.secondary">Gerencie as suas informações de acesso e perfil público.</Typography>
      </Box>

      <Paper sx={{ p: { xs: 2, md: 3 }, mb: 4 }}>
        <Typography variant="h6" component="h2" gutterBottom>Perfil Público (Sua Vitrine)</Typography>
        {usuario.url_unica && (
            <Link href={`/vitrine/${usuario.url_unica}`} target="_blank" rel="noopener noreferrer" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <LinkIcon sx={{ mr: 1 }} /> {`${window.location.origin}/vitrine/${usuario.url_unica}`}
            </Link>
        )}
        <Box component="form" onSubmit={handleSalvarPerfilPublico} noValidate sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            <TextField id="url_unica" name="url_unica" label="URL Única" helperText="Ex: o-nome-da-sua-banda" value={urlUnica} onChange={(e) => setUrlUnica(e.target.value.toLowerCase().replace(/\s+/g, '-'))} fullWidth />
            <TextField id="biografia" name="biografia" label="Biografia" multiline rows={4} value={biografia} onChange={(e) => setBiografia(e.target.value)} fullWidth />
            <Typography color="text.secondary" sx={{ mt: 2 }}>Links e Redes Sociais</Typography>
            <TextField id="link_instagram" name="link_instagram" label="Instagram" value={links.instagram} onChange={(e) => handleLinkChange('instagram', e.target.value)} InputProps={{ startAdornment: <Instagram sx={{ mr: 1, color: 'text.secondary' }} /> }} />
            <TextField id="link_youtube" name="link_youtube" label="YouTube" value={links.youtube} onChange={(e) => handleLinkChange('youtube', e.target.value)} InputProps={{ startAdornment: <YouTube sx={{ mr: 1, color: 'text.secondary' }} /> }} />
            <TextField id="link_spotify" name="link_spotify" label="Spotify" value={links.spotify} onChange={(e) => handleLinkChange('spotify', e.target.value)} InputProps={{ startAdornment: <MusicNote sx={{ mr: 1, color: 'text.secondary' }} /> }} />
            <Button type="submit" variant="contained" disabled={carregando.publico} sx={{ alignSelf: "flex-start", mt: 2 }}>
                {carregando.publico ? <CircularProgress size={24} /> : "Salvar Perfil Público"}
            </Button>
        </Box>
      </Paper>

      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: { xs: 2, md: 3 }, height: '100%', textAlign: 'center' }}>
            <Typography variant="h6" component="h2" gutterBottom>Foto de Perfil</Typography>
            <Badge overlap="circular" anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} badgeContent={<IconButton color="primary" onClick={() => fileInputRef.current.click()}><PhotoCamera /></IconButton>}>
              <Avatar src={previewFoto || fotoUrlCompleta} sx={{ width: 150, height: 150, margin: 'auto', mb: 2, fontSize: '4rem' }}>{usuario?.nome?.charAt(0).toUpperCase()}</Avatar>
            </Badge>
            <input ref={fileInputRef} type="file" hidden accept="image/*" onChange={handleFileChange} />
            <Button variant="contained" sx={{mt: 2}} disabled={!novaFoto || carregando.foto} onClick={handleSalvarFoto}>
              {carregando.foto ? <CircularProgress size={24} /> : 'Salvar Foto'}
            </Button>
          </Paper>
        </Grid>
        <Grid item xs={12} md={8}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Paper sx={{ p: { xs: 2, md: 3 }}}>
                <Typography variant="h6" component="h2" gutterBottom>Alterar E-mail</Typography>
                <Box component="form" onSubmit={(e) => { e.preventDefault(); handleSalvar('email', { email }); }} noValidate sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
                  <TextField id="email" name="email" label="E-mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth />
                  <Button type="submit" variant="contained" disabled={carregando.email} sx={{ alignSelf: "flex-start" }}>{carregando.email ? <CircularProgress size={24} /> : "Salvar E-mail"}</Button>
                </Box>
            </Paper>
            <Paper sx={{ p: { xs: 2, md: 3 }}}>
                <Typography variant="h6" component="h2" gutterBottom>Alterar Senha</Typography>
                <Box component="form" onSubmit={abrirDialogoSenha} noValidate sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
                  <TextField id="senha_atual" name="senha_atual" label="Senha Atual" type="password" value={senhaAtual} onChange={(e) => setSenhaAtual(e.target.value)} fullWidth />
                  <TextField id="nova_senha" name="nova_senha" label="Nova Senha" type="password" value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} fullWidth />
                  <TextField id="confirmar_nova_senha" name="confirmar_nova_senha" label="Confirmar Nova Senha" type="password" value={confirmarNovaSenha} onChange={(e) => setConfirmarNovaSenha(e.target.value)} fullWidth />
                  <Button type="submit" variant="contained" disabled={carregando.senha} sx={{ alignSelf: "flex-start" }}>{carregando.senha ? <CircularProgress size={24} /> : "Alterar Senha"}</Button>
                </Box>
            </Paper>
          </Box>
        </Grid>
      </Grid>
      
      <Dialog open={dialogoSenhaAberto} onClose={fecharDialogoSenha}>
        <DialogTitle>Confirmar Alteração de Senha</DialogTitle>
        <DialogContent><DialogContentText>Após a alteração, você será desconectado e precisará fazer login com a nova senha.</DialogContentText></DialogContent>
        <DialogActions>
          <Button onClick={fecharDialogoSenha}>Cancelar</Button>
          <Button onClick={handleSalvarSenha} color="primary" autoFocus disabled={carregando.senha}>{carregando.senha ? <CircularProgress size={24} /> : "Confirmar"}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Configuracoes;
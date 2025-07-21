// src/paginas/Configuracoes.jsx
import React, { useState, useEffect, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from '../api';
import { useNotificacao } from "../contextos/NotificationContext";
import { AuthContext } from "../contextos/AuthContext";
import {
  Box, Button, Typography, CircularProgress, Paper, TextField,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, 
  Grid, Avatar, Badge, IconButton, Chip
} from "@mui/material";
import { 
    PhotoCamera, 
    WorkspacePremium as WorkspacePremiumIcon 
} from "@mui/icons-material";

// Componente interno para os cartões para manter o código limpo
const FormCard = ({ title, children }) => (
    <Paper sx={{ p: { xs: 2, md: 3 }, height: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="h6" component="h2" gutterBottom>{title}</Typography>
        {children}
    </Paper>
);

function Configuracoes() {
  const { usuario, setUsuario, logout } = useContext(AuthContext);
  const { mostrarNotificacao } = useNotificacao();
  const navigate = useNavigate();

  // Estados dos formulários
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState("");
  const [novaFoto, setNovaFoto] = useState(null);
  const [previewFoto, setPreviewFoto] = useState(null);
  
  // Estados de carregamento
  const [carregando, setCarregando] = useState({ nome: false, email: false, senha: false, foto: false, portal: false });
  const [dialogoSenhaAberto, setDialogoSenhaAberto] = useState(false);
  const fileInputRef = useRef();

  useEffect(() => {
    if (usuario) {
      setNome(usuario.nome || "");
      setEmail(usuario.email || "");
      let fotoUrlCompleta = null;
      if (usuario.foto_url) {
        fotoUrlCompleta = usuario.foto_url.startsWith('http') 
          ? usuario.foto_url 
          : `${apiClient.defaults.baseURL}${usuario.foto_url}`;
      }
      setPreviewFoto(fotoUrlCompleta);
    }
  }, [usuario]);
  
  const capitalizar = (texto) => {
    if (!texto) return '';
    return texto.charAt(0).toUpperCase() + texto.slice(1);
  };
  
  const handleSalvarNome = async (e) => {
    e.preventDefault();
    setCarregando(prev => ({ ...prev, nome: true }));
    try {
      const { data } = await apiClient.put('/api/usuarios/perfil/nome', { nome });
      setUsuario(data);
      mostrarNotificacao(`Nome atualizado com sucesso!`, "success");
    } catch (error) {
      mostrarNotificacao(error.response?.data?.mensagem || `Falha ao atualizar nome.`, "error");
    } finally {
      setCarregando(prev => ({ ...prev, nome: false }));
    }
  };

  const handleSalvarEmail = async (e) => {
    e.preventDefault();
    setCarregando(prev => ({ ...prev, email: true }));
    try {
      const { data } = await apiClient.put('/api/usuarios/perfil/email', { email });
      setUsuario(data);
      mostrarNotificacao(`E-mail atualizado com sucesso!`, "success");
    } catch (error) {
      mostrarNotificacao(error.response?.data?.mensagem || `Falha ao atualizar e-mail.`, "error");
    } finally {
      setCarregando(prev => ({ ...prev, email: false }));
    }
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

  const handleGerirAssinatura = async () => {
    setCarregando(prev => ({ ...prev, portal: true }));
    try {
        const resposta = await apiClient.post('/api/assinatura/criar-sessao-portal');
        window.location.href = resposta.data.url;
    } catch (error) {
        mostrarNotificacao(error.response?.data?.mensagem || "Não foi possível aceder ao portal de gestão.", "error");
        setCarregando(prev => ({ ...prev, portal: false }));
    }
  };

  if (!usuario) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }
  
  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight="bold">Configurações</Typography>
        <Typography color="text.secondary">Gerencie as suas informações de acesso e assinatura.</Typography>
      </Box>

      <Grid container spacing={4}>
        {/* ASSINATURA */}
        <Grid item xs={12}>
            <Paper sx={{ p: { xs: 2, md: 3 }}}>
                <Typography variant="h6" component="h2" gutterBottom>Assinatura</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                    <Typography>Seu plano atual:</Typography>
                    <Chip icon={<WorkspacePremiumIcon />} label={capitalizar(usuario.plano) || 'Nenhum'} color={usuario.status_assinatura === 'ativa' || usuario.status_assinatura === 'teste' ? 'primary' : 'default'} variant="outlined" />
                    {usuario.status_assinatura === 'teste' && (<Chip label={`Em teste até ${new Date(usuario.teste_termina_em).toLocaleDateString('pt-BR')}`} color="secondary" size="small"/>)}
                    {usuario.status_assinatura === 'inativa' || usuario.status_assinatura === 'cancelada' ? (
                        <Button variant="contained" onClick={() => navigate('/assinatura')} sx={{ ml: 'auto' }}>Ver Planos</Button>
                    ) : (
                        <Button variant="contained" onClick={handleGerirAssinatura} sx={{ ml: 'auto' }} disabled={carregando.portal}>{carregando.portal ? <CircularProgress size={24} color="inherit" /> : 'Gerir Assinatura'}</Button>
                    )}
                </Box>
            </Paper>
        </Grid>
        
        {/* FOTO DE PERFIL */}
        <Grid item xs={12} sm={6} lg={3}>
            <FormCard title="Foto de Perfil">
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexGrow: 1, justifyContent: 'center' }}>
                    <Badge overlap="circular" anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} badgeContent={<IconButton color="primary" onClick={() => fileInputRef.current.click()}><PhotoCamera /></IconButton>}>
                        <Avatar src={previewFoto} sx={{ width: 120, height: 120, mb: 2, fontSize: '3rem' }}>{usuario?.nome?.charAt(0).toUpperCase()}</Avatar>
                    </Badge>
                    <input ref={fileInputRef} type="file" hidden accept="image/*" onChange={handleFileChange} />
                    <Button variant="contained" sx={{mt: 2}} disabled={!novaFoto || carregando.foto} onClick={handleSalvarFoto}>
                        {carregando.foto ? <CircularProgress size={24} /> : 'Salvar Foto'}
                    </Button>
                </Box>
            </FormCard>
        </Grid>

        {/* ALTERAR NOME */}
        <Grid item xs={12} sm={6} lg={3}>
            <FormCard title="Alterar Nome">
                <Box component="form" onSubmit={handleSalvarNome} noValidate sx={{ display: "flex", flexDirection: "column", flexGrow: 1, justifyContent: 'space-between' }}>
                    <TextField id="nome" name="nome" label="Nome Artístico" value={nome} onChange={(e) => setNome(e.target.value)} fullWidth />
                    <Button type="submit" variant="contained" disabled={carregando.nome} sx={{ alignSelf: "flex-end", mt: 2 }}>
                        {carregando.nome ? <CircularProgress size={24} /> : "Salvar Nome"}
                    </Button>
                </Box>
            </FormCard>
        </Grid>

        {/* ALTERAR E-MAIL */}
        <Grid item xs={12} sm={6} lg={3}>
            <FormCard title="Alterar E-mail">
                <Box component="form" onSubmit={handleSalvarEmail} noValidate sx={{ display: "flex", flexDirection: "column", flexGrow: 1, justifyContent: 'space-between' }}>
                    <TextField id="email" name="email" label="E-mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth />
                    <Button type="submit" variant="contained" disabled={carregando.email} sx={{ alignSelf: "flex-end", mt: 2 }}>
                        {carregando.email ? <CircularProgress size={24} /> : "Salvar E-mail"}
                    </Button>
                </Box>
            </FormCard>
        </Grid>

        {/* ALTERAR SENHA */}
        <Grid item xs={12} sm={6} lg={3}>
            <FormCard title="Alterar Senha">
                <Box component="form" onSubmit={abrirDialogoSenha} noValidate sx={{ display: "flex", flexDirection: "column", gap: 2, flexGrow: 1, justifyContent: 'space-between' }}>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        <TextField id="senha_atual" name="senha_atual" label="Senha Atual" type="password" value={senhaAtual} onChange={(e) => setSenhaAtual(e.target.value)} fullWidth />
                        <TextField id="nova_senha" name="nova_senha" label="Nova Senha" type="password" value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} fullWidth />
                        <TextField id="confirmar_nova_senha" name="confirmar_nova_senha" label="Confirmar Nova Senha" type="password" value={confirmarNovaSenha} onChange={(e) => setConfirmarNovaSenha(e.target.value)} fullWidth />
                    </Box>
                    <Button type="submit" variant="contained" disabled={carregando.senha} sx={{ alignSelf: "flex-end", mt: 2 }}>
                        {carregando.senha ? <CircularProgress size={24} /> : "Alterar Senha"}
                    </Button>
                </Box>
            </FormCard>
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
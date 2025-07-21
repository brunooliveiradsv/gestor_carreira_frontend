// src/paginas/Mural.jsx
import React, { useState, useEffect, useCallback, useContext, useRef } from 'react';
import apiClient from '../api';
import { useNotificacao } from '../contextos/NotificationContext';
import { AuthContext } from '../contextos/AuthContext';
import {
  Box, Typography, Button, CircularProgress, Paper, List, ListItem,
  ListItemText, IconButton, Tooltip, TextField, Dialog, DialogActions,
  DialogContent, DialogTitle, Link
} from '@mui/material';
import { 
    AddCircleOutline as AddCircleOutlineIcon, 
    Delete as DeleteIcon, 
    Link as LinkIcon,
    Instagram, 
    YouTube, 
    MusicNote,
    PhotoCamera as PhotoCameraIcon
} from '@mui/icons-material';

function Mural() {
  const { usuario, setUsuario } = useContext(AuthContext);
  const { mostrarNotificacao } = useNotificacao();
  
  const [posts, setPosts] = useState([]);
  const [carregando, setCarregando] = useState(true);

  // Estados para o formulário de nova publicação
  const [dialogoAberto, setDialogoAberto] = useState(false);
  const [novoPost, setNovoPost] = useState({ content: '', link: '' });

  // Estados para o formulário de perfil público
  const [biografia, setBiografia] = useState("");
  const [urlUnica, setUrlUnica] = useState("");
  const [links, setLinks] = useState({ instagram: '', youtube: '', spotify: '' });
  const [videoDestaque, setVideoDestaque] = useState("");
  const [novaFotoCapa, setNovaFotoCapa] = useState(null);
  const [previewFotoCapa, setPreviewFotoCapa] = useState(null);
  const fileInputCapaRef = useRef();

  const [carregandoPublico, setCarregandoPublico] = useState(false);
  
  // Popula os campos do perfil público quando o componente carrega
  useEffect(() => {
    if (usuario) {
      setBiografia(usuario.biografia || "");
      setUrlUnica(usuario.url_unica || "");
      setLinks(usuario.links_redes || { instagram: '', youtube: '', spotify: '' });
      setVideoDestaque(usuario.video_destaque_url || "");
      setPreviewFotoCapa(usuario.foto_capa_url || null);
    }
  }, [usuario]);

  const buscarPosts = useCallback(async () => {
    try {
      // Já está a carregar, não precisa de definir de novo
      const resposta = await apiClient.get('/api/posts');
      setPosts(resposta.data);
    } catch (error) {
      mostrarNotificacao('Erro ao carregar as publicações.', 'error');
    } finally {
      setCarregando(false);
    }
  }, [mostrarNotificacao]);

  useEffect(() => {
    setCarregando(true);
    buscarPosts();
  }, [buscarPosts]);

  const handleAbrirDialogo = () => {
    setNovoPost({ content: '', link: '' });
    setDialogoAberto(true);
  };

  const handleFecharDialogo = () => setDialogoAberto(false);
  
  const handleLinkChange = (plataforma, valor) => setLinks(prev => ({ ...prev, [plataforma]: valor }));

  const handleSalvarPerfilPublico = async (e) => {
    e.preventDefault();
    setCarregandoPublico(true);
    try {
      const payload = { biografia, url_unica: urlUnica, links_redes: links, video_destaque_url: videoDestaque };
      // Primeiro, atualiza os dados de texto
      const { data: dadosAtualizados } = await apiClient.put('/api/usuarios/perfil/publico', payload);
      
      let finalUserData = dadosAtualizados;

      // Se uma nova foto de capa foi selecionada, faz o upload
      if (novaFotoCapa) {
        const formData = new FormData();
        formData.append('capa', novaFotoCapa);
        // O servidor responderá com os dados do utilizador já incluindo o novo URL da foto de capa
        const { data: dataFoto } = await apiClient.put('/api/usuarios/perfil/capa', formData);
        finalUserData = dataFoto; // Usa os dados mais recentes que incluem a nova foto
        setNovaFotoCapa(null); // Limpa o estado da foto após o upload
      }
      
      // Atualiza o estado global do utilizador com os dados finais
      setUsuario(finalUserData);
      mostrarNotificacao(`Perfil público atualizado com sucesso!`, "success");
    } catch (error) {
      mostrarNotificacao(error.response?.data?.mensagem || `Falha ao atualizar perfil.`, "error");
    } finally {
      setCarregandoPublico(false);
    }
  };

  const handleFotoCapaChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB
        mostrarNotificacao('A imagem de capa é muito grande (máx 5MB).', 'error');
        return;
      }
      setNovaFotoCapa(file);
      setPreviewFotoCapa(URL.createObjectURL(file));
    }
  };

  const handleSalvarPost = async () => {
    if (!novoPost.content.trim()) {
      mostrarNotificacao('O conteúdo da publicação é obrigatório.', 'warning');
      return;
    }
    try {
      await apiClient.post('/api/posts', novoPost);
      mostrarNotificacao('Publicação criada com sucesso!', 'success');
      handleFecharDialogo();
      buscarPosts();
    } catch (error) {
      mostrarNotificacao('Erro ao salvar a publicação.', 'error');
    }
  };

  const handleApagar = async (id) => {
    if (window.confirm("Tem certeza que deseja apagar esta publicação?")) {
        try {
            await apiClient.delete(`/api/posts/${id}`);
            mostrarNotificacao("Publicação apagada com sucesso.", "success");
            buscarPosts();
        } catch (error) {
            mostrarNotificacao("Erro ao apagar a publicação.", "error");
        }
    }
  };

  if (carregando) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold">
            Mural e Vitrine
          </Typography>
          <Typography color="text.secondary">
            Gerencie as publicações e as informações da sua página pública.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddCircleOutlineIcon />} onClick={handleAbrirDialogo}>
          Nova Publicação
        </Button>
      </Box>

      <Paper sx={{ p: { xs: 2, md: 3 }, mb: 4 }}>
        <Typography variant="h6" component="h2" gutterBottom>Configurações da Vitrine</Typography>
        <Box component="form" onSubmit={handleSalvarPerfilPublico} noValidate sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 2 }}>
            
            <Box>
                <Typography color="text.secondary" gutterBottom>Foto de Capa</Typography>
                <Paper 
                    variant="outlined" 
                    onClick={() => fileInputCapaRef.current.click()}
                    sx={{ 
                        height: 200, 
                        backgroundSize: 'cover', 
                        backgroundPosition: 'center',
                        backgroundImage: `url(${previewFotoCapa})`,
                        bgcolor: 'action.hover',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'common.white',
                        position: 'relative',
                        '&:hover .overlay': { opacity: 1 }
                    }}
                >
                    <input ref={fileInputCapaRef} type="file" hidden accept="image/*" onChange={handleFotoCapaChange} />
                    <Box className="overlay" sx={{
                        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                        bgcolor: 'rgba(0,0,0,0.5)', opacity: 0, transition: 'opacity 0.3s',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <PhotoCameraIcon />
                        <Typography>Alterar Capa</Typography>
                    </Box>
                    {!previewFotoCapa && <Typography>Clique para adicionar uma capa</Typography>}
                </Paper>
            </Box>

            <TextField id="url_unica" name="url_unica" label="URL Única" helperText="Ex: o-nome-da-sua-banda" value={urlUnica} onChange={(e) => setUrlUnica(e.target.value.toLowerCase().replace(/\s+/g, '-'))} fullWidth />
            <TextField id="biografia" name="biografia" label="Biografia" multiline rows={4} value={biografia} onChange={(e) => setBiografia(e.target.value)} fullWidth />
            
            <TextField id="video_destaque" name="video_destaque" label="Link do Vídeo Destaque (YouTube)" value={videoDestaque} onChange={(e) => setVideoDestaque(e.target.value)} InputProps={{ startAdornment: <YouTube sx={{ mr: 1, color: 'text.secondary' }} /> }} />

            <Typography color="text.secondary">Links e Redes Sociais</Typography>
            <TextField id="link_instagram" name="link_instagram" label="Instagram" value={links.instagram} onChange={(e) => handleLinkChange('instagram', e.target.value)} InputProps={{ startAdornment: <Instagram sx={{ mr: 1, color: 'text.secondary' }} /> }} />
            <TextField id="link_youtube" name="link_youtube" label="YouTube (Canal)" value={links.youtube} onChange={(e) => handleLinkChange('youtube', e.target.value)} InputProps={{ startAdornment: <YouTube sx={{ mr: 1, color: 'text.secondary' }} /> }} />
            <TextField id="link_spotify" name="link_spotify" label="Spotify" value={links.spotify} onChange={(e) => handleLinkChange('spotify', e.target.value)} InputProps={{ startAdornment: <MusicNote sx={{ mr: 1, color: 'text.secondary' }} /> }} />
            
            <Button type="submit" variant="contained" disabled={carregandoPublico} sx={{ alignSelf: "flex-start", mt: 2 }}>
                {carregandoPublico ? <CircularProgress size={24} /> : "Salvar Informações da Vitrine"}
            </Button>
        </Box>
      </Paper>

      <Paper>
        <Typography variant="h6" component="h2" sx={{ p: { xs: 2, md: 3 }, pb: 0 }}>
          Publicações do Mural
        </Typography>
        <List>
          {posts.length === 0 ? (
            <Typography sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
              Nenhuma publicação no seu mural.
            </Typography>
          ) : (
            posts.map((post) => (
              <ListItem
                key={post.id}
                secondaryAction={
                  <Tooltip title="Apagar Publicação">
                    <IconButton edge="end" color="error" onClick={() => handleApagar(post.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                }
              >
                <ListItemText
                  primary={post.content}
                  secondary={
                    post.link ? (
                      <Link href={post.link} target="_blank" rel="noopener noreferrer" sx={{display: 'flex', alignItems: 'center', mt: 0.5}}>
                        <LinkIcon fontSize="small" sx={{mr: 0.5}}/>
                        {post.link}
                      </Link>
                    ) : `Publicado em: ${new Date(post.created_at).toLocaleDateString('pt-BR')}`
                  }
                />
              </ListItem>
            ))
          )}
        </List>
      </Paper>

      <Dialog open={dialogoAberto} onClose={handleFecharDialogo} fullWidth maxWidth="sm">
        <DialogTitle>Nova Publicação</DialogTitle>
        <DialogContent>
          <TextField autoFocus margin="dense" label="Conteúdo da publicação *" type="text" fullWidth multiline rows={4} variant="outlined" value={novoPost.content} onChange={(e) => setNovoPost(p => ({ ...p, content: e.target.value }))} sx={{ mb: 2 }} />
          <TextField margin="dense" label="Link (opcional)" type="url" fullWidth variant="outlined" value={novoPost.link} onChange={(e) => setNovoPost(p => ({ ...p, link: e.target.value }))} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleFecharDialogo}>Cancelar</Button>
          <Button onClick={handleSalvarPost} variant="contained">Publicar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Mural;
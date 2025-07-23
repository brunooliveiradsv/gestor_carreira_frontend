// src/paginas/Mural.jsx
import React, { useState, useEffect, useCallback, useContext, useRef } from 'react';
import apiClient from '../apiClient';
import { useNotificacao } from '../contextos/NotificationContext';
import { AuthContext } from '../contextos/AuthContext';
import {
  Box, Typography, Button, CircularProgress, Paper, List, ListItem,
  ListItemText, IconButton, Tooltip, TextField, Dialog, DialogActions,
  DialogContent, DialogTitle, Link, Grid
} from '@mui/material';
import { 
    AddCircleOutline as AddCircleOutlineIcon, 
    Delete as DeleteIcon, 
    Link as LinkIcon,
    Instagram, 
    YouTube, 
    MusicNote,
    PhotoCamera as PhotoCameraIcon,
    AddPhotoAlternate as AddPhotoIcon
} from '@mui/icons-material';

// --- NOVO COMPONENTE PARA GERIR AS CAPAS ---
function GerirCapas({ usuario, setUsuario, mostrarNotificacao }) {
  const [capas, setCapas] = useState(usuario.foto_capa_url || []);
  const [carregando, setCarregando] = useState(false);
  const fileInputRef = useRef();

  const handleFileChange = (e) => {
    if (capas.length >= 3) {
      mostrarNotificacao("Você pode ter no máximo 3 imagens de capa.", "warning");
      return;
    }
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB
        mostrarNotificacao('A imagem é muito grande (máx 10MB).', 'error');
        return;
      }
      setCapas(prev => [...prev, file]);
    }
  };

  const handleAdicionarLink = () => {
    if (capas.length >= 3) {
      mostrarNotificacao("Você pode ter no máximo 3 imagens de capa.", "warning");
      return;
    }
    const url = prompt("Cole o link da imagem hospedada:");
    if (url && url.startsWith('http')) {
      setCapas(prev => [...prev, url]);
    } else if (url) {
      mostrarNotificacao("O link fornecido não é válido.", "error");
    }
  };

  const handleRemoverCapa = (index) => {
    setCapas(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleSalvarCapas = async () => {
    setCarregando(true);
    const formData = new FormData();
    const linksCapa = [];

    capas.forEach(capa => {
      if (typeof capa === 'string') {
        linksCapa.push(capa);
      } else {
        formData.append('capas', capa);
      }
    });
    
    // É importante adicionar os links ao FormData, mesmo que vazios
    linksCapa.forEach(link => formData.append('linksCapa[]', link));
    if (linksCapa.length === 0) {
        formData.append('linksCapa[]', '');
    }

    try {
      const { data } = await apiClient.put('/api/usuarios/perfil/capas', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUsuario(prev => ({...prev, ...data}));
      setCapas(data.foto_capa_url || []);
      mostrarNotificacao("Fotos de capa salvas com sucesso!", "success");
    } catch (error) {
      mostrarNotificacao("Erro ao salvar as fotos de capa.", "error");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <Paper sx={{ p: { xs: 2, md: 3 }, mb: 4 }}>
      <Typography variant="h6" component="h2" gutterBottom>Fotos de Capa da Vitrine (Máx. 3)</Typography>
      <Grid container spacing={2}>
        {capas.map((capa, index) => (
          <Grid item xs={12} sm={4} key={index}>
            <Paper variant="outlined" sx={{ height: 150, backgroundSize: 'cover', backgroundPosition: 'center', backgroundImage: `url(${typeof capa === 'string' ? capa : URL.createObjectURL(capa)})`, position: 'relative' }}>
              <IconButton onClick={() => handleRemoverCapa(index)} sx={{ position: 'absolute', top: 4, right: 4, bgcolor: 'rgba(0,0,0,0.5)', color: 'white', '&:hover': {bgcolor: 'rgba(0,0,0,0.7)'} }}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Paper>
          </Grid>
        ))}
      </Grid>
      <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        <Button variant="outlined" startIcon={<AddPhotoIcon />} onClick={() => fileInputRef.current.click()} disabled={capas.length >= 3}>Enviar Ficheiro</Button>
        <Button variant="outlined" startIcon={<LinkIcon />} onClick={handleAdicionarLink} disabled={capas.length >= 3}>Usar Link</Button>
        <Button variant="contained" onClick={handleSalvarCapas} disabled={carregando} sx={{ ml: 'auto' }}>
            {carregando ? <CircularProgress size={24} /> : "Salvar Capas"}
        </Button>
        <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleFileChange} />
      </Box>
    </Paper>
  );
}

function Mural() {
  const { usuario, setUsuario } = useContext(AuthContext);
  const { mostrarNotificacao } = useNotificacao();
  
  const [posts, setPosts] = useState([]);
  const [carregandoPosts, setCarregandoPosts] = useState(true);
  const [dialogoAberto, setDialogoAberto] = useState(false);
  const [novoPost, setNovoPost] = useState({ content: '', link: '' });

  const [biografia, setBiografia] = useState("");
  const [urlUnica, setUrlUnica] = useState("");
  const [links, setLinks] = useState({ instagram: '', youtube: '', spotify: '' });
  const [videoDestaque, setVideoDestaque] = useState("");
  
  const [carregandoPublico, setCarregandoPublico] = useState(false);
  
  useEffect(() => {
    if (usuario) {
      setBiografia(usuario.biografia || "");
      setUrlUnica(usuario.url_unica || "");
      setLinks(usuario.links_redes || { instagram: '', youtube: '', spotify: '' });
      setVideoDestaque(usuario.video_destaque_url || "");
    }
  }, [usuario]);

  const buscarPosts = useCallback(async () => {
    try {
      const resposta = await apiClient.get('/api/posts');
      setPosts(resposta.data);
    } catch (error) {
      mostrarNotificacao('Erro ao carregar as publicações.', 'error');
    } finally {
      setCarregandoPosts(false);
    }
  }, [mostrarNotificacao]);

  useEffect(() => {
    setCarregandoPosts(true);
    buscarPosts();
  }, [buscarPosts]);

  const handleLinkChange = (plataforma, valor) => setLinks(prev => ({ ...prev, [plataforma]: valor }));

  const handleSalvarPerfilPublico = async (e) => {
    e.preventDefault();
    setCarregandoPublico(true);
    try {
      const payload = { biografia, url_unica: urlUnica, links_redes: links, video_destaque_url: videoDestaque };
      const { data: dadosAtualizados } = await apiClient.put('/api/usuarios/perfil/publico', payload);
      
      setUsuario(prevUsuario => ({ ...prevUsuario, ...dadosAtualizados }));
      
      mostrarNotificacao(`Perfil público atualizado com sucesso!`, "success");
    } catch (error) {
      mostrarNotificacao(error.response?.data?.mensagem || `Falha ao atualizar perfil.`, "error");
    } finally {
      setCarregandoPublico(false);
    }
  };
    
  const handleAbrirDialogo = () => {
    setNovoPost({ content: '', link: '' });
    setDialogoAberto(true);
  };

  const handleFecharDialogo = () => setDialogoAberto(false);

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

  if (!usuario) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold">Painel Showcase</Typography>
          <Typography color="text.secondary">Gerencie as informações da sua página pública e mural.</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddCircleOutlineIcon />} onClick={handleAbrirDialogo}>
          Nova Publicação
        </Button>
      </Box>
      
      <GerirCapas usuario={usuario} setUsuario={setUsuario} mostrarNotificacao={mostrarNotificacao} />

      <Paper sx={{ p: { xs: 2, md: 3 }, mb: 4 }}>
        <Typography variant="h6" component="h2" gutterBottom>Informações Gerais da Vitrine</Typography>
        {usuario?.url_unica && (
            <Link href={`/vitrine/${usuario.url_unica}`} target="_blank" rel="noopener noreferrer" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <LinkIcon sx={{ mr: 1 }} /> Visualizar minha página pública
            </Link>
        )}
        <Box component="form" onSubmit={handleSalvarPerfilPublico} noValidate sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 2 }}>
            <TextField id="url_unica" name="url_unica" label="URL Única" helperText="Ex: o-nome-da-sua-banda" value={urlUnica} onChange={(e) => setUrlUnica(e.target.value.toLowerCase().replace(/\s+/g, '-'))} fullWidth />
            <TextField id="biografia" name="biografia" label="Biografia" multiline rows={4} value={biografia} onChange={(e) => setBiografia(e.target.value)} fullWidth />
            <TextField id="video_destaque" name="video_destaque" label="Link do Vídeo Destaque (YouTube)" value={videoDestaque} onChange={(e) => setVideoDestaque(e.target.value)} InputProps={{ startAdornment: <YouTube sx={{ mr: 1, color: 'text.secondary' }} /> }} />
            <Typography color="text.secondary">Links e Redes Sociais</Typography>
            <TextField id="link_instagram" name="link_instagram" label="Instagram" value={links.instagram} onChange={(e) => handleLinkChange('instagram', e.target.value)} InputProps={{ startAdornment: <Instagram sx={{ mr: 1, color: 'text.secondary' }} /> }} />
            <TextField id="link_youtube" name="link_youtube" label="YouTube (Canal)" value={links.youtube} onChange={(e) => handleLinkChange('youtube', e.target.value)} InputProps={{ startAdornment: <YouTube sx={{ mr: 1, color: 'text.secondary' }} /> }} />
            <TextField id="link_spotify" name="link_spotify" label="Spotify" value={links.spotify} onChange={(e) => handleLinkChange('spotify', e.target.value)} InputProps={{ startAdornment: <MusicNote sx={{ mr: 1, color: 'text.secondary' }} /> }} />
            
            <Button type="submit" variant="contained" disabled={carregandoPublico} sx={{ alignSelf: "flex-start", mt: 2 }}>
                {carregandoPublico ? <CircularProgress size={24} /> : "Salvar Informações Gerais"}
            </Button>
        </Box>
      </Paper>

      <Paper>
        <Typography variant="h6" component="h2" sx={{ p: { xs: 2, md: 3 }, pb: 0 }}>
          Publicações do Mural
        </Typography>
        {carregandoPosts ? <CircularProgress sx={{ m: 4 }}/> : (
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
        )}
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
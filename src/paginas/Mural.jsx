// src/paginas/Mural.jsx
import React, { useState, useEffect, useCallback, useContext, useRef } from 'react';
import apiClient from '../apiClient';
import { useNotificacao } from '../contextos/NotificationContext';
import { AuthContext } from '../contextos/AuthContext';
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

import {
  Box, Typography, Button, CircularProgress, Paper, Grid,
  Dialog, DialogActions, DialogContent, DialogTitle, Link, TextField, IconButton, Tooltip,
  List, ListItem, ListItemText, DialogContentText, Divider, Chip
} from '@mui/material';
import { 
    AddCircleOutline as AddCircleOutlineIcon, Delete as DeleteIcon, Link as LinkIcon,
    Instagram, YouTube, MusicNote,
    AddPhotoAlternate as AddPhotoIcon, DragIndicator as DragIndicatorIcon,
    CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import useApi from '../hooks/useApi';
import FormularioEnquete from '../componentes/FormularioEnquete';

// Função utilitária para reordenar
const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

// Componente de Recorte
function EditorDeRecorte({ imagemSrc, onRecorteCompleto, onCancelar }) {
    const [crop, setCrop] = useState();
    const [completedCrop, setCompletedCrop] = useState(null);
    const imgRef = useRef(null);

    function onImageLoad(e) {
        const { width, height } = e.currentTarget;
        const initialCrop = makeAspectCrop({ unit: '%', width: 90 }, 16 / 9, width, height);
        const centeredCrop = centerCrop(initialCrop, width, height);
        setCrop(centeredCrop);
        setCompletedCrop(centeredCrop);
    }

    const handleConfirmarRecorte = () => {
        if (!completedCrop || !imgRef.current) return;
        const canvas = document.createElement('canvas');
        const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
        const scaleY = imgRef.current.naturalHeight / imgRef.current.height;
        canvas.width = Math.floor(completedCrop.width * scaleX);
        canvas.height = Math.floor(completedCrop.height * scaleY);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(imgRef.current, completedCrop.x * scaleX, completedCrop.y * scaleY, completedCrop.width * scaleX, completedCrop.height * scaleY, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
            if (blob) {
                const croppedFile = new File([blob], "cropped_cover.jpeg", { type: "image/jpeg" });
                onRecorteCompleto(croppedFile);
            }
        }, 'image/jpeg', 0.9);
    };

    return (
        <Dialog open onClose={onCancelar} fullWidth maxWidth="md">
            <DialogTitle>Recortar Imagem de Capa (16:9)</DialogTitle>
            <DialogContent><ReactCrop crop={crop} onChange={c => setCrop(c)} onComplete={c => setCompletedCrop(c)} aspect={16 / 9} minWidth={200}><img ref={imgRef} src={imagemSrc} onLoad={onImageLoad} style={{ maxHeight: '70vh', width: '100%' }} alt="A recortar" /></ReactCrop></DialogContent>
            <DialogActions><Button onClick={onCancelar}>Cancelar</Button><Button onClick={handleConfirmarRecorte} variant="contained">Confirmar Recorte</Button></DialogActions>
        </Dialog>
    );
}

function GerirCapas({ usuario, setUsuario, mostrarNotificacao }) {
  const [capas, setCapas] = useState(usuario.foto_capa_url || []);
  const [carregando, setCarregando] = useState(false);
  const fileInputRef = useRef();
  const [imagemParaRecortar, setImagemParaRecortar] = useState(null);
  const [dialogoUrlAberto, setDialogoUrlAberto] = useState(false);
  const [urlImagem, setUrlImagem] = useState("");

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const items = reorder(capas, result.source.index, result.destination.index);
    setCapas(items);
  };

  const handleFileChange = (e) => {
    if (capas.length >= 3) {
      mostrarNotificacao("Pode ter no máximo 3 imagens de capa.", "warning");
      return;
    }
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        mostrarNotificacao('A imagem é muito grande (máx 10MB).', 'error');
        return;
      }
      setImagemParaRecortar(URL.createObjectURL(file));
    }
  };
  
  const handleRecorteCompleto = (ficheiroRecortado) => {
    setCapas(prev => [...prev, ficheiroRecortado]);
    setImagemParaRecortar(null);
  };

  const handleAdicionarLink = () => {
    if (capas.length >= 3) {
      mostrarNotificacao("Pode ter no máximo 3 imagens de capa.", "warning");
      return;
    }
    setUrlImagem("");
    setDialogoUrlAberto(true);
  };
  
  const handleConfirmarUrl = () => {
    if (urlImagem && urlImagem.startsWith('http')) {
      setCapas(prev => [...prev, urlImagem]);
      setDialogoUrlAberto(false);
    } else {
      mostrarNotificacao("O link fornecido não é válido.", "error");
    }
  };

  const handleRemoverCapa = (index) => {
    setCapas(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleSalvarCapas = async () => {
    setCarregando(true);
    const formData = new FormData();
    const ordemCapas = capas.map(capa => {
      if (typeof capa === 'string') {
        return capa;
      } else {
        formData.append('capas', capa);
        return 'UPLOAD';
      }
    });
    
    formData.append('ordemCapas', JSON.stringify(ordemCapas));

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
    <>
      {imagemParaRecortar && (
        <EditorDeRecorte 
            imagemSrc={imagemParaRecortar}
            onRecorteCompleto={handleRecorteCompleto}
            onCancelar={() => setImagemParaRecortar(null)}
        />
      )}
      <Paper sx={{ p: { xs: 2, md: 3 }, mb: 4 }}>
        <Typography variant="h6" component="h2" gutterBottom>Fotos de Capa</Typography>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="capasDroppable" direction="horizontal">
            {(provided) => (
              <Box 
                sx={{ display: 'flex', gap: 2, flexWrap: { xs: 'wrap', sm: 'nowrap' }, overflowX: 'auto', pb: 1 }} 
                {...provided.droppableProps} 
                ref={provided.innerRef}
              >
                {capas.map((capa, index) => (
                  <Draggable key={index} draggableId={`capa-${index}`} index={index}>
                    {(provided) => (
                      <Box 
                        ref={provided.innerRef} 
                        {...provided.draggableProps}
                        sx={{ flex: '1 1 0', minWidth: '200px' }}
                      >
                          <Paper 
                            variant="outlined" 
                            sx={{ 
                                width: '100%', 
                                height: 150, 
                                backgroundSize: 'cover', 
                                backgroundPosition: 'center', 
                                backgroundImage: `url(${typeof capa === 'string' ? capa : URL.createObjectURL(capa)})`, 
                                position: 'relative' 
                            }}
                          >
                              <Box {...provided.dragHandleProps} sx={{ position: 'absolute', top: 4, left: 4, bgcolor: 'rgba(0,0,0,0.5)', borderRadius: '50%', display: 'flex', cursor: 'grab' }}>
                                  <DragIndicatorIcon sx={{ color: 'white' }} />
                              </Box>
                              <IconButton onClick={() => handleRemoverCapa(index)} sx={{ position: 'absolute', top: 4, right: 4, bgcolor: 'rgba(0,0,0,0.5)', color: 'white' }}>
                                  <DeleteIcon fontSize="small" />
                              </IconButton>
                          </Paper>
                      </Box>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </Box>
            )}
          </Droppable>
        </DragDropContext>
        <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <Button variant="outlined" startIcon={<AddPhotoIcon />} onClick={() => fileInputRef.current.click()} disabled={capas.length >= 3}>Enviar Ficheiro</Button>
          <Button variant="outlined" startIcon={<LinkIcon />} onClick={handleAdicionarLink} disabled={capas.length >= 3}>Usar Link Externo</Button>
          <Button variant="contained" onClick={handleSalvarCapas} disabled={carregando} sx={{ ml: 'auto' }}>
              {carregando ? <CircularProgress size={24} /> : "Salvar Capas"}
          </Button>
          <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleFileChange} />
        </Box>
      </Paper>
      
      <Dialog open={dialogoUrlAberto} onClose={() => setDialogoUrlAberto(false)} fullWidth maxWidth="sm">
        <DialogTitle>Adicionar Imagem de Capa por Link</DialogTitle>
        <DialogContent>
            <DialogContentText sx={{ mb: 2 }}>
                Cole o link completo (URL) da imagem que deseja usar. Lembre-se que imagens de links externos não podem ser recortadas.
            </DialogContentText>
            <TextField
                autoFocus
                margin="dense"
                label="URL da Imagem"
                type="url"
                fullWidth
                variant="outlined"
                value={urlImagem}
                onChange={(e) => setUrlImagem(e.target.value)}
            />
        </DialogContent>
        <DialogActions>
            <Button onClick={() => setDialogoUrlAberto(false)}>Cancelar</Button>
            <Button onClick={handleConfirmarUrl} variant="contained">Confirmar</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

function Mural() {
  const { usuario, setUsuario } = useContext(AuthContext);
  const { mostrarNotificacao } = useNotificacao();
  
  const { data: posts, carregando: carregandoPosts, refetch: buscarPosts } = useApi('/api/posts');
  const [dialogoPostAberto, setDialogoPostAberto] = useState(false);
  const [novoPost, setNovoPost] = useState({ content: '', link: '' });

  const [biografia, setBiografia] = useState("");
  const [urlUnica, setUrlUnica] = useState("");
  const [links, setLinks] = useState({ instagram: '', youtube: '', spotify: '' });
  const [videoDestaque, setVideoDestaque] = useState("");
  const [carregandoPublico, setCarregandoPublico] = useState(false);

  const { data: enquetes, carregando: carregandoEnquetes, refetch: buscarEnquetes } = useApi('/api/enquetes');
  const [dialogoEnqueteAberto, setDialogoEnqueteAberto] = useState(false);
  const [salvandoEnquete, setSalvandoEnquete] = useState(false);
  
  useEffect(() => {
    if (usuario) {
      setBiografia(usuario.biografia || "");
      setUrlUnica(usuario.url_unica || "");
      setLinks(usuario.links_redes || { instagram: '', youtube: '', spotify: '' });
      setVideoDestaque(usuario.video_destaque_url || "");
    }
  }, [usuario]);

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
    
  const handleAbrirDialogoPost = () => {
    setNovoPost({ content: '', link: '' });
    setDialogoPostAberto(true);
  };

  const handleFecharDialogoPost = () => setDialogoPostAberto(false);

  const handleSalvarPost = async () => {
    if (!novoPost.content.trim()) {
      mostrarNotificacao('O conteúdo da publicação é obrigatório.', 'warning');
      return;
    }
    try {
      await apiClient.post('/api/posts', novoPost);
      mostrarNotificacao('Publicação criada com sucesso!', 'success');
      handleFecharDialogoPost();
      buscarPosts();
    } catch (error) {
      mostrarNotificacao('Erro ao salvar a publicação.', 'error');
    }
  };

  const handleApagarPost = async (id) => {
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

  const handleSalvarEnquete = async (dadosEnquete) => {
    setSalvandoEnquete(true);
    try {
        await apiClient.post('/api/enquetes', dadosEnquete);
        mostrarNotificacao('Enquete criada com sucesso!', 'success');
        buscarEnquetes();
        setDialogoEnqueteAberto(false);
    } catch (error) {
        mostrarNotificacao(error.response?.data?.mensagem || 'Erro ao criar enquete.', 'error');
    } finally {
        setSalvandoEnquete(false);
    }
  };

  const handleAtivarEnquete = async (id) => {
    try {
        await apiClient.patch(`/api/enquetes/${id}/ativar`);
        mostrarNotificacao('Enquete ativada no seu Showcase!', 'success');
        buscarEnquetes();
    } catch (error) {
        mostrarNotificacao(error.response?.data?.mensagem || 'Erro ao ativar enquete.', 'error');
    }
  };

  const handleApagarEnquete = async (id) => {
    if (window.confirm("Tem certeza que deseja apagar esta enquete e todos os seus votos?")) {
        try {
            await apiClient.delete(`/api/enquetes/${id}`);
            mostrarNotificacao('Enquete apagada com sucesso.', 'success');
            buscarEnquetes();
        } catch (error) {
            mostrarNotificacao(error.response?.data?.mensagem || 'Erro ao apagar enquete.', 'error');
        }
    }
  };

  if (!usuario) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold">Painel Showcase</Typography>
          <Typography color="text.secondary">Gerencie o conteúdo da sua página pública.</Typography>
        </Box>
        <Box>
            <Button variant="outlined" startIcon={<AddCircleOutlineIcon />} onClick={() => setDialogoEnqueteAberto(true)} sx={{ mr: 1 }}>
                Nova Enquete
            </Button>
            <Button variant="contained" startIcon={<AddCircleOutlineIcon />} onClick={handleAbrirDialogoPost}>
                Nova Publicação
            </Button>
        </Box>
      </Box>
      
      <Paper sx={{ mb: 4, p: { xs: 2, md: 3 } }}>
        <Typography variant="h6" component="h2" gutterBottom>Minhas Enquetes</Typography>
        {carregandoEnquetes ? <CircularProgress /> : (
            <List>
                {(enquetes || []).length === 0 ? (
                    <Typography color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                        Crie uma enquete para interagir com o seu público!
                    </Typography>
                ) : (
                    (enquetes || []).map(enquete => (
                        <ListItem key={enquete.id} divider
                            secondaryAction={
                                <Box>
                                    <Tooltip title="Ativar esta enquete no Showcase (desativa as outras)">
                                        <span>
                                            <IconButton onClick={() => handleAtivarEnquete(enquete.id)} disabled={enquete.ativa} color="success">
                                                <CheckCircleIcon />
                                            </IconButton>
                                        </span>
                                    </Tooltip>
                                    <Tooltip title="Apagar Enquete">
                                        <IconButton onClick={() => handleApagarEnquete(enquete.id)} color="error">
                                            <DeleteIcon />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            }
                        >
                            <ListItemText
                                primary={enquete.pergunta}
                                secondary={`Opções: ${enquete.opcoes.map(o => o.texto_opcao).join(' / ')}`}
                            />
                            {enquete.ativa && <Chip label="Ativa" color="success" size="small" />}
                        </ListItem>
                    ))
                )}
            </List>
        )}
      </Paper>
      
      <Paper sx={{ mb: 4, p: { xs: 2, md: 3 } }}>
        <Typography variant="h6" component="h2">
          Últimas Publicações do Mural
        </Typography>
        {carregandoPosts ? <CircularProgress sx={{ mt: 2 }}/> : (
            <List>
            {(posts || []).length === 0 ? (
                <Typography sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
                Nenhuma publicação no seu mural.
                </Typography>
            ) : (
                (posts || []).map((post) => (
                <ListItem
                    key={post.id}
                    secondaryAction={
                    <Tooltip title="Apagar Publicação">
                        <IconButton edge="end" color="error" onClick={() => handleApagarPost(post.id)}>
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
      
      <GerirCapas usuario={usuario} setUsuario={setUsuario} mostrarNotificacao={mostrarNotificacao} />

      <Paper sx={{ p: { xs: 2, md: 3 }, mb: 4 }}>
        <Typography variant="h6" component="h2" gutterBottom>Informações Gerais</Typography>
        {usuario?.url_unica && (
            <Link href={`/showcase/${usuario.url_unica}`} target="_blank" rel="noopener noreferrer" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <LinkIcon sx={{ mr: 1 }} /> Visualizar minha página pública
            </Link>
        )}
        <Box component="form" onSubmit={handleSalvarPerfilPublico} noValidate sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 2 }}>
            <TextField id="url_unica" name="url_unica" label="URL Única" helperText="Ex: o-nome-da-sua-banda" value={urlUnica} onChange={(e) => setUrlUnica(e.target.value.toLowerCase().replace(/\s+/g, '-'))} fullWidth />
            <TextField id="biografia" name="biografia" label="Biografia" multiline rows={4} value={biografia} onChange={(e) => setBiografia(e.target.value)} fullWidth />
            <TextField id="video_destaque" name="video_destaque" label="Link do Vídeo Destaque (YouTube)" value={videoDestaque} onChange={(e) => setVideoDestaque(e.target.value)} InputProps={{ startAdornment: <YouTube sx={{ mr: 1, color: 'text.secondary' }} /> }} />
            <Typography color="text.secondary">Links e Redes Sociais</Typography>
            <TextField id="link_instagram" name="link_instagram" label="Instagram" value={links.instagram || ''} onChange={(e) => handleLinkChange('instagram', e.target.value)} InputProps={{ startAdornment: <Instagram sx={{ mr: 1, color: 'text.secondary' }} /> }} />
            <TextField id="link_youtube" name="link_youtube" label="YouTube (Canal)" value={links.youtube || ''} onChange={(e) => handleLinkChange('youtube', e.target.value)} InputProps={{ startAdornment: <YouTube sx={{ mr: 1, color: 'text.secondary' }} /> }} />
            <TextField id="link_spotify" name="link_spotify" label="Spotify" value={links.spotify || ''} onChange={(e) => handleLinkChange('spotify', e.target.value)} InputProps={{ startAdornment: <MusicNote sx={{ mr: 1, color: 'text.secondary' }} /> }} />
            
            <Button type="submit" variant="contained" disabled={carregandoPublico} sx={{ alignSelf: "flex-start", mt: 2 }}>
                {carregandoPublico ? <CircularProgress size={24} /> : "Salvar Informações Gerais"}
            </Button>
        </Box>
      </Paper>

      <Dialog open={dialogoPostAberto} onClose={handleFecharDialogoPost} fullWidth maxWidth="sm">
        <DialogTitle>Nova publicação</DialogTitle>
        <DialogContent>
          <TextField autoFocus margin="dense" label="Conteúdo da publicação *" type="text" fullWidth multiline rows={4} variant="outlined" value={novoPost.content} onChange={(e) => setNovoPost(p => ({ ...p, content: e.target.value }))} sx={{ mb: 2 }} />
          <TextField margin="dense" label="Link (opcional)" type="url" fullWidth variant="outlined" value={novoPost.link} onChange={(e) => setNovoPost(p => ({ ...p, link: e.target.value }))} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleFecharDialogoPost}>Cancelar</Button>
          <Button onClick={handleSalvarPost} variant="contained">Publicar</Button>
        </DialogActions>
      </Dialog>
      
      <FormularioEnquete
        open={dialogoEnqueteAberto}
        onClose={() => setDialogoEnqueteAberto(false)}
        onSave={handleSalvarEnquete}
        carregando={salvandoEnquete}
      />
    </Box>
  );
}

export default Mural;
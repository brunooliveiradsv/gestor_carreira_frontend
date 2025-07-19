// src/paginas/Mural.jsx
import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../api';
import { useNotificacao } from '../contextos/NotificationContext';
import {
  Box, Typography, Button, CircularProgress, Paper, List, ListItem,
  ListItemText, IconButton, Tooltip, TextField, Dialog, DialogActions,
  DialogContent, DialogTitle, Link
} from '@mui/material';
import { AddCircleOutline as AddCircleOutlineIcon, Delete as DeleteIcon, Link as LinkIcon } from '@mui/icons-material';

function Mural() {
  const [posts, setPosts] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const { mostrarNotificacao } = useNotificacao();

  const [dialogoAberto, setDialogoAberto] = useState(false);
  const [novoPost, setNovoPost] = useState({ content: '', link: '' });

  const buscarPosts = useCallback(async () => {
    try {
      setCarregando(true);
      const resposta = await apiClient.get('/api/posts');
      setPosts(resposta.data);
    } catch (error) {
      mostrarNotificacao('Erro ao carregar as publicações.', 'error');
    } finally {
      setCarregando(false);
    }
  }, [mostrarNotificacao]);

  useEffect(() => {
    buscarPosts();
  }, [buscarPosts]);

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
      buscarPosts(); // Atualiza a lista
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
            Mural de Novidades
          </Typography>
          <Typography color="text.secondary">
            Publique atualizações que aparecerão na sua página vitrine.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddCircleOutlineIcon />} onClick={handleAbrirDialogo}>
          Nova Publicação
        </Button>
      </Box>

      <Paper>
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

      {/* Dialog para Nova Publicação */}
      <Dialog open={dialogoAberto} onClose={handleFecharDialogo} fullWidth maxWidth="sm">
        <DialogTitle>Nova Publicação</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Conteúdo da publicação *"
            type="text"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={novoPost.content}
            onChange={(e) => setNovoPost(p => ({ ...p, content: e.target.value }))}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Link (opcional)"
            type="url"
            fullWidth
            variant="outlined"
            value={novoPost.link}
            onChange={(e) => setNovoPost(p => ({ ...p, link: e.target.value }))}
          />
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
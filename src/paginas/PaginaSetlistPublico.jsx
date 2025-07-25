// src/paginas/PaginaSetlistPublico.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import apiClient from '../apiClient';
import {
  Box, Typography, CircularProgress, Container, Paper, List, ListItem,
  ListItemIcon, ListItemText, Button, Divider
} from '@mui/material';
import { MusicNote as MusicNoteIcon } from '@mui/icons-material';
import Anuncio from '../componentes/Anuncio'; // Importar o componente de anúncio

function PaginaSetlistPublico() {
  const { uuid } = useParams();
  const [setlist, setSetlist] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const buscarSetlist = useCallback(async () => {
    try {
      const { data } = await apiClient.get(`/api/setlists/publico/${uuid}`);
      setSetlist(data);
    } catch (err) {
      setErro(err.response?.data?.mensagem || 'Link de partilha inválido ou expirado.');
    } finally {
      setCarregando(false);
    }
  }, [uuid]);

  useEffect(() => {
    buscarSetlist();
  }, [buscarSetlist]);

  if (carregando) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><CircularProgress /></Box>;
  }

  if (erro) {
    return (
      <Container sx={{ textAlign: 'center', mt: 8 }}>
        <Typography variant="h4" color="error">{erro}</Typography>
        <Button component={RouterLink} to="/" variant="contained" sx={{ mt: 2 }}>Voltar à Página Principal</Button>
      </Container>
    );
  }

  if (!setlist) return null;

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 5 }}>
      <Container maxWidth="md">
        <Paper sx={{ p: { xs: 2, sm: 4 } }}>
          <Typography variant="h4" component="h1" fontWeight="bold">{setlist.nome}</Typography>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Um setlist de {setlist.usuario.nome}
          </Typography>
          <Divider sx={{ my: 2 }} />
          <List>
            {setlist.musicas.map((musica, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  <MusicNoteIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary={musica.nome} secondary={musica.artista} />
              </ListItem>
            ))}
          </List>
        </Paper>
         <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Button component={RouterLink} to="/" variant="outlined">
                Criado com VoxGest
            </Button>
        </Box>
      </Container>
      <Anuncio /> {/* 1. Adicionar o componente de anúncio */}
    </Box>
  );
}

export default PaginaSetlistPublico;
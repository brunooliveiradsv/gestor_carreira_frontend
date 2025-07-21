// src/paginas/ModoPalco.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../api';
import { Box, Typography, CircularProgress, IconButton, Paper, Chip, useTheme } from '@mui/material';
import { ArrowBackIos, ArrowForwardIos, Close as CloseIcon } from '@mui/icons-material';

function ModoPalco() {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();

  const [setlist, setSetlist] = useState(null);
  const [indiceAtual, setIndiceAtual] = useState(0);
  const [carregando, setCarregando] = useState(true);

  // Busca os dados do setlist da API
  useEffect(() => {
    const buscarSetlist = async () => {
      try {
        const resposta = await apiClient.get(`/api/setlists/${id}`);
        setSetlist(resposta.data);
      } catch (error) {
        console.error("Erro ao carregar setlist para o Modo Palco", error);
        navigate('/setlists'); // Volta se não encontrar
      } finally {
        setCarregando(false);
      }
    };
    buscarSetlist();
  }, [id, navigate]);

  // Funções para navegar entre as músicas
  const irParaProxima = useCallback(() => {
    if (!setlist) return;
    setIndiceAtual((prev) => (prev + 1) % setlist.musicas.length);
  }, [setlist]);

  const irParaAnterior = useCallback(() => {
    if (!setlist) return;
    setIndiceAtual((prev) => (prev - 1 + setlist.musicas.length) % setlist.musicas.length);
  }, [setlist]);

  // Efeito para controlar a navegação com as setas do teclado
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'ArrowRight') {
        irParaProxima();
      } else if (event.key === 'ArrowLeft') {
        irParaAnterior();
      } else if (event.key === 'Escape') {
        navigate(`/setlists/editar/${id}`);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [irParaProxima, irParaAnterior, navigate, id]);
  
  if (carregando) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: 'background.default' }}><CircularProgress /></Box>;
  }

  if (!setlist || setlist.musicas.length === 0) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: 'background.default', p: 3 }}>
        <Typography variant="h5" textAlign="center">Este setlist está vazio.</Typography>
        <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate(`/setlists/editar/${id}`)}>Adicionar Músicas</Button>
      </Box>
    );
  }

  const musicaAtual = setlist.musicas[indiceAtual];

  return (
    <Box sx={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      bgcolor: 'background.default', color: 'text.primary',
      display: 'flex', flexDirection: 'column', p: { xs: 2, sm: 4, md: 6 }
    }}>
      {/* Botões de Navegação e Fechar */}
      <IconButton onClick={irParaAnterior} sx={{ position: 'fixed', left: 16, top: '50%', transform: 'translateY(-50%)', zIndex: 10, bgcolor: 'rgba(0,0,0,0.3)', '&:hover': { bgcolor: 'rgba(0,0,0,0.5)' } }}>
        <ArrowBackIos />
      </IconButton>
      <IconButton onClick={irParaProxima} sx={{ position: 'fixed', right: 16, top: '50%', transform: 'translateY(-50%)', zIndex: 10, bgcolor: 'rgba(0,0,0,0.3)', '&:hover': { bgcolor: 'rgba(0,0,0,0.5)' } }}>
        <ArrowForwardIos />
      </IconButton>
      <IconButton onClick={() => navigate(`/setlists/editar/${id}`)} sx={{ position: 'fixed', right: 16, top: 16, zIndex: 10, bgcolor: 'rgba(0,0,0,0.3)', '&:hover': { bgcolor: 'rgba(0,0,0,0.5)' } }}>
        <CloseIcon />
      </IconButton>
      
      {/* Conteúdo da Música */}
      <Box sx={{ textAlign: 'center', mb: 2 }}>
        <Typography variant="h2" component="h1" fontWeight="bold" sx={{ fontSize: { xs: '2.5rem', md: '4rem' } }}>{musicaAtual.nome}</Typography>
        <Typography variant="h5" color="text.secondary" sx={{ fontSize: { xs: '1.2rem', md: '1.5rem' } }}>{musicaAtual.artista}</Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 1 }}>
            {musicaAtual.tom && <Chip label={`Tom: ${musicaAtual.tom}`} />}
            {musicaAtual.bpm && <Chip label={`BPM: ${musicaAtual.bpm}`} />}
        </Box>
      </Box>
      
      {/* Cifra/Letra */}
      <Paper variant="outlined" sx={{ flexGrow: 1, overflowY: 'auto', p: 3 }}>
        <Typography sx={{ whiteSpace: 'pre-wrap', fontSize: { xs: '1rem', md: '1.2rem' }, lineHeight: 1.8, fontFamily: 'monospace' }}>
          {musicaAtual.notas_adicionais || 'Nenhuma cifra ou letra adicionada.'}
        </Typography>
      </Paper>
      
      {/* Paginação */}
      <Typography sx={{ textAlign: 'center', mt: 2 }}>
        Música {indiceAtual + 1} de {setlist.musicas.length}
      </Typography>
    </Box>
  );
}

export default ModoPalco;
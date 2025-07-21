// src/paginas/ModoPalco.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../api';
import { Box, Typography, CircularProgress, IconButton, Paper, Chip, useTheme, Button, Container } from '@mui/material';
import { 
    ArrowBackIos, ArrowForwardIos, Close as CloseIcon,
    PlayArrow as PlayIcon, Pause as PauseIcon, Add as AddIcon, Remove as RemoveIcon,
    Fullscreen as FullscreenIcon, FullscreenExit as FullscreenExitIcon 
} from '@mui/icons-material';

// Função para analisar o texto e colorir as linhas de cifra
const formatarCifra = (textoCifra, theme) => {
    if (!textoCifra) return <Typography>Nenhuma cifra ou letra adicionada.</Typography>;
    
    // Expressão regular para detetar linhas que são provavelmente cifras
    const regexCifra = /^[A-G][#b]?(m|maj|min|dim|aug|sus)?[0-9]?(\s+[A-G][#b]?(m|maj|min|dim|aug|sus)?[0-9]?)*\s*$/i;

    return textoCifra.split('\n').map((linha, index) => {
        const isCifra = regexCifra.test(linha.trim());
        return (
            <Typography 
                key={index}
                component="span"
                sx={{
                    display: 'block',
                    color: isCifra ? theme.palette.secondary.main : theme.palette.text.primary,
                    fontWeight: isCifra ? 'bold' : 'normal',
                }}
            >
                {linha || <br />} {/* Renderiza uma quebra de linha para linhas vazias */}
            </Typography>
        );
    });
};

function ModoPalco() {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();

  const [setlist, setSetlist] = useState(null);
  const [indiceAtual, setIndiceAtual] = useState(0);
  const [carregando, setCarregando] = useState(true);

  // Estados para o auto-scroll
  const [isScrolling, setIsScrolling] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(90); // Valor maior = mais lento
  const letraRef = useRef(null);
  const scrollAnimationRef = useRef();

  // Estado para a tela cheia
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);


  const buscarSetlist = useCallback(async () => {
      try {
        const resposta = await apiClient.get(`/api/setlists/${id}`);
        setSetlist(resposta.data);
      } catch (error) {
        console.error("Erro ao carregar setlist para o Modo Palco", error);
        navigate('/setlists');
      } finally {
        setCarregando(false);
      }
  }, [id, navigate]);

  useEffect(() => {
    buscarSetlist();
  }, [buscarSetlist]);

  const irParaProxima = useCallback(() => {
    if (!setlist) return;
    setIndiceAtual((prev) => (prev + 1) % setlist.musicas.length);
    setIsScrolling(false);
  }, [setlist]);

  const irParaAnterior = useCallback(() => {
    if (!setlist) return;
    setIndiceAtual((prev) => (prev - 1 + setlist.musicas.length) % setlist.musicas.length);
    setIsScrolling(false);
  }, [setlist]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'ArrowRight') {
        irParaProxima();
      } else if (event.key === 'ArrowLeft') {
        irParaAnterior();
      } else if (event.key === 'Escape') {
        navigate(`/setlists`); // Alterado para voltar para a lista
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [irParaProxima, irParaAnterior, navigate, id]);
  
  useEffect(() => {
    const element = letraRef.current;
    if (!element) return;
    element.scrollTop = 0;
    const step = () => {
      element.scrollTop += 1;
      if (element.scrollTop < element.scrollHeight - element.clientHeight) {
        scrollAnimationRef.current = setTimeout(step, scrollSpeed);
      } else {
        setIsScrolling(false);
      }
    };
    if (isScrolling) {
      scrollAnimationRef.current = setTimeout(step, scrollSpeed);
    }
    return () => clearTimeout(scrollAnimationRef.current);
  }, [isScrolling, scrollSpeed, indiceAtual]);


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

  const musicaAtual = setlist.musicas?.[indiceAtual];

  return (
    <Box sx={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      bgcolor: '#000', color: '#FFF',
      display: 'flex', flexDirection: 'column', p: { xs: 1, sm: 2 }
    }}>
      <IconButton onClick={irParaAnterior} sx={{ position: 'fixed', left: {xs: 4, md: 16}, top: '50%', transform: 'translateY(-50%)', zIndex: 10, bgcolor: 'rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}>
        <ArrowBackIos />
      </IconButton>
      <IconButton onClick={irParaProxima} sx={{ position: 'fixed', right: {xs: 4, md: 16}, top: '50%', transform: 'translateY(-50%)', zIndex: 10, bgcolor: 'rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}>
        <ArrowForwardIos />
      </IconButton>
      <IconButton onClick={() => navigate(`/setlists`)} sx={{ position: 'fixed', left: 16, top: 16, zIndex: 10, bgcolor: 'rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}>
        <CloseIcon />
      </IconButton>
      <IconButton onClick={handleToggleFullscreen} sx={{ position: 'fixed', right: 16, top: 16, zIndex: 10, bgcolor: 'rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}>
        {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
      </IconButton>
      
      <Container maxWidth="md" sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, py: 2 }}>
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Typography variant="h2" component="h1" fontWeight="bold" sx={{ fontSize: { xs: '2rem', sm: '3rem', md: '4rem' } }}>{musicaAtual?.nome}</Typography>
          <Typography variant="h5" color="text.secondary" sx={{ fontSize: { xs: '1.1rem', md: '1.5rem' } }}>{musicaAtual?.artista}</Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
              {musicaAtual?.tom && <Chip label={`Tom: ${musicaAtual.tom}`} variant="outlined" />}
              {musicaAtual?.bpm && <Chip label={`BPM: ${musicaAtual.bpm}`} variant="outlined" />}
          </Box>
        </Box>
        
        <Paper variant="outlined" sx={{ flexGrow: 1, overflow: 'hidden', p: {xs: 2, md: 3}, bgcolor: 'transparent', borderColor: 'rgba(255,255,255,0.2)' }}>
          <Box ref={letraRef} sx={{ height: '100%', overflowY: 'auto', '&::-webkit-scrollbar': { display: 'none' }, scrollbarWidth: 'none' }}>
              <Typography sx={{ fontSize: { xs: '1.1rem', md: '1.5rem' }, lineHeight: 1.9, fontFamily: 'monospace', textAlign: 'center' }}>
                  {formatarCifra(musicaAtual?.notas_adicionais, theme)}
              </Typography>
          </Box>
        </Paper>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, mt: 2 }}>
          <Typography sx={{ flexGrow: 1, textAlign: 'right' }}>Velocidade:</Typography>
          <IconButton onClick={() => setScrollSpeed(s => s + 10)}><RemoveIcon /></IconButton>
          <IconButton onClick={() => setIsScrolling(!isScrolling)} color="secondary" size="large">
              {isScrolling ? <PauseIcon fontSize="large" /> : <PlayIcon fontSize="large" />}
          </IconButton>
          <IconButton onClick={() => setScrollSpeed(s => Math.max(10, s - 10))}><AddIcon /></IconButton>
          <Typography sx={{ flexGrow: 1, textAlign: 'left' }}>Música {indiceAtual + 1} de {setlist?.musicas?.length}</Typography>
        </Box>
      </Container>
    </Box>
  );
}

export default ModoPalco;
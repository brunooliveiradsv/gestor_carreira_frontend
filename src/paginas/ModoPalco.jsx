// src/paginas/ModoPalco.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../api';
import { useNotificacao } from '../contextos/NotificationContext'; // <-- 1. Importe o hook de notificação
import { Box, Typography, CircularProgress, IconButton, Paper, Chip, useTheme, Button, Container } from '@mui/material';
import { 
    ArrowBackIos, ArrowForwardIos, Close as CloseIcon,
    PlayArrow as PlayIcon, Pause as PauseIcon, Add as AddIcon, Remove as RemoveIcon,
    Fullscreen as FullscreenIcon, FullscreenExit as FullscreenExitIcon,
    Notes as NotesIcon
} from '@mui/icons-material';

const formatarCifra = (textoCifra, theme) => {
    if (!textoCifra) return <Typography>Nenhuma cifra ou letra adicionada.</Typography>;
    const regexCifra = /^[A-G][#b]?(m|maj|min|dim|aug|sus)?[0-9]?(\s+[A-G][#b]?(m|maj|min|dim|aug|sus)?[0-9]?)*\s*$/i;
    return textoCifra.split('\n').map((linha, index) => (
        <Typography 
            key={index} component="span"
            sx={{
                display: 'block',
                color: linha.trim().match(regexCifra) ? theme.palette.secondary.main : 'inherit',
                fontWeight: linha.trim().match(regexCifra) ? 'bold' : 'normal',
            }}
        >
            {linha || <br />}
        </Typography>
    ));
};

function ModoPalco() {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const { mostrarNotificacao } = useNotificacao(); // <-- 2. Inicialize o hook

  const [setlist, setSetlist] = useState(null);
  const [indiceAtual, setIndiceAtual] = useState(0);
  const [carregando, setCarregando] = useState(true);
  
  const [cifraAberta, setCifraAberta] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(90);
  const letraRef = useRef(null);
  const scrollAnimationRef = useRef();

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
  }, [setlist]);

  const irParaAnterior = useCallback(() => {
    if (!setlist) return;
    setIndiceAtual((prev) => (prev - 1 + setlist.musicas.length) % setlist.musicas.length);
  }, [setlist]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (cifraAberta) return; // Desativa atalhos de música quando a cifra está aberta
      if (event.key === 'ArrowRight') irParaProxima();
      else if (event.key === 'ArrowLeft') irParaAnterior();
      else if (event.key === 'Escape') navigate(`/setlists`);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [irParaProxima, irParaAnterior, navigate, cifraAberta]);
  
  useEffect(() => {
    const element = letraRef.current;
    if (!element || !cifraAberta) return;
    
    element.scrollTop = 0;
    setIsScrolling(false); // Garante que o scroll para ao mudar de música

    const step = () => {
      element.scrollTop += 1;
      if (element.scrollTop < element.scrollHeight - element.clientHeight) {
        scrollAnimationRef.current = setTimeout(step, scrollSpeed);
      } else {
        setIsScrolling(false);
        // --- 3. ADICIONA A MENSAGEM DE FIM DA MÚSICA ---
        mostrarNotificacao('Fim da música', 'info');
      }
    };

    if (isScrolling) {
      scrollAnimationRef.current = setTimeout(step, scrollSpeed);
    }

    return () => clearTimeout(scrollAnimationRef.current);
  }, [isScrolling, scrollSpeed, indiceAtual, cifraAberta, mostrarNotificacao]);

  const handleAbrirCifra = () => setCifraAberta(true);
  const handleFecharCifra = () => {
    setCifraAberta(false);
    setIsScrolling(false);
  };

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
      bgcolor: '#000', color: '#FFF',
      display: 'flex', flexDirection: 'column',
      justifyContent: 'center', alignItems: 'center',
      p: { xs: 2, sm: 4 }
    }}>
      <IconButton onClick={irParaAnterior} sx={{ position: 'fixed', left: {xs: 4, md: 16}, top: '50%', transform: 'translateY(-50%)', zIndex: 10, bgcolor: 'rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}><ArrowBackIos /></IconButton>
      <IconButton onClick={irParaProxima} sx={{ position: 'fixed', right: {xs: 4, md: 16}, top: '50%', transform: 'translateY(-50%)', zIndex: 10, bgcolor: 'rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}><ArrowForwardIos /></IconButton>
      <IconButton onClick={() => navigate(`/setlists`)} sx={{ position: 'fixed', right: 16, top: 16, zIndex: 10, bgcolor: 'rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}><CloseIcon /></IconButton>
      
      <Box sx={{ textAlign: 'center' }}>
        <Typography sx={{ color: 'text.secondary' }}>Música {indiceAtual + 1} de {setlist.musicas.length}</Typography>
        <Typography variant="h1" component="h1" fontWeight="bold" sx={{ fontSize: { xs: '3rem', sm: '4rem', md: '6rem' } }}>{musicaAtual.nome}</Typography>
        <Typography variant="h4" color="text.secondary" sx={{ fontSize: { xs: '1.5rem', md: '2rem' } }}>{musicaAtual.artista}</Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 3 }}>
            {musicaAtual.tom && <Chip label={`Tom: ${musicaAtual.tom}`} variant="outlined" />}
            {musicaAtual.bpm && <Chip label={`BPM: ${musicaAtual.bpm}`} variant="outlined" />}
        </Box>
        <Button variant="contained" color="secondary" startIcon={<NotesIcon />} onClick={handleAbrirCifra} sx={{ mt: 4 }}>
          Ver Cifra / Letra
        </Button>
      </Box>

      <Dialog
        fullScreen
        open={cifraAberta}
        onClose={handleFecharCifra}
        PaperProps={{ sx: { bgcolor: '#000' } }}
      >
        <AppBar sx={{ position: 'relative', bgcolor: 'background.paper' }}>
          <Toolbar>
            <Box sx={{ flex: 1, textAlign: 'left' }} />
            <Box sx={{ flex: 2, textAlign: 'center' }}>
              <Typography variant="h6">{musicaAtual.nome}</Typography>
              <Typography variant="body2" color="text.secondary">{musicaAtual.artista}</Typography>
            </Box>
            <Box sx={{ flex: 1, textAlign: 'right' }}>
              <IconButton edge="end" color="inherit" onClick={handleFecharCifra} aria-label="close"><CloseIcon /></IconButton>
            </Box>
          </Toolbar>
        </AppBar>
        <DialogContent sx={{ p: {xs: 2, md: 4}, '&::-webkit-scrollbar': { display: 'none' }, scrollbarWidth: 'none' }}>
            <Container maxWidth="md" ref={letraRef} sx={{ height: '100%', overflowY: 'auto', '&::-webkit-scrollbar': { display: 'none' }, scrollbarWidth: 'none' }}>
                <Typography sx={{ fontSize: { xs: '1.2rem', md: '1.8rem' }, lineHeight: 2, fontFamily: 'monospace', textAlign: 'center', whiteSpace: 'pre-wrap' }}>
                    {formatarCifra(musicaAtual.notas_adicionais, theme)}
                </Typography>
            </Container>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', alignItems: 'center', p: 2, bgcolor: 'background.paper' }}>
          <Typography sx={{ flexGrow: 1, textAlign: 'right' }}>Velocidade:</Typography>
          <IconButton onClick={() => setScrollSpeed(s => s + 10)}><RemoveIcon /></IconButton>
          <IconButton onClick={() => setIsScrolling(!isScrolling)} color="secondary" size="large">
              {isScrolling ? <PauseIcon fontSize="large" /> : <PlayIcon fontSize="large" />}
          </IconButton>
          <IconButton onClick={() => setScrollSpeed(s => Math.max(10, s - 10))}><AddIcon /></IconButton>
          <Box sx={{ flexGrow: 1 }} />
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ModoPalco;
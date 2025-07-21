// src/paginas/ModoPalco.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../api';
import { useNotificacao } from '../contextos/NotificationContext';
import { 
    Box, Typography, CircularProgress, IconButton, Paper, Chip, useTheme, Button, Container, 
    Dialog, DialogTitle, DialogContent, DialogActions, AppBar, Toolbar 
} from '@mui/material';
import { 
    ArrowBackIos, ArrowForwardIos, Close as CloseIcon,
    PlayArrow as PlayIcon, Pause as PauseIcon, Add as AddIcon, Remove as RemoveIcon,
    Fullscreen as FullscreenIcon, FullscreenExit as FullscreenExitIcon,
    Notes as NotesIcon,
    ZoomIn as ZoomInIcon, ZoomOut as ZoomOutIcon
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
  const { mostrarNotificacao } = useNotificacao();

  const [setlist, setSetlist] = useState(null);
  const [indiceAtual, setIndiceAtual] = useState(0);
  const [carregando, setCarregando] = useState(true);
  
  const [isScrolling, setIsScrolling] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(90);
  const letraRef = useRef(null);
  const scrollAnimationRef = useRef();

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fontSize, setFontSize] = useState(1.8);

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

  // --- NOVA LÓGICA ADICIONADA AQUI ---
  // Este useEffect garante que, ao sair do componente, a tela cheia seja desativada.
  useEffect(() => {
    // A função de retorno (cleanup) é executada quando o componente é desmontado
    return () => {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
    };
  }, []); // O array vazio [] significa que este efeito só corre na montagem e desmontagem

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
      if (event.key === 'ArrowRight') irParaProxima();
      else if (event.key === 'ArrowLeft') irParaAnterior();
      else if (event.key === 'Escape') navigate(`/setlists`);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [irParaProxima, irParaAnterior, navigate]);
  
  useEffect(() => {
    if (letraRef.current) {
        letraRef.current.scrollTop = 0;
    }
    setIsScrolling(false);
  }, [indiceAtual]);

  useEffect(() => {
    const element = letraRef.current;
    if (!isScrolling || !element) {
        clearTimeout(scrollAnimationRef.current);
        return;
    }
    const step = () => {
      element.scrollTop += 1;
      if (element.scrollTop < element.scrollHeight - element.clientHeight) {
        scrollAnimationRef.current = setTimeout(step, scrollSpeed);
      } else {
        setIsScrolling(false);
        mostrarNotificacao('Fim da música', 'info');
      }
    };
    scrollAnimationRef.current = setTimeout(step, scrollSpeed);
    return () => clearTimeout(scrollAnimationRef.current);
  }, [isScrolling, scrollSpeed, mostrarNotificacao]);

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
      bgcolor: '#000', color: '#FFF', display: 'flex', flexDirection: 'column'
    }}>
      <AppBar sx={{ position: 'relative', bgcolor: 'background.paper' }}>
          <Toolbar>
            <Box sx={{ flex: 1, textAlign: 'left', display: 'flex', alignItems: 'center' }}>
                <IconButton edge="start" color="inherit" onClick={() => navigate('/setlists')} aria-label="close"><CloseIcon /></IconButton>
                <Typography sx={{ ml: 2, display: { xs: 'none', sm: 'block' } }}>Música {indiceAtual + 1} de {setlist.musicas.length}</Typography>
            </Box>
            <Box sx={{ flex: 2, textAlign: 'center' }}>
              <Typography variant="h6">{musicaAtual.nome}</Typography>
              <Typography variant="body2" color="text.secondary">{musicaAtual.artista}</Typography>
            </Box>
            <Box sx={{ flex: 1, textAlign: 'right' }}>
                <IconButton color="inherit" onClick={handleToggleFullscreen}>
                    {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
                </IconButton>
            </Box>
          </Toolbar>
        </AppBar>
        
        <Box 
            ref={letraRef}
            sx={{ 
                flexGrow: 1, 
                overflowY: 'auto', 
                p: {xs: 2, md: 4},
                pb: '80px',
                '&::-webkit-scrollbar': { display: 'none' }, 
                scrollbarWidth: 'none' 
            }}
        >
            <Container maxWidth="md">
                <Typography sx={{ 
                    fontSize: { xs: `${fontSize * 0.7}rem`, md: `${fontSize}rem` }, 
                    lineHeight: 2, 
                    fontFamily: 'monospace', 
                    textAlign: 'center', 
                    whiteSpace: 'pre-wrap',
                    transition: 'font-size 0.2s ease-in-out'
                }}>
                    {formatarCifra(musicaAtual.notas_adicionais, theme)}
                </Typography>
            </Container>
        </Box>
      
      <IconButton onClick={irParaAnterior} sx={{ position: 'fixed', left: {xs: 4, md: 16}, top: '50%', transform: 'translateY(-50%)', zIndex: 10, bgcolor: 'rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}><ArrowBackIos /></IconButton>
      <IconButton onClick={irParaProxima} sx={{ position: 'fixed', right: {xs: 4, md: 16}, top: '50%', transform: 'translateY(-50%)', zIndex: 10, bgcolor: 'rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}><ArrowForwardIos /></IconButton>
      
      <Paper sx={{ 
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center', 
            alignItems: 'center', 
            p: 1, 
            bgcolor: 'background.paper',
            borderTop: '1px solid',
            borderColor: 'divider',
            zIndex: 10
        }}>
            <Box sx={{ display: 'flex', alignItems: 'center', position: 'absolute', left: 16 }}>
                <IconButton onClick={() => setFontSize(s => Math.max(1, s - 0.1))}><ZoomOutIcon /></IconButton>
                <IconButton onClick={() => setFontSize(s => Math.min(4, s + 0.1))}><ZoomInIcon /></IconButton>
            </Box>
            
            <Typography sx={{ flexGrow: 1, textAlign: 'right', display: {xs: 'none', sm: 'block'} }}>Velocidade:</Typography>
            <IconButton onClick={() => setScrollSpeed(s => s + 10)}><RemoveIcon /></IconButton>
            <IconButton onClick={() => setIsScrolling(!isScrolling)} color="secondary" size="large">
                {isScrolling ? <PauseIcon fontSize="large" /> : <PlayIcon fontSize="large" />}
            </IconButton>
            <IconButton onClick={() => setScrollSpeed(s => Math.max(10, s - 10))}><AddIcon /></IconButton>
            <Box sx={{ flexGrow: 1 }} />
      </Paper>
    </Box>
  );
}

export default ModoPalco;
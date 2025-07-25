// src/paginas/ModoPalco.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../apiClient';
import { useNotificacao } from '../contextos/NotificationContext';
import {
    Box, Typography, CircularProgress, IconButton, Paper, useTheme, Button, Container,
    AppBar, Toolbar, Drawer, List, ListItem, ListItemButton, ListItemText, Divider, Tooltip
} from '@mui/material';
import {
    ArrowBackIos, ArrowForwardIos, Close as CloseIcon,
    PlayArrow as PlayIcon, Pause as PauseIcon, Add as AddIcon, Remove as RemoveIcon,
    Fullscreen as FullscreenIcon, FullscreenExit as FullscreenExitIcon,
    ZoomIn as ZoomInIcon, ZoomOut as ZoomOutIcon,
    PlaylistPlay as PlaylistPlayIcon,
    MusicOff as MusicOffIcon,
    SkipNext as SkipNextIcon,
    RemoveCircleOutline as TransposeDownIcon,
    AddCircleOutline as TransposeUpIcon,
} from '@mui/icons-material';

// --- Lógica de Transposição Robusta (sem alterações) ---
const ALL_NOTES = [
    { sharp: 'A', flat: 'A' }, { sharp: 'A#', flat: 'Bb' }, { sharp: 'B', flat: 'B' },
    { sharp: 'C', flat: 'C' }, { sharp: 'C#', flat: 'Db' }, { sharp: 'D', flat: 'D' },
    { sharp: 'D#', flat: 'Eb' }, { sharp: 'E', flat: 'E' }, { sharp: 'F', flat: 'F' },
    { sharp: 'F#', flat: 'Gb' }, { sharp: 'G', flat: 'G' }, { sharp: 'G#', flat: 'Ab' }
];

const getNoteIndex = (note) => {
    const normalizedNote = note.length > 1 
        ? note.charAt(0).toUpperCase() + note.charAt(1).toLowerCase() 
        : note.toUpperCase();
    for (let i = 0; i < ALL_NOTES.length; i++) {
        if (ALL_NOTES[i].sharp === normalizedNote || ALL_NOTES[i].flat === normalizedNote) {
            return i;
        }
    }
    return -1;
};

const transposeNote = (note, amount) => {
    const index = getNoteIndex(note);
    if (index === -1) return note; 
    const newIndex = (index + amount + ALL_NOTES.length) % ALL_NOTES.length;
    const newNote = ALL_NOTES[newIndex];
    if (newNote.sharp === newNote.flat) return newNote.sharp;
    return note.includes('b') ? newNote.flat : newNote.sharp;
};

const transposeChord = (chord, amount) => {
    if (!chord || amount === 0) return chord;
    const match = chord.match(/^([A-G][#b]?)(.*)/);
    if (!match) return chord;
    const note = match[1];
    const rest = match[2];
    const transposedNote = transposeNote(note, amount);
    return transposedNote + rest;
};


// --- FUNÇÃO DE FORMATAR CIFRA COM REGEX MELHORADO ---
const formatarCifra = (textoCifra, theme, fontSize, transposicao) => {
    if (!textoCifra) return <Typography sx={{ fontSize: { xs: `${fontSize * 0.7}rem`, md: `${fontSize}rem` } }}>Nenhuma cifra ou letra adicionada.</Typography>;
    
    // Regex mais rigorosa para identificar uma linha que consiste APENAS de acordes e espaços.
    const regexLinhaDeAcordes = /^\s*([A-G][#b]?(?:m|maj|min|dim|aug|sus|add)?[0-9b#]*(?:\/[A-G][#b]?)?\s*)+$/i;

    return textoCifra.split('\n').map((linha, index) => {
        const isLinhaDeAcordes = regexLinhaDeAcordes.test(linha.trim());
        
        let linhaProcessada = linha;
        if (isLinhaDeAcordes && transposicao !== 0) {
            // Regex para encontrar CADA acorde individualmente na linha
            const regexAcordeIndividual = /[A-G][#b]?(?:m|maj|min|dim|aug|add|sus)?[0-9b#()\[\]]*(?:\/[A-G][#b]?)?/g;
            linhaProcessada = linha.replace(regexAcordeIndividual, (acordeEncontrado) => {
                // Apenas transpõe se for um acorde válido (ignora espaços vazios)
                if (acordeEncontrado.trim() === '') return acordeEncontrado;
                return transposeChord(acordeEncontrado, transposicao);
            });
        }

        return (
            <Typography key={index} component="span" sx={{
                display: 'block',
                fontSize: { xs: `${fontSize * 0.7}rem`, md: `${fontSize}rem` },
                color: isLinhaDeAcordes ? theme.palette.secondary.main : 'inherit',
                fontWeight: isLinhaDeAcordes ? 'bold' : 'normal',
                transition: 'font-size 0.2s ease-in-out'
            }}>
                {linhaProcessada || <br />}
            </Typography>
        );
    });
};

function ModoPalco() {
  // O resto do componente permanece o mesmo...
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const { mostrarNotificacao } = useNotificacao();

  const [setlist, setSetlist] = useState(null);
  const [indiceAtual, setIndiceAtual] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [isScrolling, setIsScrolling] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(90);
  const [fontSize, setFontSize] = useState(1.8);
  const [countdown, setCountdown] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [transposicao, setTransposicao] = useState(0);
  const [navAberta, setNavAberta] = useState(false);
  const [avancoAutomatico, setAvancoAutomatico] = useState(false);

  const letraRef = useRef(null);
  const scrollAnimationRef = useRef();
  const countdownIntervalRef = useRef();
  
  const handleSair = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
    navigate('/setlists');
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
    return () => { if (document.fullscreenElement) document.exitFullscreen(); };
  }, []);

  const buscarSetlist = useCallback(async () => {
      try {
        const resposta = await apiClient.get(`/api/setlists/${id}`);
        setSetlist(resposta.data);
      } catch (error) {
        mostrarNotificacao("Erro ao carregar setlist.", "error");
        navigate('/setlists');
      } finally {
        setCarregando(false);
      }
  }, [id, navigate, mostrarNotificacao]);

  useEffect(() => {
    buscarSetlist();
  }, [buscarSetlist]);

  const irParaMusica = useCallback((novoIndice) => {
    if (!setlist) return;
    setIndiceAtual(novoIndice);
    setTransposicao(0);
  }, [setlist]);

  const irParaProxima = useCallback(() => {
    if (!setlist) return;
    irParaMusica((indiceAtual + 1) % setlist.musicas.length);
  }, [setlist, indiceAtual, irParaMusica]);

  const irParaAnterior = useCallback(() => {
    if (!setlist) return;
    irParaMusica((indiceAtual - 1 + setlist.musicas.length) % setlist.musicas.length);
  }, [setlist, indiceAtual, irParaMusica]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'ArrowRight' || event.key === 'PageDown') irParaProxima();
      else if (event.key === 'ArrowLeft' || event.key === 'PageUp') irParaAnterior();
      else if (event.key === 'Escape') handleSair();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [irParaProxima, irParaAnterior, handleSair]);
  
  const iniciarContagemParaScroll = () => {
    clearInterval(countdownIntervalRef.current);
    setCountdown(3);
    let count = 3;
    countdownIntervalRef.current = setInterval(() => {
      count -= 1;
      setCountdown(count);
      if (count <= 0) {
        clearInterval(countdownIntervalRef.current);
        setCountdown(null);
        setIsScrolling(true);
      }
    }, 1000);
  };

  const handleToggleScroll = () => {
    clearInterval(countdownIntervalRef.current);
    setCountdown(null);
    setIsScrolling(prev => !prev);
  };

  useEffect(() => {
    const musicaAtual = setlist?.musicas?.[indiceAtual];
    if (musicaAtual) {
      if (musicaAtual.bpm) {
        const calculatedSpeed = Math.round(12000 / musicaAtual.bpm);
        setScrollSpeed(calculatedSpeed);
        mostrarNotificacao(`Velocidade sincronizada para ${musicaAtual.bpm} BPM`, 'info');
      } else {
        setScrollSpeed(90);
      }
      iniciarContagemParaScroll();
    }
    if (letraRef.current) letraRef.current.scrollTop = 0;
    
    return () => {
        setIsScrolling(false);
        clearInterval(countdownIntervalRef.current);
        clearTimeout(scrollAnimationRef.current);
    }
  }, [indiceAtual, setlist, mostrarNotificacao]);

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
        if (avancoAutomatico) {
            setTimeout(() => {
              irParaProxima();
            }, 2000);
        }
      }
    };
    scrollAnimationRef.current = setTimeout(step, scrollSpeed);
    return () => clearTimeout(scrollAnimationRef.current);
  }, [isScrolling, scrollSpeed, irParaProxima, avancoAutomatico]);


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
  const tomOriginal = musicaAtual.tom || 'N/A';
  const tomAtual = transposeChord(tomOriginal, transposicao);

  return (
    <Box sx={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      bgcolor: '#000', color: '#FFF', display: 'flex', flexDirection: 'column'
    }}>
      <AppBar sx={{ position: 'relative', bgcolor: 'background.paper' }}>
          <Toolbar>
            <Box sx={{ flex: 1, textAlign: 'left', display: 'flex', alignItems: 'center' }}>
                <IconButton edge="start" color="inherit" onClick={handleSair} aria-label="close"><CloseIcon /></IconButton>
                <Typography sx={{ ml: 2, display: { xs: 'none', sm: 'block' } }}>Música {indiceAtual + 1} de {setlist.musicas.length}</Typography>
            </Box>
            <Box sx={{ flex: 2, textAlign: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="h6" noWrap>{musicaAtual.nome}</Typography>
                <IconButton size="small" sx={{ ml: 1 }} onClick={() => setNavAberta(true)}><PlaylistPlayIcon /></IconButton>
              </Box>
              <Typography variant="body2" color="text.secondary" noWrap>
                {musicaAtual.artista} | Tom: {tomOriginal}{transposicao !== 0 && ` -> ${tomAtual}`}
              </Typography>
            </Box>
            <Box sx={{ flex: 1, textAlign: 'right' }}>
                <IconButton color="inherit" onClick={handleToggleFullscreen}>
                    {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
                </IconButton>
            </Box>
          </Toolbar>
        </AppBar>

      <Box ref={letraRef} sx={{
          position: 'relative', flexGrow: 1, overflowY: 'auto',
          pt: '45vh',
          pb: '50vh',
          px: {xs: 2, md: 4},
          '&::-webkit-scrollbar': { display: 'none' }, scrollbarWidth: 'none'
      }}>
          <Container maxWidth="md">
              <Box sx={{ lineHeight: 2, fontFamily: 'monospace', textAlign: 'center', whiteSpace: 'pre-wrap' }}>
                  {formatarCifra(musicaAtual.notas_adicionais, theme, fontSize, transposicao)}
              </Box>
          </Container>

          {countdown !== null && countdown > 0 && (
              <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, bgcolor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 20 }}>
                  <Typography sx={{ fontSize: {xs: '15rem', sm: '25rem'}, fontWeight: 'bold', color: 'white', animation: 'countdown-zoom 1s infinite' }}>
                      {countdown}
                  </Typography>
                  <style>{`@keyframes countdown-zoom { 0% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.1); opacity: 0.7; } 100% { transform: scale(1); opacity: 1; } }`}</style>
              </Box>
          )}
      </Box>

      <IconButton onClick={irParaAnterior} sx={{ position: 'fixed', left: {xs: 4, md: 16}, top: '50%', transform: 'translateY(-50%)', zIndex: 10, bgcolor: 'rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}><ArrowBackIos /></IconButton>
      <IconButton onClick={irParaProxima} sx={{ position: 'fixed', right: {xs: 4, md: 16}, top: '50%', transform: 'translateY(-50%)', zIndex: 10, bgcolor: 'rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}><ArrowForwardIos /></IconButton>

      <Paper sx={{
            position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex',
            justifyContent: 'space-between', alignItems: 'center',
            p: { xs: 0.5, sm: 1 }, bgcolor: 'background.paper',
            borderTop: '1px solid', borderColor: 'divider', zIndex: 10
        }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton onClick={() => setTransposicao(t => t - 1)}><TransposeDownIcon /></IconButton>
                <IconButton onClick={() => setTransposicao(t => t + 1)}><TransposeUpIcon /></IconButton>
                <IconButton onClick={() => setFontSize(s => Math.max(1, s - 0.1))}><ZoomOutIcon /></IconButton>
                <IconButton onClick={() => setFontSize(s => Math.min(4, s + 0.1))}><ZoomInIcon /></IconButton>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton onClick={() => setScrollSpeed(s => s + 10)}><RemoveIcon /></IconButton>
                <IconButton onClick={handleToggleScroll} color="secondary" size="large">
                    {isScrolling ? <PauseIcon sx={{ fontSize: '2.5rem' }} /> : <PlayIcon sx={{ fontSize: '2.5rem' }} />}
                </IconButton>
                <IconButton onClick={() => setScrollSpeed(s => Math.max(10, s - 10))}><AddIcon /></IconButton>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Tooltip title={avancoAutomatico ? "Avanço Automático LIGADO" : "Avanço Automático DESLIGADO"}>
                    <IconButton onClick={() => setAvancoAutomatico(a => !a)}>
                        {avancoAutomatico ? <SkipNextIcon /> : <MusicOffIcon />}
                    </IconButton>
                </Tooltip>
            </Box>
      </Paper>

      <Drawer anchor="right" open={navAberta} onClose={() => setNavAberta(false)}>
        <Box sx={{ width: 250, bgcolor: 'background.default', height: '100%' }} role="presentation">
            <Typography variant="h6" sx={{ p: 2 }}>Setlist</Typography>
            <Divider />
            <List>
                {(setlist?.musicas || []).map((musica, index) => (
                    <ListItem key={musica.id} disablePadding>
                        <ListItemButton
                            selected={indiceAtual === index}
                            onClick={() => { irParaMusica(index); setNavAberta(false); }}
                        >
                            <ListItemText primary={`${index + 1}. ${musica.nome}`} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Box>
      </Drawer>
    </Box>
  );
}

export default ModoPalco;
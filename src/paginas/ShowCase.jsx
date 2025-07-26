// src/paginas/ShowCase.jsx
import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import apiClient from '../apiClient';
import YouTube from 'react-youtube';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { FanAuthProvider, useFanAuth } from '../contextos/FanAuthContext';
import { useNotificacao } from '../contextos/NotificationContext';

import {
  Box, Typography, CircularProgress, Container, Paper, Avatar,
  Divider, List, ListItem, ListItemIcon, ListItemText, Button, Chip, IconButton, Tooltip, Link, Dialog
} from '@mui/material';
import {
  CalendarMonth as CalendarMonthIcon, MusicNote as MusicNoteIcon, Person as PersonIcon,
  EmojiEvents as EmojiEventsIcon, LibraryMusic as LibraryMusicIcon, Mic as MicIcon,
  Favorite as FavoriteIcon, Instagram, YouTube as YouTubeIcon, Announcement as AnnouncementIcon,
  Link as LinkIcon, ThumbUp, ThumbDown, PlaylistPlay as PlaylistPlayIcon
} from '@mui/icons-material';

import EnqueteShowcase from '../componentes/EnqueteShowcase';

// --- COMPONENTES INTERNOS DA PÁGINA ---

const LoginParaFas = () => {
    const { fa, loginFa, logoutFa } = useFanAuth();

    if (fa) {
        return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'rgba(0,0,0,0.5)', p: 0.5, borderRadius: 8 }}>
                <Avatar src={fa.foto_url} sx={{ width: 32, height: 32 }} />
                <Typography variant="body2" sx={{ color: 'white', display: { xs: 'none', sm: 'block' } }}>Olá, {fa.nome.split(' ')[0]}</Typography>
                <Button size="small" onClick={logoutFa} sx={{ color: 'white', textTransform: 'none' }}>Sair</Button>
            </Box>
        );
    }

    return (
        <GoogleLogin
            onSuccess={credentialResponse => {
                loginFa(credentialResponse.credential);
            }}
            onError={() => {
                console.error('Login com Google falhou');
            }}
            theme="filled_black"
            text="continue_with"
            shape="circle"
        />
    );
};

const SetlistDialog = ({ open, onClose, setlist }) => {
    const { fa } = useFanAuth();
    // No futuro, aqui entraria a lógica para saber quais músicas o fã já curtiu
    
    const handleLikeMusica = (musicaId) => {
        if (!fa) {
            alert('Faça login para curtir músicas!');
            return;
        }
        console.log(`Fã ${fa.id} curtiu a música ${musicaId}`);
        // Aqui viria a chamada à API: apiClient.post(`/api/vitrine/musicas/${musicaId}/like`);
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
            <Box sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>{setlist?.nome}</Typography>
                <Divider sx={{ mb: 1 }} />
                <List dense>
                    {(setlist?.musicas || []).map(musica => (
                        <ListItem key={musica.id} secondaryAction={
                            <Tooltip title="Curtir música">
                                <span>
                                    <IconButton size="small" onClick={() => handleLikeMusica(musica.id)} disabled={!fa}>
                                        <FavoriteIcon fontSize="small" />
                                    </IconButton>
                                </span>
                            </Tooltip>
                        }>
                            <ListItemText primary={musica.nome} secondary={musica.artista} />
                        </ListItem>
                    ))}
                </List>
                <Button onClick={onClose} sx={{ mt: 1 }}>Fechar</Button>
            </Box>
        </Dialog>
    );
};

const StatCard = ({ icon, value, label }) => (
    <Box sx={{ textAlign: 'center', flex: '1 1 0', minWidth: '90px', p: 1 }}>
        {icon}
        <Typography variant="h5" component="p" fontWeight="bold">{Number.isFinite(value) ? value : 0}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'uppercase', fontSize: '0.7rem' }}>{label}</Typography>
    </Box>
);

const VitrineHeader = ({ artista, estatisticas, handleAplaudir }) => {
    const { fa } = useFanAuth();
    // A lógica de aplauso agora verifica o estado do fã logado
    const [jaAplaudido, setJaAplaudido] = useState(false);
    
    // Simula a verificação se o fã já aplaudiu este artista
    useEffect(() => {
        if (fa && artista) {
            const aplausoGuardado = localStorage.getItem(`aplauso_${fa.id}_${artista.url_unica}`);
            setJaAplaudido(!!aplausoGuardado);
        } else {
            setJaAplaudido(true); // Desativa o botão se não estiver logado
        }
    }, [fa, artista]);

    let fotoUrlCompleta = null;
    if (artista.foto_url) {
        fotoUrlCompleta = artista.foto_url.startsWith('http')
        ? artista.foto_url
        : `${apiClient.defaults.baseURL}${artista.foto_url}`;
    }

    return (
        <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 4, position: 'relative', mt: -15, bgcolor: 'background.paper' }}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', gap: 3 }}>
                <Avatar src={fotoUrlCompleta} sx={{ width: { xs: 120, md: 160 }, height: { xs: 120, md: 160 }, fontSize: '4rem', border: '4px solid', borderColor: 'primary.main', boxShadow: 3 }}>
                    {artista.nome?.charAt(0).toUpperCase()}
                </Avatar>
                <Box sx={{ flexGrow: 1, width: '100%', textAlign: { xs: 'center', md: 'left' } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, justifyContent: {xs: 'center', md: 'flex-start'} }}>
                        <Typography variant="h3" component="h1" fontWeight="bold" sx={{ fontSize: { xs: '2.5rem', sm: '3rem' } }}>{artista.nome}</Typography>
                        <Tooltip title={!fa ? "Faça login para aplaudir" : (jaAplaudido ? "Você já aplaudiu!" : "Apoie este artista!")}>
                            <span>
                                <IconButton onClick={handleAplaudir} disabled={!fa || jaAplaudido} color={jaAplaudido ? "error" : "default"}><FavoriteIcon /></IconButton>
                            </span>
                        </Tooltip>
                        <Typography variant="h6" color="text.secondary">{artista.aplausos}</Typography>
                    </Box>
                    <Typography variant="body1" color="text.secondary" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>
                        {artista.biografia || 'Biografia ainda não preenchida.'}
                    </Typography>
                    <Box sx={{ mt: 2, display: 'flex', gap: 1, justifyContent: {xs: 'center', md: 'flex-start'} }}>
                        {artista.links_redes?.instagram && (<IconButton component="a" href={artista.links_redes.instagram} target="_blank" aria-label="Instagram"><Instagram /></IconButton>)}
                        {artista.links_redes?.youtube && (<IconButton component="a" href={artista.links_redes.youtube} target="_blank" aria-label="YouTube"><YouTubeIcon /></IconButton>)}
                        {artista.links_redes?.spotify && (<IconButton component="a" href={artista.links_redes.spotify} target="_blank" aria-label="Spotify"><MusicNoteIcon /></IconButton>)}
                    </Box>
                </Box>
                <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', md: 'block' }, mx: 2 }} />
                <Box sx={{ display: 'flex', flexDirection: { xs: 'row', md: 'column' }, justifyContent: 'space-around', width: { xs: '100%', md: 'auto' }, gap: 2, p: 2, borderRadius: 2, bgcolor: 'action.hover' }}>
                    <StatCard icon={<MicIcon color="primary" />} value={estatisticas?.shows} label="Shows"/>
                    <StatCard icon={<LibraryMusicIcon color="primary" />} value={estatisticas?.musicas} label="Músicas"/>
                    <StatCard icon={<EmojiEventsIcon color="primary" />} value={estatisticas?.conquistas} label="Conquistas"/>
                </Box>
            </Box>
        </Paper>
    );
};


const ShowCaseContent = () => {
  const { url_unica } = useParams();
  const [vitrine, setVitrine] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [dialogoSetlist, setDialogoSetlist] = useState({ open: false, setlist: null });
  const [indiceCapa, setIndiceCapa] = useState(0);
  const { fa } = useFanAuth();
  const { mostrarNotificacao } = useNotificacao();

  const getYoutubeVideoId = (url) => {
    if (!url) return null;
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const buscarDadosVitrine = useCallback(async () => {
      try {
        setCarregando(true);
        const { data } = await apiClient.get(`/api/vitrine/${url_unica}`);
        setVitrine(data);
        setErro('');
      } catch (err) {
        setErro(err.response?.data?.mensagem || 'Artista não encontrado.');
        setVitrine(null);
      } finally {
        setCarregando(false);
      }
  }, [url_unica]);

  useEffect(() => {
    if (url_unica) buscarDadosVitrine();
  }, [url_unica, buscarDadosVitrine]);
  
  const capas = vitrine?.artista?.foto_capa_url || [];
  useEffect(() => {
    if (capas.length > 1) {
      const timer = setInterval(() => {
        setIndiceCapa(prev => (prev + 1) % capas.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [capas.length]);
  
  const handleAplaudir = async () => {
    if (!fa) {
      mostrarNotificacao('Faça login como fã para aplaudir!', 'info');
      return;
    }
    const chaveAplauso = `aplauso_${fa.id}_${url_unica}`;
    if (localStorage.getItem(chaveAplauso)) return;
    
    // Atualização otimista
    setVitrine(prev => ({...prev, artista: {...prev.artista, aplausos: prev.artista.aplausos + 1}}));
    localStorage.setItem(chaveAplauso, 'true');

    try {
      await apiClient.post(`/api/vitrine/${url_unica}/aplaudir`);
    } catch (error) {
      mostrarNotificacao('Erro ao registar aplauso. Tente novamente.', 'error');
      // Reverte a UI em caso de erro
      localStorage.removeItem(chaveAplauso);
      buscarDadosVitrine();
    }
  };

  if (carregando) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><CircularProgress /></Box>;
  if (erro) return (
      <Container sx={{ textAlign: 'center', mt: 8 }}>
        <Typography variant="h4" color="error">{erro}</Typography>
        <Button component={RouterLink} to="/" variant="contained" sx={{ mt: 2 }}>Voltar</Button>
      </Container>
    );
  if (!vitrine) return null;

  const { artista, proximosShows, contatoPublico, postsRecentes, enqueteAtiva } = vitrine;
  const fallbackCapa = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80';
  const videoDestaqueId = getYoutubeVideoId(artista.video_destaque_url);

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      <Box sx={{ position: 'relative', height: { xs: '30vh', md: '50vh' }, bgcolor: '#000' }}>
        <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundImage: `url(${capas.length > 0 ? capas[0] : fallbackCapa})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
        {capas.map((url, index) => (
          <Box key={index} sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundImage: `url(${url})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: indiceCapa === index ? 1 : 0, transition: 'opacity 1.5s ease-in-out' }}/>
        ))}
        <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundImage: `linear-gradient(to top, rgba(18,18,18,1) 0%, rgba(18,18,18,0.2) 50%)` }} />
        <Container maxWidth="lg" sx={{ position: 'absolute', top: 16, right: 16, zIndex: 10, p: 0 }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <LoginParaFas />
            </Box>
        </Container>
      </Box>
      
      <Container maxWidth="lg" sx={{ pb: 5 }}>
        <VitrineHeader artista={artista} estatisticas={vitrine.estatisticas} handleAplaudir={handleAplaudir} />
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 4 }}>
          <Box sx={{ flex: '2 1 60%', display: 'flex', flexDirection: 'column', gap: 4, order: { xs: 2, lg: 1 } }}>
            {videoDestaqueId && (
              <Paper sx={{ p: {xs: 1, sm: 2}, aspectRatio: '16/9' }}>
                <YouTube videoId={videoDestaqueId} opts={{ height: '100%', width: '100%' }} style={{ width: '100%', height: '100%' }} />
              </Paper>
            )}
            {/* O componente de Posts precisa ser adaptado para a nova lógica de reações com login de fã */}
            {postsRecentes && postsRecentes.length > 0 && (
              <Paper sx={{ p: 3 }}>
                <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">Últimas Atualizações</Typography>
                {/* A lógica de PostsSection iria aqui */}
              </Paper>
            )}
          </Box>
          <Box sx={{ flex: '1 1 30%', display: 'flex', flexDirection: 'column', gap: 4, order: { xs: 1, lg: 2 } }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">Próximos Shows</Typography>
              {proximosShows && proximosShows.length > 0 ? (
                <List dense>
                  {proximosShows.map((show) => (
                    <ListItem key={show.id} disableGutters>
                      <ListItemIcon><CalendarMonthIcon color="primary" /></ListItemIcon>
                      <ListItemText 
                        primary={show.nome_evento} 
                        secondary={
                          <>
                            {new Date(show.data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}
                            {show.local && ` - ${show.local}`}
                            {show.setlist && (
                              <Button size="small" startIcon={<PlaylistPlayIcon />} sx={{ display: 'block', p: 0, mt: 0.5 }} onClick={() => setDialogoSetlist({ open: true, setlist: show.setlist })}>
                                Ver Setlist
                              </Button>
                            )}
                          </>
                        } 
                      />
                    </ListItem>
                  ))}
                </List>
              ) : ( <Typography color="text.secondary">Nenhum show agendado no momento.</Typography> )}
            </Paper>
            {enqueteAtiva && (<EnqueteShowcase enquete={enqueteAtiva} />)}
            {contatoPublico && (
              <Paper sx={{ p: 3 }}>
                <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">Contato</Typography>
                <Box>
                  <Chip icon={<PersonIcon />} label={contatoPublico.funcao || 'Contato Profissional'} color="primary" sx={{ mb: 2 }}/>
                  <Typography><strong>Nome:</strong> {contatoPublico.nome}</Typography>
                  {contatoPublico.email && <Typography><strong>Email:</strong> {contatoPublico.email}</Typography>}
                  {contatoPublico.telefone && <Typography><strong>Telefone:</strong> {contatoPublico.telefone}</Typography>}
                </Box>
              </Paper>
            )}
          </Box>
        </Box>
      </Container>
      <SetlistDialog open={dialogoSetlist.open} onClose={() => setDialogoSetlist({ open: false, setlist: null })} setlist={dialogoSetlist.setlist} />
    </Box>
  );
};


function ShowCase() {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    if (!clientId) {
        return <Typography color="error" sx={{ p: 4, textAlign: 'center' }}>A chave de API do Google (Client ID) não está configurada.</Typography>;
    }

    return (
        <GoogleOAuthProvider clientId={clientId}>
            <FanAuthProvider>
                <ShowCaseContent />
            </FanAuthProvider>
        </GoogleOAuthProvider>
    );
}

export default ShowCase;
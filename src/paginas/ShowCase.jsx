// src/paginas/ShowCase.jsx
import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import apiClient from '../apiClient';
import YouTube from 'react-youtube';

// Imports para autenticação de fãs
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { FanAuthProvider, useFanAuth } from '../contextos/FanAuthContext';
import { useNotificacao } from '../contextos/NotificationContext';
import useApi from '../hooks/useApi';

// Imports do Material-UI
import {
  Box, Typography, CircularProgress, Container, Paper, Avatar,
  Divider, List, ListItem, ListItemIcon, ListItemText, Button, Chip, IconButton, Tooltip, Link, Dialog
} from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import PersonIcon from '@mui/icons-material/Person';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import LibraryMusicIcon from '@mui/icons-material/LibraryMusic';
import MicIcon from '@mui/icons-material/Mic';
import FavoriteIcon from '@mui/icons-material/Favorite';
import Instagram from '@mui/icons-material/Instagram';
import YouTubeIcon from '@mui/icons-material/YouTube';
import AnnouncementIcon from '@mui/icons-material/Announcement';
import LinkIcon from '@mui/icons-material/Link';
import ThumbUp from '@mui/icons-material/ThumbUp';
import ThumbDown from '@mui/icons-material/ThumbDown';
import PlaylistPlayIcon from '@mui/icons-material/PlaylistPlay';

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

// --- ALTERAÇÃO 2: ESTADO DOS "GOSTOS" É RECEBIDO POR PROPS ---
const SetlistDialog = ({ open, onClose, setlist, musicasCurtidas, onLikeMusica }) => {
    const { fa } = useFanAuth();
    const { mostrarNotificacao } = useNotificacao();
    
    const handleLikeClick = (musicaId) => {
        if (!fa) {
            mostrarNotificacao('Faça login como fã para curtir músicas!', 'info');
            return;
        }
        onLikeMusica(musicaId); // Chama a função do componente pai
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
                                    <IconButton size="small" onClick={() => handleLikeClick(musica.id)} disabled={!fa}>
                                        <FavoriteIcon fontSize="small" color={musicasCurtidas.has(musica.id) ? 'error' : 'action'} />
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

const VitrineHeader = ({ artista, estatisticas, handleAplaudir, jaAplaudido }) => {
    const { fa } = useFanAuth();
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
                                <IconButton onClick={handleAplaudir} disabled={!fa || jaAplaudido} sx={{ fontSize: '1.5rem', filter: jaAplaudido ? 'grayscale(100%)' : 'none', transform: jaAplaudido ? 'scale(1.1)' : 'scale(1)', transition: 'transform 0.2s, filter 0.2s' }}>
                                  👏
                                </IconButton>
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

const PostsSection = ({ posts, handleReacao }) => {
    const { fa } = useFanAuth();
    const { mostrarNotificacao } = useNotificacao();
    const [reacoes, setReacoes] = useState({});

    useEffect(() => {
        const reacoesGuardadas = {};
        if (posts) {
            posts.forEach(post => {
                const reacao = localStorage.getItem(`reacao_post_${post.id}`);
                if (reacao) reacoesGuardadas[post.id] = reacao;
            });
        }
        setReacoes(reacoesGuardadas);
    }, [posts]);

    const onReacaoClick = (postId, tipo) => {
        if (!fa) {
            mostrarNotificacao('Faça login como fã para reagir!', 'info');
            return;
        }
        handleReacao(postId, tipo);
        setReacoes(prev => ({...prev, [postId]: tipo}));
    };

    return (
        <Paper sx={{ p: 3 }}>
            <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">Últimas Atualizações</Typography>
            <List>{posts.map(post => {
                const reacaoDoUtilizador = reacoes[post.id];
                const dataPost = post.created_at ? new Date(post.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' }) : null;

                return (
                    <ListItem key={post.id} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', py: 2, '&:not(:last-child)': { borderBottom: '1px solid', borderColor: 'divider' } }} disablePadding>
                        <Box sx={{ display: 'flex', width: '100%' }}>
                            <ListItemIcon sx={{ minWidth: 40, mt: 0.5 }}><AnnouncementIcon color="primary" /></ListItemIcon>
                            <ListItemText primary={post.content} />
                        </Box>
                        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1, pl: '40px' }}>
                             {post.link ? (
                                <Link href={post.link} target="_blank" rel="noopener noreferrer" sx={{display: 'flex', alignItems: 'center', fontSize: '0.875rem'}}>
                                    <LinkIcon fontSize="small" sx={{mr: 0.5}}/> Ver mais
                                </Link>
                            ) : (
                                <Typography variant="caption" color="text.secondary">{dataPost || ''}</Typography>
                            )}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Tooltip title="Gostei"><span><IconButton size="small" onClick={() => onReacaoClick(post.id, 'like')} disabled={!!reacaoDoUtilizador}><ThumbUp fontSize="small" color={reacaoDoUtilizador === 'like' ? 'primary' : 'inherit'} /></IconButton></span></Tooltip>
                                <Typography variant="body2">{post.likes}</Typography>
                                <Tooltip title="Não gostei"><span><IconButton size="small" onClick={() => onReacaoClick(post.id, 'dislike')} disabled={!!reacaoDoUtilizador}><ThumbDown fontSize="small" color={reacaoDoUtilizador === 'dislike' ? 'error' : 'inherit'} /></IconButton></span></Tooltip>
                                <Typography variant="body2">{post.dislikes}</Typography>
                            </Box>
                        </Box>
                    </ListItem>
                );
            })}</List>
        </Paper>
    );
};

const RankingFas = ({ url_unica }) => {
    const { data: ranking, carregando } = useApi(`/api/vitrine/${url_unica}/ranking`);
    
    return (
        <Paper sx={{ p: 3 }}>
            <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">Ranking de Fãs</Typography>
            {carregando ? <CircularProgress size={24} /> : (
                <List dense>
                    {(ranking || []).map((fa, index) => (
                        <ListItem key={fa.fa_id}>
                            <ListItemIcon>
                                <Avatar src={fa.fa.foto_url} sx={{ width: 24, height: 24, mr: 1 }} />
                            </ListItemIcon>
                            <ListItemText primary={`${index + 1}. ${fa.fa.nome}`} />
                            <Chip label={`${fa.total_pontos} pts`} color="primary" size="small" />
                        </ListItem>
                    ))}
                </List>
            )}
        </Paper>
    );
};

const MusicasMaisCurtidas = ({ url_unica }) => {
    const { data: musicas, carregando } = useApi(`/api/vitrine/${url_unica}/musicas-curtidas`);

    return (
        <Paper sx={{ p: 3 }}>
            <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">Músicas Favoritas dos Fãs</Typography>
            {carregando ? <CircularProgress size={24} /> : (
                <List dense>
                    {(musicas || []).map((musica) => (
                        <ListItem key={musica.musica_id}>
                            <ListItemIcon><MusicNoteIcon color="secondary" /></ListItemIcon>
                            <ListItemText primary={musica.musica.nome} secondary={musica.musica.artista} />
                            <Chip icon={<FavoriteIcon />} label={musica.total_likes} size="small" variant="outlined" />
                        </ListItem>
                    ))}
                </List>
            )}
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
  const [jaAplaudido, setJaAplaudido] = useState(false);
  const [musicasCurtidas, setMusicasCurtidas] = useState(new Set()); // Estado para as músicas curtidas

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

  useEffect(() => {
    if (fa && url_unica) {
      const aplausoGuardado = localStorage.getItem(`aplauso_${fa.id}_${url_unica}`);
      setJaAplaudido(!!aplausoGuardado);
    }
  }, [fa, url_unica]);
  
  const capas = vitrine?.artista?.foto_capa_url || [];
  useEffect(() => {
    if (capas.length > 1) {
      const timer = setInterval(() => {
        setIndiceCapa(prev => (prev + 1) % capas.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [capas.length]);
  
  const handleAplaudir = async () => { /* ... código sem alterações ... */ };
  const handleReacao = async (postId, tipo) => { /* ... código sem alterações ... */ };

  // --- ALTERAÇÃO 2: LÓGICA DE "GOSTOS" AGORA VIVE AQUI ---
  const handleLikeMusica = async (musicaId) => {
    const jaCurtiu = musicasCurtidas.has(musicaId);
    setMusicasCurtidas(prev => {
        const novoSet = new Set(prev);
        jaCurtiu ? novoSet.delete(musicaId) : novoSet.add(musicaId);
        return novoSet;
    });

    try {
        await apiClient.post(`/api/vitrine/musicas/${musicaId}/like`);
    } catch (error) {
        mostrarNotificacao('Erro ao registar o seu gosto.', 'error');
        setMusicasCurtidas(prev => {
            const novoSet = new Set(prev);
            jaCurtiu ? novoSet.add(musicaId) : novoSet.delete(musicaId);
            return novoSet;
        });
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

  // --- ALTERAÇÃO 1: CORRIGE A DESESTRUTURAÇÃO DAS ESTATÍSTICAS ---
  const { artista, proximosShows, contatoPublico, postsRecentes, enqueteAtiva, estatisticas } = vitrine;
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
        <VitrineHeader artista={artista} estatisticas={estatisticas} handleAplaudir={handleAplaudir} jaAplaudido={jaAplaudido} />
        
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 4 }}>
          <Box sx={{ flex: '2 1 60%', display: 'flex', flexDirection: 'column', gap: 4, order: { xs: 2, lg: 1 } }}>
            {videoDestaqueId && (
              <Paper sx={{ p: {xs: 1, sm: 2}, aspectRatio: '16/9' }}>
                <YouTube videoId={videoDestaqueId} opts={{ height: '100%', width: '100%' }} style={{ width: '100%', height: '100%' }} />
              </Paper>
            )}
            
            {postsRecentes && postsRecentes.length > 0 && (
              <PostsSection posts={postsRecentes} handleReacao={handleReacao} />
            )}
            
            {enqueteAtiva && (<EnqueteShowcase enquete={enqueteAtiva} />)}
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

            <RankingFas url_unica={url_unica} />
            <MusicasMaisCurtidas url_unica={url_unica} />

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
      <SetlistDialog 
        open={dialogoSetlist.open} 
        onClose={() => setDialogoSetlist({ open: false, setlist: null })}
        setlist={dialogoSetlist.setlist}
        musicasCurtidas={musicasCurtidas}
        onLikeMusica={handleLikeMusica}
      />
    </Box>
  );
};

function ShowCase() {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) { return <Typography color="error" sx={{ p: 4, textAlign: 'center' }}>A chave de API do Google (Client ID) não está configurada.</Typography>; }
    return (
        <GoogleOAuthProvider clientId={clientId}>
            <FanAuthProvider>
                <ShowCaseContent />
            </FanAuthProvider>
        </GoogleOAuthProvider>
    );
}

export default ShowCase;
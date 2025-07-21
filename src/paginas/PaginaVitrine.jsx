// src/paginas/PaginaVitrine.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import apiClient from '../api';
import {
  Box, Typography, CircularProgress, Container, Paper, Avatar,
  Grid, Divider, List, ListItem, ListItemIcon, ListItemText, Button, Chip, IconButton, Tooltip, Link
} from '@mui/material';
import {
  CalendarMonth as CalendarMonthIcon,
  MusicNote as MusicNoteIcon,
  Person as PersonIcon,
  EmojiEvents as EmojiEventsIcon,
  LibraryMusic as LibraryMusicIcon,
  Mic as MicIcon,
  Star as StarIcon,
  Favorite as FavoriteIcon,
  Instagram,
  YouTube,
  Announcement as AnnouncementIcon,
  Link as LinkIcon,
  ThumbUp,
  ThumbDown
} from '@mui/icons-material';

// --- COMPONENTES INTERNOS PARA MELHORAR A ORGANIZAÇÃO ---

const VitrineHeader = ({ artista, jaAplaudido, totalAplausos, handleAplaudir }) => {
    let fotoUrlCompleta = null;
    if (artista.foto_url) {
        fotoUrlCompleta = artista.foto_url.startsWith('http')
        ? artista.foto_url
        : `${apiClient.defaults.baseURL}${artista.foto_url}`;
    }

    return (
        <Paper sx={{ p: { xs: 2, sm: 4 }, mb: 4, position: 'relative', mt: -12, bgcolor: 'background.paper' }}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', gap: 4 }}>
                <Avatar 
                    src={fotoUrlCompleta} 
                    sx={{ 
                        width: 150, 
                        height: 150, 
                        fontSize: '4rem', 
                        border: '4px solid', 
                        borderColor: 'primary.main' 
                    }}
                >
                    {artista.nome?.charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1}}>
                        <Typography variant="h3" component="h1" fontWeight="bold">{artista.nome}</Typography>
                        <Tooltip title={jaAplaudido ? "Você já aplaudiu!" : "Apoie este artista!"}>
                            <span>
                                <IconButton onClick={handleAplaudir} disabled={jaAplaudido} color={jaAplaudido ? "error" : "default"}><FavoriteIcon /></IconButton>
                            </span>
                        </Tooltip>
                        <Typography variant="h6" color="text.secondary">{totalAplausos}</Typography>
                    </Box>
                    <Typography variant="body1" color="text.secondary" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>
                        {artista.biografia || 'Biografia ainda não preenchida.'}
                    </Typography>
                    <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                        {artista.links_redes?.instagram && (<IconButton component="a" href={artista.links_redes.instagram} target="_blank" aria-label="Instagram"><Instagram /></IconButton>)}
                        {artista.links_redes?.youtube && (<IconButton component="a" href={artista.links_redes.youtube} target="_blank" aria-label="YouTube"><YouTube /></IconButton>)}
                        {artista.links_redes?.spotify && (<IconButton component="a" href={artista.links_redes.spotify} target="_blank" aria-label="Spotify"><MusicNote /></IconButton>)}
                    </Box>
                </Box>
            </Box>
        </Paper>
    );
};

const StatCard = ({ icon, value, label }) => (
    <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', height: '100%' }}>
        {icon}
        <Typography variant="h4" component="p" fontWeight="bold">{Number.isFinite(value) ? value : 0}</Typography>
        <Typography variant="body2" color="text.secondary">{label}</Typography>
    </Paper>
);

const StatsSection = ({ estatisticas }) => (
    <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}><StatCard icon={<MicIcon color="primary" sx={{fontSize: 40}} />} value={estatisticas?.shows} label="Shows Realizados"/></Grid>
        <Grid item xs={12} sm={4}><StatCard icon={<LibraryMusicIcon color="primary" sx={{fontSize: 40}} />} value={estatisticas?.musicas} label="Músicas no Repertório"/></Grid>
        <Grid item xs={12} sm={4}><StatCard icon={<EmojiEventsIcon color="primary" sx={{fontSize: 40}} />} value={estatisticas?.conquistas} label="Conquistas Desbloqueadas"/></Grid>
    </Grid>
);

const PostsSection = ({ posts, reacoes, handleReacao }) => (
    <Paper sx={{ p: 3 }}>
        <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">Últimas Atualizações</Typography>
        <List>{posts.map(post => {
            const reacaoDoUtilizador = reacoes[post.id];
            return (
                <ListItem key={post.id} disablePadding sx={{ py: 1 }} secondaryAction={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Tooltip title="Gostei"><span><IconButton size="small" onClick={() => handleReacao(post.id, 'like')} disabled={!!reacaoDoUtilizador}><ThumbUp fontSize="small" color={reacaoDoUtilizador === 'like' ? 'primary' : 'inherit'} /></IconButton></span></Tooltip>
                        <Typography variant="body2">{post.likes}</Typography>
                        <Tooltip title="Não gostei"><span><IconButton size="small" onClick={() => handleReacao(post.id, 'dislike')} disabled={!!reacaoDoUtilizador}><ThumbDown fontSize="small" color={reacaoDoUtilizador === 'dislike' ? 'error' : 'inherit'} /></IconButton></span></Tooltip>
                        <Typography variant="body2">{post.dislikes}</Typography>
                    </Box>
                }>
                    <ListItemIcon><AnnouncementIcon color="primary" /></ListItemIcon>
                    <ListItemText primary={post.content} secondary={post.link ? (<Link href={post.link} target="_blank" rel="noopener noreferrer" sx={{display: 'flex', alignItems: 'center', mt: 0.5}}><LinkIcon fontSize="small" sx={{mr: 0.5}}/> Ver mais</Link>) : new Date(post.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}/>
                </ListItem>
            );
        })}</List>
    </Paper>
);

function PaginaVitrine() {
  const { url_unica } = useParams();
  const [vitrine, setVitrine] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [jaAplaudido, setJaAplaudido] = useState(false);
  const [totalAplausos, setTotalAplausos] = useState(0);
  const [reacoesPosts, setReacoesPosts] = useState({});

  useEffect(() => {
    const buscarDadosVitrine = async () => {
      try {
        setCarregando(true);
        const { data } = await apiClient.get(`/api/vitrine/${url_unica}`);
        setVitrine(data);
        setTotalAplausos(data.artista.aplausos || 0);
        if (localStorage.getItem(`aplauso_${url_unica}`)) {
          setJaAplaudido(true);
        }
        const reacoesGuardadas = {};
        if (data.postsRecentes) {
            data.postsRecentes.forEach(post => {
                const reacao = localStorage.getItem(`reacao_post_${post.id}`);
                if (reacao) reacoesGuardadas[post.id] = reacao;
            });
        }
        setReacoesPosts(reacoesGuardadas);
        setErro('');
      } catch (err) {
        setErro(err.response?.data?.mensagem || 'Artista não encontrado.');
        setVitrine(null);
      } finally {
        setCarregando(false);
      }
    };
    if (url_unica) buscarDadosVitrine();
  }, [url_unica]);

  const handleAplaudir = async () => {
      if (jaAplaudido) return;
      try {
          setTotalAplausos(prev => prev + 1);
          setJaAplaudido(true);
          localStorage.setItem(`aplauso_${url_unica}`, 'true');
          await apiClient.post(`/api/vitrine/${url_unica}/aplaudir`);
      } catch (error) {
          console.error("Erro ao registar aplauso", error);
          setTotalAplausos(prev => prev - 1);
          setJaAplaudido(false);
          localStorage.removeItem(`aplauso_${url_unica}`);
      }
  };
  
  const handleReacao = async (postId, tipo) => {
      if (reacoesPosts[postId]) return;

      setVitrine(prev => ({
          ...prev,
          postsRecentes: prev.postsRecentes.map(p => 
              p.id === postId ? { ...p, [tipo === 'like' ? 'likes' : 'dislikes']: p[tipo === 'like' ? 'likes' : 'dislikes'] + 1 } : p
          )
      }));
      setReacoesPosts(prev => ({ ...prev, [postId]: tipo }));
      localStorage.setItem(`reacao_post_${postId}`, tipo);

      try {
          await apiClient.post(`/api/vitrine/posts/${postId}/reacao`, { tipo });
      } catch (error) {
          console.error("Erro ao registar reação:", error);
          setReacoesPosts(prev => {
              const novo = { ...prev };
              delete novo[postId];
              return novo;
          });
          localStorage.removeItem(`reacao_post_${postId}`);
      }
  };

  if (carregando) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><CircularProgress /></Box>;
  }

  if (erro) {
    return (
      <Container sx={{ textAlign: 'center', mt: 8 }}>
        <Typography variant="h4" color="error">{erro}</Typography>
        <Button component={RouterLink} to="/" variant="contained" sx={{ mt: 2 }}>Voltar</Button>
      </Container>
    );
  }

  if (!vitrine) return null;

  const { artista, proximosShows, contatoPublico, setlistPublico, musicasPopulares, estatisticas, postsRecentes } = vitrine;

  const urlFotoCapa = artista.foto_capa_url || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80';
  const videoDestaqueId = artista.video_destaque_url || null;

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
        <Box sx={{
            height: '40vh',
            backgroundImage: `linear-gradient(to top, rgba(18,18,18,1) 0%, rgba(18,18,18,0) 50%), url(${urlFotoCapa})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
        }}/>
        <Container maxWidth="lg" sx={{ pb: 5 }}>
            <VitrineHeader artista={artista} jaAplaudido={jaAplaudido} totalAplausos={totalAplausos} handleAplaudir={handleAplaudir} />
            
            <StatsSection estatisticas={estatisticas} />

            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
                <Box sx={{ flex: '2 1 60%', display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {videoDestaqueId && (
                        <Paper sx={{ p: 2, aspectRatio: '16/9' }}>
                            <iframe
                                width="100%"
                                height="100%"
                                src={`https://www.youtube.com/embed/${videoDestaqueId}`}
                                title="YouTube video player"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        </Paper>
                    )}
                    {postsRecentes && postsRecentes.length > 0 && (
                        <PostsSection posts={postsRecentes} reacoes={reacoesPosts} handleReacao={handleReacao} />
                    )}
                </Box>
                <Box sx={{ flex: '1 1 30%', display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">Próximos Shows</Typography>
                        {proximosShows && proximosShows.length > 0 ? (
                            <List dense>{proximosShows.map((show, index) => (<ListItem key={index} disableGutters><ListItemIcon><CalendarMonthIcon color="primary" /></ListItemIcon><ListItemText primary={show.nome_evento} secondary={<>{new Date(show.data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}{show.local && ` - ${show.local}`}</>} /></ListItem>))}</List>
                        ) : ( <Typography color="text.secondary">Nenhum show agendado no momento.</Typography> )}
                    </Paper>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">Contato</Typography>
                        {contatoPublico ? (
                            <Box>
                            <Chip icon={<PersonIcon />} label={contatoPublico.funcao || 'Contato Profissional'} color="primary" sx={{ mb: 2 }}/>
                            <Typography><strong>Nome:</strong> {contatoPublico.nome}</Typography>
                            {contatoPublico.email && <Typography><strong>Email:</strong> {contatoPublico.email}</Typography>}
                            {contatoPublico.telefone && <Typography><strong>Telefone:</strong> {contatoPublico.telefone}</Typography>}
                            </Box>
                        ) : ( <Typography color="text.secondary">Informações de contato não disponíveis.</Typography> )}
                    </Paper>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">Top 5 Músicas</Typography>
                         {musicasPopulares && musicasPopulares.length > 0 ? (
                            <List dense>{musicasPopulares.map((musica, index) => (<ListItem key={index} disableGutters><ListItemIcon><StarIcon sx={{color: '#FFD700'}}/></ListItemIcon><ListItemText primary={musica.nome} secondary={musica.artista}/></ListItem>))}</List>
                        ) : ( <Typography color="text.secondary">Nenhuma música tocada ainda.</Typography> )}
                    </Paper>
                    {setlistPublico && setlistPublico.musicas && setlistPublico.musicas.length > 0 && (
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">Repertório em Destaque</Typography>
                            <Typography variant="subtitle1" color="text.secondary" gutterBottom>"{setlistPublico.nome}"</Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                            {setlistPublico.musicas.map((musica, index) => (
                                <Chip key={index} icon={<MusicNoteIcon />} label={`${musica.nome} - ${musica.artista}`} />
                            ))}</Box>
                        </Paper>
                    )}
                </Box>
            </Box>
        </Container>
    </Box>
  );
}

export default PaginaVitrine;
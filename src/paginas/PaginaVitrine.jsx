// src/paginas/PaginaVitrine.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import apiClient from '../api';
import YouTube from 'react-youtube'; // <-- Importa o componente do YouTube
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
  YouTube as YouTubeIcon, // Renomeado para não conflitar com o componente
  Announcement as AnnouncementIcon,
  Link as LinkIcon,
  ThumbUp,
  ThumbDown
} from '@mui/icons-material';

// --- COMPONENTES INTERNOS PARA ORGANIZAÇÃO ---

const StatCard = ({ icon, value, label }) => (
    <Box sx={{ textAlign: 'center', flex: '1 1 0', minWidth: '100px' }}>
        {icon}
        <Typography variant="h5" component="p" fontWeight="bold">{Number.isFinite(value) ? value : 0}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'uppercase', fontSize: '0.7rem' }}>{label}</Typography>
    </Box>
);

const VitrineHeader = ({ artista, estatisticas, jaAplaudido, totalAplausos, handleAplaudir }) => {
    let fotoUrlCompleta = null;
    if (artista.foto_url) {
        fotoUrlCompleta = artista.foto_url.startsWith('http')
        ? artista.foto_url
        : `${apiClient.defaults.baseURL}${artista.foto_url}`;
    }

    return (
        <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 4, position: 'relative', mt: -15 }}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', gap: 3 }}>
                <Avatar 
                    src={fotoUrlCompleta} 
                    sx={{ 
                        width: { xs: 120, md: 160 }, 
                        height: { xs: 120, md: 160 },
                        fontSize: '4rem', 
                        border: '4px solid', 
                        borderColor: 'background.paper',
                        boxShadow: 3
                    }}
                >
                    {artista.nome?.charAt(0).toUpperCase()}
                </Avatar>
                
                <Box sx={{ flexGrow: 1, width: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, justifyContent: {xs: 'center', md: 'flex-start'} }}>
                        <Typography variant="h3" component="h1" fontWeight="bold">{artista.nome}</Typography>
                        <Tooltip title={jaAplaudido ? "Você já aplaudiu!" : "Apoie este artista!"}>
                            <span>
                                <IconButton onClick={handleAplaudir} disabled={jaAplaudido} color={jaAplaudido ? "error" : "default"}><FavoriteIcon /></IconButton>
                            </span>
                        </Tooltip>
                        <Typography variant="h6" color="text.secondary">{totalAplausos}</Typography>
                    </Box>
                    <Typography variant="body1" color="text.secondary" sx={{ mt: 1, whiteSpace: 'pre-wrap', textAlign: {xs: 'center', md: 'left'} }}>
                        {artista.biografia || 'Biografia ainda não preenchida.'}
                    </Typography>
                    <Box sx={{ mt: 2, display: 'flex', gap: 1, justifyContent: {xs: 'center', md: 'flex-start'} }}>
                        {artista.links_redes?.instagram && (<IconButton component="a" href={artista.links_redes.instagram} target="_blank" aria-label="Instagram"><Instagram /></IconButton>)}
                        {artista.links_redes?.youtube && (<IconButton component="a" href={artista.links_redes.youtube} target="_blank" aria-label="YouTube"><YouTubeIcon /></IconButton>)}
                        {artista.links_redes?.spotify && (<IconButton component="a" href={artista.links_redes.spotify} target="_blank" aria-label="Spotify"><MusicNote /></IconButton>)}
                    </Box>
                </Box>

                <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', md: 'block' }, mx: 2 }} />

                {/* ESTATÍSTICAS DENTRO DO HEADER */}
                <Box sx={{ display: 'flex', justifyContent: 'space-around', width: { xs: '100%', md: 'auto' }, gap: 2, p: 2, borderRadius: 2, bgcolor: 'action.hover' }}>
                    <StatCard icon={<MicIcon color="primary" />} value={estatisticas?.shows} label="Shows"/>
                    <StatCard icon={<LibraryMusicIcon color="primary" />} value={estatisticas?.musicas} label="Músicas"/>
                    <StatCard icon={<EmojiEventsIcon color="primary" />} value={estatisticas?.conquistas} label="Conquistas"/>
                </Box>
            </Box>
        </Paper>
    );
};


function PaginaVitrine() {
  const { url_unica } = useParams();
  const [vitrine, setVitrine] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [jaAplaudido, setJaAplaudido] = useState(false);
  const [totalAplausos, setTotalAplausos] = useState(0);
  const [reacoesPosts, setReacoesPosts] = useState({});

  const getYoutubeVideoId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  }

  useEffect(() => {
    const buscarDadosVitrine = async () => { /* ... (código existente sem alterações) ... */ };
    if (url_unica) buscarDadosVitrine();
  }, [url_unica]);

  const handleAplaudir = async () => { /* ... (código existente sem alterações) ... */ };
  const handleReacao = async (postId, tipo) => { /* ... (código existente sem alterações) ... */ };

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

  const { artista, proximosShows, contatoPublico, postsRecentes } = vitrine;

  const urlFotoCapa = artista.foto_capa_url || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80';
  const videoDestaqueId = getYoutubeVideoId(artista.video_destaque_url);

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
        <Box sx={{
            height: { xs: '30vh', md: '50vh' },
            backgroundImage: `linear-gradient(to top, rgba(18,18,18,1) 0%, rgba(18,18,18,0.2) 50%), url(${urlFotoCapa})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
        }}/>
        <Container maxWidth="lg" sx={{ pb: 5 }}>
            <VitrineHeader artista={artista} estatisticas={vitrine.estatisticas} jaAplaudido={jaAplaudido} totalAplausos={totalAplausos} handleAplaudir={handleAplaudir} />
            
            {/* --- LAYOUT PRINCIPAL COM FLEXBOX --- */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
                
                {/* Coluna da Esquerda (Conteúdo Principal) */}
                <Box sx={{ flex: '2 1 60%', display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {videoDestaqueId && (
                        <Paper sx={{ p: 2, aspectRatio: '16/9' }}>
                            <YouTube
                                videoId={videoDestaqueId}
                                opts={{
                                    height: '100%',
                                    width: '100%',
                                }}
                                style={{ width: '100%', height: '100%' }}
                            />
                        </Paper>
                    )}
                    {postsRecentes && postsRecentes.length > 0 && (
                       <Paper sx={{ p: 3 }}>
                            <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">Últimas Atualizações</Typography>
                            <List>{postsRecentes.map(post => {
                                const reacaoDoUtilizador = reacoesPosts[post.id];
                                return ( <ListItem key={post.id} disablePadding sx={{ py: 1 }} secondaryAction={ <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}> <Tooltip title="Gostei"><span><IconButton size="small" onClick={() => handleReacao(post.id, 'like')} disabled={!!reacaoDoUtilizador}><ThumbUp fontSize="small" color={reacaoDoUtilizador === 'like' ? 'primary' : 'inherit'} /></IconButton></span></Tooltip> <Typography variant="body2">{post.likes}</Typography> <Tooltip title="Não gostei"><span><IconButton size="small" onClick={() => handleReacao(post.id, 'dislike')} disabled={!!reacaoDoUtilizador}><ThumbDown fontSize="small" color={reacaoDoUtilizador === 'dislike' ? 'error' : 'inherit'} /></IconButton></span></Tooltip> <Typography variant="body2">{post.dislikes}</Typography> </Box> }> <ListItemIcon><AnnouncementIcon color="primary" /></ListItemIcon> <ListItemText primary={post.content} secondary={post.link ? (<Link href={post.link} target="_blank" rel="noopener noreferrer" sx={{display: 'flex', alignItems: 'center', mt: 0.5}}><LinkIcon fontSize="small" sx={{mr: 0.5}}/> Ver mais</Link>) : new Date(post.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}/> </ListItem> );
                            })}</List>
                        </Paper>
                    )}
                </Box>

                {/* Coluna da Direita (Informações Secundárias) */}
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
                </Box>
            </Box>
        </Container>
    </Box>
  );
}

export default PaginaVitrine;
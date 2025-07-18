// src/paginas/PaginaVitrine.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import apiClient from '../api';
import {
  Box, Typography, CircularProgress, Container, Paper, Avatar,
  Grid, Divider, List, ListItem, ListItemIcon, ListItemText, Button, Chip, IconButton, Tooltip
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
  YouTube
} from '@mui/icons-material';

const StatCard = ({ icon, value, label }) => (
    <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', height: '100%' }}>
        {icon}
        <Typography variant="h4" component="p" fontWeight="bold">{Number.isFinite(value) ? value : 0}</Typography>
        <Typography variant="body2" color="text.secondary">{label}</Typography>
    </Paper>
);

function PaginaVitrine() {
  const { url_unica } = useParams();
  const [vitrine, setVitrine] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [jaAplaudido, setJaAplaudido] = useState(false);
  const [totalAplausos, setTotalAplausos] = useState(0);

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
        setErro('');
      } catch (err) {
        setErro(err.response?.data?.mensagem || 'Artista não encontrado.');
        setVitrine(null);
      } finally {
        setCarregando(false);
      }
    };
    if (url_unica) {
        buscarDadosVitrine();
    }
  }, [url_unica]);

  const handleAplaudir = async () => {
      if (jaAplaudido) return;
      try {
          setTotalAplausos(prev => prev + 1);
          setJaAplaudido(true);
          localStorage.setItem(`aplauso_${url_unica}`, 'true');
          await apiClient.post(`/api/vitrine/${url_unica}/aplaudir`);
      } catch (error) {
          console.error("Erro ao registrar aplauso", error);
          setTotalAplausos(prev => prev - 1);
          setJaAplaudido(false);
          localStorage.removeItem(`aplauso_${url_unica}`);
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

  const { artista, proximosShows, contatoPublico, setlistPublico, musicasPopulares, estatisticas } = vitrine;
  const fotoUrlCompleta = artista.foto_url ? `${apiClient.defaults.baseURL}${artista.foto_url}` : null;
  const { links_redes } = artista;

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 5 }}>
      <Container maxWidth="md">
        <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 } }}>
          <Grid container spacing={4} alignItems="center" sx={{ mb: 4 }}>
            <Grid xs={12} sm={4} sx={{ textAlign: 'center' }}>
              <Avatar src={fotoUrlCompleta} sx={{ width: 150, height: 150, margin: 'auto', fontSize: '4rem', border: '3px solid', borderColor: 'primary.main' }}>
                {artista.nome?.charAt(0).toUpperCase()}
              </Avatar>
            </Grid>
            <Grid xs={12} sm={8}>
              <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2}}>
                <Typography variant="h3" component="h1" fontWeight="bold">{artista.nome}</Typography>
                <Tooltip title={jaAplaudido ? "Você já aplaudiu!" : "Apoie este artista!"}>
                    <span>
                        <IconButton onClick={handleAplaudir} disabled={jaAplaudido} color={jaAplaudido ? "error" : "default"}>
                            <FavoriteIcon />
                        </IconButton>
                    </span>
                </Tooltip>
                 <Typography variant="h6" color="text.secondary">{totalAplausos}</Typography>
              </Box>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>
                {artista.biografia || 'Biografia ainda não preenchida.'}
              </Typography>
              
              <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                {links_redes?.instagram && (
                  <IconButton component="a" href={links_redes.instagram} target="_blank" aria-label="Instagram">
                    <Instagram />
                  </IconButton>
                )}
                {links_redes?.youtube && (
                  <IconButton component="a" href={links_redes.youtube} target="_blank" aria-label="YouTube">
                    <YouTube />
                  </IconButton>
                )}
                {links_redes?.spotify && (
                  <IconButton component="a" href={links_redes.spotify} target="_blank" aria-label="Spotify">
                    <MusicNote />
                  </IconButton>
                )}
              </Box>

            </Grid>
          </Grid>
          
          <Grid container spacing={2} sx={{ mb: 4 }}>
              <Grid xs={12} sm={4}><StatCard icon={<MicIcon color="primary" sx={{fontSize: 40}} />} value={estatisticas?.shows} label="Shows Realizados"/></Grid>
              <Grid xs={12} sm={4}><StatCard icon={<LibraryMusicIcon color="primary" sx={{fontSize: 40}} />} value={estatisticas?.musicas} label="Músicas no Repertório"/></Grid>
              <Grid xs={12} sm={4}><StatCard icon={<EmojiEventsIcon color="primary" sx={{fontSize: 40}} />} value={estatisticas?.conquistas} label="Conquistas Desbloqueadas"/></Grid>
          </Grid>

          <Grid container spacing={5}>
            <Grid xs={12} md={6}>
                <Box>
                    <Typography variant="h5" component="h2" gutterBottom>Próximos Shows</Typography>
                    {proximosShows && proximosShows.length > 0 ? (
                        <List>
                        {proximosShows.map((show, index) => (
                            <ListItem key={index} disableGutters>
                            <ListItemIcon><CalendarMonthIcon color="primary" /></ListItemIcon>
                            <ListItemText
                                primary={show.nome_evento}
                                secondary={<>{new Date(show.data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}{show.local && ` - ${show.local}`}</>}
                            />
                            </ListItem>
                        ))}
                        </List>
                    ) : ( <Typography color="text.secondary">Nenhum show agendado no momento.</Typography> )}
                </Box>
                <Divider sx={{ my: 4 }} />
                <Box>
                    <Typography variant="h5" component="h2" gutterBottom>Contato</Typography>
                    {contatoPublico ? (
                        <Box>
                        <Chip icon={<PersonIcon />} label={contatoPublico.funcao || 'Contato Profissional'} color="primary" sx={{ mb: 2 }}/>
                        <Typography><strong>Nome:</strong> {contatoPublico.nome}</Typography>
                        {contatoPublico.email && <Typography><strong>Email:</strong> {contatoPublico.email}</Typography>}
                        {contatoPublico.telefone && <Typography><strong>Telefone:</strong> {contatoPublico.telefone}</Typography>}
                        </Box>
                    ) : ( <Typography color="text.secondary">Informações de contato não disponíveis.</Typography> )}
                </Box>
            </Grid>
            <Grid xs={12} md={6}>
                 <Box>
                    <Typography variant="h5" component="h2" gutterBottom>Top 5 Músicas</Typography>
                     {musicasPopulares && musicasPopulares.length > 0 ? (
                        <List>
                            {musicasPopulares.map((musica, index) => (
                                <ListItem key={index} disableGutters>
                                    <ListItemIcon><StarIcon sx={{color: '#FFD700'}}/></ListItemIcon>
                                    <ListItemText primary={musica.nome} secondary={musica.artista}/>
                                </ListItem>
                            ))}
                        </List>
                    ) : ( <Typography color="text.secondary">Nenhuma música tocada ainda.</Typography> )}
                 </Box>

                {setlistPublico && setlistPublico.musicas && setlistPublico.musicas.length > 0 && (
                    <>
                    <Divider sx={{ my: 4 }} />
                    <Box>
                        <Typography variant="h5" component="h2" gutterBottom>Repertório em Destaque</Typography>
                        <Typography variant="subtitle1" color="text.secondary" gutterBottom>"{setlistPublico.nome}"</Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                        {setlistPublico.musicas.map((musica, index) => (
                            <Chip key={index} icon={<MusicNoteIcon />} label={`${musica.nome} - ${musica.artista}`} />
                        ))}
                        </Box>
                    </Box>
                    </>
                )}
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
}

export default PaginaVitrine;
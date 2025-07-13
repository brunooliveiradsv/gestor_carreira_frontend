// src/paginas/Repertorios.jsx

import { useState, useEffect } from 'react';
import apiClient from '../api';
import { useNotificacao } from '../contextos/NotificationContext';
import { 
  Box, 
  Button, 
  Container, 
  Typography, 
  CircularProgress, 
  Card, 
  CardContent, 
  CardActions, 
  IconButton, 
  Paper, 
  Tooltip, 
  Link as MuiLink,
  Grid,
  useTheme
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, AddCircleOutline as AddCircleOutlineIcon, LibraryMusic as LibraryMusicIcon, Link as LinkIcon, Notes as NotesIcon } from '@mui/icons-material';
import FormularioRepertorio from '../componentes/FormularioRepertorio.jsx';

function Repertorios() {
  const [repertorios, setRepertorios] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [modo, setModo] = useState('lista');
  const [repertorioSelecionadoId, setRepertorioSelecionadoId] = useState(null);
  const { mostrarNotificacao } = useNotificacao();
  const theme = useTheme();

  const buscarRepertorios = async () => {
    if (modo === 'lista' && !carregando) setCarregando(true);
    try {
      const resposta = await apiClient.get('/api/repertorios');
      setRepertorios(resposta.data);
    } catch (erro) {
      console.error("Erro ao buscar repertórios:", erro);
      mostrarNotificacao("Não foi possível carregar os repertórios.", "error");
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    if (modo === 'lista') {
      buscarRepertorios();
    }
  }, [modo]);

  const handleApagar = async (id) => {
    if (window.confirm("Tem certeza que deseja apagar este repertório? Compromissos que usam este repertório perderão o vínculo.")) {
      try {
        await apiClient.delete(`/api/repertorios/${id}`);
        mostrarNotificacao("Repertório apagado com sucesso!", "success");
        buscarRepertorios();
      } catch (erro) {
        mostrarNotificacao("Falha ao apagar o repertório.", "error");
      }
    }
  };

  const handleSucessoFormulario = () => { setModo('lista'); setRepertorioSelecionadoId(null); };
  const handleCancelarFormulario = () => { setModo('lista'); setRepertorioSelecionadoId(null); };

  if (carregando) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress color="inherit" /></Box>;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {modo === 'lista' ? (
        <Paper elevation={6} sx={{ p: { xs: 2, md: 4 } }}>
          <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              mb: 4,
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 2,
            }}>
            <Typography variant="h4" component="h1" fontWeight="bold" sx={{ color: theme.palette.text.primary }}>Meus Repertórios</Typography>
            <Button 
                variant="contained" 
                startIcon={<AddCircleOutlineIcon />} 
                onClick={() => setModo('criar')} 
                color="primary"
                sx={{ width: { xs: '100%', sm: 'auto' } }}
            >
                Novo Repertório
            </Button>
          </Box>
          {repertorios.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center', border: `1px dashed ${theme.palette.divider}`, borderRadius: 2 }}>
              <Typography variant="h6" sx={{ color: theme.palette.text.primary }}>Nenhum repertório cadastrado.</Typography>
              <Typography color="text.secondary">Adicione suas setlists para organizá-las.</Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {repertorios.map(repertorio => (
                <Card key={repertorio.id} variant="outlined">
                  <Grid container alignItems="center">
                    <Grid item xs={12} sm={8}>
                        <CardContent>
                            <Box sx={{display: 'flex', alignItems: 'center', mb: 1.5}}>
                            <LibraryMusicIcon sx={{mr: 1.5, color: 'primary.main'}}/>
                            <Typography variant="h6" component="h2" fontWeight="bold">{repertorio.nome}</Typography>
                            </Box>
                            {repertorio.link_cifraclub && (
                            <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', mb: 1, pl: 0.5 }}>
                                <LinkIcon sx={{ fontSize: '1rem', mr: 1.5, color: 'primary.main' }} />
                                <MuiLink href={repertorio.link_cifraclub} target="_blank" rel="noopener noreferrer" color="primary">Acessar no CifraClub</MuiLink>
                            </Box>
                            )}
                            {repertorio.notas_adicionais && (
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', color: 'text.secondary', mt: 2, pl: 0.5 }}>
                                <NotesIcon sx={{ fontSize: '1rem', mr: 1.5, mt: 0.5, color: 'primary.main' }} />
                                <Typography variant="body2" sx={{whiteSpace: 'pre-wrap'}}>{repertorio.notas_adicionais}</Typography>
                            </Box>
                            )}
                        </CardContent>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <CardActions sx={{ justifyContent: {xs: 'flex-start', sm: 'flex-end'}, p: 2 }}>
                            <Tooltip title="Editar"><IconButton onClick={() => { setRepertorioSelecionadoId(repertorio.id); setModo('editar'); }} color="secondary"><EditIcon /></IconButton></Tooltip>
                            <Tooltip title="Excluir"><IconButton onClick={() => handleApagar(repertorio.id)} color="error"><DeleteIcon /></IconButton></Tooltip>
                        </CardActions>
                    </Grid>
                  </Grid>
                </Card>
              ))}
            </Box>
          )}
        </Paper>
      ) : (
        <FormularioRepertorio
          id={repertorioSelecionadoId}
          onSave={handleSucessoFormulario}
          onCancel={handleCancelarFormulario}
        />
      )}
    </Container>
  );
}

export default Repertorios;
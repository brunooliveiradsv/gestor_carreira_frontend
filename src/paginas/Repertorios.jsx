// src/paginas/Repertorios.jsx

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNotificacao } from '../contextos/NotificationContext';
import { Box, Button, Container, Typography, CircularProgress, Card, CardContent, CardActions, IconButton, Paper, Tooltip, Link as MuiLink } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, AddCircleOutline as AddCircleOutlineIcon, LibraryMusic as LibraryMusicIcon, Link as LinkIcon, Notes as NotesIcon } from '@mui/icons-material';
import FormularioRepertorio from '../componentes/FormularioRepertorio.jsx';

function Repertorios() {
  const [repertorios, setRepertorios] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [modo, setModo] = useState('lista');
  const [repertorioSelecionadoId, setRepertorioSelecionadoId] = useState(null);
  const { mostrarNotificacao } = useNotificacao();

  const buscarRepertorios = async () => {
    if (modo === 'lista' && !carregando) setCarregando(true);
    try {
      const resposta = await apiClient.get('/api/repertorios');
      setRepertorios(resposta.data);
    } catch (erro) {
      console.error("Erro ao buscar repertórios:", erro);
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
  
  const primaryButtonStyle = {
    borderRadius: 2, bgcolor: "#4000F0", color: 'white', py: 1.2, px: 3, "&:hover": { bgcolor: "#2C00A3" },
  };

  if (carregando) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress color="inherit" /></Box>;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {modo === 'lista' ? (
        <Paper elevation={6} sx={{ p: { xs: 2, md: 4 }, borderRadius: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Typography variant="h4" component="h1" fontWeight="bold">Meus Repertórios</Typography>
            <Button variant="contained" startIcon={<AddCircleOutlineIcon />} onClick={() => setModo('criar')} sx={primaryButtonStyle}>Novo Repertório</Button>
          </Box>
          {repertorios.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center', border: '1px dashed grey', borderRadius: 2 }}>
              <Typography variant="h6">Nenhum repertório cadastrado.</Typography>
              <Typography color="text.secondary">Adicione suas setlists para organizá-las.</Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 3 }}>
              {repertorios.map(repertorio => (
                <Card key={repertorio.id} variant="outlined" sx={{ display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{display: 'flex', alignItems: 'center', mb: 1.5}}>
                      <LibraryMusicIcon sx={{mr: 1.5, color: 'primary.main'}}/>
                      <Typography variant="h6" component="h2" fontWeight="bold">{repertorio.nome}</Typography>
                    </Box>
                    {repertorio.link_cifraclub && (
                      <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', mb: 1 }}>
                        <LinkIcon sx={{ fontSize: '1rem', mr: 1 }} />
                        <MuiLink href={repertorio.link_cifraclub} target="_blank" rel="noopener noreferrer">Acessar no CifraClub</MuiLink>
                      </Box>
                    )}
                    {repertorio.notas_adicionais && (
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', color: 'text.secondary', mt: 2 }}>
                        <NotesIcon sx={{ fontSize: '1rem', mr: 1, mt: 0.5 }} />
                        <Typography variant="body2" sx={{whiteSpace: 'pre-wrap'}}>{repertorio.notas_adicionais}</Typography>
                      </Box>
                    )}
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'flex-end' }}>
                    <Tooltip title="Editar"><IconButton onClick={() => { setRepertorioSelecionadoId(repertorio.id); setModo('editar'); }} color="secondary"><EditIcon /></IconButton></Tooltip>
                    <Tooltip title="Excluir"><IconButton onClick={() => handleApagar(repertorio.id)} color="error"><DeleteIcon /></IconButton></Tooltip>
                  </CardActions>
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
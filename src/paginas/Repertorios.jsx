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
  useTheme // Adicionado para acessar o tema
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, AddCircleOutline as AddCircleOutlineIcon, LibraryMusic as LibraryMusicIcon, Link as LinkIcon, Notes as NotesIcon } from '@mui/icons-material';
import FormularioRepertorio from '../componentes/FormularioRepertorio.jsx';

function Repertorios() {
  const [repertorios, setRepertorios] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [modo, setModo] = useState('lista');
  const [repertorioSelecionadoId, setRepertorioSelecionadoId] = useState(null);
  const { mostrarNotificacao } = useNotificacao();
  const theme = useTheme(); // Hook para acessar o tema

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
  
  // Removendo primaryButtonStyle, pois o botão usará as props do tema
  // const primaryButtonStyle = {
  //   borderRadius: 2, bgcolor: "#4000F0", color: 'white', py: 1.2, px: 3, "&:hover": { bgcolor: "#2C00A3" },
  // };

  if (carregando) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress color="inherit" /></Box>;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {modo === 'lista' ? (
        // Removendo borderRadius e elevation fixos. Eles serão do tema
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
                color="primary" // Usa a cor primária do tema
                sx={{ width: { xs: '100%', sm: 'auto' } }} // Mantém apenas o ajuste de largura
            >
                Novo Repertório
            </Button>
          </Box>
          {repertorios.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center', border: `1px dashed ${theme.palette.divider}`, borderRadius: 2 }}> {/* Usando a cor do divider do tema */}
              <Typography variant="h6" sx={{ color: theme.palette.text.primary }}>Nenhum repertório cadastrado.</Typography>
              <Typography color="text.secondary">Adicione suas setlists para organizá-las.</Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 3 }}>
              {repertorios.map(repertorio => (
                // Removendo variant="outlined" e usando o boxShadow do tema (se você configurou MuiCard no tema)
                <Card key={repertorio.id} sx={{ display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{display: 'flex', alignItems: 'center', mb: 1.5}}>
                      <LibraryMusicIcon sx={{mr: 1.5, color: theme.palette.primary.main}}/> {/* Usa a cor primária do tema */}
                      <Typography variant="h6" component="h2" fontWeight="bold" sx={{ color: theme.palette.text.primary }}>{repertorio.nome}</Typography>
                    </Box>
                    {repertorio.link_cifraclub && (
                      <Box sx={{ display: 'flex', alignItems: 'center', color: theme.palette.text.secondary, mb: 1 }}> {/* Usa a cor de texto secundário do tema */}
                        <LinkIcon sx={{ fontSize: '1rem', mr: 1, color: theme.palette.primary.main }} /> {/* Usa a cor primária do tema */}
                        <MuiLink href={repertorio.link_cifraclub} target="_blank" rel="noopener noreferrer" color="primary.main">Acessar no CifraClub</MuiLink> {/* Usa a cor primária do tema */}
                      </Box>
                    )}
                    {repertorio.notas_adicionais && (
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', color: theme.palette.text.secondary, mt: 2 }}> {/* Usa a cor de texto secundário do tema */}
                        <NotesIcon sx={{ fontSize: '1rem', mr: 1, mt: 0.5, color: theme.palette.primary.main }} /> {/* Usa a cor primária do tema */}
                        <Typography variant="body2" sx={{whiteSpace: 'pre-wrap', color: theme.palette.text.primary}}>{repertorio.notas_adicionais}</Typography> {/* Usa a cor de texto primário do tema */}
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
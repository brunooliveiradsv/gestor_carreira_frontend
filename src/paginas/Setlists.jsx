// src/paginas/Setlists.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api';
import { useNotificacao } from '../contextos/NotificationContext';
import {
  Box, Button, Container, Typography, CircularProgress, Paper,
  List, ListItem, ListItemText, ListItemIcon, IconButton, Tooltip
} from '@mui/material';
import {
  AddCircleOutline as AddCircleOutlineIcon, Edit as EditIcon,
  Delete as DeleteIcon, PlaylistPlay as PlaylistPlayIcon
} from '@mui/icons-material';

function Setlists() {
  const [setlists, setSetlists] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const { mostrarNotificacao } = useNotificacao();
  const navigate = useNavigate();

  const buscarSetlists = async () => {
    try {
      const resposta = await apiClient.get('/api/setlists');
      setSetlists(resposta.data);
    } catch (erro) {
      mostrarNotificacao("Não foi possível carregar os setlists.", "error");
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    buscarSetlists();
  }, []);

  const handleNovoSetlist = async () => {
    const nome = prompt("Qual o nome do novo setlist? (ex: Show Bar da Esquina)");
    if (nome) {
      try {
        const resposta = await apiClient.post('/api/setlists', { nome });
        mostrarNotificacao("Setlist criado! Agora adicione músicas a ele.", "success");
        navigate(`/setlists/editar/${resposta.data.id}`); // Redireciona para a edição
      } catch (erro) {
        mostrarNotificacao("Falha ao criar o setlist.", "error");
      }
    }
  };
  
  const handleApagar = async (id, nome) => {
      if (window.confirm(`Tem certeza que deseja apagar o setlist "${nome}"?`)) {
          try {
              await apiClient.delete(`/api/setlists/${id}`);
              mostrarNotificacao("Setlist apagado com sucesso!", "success");
              buscarSetlists();
          } catch(erro) {
              mostrarNotificacao("Falha ao apagar o setlist.", "error");
          }
      }
  }

  if (carregando) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress color="inherit" /></Box>;
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={6} sx={{ p: { xs: 2, md: 4 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1" fontWeight="bold">Meus Setlists</Typography>
          <Button variant="contained" startIcon={<AddCircleOutlineIcon />} onClick={handleNovoSetlist}>
            Novo Setlist
          </Button>
        </Box>

        {setlists.length > 0 ? (
          <List>
            {setlists.map(setlist => (
              <Paper key={setlist.id} variant="outlined" sx={{ mb: 1.5 }}>
                <ListItem
                  secondaryAction={
                    <Box>
                        <Tooltip title="Editar Setlist">
                            <IconButton edge="end" aria-label="edit" onClick={() => navigate(`/setlists/editar/${setlist.id}`)}>
                                <EditIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Apagar Setlist">
                            <IconButton edge="end" aria-label="delete" color="error" onClick={() => handleApagar(setlist.id, setlist.nome)}>
                                <DeleteIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>
                  }
                >
                  <ListItemIcon>
                    <PlaylistPlayIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary={setlist.nome} secondary={setlist.notas_adicionais || 'Nenhuma nota'} />
                </ListItem>
              </Paper>
            ))}
          </List>
        ) : (
          <Typography sx={{ textAlign: 'center', p: 4 }}>
            Nenhum setlist criado. Que tal começar um agora?
          </Typography>
        )}
      </Paper>
    </Container>
  );
}

export default Setlists;
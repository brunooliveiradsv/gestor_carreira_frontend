// src/paginas/Setlists.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api';
import { useNotificacao } from '../contextos/NotificationContext';
import {
  Box, Button, Container, Typography, CircularProgress, Paper,
  List, ListItem, ListItemText, ListItemIcon, IconButton, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField
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

  const [dialogoNovoSetlistAberto, setDialogoNovoSetlistAberto] = useState(false);
  const [nomeNovoSetlist, setNomeNovoSetlist] = useState('');
  const [criandoSetlist, setCriandoSetlist] = useState(false);


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

  const handleAbrirDialogoNovoSetlist = () => {
    setDialogoNovoSetlistAberto(true);
    setNomeNovoSetlist('');
  };

  const handleFecharDialogoNovoSetlist = () => {
    setDialogoNovoSetlistAberto(false);
    setNomeNovoSetlist('');
  };

  const handleConfirmarNovoSetlist = async () => {
    if (!nomeNovoSetlist.trim()) {
      mostrarNotificacao("O nome do setlist não pode ser vazio.", "warning");
      return;
    }
    setCriandoSetlist(true);
    try {
      const resposta = await apiClient.post('/api/setlists', { nome: nomeNovoSetlist });
      mostrarNotificacao("Setlist criado! Agora adicione músicas a ele.", "success");
      handleFecharDialogoNovoSetlist();
      navigate(`/setlists/editar/${resposta.data.id}`);
    } catch (erro) {
      mostrarNotificacao("Falha ao criar o setlist.", "error");
    } finally {
      setCriandoSetlist(false);
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
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}><CircularProgress color="inherit" /></Box>;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight="bold">Meus Setlists</Typography>
        <Button variant="contained" startIcon={<AddCircleOutlineIcon />} onClick={handleAbrirDialogoNovoSetlist}>
          Novo Setlist
        </Button>
      </Box>

      <Paper elevation={6} sx={{ p: { xs: 2, md: 4 }, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {setlists.length > 0 ? (
          <List sx={{ flexGrow: 1, overflowY: 'auto' }}>
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
          <Typography sx={{ textAlign: 'center', p: 4, flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            Nenhum setlist criado. Que tal começar um agora?
          </Typography>
        )}
      </Paper>

      {/* Diálogo para criar novo setlist */}
      <Dialog open={dialogoNovoSetlistAberto} onClose={handleFecharDialogoNovoSetlist}>
        <DialogTitle>Criar Novo Setlist</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="nomeSetlist"
            label="Nome do Setlist"
            type="text"
            fullWidth
            variant="outlined"
            value={nomeNovoSetlist}
            onChange={(e) => setNomeNovoSetlist(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !criandoSetlist) {
                handleConfirmarNovoSetlist();
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleFecharDialogoNovoSetlist} disabled={criandoSetlist}>Cancelar</Button>
          <Button onClick={handleConfirmarNovoSetlist} disabled={criandoSetlist || !nomeNovoSetlist.trim()} variant="contained">
            {criandoSetlist ? <CircularProgress size={24} /> : 'Criar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Setlists;
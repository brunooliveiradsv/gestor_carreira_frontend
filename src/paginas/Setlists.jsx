// src/paginas/Setlists.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api';
import { useNotificacao } from '../contextos/NotificationContext';
import {
  Box, Typography, Button, CircularProgress, Paper,
  Grid, Card, CardContent, CardActions, IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, TextField
} from '@mui/material';
import {
  AddCircleOutline as AddCircleOutlineIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlaylistPlay as PlaylistPlayIcon,
  MusicVideo as MusicVideoIcon // <-- 1. Importe o ícone novo
} from '@mui/icons-material';

function Setlists() {
  const [setlists, setSetlists] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const { mostrarNotificacao } = useNotificacao();
  const navigate = useNavigate();

  const [dialogoCriarAberto, setDialogoCriarAberto] = useState(false);
  const [novoNomeSetlist, setNovoNomeSetlist] = useState('');

  const buscarSetlists = useCallback(async () => {
    try {
      const resposta = await apiClient.get('/api/setlists');
      setSetlists(resposta.data);
    } catch (error) {
      mostrarNotificacao('Erro ao carregar os setlists.', 'error');
    } finally {
      setCarregando(false);
    }
  }, [mostrarNotificacao]);

  useEffect(() => {
    buscarSetlists();
  }, [buscarSetlists]);

  const handleEditar = (id) => {
    navigate(`/setlists/editar/${id}`);
  };
  
  const handleAbrirCriarDialogo = () => {
      setNovoNomeSetlist('');
      setDialogoCriarAberto(true);
  };

  const handleFecharCriarDialogo = () => {
      setDialogoCriarAberto(false);
  };

  const handleCriarNovoSetlist = async () => {
      if (!novoNomeSetlist) {
          mostrarNotificacao('O nome do setlist é obrigatório.', 'warning');
          return;
      }
      try {
          const resposta = await apiClient.post('/api/setlists', { nome: novoNomeSetlist });
          mostrarNotificacao('Setlist criado com sucesso!', 'success');
          handleFecharCriarDialogo();
          navigate(`/setlists/editar/${resposta.data.id}`);
      } catch (error) {
          mostrarNotificacao('Erro ao criar o setlist.', 'error');
      }
  };


  if (carregando) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold">Meus Setlists</Typography>
          <Typography color="text.secondary">Crie e organize as sequências de músicas para os seus shows.</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddCircleOutlineIcon />} onClick={handleAbrirCriarDialogo}>
          Novo Setlist
        </Button>
      </Box>

      {setlists.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6">Nenhum setlist criado.</Typography>
          <Typography color="text.secondary">Clique em "Novo Setlist" para criar o seu primeiro.</Typography>
        </Paper>
      ) : (
        // Alterado de Grid container para Box com display flex
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, justifyContent: 'flex-start' }}> 
          {setlists.map((setlist) => (
            // Grid item substituído por Box e flex: '1 1 auto' para responsividade flexbox
            <Box key={setlist.id} sx={{ flex: '1 1 300px', maxWidth: '100%', '@media (min-width:600px)': { maxWidth: 'calc(50% - 16px)' }, '@media (min-width:960px)': { maxWidth: 'calc(33.33% - 16px)' } }}> 
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <PlaylistPlayIcon sx={{ color: 'primary.main', mr: 1.5 }} />
                    <Typography variant="h6" fontWeight="bold">{setlist.nome}</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                  }}>
                    {setlist.notas_adicionais || 'Nenhuma nota adicional.'}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end' }}>
                  {/* --- 2. BOTÃO "MODO PALCO" ADICIONADO AQUI --- */}
                  <Tooltip title="Modo Palco">
                    <IconButton color="secondary" onClick={() => navigate(`/setlists/palco/${setlist.id}`)}>
                      <MusicVideoIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Editar Músicas e Detalhes">
                    <IconButton onClick={() => handleEditar(setlist.id)}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Excluir">
                    <IconButton color="error">
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </CardActions>
              </Card>
            </Box>
          ))}
        </Box>
      )}

      <Dialog open={dialogoCriarAberto} onClose={handleFecharCriarDialogo} fullWidth maxWidth="sm">
        <DialogTitle>Criar Novo Setlist</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nome do Setlist"
            type="text"
            fullWidth
            variant="outlined"
            value={novoNomeSetlist}
            onChange={(e) => setNovoNomeSetlist(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleFecharCriarDialogo}>Cancelar</Button>
          <Button onClick={handleCriarNovoSetlist} variant="contained">Criar e Editar Músicas</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Setlists;
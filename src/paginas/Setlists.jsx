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
  MusicVideo as MusicVideoIcon
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
    <Box sx={{ p: 2 }}> {/* Adicionado padding geral para evitar que o conteúdo cole nas bordas em mobile */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, mb: 4, gap: 2 }}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold">Meus Setlists</Typography>
          <Typography color="text.secondary">Crie e organize as sequências de músicas para os seus shows.</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddCircleOutlineIcon />} onClick={handleAbrirCriarDialogo} sx={{ width: { xs: '100%', sm: 'auto' } }}>
          Novo Setlist
        </Button>
      </Box>

      {setlists.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6">Nenhum setlist criado.</Typography>
          <Typography color="text.secondary">Clique em "Novo Setlist" para criar o seu primeiro.</Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {setlists.map((setlist) => (
            <Grid item xs={12} sm={6} md={4} key={setlist.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1, p: 2 }}> {/* Reduzido o padding para mobile se necessário */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, overflow: 'hidden' }}> {/* Adicionado overflow: 'hidden' */}
                    <PlaylistPlayIcon sx={{ color: 'primary.main', mr: 1.5, flexShrink: 0 }} /> {/* flexShrink para o ícone não diminuir */}
                    <Typography variant="h6" fontWeight="bold" noWrap sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{setlist.nome}</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'normal', // Garante quebra de linha
                  }}>
                    {setlist.notas_adicionais || 'Nenhuma nota adicional.'}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end', p: 1 }}> {/* Ajustado o padding para os botões */}
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
                    {/* Futuramente, você pode adicionar a lógica de exclusão e um diálogo de confirmação aqui */}
                    <IconButton color="error">
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
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
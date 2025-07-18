// src/paginas/Setlists.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api';
import { useNotificacao } from '../contextos/NotificationContext';
import {
  Box, Button, Typography, CircularProgress, Paper,
  IconButton, Tooltip, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Grid, Card, CardContent, CardActions
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

  // ... (Toda a lógica de busca e manipulação de dados permanece a mesma) ...
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
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}><CircularProgress color="inherit" /></Box>;
  }

  return (
    <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
            <Box>
                <Typography variant="h4" component="h1" fontWeight="bold">Meus Setlists</Typography>
                <Typography color="text.secondary">Crie e organize as sequências de músicas para seus shows.</Typography>
            </Box>
            <Button variant="contained" startIcon={<AddCircleOutlineIcon />} onClick={handleAbrirDialogoNovoSetlist}>
            Novo Setlist
            </Button>
        </Box>

        {setlists.length > 0 ? (
            <Grid container spacing={3}>
                {setlists.map(setlist => (
                <Grid item xs={12} sm={6} md={4} key={setlist.id}>
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <CardContent sx={{ flexGrow: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                <PlaylistPlayIcon color="primary" sx={{fontSize: 40}} />
                                <Typography variant="h6" fontWeight="bold">{setlist.nome}</Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{fontStyle: 'italic'}}>
                                {setlist.notas_adicionais || 'Nenhuma nota adicional.'}
                            </Typography>
                        </CardContent>
                         <CardActions sx={{ justifyContent: 'flex-end' }}>
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
                        </CardActions>
                    </Card>
                </Grid>
                ))}
            </Grid>
        ) : (
            <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
                <PlaylistPlayIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6">Nenhum setlist criado.</Typography>
                <Typography color="text.secondary">Que tal começar um agora?</Typography>
            </Paper>
        )}

      {/* Diálogo para criar novo setlist */}
      <Dialog open={dialogoNovoSetlistAberto} onClose={handleFecharDialogoNovoSetlist}>
        <DialogTitle>Criar Novo Setlist</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus margin="dense" id="nomeSetlist" label="Nome do Setlist"
            type="text" fullWidth variant="outlined" value={nomeNovoSetlist}
            onChange={(e) => setNomeNovoSetlist(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !criandoSetlist) { handleConfirmarNovoSetlist(); }
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
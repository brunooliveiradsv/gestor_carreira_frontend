import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../apiClient';
import { useNotificacao } from '../contextos/NotificationContext';
import { AuthContext } from '../contextos/AuthContext';
import { useUpgradeDialog } from '../contextos/UpgradeDialogContext';
import {
   Box, Typography, Button, CircularProgress, Paper,
  Card, CardContent, CardActions, IconButton, Tooltip, Dialog, DialogTitle, 
  DialogContent, DialogActions, TextField, DialogContentText, Switch, 
  FormControlLabel, Snackbar, Alert
} from '@mui/material';
import {
  AddCircleOutline as AddCircleOutlineIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlaylistPlay as PlaylistPlayIcon,
  MusicVideo as MusicVideoIcon,
  Share as ShareIcon,
  Lock as LockIcon
} from '@mui/icons-material';

function Setlists() {
  const [setlists, setSetlists] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const { mostrarNotificacao } = useNotificacao();
  const navigate = useNavigate();
  const { usuario } = useContext(AuthContext);
  const { abrirDialogoDeUpgrade } = useUpgradeDialog();

  const [dialogoCriarAberto, setDialogoCriarAberto] = useState(false);
  const [novoNomeSetlist, setNovoNomeSetlist] = useState('');
  const [dialogoPartilhaAberto, setDialogoPartilhaAberto] = useState(false);
  const [setlistSelecionado, setSetlistSelecionado] = useState(null);
  const [linkPublico, setLinkPublico] = useState('');
  const [copiado, setCopiado] = useState(false);
  const [dialogoExcluirAberto, setDialogoExcluirAberto] = useState(false);
  const [setlistParaExcluir, setSetlistParaExcluir] = useState(null);

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
      if (!novoNomeSetlist.trim()) {
          mostrarNotificacao('O nome do setlist é obrigatório.', 'warning');
          return;
      }
      try {
          const resposta = await apiClient.post('/api/setlists', { nome: novoNomeSetlist });
          mostrarNotificacao('Setlist criado com sucesso!', 'success');
          handleFecharCriarDialogo();
          navigate(`/setlists/editar/${resposta.data.id}`);
      } catch (error) {
          if (error.response?.data?.upgradeNecessario) {
              abrirDialogoDeUpgrade(error.response.data.mensagem);
              handleFecharCriarDialogo();
          } else {
              mostrarNotificacao(error.response?.data?.mensagem || 'Erro ao criar o setlist.', 'error');
          }
      }
  };

  const handleAbrirDialogoPartilha = (setlist) => {
    if (usuario.plano === 'free') {
      abrirDialogoDeUpgrade('A partilha de setlists está disponível nos planos Padrão e Premium.');
      return;
    }
    setSetlistSelecionado(setlist);
    if (setlist.publico_uuid) {
      setLinkPublico(`${window.location.origin}/setlist/${setlist.publico_uuid}`);
    } else {
      setLinkPublico('');
    }
    setDialogoPartilhaAberto(true);
  };

  const handleFecharDialogoPartilha = () => setDialogoPartilhaAberto(false);

  const handleTogglePartilha = async (event) => {
    const partilhar = event.target.checked;
    try {
      const { data } = await apiClient.patch(`/api/setlists/${setlistSelecionado.id}/partilhar`, { partilhar });
      setSetlistSelecionado(data);
      setSetlists(prev => prev.map(s => s.id === data.id ? data : s));

      if (data.publico_uuid) {
        setLinkPublico(`${window.location.origin}/setlist/${data.publico_uuid}`);
      } else {
        setLinkPublico('');
      }
    } catch (error) {
      if (error.response?.data?.upgradeNecessario) {
        abrirDialogoDeUpgrade(error.response.data.mensagem);
      } else {
        mostrarNotificacao("Erro ao alterar o estado de partilha.", "error");
      }
    }
  };
  
  const copiarLink = () => {
      navigator.clipboard.writeText(linkPublico);
      setCopiado(true);
  };

  const handleAbrirDialogoExcluir = (setlist) => {
    setSetlistParaExcluir(setlist);
    setDialogoExcluirAberto(true);
  };

  const handleFecharDialogoExcluir = () => {
    setSetlistParaExcluir(null);
    setDialogoExcluirAberto(false);
  };

  const handleConfirmarExclusao = async () => {
    if (!setlistParaExcluir) return;
    try {
      await apiClient.delete(`/api/setlists/${setlistParaExcluir.id}`);
      mostrarNotificacao('Setlist excluído com sucesso!', 'success');
      handleFecharDialogoExcluir();
      setSetlists(prev => prev.filter(s => s.id !== setlistParaExcluir.id));
    } catch (error) {
      mostrarNotificacao('Erro ao excluir o setlist.', 'error');
    }
  };

  if (carregando) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }
  
  const limiteSetlists = (usuario.plano === 'free' && setlists.length >= 1) || (usuario.plano === 'padrao' && setlists.length >= 5);
  const tooltipCriar = limiteSetlists ? `Você atingiu o limite de ${usuario.plano === 'free' ? 1 : 5} setlists do seu plano. Faça um upgrade para criar mais.` : 'Criar um novo setlist';

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold">Meus Setlists</Typography>
          <Typography color="text.secondary">Crie e organize as sequências de músicas para os seus shows.</Typography>
        </Box>
        <Tooltip title={tooltipCriar}>
          <span>
            <Button variant="contained" startIcon={limiteSetlists ? <LockIcon /> : <AddCircleOutlineIcon />} onClick={handleAbrirCriarDialogo}>
              Novo Setlist
            </Button>
          </span>
        </Tooltip>
      </Box>

      {setlists.length === 0 && !carregando ? (
        <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6">Nenhum setlist criado.</Typography>
          <Typography color="text.secondary">Clique em "Novo Setlist" para criar o seu primeiro.</Typography>
        </Paper>
      ) : (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, justifyContent: 'flex-start' }}> 
          {setlists.map((setlist) => (
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
                  <Tooltip title="Partilhar Setlist (Planos Padrão e Premium)">
                    <span>
                      <IconButton color={setlist.publico_uuid ? "primary" : "default"} onClick={() => handleAbrirDialogoPartilha(setlist)}>
                        <ShareIcon />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title="Modo Palco (Plano Premium)">
                    <span>
                      <IconButton color="secondary" onClick={() => navigate(`/setlists/palco/${setlist.id}`)}>
                        <MusicVideoIcon />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title="Editar Músicas e Detalhes">
                    <IconButton onClick={() => handleEditar(setlist.id)}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Excluir">
                    <IconButton color="error" onClick={() => handleAbrirDialogoExcluir(setlist)}>
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
            onKeyPress={(e) => e.key === 'Enter' && handleCriarNovoSetlist()}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleFecharCriarDialogo}>Cancelar</Button>
          <Button onClick={handleCriarNovoSetlist} variant="contained">Criar e Editar Músicas</Button>
        </DialogActions>
      </Dialog>
      
      <Dialog open={dialogoPartilhaAberto} onClose={handleFecharDialogoPartilha} fullWidth maxWidth="sm">
            <DialogTitle>Partilhar Setlist "{setlistSelecionado?.nome}"</DialogTitle>
            <DialogContent>
                <FormControlLabel
                    control={<Switch checked={!!setlistSelecionado?.publico_uuid} onChange={handleTogglePartilha} />}
                    label="Ativar link público de partilha"
                />
                {setlistSelecionado?.publico_uuid && (
                    <Box sx={{ mt: 2 }}>
                        <DialogContentText>Qualquer pessoa com este link poderá ver o setlist.</DialogContentText>
                        <TextField
                            fullWidth
                            readOnly
                            value={linkPublico}
                            sx={{ mt: 1 }}
                        />
                        <Button onClick={copiarLink} sx={{ mt: 1 }}>{copiado ? "Copiado!" : "Copiar Link"}</Button>
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={handleFecharDialogoPartilha}>Fechar</Button>
            </DialogActions>
        </Dialog>
        
        <Dialog
            open={dialogoExcluirAberto}
            onClose={handleFecharDialogoExcluir}
        >
            <DialogTitle>{"Confirmar Exclusão"}</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Tem certeza que deseja excluir o setlist "{setlistParaExcluir?.nome}"?
                    Esta ação não poderá ser desfeita.
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleFecharDialogoExcluir}>Cancelar</Button>
                <Button onClick={handleConfirmarExclusao} color="error" variant="contained" autoFocus>
                    Excluir
                </Button>
            </DialogActions>
        </Dialog>

        <Snackbar open={copiado} autoHideDuration={2000} onClose={() => setCopiado(false)}>
            <Alert onClose={() => setCopiado(false)} severity="success" sx={{ width: '100%' }}>
                Link copiado para a área de transferência!
            </Alert>
        </Snackbar>
    </Box>
  );
}

export default Setlists;
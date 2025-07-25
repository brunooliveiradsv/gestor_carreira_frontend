import React, { useState, useEffect, useCallback, useContext } from "react";
import apiClient from '../apiClient';
import { useNotificacao } from "../contextos/NotificationContext.jsx";
import { AuthContext } from "../contextos/AuthContext";
import { useUpgradeDialog } from '../contextos/UpgradeDialogContext';
import {
  Box, Button, Typography, CircularProgress, Paper, TextField,
  InputAdornment, Chip, IconButton, Tooltip, Dialog, Card,
  CardContent, CardActions, List, ListItem, ListItemText
} from "@mui/material";
import {
  AddCircleOutline as AddCircleOutlineIcon, Search as SearchIcon, Edit as EditIcon,
  Delete as DeleteIcon, MusicNote as MusicNoteIcon, PlaylistAddCheck as SuggestionIcon,
  Sync as SyncIcon, Lock as LockIcon
} from "@mui/icons-material";

import FormularioMusica from "../componentes/FormularioMusica.jsx";
import FormularioSugestao from "../componentes/FormularioSugestao.jsx";
import Anuncio from "../componentes/Anuncio.jsx";

// O componente SeletorDeMusica agora recebe o 'usuario' e a função de upgrade
const SeletorDeMusica = ({ onSave, onCancel, usuario, abrirDialogoDeUpgrade }) => {
    const [modo, setModo] = useState('buscar');
    const [termoBusca, setTermoBusca] = useState('');
    const [resultados, setResultados] = useState([]);
    const [buscando, setBuscando] = useState(false);
    const { mostrarNotificacao } = useNotificacao();

    const isFreePlan = usuario.plano === 'free';

    const handleBusca = async () => {
        if (!termoBusca.trim()) return;
        setBuscando(true);
        try {
            const resposta = await apiClient.get(`/api/musicas/buscar-publicas?termoBusca=${termoBusca}`);
            setResultados(resposta.data);
        } catch (error) {
            mostrarNotificacao('Erro ao buscar músicas.', 'error');
        } finally {
            setBuscando(false);
        }
    };
    
    const handleImportar = async (masterId) => {
        try {
            await apiClient.post('/api/musicas/importar', { master_id: masterId });
            mostrarNotificacao('Música importada para o seu repertório com sucesso!', 'success');
            onSave();
        } catch (error) {
            mostrarNotificacao(error.response?.data?.mensagem || 'Erro ao importar música.', 'error');
        }
    };

    const handleCriarManualClick = () => {
        if (isFreePlan) {
            abrirDialogoDeUpgrade('A criação manual de músicas está disponível a partir do plano Padrão.');
        } else {
            setModo('manual');
        }
    };

    return (
        <Box sx={{p: {xs: 2, md: 3}}}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                <Button color={modo === 'buscar' ? 'primary' : 'inherit'} onClick={() => setModo('buscar')}>Buscar no Banco de Dados</Button>
                <Tooltip title={isFreePlan ? "Disponível no Plano Padrão ou superior" : ""}>
                    <Button 
                        color={modo === 'manual' ? 'primary' : 'inherit'} 
                        onClick={handleCriarManualClick}
                        startIcon={isFreePlan ? <LockIcon fontSize="small" /> : null}
                    >
                        Criar Manualmente
                    </Button>
                </Tooltip>
            </Box>

            {modo === 'buscar' ? (
                <Box>
                    <Box component="form" onSubmit={(e) => { e.preventDefault(); handleBusca(); }} sx={{ display: 'flex', gap: 1, mb: 2 }}>
                        <TextField
                            fullWidth
                            autoFocus
                            label="Buscar por nome ou artista..."
                            value={termoBusca}
                            onChange={(e) => setTermoBusca(e.target.value)}
                        />
                        <Button type="submit" variant="contained" disabled={buscando}>
                            {buscando ? <CircularProgress size={24} /> : <SearchIcon />}
                        </Button>
                    </Box>
                    <List>
                        {resultados.map(musica => (
                            <ListItem key={musica.id} secondaryAction={
                                <Button size="small" variant="outlined" onClick={() => handleImportar(musica.id)}>Importar</Button>
                            }>
                                <ListItemText primary={musica.nome} secondary={musica.artista} />
                            </ListItem>
                        ))}
                    </List>
                </Box>
            ) : (
                <FormularioMusica onSave={onSave} onCancel={onCancel} />
            )}
        </Box>
    );
};


function Repertorio() {
  const [musicas, setMusicas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const { mostrarNotificacao } = useNotificacao();
  const { usuario } = useContext(AuthContext);
  const { abrirDialogoDeUpgrade } = useUpgradeDialog();

  const [dialogoFormularioAberto, setDialogoFormularioAberto] = useState(false);
  const [musicaEmEdicaoId, setMusicaEmEdicaoId] = useState(null);
  
  const [dialogoSugestaoAberto, setDialogoSugestaoAberto] = useState(false);
  const [musicaParaSugerir, setMusicaParaSugerir] = useState(null);
  
  const [filtros, setFiltros] = useState({ termoBusca: '', tom: '', bpm: '' });

  const isFreePlan = usuario?.plano === 'free';

  const buscarMusicas = useCallback(async () => {
    try {
      const resposta = await apiClient.get('/api/musicas', { params: filtros });
      setMusicas(resposta.data);
    } catch (error) {
      mostrarNotificacao('Erro ao carregar seu repertório.', 'error');
    } finally {
      setCarregando(false);
    }
  }, [filtros, mostrarNotificacao]);

  useEffect(() => {
    buscarMusicas();
  }, [buscarMusicas]);

  const handleAbrirFormulario = (id = null) => {
    setMusicaEmEdicaoId(id);
    setDialogoFormularioAberto(true);
  };
  const handleFecharFormulario = () => {
    setMusicaEmEdicaoId(null);
    setDialogoFormularioAberto(false);
  };
  const handleSucessoFormulario = () => {
    handleFecharFormulario();
    buscarMusicas();
  };

  const handleApagar = async (id) => {
    if (window.confirm("Tem certeza que deseja apagar esta música do seu repertório?")) {
      try {
        await apiClient.delete(`/api/musicas/${id}`);
        mostrarNotificacao('Música apagada com sucesso!', 'success');
        buscarMusicas();
      } catch (error) {
        mostrarNotificacao('Erro ao apagar música.', 'error');
      }
    }
  };
  
  const handleAbrirSugestao = (musica) => {
    if (isFreePlan) {
        abrirDialogoDeUpgrade('A sugestão de melhorias está disponível a partir do plano Padrão.');
        return;
    }
    setMusicaParaSugerir(musica);
    setDialogoSugestaoAberto(true);
  };

  const handleEditarClick = (musicaId) => {
      if (isFreePlan) {
          abrirDialogoDeUpgrade('A edição de músicas está disponível a partir do plano Padrão.');
          return;
      }
      handleAbrirFormulario(musicaId);
  };

  const handleSincronizar = async (id) => {
      try {
          await apiClient.post(`/api/musicas/${id}/sincronizar`);
          mostrarNotificacao('Música sincronizada com a versão mais recente!', 'success');
          buscarMusicas();
      } catch (error) {
          mostrarNotificacao(error.response?.data?.mensagem || 'Erro ao sincronizar.', 'error');
      }
  };

  return (
    <Box>
      <Anuncio /> {/* 1. Adicionar o componente de anúncio */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
            <Typography variant="h4" component="h1" fontWeight="bold">Meu Repertório</Typography>
            <Typography color="text.secondary">Gerencie todas as suas músicas aqui.</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddCircleOutlineIcon />} onClick={() => handleAbrirFormulario()}>
            Adicionar Música
        </Button>
      </Box>

      {carregando ? (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>
      ) : (
        musicas.length > 0 ? (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, justifyContent: 'flex-start' }}>
                {musicas.map(musica => (
                    <Box key={musica.id} sx={{ flex: '1 1 300px', maxWidth: '100%', '@media (min-width:600px)': { maxWidth: 'calc(50% - 12px)' }, '@media (min-width:960px)': { maxWidth: 'calc(33.33% - 16px)' } }}>
                        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <CardContent sx={{ flexGrow: 1 }}>
                                <Typography variant="h6" fontWeight="bold">{musica.nome}</Typography>
                                <Typography color="text.secondary" gutterBottom>{musica.artista}</Typography>
                                {musica.tom && <Chip label={`Tom: ${musica.tom}`} size="small" sx={{mr: 1}} />}
                                {musica.bpm && <Chip label={`${musica.bpm} BPM`} size="small" />}
                                {musica.is_modificada && <Chip label="Modificada" size="small" color="warning" sx={{ml: 1}} />}
                            </CardContent>
                            <CardActions>
                                {musica.master_id && (
                                    <Tooltip title="Sincronizar com a música original do banco de dados">
                                        <IconButton onClick={() => handleSincronizar(musica.id)}><SyncIcon /></IconButton>
                                    </Tooltip>
                                )}
                                <Box sx={{ flexGrow: 1 }} />
                                <Tooltip title={isFreePlan ? "Disponível no Plano Padrão" : "Sugerir Melhoria"}>
                                    <span>
                                        <IconButton onClick={() => handleAbrirSugestao(musica)}>
                                            <SuggestionIcon color={isFreePlan ? 'disabled' : 'inherit'} />
                                        </IconButton>
                                    </span>
                                </Tooltip>
                                <Tooltip title={isFreePlan ? "Disponível no Plano Padrão" : "Editar"}>
                                    <span>
                                        <IconButton onClick={() => handleEditarClick(musica.id)}>
                                            <EditIcon color={isFreePlan ? 'disabled' : 'inherit'} />
                                        </IconButton>
                                    </span>
                                </Tooltip>
                                <Tooltip title="Apagar"><IconButton onClick={() => handleApagar(musica.id)} color="error"><DeleteIcon /></IconButton></Tooltip>
                            </CardActions>
                        </Card>
                    </Box>
                ))}
            </Box>
        ) : (
            <Paper variant="outlined" sx={{p: 4, textAlign: 'center', width: '100%'}}>
                <MusicNoteIcon sx={{fontSize: 48, color: 'text.secondary', mb: 2}} />
                <Typography variant="h6">Nenhuma música encontrada</Typography>
                <Typography color="text.secondary">Adicione uma música ou ajuste a sua busca.</Typography>
            </Paper>
        )
      )}
      
      <Dialog open={dialogoFormularioAberto} onClose={handleFecharFormulario} fullWidth maxWidth="sm">
        {musicaEmEdicaoId ? (
            <FormularioMusica id={musicaEmEdicaoId} onSave={handleSucessoFormulario} onCancel={handleFecharFormulario} />
        ) : (
            <SeletorDeMusica onSave={handleSucessoFormulario} onCancel={handleFecharFormulario} usuario={usuario} abrirDialogoDeUpgrade={abrirDialogoDeUpgrade} />
        )}
      </Dialog>
      
      {musicaParaSugerir && (
        <FormularioSugestao open={dialogoSugestaoAberto} onClose={() => setDialogoSugestaoAberto(false)} musica={musicaParaSugerir} />
      )}
    </Box>
  );
}

export default Repertorio;
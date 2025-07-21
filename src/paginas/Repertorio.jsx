// src/paginas/Repertorio.jsx
import { useState, useEffect, useCallback } from "react";
import apiClient from "../api.js";
import { useNotificacao } from "../contextos/NotificationContext.jsx";
import {
  Box, Button, Typography, CircularProgress, Paper, Grid, TextField,
  InputAdornment, Chip, IconButton, Tooltip, Dialog, Card,
  CardContent, CardActions, List, ListItem, ListItemText
} from "@mui/material";
import {
  AddCircleOutline as AddCircleOutlineIcon, Search as SearchIcon, Edit as EditIcon,
  Delete as DeleteIcon, MusicNote as MusicNoteIcon, PlaylistAddCheck as SuggestionIcon,
  ImportExport as ImportExportIcon
} from "@mui/icons-material";

import FormularioMusica from "../componentes/FormularioMusica.jsx";
import FormularioSugestao from "../componentes/FormularioSugestao.jsx";

const SeletorDeMusica = ({ onSave, onCancel }) => {
    const [modo, setModo] = useState('buscar');
    const [termoBusca, setTermoBusca] = useState('');
    const [resultados, setResultados] = useState([]);
    const [buscando, setBuscando] = useState(false);
    const { mostrarNotificacao } = useNotificacao();

    const handleBusca = async () => {
        if (!termoBusca.trim()) return;
        setBuscando(true);
        try {
            const resposta = await apiClient.get(`/api/musicas/buscar-publicas?termoBusca=${termoBusca}`);
            setResultados(resposta.data);
        } catch (error) { mostrarNotificacao("Erro ao buscar músicas.", "error"); }
        finally { setBuscando(false); }
    };

    const handleImportar = async (masterId) => {
        try {
            await apiClient.post('/api/musicas/importar', { master_id: masterId });
            mostrarNotificacao('Música importada com sucesso!', 'success');
            onSave();
        } catch (error) {
            mostrarNotificacao(error.response?.data?.mensagem || 'Erro ao importar música.', 'error');
        }
    };

    if (modo === 'manual') {
        return <FormularioMusica onSave={onSave} onCancel={onCancel} />;
    }

    return (
        <Box sx={{p: {xs: 2, md: 3}}}>
            <Typography variant="h5" gutterBottom>Adicionar Música ao Repertório</Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Button color={modo === 'buscar' ? 'primary' : 'inherit'} onClick={() => setModo('buscar')}>Buscar no Banco de Dados</Button>
                <Button color={modo === 'manual' ? 'primary' : 'inherit'} onClick={() => setModo('manual')}>Criar Manualmente</Button>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField fullWidth label="Buscar por nome ou artista..." value={termoBusca}
                    onChange={(e) => setTermoBusca(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleBusca()}
                    InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }} />
                <Button variant="contained" onClick={handleBusca} disabled={buscando}>
                    {buscando ? <CircularProgress size={24} /> : 'Buscar'}
                </Button>
            </Box>
            <Paper variant="outlined" sx={{ minHeight: '300px', maxHeight: '300px', overflowY: 'auto' }}>
                <List>
                    {resultados.map(musica => (
                        <ListItem key={musica.id} secondaryAction={
                            <Tooltip title="Importar para o seu repertório"><IconButton onClick={() => handleImportar(musica.id)}><ImportExportIcon color="primary" /></IconButton></Tooltip>
                        }>
                            <ListItemText primary={musica.nome} secondary={musica.artista} />
                        </ListItem>
                    ))}
                </List>
            </Paper>
        </Box>
    );
};

function Repertorio() {
  const [musicas, setMusicas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [buscaGeral, setBuscaGeral] = useState("");
  const [dialogoFormularioAberto, setDialogoFormularioAberto] = useState(false);
  const [musicaEmEdicaoId, setMusicaEmEdicaoId] = useState(null);
  const [dialogoSugestaoAberto, setDialogoSugestaoAberto] = useState(false);
  const [musicaParaSugerir, setMusicaParaSugerir] = useState(null);
  const { mostrarNotificacao } = useNotificacao();

  const buscarMusicas = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (buscaGeral) {
        params.append('buscaGeral', buscaGeral);
      }

      const resposta = await apiClient.get(`/api/musicas?${params.toString()}`);
      setMusicas(resposta.data);
    } catch (erro) {
      mostrarNotificacao("Não foi possível carregar o repertório.", "error");
    } finally {
      setCarregando(false);
    }
  }, [mostrarNotificacao, buscaGeral]);

  useEffect(() => {
    setCarregando(true);
    const timer = setTimeout(() => {
      buscarMusicas();
    }, 500);

    return () => clearTimeout(timer);
  }, [buscaGeral, buscarMusicas]);

  const handleAbrirFormulario = (id = null) => {
    setMusicaEmEdicaoId(id);
    setDialogoFormularioAberto(true);
  };

  const handleFecharFormulario = () => {
    setDialogoFormularioAberto(false);
    setMusicaEmEdicaoId(null);
  };

  const handleSucessoFormulario = () => {
    handleFecharFormulario();
    buscarMusicas();
  };

  const handleAbrirSugestao = (musica) => {
    setMusicaParaSugerir(musica);
    setDialogoSugestaoAberto(true);
  };

  const handleApagar = async (id) => {
    if (window.confirm("Tem certeza que deseja apagar esta música?")) {
      try {
        await apiClient.delete(`/api/musicas/${id}`);
        mostrarNotificacao("Música apagada com sucesso!", "success");
        buscarMusicas();
      } catch (erro) {
        mostrarNotificacao("Falha ao apagar a música.", "error");
      }
    }
  };

  return (
    <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
            <Box>
                <Typography variant="h4" component="h1" fontWeight="bold">Repertório</Typography>
                <Typography color="text.secondary">Adicione, filtre e gerencie todas as suas músicas.</Typography>
            </Box>
            <Button variant="contained" startIcon={<AddCircleOutlineIcon />} onClick={() => handleAbrirFormulario()}>
            Adicionar Música
            </Button>
        </Box>

        <Paper sx={{ p: { xs: 2, md: 3 }, mb: 4 }}>
            <TextField
                fullWidth
                name="buscaGeral"
                label="Buscar por nome, artista, tom ou BPM..."
                value={buscaGeral}
                onChange={(e) => setBuscaGeral(e.target.value)}
                InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>) }}
            />
        </Paper>

        {carregando ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
        ) : (
            <Grid container spacing={3}>
            {musicas.length > 0 ? (
                musicas.map((musica) => (
                <Grid item xs={12} sm={6} md={4} key={musica.id}>
                    <Card sx={{height: '100%', display: 'flex', flexDirection: 'column'}}>
                        <CardContent sx={{flexGrow: 1}}>
                            <Typography variant="h6" fontWeight="medium">{musica.nome}</Typography>
                            <Typography component="div" color="text.secondary" variant="body2">
                              {musica.artista}
                              {musica.master_id && <Chip label="Importada" size="small" variant="outlined" color="primary" sx={{ ml: 1 }} />}
                              {musica.is_modificada && <Chip label="Modificada" size="small" variant="outlined" color="secondary" sx={{ ml: 1 }} />}
                            </Typography>
                            <Typography color="text.secondary" variant="body2" sx={{mt: 0.5}}>Tom: {musica.tom || "N/A"} | BPM: {musica.bpm || "N/A"}</Typography>
                            <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {musica.tags?.map((tag) => <Chip key={tag.id} label={tag.nome} size="small" variant="outlined" />)}
                            </Box>
                        </CardContent>
                        <CardActions sx={{justifyContent: 'flex-end'}}>
                            {musica.master_id && <Tooltip title="Sugerir Melhoria"><IconButton onClick={() => handleAbrirSugestao(musica)}><SuggestionIcon /></IconButton></Tooltip>}
                            <Tooltip title="Editar"><IconButton onClick={() => handleAbrirFormulario(musica.id)}><EditIcon /></IconButton></Tooltip>
                            <Tooltip title="Apagar"><IconButton onClick={() => handleApagar(musica.id)} color="error"><DeleteIcon /></IconButton></Tooltip>
                        </CardActions>
                    </Card>
                </Grid>
                ))
            ) : (
                <Grid item xs={12}>
                    <Paper variant="outlined" sx={{p: 4, textAlign: 'center'}}>
                        <MusicNoteIcon sx={{fontSize: 48, color: 'text.secondary', mb: 2}} />
                        <Typography variant="h6">Nenhuma música encontrada</Typography>
                        <Typography color="text.secondary">Adicione uma música ou ajuste sua busca.</Typography>
                    </Paper>
                </Grid>
            )}
            </Grid>
        )}

      <Dialog open={dialogoFormularioAberto} onClose={handleFecharFormulario} fullWidth maxWidth="md">
        {musicaEmEdicaoId ? (
            <Box sx={{p: {xs: 2, md: 3}}}>
                <FormularioMusica id={musicaEmEdicaoId} onSave={handleSucessoFormulario} onCancel={handleFecharFormulario} />
            </Box>
        ) : (
            <SeletorDeMusica onSave={handleSucessoFormulario} onCancel={handleFecharFormulario} />
        )}
      </Dialog>

      {musicaParaSugerir && (
        <FormularioSugestao open={dialogoSugestaoAberto} onClose={() => setDialogoSugestaoAberto(false)} musica={musicaParaSugerir} />
      )}
    </Box>
  );
}

export default Repertorio;
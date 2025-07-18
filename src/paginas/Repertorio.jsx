// src/paginas/Repertorio.jsx

import { useState, useEffect, useCallback } from "react";
import apiClient from "../api.js";
import { useNotificacao } from "../contextos/NotificationContext.jsx";

// Componentes do Material-UI
import {
  Box, Button, Typography, CircularProgress, Paper,
  Grid, TextField, InputAdornment, MenuItem,
  Chip, IconButton, Tooltip, Dialog, Card, CardContent, CardActions,
  List, ListItem, ListItemText
} from "@mui/material";

// Ícones
import {
  AddCircleOutline as AddCircleOutlineIcon, Search as SearchIcon,
  Edit as EditIcon, Delete as DeleteIcon,
  MusicNote as MusicNoteIcon,
  PlaylistAddCheck as SuggestionIcon,
  ImportExport as ImportExportIcon,
} from "@mui/icons-material";

// Componentes do formulário
import FormularioMusica from "../componentes/FormularioMusica.jsx";
import FormularioSugestao from "../componentes/FormularioSugestao.jsx";


// --- NOVO COMPONENTE INTERNO PARA O DIALOG DE ADICIONAR MÚSICA ---
const SeletorDeMusica = ({ onSave, onCancel }) => {
    const [modo, setModo] = useState('buscar'); // 'buscar' ou 'manual'
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
        } catch (error) {
            mostrarNotificacao("Erro ao buscar músicas.", "error");
        } finally {
            setBuscando(false);
        }
    };

    const handleImportar = async (masterId) => {
        try {
            await apiClient.post('/api/musicas/importar', { master_id: masterId });
            mostrarNotificacao('Música importada com sucesso!', 'success');
            onSave(); // Fecha o dialog e atualiza a lista principal
        } catch (error) {
            mostrarNotificacao(error.response?.data?.mensagem || 'Erro ao importar música.', 'error');
        }
    };

    if (modo === 'manual') {
        // Renderiza o seu formulário existente para criação manual
        return <FormularioMusica onSave={onSave} onCancel={onCancel} />;
    }

    return (
        <Box sx={{p: {xs: 2, md: 3}}}>
            <Typography variant="h5" gutterBottom>Adicionar Música ao Repertório</Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Button variant={modo === 'buscar' ? 'contained' : 'outlined'} onClick={() => setModo('buscar')}>
                    Buscar no Banco de Dados
                </Button>
                <Button variant={modo === 'manual' ? 'contained' : 'outlined'} onClick={() => setModo('manual')}>
                    Criar Manualmente
                </Button>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField 
                    fullWidth
                    label="Buscar por nome ou artista..."
                    value={termoBusca}
                    onChange={(e) => setTermoBusca(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleBusca()}
                    InputProps={{
                        startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
                    }}
                />
                <Button variant="contained" onClick={handleBusca} disabled={buscando}>
                    {buscando ? <CircularProgress size={24} /> : 'Buscar'}
                </Button>
            </Box>
            <Paper variant="outlined" sx={{ minHeight: '300px', maxHeight: '300px', overflowY: 'auto' }}>
                <List>
                    {resultados.map(musica => (
                        <ListItem
                            key={musica.id}
                            secondaryAction={
                                <Tooltip title="Importar para o seu repertório">
                                    <IconButton onClick={() => handleImportar(musica.id)}>
                                        <ImportExportIcon color="primary" />
                                    </IconButton>
                                </Tooltip>
                            }
                        >
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
  const [tagsDisponiveis, setTagsDisponiveis] = useState([]);
  
  const [carregando, setCarregando] = useState(true);
  const [filtros, setFiltros] = useState({ termoBusca: "", tags: [] });
  const [dialogoFormularioAberto, setDialogoFormularioAberto] = useState(false);
  const [musicaEmEdicaoId, setMusicaEmEdicaoId] = useState(null);
  const [dialogoSugestaoAberto, setDialogoSugestaoAberto] = useState(false);
  const [musicaParaSugerir, setMusicaParaSugerir] = useState(null);

  const { mostrarNotificacao } = useNotificacao();

  // A função de busca agora aponta para a rota do repertório do usuário
  const buscarMusicas = useCallback(async () => {
    setCarregando(true);
    try {
      const params = new URLSearchParams();
      if (filtros.termoBusca) params.append("termoBusca", filtros.termoBusca);
      if (filtros.tags.length > 0) params.append("tags", filtros.tags.join(","));

      const resposta = await apiClient.get("/api/musicas", { params });
      setMusicas(resposta.data);
    } catch (erro) {
      mostrarNotificacao("Não foi possível carregar o repertório.", "error");
    } finally {
      setCarregando(false);
    }
  }, [mostrarNotificacao, filtros]);

  useEffect(() => {
    apiClient.get("/api/tags")
      .then((resposta) => setTagsDisponiveis(resposta.data))
      .catch(() => mostrarNotificacao("Não foi possível carregar as tags para filtro.", "error"));
  }, [mostrarNotificacao]);

  useEffect(() => {
    buscarMusicas();
  }, [buscarMusicas]);

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
    if (window.confirm("Tem certeza que deseja apagar esta música do seu repertório?")) {
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
                <Typography variant="h4" component="h1" fontWeight="bold">Repertório Geral</Typography>
                <Typography color="text.secondary">Adicione e gerencie todas as suas músicas.</Typography>
            </Box>
            {/* O botão agora abre o seletor genérico */}
            <Button variant="contained" startIcon={<AddCircleOutlineIcon />} onClick={() => handleAbrirFormulario()}>
            Adicionar Música
            </Button>
        </Box>

        <Paper sx={{ p: { xs: 2, md: 3 }, mb: 4 }}>
            <Grid container spacing={2}>
            {/* ... (Seus filtros permanecem os mesmos) ... */}
            </Grid>
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
                            <Typography color="text.secondary" variant="body2">
                                {musica.artista}
                                {musica.master_id && <Chip label="Importada" size="small" variant="outlined" color="primary" sx={{ ml: 1 }} />}
                            </Typography>
                            <Typography color="text.secondary" variant="body2" sx={{mt: 0.5}}>
                                Tom: {musica.tom || "N/A"}
                            </Typography>
                            <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {musica.tags?.map((tag) => <Chip key={tag.id} label={tag.nome} size="small" variant="outlined" />)}
                            </Box>
                        </CardContent>
                        <CardActions sx={{justifyContent: 'flex-end'}}>
                            {/* O botão de sugestão só aparece se a música for importada */}
                            {musica.master_id && (
                                <Tooltip title="Sugerir Melhoria para o Banco de Dados">
                                    <IconButton onClick={() => handleAbrirSugestao(musica)}>
                                        <SuggestionIcon />
                                    </IconButton>
                                </Tooltip>
                            )}
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
                        <Typography color="text.secondary">Adicione uma música ou ajuste seus filtros.</Typography>
                    </Paper>
                </Grid>
            )}
            </Grid>
        )}
      
      {/* O Dialog agora decide o que mostrar: o seletor ou o formulário de edição */}
      <Dialog open={dialogoFormularioAberto} onClose={handleFecharFormulario} fullWidth maxWidth="md">
            {musicaEmEdicaoId ? (
                // Se está editando, mostra o formulário de edição
                <Box sx={{p: {xs: 2, md: 3}}}>
                    <FormularioMusica id={musicaEmEdicaoId} onSave={handleSucessoFormulario} onCancel={handleFecharFormulario} />
                </Box>
            ) : (
                // Se está criando, mostra o novo seletor
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
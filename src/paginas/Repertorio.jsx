// src/paginas/Repertorio.jsx

import { useState, useEffect, useCallback } from "react";
import apiClient from "../api.js";
import { useNotificacao } from "../contextos/NotificationContext.jsx";

// Componentes do Material-UI
import {
  Box, Button, Typography, CircularProgress, Paper,
  Grid, TextField, InputAdornment, MenuItem,
  Chip, IconButton, Tooltip, Dialog, Card, CardContent, CardActions
} from "@mui/material";

// Ícones
import {
  AddCircleOutline as AddCircleOutlineIcon, Search as SearchIcon,
  Edit as EditIcon, Delete as DeleteIcon,
  MusicNote as MusicNoteIcon,
  PlaylistAddCheck as SuggestionIcon,
} from "@mui/icons-material";

// Componentes do formulário
import FormularioMusica from "../componentes/FormularioMusica.jsx";
import FormularioSugestao from "../componentes/FormularioSugestao.jsx";

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
                <Typography variant="h4" component="h1" fontWeight="bold">Repertório Geral</Typography>
                <Typography color="text.secondary">Adicione e gerencie todas as suas músicas.</Typography>
            </Box>
            <Button variant="contained" startIcon={<AddCircleOutlineIcon />} onClick={() => handleAbrirFormulario()}>
            Adicionar Música
            </Button>
        </Box>

        <Paper sx={{ p: { xs: 2, md: 3 }, mb: 4 }}>
            <Grid container spacing={2}>
            <Grid item xs={12} md={5}> 
                <TextField fullWidth label="Buscar por nome ou artista..."
                value={filtros.termoBusca}
                onChange={(e) => setFiltros(f => ({ ...f, termoBusca: e.target.value }))}
                InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>) }}
                />
            </Grid>
            <Grid item xs={12} md={7}>
                <TextField
                  fullWidth
                  select
                  label="Filtrar por Tags"
                  value={filtros.tags}
                  onChange={(e) => setFiltros(f => ({ ...f, tags: e.target.value }))}
                  // --- ESTA É A CORREÇÃO FINAL ---
                  // Força o label a ficar sempre na posição "encolhida" (flutuando)
                  InputLabelProps={{ shrink: true }}
                  SelectProps={{
                    multiple: true,
                    value: filtros.tags,
                    renderValue: (selectedIds) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selectedIds.map((id) => {
                          const tag = tagsDisponiveis.find((t) => t.id === id);
                          return <Chip key={id} label={tag ? tag.nome : id} size="small" />;
                        })}
                      </Box>
                    ),
                  }}
                >
                  {tagsDisponiveis.map((tag) => (
                    <MenuItem key={tag.id} value={tag.id}>
                      {tag.nome}
                    </MenuItem>
                  ))}
                </TextField>
            </Grid>
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
                            </Typography>
                             <Typography color="text.secondary" variant="body2" sx={{mt: 0.5}}>
                                Tom: {musica.tom || "N/A"}
                            </Typography>
                            <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {musica.tags.map((tag) => <Chip key={tag.id} label={tag.nome} size="small" variant="outlined" />)}
                            </Box>
                        </CardContent>
                        <CardActions sx={{justifyContent: 'flex-end'}}>
                            <Tooltip title="Sugerir Melhoria"><IconButton onClick={() => handleAbrirSugestao(musica)}><SuggestionIcon /></IconButton></Tooltip>
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
      
      <Dialog open={dialogoFormularioAberto} onClose={handleFecharFormulario} fullWidth maxWidth="md">
        <Box sx={{p: {xs: 2, md: 3}}}>
            <FormularioMusica id={musicaEmEdicaoId} onSave={handleSucessoFormulario} onCancel={handleFecharFormulario} />
        </Box>
      </Dialog>
      
      {musicaParaSugerir && (
        <FormularioSugestao open={dialogoSugestaoAberto} onClose={() => setDialogoSugestaoAberto(false)} musica={musicaParaSugerir} />
      )}
    </Box>
  );
}

export default Repertorio;
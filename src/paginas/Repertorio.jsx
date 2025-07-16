// src/paginas/Repertorio.jsx

import { useState, useEffect, useCallback } from "react";
import apiClient from "../api.js";
import { useNotificacao } from "../contextos/NotificationContext.jsx";

// Componentes do Material-UI
import {
  Box, Button, Container, Typography, CircularProgress, Paper,
  Grid, TextField, InputAdornment, Select, MenuItem, FormControl,
  InputLabel, Chip, OutlinedInput, IconButton, Tooltip, Dialog
} from "@mui/material";

// Ícones
import {
  AddCircleOutline as AddCircleOutlineIcon, Search as SearchIcon,
  Edit as EditIcon, Delete as DeleteIcon, LibraryMusic as LibraryMusicIcon,
  PlaylistAddCheck as SuggestionIcon,
} from "@mui/icons-material";

// Componentes do formulário
import FormularioMusica from "../componentes/FormularioMusica.jsx";
import FormularioSugestao from "../componentes/FormularioSugestao.jsx";

function Repertorios() {
  // Estados para os dados
  const [musicas, setMusicas] = useState([]);
  const [tagsDisponiveis, setTagsDisponiveis] = useState([]);
  
  // Estados de controlo da UI
  const [carregando, setCarregando] = useState(true);
  const [filtros, setFiltros] = useState({ termoBusca: "", tags: [] });
  const [dialogoFormularioAberto, setDialogoFormularioAberto] = useState(false);
  const [musicaEmEdicaoId, setMusicaEmEdicaoId] = useState(null);
  const [dialogoSugestaoAberto, setDialogoSugestaoAberto] = useState(false);
  const [musicaParaSugerir, setMusicaParaSugerir] = useState(null);

  const { mostrarNotificacao } = useNotificacao();

  // Função para buscar as músicas com base nos filtros
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

  // Efeito para buscar as tags uma vez
  useEffect(() => {
    apiClient.get("/api/tags")
      .then((resposta) => setTagsDisponiveis(resposta.data))
      .catch(() => mostrarNotificacao("Não foi possível carregar as tags para filtro.", "error"));
  }, [mostrarNotificacao]);

  // Efeito para buscar as músicas sempre que os filtros mudam
  useEffect(() => {
    buscarMusicas();
  }, [buscarMusicas]);

  // Funções para controlar os diálogos
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
    buscarMusicas(); // Atualiza a lista após salvar
  };

  const handleAbrirSugestao = (musica) => {
    setMusicaParaSugerir(musica);
    setDialogoSugestaoAberto(true);
  };

  // Função para apagar uma música
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
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={6} sx={{ p: { xs: 2, md: 4 } }}>
        {/* Cabeçalho */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h4" component="h1" fontWeight="bold">Repertório Geral</Typography>
          <Button variant="contained" startIcon={<AddCircleOutlineIcon />} onClick={() => handleAbrirFormulario()}>
            Adicionar Música
          </Button>
        </Box>

        {/* Filtros */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} md={8}>
            <TextField fullWidth label="Buscar por nome ou artista..."
              value={filtros.termoBusca}
              onChange={(e) => setFiltros(f => ({ ...f, termoBusca: e.target.value }))}
              InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>) }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Filtrar por Tags</InputLabel>
              <Select multiple
                value={filtros.tags}
                onChange={(e) => setFiltros(f => ({ ...f, tags: e.target.value }))}
                input={<OutlinedInput label="Filtrar por Tags" />}
                renderValue={(selectedIds) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {selectedIds.map((id) => {
                      const tag = tagsDisponiveis.find((t) => t.id === id);
                      return <Chip key={id} label={tag ? tag.nome : id} size="small" />;
                    })}
                  </Box>
                )}
              >
                {tagsDisponiveis.map((tag) => <MenuItem key={tag.id} value={tag.id}>{tag.nome}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* Lista de Músicas */}
        {carregando ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
        ) : (
          <Grid container spacing={2}>
            {musicas.length > 0 ? (
              musicas.map((musica) => (
                <Grid item xs={12} key={musica.id}>
                  <Paper variant="outlined" sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="h6">{musica.nome}</Typography>
                      <Typography color="text.secondary">{musica.artista} - Tom: {musica.tom || "N/A"}</Typography>
                      <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {musica.tags.map((tag) => <Chip key={tag.id} label={tag.nome} size="small" variant="outlined" />)}
                      </Box>
                    </Box>
                    <Box>
                      <Tooltip title="Sugerir Melhoria"><IconButton onClick={() => handleAbrirSugestao(musica)} color="secondary"><SuggestionIcon /></IconButton></Tooltip>
                      <Tooltip title="Editar Música"><IconButton onClick={() => handleAbrirFormulario(musica.id)}><EditIcon /></IconButton></Tooltip>
                      <Tooltip title="Apagar Música"><IconButton onClick={() => handleApagar(musica.id)} color="error"><DeleteIcon /></IconButton></Tooltip>
                    </Box>
                  </Paper>
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Typography sx={{ textAlign: 'center', p: 4 }}>Nenhuma música encontrada. Que tal adicionar uma nova?</Typography>
              </Grid>
            )}
          </Grid>
        )}
      </Paper>
      
      {/* Diálogo para o Formulário */}
      <Dialog open={dialogoFormularioAberto} onClose={handleFecharFormulario} fullWidth maxWidth="md">
        <Box sx={{p: {xs: 2, md: 3}}}>
            <FormularioMusica id={musicaEmEdicaoId} onSave={handleSucessoFormulario} onCancel={handleFecharFormulario} />
        </Box>
      </Dialog>
      
      {/* Diálogo para Sugestões */}
      {musicaParaSugerir && (
        <FormularioSugestao open={dialogoSugestaoAberto} onClose={() => setDialogoSugestaoAberto(false)} musica={musicaParaSugerir} />
      )}
    </Container>
  );
}

export default Repertorio;
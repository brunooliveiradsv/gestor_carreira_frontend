// src/paginas/EditorDeSetlist.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiClient from "../api";
import { useNotificacao } from "../contextos/NotificationContext";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import {
  Box, Typography, Paper, CircularProgress, Grid,
  List, ListItem, ListItemText, IconButton, Tooltip,
  TextField, InputAdornment, Button, ListItemIcon
} from "@mui/material";
import {
  Save as SaveIcon, ArrowBack as ArrowBackIcon, Search as SearchIcon,
  PlaylistAdd as PlaylistAddIcon, Delete as DeleteIcon, DragIndicator as DragIndicatorIcon,
  RemoveCircleOutline as RemoveCircleOutlineIcon // Novo ícone para remover rápido
} from "@mui/icons-material"; // Importe o novo ícone

const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

function EditorDeSetlist() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { mostrarNotificacao } = useNotificacao();

  const [nomeSetlist, setNomeSetlist] = useState('');
  const [notasSetlist, setNotasSetlist] = useState('');
  const [musicasNoSetlist, setMusicasNoSetlist] = useState([]);
  const [repertorioGeral, setRepertorioGeral] = useState([]);
  const [termoBusca, setTermoBusca] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  const buscarDados = useCallback(async () => {
    try {
      const [setlistRes, repertorioRes] = await Promise.all([
        apiClient.get(`/api/setlists/${id}`),
        apiClient.get(`/api/musicas?termoBusca=${termoBusca}`),
      ]);

      setNomeSetlist(setlistRes.data.nome);
      setNotasSetlist(setlistRes.data.notas_adicionais || '');
      // Garante que 'musicas' seja um array, mesmo que venha nulo/undefined
      const setlistMusicas = setlistRes.data.musicas || [];
      setMusicasNoSetlist(setlistMusicas);

      const idsNoSetlist = new Set(setlistMusicas.map((m) => m.id));
      setRepertorioGeral(repertorioRes.data.filter((m) => !idsNoSetlist.has(m.id)));
    } catch (error) {
      mostrarNotificacao("Erro ao carregar dados do editor.", "error");
      navigate("/setlists");
    } finally {
      setCarregando(false);
    }
  }, [id, termoBusca, navigate, mostrarNotificacao]);

  useEffect(() => {
    buscarDados();
  }, [buscarDados]);

  const onDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;

    // Se moveu dentro do setlist
    if (source.droppableId === "setlist" && destination.droppableId === "setlist") {
      setMusicasNoSetlist(reorder(musicasNoSetlist, source.index, destination.index));
    }
    // Se moveu do repertório para o setlist
    else if (source.droppableId === "repertorio" && destination.droppableId === "setlist") {
      const itemMovido = repertorioGeral[source.index];
      setRepertorioGeral(repertorioGeral.filter((_, i) => i !== source.index));
      const novoSetlist = [...musicasNoSetlist];
      novoSetlist.splice(destination.index, 0, itemMovido);
      setMusicasNoSetlist(novoSetlist);
    }
    // Se moveu do setlist para o repertório (apenas drag out, não drag back in)
    // Opcional: Se quiser permitir arrastar do setlist de volta para o repertório, adicione uma lógica aqui
    // No momento, 'removerDoSetlist' é o método principal para isso.
  };
  
  // Função para remover uma música do setlist
  const removerDoSetlist = (musica, index) => {
    setMusicasNoSetlist(musicasNoSetlist.filter((_, i) => i !== index));
    // Verifica se a música já existe no repertório geral antes de adicionar, para evitar duplicatas visuais
    if (!repertorioGeral.some(m => m.id === musica.id)) {
        setRepertorioGeral((atual) => [musica, ...atual]);
    }
  };
  
  // Função para adicionar uma música do repertório ao setlist
  const adicionarAoSetlist = (musica) => {
    setMusicasNoSetlist((prev) => [...prev, musica]);
    setRepertorioGeral((prev) => prev.filter((m) => m.id !== musica.id));
  };
  
  const handleSalvar = async () => {
    setSalvando(true);
    try {
      const musicasIds = musicasNoSetlist.map((m) => m.id);
      
      await Promise.all([
        apiClient.put(`/api/setlists/${id}`, { nome: nomeSetlist, notas_adicionais: notasSetlist }),
        apiClient.put(`/api/setlists/${id}/musicas`, { musicasIds })
      ]);

      mostrarNotificacao("Setlist salvo com sucesso!", "success");
      navigate("/setlists");
    } catch (error) {
      mostrarNotificacao("Erro ao salvar o setlist.", "error");
    } finally {
      setSalvando(false);
    }
  };

  if (carregando) {
    return <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}><CircularProgress /></Box>;
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: { xs: 'auto', md: 'calc(100vh - 112px)' } }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, flexShrink: 0, flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Tooltip title="Voltar para Setlists">
              <IconButton onClick={() => navigate("/setlists")}><ArrowBackIcon /></IconButton>
            </Tooltip>
            <Typography variant="h5" fontWeight="bold">{nomeSetlist}</Typography>
          </Box>
          <Button variant="contained" startIcon={salvando ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />} onClick={handleSalvar} disabled={salvando} sx={{ width: { xs: '100%', sm: 'auto' } }}>
            Salvar
          </Button>
        </Box>

        <Paper sx={{ p: { xs: 2, md: 3 }, mb: 3, flexShrink: 0 }}>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                    <TextField 
                        fullWidth
                        label="Nome do Setlist"
                        value={nomeSetlist}
                        onChange={(e) => setNomeSetlist(e.target.value)}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField 
                        fullWidth
                        label="Notas Adicionais"
                        value={notasSetlist}
                        onChange={(e) => setNotasSetlist(e.target.value)}
                    />
                </Grid>
            </Grid>
        </Paper>

        <Grid container spacing={3} sx={{ flexGrow: 1, overflow: 'hidden' }}>
          <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column' }}>
            <Paper sx={{ p: 2, flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', mb: { xs: 3, md: 0 } }}>
              <Typography variant="h6" gutterBottom>Repertório Geral</Typography>
              <TextField fullWidth placeholder="Buscar no repertório..." value={termoBusca}
                onChange={(e) => setTermoBusca(e.target.value)} sx={{ mb: 2, flexShrink: 0 }}
                InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>) }}
              />
              <Droppable droppableId="repertorio">
                {(provided) => (
                  <List dense sx={{ overflowY: 'auto', flexGrow: 1 }} {...provided.droppableProps} ref={provided.innerRef}>
                    {repertorioGeral.map((musica, index) => (
                      <Draggable key={`musica-${musica.id}`} draggableId={`musica-${musica.id}`} index={index}>
                        {(provided) => (
                          <ListItem
                            ref={provided.innerRef} {...provided.draggableProps} // DragHandleProps removido para que o botão 'adicionar' não seja arrastável
                            secondaryAction={
                              <Tooltip title="Adicionar ao Setlist">
                                {/* Botão de Adicionar Rápido */}
                                <IconButton edge="end" onClick={() => adicionarAoSetlist(musica)}>
                                    <PlaylistAddIcon />
                                </IconButton>
                              </Tooltip>
                            }
                            sx={{ mb: 1, bgcolor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}
                          >
                            {/* Drag handle separado para a funcionalidade de arrastar e soltar */}
                            <ListItemIcon sx={{minWidth: 32, color: 'text.secondary'}} {...provided.dragHandleProps}>
                                <DragIndicatorIcon />
                            </ListItemIcon>
                            <ListItemText primary={musica.nome} secondary={musica.artista} />
                          </ListItem>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </List>
                )}
              </Droppable>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column' }}>
            <Paper sx={{ p: 2, flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', bgcolor: 'action.selected' }}>
              <Typography variant="h6" gutterBottom>Músicas no Setlist ({musicasNoSetlist.length})</Typography>
                <Droppable droppableId="setlist">
                {(provided) => (
                  <List dense sx={{ overflowY: 'auto', flexGrow: 1 }} {...provided.droppableProps} ref={provided.innerRef}>
                    {musicasNoSetlist.map((musica, index) => (
                      <Draggable key={`setlist-${musica.id}`} draggableId={`setlist-${musica.id}`} index={index}>
                        {(provided) => (
                          <ListItem
                            ref={provided.innerRef} {...provided.draggableProps} // DragHandleProps removido
                            secondaryAction={
                              <Tooltip title="Remover do Setlist">
                                {/* Botão de Remover Rápido */}
                                <IconButton edge="end" onClick={() => removerDoSetlist(musica, index)}>
                                    <RemoveCircleOutlineIcon color="error" />
                                </IconButton>
                              </Tooltip>
                            }
                            sx={{ mb: 1, bgcolor: 'background.paper', borderRadius: 2 }}
                          >
                            {/* Drag handle separado para a funcionalidade de arrastar e soltar */}
                            <ListItemIcon sx={{minWidth: 32, color: 'text.secondary'}} {...provided.dragHandleProps}>
                                <DragIndicatorIcon />
                            </ListItemIcon>
                            <ListItemText primary={musica.nome} secondary={musica.artista} />
                          </ListItem>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </List>
                )}
              </Droppable>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </DragDropContext>
  );
}

export default EditorDeSetlist;
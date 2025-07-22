// src/paginas/EditorDeSetlist.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiClient from "../api";
import { useNotificacao } from "../contextos/NotificationContext";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { FixedSizeList } from 'react-window'; // Importação do FixedSizeList

import {
  Box, Typography, Paper, CircularProgress, Grid,
  List, ListItem, ListItemText, IconButton, Tooltip,
  TextField, InputAdornment, Button, ListItemIcon
} from "@mui/material";
import {
  Save as SaveIcon, ArrowBack as ArrowBackIcon, Search as SearchIcon,
  PlaylistAdd as PlaylistAddIcon, Delete as DeleteIcon, DragIndicator as DragIndicatorIcon,
  RemoveCircleOutline as RemoveCircleOutlineIcon,
  Lightbulb as LightbulbIcon // Ícone para sugestões
} from "@mui/icons-material";

const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

// Componente de Linha para o FixedSizeList do Repertório Geral
const RepertorioRow = React.memo(({ index, style, data }) => {
  const { musica, adicionarAoSetlist, dragHandleProps } = data[index];
  return (
    <ListItem
      style={style} // Importante para o posicionamento do react-window
      secondaryAction={
        <Tooltip title="Adicionar ao Setlist">
          <IconButton edge="end" onClick={() => adicionarAoSetlist(musica)}>
            <PlaylistAddIcon />
          </IconButton>
        </Tooltip>
      }
      sx={{
        mb: 1,
        bgcolor: 'background.paper',
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider'
      }}
    >
      <ListItemIcon sx={{ minWidth: 32, color: 'text.secondary' }}>
        <DragIndicatorIcon />
      </ListItemIcon>
      <ListItemText primary={musica.nome} secondary={musica.artista} />
    </ListItem>
  );
});


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
  const [sugestoesCarregando, setSugestoesCarregando] = useState(false); // Novo estado
  const [sugestoesMusicas, setSugestoesMusicas] = useState([]); // Novo estado
  const repertorioListRef = useRef(); // Ref para o FixedSizeList

  const buscarDados = useCallback(async () => {
    try {
      const [setlistRes, repertorioRes] = await Promise.all([
        apiClient.get(`/api/setlists/${id}`),
        apiClient.get(`/api/musicas?termoBusca=${termoBusca}`),
      ]);

      setNomeSetlist(setlistRes.data.nome);
      setNotasSetlist(setlistRes.data.notas_adicionais || '');
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

    if (source.droppableId === "setlist" && destination.droppableId === "setlist") {
      setMusicasNoSetlist(reorder(musicasNoSetlist, source.index, destination.index));
    }
    // Não permitimos arrastar do repertório geral virtualizado diretamente para o setlist
    // O botão "Adicionar" é o caminho.
  };
  
  const removerDoSetlist = (musica, index) => {
    setMusicasNoSetlist(musicasNoSetlist.filter((_, i) => i !== index));
    if (!repertorioGeral.some(m => m.id === musica.id)) {
        setRepertorioGeral((atual) => [musica, ...atual]);
    }
  };
  
  const adicionarAoSetlist = (musica) => {
    setMusicasNoSetlist((prev) => [...prev, musica]);
    setRepertorioGeral((prev) => prev.filter((m) => m.id !== musica.id));
    setSugestoesMusicas((prev) => prev.filter((s) => s.id !== musica.id)); // Remove da sugestão se adicionada
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

  // --- NOVA FUNÇÃO: Gerar Sugestões ---
  const handleGerarSugestoes = async () => {
    if (musicasNoSetlist.length === 0) {
      mostrarNotificacao("Adicione músicas ao setlist para obter sugestões.", "info");
      return;
    }
    setSugestoesCarregando(true);
    try {
      // O endpoint de sugestão é `/api/setlists/:id/sugerir`
      const resposta = await apiClient.post(`/api/setlists/${id}/sugerir`, { quantidade: 10 });
      // Filtra sugestões que já estão no setlist ou no repertório geral
      const idsNoSetlistOuRepertorio = new Set([
        ...musicasNoSetlist.map(m => m.id),
        ...repertorioGeral.map(m => m.id)
      ]);
      const sugestoesFiltradas = resposta.data.filter(sugestao => !idsNoSetlistOuRepertorio.has(sugestao.id));

      setSugestoesMusicas(sugestoesFiltradas);
      if (sugestoesFiltradas.length === 0) {
        mostrarNotificacao("Nenhuma sugestão nova encontrada com base nas músicas atuais.", "info");
      } else {
        mostrarNotificacao(`Foram encontradas ${sugestoesFiltradas.length} sugestões de músicas!`, "success");
      }
    } catch (error) {
      mostrarNotificacao(error.response?.data?.mensagem || "Erro ao gerar sugestões.", "error");
    } finally {
      setSugestoesCarregando(false);
    }
  };


  if (carregando) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Altura dinâmica para as listas virtualizadas
  const listHeight = window.innerHeight * 0.5; // Ex: 50% da altura da viewport

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', maxHeight: { xs: 'auto', md: 'calc(100vh - 112px)' } }}> 
        <Box sx={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          mb: 2, 
          flexShrink: 0, 
          flexDirection: { xs: 'column', sm: 'row' }, 
          gap: 2 
        }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Tooltip title="Voltar para Setlists">
              <IconButton onClick={() => navigate("/setlists")}>
                <ArrowBackIcon />
              </IconButton>
            </Tooltip>
            <Typography variant="h5" fontWeight="bold">
              {nomeSetlist}
            </Typography>
          </Box>
          <Button 
            variant="contained" 
            startIcon={salvando ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />} 
            onClick={handleSalvar} 
            disabled={salvando} 
            sx={{ width: { xs: '100%', sm: 'auto' } }} 
          >
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
          {/* Coluna do Repertório Geral */}
          <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column' }}>
            <Paper sx={{ p: 2, flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', mb: { xs: 3, md: 0 } }}>
              <Typography variant="h6" gutterBottom>Repertório Geral</Typography>
              <TextField fullWidth placeholder="Buscar no repertório..." value={termoBusca}
                onChange={(e) => setTermoBusca(e.target.value)} sx={{ mb: 2, flexShrink: 0 }}
                InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>) }}
              />
              <Droppable droppableId="repertorio">
                {(provided) => (
                  <FixedSizeList // Substitui List por FixedSizeList
                    height={repertorioListRef.current ? repertorioListRef.current.clientHeight : listHeight} // Altura do container
                    itemCount={repertorioGeral.length}
                    itemSize={56} // Altura estimada de cada item da lista (ajuste conforme necessário)
                    width="100%"
                    outerRef={provided.innerRef}
                    innerElementType="div" // Pode ser 'div' ou 'ul'
                    itemData={repertorioGeral.map(musica => ({ musica, adicionarAoSetlist }))} // Passa dados para o Row
                    style={{ overflowX: 'hidden' }} // Esconder overflow horizontal
                  >
                    {RepertorioRow}
                  </FixedSizeList>
                )}
              </Droppable>
            </Paper>
          </Grid>

          {/* Coluna das Músicas no Setlist */}
          <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column' }}>
            <Paper sx={{ p: 2, flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', bgcolor: 'action.selected' }}>
              <Typography variant="h6" gutterBottom>Músicas no Setlist ({musicasNoSetlist.length})</Typography>
                <Droppable droppableId="setlist">
                {(provided) => (
                  <List
                    dense
                    sx={{
                      flexGrow: 1,
                      overflowY: 'auto',
                      height: 0,
                      minHeight: 100
                    }}
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                  >
                    {musicasNoSetlist.map((musica, index) => (
                      <Draggable key={`setlist-${musica.id}`} draggableId={`setlist-${musica.id}`} index={index}>
                        {(provided) => (
                          <ListItem
                            ref={provided.innerRef} {...provided.draggableProps}
                            secondaryAction={
                              <Tooltip title="Remover do Setlist">
                                <IconButton edge="end" onClick={() => removerDoSetlist(musica, index)}>
                                    <RemoveCircleOutlineIcon color="error" />
                                </IconButton>
                              </Tooltip>
                            }
                            sx={{ mb: 1, bgcolor: 'background.paper', borderRadius: 2 }}
                          >
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

              {/* --- Seção de Sugestões Inteligentes --- */}
              <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid', borderColor: 'divider', flexShrink: 0 }}>
                <Typography variant="h6" gutterBottom>Sugestões Inteligentes</Typography>
                <Button 
                  variant="outlined" 
                  startIcon={sugestoesCarregando ? <CircularProgress size={20} color="inherit" /> : <LightbulbIcon />} 
                  onClick={handleGerarSugestoes} 
                  disabled={sugestoesCarregando || musicasNoSetlist.length === 0}
                  fullWidth
                >
                  {sugestoesCarregando ? "Gerando..." : "Obter Sugestões"}
                </Button>
                {sugestoesMusicas.length > 0 && (
                  <List dense sx={{ mt: 2, maxHeight: 200, overflowY: 'auto' }}>
                    {sugestoesMusicas.map(sugestao => (
                      <ListItem
                        key={`sugestao-${sugestao.id}`}
                        secondaryAction={
                          <Tooltip title="Adicionar Sugestão ao Setlist">
                            <IconButton edge="end" onClick={() => adicionarAoSetlist(sugestao)}>
                              <PlaylistAddIcon color="secondary" />
                            </IconButton>
                          </Tooltip>
                        }
                        sx={{ bgcolor: 'background.paper', mb: 1, borderRadius: 2 }}
                      >
                        <ListItemText primary={sugestao.nome} secondary={sugestao.artista} />
                      </ListItem>
                    ))}
                  </List>
                )}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </DragDropContext>
  );
}

export default EditorDeSetlist;
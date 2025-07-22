// src/paginas/EditorDeSetlist.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiClient from "../api";
import { useNotificacao } from "../contextos/NotificationContext";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { FixedSizeList } from 'react-window'; // Continua importando FixedSizeList aqui

import {
  Box, Typography, Paper, CircularProgress, Grid,
  List, ListItem, ListItemText, IconButton, Tooltip,
  TextField, Button, ListItemIcon, InputAdornment, Dialog, DialogActions, DialogContent, DialogTitle
} from "@mui/material";
import {
  Save as SaveIcon, ArrowBack as ArrowBackIcon,
  Delete as DeleteIcon, DragIndicator as DragIndicatorIcon,
  RemoveCircleOutline as RemoveCircleOutlineIcon,
  Add as AddIcon, // Novo ícone para "Adicionar Músicas"
  Edit as EditIcon, // Ícone para o botão "Editar"
  Done as DoneIcon, // Ícone para "Concluir Edição"
  Search as SearchIcon, // Necessário para a busca no dialog
  PlaylistAdd as PlaylistAddIcon, // Necessário para adicionar no dialog
  Lightbulb as LightbulbIcon // Necessário para sugestões no dialog
} from "@mui/icons-material";

// Funções utilitárias
const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

// Componente de Linha para o FixedSizeList (Repertório Geral no Dialog)
const RepertorioDialogRow = React.memo(({ index, style, data }) => {
  // data agora é um objeto com `items` e `adicionarAoSetlist`
  const { items, adicionarAoSetlist } = data;
  const musica = items[index];

  return (
    <ListItem
      style={style} // Importante para o posicionamento do react-window
      secondaryAction={
        <Tooltip title="Adicionar ao Setlist">
          <IconButton edge="end" onClick={() => adicionarAoSetlist(musica)}>
            <PlaylistAddIcon color="primary" />
          </IconButton>
        </Tooltip>
      }
      sx={{
        bgcolor: 'background.paper',
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        mb: 1 // Adicionado margem inferior para espaçamento visual
      }}
    >
      <ListItemIcon sx={{ minWidth: 32, color: 'text.secondary' }}>
        <DragIndicatorIcon />
      </ListItemIcon>
      <ListItemText primary={musica.nome} secondary={musica.artista} />
    </ListItem>
  );
});

// Componente principal do Dialog de Adicionar Músicas
// Aninhado dentro do EditorDeSetlist, então não é mais 'export default'
function AddMusicDialog({ open, onClose, setlistId, onMusicAdd, currentSetlistMusics }) {
  const { mostrarNotificacao } = useNotificacao();
  const [repertorioGeral, setRepertorioGeral] = useState([]);
  const [termoBusca, setTermoBusca] = useState("");
  const [carregandoRepertorio, setCarregandoRepertorio] = useState(true);
  
  const [sugestoesMusicas, setSugestoesMusicas] = useState([]);
  const [sugestoesCarregando, setSugestoesCarregando] = useState(false);

  const repertorioListRef = useRef(); // Ref para o FixedSizeList

  const buscarRepertorio = useCallback(async () => {
    setCarregandoRepertorio(true);
    try {
      const resposta = await apiClient.get(`/api/musicas?termoBusca=${termoBusca}`);
      // Filtra músicas do repertório geral que já estão na setlist atual
      const idsNoSetlist = new Set(currentSetlistMusics.map(m => m.id));
      const repertorioFiltrado = resposta.data.filter(musica => !idsNoSetlist.has(musica.id));
      setRepertorioGeral(repertorioFiltrado);
    } catch (error) {
      mostrarNotificacao("Erro ao carregar repertório.", "error");
    } finally {
      setCarregandoRepertorio(false);
    }
  }, [termoBusca, currentSetlistMusics, mostrarNotificacao]); // Depende de currentSetlistMusics

  // Efeito para buscar repertório ao mudar termoBusca ou abrir o dialog
  useEffect(() => {
    const handler = setTimeout(() => {
      if (open) { // Apenas busca se o dialog estiver aberto
        buscarRepertorio();
        setSugestoesMusicas([]); // Limpa sugestões ao reabrir/buscar
      }
    }, 300); // Debounce para a busca
    return () => clearTimeout(handler);
  }, [termoBusca, open, buscarRepertorio]);

  // Função para adicionar música ao setlist (e fechar o dialog)
  const handleAddMusic = (musica) => {
    onMusicAdd(musica); // Passa a música para o componente pai (EditorDeSetlist)
    // Atualiza as listas internas do dialog para refletir a adição
    setRepertorioGeral(prev => prev.filter(m => m.id !== musica.id));
    setSugestoesMusicas(prev => prev.filter(s => s.id !== musica.id));
  };

  // Função para gerar sugestões de músicas
  const handleGerarSugestoes = useCallback(async () => {
    if (!setlistId) {
      mostrarNotificacao("Setlist não identificado para gerar sugestões.", "error");
      return;
    }
    if (currentSetlistMusics.length === 0) {
      mostrarNotificacao("Adicione músicas ao setlist para obter sugestões.", "info");
      return;
    }
    setSugestoesCarregando(true);
    try {
      const resposta = await apiClient.post(`/api/setlists/${setlistId}/sugerir`, { quantidade: 10 });
      // Filtra sugestões que já estão no setlist atual, repertório geral ou já foram sugeridas
      const idsJaPresentes = new Set([
        ...currentSetlistMusics.map(m => m.id),
        ...repertorioGeral.map(m => m.id),
        ...sugestoesMusicas.map(m => m.id)
      ]);
      const sugestoesFiltradas = resposta.data.filter(sugestao => !idsJaPresentes.has(sugestao.id));

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
  }, [setlistId, currentSetlistMusics, repertorioGeral, sugestoesMusicas, mostrarNotificacao]); // Depende de currentSetlistMusics

  // Altura dinâmica para as listas virtualizadas
  const listHeight = repertorioListRef.current ? repertorioListRef.current.clientHeight : 300; 

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Adicionar Músicas</DialogTitle>
      <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', height: '60vh', p: 0 }}>
        {/* Seção de Busca e Repertório Geral */}
        <Box sx={{ p: 2, flexShrink: 0 }}>
          <TextField
            fullWidth
            placeholder="Buscar no repertório..."
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            InputProps={{
              startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>),
            }}
          />
        </Box>
        <Box sx={{ flexGrow: 1, overflow: 'hidden', mb: 2, px: 2 }} ref={repertorioListRef}>
            {carregandoRepertorio ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
            ) : repertorioGeral.length > 0 ? (
                <FixedSizeList
                    height={listHeight}
                    itemCount={repertorioGeral.length}
                    itemSize={64} // Altura estimada para ListItem (ajuste para corresponder ao seu estilo)
                    width="100%"
                    itemData={{ items: repertorioGeral, adicionarAoSetlist: handleAddMusic }} // Passa a função aqui
                >
                    {RepertorioDialogRow}
                </FixedSizeList>
            ) : (
                <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                    Nenhuma música encontrada no seu repertório.
                </Typography>
            )}
        </Box>

        {/* Seção de Sugestões Inteligentes */}
        <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', flexShrink: 0 }}>
          <Typography variant="h6" gutterBottom>Sugestões Inteligentes</Typography>
          <Button
            variant="outlined"
            startIcon={sugestoesCarregando ? <CircularProgress size={20} color="inherit" /> : <LightbulbIcon />}
            onClick={handleGerarSugestoes}
            disabled={sugestoesCarregando || currentSetlistMusics.length === 0} // Desabilita se setlist vazio
            fullWidth
          >
            {sugestoesCarregando ? "Gerando..." : "Obter Sugestões"}
          </Button>
          {sugestoesMusicas.length > 0 && (
            <List dense sx={{ mt: 2, maxHeight: 150, overflowY: 'auto' }}>
              {sugestoesMusicas.map(sugestao => (
                <ListItem
                  key={`sugestao-${sugestao.id}`}
                  secondaryAction={
                    <Tooltip title="Adicionar Sugestão ao Setlist">
                      <IconButton edge="end" onClick={() => handleAddMusic(sugestao)}>
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
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Fechar</Button>
      </DialogActions>
    </Dialog>
  );
}


// Componente principal do EditorDeSetlist
function EditorDeSetlist() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { mostrarNotificacao } = useNotificacao();

  const [nomeSetlist, setNomeSetlist] = useState('');
  const [notasSetlist, setNotasSetlist] = useState('');
  const [musicasNoSetlist, setMusicasNoSetlist] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [isAddMusicDialogOpen, setIsAddMusicDialogOpen] = useState(false); // Estado para o dialog de adicionar músicas
  const [isEditMode, setIsEditMode] = useState(false); // Novo estado para o modo de edição

  const buscarDadosIniciais = useCallback(async () => {
    try {
      const setlistRes = await apiClient.get(`/api/setlists/${id}`);
      setNomeSetlist(setlistRes.data.nome);
      setNotasSetlist(setlistRes.data.notas_adicionais || '');
      setMusicasNoSetlist(setlistRes.data.musicas || []);
    } catch (error) {
      mostrarNotificacao("Erro ao carregar dados do editor.", "error");
      navigate("/setlists");
    } finally {
      setCarregando(false);
    }
  }, [id, navigate, mostrarNotificacao]);

  useEffect(() => {
    buscarDadosIniciais();
  }, [buscarDadosIniciais]);

  const onDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;
    // O drag and drop só funciona dentro do setlist agora
    if (source.droppableId === "setlist" && destination.droppableId === "setlist") {
      setMusicasNoSetlist(reorder(musicasNoSetlist, source.index, destination.index));
    }
  };
  
  const removerDoSetlist = (musicaIndex) => {
    const musicaRemovida = musicasNoSetlist[musicaIndex];
    setMusicasNoSetlist(musicasNoSetlist.filter((_, i) => i !== musicaIndex));
    mostrarNotificacao(`"${musicaRemovida.nome}" removida do setlist.`, "info");
  };
  
  const adicionarAoSetlist = (musica) => {
    // Evita duplicatas se a música já estiver na setlist
    if (!musicasNoSetlist.some(m => m.id === musica.id)) {
        setMusicasNoSetlist((prev) => [...prev, musica]);
        mostrarNotificacao(`"${musica.nome}" adicionada ao setlist!`, "success");
    } else {
        mostrarNotificacao(`"${musica.nome}" já está no setlist.`, "info");
    }
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
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Altura fixa para a lista de setlist para rolagem
  // Ajuste este valor conforme o design. Considera o Toolbar, padding e outros elementos
  const setlistAreaHeight = 'calc(100vh - 350px)'; 

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', maxHeight: { xs: 'auto', md: 'calc(100vh - 112px)' } }}> 
        {/* Cabeçalho do editor */}
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

        {/* Campo de nome e notas do setlist */}
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

        {/* Seção Principal: Músicas no Setlist */}
        {/* Esta seção agora ocupa todo o espaço restante e contém a lista de músicas do setlist */}
        <Paper sx={{ p: 2, flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" gutterBottom component="div" sx={{ mb: 0 }}>
              Músicas no Setlist ({musicasNoSetlist.length})
            </Typography>
            <Box>
                {/* Botão "Adicionar Músicas" */}
                <Button 
                    variant="contained" 
                    startIcon={<AddIcon />} 
                    onClick={() => setIsAddMusicDialogOpen(true)}
                    sx={{ mr: 1 }}
                >
                    Adicionar Músicas
                </Button>
                {/* Botão "Editar/Concluir Edição" */}
                <Button 
                    variant="outlined" 
                    startIcon={isEditMode ? <DoneIcon /> : <EditIcon />} 
                    onClick={() => setIsEditMode(!isEditMode)}
                >
                    {isEditMode ? "Concluir Edição" : "Editar"}
                </Button>
            </Box>
          </Box>
          
          <Droppable droppableId="setlist">
            {(provided) => (
              <List
                dense
                sx={{
                  flexGrow: 1,
                  overflowY: 'auto',
                  height: setlistAreaHeight, // Altura para rolagem
                  minHeight: 100,
                  // Remove a cor de fundo action.selected daqui, pois o Paper já é branco/escuro
                }}
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {musicasNoSetlist.length === 0 ? (
                    <Typography color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                        Adicione as primeiras músicas ao seu setlist!
                    </Typography>
                ) : (
                    musicasNoSetlist.map((musica, index) => (
                      // Desabilita o drag se não estiver no modo de edição
                      <Draggable key={`setlist-${musica.id}`} draggableId={`setlist-${musica.id}`} index={index} isDragDisabled={!isEditMode}>
                        {(provided) => (
                          <ListItem
                            ref={provided.innerRef} 
                            {...provided.draggableProps}
                            secondaryAction={
                              // Botão de Remover Rápido (condicional)
                              isEditMode && (
                                <Tooltip title="Remover do Setlist">
                                  <IconButton edge="end" onClick={() => removerDoSetlist(index)}>
                                      <RemoveCircleOutlineIcon color="error" />
                                  </IconButton>
                                </Tooltip>
                              )
                            }
                            sx={{ mb: 1, bgcolor: 'background.default', borderRadius: 2 }}
                          >
                            {/* Ícone de arrastar que serve como drag handle (condicional) */}
                            {isEditMode && (
                                <ListItemIcon sx={{minWidth: 32, color: 'text.secondary'}} {...provided.dragHandleProps}>
                                    <DragIndicatorIcon />
                                </ListItemIcon>
                            )}
                            <ListItemText primary={musica.nome} secondary={musica.artista} />
                          </ListItem>
                        )}
                      </Draggable>
                    ))
                )}
                {provided.placeholder}
              </List>
            )}
          </Droppable>
        </Paper>
      </Box>

      {/* Dialog de Adicionar Músicas */}
      <AddMusicDialog
        open={isAddMusicDialogOpen}
        onClose={() => setIsAddMusicDialogOpen(false)}
        setlistId={id}
        onMusicAdd={adicionarAoSetlist}
        currentSetlistMusics={musicasNoSetlist} // Passa as músicas atuais para filtrar no dialog
      />
    </DragDropContext>
  );
}

export default EditorDeSetlist;
// src/paginas/EditorDeSetlist.jsx
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../api';
import { useNotificacao } from '../contextos/NotificationContext';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
    Box, Typography, Paper, CircularProgress, Grid,
    List, ListItem, ListItemText, IconButton, Tooltip, TextField, InputAdornment, Button
} from '@mui/material';
import {
    Save as SaveIcon, ArrowBack as ArrowBackIcon,
    Search as SearchIcon, PlaylistAdd as PlaylistAddIcon,
    Delete as DeleteIcon
} from '@mui/icons-material';

// Função auxiliar para reordenar a lista
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

    const [setlist, setSetlist] = useState(null);
    const [musicasNoSetlist, setMusicasNoSetlist] = useState([]);
    const [repertorioGeral, setRepertorioGeral] = useState([]);
    const [termoBusca, setTermoBusca] = useState('');
    const [carregando, setCarregando] = useState(true);
    const [salvando, setSalvando] = useState(false);

    const buscarDados = useCallback(async () => {
        try {
            const [setlistRes, repertorioRes] = await Promise.all([
                apiClient.get(`/api/setlists/${id}`),
                apiClient.get(`/api/musicas?termoBusca=${termoBusca}`)
            ]);

            setSetlist(setlistRes.data);
            setMusicasNoSetlist(setlistRes.data.musicas || []);
            
            const idsNoSetlist = new Set((setlistRes.data.musicas || []).map(m => m.id));
            setRepertorioGeral(repertorioRes.data.filter(m => !idsNoSetlist.has(m.id)));

        } catch (error) {
            mostrarNotificacao("Erro ao carregar dados do editor.", "error");
            navigate('/setlists');
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

        // Movendo dentro da mesma lista (reordenando o setlist)
        if (source.droppableId === 'setlist' && destination.droppableId === 'setlist') {
            const items = reorder(musicasNoSetlist, source.index, destination.index);
            setMusicasNoSetlist(items);
        }
        // Movendo do repertório para o setlist
        if (source.droppableId === 'repertorio' && destination.droppableId === 'setlist') {
            const itemMovido = repertorioGeral[source.index];
            
            const novoRepertorio = [...repertorioGeral];
            novoRepertorio.splice(source.index, 1);
            setRepertorioGeral(novoRepertorio);
            
            const novoSetlist = [...musicasNoSetlist];
            novoSetlist.splice(destination.index, 0, itemMovido);
            setMusicasNoSetlist(novoSetlist);
        }
    };
    
    const removerDoSetlist = (musica, index) => {
        const novoSetlist = [...musicasNoSetlist];
        novoSetlist.splice(index, 1);
        setMusicasNoSetlist(novoSetlist);
        setRepertorioGeral(atual => [musica, ...atual]);
    };

    const handleSalvar = async () => {
        setSalvando(true);
        try {
            const musicasIds = musicasNoSetlist.map(m => m.id);
            await apiClient.put(`/api/setlists/${id}/musicas`, { musicasIds });
            mostrarNotificacao("Setlist salvo com sucesso!", "success");
        } catch (error) {
            mostrarNotificacao("Erro ao salvar o setlist.", "error");
        } finally {
            setSalvando(false);
        }
    };
    
    if (carregando) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
    }

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <Box sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2}}>
                        <IconButton onClick={() => navigate('/setlists')}><ArrowBackIcon /></IconButton>
                        <Typography variant="h4" fontWeight="bold">{setlist?.nome}</Typography>
                    </Box>
                    <Button 
                        variant="contained" 
                        startIcon={salvando ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                        onClick={handleSalvar}
                        disabled={salvando}
                    >
                        Salvar Alterações
                    </Button>
                </Box>
                <Grid container spacing={3}>
                    {/* Coluna do Repertório Geral */}
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 2, height: '80vh', overflowY: 'auto' }}>
                            <Typography variant="h6" gutterBottom>Repertório Geral</Typography>
                            <TextField
                                fullWidth
                                placeholder="Buscar no repertório..."
                                value={termoBusca}
                                onChange={(e) => setTermoBusca(e.target.value)}
                                sx={{ mb: 2 }}
                                InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
                            />
                            <Droppable droppableId="repertorio">
                                {(provided) => (
                                    <List {...provided.droppableProps} ref={provided.innerRef}>
                                        {repertorioGeral.map((musica, index) => (
                                            <Draggable key={musica.id} draggableId={`musica-${musica.id}`} index={index}>
                                                {(provided) => (
                                                    <ListItem
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        sx={{ mb: 1, bgcolor: 'background.default', borderRadius: 1 }}
                                                    >
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

                    {/* Coluna do Setlist Atual */}
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 2, height: '80vh', overflowY: 'auto', bgcolor: 'primary.dark', color: 'primary.contrastText' }}>
                            <Typography variant="h6" gutterBottom>Músicas no Setlist</Typography>
                             <Droppable droppableId="setlist">
                                {(provided) => (
                                    <List {...provided.droppableProps} ref={provided.innerRef}>
                                        {musicasNoSetlist.map((musica, index) => (
                                            <Draggable key={`setlist-${musica.id}`} draggableId={`setlist-${musica.id}`} index={index}>
                                                {(provided) => (
                                                    <ListItem
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        secondaryAction={
                                                            <Tooltip title="Remover do Setlist">
                                                                <IconButton edge="end" onClick={() => removerDoSetlist(musica, index)}>
                                                                    <DeleteIcon sx={{color: 'primary.contrastText'}}/>
                                                                </IconButton>
                                                            </Tooltip>
                                                        }
                                                        sx={{ mb: 1, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 1 }}
                                                    >
                                                        <ListItemText primary={musica.nome} secondary={musica.artista} secondaryTypographyProps={{color: 'rgba(255,255,255,0.7)'}} />
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
// src/paginas/Repertorios.jsx

import { useState, useEffect, useCallback } from 'react';
import apiClient from '../api';
import { useNotificacao } from '../contextos/NotificationContext';
import {
    Box, Button, Container, Typography, CircularProgress, Paper, Tooltip,
    Grid, TextField, InputAdornment, Select, MenuItem, FormControl, InputLabel, Chip, OutlinedInput
} from '@mui/material';
import {
    AddCircleOutline as AddCircleOutlineIcon, Search as SearchIcon,
    Edit as EditIcon, Delete as DeleteIcon
} from '@mui/icons-material';
import FormularioMusica from '../componentes/FormularioMusica'; // Importe o formulário

function Repertorios() {
    const [musicas, setMusicas] = useState([]);
    const [tags, setTags] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [modo, setModo] = useState('lista'); // 'lista', 'criar', 'editar'
    const [musicaSelecionadaId, setMusicaSelecionadaId] = useState(null);

    const [filtros, setFiltros] = useState({
        termoBusca: '',
        tags: [],
        semTocarDesde: false,
    });

    const { mostrarNotificacao } = useNotificacao();

    const buscarTags = useCallback(async () => {
        try {
            const resposta = await apiClient.get('/api/tags');
            setTags(resposta.data);
        } catch (erro) {
            mostrarNotificacao("Não foi possível carregar as tags para filtro.", "error");
        }
    }, [mostrarNotificacao]);

    const buscarMusicas = useCallback(async () => {
        setCarregando(true);
        try {
            const params = new URLSearchParams();
            if (filtros.termoBusca) params.append('termoBusca', filtros.termoBusca);
            if (filtros.tags.length > 0) params.append('tags', filtros.tags.join(','));
            if (filtros.semTocarDesde) {
                const doisMesesAtras = new Date();
                doisMesesAtras.setMonth(doisMesesAtras.getMonth() - 2);
                params.append('semTocarDesde', doisMesesAtras.toISOString());
            }

            const resposta = await apiClient.get('/api/musicas', { params });
            setMusicas(resposta.data);
        } catch (erro) {
            mostrarNotificacao("Não foi possível carregar as músicas do repertório.", "error");
        } finally {
            setCarregando(false);
        }
    }, [mostrarNotificacao, filtros]);

    useEffect(() => {
        if (modo === 'lista') {
            buscarMusicas();
        }
    }, [modo, buscarMusicas]);

    useEffect(() => {
        buscarTags();
    }, [buscarTags]);

    const handleFiltroChange = (event) => {
        const { name, value, type, checked } = event.target;
        setFiltros(f => ({
            ...f,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleApagar = async (id) => {
        if (window.confirm("Tem certeza que deseja apagar esta música do seu repertório geral?")) {
            try {
                await apiClient.delete(`/api/musicas/${id}`);
                mostrarNotificacao("Música apagada com sucesso!", "success");
                buscarMusicas();
            } catch (erro) {
                mostrarNotificacao("Falha ao apagar a música.", "error");
            }
        }
    };

    const handleSucessoFormulario = () => { setModo('lista'); setMusicaSelecionadaId(null); };
    const handleCancelarFormulario = () => { setModo('lista'); setMusicaSelecionadaId(null); };

    if (carregando && modo === 'lista') {
        return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress color="inherit" /></Box>;
    }

    const renderLista = () => (
        <Paper elevation={6} sx={{ p: { xs: 2, md: 4 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
                <Typography variant="h4" component="h1" fontWeight="bold">Repertório Geral</Typography>
                <Button variant="contained" startIcon={<AddCircleOutlineIcon />} onClick={() => setModo('criar')}>
                    Adicionar Música
                </Button>
            </Box>

            <Grid container spacing={2} sx={{ mb: 4 }}>
                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        name="termoBusca"
                        label="Buscar por nome ou artista..."
                        value={filtros.termoBusca}
                        onChange={handleFiltroChange}
                        InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
                    />
                </Grid>
                <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                        <InputLabel>Filtrar por Tags</InputLabel>
                        <Select
                            multiple
                            name="tags"
                            value={filtros.tags}
                            onChange={handleFiltroChange}
                            input={<OutlinedInput label="Filtrar por Tags" />}
                            renderValue={(selectedIds) => (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {selectedIds.map(id => {
                                        const tag = tags.find(t => t.id === id);
                                        return <Chip key={id} label={tag ? tag.nome : id} size="small" />;
                                    })}
                                </Box>
                            )}
                        >
                            {tags.map((tag) => (
                                <MenuItem key={tag.id} value={tag.id}>{tag.nome}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} md={2} sx={{ display: 'flex', alignItems: 'center' }}>
                    <Button fullWidth variant={filtros.semTocarDesde ? "contained" : "outlined"} onClick={() => setFiltros(f => ({ ...f, semTocarDesde: !f.semTocarDesde }))}>
                        Praticar
                    </Button>
                </Grid>
            </Grid>

            <Grid container spacing={2}>
                {musicas.length > 0 ? musicas.map(musica => (
                    <Grid item xs={12} key={musica.id}>
                        <Paper variant="outlined" sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box>
                                <Typography variant="h6">{musica.nome}</Typography>
                                <Typography color="text.secondary">{musica.artista} - Tom: {musica.tom || 'N/A'}</Typography>
                                <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {musica.tags.map(tag => <Chip key={tag.id} label={tag.nome} size="small" variant="outlined" />)}
                                </Box>
                            </Box>
                            <Box>
                                <Tooltip title="Editar Música">
                                    <IconButton onClick={() => { setMusicaSelecionadaId(musica.id); setModo('editar'); }}>
                                        <EditIcon />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Apagar Música">
                                    <IconButton onClick={() => handleApagar(musica.id)} color="error">
                                        <DeleteIcon />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                        </Paper>
                    </Grid>
                )) : (
                     <Grid item xs={12}>
                        <Typography sx={{ textAlign: 'center', p: 4 }}>Nenhuma música encontrada com os filtros atuais. Que tal adicionar uma nova?</Typography>
                    </Grid>
                )}
            </Grid>
        </Paper>
    );

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {modo === 'lista' ? renderLista() : (
                <FormularioMusica
                    id={musicaSelecionadaId}
                    onSave={handleSucessoFormulario}
                    onCancel={handleCancelarFormulario}
                />
            )}
        </Container>
    );
}

export default Repertorios;
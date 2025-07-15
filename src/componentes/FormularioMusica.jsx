// src/componentes/FormularioMusica.jsx

import { useState, useEffect } from 'react';
import apiClient from '../api';
import { useNotificacao } from '../contextos/NotificationContext';
import {
    Box, Button, TextField, Typography, Paper, CircularProgress,
    Autocomplete, Chip, Grid
} from '@mui/material';
import { Sync as SyncIcon } from '@mui/icons-material';

function FormularioMusica({ id, onSave, onCancel }) {
    const [dadosForm, setDadosForm] = useState({
        nome: '',
        artista: '',
        tom: '',
        duracao_segundos: '',
        link_cifra: '',
        notas_adicionais: '',
    });
    const [tagsSelecionadas, setTagsSelecionadas] = useState([]);
    const [tagsDisponiveis, setTagsDisponiveis] = useState([]);
    const [carregando, setCarregando] = useState(false);
    const [linkCifraClub, setLinkCifraClub] = useState('');
    const [raspando, setRaspando] = useState(false);
    const { mostrarNotificacao } = useNotificacao();

    // Busca todas as tags existentes do usuário para popular o Autocomplete
    useEffect(() => {
        apiClient.get('/api/tags')
            .then(resposta => setTagsDisponiveis(resposta.data.map(tag => tag.nome)))
            .catch(() => mostrarNotificacao("Erro ao carregar sugestões de tags.", "error"));
    }, [mostrarNotificacao]);

    // Se um 'id' foi passado, estamos no modo de edição. Busca os dados da música.
    useEffect(() => {
        if (id) {
            setCarregando(true);
            apiClient.get(`/api/musicas/${id}`)
                .then(resposta => {
                    const { tags, ...dadosMusica } = resposta.data;
                    setDadosForm(dadosMusica);
                    setTagsSelecionadas(tags.map(tag => tag.nome));
                })
                .catch(() => mostrarNotificacao("Erro ao buscar dados da música para edição.", "error"))
                .finally(() => setCarregando(false));
        }
    }, [id, mostrarNotificacao]);

    const handleChange = (e) => {
        setDadosForm(atuais => ({ ...atuais, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setCarregando(true);
        const dadosParaEnviar = { ...dadosForm, tags: tagsSelecionadas };

        try {
            if (id) {
                await apiClient.put(`/api/musicas/${id}`, dadosParaEnviar);
                mostrarNotificacao('Música atualizada com sucesso!', 'success');
            } else {
                await apiClient.post('/api/musicas', dadosParaEnviar);
                mostrarNotificacao('Música adicionada ao repertório com sucesso!', 'success');
            }
            onSave();
        } catch (erro) {
            mostrarNotificacao(erro.response?.data?.mensagem || 'Falha ao salvar a música.', 'error');
        } finally {
            setCarregando(false);
        }
    };
    
    const handleRasparCifra = async () => {
        if (!linkCifraClub) {
            mostrarNotificacao("Por favor, insira um URL do Cifra Club.", "warning");
            return;
        }
        setRaspando(true);
        try {
            const resposta = await apiClient.post('/api/musicas/raspar-cifra', { url: linkCifraClub });
            const { nome, artista, tom, notas_adicionais } = resposta.data;

            setDadosForm(atuais => ({
                ...atuais,
                nome: nome || atuais.nome,
                artista: artista || atuais.artista,
                tom: tom || atuais.tom,
                notas_adicionais: notas_adicionais || atuais.notas_adicionais,
            }));
            mostrarNotificacao("Dados importados com sucesso!", "success");

        } catch (erro) {
            mostrarNotificacao(erro.response?.data?.mensagem || "Falha ao importar dados.", "error");
        } finally {
            setRaspando(false);
        }
    };
    
    // Mostra um spinner enquanto carrega os dados para edição
    if (carregando && id) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress color="inherit" /></Box>;
    }

    return (
        <Paper elevation={6} sx={{ p: { xs: 2, md: 4 } }}>
            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Typography variant="h5" component="h2" fontWeight="bold">
                    {id ? 'Editar Música' : 'Adicionar Nova Música'}
                </Typography>

                {/* Secção de Importação do Cifra Club (Apenas no modo de criação) */}
                {!id && (
                    <Paper variant="outlined" sx={{ p: 2, borderColor: 'primary.main', bgcolor: 'rgba(94, 53, 177, 0.05)' }}>
                        <Typography variant="h6" gutterBottom>Importar do Cifra Club</Typography>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} sm={9}>
                                <TextField
                                    fullWidth
                                    label="Cole o link do Cifra Club aqui"
                                    value={linkCifraClub}
                                    onChange={(e) => setLinkCifraClub(e.target.value)}
                                    size="small"
                                />
                            </Grid>
                            <Grid item xs={12} sm={3}>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    onClick={handleRasparCifra}
                                    disabled={raspando}
                                    startIcon={raspando ? <CircularProgress size={20} color="inherit" /> : <SyncIcon />}
                                >
                                    Buscar
                                </Button>
                            </Grid>
                        </Grid>
                    </Paper>
                )}

                <Typography variant="overline" color="text.secondary">Detalhes da música</Typography>

                <TextField name="nome" label="Nome da Música" value={dadosForm.nome} onChange={handleChange} required fullWidth InputLabelProps={{ shrink: !!dadosForm.nome }} />
                <TextField name="artista" label="Artista Original" value={dadosForm.artista} onChange={handleChange} required fullWidth InputLabelProps={{ shrink: !!dadosForm.artista }} />
                <TextField name="tom" label="Tom (ex: G, Am, C#m)" value={dadosForm.tom || ''} onChange={handleChange} fullWidth InputLabelProps={{ shrink: !!dadosForm.tom }} />
                <TextField name="duracao_segundos" label="Duração (em segundos)" type="number" value={dadosForm.duracao_segundos || ''} onChange={handleChange} fullWidth />

                <Autocomplete
                    multiple
                    freeSolo
                    options={tagsDisponiveis}
                    value={tagsSelecionadas}
                    onChange={(event, newValue) => {
                        setTagsSelecionadas(newValue);
                    }}
                    renderTags={(value, getTagProps) =>
                        value.map((option, index) => (
                            <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                        ))
                    }
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            variant="outlined"
                            label="Tags"
                            placeholder="Adicione ou crie tags (ex: Lenta, Anos 80)"
                        />
                    )}
                />

                <TextField name="link_cifra" label="Link para Cifra/Partitura (opcional)" value={dadosForm.link_cifra || ''} onChange={handleChange} fullWidth />
                <TextField name="notas_adicionais" label="Cifra / Letra / Anotações" multiline rows={10} value={dadosForm.notas_adicionais || ''} onChange={handleChange} fullWidth InputLabelProps={{ shrink: !!dadosForm.notas_adicionais }} />

                <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                    <Button type="submit" variant="contained" disabled={carregando}>
                        {carregando ? <CircularProgress size={24} /> : 'Salvar Música'}
                    </Button>
                    <Button type="button" variant="text" onClick={onCancel}>Cancelar</Button>
                </Box>
            </Box>
        </Paper>
    );
}

export default FormularioMusica;
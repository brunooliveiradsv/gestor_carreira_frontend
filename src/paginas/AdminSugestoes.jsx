// src/paginas/AdminSugestoes.jsx

import { useState, useEffect, useCallback } from 'react';
import apiClient from '../api';
import { useNotificacao } from '../contextos/NotificationContext';
import {
    Box, Button, Container, Typography, CircularProgress, Paper,
    Card, CardContent, CardActions, Chip, Divider, Grid, Tooltip
} from '@mui/material';
import {
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    Person as PersonIcon,
    MusicNote as MusicNoteIcon
} from '@mui/icons-material';

function AdminSugestoes() {
    const [sugestoes, setSugestoes] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const { mostrarNotificacao } = useNotificacao();

    const buscarSugestoes = useCallback(async () => {
        if (!carregando) setCarregando(true);
        try {
            const resposta = await apiClient.get('/api/admin/sugestoes');
            setSugestoes(resposta.data);
        } catch (erro) {
            mostrarNotificacao("Não foi possível carregar as sugestões pendentes.", "error");
        } finally {
            setCarregando(false);
        }
    }, [mostrarNotificacao]); // Dependência corrigida

    useEffect(() => {
        buscarSugestoes();
    }, [buscarSugestoes]);

    const handleAprovar = async (id) => {
        try {
            await apiClient.put(`/api/admin/sugestoes/${id}/aprovar`);
            mostrarNotificacao("Sugestão aprovada e música atualizada!", "success");
            buscarSugestoes(); // Atualiza a lista
        } catch (erro) {
            mostrarNotificacao("Falha ao aprovar a sugestão.", "error");
        }
    };

    const handleRejeitar = async (id) => {
        try {
            await apiClient.put(`/api/admin/sugestoes/${id}/rejeitar`);
            mostrarNotificacao("Sugestão rejeitada.", "info");
            buscarSugestoes(); // Atualiza a lista
        } catch (erro) {
            mostrarNotificacao("Falha ao rejeitar a sugestão.", "error");
        }
    };

    if (carregando) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress color="inherit" /></Box>;
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Paper elevation={6} sx={{ p: { xs: 2, md: 4 } }}>
                <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
                    Moderação de Sugestões
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 4 }}>
                    Aqui podes aprovar ou rejeitar as melhorias sugeridas pela comunidade para a Biblioteca Global.
                </Typography>

                {sugestoes.length === 0 ? (
                    <Box sx={{ p: 4, textAlign: 'center', border: '1px dashed grey', borderRadius: 2 }}>
                        <Typography variant="h6">Nenhuma sugestão pendente.</Typography>
                        <Typography color="text.secondary">A caixa de entrada está limpa!</Typography>
                    </Box>
                ) : (
                    <Grid container spacing={3}>
                        {sugestoes.map(sugestao => (
                            <Grid item xs={12} md={6} key={sugestao.id}>
                                <Card variant="outlined">
                                    <CardContent>
                                        <Chip
                                            icon={<MusicNoteIcon />}
                                            label={`${sugestao.musica.nome} - ${sugestao.musica.artista}`}
                                            sx={{ mb: 2, fontWeight: 'bold' }}
                                        />
                                        <Typography variant="h6" gutterBottom>
                                            Melhoria para o campo: <strong>{sugestao.campo_sugerido}</strong>
                                        </Typography>
                                        
                                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', maxHeight: 150, overflow: 'auto', p: 1, bgcolor: 'rgba(0,0,0,0.1)', borderRadius: 1, fontFamily: 'monospace' }}>
                                            {sugestao.valor_sugerido}
                                        </Typography>

                                        <Divider sx={{ my: 2 }} />
                                        
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
                                            <Typography variant="caption" color="text.secondary">
                                                Sugerido por: {sugestao.autor.nome} ({sugestao.autor.email})
                                            </Typography>
                                        </Box>
                                    </CardContent>
                                    <CardActions sx={{ justifyContent: 'flex-end' }}>
                                        <Button
                                            color="error"
                                            startIcon={<CancelIcon />}
                                            onClick={() => handleRejeitar(sugestao.id)}
                                        >
                                            Rejeitar
                                        </Button>
                                        <Button
                                            color="success"
                                            variant="contained"
                                            startIcon={<CheckCircleIcon />}
                                            onClick={() => handleAprovar(sugestao.id)}
                                        >
                                            Aprovar
                                        </Button>
                                    </CardActions>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Paper>
        </Container>
    );
}

export default AdminSugestoes;
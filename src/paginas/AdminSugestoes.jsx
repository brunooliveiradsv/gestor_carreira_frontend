// src/paginas/AdminSugestoes.jsx

import { useState, useEffect, useCallback } from 'react';
import apiClient from '../api';
import { useNotificacao } from '../contextos/NotificationContext';
import {
    Box, Button, Typography, CircularProgress, Paper,
    Card, CardContent, CardActions, Chip, Divider, Grid, Alert
} from '@mui/material';
import {
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    Person as PersonIcon,
    MusicNote as MusicNoteIcon,
    RateReview as RateReviewIcon
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
    }, [mostrarNotificacao, carregando]); // Dependência corrigida

    useEffect(() => {
        buscarSugestoes();
    }, []); // Executar apenas uma vez

    const handleAprovar = async (id) => {
        try {
            await apiClient.put(`/api/admin/sugestoes/${id}/aprovar`);
            mostrarNotificacao("Sugestão aprovada e música atualizada!", "success");
            buscarSugestoes();
        } catch (erro) {
            mostrarNotificacao("Falha ao aprovar a sugestão.", "error");
        }
    };

    const handleRejeitar = async (id) => {
        try {
            await apiClient.put(`/api/admin/sugestoes/${id}/rejeitar`);
            mostrarNotificacao("Sugestão rejeitada.", "info");
            buscarSugestoes();
        } catch (erro) {
            mostrarNotificacao("Falha ao rejeitar a sugestão.", "error");
        }
    };

    if (carregando) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress color="inherit" /></Box>;
    }

    return (
        <Box>
            {sugestoes.length === 0 ? (
                <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
                    <RateReviewIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6">Nenhuma sugestão pendente.</Typography>
                    <Typography color="text.secondary">A caixa de entrada está limpa!</Typography>
                </Paper>
            ) : (
                <Grid container spacing={3}>
                    {sugestoes.map(sugestao => (
                        <Grid item xs={12} md={6} key={sugestao.id}>
                            <Card variant="outlined" sx={{height: '100%', display: 'flex', flexDirection: 'column'}}>
                                <CardContent sx={{flexGrow: 1}}>
                                    <Chip
                                        icon={<MusicNoteIcon />}
                                        label={`${sugestao.musica.nome} - ${sugestao.musica.artista}`}
                                        sx={{ mb: 2, fontWeight: 'bold' }}
                                        variant="outlined"
                                    />
                                    <Typography variant="h6" gutterBottom>
                                        Sugestão para: <strong>{sugestao.campo_sugerido}</strong>
                                    </Typography>
                                    
                                    <Paper variant="outlined" sx={{ whiteSpace: 'pre-wrap', maxHeight: 150, overflow: 'auto', p: 1.5, my: 1, bgcolor: 'rgba(0,0,0,0.2)' }}>
                                        <Typography variant="body2" sx={{fontFamily: 'monospace'}}>{sugestao.valor_sugerido}</Typography>
                                    </Paper>
                                    
                                    <Divider sx={{ my: 2 }} />
                                    
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
                                        <Typography variant="caption" color="text.secondary">
                                            Por: {sugestao.autor.nome} ({sugestao.autor.email})
                                        </Typography>
                                    </Box>
                                </CardContent>
                                <CardActions sx={{ justifyContent: 'flex-end', p:2 }}>
                                    <Button color="error" startIcon={<CancelIcon />} onClick={() => handleRejeitar(sugestao.id)}>Rejeitar</Button>
                                    <Button color="success" variant="contained" startIcon={<CheckCircleIcon />} onClick={() => handleAprovar(sugestao.id)}>Aprovar</Button>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Box>
    );
}

export default AdminSugestoes;
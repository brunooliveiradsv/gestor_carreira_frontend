import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Button, TextField, Rating, CircularProgress } from '@mui/material';
import { useFanAuth } from '../contextos/FanAuthContext';
import { useNotificacao } from '../contextos/NotificationContext';
import apiClient from '../apiClient';

function FeedbackShowcase({ artistaId, url_unica }) {
    const { fa } = useFanAuth();
    const { mostrarNotificacao } = useNotificacao();

    const [nota, setNota] = useState(0);
    const [comentario, setComentario] = useState('');
    const [submetendo, setSubmetendo] = useState(false);
    const [jaSubmetido, setJaSubmetido] = useState(false);

    // Verifica no localStorage se o feedback já foi enviado nesta sessão
    useEffect(() => {
        if (fa) {
            const submissaoGuardada = localStorage.getItem(`feedback_submetido_${fa.id}_${artistaId}`);
            if (submissaoGuardada) {
                setJaSubmetido(true);
            }
        }
    }, [fa, artistaId]);

    const handleSubmit = async () => {
        if (nota === 0) {
            mostrarNotificacao('Por favor, selecione uma nota de 1 a 5 estrelas.', 'warning');
            return;
        }
        setSubmetendo(true);
        try {
            const resposta = await apiClient.post(`/api/vitrine/${url_unica}/feedback`, { nota, comentario });
            mostrarNotificacao(resposta.data.mensagem, 'success');
            setJaSubmetido(true);
            // Guarda a submissão para este fã e artista no localStorage
            if (fa) {
                localStorage.setItem(`feedback_submetido_${fa.id}_${artistaId}`, 'true');
            }
        } catch (error) {
            mostrarNotificacao(error.response?.data?.mensagem || 'Erro ao enviar o seu feedback.', 'error');
        } finally {
            setSubmetendo(false);
        }
    };

    // Se o fã não estiver logado, não mostra nada
    if (!fa) {
        return null;
    }

    // Se o fã já enviou o feedback, mostra uma mensagem de agradecimento
    if (jaSubmetido) {
        return (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h6" fontWeight="bold">Obrigado!</Typography>
                <Typography color="text.secondary">O seu feedback foi registado.</Typography>
            </Paper>
        );
    }

    return (
        <Paper sx={{ p: 3 }}>
            <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">
                Deixe o seu Feedback
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
                A sua opinião é importante para o artista!
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <Rating
                    name="nota-feedback"
                    value={nota}
                    onChange={(event, newValue) => {
                        setNota(newValue);
                    }}
                    size="large"
                />
            </Box>
            <TextField
                label="Comentário (opcional)"
                multiline
                rows={4}
                fullWidth
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                sx={{ mb: 2 }}
            />
            <Button
                variant="contained"
                fullWidth
                disabled={submetendo || nota === 0}
                onClick={handleSubmit}
            >
                {submetendo ? <CircularProgress size={24} /> : 'Enviar Feedback'}
            </Button>
        </Paper>
    );
}

export default FeedbackShowcase;
import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Button, TextField, Rating, CircularProgress, List, ListItem, ListItemAvatar, Avatar, ListItemText, Divider } from '@mui/material';
import { useFanAuth } from '../contextos/FanAuthContext';
import { useNotificacao } from '../contextos/NotificationContext';
import apiClient from '../apiClient';

// Componente para exibir um único feedback na lista
const FeedbackItem = ({ feedback }) => (
    <>
        <ListItem alignItems="flex-start">
            <ListItemAvatar>
                <Avatar src={feedback.fa.foto_url} alt={feedback.fa.nome} />
            </ListItemAvatar>
            <ListItemText
                primary={<Rating value={feedback.nota} readOnly size="small" />}
                secondary={
                    <>
                        <Typography sx={{ display: 'inline' }} component="span" variant="body2" color="text.primary">
                            {feedback.fa.nome}
                        </Typography>
                        {` — ${feedback.comentario}`}
                    </>
                }
            />
        </ListItem>
        <Divider variant="inset" component="li" />
    </>
);

// Formulário para submeter um novo feedback
const FeedbackForm = ({ artistaId, url_unica, onFeedbackSent }) => {
    const { fa } = useFanAuth();
    const { mostrarNotificacao } = useNotificacao();
    const [nota, setNota] = useState(0);
    const [comentario, setComentario] = useState('');
    const [submetendo, setSubmetendo] = useState(false);

    const handleSubmit = async () => {
        if (nota === 0) {
            mostrarNotificacao('Por favor, selecione uma nota de 1 a 5 estrelas.', 'warning');
            return;
        }
        setSubmetendo(true);
        try {
            const resposta = await apiClient.post(`/api/vitrine/${url_unica}/feedback`, { nota, comentario });
            mostrarNotificacao(resposta.data.mensagem, 'success');
            onFeedbackSent(); // Avisa o componente pai que o feedback foi enviado
            if (fa) {
                localStorage.setItem(`feedback_submetido_${fa.id}_${artistaId}`, 'true');
            }
        } catch (error) {
            mostrarNotificacao(error.response?.data?.mensagem || 'Erro ao enviar o seu feedback.', 'error');
        } finally {
            setSubmetendo(false);
        }
    };

    return (
        <Box sx={{ mt: 2 }}>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
                A sua opinião é importante para o artista!
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <Rating name="nota-feedback" value={nota} onChange={(event, newValue) => setNota(newValue)} size="large" />
            </Box>
            <TextField label="Comentário (opcional)" multiline rows={4} fullWidth value={comentario} onChange={(e) => setComentario(e.target.value)} sx={{ mb: 2 }} />
            <Button variant="contained" fullWidth disabled={submetendo || nota === 0} onClick={handleSubmit}>
                {submetendo ? <CircularProgress size={24} /> : 'Enviar Feedback'}
            </Button>
        </Box>
    );
};


function FeedbackShowcase({ artistaId, url_unica, feedbacksRecentes }) {
    const { fa } = useFanAuth();
    const [jaSubmetido, setJaSubmetido] = useState(false);

    useEffect(() => {
        if (fa) {
            const submissaoGuardada = localStorage.getItem(`feedback_submetido_${fa.id}_${artistaId}`);
            setJaSubmetido(!!submissaoGuardada);
        } else {
            setJaSubmetido(false);
        }
    }, [fa, artistaId]);

    return (
        <Paper sx={{ p: 3 }}>
            <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">
                Feedback dos Fãs
            </Typography>

            {/* Lista de Feedbacks Recentes (sempre visível) */}
            {feedbacksRecentes && feedbacksRecentes.length > 0 ? (
                <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                    {feedbacksRecentes.map(feedback => <FeedbackItem key={feedback.id} feedback={feedback} />)}
                </List>
            ) : (
                <Typography color="text.secondary" sx={{ my: 2 }}>
                    Ainda não há feedbacks. Seja o primeiro a deixar a sua opinião!
                </Typography>
            )}

            {/* Lógica condicional para o formulário/mensagens */}
            <Divider sx={{ my: 2 }} />
            {fa ? (
                jaSubmetido ? (
                    <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" fontWeight="bold">Obrigado!</Typography>
                        <Typography color="text.secondary">O seu feedback foi registado.</Typography>
                    </Box>
                ) : (
                    <FeedbackForm artistaId={artistaId} url_unica={url_unica} onFeedbackSent={() => setJaSubmetido(true)} />
                )
            ) : (
                <Typography color="text.secondary" sx={{ textAlign: 'center' }}>
                    Faça login como fã para deixar o seu feedback.
                </Typography>
            )}
        </Paper>
    );
}

export default FeedbackShowcase;
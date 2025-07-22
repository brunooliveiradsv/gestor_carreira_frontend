// src/componentes/FormularioSugestao.jsx

import { useState } from 'react';
import apiClient from '../apiClient';
import { useNotificacao } from '../contextos/NotificationContext';
import {
    Box, Button, TextField, Typography, CircularProgress,
    Dialog, DialogActions, DialogContent, DialogTitle,
    Select, MenuItem, FormControl, InputLabel
} from '@mui/material';

function FormularioSugestao({ open, onClose, musica }) {
    const [campo, setCampo] = useState('tom');
    const [valor, setValor] = useState('');
    const [carregando, setCarregando] = useState(false);
    const { mostrarNotificacao } = useNotificacao();

    const camposSugeriveis = [
        { valor: 'tom', nome: 'Tom' },
        { valor: 'bpm', nome: 'BPM' },
        { valor: 'duracao_segundos', nome: 'Duração (em segundos)' },
        { valor: 'notas_adicionais', nome: 'Cifra / Letra' }
    ];

    const handleSubmit = async () => {
        if (!valor) {
            mostrarNotificacao("Por favor, insira um valor para a sua sugestão.", "warning");
            return;
        }
        setCarregando(true);
        try {
            await apiClient.post(`/api/musicas/${musica.id}/sugerir`, {
                campo_sugerido: campo,
                valor_sugerido: valor
            });
            mostrarNotificacao("A sua sugestão foi enviada para moderação. Obrigado por colaborar!", "success");
            onClose(); // Fecha o formulário
        } catch (erro) {
            mostrarNotificacao("Falha ao enviar a sua sugestão.", "error");
        } finally {
            setCarregando(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Sugerir Melhoria para "{musica?.nome}"</DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
                    <FormControl fullWidth>
                        <InputLabel>Campo a Melhorar</InputLabel>
                        <Select value={campo} label="Campo a Melhorar" onChange={(e) => setCampo(e.target.value)}>
                            {camposSugeriveis.map(c => (
                                <MenuItem key={c.valor} value={c.valor}>{c.nome}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <TextField
                        label="Novo Valor Sugerido"
                        value={valor}
                        onChange={(e) => setValor(e.target.value)}
                        fullWidth
                        multiline={campo === 'notas_adicionais'}
                        rows={campo === 'notas_adicionais' ? 10 : 1}
                    />
                </Box>
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
                <Button onClick={onClose} disabled={carregando}>Cancelar</Button>
                <Button onClick={handleSubmit} variant="contained" disabled={carregando}>
                    {carregando ? <CircularProgress size={24} /> : 'Enviar Sugestão'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default FormularioSugestao;
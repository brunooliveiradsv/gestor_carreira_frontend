// src/componentes/FormularioMusica.jsx
import React, { useState, useEffect } from 'react';
import apiClient from '../apiClient';
import { useNotificacao } from '../contextos/NotificationContext';
import { 
    Box, TextField, Button, CircularProgress, DialogTitle, 
    DialogContent, DialogActions, Typography, Chip 
} from '@mui/material';

function FormularioMusica({ id, onSave, onCancel }) {
  const [musica, setMusica] = useState({ 
    nome: '', artista: '', tom: '', bpm: '', 
    notas_adicionais: '', tags: [] // Mantém as tags para exibição
  });
  const [carregando, setCarregando] = useState(false);
  const { mostrarNotificacao } = useNotificacao();

  useEffect(() => {
    if (id) {
      setCarregando(true);
      apiClient.get(`/api/musicas/${id}`)
        .then(res => setMusica(res.data))
        .catch(() => mostrarNotificacao('Erro ao carregar dados da música.', 'error'))
        .finally(() => setCarregando(false));
    }
  }, [id, mostrarNotificacao]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMusica(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!musica.nome || !musica.artista) {
        mostrarNotificacao('Nome da música e artista são obrigatórios.', 'warning');
        return;
    }
    setCarregando(true);
    try {
      // O campo de tags não é mais enviado
      const dadosParaEnviar = { ...musica };
      delete dadosParaEnviar.tags; 

      const endpoint = id ? `/api/musicas/${id}` : '/api/musicas/manual';
      const method = id ? 'put' : 'post';
      await apiClient[method](endpoint, dadosParaEnviar);
      mostrarNotificacao(`Música ${id ? 'atualizada' : 'criada'} com sucesso!`, 'success');
      onSave();
    } catch (error) {
      mostrarNotificacao(error.response?.data?.mensagem || 'Erro ao salvar música.', 'error');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <DialogTitle>{id ? 'Editar Música' : 'Nova Música Manual'}</DialogTitle>
      <DialogContent>
        {carregando && id ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField name="nome" label="Nome da Música *" value={musica.nome} onChange={handleChange} fullWidth required />
            <TextField name="artista" label="Artista *" value={musica.artista} onChange={handleChange} fullWidth required />
            
            {/* CAMPO DE TAGS AGORA É APENAS DE EXIBIÇÃO */}
            {musica.tags && musica.tags.length > 0 && (
                <Box>
                    <Typography variant="caption" color="text.secondary">Tags (geridas por administradores)</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                        {musica.tags.map(tag => (
                            <Chip key={tag.id} label={tag.nome} />
                        ))}
                    </Box>
                </Box>
            )}

            <TextField name="tom" label="Tom" value={musica.tom || ''} onChange={handleChange} fullWidth />
            <TextField name="bpm" label="BPM" value={musica.bpm || ''} onChange={handleChange} fullWidth />
            <TextField name="notas_adicionais" label="Anotações / Cifra" value={musica.notas_adicionais || ''} onChange={handleChange} fullWidth multiline rows={4} />
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onCancel}>Cancelar</Button>
        <Button type="submit" variant="contained" disabled={carregando}>
          {carregando ? <CircularProgress size={24} /> : 'Salvar'}
        </Button>
      </DialogActions>
    </Box>
  );
}

export default FormularioMusica;
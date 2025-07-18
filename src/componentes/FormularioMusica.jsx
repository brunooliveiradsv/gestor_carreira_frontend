// src/componentes/FormularioMusica.jsx
import React, { useState, useEffect } from 'react';
import apiClient from '../api';
import { useNotificacao } from '../contextos/NotificationContext';
import { Box, TextField, Button, CircularProgress, Typography, Grid } from '@mui/material';

function FormularioMusica({ id, onSave, onCancel }) {
  const [musica, setMusica] = useState({ 
    nome: '', artista: '', tom: '', bpm: '', duracao_minutos: '', 
    link_cifra: '', notas_adicionais: '' 
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
      const endpoint = id ? `/api/musicas/${id}` : '/api/musicas/manual';
      const method = id ? 'put' : 'post';
      await apiClient[method](endpoint, musica);
      mostrarNotificacao(`Música ${id ? 'atualizada' : 'criada'} com sucesso!`, 'success');
      onSave();
    } catch (error) {
      mostrarNotificacao(error.response?.data?.mensagem || 'Erro ao salvar música.', 'error');
    } finally {
      setCarregando(false);
    }
  };

  if (carregando && id) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ p: { xs: 2, md: 3 } }}>
      <Typography variant="h5" sx={{ mb: 3 }}>{id ? 'Editar Música' : 'Nova Música'}</Typography>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField id="nome_musica" name="nome" label="Nome da Música *" value={musica.nome} onChange={handleChange} fullWidth required variant="outlined" />
        <TextField id="artista" name="artista" label="Artista *" value={musica.artista} onChange={handleChange} fullWidth required variant="outlined" />
        <TextField id="tom" name="tom" label="Tom" value={musica.tom || ''} onChange={handleChange} fullWidth variant="outlined" />
        <TextField id="bpm" name="bpm" label="BPM" value={musica.bpm || ''} onChange={handleChange} fullWidth variant="outlined" />
        <TextField id="duracao" name="duracao_minutos" label="Duração" value={musica.duracao_minutos || ''} onChange={handleChange} fullWidth variant="outlined" />
        <TextField id="link_cifra" name="link_cifra" label="Link para Cifra" value={musica.link_cifra || ''} onChange={handleChange} fullWidth variant="outlined" />
        <TextField id="notas_adicionais" name="notas_adicionais" label="Anotações / Cifra" value={musica.notas_adicionais || ''} onChange={handleChange} fullWidth multiline rows={4} variant="outlined" />
      </Box>
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 3 }}>
        <Button onClick={onCancel}>Cancelar</Button>
        <Button type="submit" variant="contained" disabled={carregando}>
          {carregando ? <CircularProgress size={24} /> : 'Salvar'}
        </Button>
      </Box>
    </Box>
  );
}

export default FormularioMusica;
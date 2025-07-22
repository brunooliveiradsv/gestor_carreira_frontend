// src/componentes/FormularioMusicaMestre.jsx
import React, { useState, useEffect } from 'react';
import apiClient from '../apiClient';
import { useNotificacao } from '../contextos/NotificationContext';
import { Box, TextField, Button, CircularProgress, Typography, Grid, FormControlLabel, Switch } from '@mui/material';

function FormularioMusicaMestre({ musica, onSave, onCancel }) {
  // O estado inicial agora inclui todos os campos
  const [dados, setDados] = useState({ 
    nome: '', artista: '', tom: '', bpm: '', duracao_minutos: '', 
    link_cifra: '', notas_adicionais: '', is_publica: true 
  });
  const [carregando, setCarregando] = useState(false);
  const { mostrarNotificacao } = useNotificacao();

  useEffect(() => {
    if (musica) {
      // Preenche o formulário com os dados da música a ser editada
      setDados({
        nome: musica.nome || '',
        artista: musica.artista || '',
        tom: musica.tom || '',
        bpm: musica.bpm || '',
        duracao_minutos: musica.duracao_minutos || '',
        link_cifra: musica.link_cifra || '',
        notas_adicionais: musica.notas_adicionais || '',
        is_publica: musica.is_publica !== undefined ? musica.is_publica : true,
      });
    }
  }, [musica]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setDados(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!dados.nome || !dados.artista) {
        mostrarNotificacao('Nome e artista são obrigatórios.', 'warning');
        return;
    }
    setCarregando(true);
    try {
      const endpoint = musica ? `/api/admin/musicas/${musica.id}` : '/api/admin/musicas';
      const method = musica ? 'put' : 'post';
      await apiClient[method](endpoint, dados);
      mostrarNotificacao(`Música ${musica ? 'atualizada' : 'criada'} com sucesso!`, 'success');
      onSave();
    } catch (error) {
      mostrarNotificacao(error.response?.data?.mensagem || 'Erro ao salvar música.', 'error');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ p: { xs: 2, md: 3 } }}>
      <Typography variant="h5" sx={{ mb: 3 }}>{musica ? 'Editar Música Mestre' : 'Nova Música Mestre'}</Typography>
      
      {/* O layout agora usa um Box com Flexbox para empilhar os campos */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField name="nome" label="Nome da Música *" value={dados.nome} onChange={handleChange} fullWidth required variant="outlined" />
        <TextField name="artista" label="Artista *" value={dados.artista} onChange={handleChange} fullWidth required variant="outlined" />
        <TextField name="tom" label="Tom" value={dados.tom} onChange={handleChange} fullWidth variant="outlined" />
        <TextField name="bpm" label="BPM" value={dados.bpm} onChange={handleChange} fullWidth variant="outlined" />
        <TextField name="duracao_minutos" label="Duração" value={dados.duracao_minutos} onChange={handleChange} fullWidth variant="outlined" />
        <TextField name="link_cifra" label="Link para Cifra" value={dados.link_cifra} onChange={handleChange} fullWidth variant="outlined" />
        <TextField name="notas_adicionais" label="Anotações / Cifra" value={dados.notas_adicionais} onChange={handleChange} fullWidth multiline rows={4} variant="outlined" />
        <FormControlLabel
          control={<Switch name="is_publica" checked={dados.is_publica} onChange={handleChange} />}
          label="Pública (visível para todos os usuários)"
        />
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

export default FormularioMusicaMestre;
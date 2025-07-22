// src/componentes/FormularioMusicaMestre.jsx
import React, { useState, useEffect } from 'react';
import apiClient from '../apiClient';
import { useNotificacao } from '../contextos/NotificationContext';
import { Box, TextField, Button, CircularProgress, Typography, FormControlLabel, Switch, Autocomplete, Chip } from '@mui/material';

function FormularioMusicaMestre({ musica, onSave, onCancel }) {
  const [dados, setDados] = useState({ 
    nome: '', artista: '', tom: '', bpm: '', duracao_minutos: '', 
    link_cifra: '', notas_adicionais: '', is_publica: true, tags: [] 
  });
  const [tagsDisponiveis, setTagsDisponiveis] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const { mostrarNotificacao } = useNotificacao();

  useEffect(() => {
    // Busca todas as tags disponíveis para o seletor
    apiClient.get('/api/tags').then(res => setTagsDisponiveis(res.data));

    if (musica) {
      // Se estiver a editar, preenche o formulário com os dados da música
      setDados({
        ...musica, // Usa os dados recebidos, que já incluem as tags
        tags: musica.tags || [],
        bpm: musica.bpm || '',
      });
    }
  }, [musica]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setDados(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };
  
  const handleTagsChange = (event, novasTags) => {
    setDados(prev => ({ ...prev, tags: novasTags }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!dados.nome || !dados.artista) {
        mostrarNotificacao('Nome e artista são obrigatórios.', 'warning');
        return;
    }
    setCarregando(true);
    try {
      const dadosParaEnviar = { ...dados, tagIds: dados.tags.map(t => t.id) };
      delete dadosParaEnviar.tags;

      const endpoint = musica ? `/api/admin/musicas/${musica.id}` : '/api/admin/musicas';
      const method = musica ? 'put' : 'post';
      await apiClient[method](endpoint, dadosParaEnviar);
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
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField name="nome" label="Nome da Música *" value={dados.nome} onChange={handleChange} required />
        <TextField name="artista" label="Artista *" value={dados.artista} onChange={handleChange} required />
        <Autocomplete
            multiple
            options={tagsDisponiveis}
            getOptionLabel={(option) => option.nome}
            value={dados.tags}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            onChange={handleTagsChange}
            renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                <Chip variant="outlined" label={option.nome} {...getTagProps({ index })} />
                ))
            }
            renderInput={(params) => (
                <TextField {...params} variant="outlined" label="Tags" placeholder="Adicionar tags..." />
            )}
        />
        <TextField name="tom" label="Tom" value={dados.tom || ''} onChange={handleChange} />
        <TextField name="bpm" label="BPM" value={dados.bpm || ''} onChange={handleChange} />
        <TextField name="notas_adicionais" label="Anotações / Cifra" value={dados.notas_adicionais || ''} onChange={handleChange} multiline rows={4} />
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
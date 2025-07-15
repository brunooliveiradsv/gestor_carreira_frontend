// src/componentes/FormularioMusica.jsx

import { useState, useEffect } from 'react';
import apiClient from '../api';
import { useNotificacao } from '../contextos/NotificationContext';
import { 
  Box, Button, TextField, Typography, Paper, CircularProgress, 
  Autocomplete, Chip 
} from '@mui/material';

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
  const { mostrarNotificacao } = useNotificacao();

  // Busca todas as tags existentes para popular o Autocomplete
  useEffect(() => {
    apiClient.get('/api/tags')
      .then(resposta => setTagsDisponiveis(resposta.data.map(tag => tag.nome)))
      .catch(() => mostrarNotificacao("Erro ao carregar sugestões de tags.", "error"));
  }, [mostrarNotificacao]);

  // Se for o modo de edição (um 'id' foi passado), busca os dados da música
  useEffect(() => {
    if (id) {
      setCarregando(true);
      // O endpoint para buscar uma música específica ainda não foi criado.
      // Vamos assumir que será '/api/musicas/:id'
      apiClient.get(`/api/musicas/${id}`)
        .then(resposta => {
          setDadosForm(resposta.data);
          setTagsSelecionadas(resposta.data.tags.map(tag => tag.nome));
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
    
    // Junta os dados do formulário com as tags
    const dadosParaEnviar = { ...dadosForm, tags: tagsSelecionadas };

    try {
      if (id) {
        await apiClient.put(`/api/musicas/${id}`, dadosParaEnviar);
        mostrarNotificacao('Música atualizada com sucesso!', 'success');
      } else {
        await apiClient.post('/api/musicas', dadosParaEnviar);
        mostrarNotificacao('Música adicionada ao repertório com sucesso!', 'success');
      }
      onSave(); // Sinaliza para a página pai que o formulário foi salvo
    } catch (erro) {
      mostrarNotificacao(erro.response?.data?.mensagem || 'Falha ao salvar a música.', 'error');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <Paper elevation={6} sx={{ p: { xs: 2, md: 4 } }}>
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Typography variant="h5" component="h2" fontWeight="bold">
          {id ? 'Editar Música' : 'Adicionar Nova Música'}
        </Typography>
        
        <TextField name="nome" label="Nome da Música" value={dadosForm.nome} onChange={handleChange} required fullWidth />
        <TextField name="artista" label="Artista Original" value={dadosForm.artista} onChange={handleChange} required fullWidth />
        <TextField name="tom" label="Tom (ex: G, Am, C#m)" value={dadosForm.tom || ''} onChange={handleChange} fullWidth />
        <TextField name="duracao_segundos" label="Duração (em segundos)" type="number" value={dadosForm.duracao_segundos || ''} onChange={handleChange} fullWidth />

        <Autocomplete
          multiple
          freeSolo // Permite adicionar novas tags que não estão na lista
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
        
        <TextField name="link_cifra" label="Link para Cifra/Partitura" value={dadosForm.link_cifra || ''} onChange={handleChange} fullWidth />
        <TextField name="notas_adicionais" label="Anotações Pessoais" multiline rows={3} value={dadosForm.notas_adicionais || ''} onChange={handleChange} fullWidth />

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
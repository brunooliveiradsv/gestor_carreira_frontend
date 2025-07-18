// src/componentes/FormularioContato.jsx

import { useState, useEffect } from 'react';
import apiClient from '../api';
import { useNotificacao } from '../contextos/NotificationContext';
import { Box, Button, TextField, Typography, Paper, CircularProgress } from '@mui/material';

function FormularioContato({ id, onSave, onCancel }) {
  const [dadosForm, setDadosForm] = useState({ nome: '', email: '', telefone: '', funcao: '' });
  const [carregando, setCarregando] = useState(false);
  const { mostrarNotificacao } = useNotificacao();

  useEffect(() => {
    if (id) {
      apiClient.get(`/api/contatos/${id}`)
        .then(resposta => setDadosForm(resposta.data))
        .catch(erro => console.error("Erro ao buscar contato para edição", erro));
    } else {
      // Limpa o formulário ao criar um novo
      setDadosForm({ nome: '', email: '', telefone: '', funcao: '' });
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDadosForm(dadosAtuais => ({ ...dadosAtuais, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCarregando(true);
    try {
      if (id) {
        await apiClient.put(`/api/contatos/${id}`, dadosForm);
        mostrarNotificacao('Contato atualizado com sucesso!', 'success');
      } else {
        await apiClient.post('/api/contatos', dadosForm);
        mostrarNotificacao('Contato criado com sucesso!', 'success');
      }
      onSave();
    } catch (erro) {
      mostrarNotificacao('Falha ao salvar o contato.', 'error');
    } finally {
      setCarregando(false);
    }
  };

  return (
    // O Paper foi removido, o Box agora é o container principal
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 1 /* Padding leve para não colar nas bordas do Dialog */ }}>
      <Typography variant="h5" component="h2" fontWeight="bold" gutterBottom>
        {id ? 'Editar Contato' : 'Novo Contato'}
      </Typography>
      <TextField name="nome" label="Nome do Contato" value={dadosForm.nome} onChange={handleChange} required fullWidth />
      <TextField name="email" label="E-mail" type="email" value={dadosForm.email} onChange={handleChange} fullWidth />
      <TextField name="telefone" label="Telefone" value={dadosForm.telefone} onChange={handleChange} fullWidth />
      <TextField name="funcao" label="Função (ex: Produtor)" value={dadosForm.funcao} onChange={handleChange} fullWidth />
      <Box sx={{ mt: 2, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button type="button" variant="text" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" variant="contained" color="primary" disabled={carregando}>
          {carregando ? <CircularProgress size={24} /> : 'Salvar'}
        </Button>
      </Box>
    </Box>
  );
}

export default FormularioContato;
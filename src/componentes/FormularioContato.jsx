// src/componentes/FormularioContato.jsx

import { useState, useEffect } from 'react';
import axios from 'axios';
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
    <Paper elevation={6} sx={{ p: { xs: 2, md: 4 }, borderRadius: 3 }}>
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="h5" component="h2" fontWeight="bold" gutterBottom>
          {id ? 'Editar Contato' : 'Novo Contato'}
        </Typography>
        <TextField name="nome" label="Nome do Contato" value={dadosForm.nome} onChange={handleChange} required fullWidth />
        <TextField name="email" label="E-mail" type="email" value={dadosForm.email} onChange={handleChange} fullWidth />
        <TextField name="telefone" label="Telefone" value={dadosForm.telefone} onChange={handleChange} fullWidth />
        <TextField name="funcao" label="Função (ex: Produtor)" value={dadosForm.funcao} onChange={handleChange} fullWidth />
        <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
          <Button type="submit" variant="contained" color="primary" disabled={carregando}>
            {carregando ? <CircularProgress size={24} /> : 'Salvar'}
          </Button>
          <Button type="button" variant="text" onClick={onCancel}>Cancelar</Button>
        </Box>
      </Box>
    </Paper>
  );
}

export default FormularioContato;
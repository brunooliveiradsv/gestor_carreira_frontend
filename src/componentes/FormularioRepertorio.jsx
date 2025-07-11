// src/componentes/FormularioRepertorio.jsx

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNotificacao } from '../contextos/NotificationContext';
import { Box, Button, TextField, Typography, Paper, CircularProgress } from '@mui/material';

function FormularioRepertorio({ id, onSave, onCancel }) {
  const [dadosForm, setDadosForm] = useState({
    nome: '',
    link_cifraclub: '',
    notas_adicionais: '',
  });
  const [carregando, setCarregando] = useState(false);
  const { mostrarNotificacao } = useNotificacao();

  useEffect(() => {
    if (id) {
      axios.get(`http://localhost:3000/api/repertorios/${id}`)
        .then(resposta => setDadosForm(resposta.data))
        .catch(erro => console.error("Erro ao buscar repertório para edição", erro));
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
        await axios.put(`http://localhost:3000/api/repertorios/${id}`, dadosForm);
        mostrarNotificacao('Repertório atualizado com sucesso!', 'success');
      } else {
        await axios.post('http://localhost:3000/api/repertorios', dadosForm);
        mostrarNotificacao('Repertório criado com sucesso!', 'success');
      }
      onSave();
    } catch (erro) {
      mostrarNotificacao('Falha ao salvar o repertório.', 'error');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <Paper elevation={6} sx={{ p: { xs: 2, md: 4 }, borderRadius: 3 }}>
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="h5" component="h2" fontWeight="bold" gutterBottom>
          {id ? 'Editar Repertório' : 'Novo Repertório'}
        </Typography>
        <TextField name="nome" label="Nome do Repertório (ex: Setlist Acústica)" value={dadosForm.nome} onChange={handleChange} required fullWidth />
        <TextField name="link_cifraclub" label="Link do CifraClub" type="url" value={dadosForm.link_cifraclub} onChange={handleChange} fullWidth />
        <TextField name="notas_adicionais" label="Notas Adicionais" multiline rows={4} value={dadosForm.notas_adicionais} onChange={handleChange} fullWidth />
        <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
          <Button type="submit" variant="contained" disabled={carregando}>
            {carregando ? <CircularProgress size={24} /> : 'Salvar'}
          </Button>
          <Button type="button" variant="text" onClick={onCancel}>Cancelar</Button>
        </Box>
      </Box>
    </Paper>
  );
}

export default FormularioRepertorio;
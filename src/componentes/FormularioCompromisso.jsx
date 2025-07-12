// src/componentes/FormularioCompromisso.jsx

import { useState, useEffect } from 'react';
import apiClient from '../api';
import { Box, Button, TextField, Select, MenuItem, FormControl, InputLabel, Typography, Paper, CircularProgress } from '@mui/material';
// --- IMPORT NOVO ---
import { useNotificacao } from '../contextos/NotificationContext';

function FormularioCompromisso({ id, onSave, onCancel }) {
  const [dadosForm, setDadosForm] = useState({
    tipo: 'Show', nome_evento: '', data: '', local: '', status: 'Agendado', valor_cache: '', despesas: [],
  });
  const [carregando, setCarregando] = useState(false);
  
  // --- HOOK NOVO ---
  const { mostrarNotificacao } = useNotificacao(); // Pega a função do nosso contexto

  useEffect(() => {
    if (id) {
      apiClient.get(`/api/compromissos/${id}`)
        .then(resposta => {
          const dataFormatada = new Date(resposta.data.data).toISOString().slice(0, 16);
          const despesasSeguro = resposta.data.despesas || [];
          setDadosForm({ ...resposta.data, data: dataFormatada, despesas: despesasSeguro });
        })
        .catch(erro => console.error("Erro ao buscar dados para edição", erro));
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDadosForm(dadosAtuais => ({ ...dadosAtuais, [name]: value }));
  };

  const handleDespesaChange = (index, campo, valor) => {
    const novasDespesas = [...dadosForm.despesas];
    novasDespesas[index][campo] = valor;
    setDadosForm(dadosAtuais => ({ ...dadosAtuais, despesas: novasDespesas }));
  };

  const adicionarDespesa = () => {
    setDadosForm(dadosAtuais => ({
      ...dadosAtuais,
      despesas: [...(dadosAtuais.despesas || []), { descricao: '', valor: '' }]
    }));
  };

  const removerDespesa = (index) => {
    if (window.confirm("Remover esta despesa?")) {
      const novasDespesas = [...dadosForm.despesas];
      novasDespesas.splice(index, 1);
      setDadosForm(dadosAtuais => ({ ...dadosAtuais, despesas: novasDespesas }));
    }
  };

  // --- FUNÇÃO ATUALIZADA ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setCarregando(true);
    const dadosParaEnviar = { ...dadosForm };

    try {
      if (id) {
        await apiClient.put(`/api/compromissos/${id}`, dadosParaEnviar);
        // Em vez de alert(), usamos nossa nova função
        mostrarNotificacao('Compromisso atualizado com sucesso!', 'success');
      } else {
        await apiClient.post('/api/compromissos', dadosParaEnviar);
        mostrarNotificacao('Compromisso criado com sucesso!', 'success');
      }
      onSave();
    } catch (erro) {
      console.error("Erro ao salvar:", erro);
      // Usamos a severidade 'error' para a notificação de falha
      mostrarNotificacao('Falha ao salvar o compromisso.', 'error');
    } finally {
      setCarregando(false);
    }
  };

  const getStatusOptions = () => {
    if (!id) {
      return [
        <MenuItem key="agendado-novo" value="Agendado">
          Agendado
        </MenuItem>,
      ];
    }
    if (dadosForm.status === "Realizado" || dadosForm.status === "Cancelado") {
      return [
        <MenuItem key={dadosForm.status} value={dadosForm.status}>
          {dadosForm.status}
        </MenuItem>,
      ];
    }
    return [
      <MenuItem key="agendado" value="Agendado">
        Agendado
      </MenuItem>,
      <MenuItem key="cancelado" value="Cancelado">
        Cancelado
      </MenuItem>,
    ];
  };

  const isStatusDisabled = () => {
    if (!id) return true; // Desabilitado na criação
    return dadosForm.status === "Realizado" || dadosForm.status === "Cancelado";
  };

  return (
    <Paper elevation={6} sx={{ p: { xs: 2, sm: 3, md: 4 }, borderRadius: 3 }}>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: "flex", flexDirection: "column", gap: 2 }}
      >
        <Typography variant="h5" component="h2" fontWeight="bold" gutterBottom>
          {id ? "Editar Compromisso" : "Novo Compromisso"}
        </Typography>

        <TextField
          name="nome_evento"
          label="Nome do Evento"
          value={dadosForm.nome_evento}
          onChange={handleChange}
          required
          fullWidth
        />

        <FormControl fullWidth>
          <InputLabel>Tipo</InputLabel>
          <Select
            name="tipo"
            label="Tipo"
            value={dadosForm.tipo}
            onChange={handleChange}
          >
            <MenuItem value="Show">Show</MenuItem>
            <MenuItem value="Ensaio">Ensaio</MenuItem>
            <MenuItem value="Gravação">Gravação</MenuItem>
            <MenuItem value="Reunião">Reunião</MenuItem>
          </Select>
        </FormControl>

        {id && (
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              name="status"
              label="Status"
              value={dadosForm.status}
              onChange={handleChange}
              disabled={isStatusDisabled()}
            >
              {getStatusOptions()}
            </Select>
          </FormControl>
        )}

        <TextField
          name="data"
          label="Data e Hora"
          type="datetime-local"
          value={dadosForm.data}
          onChange={handleChange}
          required
          fullWidth
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          name="local"
          label="Local"
          value={dadosForm.local}
          onChange={handleChange}
          fullWidth
        />
        <TextField
          name="valor_cache"
          label="Cachê (R$)"
          type="number"
          inputProps={{ step: "0.01" }}
          value={dadosForm.valor_cache || ""}
          onChange={handleChange}
          fullWidth
        />

        <Box>
          <Typography variant="h6" gutterBottom>
            Despesas do Evento
          </Typography>
          {(dadosForm.despesas || []).map((despesa, index) => (
            <Box
              key={index}
              sx={{ display: "flex", gap: "10px", alignItems: "center", mb: 1 }}
            >
              <TextField
                label="Descrição da Despesa"
                value={despesa.descricao}
                onChange={(e) =>
                  handleDespesaChange(index, "descricao", e.target.value)
                }
                sx={{ flex: 2 }}
              />
              <TextField
                label="Valor (R$)"
                type="number"
                inputProps={{ step: "0.01" }}
                value={despesa.valor}
                onChange={(e) =>
                  handleDespesaChange(index, "valor", e.target.value)
                }
                sx={{ flex: 1 }}
              />
              <Button
                type="button"
                onClick={() => removerDespesa(index)}
                color="error"
                size="small"
              >
                Remover
              </Button>
            </Box>
          ))}
          <Button
            type="button"
            onClick={adicionarDespesa}
            variant="outlined"
            size="small"
          >
            + Adicionar Despesa
          </Button>
        </Box>

        <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
          <Button type="submit" variant="contained" disabled={carregando}>
            {carregando ? <CircularProgress size={24} /> : "Salvar"}
          </Button>
          <Button type="button" variant="text" onClick={onCancel}>
            Cancelar
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}

export default FormularioCompromisso;

// src/componentes/FormularioMusica.jsx

import { useState, useEffect } from "react";
import apiClient from "../api";
import { useNotificacao } from "../contextos/NotificationContext.jsx";
import {
  Box, Button, TextField, Typography, CircularProgress,
  Autocomplete, Chip, Grid
} from "@mui/material";

const estadoInicialFormulario = {
  nome: "", artista: "", tom: "", duracao_minutos: "",
  bpm: "", link_cifra: "", notas_adicionais: "",
};

function FormularioMusica({ id, onSave, onCancel }) {
  const [form, setForm] = useState(estadoInicialFormulario);
  const [tagsSelecionadas, setTagsSelecionadas] = useState([]);
  const [tagsDisponiveis, setTagsDisponiveis] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const { mostrarNotificacao } = useNotificacao();

  useEffect(() => {
    apiClient.get("/api/tags")
      .then(res => setTagsDisponiveis(res.data))
      .catch(() => mostrarNotificacao("Não foi possível carregar as tags.", "error"));
  }, [mostrarNotificacao]);

  useEffect(() => {
    if (id) {
      setCarregando(true);
      apiClient.get(`/api/musicas/${id}`)
        .then(({ data }) => {
          const { tags, ...dadosMusica } = data;
          setForm(dadosMusica);
          setTagsSelecionadas(tags || []); 
        })
        .catch(() => mostrarNotificacao("Erro ao carregar dados da música.", "error"))
        .finally(() => setCarregando(false));
    } else {
      setForm(estadoInicialFormulario);
      setTagsSelecionadas([]);
    }
  }, [id, mostrarNotificacao]);

  const handleChange = (e) => {
    setForm(dadosAtuais => ({ ...dadosAtuais, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCarregando(true);

    const tagIds = tagsSelecionadas.map(tag => tag.id);
    const dadosParaEnviar = { ...form, tagIds };

    try {
      if (id) {
        await apiClient.put(`/api/musicas/${id}`, dadosParaEnviar);
        mostrarNotificacao("Música atualizada com sucesso!", "success");
      } else {
        await apiClient.post("/api/musicas", dadosParaEnviar);
        mostrarNotificacao("Música adicionada com sucesso!", "success");
      }
      onSave();
    } catch (erro) {
      mostrarNotificacao(erro.response?.data?.mensagem || "Falha ao salvar a música.", "error");
      setCarregando(false);
    }
  };

  if (carregando) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Typography variant="h5" component="h2" fontWeight="bold">
        {id ? "Editar Música" : "Nova Música"}
      </Typography>

      <TextField name="nome" label="Nome da Música" value={form.nome || ''} onChange={handleChange} required fullWidth />
      <TextField name="artista" label="Artista" value={form.artista || ''} onChange={handleChange} required fullWidth />
      
      <Grid container spacing={2}>
        <Grid item xs={12} sm={4}><TextField name="tom" label="Tom" value={form.tom || ''} onChange={handleChange} fullWidth /></Grid>
        <Grid item xs={12} sm={4}><TextField name="bpm" label="BPM" type="number" value={form.bpm || ''} onChange={handleChange} fullWidth /></Grid>
        <Grid item xs={12} sm={4}><TextField name="duracao_minutos" label="Duração" placeholder="Ex: 3:45" value={form.duracao_minutos || ''} onChange={handleChange} fullWidth /></Grid>
      </Grid>
      
      <Autocomplete multiple
        options={tagsDisponiveis}
        getOptionLabel={(option) => option.nome}
        value={tagsSelecionadas}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        onChange={(event, novoValor) => setTagsSelecionadas(novoValor)}
        renderInput={(params) => <TextField {...params} label="Tags" />}
      />
      
      <TextField name="link_cifra" label="Link para Cifra" value={form.link_cifra || ''} onChange={handleChange} fullWidth />
      <TextField name="notas_adicionais" label="Anotações / Cifra" multiline rows={8} value={form.notas_adicionais || ''} onChange={handleChange} fullWidth />
      
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button onClick={onCancel} disabled={carregando}>Cancelar</Button>
        <Button type="submit" variant="contained" disabled={carregando}>
          {carregando ? <CircularProgress size={24} /> : "Salvar"}
        </Button>
      </Box>
    </Box>
  );
}

export default FormularioMusica;
// src/componentes/FormularioMusica.jsx

import { useState, useEffect, useCallback } from "react";
import apiClient from "../api";
import { useNotificacao } from "../contextos/NotificationContext.jsx";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  CircularProgress,
  Autocomplete,
  Chip,
  Grid,
} from "@mui/material";

// Define um estado inicial limpo para reutilização
const estadoInicialFormulario = {
  nome: "",
  artista: "",
  tom: "",
  duracao_segundos: "",
  bpm: "",
  link_cifra: "",
  notas_adicionais: "",
};

function FormularioMusica({ id, onSave, onCancel }) {
  // Estados separados para os dados do formulário e para as tags
  const [form, setForm] = useState(estadoInicialFormulario);
  const [tags, setTags] = useState([]);
  
  // Estado para as sugestões de tags do Autocomplete
  const [tagsDisponiveis, setTagsDisponiveis] = useState([]);
  
  const [carregando, setCarregando] = useState(false);
  const { mostrarNotificacao } = useNotificacao();

  // Função para carregar os dados da música para edição
  const carregarMusicaParaEdicao = useCallback(async () => {
    if (!id) return;
    setCarregando(true);
    try {
      const { data } = await apiClient.get(`/api/musicas/${id}`);
      const { tags: tagsDaApi, ...dadosMusica } = data;
      setForm(dadosMusica);
      setTags(tagsDaApi?.map(t => t.nome) || []);
    } catch (error) {
      mostrarNotificacao("Erro ao carregar os dados da música.", "error");
      onCancel(); // Fecha o formulário em caso de erro
    } finally {
      setCarregando(false);
    }
  }, [id, mostrarNotificacao, onCancel]);

  // Efeito para carregar as sugestões de tags uma vez
  useEffect(() => {
    apiClient.get("/api/tags")
      .then(res => setTagsDisponiveis(res.data.map(t => t.nome)))
      .catch(() => mostrarNotificacao("Não foi possível carregar as tags.", "error"));
  }, [mostrarNotificacao]);

  // Efeito principal que decide se carrega para edição ou limpa para criação
  useEffect(() => {
    if (id) {
      carregarMusicaParaEdicao();
    } else {
      setForm(estadoInicialFormulario);
      setTags([]);
    }
  }, [id, carregarMusicaParaEdicao]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(dadosAtuais => ({ ...dadosAtuais, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCarregando(true);

    const dadosParaEnviar = { ...form, tags };

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

  if (carregando && id) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }

  return (
    <Paper elevation={6} sx={{ p: { xs: 2, md: 4 } }}>
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Typography variant="h5" component="h2" fontWeight="bold">
          {id ? "Editar Música" : "Adicionar Nova Música"}
        </Typography>

        <Typography variant="overline" color="text.secondary">Informações Principais</Typography>
        <TextField name="nome" label="Nome da Música" value={form.nome} onChange={handleChange} required fullWidth />
        <TextField name="artista" label="Artista" value={form.artista} onChange={handleChange} required fullWidth />

        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}><TextField name="tom" label="Tom" value={form.tom || ''} onChange={handleChange} fullWidth /></Grid>
          <Grid item xs={12} sm={4}><TextField name="bpm" label="BPM" type="number" value={form.bpm || ''} onChange={handleChange} fullWidth /></Grid>
          <Grid item xs={12} sm={4}><TextField name="duracao_segundos" label="Duração (mm:ss)" value={form.duracao_segundos || ''} onChange={handleChange} fullWidth /></Grid>
        </Grid>

        <Typography variant="overline" color="text.secondary" sx={{ mt: 1 }}>Organização e Detalhes</Typography>
        <Autocomplete
          multiple
          freeSolo
          options={tagsDisponiveis}
          value={tags}
          onChange={(event, novoValor) => setTags(novoValor)}
          renderTags={(valor, getTagProps) =>
            valor.map((opcao, index) => <Chip label={opcao} {...getTagProps({ index })} />)
          }
          renderInput={(params) => <TextField {...params} label="Tags" placeholder="Adicione ou crie tags" />}
        />

        <TextField name="link_cifra" label="Link para Cifra/Partitura" value={form.link_cifra || ''} onChange={handleChange} fullWidth />
        <TextField name="notas_adicionais" label="Cifra, Letra ou Anotações" multiline rows={10} value={form.notas_adicionais || ''} onChange={handleChange} fullWidth />
        
        <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
          <Button type="submit" variant="contained" disabled={carregando}>
            {carregando ? <CircularProgress size={24} /> : "Salvar Música"}
          </Button>
          <Button type="button" variant="text" onClick={onCancel} disabled={carregando}>Cancelar</Button>
        </Box>
      </Box>
    </Paper>
  );
}

export default FormularioMusica;
// src/componentes/FormularioMusica.jsx

import { useState, useEffect } from "react";
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

const estadoInicialFormulario = {
  nome: "", artista: "", tom: "", duracao_segundos: "",
  bpm: "", link_cifra: "", notas_adicionais: "",
};

function FormularioMusica({ id, onSave, onCancel }) {
  const [form, setForm] = useState(estadoInicialFormulario);
  // O estado agora irá guardar os OBJETOS de tags selecionados, não apenas os nomes
  const [tagsSelecionadas, setTagsSelecionadas] = useState([]);
  // Este estado guardará a lista de todas as tags predefinidas
  const [tagsDisponiveis, setTagsDisponiveis] = useState([]);
  
  const [carregando, setCarregando] = useState(true);
  const { mostrarNotificacao } = useNotificacao();

  // Efeito para buscar todas as tags predefinidas
  useEffect(() => {
    setCarregando(true);
    apiClient.get("/api/tags")
      .then(res => {
        setTagsDisponiveis(res.data);
      })
      .catch(() => mostrarNotificacao("Não foi possível carregar as tags.", "error"))
      .finally(() => setCarregando(false));
  }, [mostrarNotificacao]);

  // Efeito para buscar os dados da música em modo de edição
  useEffect(() => {
    if (id) {
      setCarregando(true);
      apiClient.get(`/api/musicas/${id}`)
        .then(({ data }) => {
          const { tags: tagsDaApi, ...dadosMusica } = data;
          setForm(dadosMusica);
          // Garante que o estado de tags selecionadas guarde os objetos completos
          setTagsSelecionadas(tagsDaApi || []); 
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

    // Transforma o array de objetos de tags num array de IDs para enviar ao backend
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
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }

  return (
    <Paper elevation={6} sx={{ p: { xs: 2, md: 4 } }}>
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Typography variant="h5" component="h2" fontWeight="bold">
          {id ? "Editar Música" : "Adicionar Nova Música"}
        </Typography>

        <TextField name="nome" label="Nome da Música" value={form.nome} onChange={handleChange} required fullWidth />
        <TextField name="artista" label="Artista" value={form.artista} onChange={handleChange} required fullWidth />
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}><TextField name="tom" label="Tom" value={form.tom || ''} onChange={handleChange} fullWidth /></Grid>
          <Grid item xs={12} sm={4}><TextField name="bpm" label="BPM" type="number" value={form.bpm || ''} onChange={handleChange} fullWidth /></Grid>
          <Grid item xs={12} sm={4}><TextField name="duracao_segundos" label="Duração (mm:ss)" value={form.duracao_segundos || ''} onChange={handleChange} fullWidth /></Grid>
        </Grid>

        <Autocomplete
          multiple
          // A propriedade freeSolo foi REMOVIDA
          id="tags-predefinidas"
          options={tagsDisponiveis}
          getOptionLabel={(option) => option.nome} // Mostra o nome da tag na lista
          value={tagsSelecionadas}
          isOptionEqualToValue={(option, value) => option.id === value.id} // Compara tags pelo ID
          onChange={(event, novoValor) => {
            setTagsSelecionadas(novoValor);
          }}
          renderInput={(params) => (
            <TextField {...params} label="Tags" placeholder="Selecione as tags" />
          )}
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
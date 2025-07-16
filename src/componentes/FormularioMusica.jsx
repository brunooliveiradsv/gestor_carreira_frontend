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

function FormularioMusica({ id, onSave, onCancel }) {
  const [dadosForm, setDadosForm] = useState({
    nome: "",
    artista: "",
    tom: "",
    duracao_segundos: "",
    bpm: "",
    link_cifra: "",
    notas_adicionais: "",
  });
  const [tagsSelecionadas, setTagsSelecionadas] = useState([]);
  const [tagsDisponiveis, setTagsDisponiveis] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const { mostrarNotificacao } = useNotificacao();

  useEffect(() => {
    // Busca todas as tags existentes para usar como sugestões no Autocomplete
    apiClient
      .get("/api/tags")
      .then((resposta) =>
        setTagsDisponiveis(resposta.data.map((tag) => tag.nome))
      )
      .catch(() =>
        mostrarNotificacao("Erro ao carregar sugestões de tags.", "error")
      );
  }, [mostrarNotificacao]);

  useEffect(() => {
    // Se um 'id' for fornecido, estamos no modo de edição
    if (id) {
      setCarregando(true);
      apiClient
        .get(`/api/musicas/${id}`)
        .then((resposta) => {
          const { tags, ...dadosMusica } = resposta.data;
          setDadosForm(dadosMusica);
          // As tags vêm como um array de objetos, então extraímos apenas os nomes
          setTagsSelecionadas(tags?.map((tag) => tag.nome) || []);
        })
        .catch(() =>
          mostrarNotificacao("Erro ao buscar dados da música para edição.", "error")
        )
        .finally(() => setCarregando(false));
    }
  }, [id, mostrarNotificacao]);

  const handleChange = (e) => {
    setDadosForm((atuais) => ({ ...atuais, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCarregando(true);
    // Prepara o objeto para envio, incluindo o array de strings das tags
    const dadosParaEnviar = { ...dadosForm, tags: tagsSelecionadas };

    try {
      if (id) {
        // Se temos um ID, atualizamos (PUT)
        await apiClient.put(`/api/musicas/${id}`, dadosParaEnviar);
        mostrarNotificacao("Música atualizada com sucesso!", "success");
      } else {
        // Caso contrário, criamos uma nova (POST)
        await apiClient.post("/api/musicas", dadosParaEnviar);
        mostrarNotificacao(
          "Música adicionada ao repertório com sucesso!",
          "success"
        );
      }
      onSave(); // Chama a função para fechar o formulário e recarregar a lista
    } catch (erro) {
      mostrarNotificacao(
        erro.response?.data?.mensagem || "Falha ao salvar a música.",
        "error"
      );
    } finally {
      setCarregando(false);
    }
  };
  
  // Se estiver a carregar os dados para edição, mostra um spinner
  if (carregando && id) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress color="inherit" />
      </Box>
    );
  }

  return (
    <Paper elevation={6} sx={{ p: { xs: 2, md: 4 } }}>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: "flex", flexDirection: "column", gap: 3 }}
      >
        <Typography variant="h5" component="h2" fontWeight="bold">
          {id ? "Editar Música" : "Adicionar Nova Música"}
        </Typography>

        <Typography variant="overline" color="text.secondary">
          Detalhes da música
        </Typography>
        <TextField
          name="nome"
          label="Nome da Música"
          value={dadosForm.nome}
          onChange={handleChange}
          required
          fullWidth
        />
        <TextField
          name="artista"
          label="Artista Original"
          value={dadosForm.artista}
          onChange={handleChange}
          required
          fullWidth
        />

        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <TextField
              name="tom"
              label="Tom"
              value={dadosForm.tom || ""}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              name="bpm"
              label="BPM"
              type="number"
              value={dadosForm.bpm || ""}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              name="duracao_segundos"
              label="Duração (mm:ss)"
              placeholder="Ex: 3:25"
              value={dadosForm.duracao_segundos || ""}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
        </Grid>

        <Autocomplete
          multiple
          freeSolo
          options={tagsDisponiveis}
          value={tagsSelecionadas}
          onChange={(event, newValue) => {
            setTagsSelecionadas(newValue);
          }}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip
                variant="outlined"
                label={option}
                {...getTagProps({ index })}
              />
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

        <TextField
          name="link_cifra"
          label="Link para Cifra/Partitura (opcional)"
          value={dadosForm.link_cifra || ""}
          onChange={handleChange}
          fullWidth
        />
        <TextField
          name="notas_adicionais"
          label="Cifra / Letra / Anotações"
          multiline
          rows={10}
          value={dadosForm.notas_adicionais || ""}
          onChange={handleChange}
          fullWidth
        />

        <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
          <Button
            type="submit"
            variant="contained"
            disabled={carregando}
          >
            {carregando ? <CircularProgress size={24} /> : "Salvar Música"}
          </Button>
          <Button type="button" variant="text" onClick={onCancel}>
            Cancelar
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}

export default FormularioMusica;
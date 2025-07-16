// src/componentes/FormularioMusica.jsx

import { useState, useEffect } from "react";
import apiClient from "../api";
import { useNotificacao } from "../contextos/NotificationContext";
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
import { Search as SearchIcon } from "@mui/icons-material";

function FormularioMusica({ id, onSave, onCancel }) {
  const [dadosForm, setDadosForm] = useState({
    nome: "",
    artista: "",
    tom: "",
    duracao_segundos: "",
    bpm: "", // Campo BPM adicionado ao estado
    link_cifra: "",
    notas_adicionais: "",
  });
  const [tagsSelecionadas, setTagsSelecionadas] = useState([]);
  const [tagsDisponiveis, setTagsDisponiveis] = useState([]);
  const [carregando, setCarregando] = useState(false);

  const [nomeMusicaBusca, setNomeMusicaBusca] = useState("");
  const [nomeArtistaBusca, setNomeArtistaBusca] = useState("");
  const [buscando, setBuscando] = useState(false);

  const { mostrarNotificacao } = useNotificacao();

  useEffect(() => {
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
    if (id) {
      setCarregando(true);
      apiClient
        .get(`/api/musicas/${id}`)
        .then((resposta) => {
          const { tags, ...dadosMusica } = resposta.data;
          setDadosForm(dadosMusica);
          setTagsSelecionadas(tags.map((tag) => tag.nome));
        })
        .catch(() =>
          mostrarNotificacao(
            "Erro ao buscar dados da música para edição.",
            "error"
          )
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
    const dadosParaEnviar = { ...dadosForm, tags: tagsSelecionadas };

    try {
      if (id) {
        await apiClient.put(`/api/musicas/${id}`, dadosParaEnviar);
        mostrarNotificacao("Música atualizada com sucesso!", "success");
      } else {
        await apiClient.post("/api/musicas", dadosParaEnviar);
        mostrarNotificacao(
          "Música adicionada ao repertório com sucesso!",
          "success"
        );
      }
      onSave();
    } catch (erro) {
      mostrarNotificacao(
        erro.response?.data?.mensagem || "Falha ao salvar a música.",
        "error"
      );
    } finally {
      setCarregando(false);
    }
  };

  const handleBuscaInteligente = async () => {
    if (!nomeMusicaBusca || !nomeArtistaBusca) {
      mostrarNotificacao(
        "Preencha o nome da música e do artista para buscar.",
        "warning"
      );
      return;
    }
    setBuscando(true);
    try {
      const response = await fetch('/api/busca-inteligente', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nomeMusica: nomeMusicaBusca,
          nomeArtista: nomeArtistaBusca,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.mensagem || "Erro na busca.");
      }

      // Desestrutura todos os dados, incluindo o BPM
      const { nome, artista, tom, notas_adicionais, bpm, duracao_segundos } = data;

      setDadosForm((atuais) => ({
        ...atuais,
        nome: nome || atuais.nome,
        artista: artista || atuais.artista,
        tom: tom || atuais.tom,
        notas_adicionais: notas_adicionais || atuais.notas_adicionais,
        bpm: bpm || atuais.bpm, // Define o BPM
        duracao_segundos: duracao_segundos || atuais.duracao_segundos,
      }));

      mostrarNotificacao("Dados importados com sucesso!", "success");
    } catch (erro) {
      mostrarNotificacao(
        erro.message || "Falha na busca inteligente.",
        "error"
      );
    } finally {
      setBuscando(false);
    }
  };

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

        {!id && (
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              borderColor: "primary.main",
              bgcolor: "rgba(94, 53, 177, 0.05)",
            }}
          >
            <Typography variant="h6" gutterBottom>
              Busca Inteligente
            </Typography>
            <Grid container spacing={2} alignItems="flex-end">
              <Grid item xs={12} sm={5}>
                <TextField
                  fullWidth
                  label="Nome da Música"
                  value={nomeMusicaBusca}
                  onChange={(e) => setNomeMusicaBusca(e.target.value)}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Nome do Artista"
                  value={nomeArtistaBusca}
                  onChange={(e) => setNomeArtistaBusca(e.target.value)}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleBuscaInteligente}
                  disabled={buscando}
                  startIcon={
                    buscando ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      <SearchIcon />
                    )
                  }
                >
                  Buscar
                </Button>
              </Grid>
            </Grid>
          </Paper>
        )}

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
          InputLabelProps={{ shrink: !!dadosForm.nome }}
        />
        <TextField
          name="artista"
          label="Artista Original"
          value={dadosForm.artista}
          onChange={handleChange}
          required
          fullWidth
          InputLabelProps={{ shrink: !!dadosForm.artista }}
        />
        {/* --- GRID PARA ORGANIZAR TOM, DURAÇÃO E BPM --- */}
        <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
                 <TextField
                    name="tom"
                    label="Tom"
                    value={dadosForm.tom || ""}
                    onChange={handleChange}
                    fullWidth
                    InputLabelProps={{ shrink: !!dadosForm.tom }}
                />
            </Grid>
            <Grid item xs={12} sm={4}>
                <TextField
                    name="duracao_segundos"
                    label="Duração (segundos)"
                    type="number"
                    value={dadosForm.duracao_segundos || ""}
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
          InputLabelProps={{ shrink: !!dadosForm.notas_adicionais }}
        />

        <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
          <Button
            type="submit"
            variant="contained"
            disabled={carregando || buscando}
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
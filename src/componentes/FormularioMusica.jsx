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

// --- NOVAS FUNÇÕES AUXILIARES PARA A DURAÇÃO ---

// Converte segundos para o formato "mm:ss"
const formatarDuracao = (totalSegundos) => {
    if (totalSegundos === null || totalSegundos === undefined || isNaN(totalSegundos)) {
        return '';
    }
    const minutos = Math.floor(totalSegundos / 60);
    const segundos = totalSegundos % 60;
    return `${minutos}:${segundos.toString().padStart(2, '0')}`;
};

// Converte o formato "mm:ss" de volta para segundos
const parseDuracao = (stringDuracao) => {
    if (!stringDuracao || !stringDuracao.includes(':')) {
        // Se o utilizador digitar apenas um número, assume que são segundos
        const apenasNumeros = parseInt(stringDuracao, 10);
        return isNaN(apenasNumeros) ? null : apenasNumeros;
    }
    const partes = stringDuracao.split(':');
    const minutos = parseInt(partes[0], 10) || 0;
    const segundos = parseInt(partes[1], 10) || 0;
    return (minutos * 60) + segundos;
};


function FormularioMusica({ id, onSave, onCancel }) {
  const [dadosForm, setDadosForm] = useState({
    nome: "",
    artista: "",
    tom: "",
    duracao_segundos: null,
    bpm: "",
    link_cifra: "",
    notas_adicionais: "",
  });
  // Novo estado para controlar o valor visível no campo de duração
  const [duracaoVisivel, setDuracaoVisivel] = useState('');

  const [tagsSelecionadas, setTagsSelecionadas] = useState([]);
  const [tagsDisponiveis, setTagsDisponiveis] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [nomeMusicaBusca, setNomeMusicaBusca] = useState("");
  const [nomeArtistaBusca, setNomeArtistaBusca] = useState("");
  const [buscando, setBuscando] = useState(false);
  const { mostrarNotificacao } = useNotificacao();

  useEffect(() => {
    // Quando 'dadosForm.duracao_segundos' muda, atualiza o campo visível
    setDuracaoVisivel(formatarDuracao(dadosForm.duracao_segundos));
  }, [dadosForm.duracao_segundos]);
  
  const handleDuracaoChange = (e) => {
      const valorVisivel = e.target.value;
      setDuracaoVisivel(valorVisivel); // Atualiza o que o utilizador vê
      
      // Converte para segundos e atualiza o estado principal que será salvo
      const totalSegundos = parseDuracao(valorVisivel);
      setDadosForm(atuais => ({ ...atuais, duracao_segundos: totalSegundos }));
  };

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
        throw new Error(data.message || "Erro na busca.");
      }
      const { nome, artista, tom, notas_adicionais, bpm, duracao_segundos } = data;
      setDadosForm((atuais) => ({
        ...atuais,
        nome: nome || atuais.nome,
        artista: artista || atuais.artista,
        tom: tom || atuais.tom,
        notas_adicionais: notas_adicionais || atuais.notas_adicionais,
        bpm: bpm || atuais.bpm,
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
          <Paper variant="outlined" sx={{ p: 2, borderColor: "primary.main", bgcolor: "rgba(94, 53, 177, 0.05)" }}>
            <Typography variant="h6" gutterBottom>Busca Inteligente</Typography>
            <Grid container spacing={2} alignItems="flex-end">
              <Grid item xs={12} sm={5}><TextField fullWidth label="Nome da Música" value={nomeMusicaBusca} onChange={(e) => setNomeMusicaBusca(e.target.value)} size="small" /></Grid>
              <Grid item xs={12} sm={4}><TextField fullWidth label="Nome do Artista" value={nomeArtistaBusca} onChange={(e) => setNomeArtistaBusca(e.target.value)} size="small" /></Grid>
              <Grid item xs={12} sm={3}>
                <Button fullWidth variant="contained" onClick={handleBuscaInteligente} disabled={buscando} startIcon={buscando ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}>
                  Buscar
                </Button>
              </Grid>
            </Grid>
          </Paper>
        )}

        <Typography variant="overline" color="text.secondary">Detalhes da música</Typography>
        <TextField name="nome" label="Nome da Música" value={dadosForm.nome} onChange={handleChange} required fullWidth InputLabelProps={{ shrink: !!dadosForm.nome }} />
        <TextField name="artista" label="Artista Original" value={dadosForm.artista} onChange={handleChange} required fullWidth InputLabelProps={{ shrink: !!dadosForm.artista }} />
        
        <Grid container spacing={2}>
            <Grid item xs={12} sm={4}><TextField name="tom" label="Tom" value={dadosForm.tom || ""} onChange={handleChange} fullWidth InputLabelProps={{ shrink: !!dadosForm.tom }} /></Grid>
            <Grid item xs={12} sm={4}><TextField name="bpm" label="BPM" type="number" value={dadosForm.bpm || ""} onChange={handleChange} fullWidth InputLabelProps={{ shrink: !!dadosForm.bpm }} /></Grid>
            <Grid item xs={12} sm={4}>
                <TextField
                    name="duracao_segundos_visivel"
                    label="Duração (mm:ss)"
                    placeholder="Ex: 3:45"
                    value={duracaoVisivel}
                    onChange={handleDuracaoChange}
                    fullWidth
                />
            </Grid>
        </Grid>

        <Autocomplete multiple freeSolo options={tagsDisponiveis} value={tagsSelecionadas}
          onChange={(event, newValue) => { setTagsSelecionadas(newValue); }}
          renderTags={(value, getTagProps) => value.map((option, index) => (<Chip variant="outlined" label={option} {...getTagProps({ index })} />))}
          renderInput={(params) => (<TextField {...params} variant="outlined" label="Tags" placeholder="Adicione ou crie tags (ex: Lenta, Anos 80)" />)}
        />

        <TextField name="link_cifra" label="Link para Cifra/Partitura (opcional)" value={dadosForm.link_cifra || ""} onChange={handleChange} fullWidth />
        <TextField name="notas_adicionais" label="Cifra / Letra / Anotações" multiline rows={10} value={dadosForm.notas_adicionais || ""} onChange={handleChange} fullWidth InputLabelProps={{ shrink: !!dadosForm.notas_adicionais }} />

        <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
          <Button type="submit" variant="contained" disabled={carregando || buscando}>{carregando ? <CircularProgress size={24} /> : "Salvar Música"}</Button>
          <Button type="button" variant="text" onClick={onCancel}>Cancelar</Button>
        </Box>
      </Box>
    </Paper>
  );
}

export default FormularioMusica;
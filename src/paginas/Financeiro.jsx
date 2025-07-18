// src/paginas/Financeiro.jsx

import { useState, useEffect } from "react";
import apiClient from "../api";
import { useNotificacao } from "../contextos/NotificationContext";

import {
  Box, Button, Container, Typography, CircularProgress, Card,
  CardContent, Paper, Grid, TextField, Select, MenuItem,
  FormControl, InputLabel, Avatar, ButtonGroup, useTheme, CardHeader
} from "@mui/material";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";

function Financeiro() {
  const [transacoes, setTransacoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [filtroPeriodo, setFiltroPeriodo] = useState("tudo");
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [transacoesFiltradas, setTransacoesFiltradas] = useState([]);
  const [novaTransacao, setNovaTransacao] = useState({
    descricao: "", valor: "", tipo: "despesa", data: new Date().toISOString().slice(0, 10),
  });
  const { mostrarNotificacao } = useNotificacao();
  const theme = useTheme();

  // ... (toda a lógica de busca e manipulação de dados permanece a mesma) ...
  useEffect(() => {
    async function buscarTransacoes() {
      try {
        const resposta = await apiClient.get("/api/financeiro/transacoes");
        setTransacoes(resposta.data);
      } catch (erro) {
        mostrarNotificacao("Não foi possível carregar o extrato financeiro.", "error");
      } finally {
        setCarregando(false);
      }
    }
    buscarTransacoes();
  }, []);

  useEffect(() => {
    let transacoesTemporarias = [...transacoes];
    if (filtroTipo !== "todos") {
      transacoesTemporarias = transacoesTemporarias.filter((t) => t.tipo === filtroTipo);
    }
    if (filtroPeriodo !== "tudo") {
      const hoje = new Date();
      const primeiroDiaDoMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
      const primeiroDiaDoAno = new Date(hoje.getFullYear(), 0, 1);
      if (filtroPeriodo === "mes") {
        transacoesTemporarias = transacoesTemporarias.filter((t) => new Date(t.data) >= primeiroDiaDoMes);
      } else if (filtroPeriodo === "ano") {
        transacoesTemporarias = transacoesTemporarias.filter((t) => new Date(t.data) >= primeiroDiaDoAno);
      }
    }
    setTransacoesFiltradas(transacoesTemporarias);
  }, [transacoes, filtroPeriodo, filtroTipo]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setNovaTransacao((dadosAtuais) => ({ ...dadosAtuais, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const resposta = await apiClient.post("/api/financeiro/transacoes", novaTransacao);
      setTransacoes((transacoesAtuais) =>
        [resposta.data, ...transacoesAtuais].sort((a, b) => new Date(b.data) - new Date(a.data))
      );
      mostrarNotificacao("Transação salva com sucesso!", "success");
      setMostrarFormulario(false);
      setNovaTransacao({ descricao: "", valor: "", tipo: "despesa", data: new Date().toISOString().slice(0, 10) });
    } catch (erro) {
      mostrarNotificacao(erro.response?.data?.mensagem || "Falha ao salvar a transação.", "error");
    }
  };

  const totalReceitas = transacoesFiltradas.filter((t) => t.tipo === "receita").reduce((acc, t) => acc + parseFloat(t.valor), 0);
  const totalDespesas = transacoesFiltradas.filter((t) => t.tipo === "despesa").reduce((acc, t) => acc + parseFloat(t.valor), 0);
  const saldo = totalReceitas - totalDespesas;

  if (carregando) {
    return <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}><CircularProgress color="inherit" /></Box>;
  }

  return (
    <Box>
        <Box sx={{mb: 4}}>
            <Typography variant="h4" component="h1" fontWeight="bold">Painel Financeiro</Typography>
            <Typography color="text.secondary">Controle suas receitas, despesas e veja seu saldo.</Typography>
        </Box>
      
        {/* Resumo */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={4}>
            <Card>
                <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}><TrendingUpIcon /></Avatar>
                        <Box>
                            <Typography color="text.secondary">Receitas (período)</Typography>
                            <Typography variant="h5" fontWeight="bold">R$ {totalReceitas.toFixed(2)}</Typography>
                        </Box>
                    </Box>
                </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card>
                <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ bgcolor: 'error.main', mr: 2 }}><TrendingDownIcon /></Avatar>
                        <Box>
                            <Typography color="text.secondary">Despesas (período)</Typography>
                            <Typography variant="h5" fontWeight="bold">R$ {totalDespesas.toFixed(2)}</Typography>
                        </Box>
                    </Box>
                </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={12} md={4}>
            <Card>
                <CardContent>
                     <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ bgcolor: saldo >= 0 ? 'primary.main' : 'warning.main', mr: 2 }}><AccountBalanceWalletIcon /></Avatar>
                        <Box>
                            <Typography color="text.secondary">Balanço (período)</Typography>
                            <Typography variant="h5" fontWeight="bold">R$ {saldo.toFixed(2)}</Typography>
                        </Box>
                    </Box>
                </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Controles e Formulário */}
        <Paper sx={{ p: { xs: 2, md: 3 }, mb: 4 }}>
            <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} lg={8}>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <ButtonGroup>
                        <Button variant={filtroPeriodo === "mes" ? "contained" : "outlined"} onClick={() => setFiltroPeriodo("mes")}>Este Mês</Button>
                        <Button variant={filtroPeriodo === "ano" ? "contained" : "outlined"} onClick={() => setFiltroPeriodo("ano")}>Este Ano</Button>
                        <Button variant={filtroPeriodo === "tudo" ? "contained" : "outlined"} onClick={() => setFiltroPeriodo("tudo")}>Tudo</Button>
                    </ButtonGroup>
                    <ButtonGroup>
                        <Button variant={filtroTipo === "todos" ? "contained" : "outlined"} onClick={() => setFiltroTipo("todos")}>Todos</Button>
                        <Button variant={filtroTipo === "receita" ? "contained" : "outlined"} onClick={() => setFiltroTipo("receita")}>Receitas</Button>
                        <Button variant={filtroTipo === "despesa" ? "contained" : "outlined"} onClick={() => setFiltroTipo("despesa")}>Despesas</Button>
                    </ButtonGroup>
                    </Box>
                </Grid>
                <Grid item xs={12} lg={4} sx={{ textAlign: { lg: "right", xs: "left" }, mt: { xs: 2, lg: 0 } }}>
                    <Button variant="contained" onClick={() => setMostrarFormulario(!mostrarFormulario)} startIcon={<AddCircleOutlineIcon />} sx={{ width: { xs: "100%", lg: "auto" } }}>
                    {mostrarFormulario ? "Fechar Formulário" : "Nova Transação"}
                    </Button>
                </Grid>
            </Grid>
             {mostrarFormulario && (
                <Box component="form" onSubmit={handleFormSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 4, borderTop: `1px solid ${theme.palette.divider}`, pt: 3 }}>
                    <Typography variant="h6">Adicionar Nova Transação</Typography>
                    <TextField name="descricao" label="Descrição" variant="outlined" value={novaTransacao.descricao} onChange={handleFormChange} required fullWidth />
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={4}>
                             <TextField name="valor" label="Valor (R$)" type="number" variant="outlined" inputProps={{ step: "0.01" }} value={novaTransacao.valor} onChange={handleFormChange} required fullWidth />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField name="data" label="Data" type="date" variant="outlined" value={novaTransacao.data} onChange={handleFormChange} required fullWidth InputLabelProps={{ shrink: true }} />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                             <FormControl fullWidth variant="outlined">
                                <InputLabel>Tipo</InputLabel>
                                <Select name="tipo" value={novaTransacao.tipo} label="Tipo" onChange={handleFormChange}>
                                    <MenuItem value="despesa">Despesa</MenuItem>
                                    <MenuItem value="receita">Receita</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                    <Button type="submit" variant="contained" color="primary" sx={{alignSelf: 'flex-start'}}>Salvar Transação</Button>
                </Box>
             )}
        </Paper>

        {/* Histórico */}
      <Paper sx={{ p: { xs: 2, md: 3 } }}>
        <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">Histórico de Transações</Typography>
        <Box>
          {transacoesFiltradas.length > 0 ? (
            transacoesFiltradas.map((t) => (
              <Card key={t.id} variant="outlined" sx={{ mb: 1.5, display: 'flex', alignItems: 'center', p: 2, '&:hover': {borderColor: 'primary.main'} }}>
                <Avatar sx={{ bgcolor: t.tipo === "receita" ? 'success.light' : 'error.light', mr: 2 }}>
                  {t.tipo === "receita" ? <TrendingUpIcon sx={{ color: 'success.dark' }} /> : <TrendingDownIcon sx={{ color: 'error.dark' }} />}
                </Avatar>
                <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
                  <Typography variant="body1" fontWeight="bold" noWrap>{t.descricao}</Typography>
                  <Typography variant="body2" color="text.secondary">{new Date(t.data).toLocaleDateString("pt-BR", {day:'2-digit', month:'2-digit', year:'numeric'})}</Typography>
                </Box>
                <Typography variant="h6" fontWeight="bold" sx={{ color: t.tipo === "receita" ? 'success.main' : 'error.main', minWidth: '120px', textAlign: 'right' }}>
                  {t.tipo === "receita" ? "+" : "-"} R$ {parseFloat(t.valor).toFixed(2)}
                </Typography>
              </Card>
            ))
          ) : (
            <Box sx={{ p: { xs: 3, md: 5 }, textAlign: "center", border: `2px dashed ${theme.palette.divider}`, borderRadius: 2, mt: 3 }}>
              <AccountBalanceWalletIcon sx={{ fontSize: 48, color: "text.secondary", mb: 2 }} />
              <Typography variant="h6">Nenhuma transação encontrada</Typography>
              <Typography color="text.secondary">Use os filtros ou adicione uma nova transação para começar.</Typography>
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
}

export default Financeiro;
// src/paginas/Financeiro.jsx
import apiClient from "../apiClient";
import { useNotificacao } from "../contextos/NotificationContext";
import { useState, useEffect, useCallback, memo } from "react";

import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  Paper,
  Grid,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Avatar,
  ButtonGroup,
  useTheme,
} from "@mui/material";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";

// Componente para os cartões de resumo
const SummaryCard = memo(({ title, value, icon, avatarBgColor }) => (
  <Box sx={{ flex: "1 1 300px" }}>
    <Card>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Avatar sx={{ bgcolor: avatarBgColor, mr: 2 }}>{icon}</Avatar>
          <Box>
            <Typography color="text.secondary">{title}</Typography>
            <Typography variant="h5" fontWeight="bold">
              {value}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  </Box>
));

function Financeiro() {
  const [transacoes, setTransacoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [filtroPeriodo, setFiltroPeriodo] = useState("tudo");
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [transacoesFiltradas, setTransacoesFiltradas] = useState([]);
  const [novaTransacao, setNovaTransacao] = useState({
    descricao: "",
    valor: "",
    tipo: "despesa",
    data: new Date().toISOString().slice(0, 10),
  });
  const { mostrarNotificacao } = useNotificacao();
  const theme = useTheme();

  const buscarTransacoes = useCallback(async () => {
    try {
      const resposta = await apiClient.get("/api/financeiro/transacoes");
      setTransacoes(resposta.data);
    } catch (erro) {
      mostrarNotificacao(
        "Não foi possível carregar o extrato financeiro.",
        "error"
      );
    } finally {
      setCarregando(false);
    }
  }, [mostrarNotificacao]);

  useEffect(() => {
    setCarregando(true);
    buscarTransacoes();
  }, [buscarTransacoes]);

  useEffect(() => {
    let transacoesTemporarias = [...transacoes];
    if (filtroTipo !== "todos") {
      transacoesTemporarias = transacoesTemporarias.filter(
        (t) => t.tipo === filtroTipo
      );
    }
    if (filtroPeriodo !== "tudo") {
      const hoje = new Date();
      const primeiroDiaDoMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
      const primeiroDiaDoAno = new Date(hoje.getFullYear(), 0, 1);
      if (filtroPeriodo === "mes") {
        transacoesTemporarias = transacoesTemporarias.filter(
          (t) => new Date(t.data) >= primeiroDiaDoMes
        );
      } else if (filtroPeriodo === "ano") {
        transacoesTemporarias = transacoesTemporarias.filter(
          (t) => new Date(t.data) >= primeiroDiaDoAno
        );
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
      const resposta = await apiClient.post(
        "/api/financeiro/transacoes",
        novaTransacao
      );
      setTransacoes((transacoesAtuais) =>
        [resposta.data, ...transacoesAtuais].sort(
          (a, b) => new Date(b.data) - new Date(a.data)
        )
      );
      mostrarNotificacao("Transação salva com sucesso!", "success");
      setMostrarFormulario(false);
      setNovaTransacao({
        descricao: "",
        valor: "",
        tipo: "despesa",
        data: new Date().toISOString().slice(0, 10),
      });
    } catch (erro) {
      mostrarNotificacao(
        erro.response?.data?.mensagem || "Falha ao salvar a transação.",
        "error"
      );
    }
  };

  const totalReceitas = transacoesFiltradas
    .filter((t) => t.tipo === "receita")
    .reduce((acc, t) => acc + parseFloat(t.valor), 0);
  const totalDespesas = transacoesFiltradas
    .filter((t) => t.tipo === "despesa")
    .reduce((acc, t) => acc + parseFloat(t.valor), 0);
  const saldo = totalReceitas - totalDespesas;

  const formatarMoeda = (valor) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor);

  if (carregando) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress color="inherit" />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Painel Financeiro
        </Typography>
        <Typography color="text.secondary">
          Controle as suas receitas, despesas e veja o seu saldo.
        </Typography>
      </Box>

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mb: 4 }}>
        <SummaryCard
          title="Receitas (período)"
          value={formatarMoeda(totalReceitas)}
          icon={<TrendingUpIcon />}
          avatarBgColor="success.main"
        />
        <SummaryCard
          title="Despesas (período)"
          value={formatarMoeda(totalDespesas)}
          icon={<TrendingDownIcon />}
          avatarBgColor="error.main"
        />
        <SummaryCard
          title="Balanço (período)"
          value={formatarMoeda(saldo)}
          icon={<AccountBalanceWalletIcon />}
          avatarBgColor={saldo >= 0 ? "primary.main" : "warning.main"}
        />
      </Box>

      <Paper sx={{ p: { xs: 2, md: 3 }, mb: 4 }}>
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <ButtonGroup>
              <Button
                variant={filtroPeriodo === "mes" ? "contained" : "outlined"}
                onClick={() => setFiltroPeriodo("mes")}
              >
                Este Mês
              </Button>
              <Button
                variant={filtroPeriodo === "ano" ? "contained" : "outlined"}
                onClick={() => setFiltroPeriodo("ano")}
              >
                Este Ano
              </Button>
              <Button
                variant={filtroPeriodo === "tudo" ? "contained" : "outlined"}
                onClick={() => setFiltroPeriodo("tudo")}
              >
                Tudo
              </Button>
            </ButtonGroup>
            <ButtonGroup>
              <Button
                variant={filtroTipo === "todos" ? "contained" : "outlined"}
                onClick={() => setFiltroTipo("todos")}
              >
                Todos
              </Button>
              <Button
                variant={filtroTipo === "receita" ? "contained" : "outlined"}
                onClick={() => setFiltroTipo("receita")}
              >
                Receitas
              </Button>
              <Button
                variant={filtroTipo === "despesa" ? "contained" : "outlined"}
                onClick={() => setFiltroTipo("despesa")}
              >
                Despesas
              </Button>
            </ButtonGroup>
          </Box>
          <Button
            variant="contained"
            onClick={() => setMostrarFormulario(!mostrarFormulario)}
            startIcon={<AddCircleOutlineIcon />}
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            {mostrarFormulario ? "Fechar Formulário" : "Nova Transação"}
          </Button>
        </Box>
        {mostrarFormulario && (
          <Box
            component="form"
            onSubmit={handleFormSubmit}
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              mt: 4,
              borderTop: `1px solid ${theme.palette.divider}`,
              pt: 3,
            }}
          >
            <Typography variant="h6">Adicionar Nova Transação</Typography>
            <TextField
              name="descricao"
              label="Descrição"
              variant="outlined"
              value={novaTransacao.descricao}
              onChange={handleFormChange}
              required
              fullWidth
            />
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
              <TextField
                name="valor"
                label="Valor (R$)"
                type="number"
                variant="outlined"
                inputProps={{ step: "0.01" }}
                value={novaTransacao.valor}
                onChange={handleFormChange}
                required
                sx={{ flex: "1 1 150px" }}
              />
              <TextField
                name="data"
                label="Data"
                type="date"
                variant="outlined"
                value={novaTransacao.data}
                onChange={handleFormChange}
                required
                sx={{ flex: "1 1 150px" }}
                InputLabelProps={{ shrink: true }}
              />
              <FormControl sx={{ flex: "1 1 150px" }}>
                <InputLabel>Tipo</InputLabel>
                <Select
                  name="tipo"
                  value={novaTransacao.tipo}
                  label="Tipo"
                  onChange={handleFormChange}
                >
                  <MenuItem value="despesa">Despesa</MenuItem>
                  <MenuItem value="receita">Receita</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{ alignSelf: "flex-start" }}
            >
              Salvar Transação
            </Button>
          </Box>
        )}
      </Paper>

      <Paper sx={{ p: { xs: 2, md: 3 } }}>
        <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">
          Histórico de Transações
        </Typography>
        <Box>
          {transacoesFiltradas.length > 0 ? (
            transacoesFiltradas.map((t) => (
              <Card
                key={t.id}
                variant="outlined"
                sx={{
                  mb: 1.5,
                  display: "flex",
                  alignItems: "center",
                  p: 2,
                  "&:hover": { borderColor: "primary.main" },
                }}
              >
                <Avatar
                  sx={{
                    bgcolor:
                      t.tipo === "receita" ? "success.light" : "error.light",
                    mr: 2,
                  }}
                >
                  {t.tipo === "receita" ? (
                    <TrendingUpIcon sx={{ color: "success.dark" }} />
                  ) : (
                    <TrendingDownIcon sx={{ color: "error.dark" }} />
                  )}
                </Avatar>
                <Box sx={{ flexGrow: 1, overflow: "hidden" }}>
                  <Typography variant="body1" fontWeight="bold" noWrap>
                    {t.descricao}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {new Date(t.data).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </Typography>
                </Box>
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  sx={{
                    color: t.tipo === "receita" ? "success.main" : "error.main",
                    minWidth: "120px",
                    textAlign: "right",
                  }}
                >
                  {t.tipo === "receita" ? "+" : "-"}{" "}
                  {formatarMoeda(parseFloat(t.valor))}
                </Typography>
              </Card>
            ))
          ) : (
            <Box
              sx={{
                p: { xs: 3, md: 5 },
                textAlign: "center",
                border: `2px dashed ${theme.palette.divider}`,
                borderRadius: 2,
                mt: 3,
              }}
            >
              <AccountBalanceWalletIcon
                sx={{ fontSize: 48, color: "text.secondary", mb: 2 }}
              />
              <Typography variant="h6">Nenhuma transação encontrada</Typography>
              <Typography color="text.secondary">
                Use os filtros ou adicione uma nova transação para começar.
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
}

export default Financeiro;

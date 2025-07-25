import React, { useState, useEffect, useCallback, useContext, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../apiClient';
import { useNotificacao } from '../contextos/NotificationContext';
import { AuthContext } from '../contextos/AuthContext';
import { useUpgradeDialog } from '../contextos/UpgradeDialogContext';
import {
  Box, Button, Typography, CircularProgress, Card, CardContent, Paper,
  TextField, Select, MenuItem, FormControl, InputLabel, Avatar, ButtonGroup,
  useTheme, Tooltip, Table, TableContainer, TableHead, TableRow, TableCell, TableBody, Chip
} from '@mui/material';
import {
  AccountBalanceWallet as AccountBalanceWalletIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AddCircleOutline as AddCircleOutlineIcon,
  Lock as LockIcon
} from '@mui/icons-material';
import Anuncio from '../componentes/Anuncio'; // Importar o componente de anúncio

// Componente para os cartões de resumo
const SummaryCard = memo(({ title, value, icon, avatarBgColor }) => (
  <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 280px" } }}>
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
    descricao: "", valor: "", tipo: "despesa", data: new Date().toISOString().slice(0, 10),
  });
  const { mostrarNotificacao } = useNotificacao();
  const { usuario } = useContext(AuthContext);
  const { abrirDialogoDeUpgrade } = useUpgradeDialog();
  const theme = useTheme();

  const isPadraoOuSuperior = usuario?.plano === 'padrao' || usuario?.plano === 'premium';

  const buscarTransacoes = useCallback(async () => {
    if (!isPadraoOuSuperior) {
        setTransacoes([]); // Garante que a lista de transações fica vazia para o plano Free
        return;
    }
    try {
      const resposta = await apiClient.get("/api/financeiro/transacoes");
      setTransacoes(resposta.data);
    } catch (erro) {
      mostrarNotificacao("Não foi possível carregar o extrato financeiro.", "error");
    }
  }, [mostrarNotificacao, isPadraoOuSuperior]);

  useEffect(() => {
    setCarregando(true);
    buscarTransacoes().finally(() => setCarregando(false));
  }, [buscarTransacoes]);

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
      buscarTransacoes();
      mostrarNotificacao("Transação salva com sucesso!", "success");
      setMostrarFormulario(false);
      setNovaTransacao({ descricao: "", valor: "", tipo: "despesa", data: new Date().toISOString().slice(0, 10) });
    } catch (erro) {
      mostrarNotificacao(erro.response?.data?.mensagem || "Falha ao salvar a transação.", "error");
    }
  };

  const handleNovaTransacaoClick = () => {
    if (!isPadraoOuSuperior) {
        abrirDialogoDeUpgrade('O controlo financeiro é uma funcionalidade do plano Padrão ou superior.');
        return;
    }
    setMostrarFormulario(!mostrarFormulario);
  };

  const totalReceitas = transacoesFiltradas.filter((t) => t.tipo === "receita").reduce((acc, t) => acc + parseFloat(t.valor), 0);
  const totalDespesas = transacoesFiltradas.filter((t) => t.tipo === "despesa").reduce((acc, t) => acc + parseFloat(t.valor), 0);
  const saldo = totalReceitas - totalDespesas;
  const formatarMoeda = (valor) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor || 0);

  if (carregando) {
    return <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}><CircularProgress color="inherit" /></Box>;
  }

  return (
    <Box>
      <Anuncio /> {/* 1. Adicionar o componente de anúncio */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight="bold">Painel Financeiro</Typography>
        <Typography color="text.secondary">Controle as suas receitas, despesas e veja o seu saldo.</Typography>
      </Box>

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 4 }}> 
        <SummaryCard title="Receitas (período)" value={formatarMoeda(totalReceitas)} icon={<TrendingUpIcon />} avatarBgColor="success.main" />
        <SummaryCard title="Despesas (período)" value={formatarMoeda(totalDespesas)} icon={<TrendingDownIcon />} avatarBgColor="error.main" />
        <SummaryCard title="Balanço (período)" value={formatarMoeda(saldo)} icon={<AccountBalanceWalletIcon />} avatarBgColor={saldo >= 0 ? "primary.main" : "warning.main"} />
      </Box>

      <Paper sx={{ p: { xs: 2, md: 3 }, mb: 4 }}>
        <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 2 }}>
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", flexGrow: 1 }}>
            <ButtonGroup variant="outlined" sx={{flexGrow: {xs: 1, sm: 0}}}>
              <Button variant={filtroPeriodo === "mes" ? "contained" : "outlined"} onClick={() => setFiltroPeriodo("mes")}>Este Mês</Button>
              <Button variant={filtroPeriodo === "ano" ? "contained" : "outlined"} onClick={() => setFiltroPeriodo("ano")}>Este Ano</Button>
              <Button variant={filtroPeriodo === "tudo" ? "contained" : "outlined"} onClick={() => setFiltroPeriodo("tudo")}>Tudo</Button>
            </ButtonGroup>
            <ButtonGroup variant="outlined" sx={{flexGrow: {xs: 1, sm: 0}}}>
              <Button variant={filtroTipo === "todos" ? "contained" : "outlined"} onClick={() => setFiltroTipo("todos")}>Todos</Button>
              <Button variant={filtroTipo === "receita" ? "contained" : "outlined"} onClick={() => setFiltroTipo("receita")}>Receitas</Button>
              <Button variant={filtroTipo === "despesa" ? "contained" : "outlined"} onClick={() => setFiltroTipo("despesa")}>Despesas</Button>
            </ButtonGroup>
          </Box>
          <Tooltip title={!isPadraoOuSuperior ? "Disponível no Plano Padrão ou superior" : ""}>
            <span>
                <Button
                    variant="contained"
                    onClick={handleNovaTransacaoClick}
                    startIcon={!isPadraoOuSuperior ? <LockIcon /> : <AddCircleOutlineIcon />}
                    sx={{ width: { xs: "100%", sm: "auto" } }}
                >
                    {mostrarFormulario ? "Fechar Formulário" : "Nova Transação"}
                </Button>
            </span>
          </Tooltip>
        </Box>
        {mostrarFormulario && isPadraoOuSuperior && (
          <Box component="form" onSubmit={handleFormSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 4, borderTop: `1px solid ${theme.palette.divider}`, pt: 3 }}>
            <Typography variant="h6">Adicionar Nova Transação</Typography>
            <TextField name="descricao" label="Descrição" variant="outlined" value={novaTransacao.descricao} onChange={handleFormChange} required fullWidth />
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
              <TextField name="valor" label="Valor (R$)" type="number" variant="outlined" inputProps={{ step: "0.01" }} value={novaTransacao.valor} onChange={handleFormChange} required sx={{ flex: { xs: "1 1 100%", sm: "1 1 150px" } }} />
              <TextField name="data" label="Data" type="date" variant="outlined" value={novaTransacao.data} onChange={handleFormChange} required sx={{ flex: { xs: "1 1 100%", sm: "1 1 150px" } }} InputLabelProps={{ shrink: true }} />
              <FormControl sx={{ flex: { xs: "1 1 100%", sm: "1 1 150px" } }}> 
                <InputLabel>Tipo</InputLabel>
                <Select name="tipo" value={novaTransacao.tipo} label="Tipo" onChange={handleFormChange}>
                  <MenuItem value="despesa">Despesa</MenuItem>
                  <MenuItem value="receita">Receita</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Button type="submit" variant="contained" color="primary" sx={{ alignSelf: "flex-start", width: { xs: "100%", sm: "auto" } }}>
              Salvar Transação
            </Button>
          </Box>
        )}
      </Paper>

      <Paper sx={{ p: { xs: 2, md: 3 }, overflow: 'hidden' }}>
        <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">Histórico de Transações</Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Descrição</TableCell>
                <TableCell>Data</TableCell>
                <TableCell align="right">Valor</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transacoesFiltradas.length > 0 ? (
                transacoesFiltradas.map((t) => (
                  <TableRow key={t.id} hover>
                    <TableCell>
                        <Typography variant="body1" component="div">{t.descricao}</Typography>
                        <Chip label={t.tipo} color={t.tipo === 'receita' ? 'success' : 'error'} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      {new Date(t.data).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell align="right">
                      <Typography fontWeight="bold" color={t.tipo === 'receita' ? 'success.main' : 'error.main'}>
                        {t.tipo === 'receita' ? '+' : '-'} {formatarMoeda(t.valor)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                    <TableCell colSpan={3} align="center" sx={{py: 4}}>
                        <Typography color="text.secondary">
                            {isPadraoOuSuperior ? 'Nenhuma transação encontrada para os filtros selecionados.' : 'Faça o upgrade para o plano Padrão para registar as suas transações.'}
                        </Typography>
                    </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}

export default Financeiro;
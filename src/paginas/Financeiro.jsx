// src/paginas/Financeiro.jsx

import { useState, useEffect } from 'react';
import apiClient from '../api';
import { useNotificacao } from '../contextos/NotificationContext';

import { Box, Button, Container, Typography, CircularProgress, Card, CardContent, Paper, Grid, TextField, Select, MenuItem, FormControl, InputLabel, Avatar, ButtonGroup } from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

function Financeiro() {
  const [transacoes, setTransacoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [filtroPeriodo, setFiltroPeriodo] = useState('tudo');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [transacoesFiltradas, setTransacoesFiltradas] = useState([]);
  const [novaTransacao, setNovaTransacao] = useState({
    descricao: '', valor: '', tipo: 'despesa', data: new Date().toISOString().slice(0, 10),
  });
  const { mostrarNotificacao } = useNotificacao();

  useEffect(() => {
    async function buscarTransacoes() {
      try {
        const resposta = await apiClient.get('/api/financeiro/transacoes');
        setTransacoes(resposta.data);
      } catch (erro) {
        console.error("Erro ao buscar transações:", erro);
        mostrarNotificacao("Não foi possível carregar o extrato financeiro.", "error");
      } finally {
        setCarregando(false);
      }
    }
    buscarTransacoes();
  }, []);

  useEffect(() => {
    let transacoesTemporarias = [...transacoes];
    if (filtroTipo !== 'todos') {
      transacoesTemporarias = transacoesTemporarias.filter(t => t.tipo === filtroTipo);
    }
    if (filtroPeriodo !== 'tudo') {
      const hoje = new Date();
      const primeiroDiaDoMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
      const primeiroDiaDoAno = new Date(hoje.getFullYear(), 0, 1);
      if (filtroPeriodo === 'mes') {
        transacoesTemporarias = transacoesTemporarias.filter(t => new Date(t.data) >= primeiroDiaDoMes);
      } else if (filtroPeriodo === 'ano') {
        transacoesTemporarias = transacoesTemporarias.filter(t => new Date(t.data) >= primeiroDiaDoAno);
      }
    }
    setTransacoesFiltradas(transacoesTemporarias);
  }, [transacoes, filtroPeriodo, filtroTipo]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setNovaTransacao(dadosAtuais => ({ ...dadosAtuais, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const resposta = await apiClient.post('/api/financeiro/transacoes', novaTransacao);
      setTransacoes(transacoesAtuais => [resposta.data, ...transacoesAtuais].sort((a, b) => new Date(b.data) - new Date(a.data)));
      mostrarNotificacao('Transação salva com sucesso!', 'success');
      setMostrarFormulario(false);
      setNovaTransacao({ descricao: '', valor: '', tipo: 'despesa', data: new Date().toISOString().slice(0, 10) });
    } catch (erro) {
      console.error("Erro ao salvar transação:", erro);
      mostrarNotificacao('Falha ao salvar a transação.', 'error');
    }
  };

  const totalReceitas = transacoesFiltradas.filter(t => t.tipo === 'receita').reduce((acc, t) => acc + parseFloat(t.valor), 0);
  const totalDespesas = transacoesFiltradas.filter(t => t.tipo === 'despesa').reduce((acc, t) => acc + parseFloat(t.valor), 0);
  const saldo = totalReceitas - totalDespesas;

  const primaryButtonStyle = {
    borderRadius: 2, bgcolor: "#4000F0", color: 'white', "&:hover": { bgcolor: "#2C00A3" },
  };
  const outlinedButtonStyle = {
    borderRadius: 2, borderColor: '#4000F0', color: '#4000F0'
  };

  if (carregando) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress color="inherit" /></Box>;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={6} sx={{ p: { xs: 2, md: 4 }, borderRadius: 3, mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
          Painel Financeiro
        </Typography>
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}><Paper variant="outlined" sx={{ p: 2, display: 'flex', alignItems: 'center' }}><Avatar sx={{ bgcolor: 'success.light', mr: 2 }}><TrendingUpIcon /></Avatar><Box><Typography color="text.secondary">Receitas (período)</Typography><Typography variant="h5" fontWeight="bold" color="success.main">R$ {totalReceitas.toFixed(2)}</Typography></Box></Paper></Grid>
          <Grid item xs={12} md={4}><Paper variant="outlined" sx={{ p: 2, display: 'flex', alignItems: 'center' }}><Avatar sx={{ bgcolor: 'error.light', mr: 2 }}><TrendingDownIcon /></Avatar><Box><Typography color="text.secondary">Despesas (período)</Typography><Typography variant="h5" fontWeight="bold" color="error.main">R$ {totalDespesas.toFixed(2)}</Typography></Box></Paper></Grid>
          <Grid item xs={12} md={4}><Paper variant="outlined" sx={{ p: 2, display: 'flex', alignItems: 'center' }}><Avatar sx={{ bgcolor: saldo >= 0 ? 'success.light' : 'error.light', mr: 2 }}><AccountBalanceWalletIcon sx={{ color: saldo >= 0 ? 'success.dark' : 'error.dark' }} /></Avatar><Box><Typography color="text.secondary">Balanço (período)</Typography><Typography variant="h5" fontWeight="bold" sx={{ color: saldo >= 0 ? 'success.main' : 'error.main' }}>R$ {saldo.toFixed(2)}</Typography></Box></Paper></Grid>
        </Grid>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} lg={8}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <ButtonGroup size="small"><Button variant={filtroPeriodo === 'mes' ? 'contained' : 'outlined'} sx={filtroPeriodo === 'mes' ? primaryButtonStyle : outlinedButtonStyle} onClick={() => setFiltroPeriodo('mes')}>Este Mês</Button><Button variant={filtroPeriodo === 'ano' ? 'contained' : 'outlined'} sx={filtroPeriodo === 'ano' ? primaryButtonStyle : outlinedButtonStyle} onClick={() => setFiltroPeriodo('ano')}>Este Ano</Button><Button variant={filtroPeriodo === 'tudo' ? 'contained' : 'outlined'} sx={filtroPeriodo === 'tudo' ? primaryButtonStyle : outlinedButtonStyle} onClick={() => setFiltroPeriodo('tudo')}>Tudo</Button></ButtonGroup>
              <ButtonGroup size="small"><Button variant={filtroTipo === 'todos' ? 'contained' : 'outlined'} sx={filtroTipo === 'todos' ? primaryButtonStyle : outlinedButtonStyle} onClick={() => setFiltroTipo('todos')}>Todos</Button><Button variant={filtroTipo === 'receita' ? 'contained' : 'outlined'} sx={filtroTipo === 'receita' ? primaryButtonStyle : outlinedButtonStyle} onClick={() => setFiltroTipo('receita')}>Receitas</Button><Button variant={filtroTipo === 'despesa' ? 'contained' : 'outlined'} sx={filtroTipo === 'despesa' ? primaryButtonStyle : outlinedButtonStyle} onClick={() => setFiltroTipo('despesa')}>Despesas</Button></ButtonGroup>
            </Box>
          </Grid>
          <Grid item xs={12} lg={4} sx={{textAlign: {lg: 'right', xs: 'left'}, mt: {xs: 2, lg: 0}}}>
            <Button variant="contained" onClick={() => setMostrarFormulario(!mostrarFormulario)} startIcon={<AddCircleOutlineIcon/>} sx={{...primaryButtonStyle, width: {xs: '100%', lg: 'auto'}}}>
              {mostrarFormulario ? 'Ocultar Formulário' : 'Nova Transação'}
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {mostrarFormulario && (
        <Paper elevation={6} sx={{ p: 3, mb: 4, borderRadius: 3 }}>
          <Box component="form" onSubmit={handleFormSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h6">Adicionar Transação Manual</Typography>
            <TextField name="descricao" label="Descrição" variant="outlined" value={novaTransacao.descricao} onChange={handleFormChange} required fullWidth />
            <TextField name="valor" label="Valor (R$)" type="number" variant="outlined" inputProps={{ step: "0.01" }} value={novaTransacao.valor} onChange={handleFormChange} required fullWidth />
            <TextField name="data" label="Data" type="date" variant="outlined" value={novaTransacao.data} onChange={handleFormChange} required fullWidth InputLabelProps={{ shrink: true }} />
            <FormControl fullWidth variant="outlined">
              <InputLabel id="tipo-transacao-label">Tipo</InputLabel>
              <Select labelId="tipo-transacao-label" name="tipo" value={novaTransacao.tipo} label="Tipo" onChange={handleFormChange}>
                <MenuItem value="despesa">Despesa</MenuItem>
                <MenuItem value="receita">Receita</MenuItem>
              </Select>
            </FormControl>
            <Button type="submit" variant="contained" sx={primaryButtonStyle}>Salvar Transação</Button>
          </Box>
        </Paper>
      )}

      <Paper elevation={6} sx={{ p: { xs: 2, md: 4 }, borderRadius: 3 }}>
        <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">Histórico de Transações</Typography>
        <Box>
          {transacoesFiltradas.length > 0 ? transacoesFiltradas.map(t => (
            <Card key={t.id} sx={{ mb: 1.5, display: 'flex', alignItems: 'center', p: 2 }} variant="outlined">
              <Avatar sx={{ bgcolor: t.tipo === 'receita' ? 'success.light' : 'error.light', color: t.tipo === 'receita' ? 'success.dark' : 'error.dark', mr: 2 }}>
                {t.tipo === 'receita' ? <TrendingUpIcon /> : <TrendingDownIcon />}
              </Avatar>
              <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
                <Typography variant="body1" fontWeight="bold" noWrap>{t.descricao}</Typography>
                <Typography variant="body2" color="text.secondary">{new Date(t.data).toLocaleDateString('pt-BR')}</Typography>
              </Box>
              <Typography variant="h6" fontWeight="bold" sx={{ color: t.tipo === 'receita' ? 'success.main' : 'error.main', minWidth: '120px', textAlign: 'right' }}>
                {t.tipo === 'receita' ? '+' : '-'} R$ {parseFloat(t.valor).toFixed(2)}
              </Typography>
            </Card>
          )) : <Typography>Nenhuma transação encontrada para os filtros selecionados.</Typography>}
        </Box>
      </Paper>
    </Container>
  );
}

export default Financeiro;
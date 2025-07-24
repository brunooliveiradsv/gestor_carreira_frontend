import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../apiClient';
import { useNotificacao } from '../contextos/NotificationContext';
import { AuthContext } from '../contextos/AuthContext';
import {
  Box, Typography, CircularProgress, Paper, Grid, Button,
  Table, TableContainer, TableHead, TableRow, TableCell, TableBody, Chip, Avatar
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AccountBalanceWallet as AccountBalanceWalletIcon
} from '@mui/icons-material';
import GraficoBalanco from '../componentes/GraficoBalanco';

const formatarMoeda = (valor) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor || 0);

// Componente para exibir quando a funcionalidade está bloqueada
const BlocoUpgrade = () => {
    const navigate = useNavigate();
    return (
        <Paper sx={{ p: 4, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <AccountBalanceWalletIcon sx={{ fontSize: 48, color: 'primary.main' }} />
            <Typography variant="h6" fontWeight="bold">Controlo Financeiro Avançado</Typography>
            <Typography color="text.secondary" sx={{ maxWidth: '500px' }}>
                Registe as suas receitas e despesas, acompanhe o seu balanço mensal e tenha uma visão clara da saúde financeira da sua carreira.
            </Typography>
            <Button 
                variant="contained" 
                onClick={() => navigate('/assinatura')}
                sx={{ mt: 1 }}
            >
                Fazer Upgrade para o Plano Padrão
            </Button>
        </Paper>
    );
};

function Financeiro() {
  const [resumo, setResumo] = useState(null);
  const [transacoes, setTransacoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const { mostrarNotificacao } = useNotificacao();
  const { usuario } = useContext(AuthContext);

  const isPadraoOuSuperior = usuario?.plano === 'padrao' || usuario?.plano === 'premium';

  useEffect(() => {
    async function carregarDados() {
      // Se o utilizador não tiver o plano necessário, não faz as chamadas à API
      if (!isPadraoOuSuperior) {
          setCarregando(false);
          return;
      }
      try {
        const [resumoRes, transacoesRes] = await Promise.all([
          apiClient.get('/api/financeiro/resumo-mensal'),
          apiClient.get('/api/financeiro/transacoes')
        ]);
        setResumo(resumoRes.data);
        setTransacoes(transacoesRes.data);
      } catch (error) {
        mostrarNotificacao('Erro ao carregar dados financeiros.', 'error');
      } finally {
        setCarregando(false);
      }
    }
    carregarDados();
  }, [isPadraoOuSuperior, mostrarNotificacao]);

  if (carregando) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
            <Typography variant="h4" component="h1" fontWeight="bold">Financeiro</Typography>
            <Typography color="text.secondary">A sua central de controlo de receitas e despesas.</Typography>
        </Box>
      </Box>

      {!isPadraoOuSuperior ? (
        <BlocoUpgrade />
      ) : (
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>Balanço do Mês</Typography>
              {resumo ? (
                  <Grid container spacing={3} mt={1}>
                      <Grid item xs={12} sm={4}>
                          <Box sx={{display: 'flex', alignItems: 'center'}}>
                              <Avatar sx={{ bgcolor: 'success.dark', mr: 2 }}><TrendingUpIcon /></Avatar>
                              <Box>
                                  <Typography color="text.secondary" variant="body2">Receitas</Typography>
                                  <Typography variant="h6" fontWeight="bold">{formatarMoeda(resumo.totalReceitas)}</Typography>
                              </Box>
                          </Box>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                          <Box sx={{display: 'flex', alignItems: 'center'}}>
                              <Avatar sx={{ bgcolor: 'error.main', mr: 2 }}><TrendingDownIcon /></Avatar>
                              <Box>
                                  <Typography color="text.secondary" variant="body2">Despesas</Typography>
                                  <Typography variant="h6" fontWeight="bold">{formatarMoeda(resumo.totalDespesas)}</Typography>
                              </Box>
                          </Box>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                          <Box sx={{display: 'flex', alignItems: 'center'}}>
                              <Avatar sx={{ bgcolor: resumo.saldo >= 0 ? 'primary.dark' : 'error.dark', mr: 2 }}><AccountBalanceWalletIcon /></Avatar>
                              <Box>
                                  <Typography color="text.secondary" variant="body2">Saldo</Typography>
                                  <Typography variant="h6" fontWeight="bold" color={resumo.saldo >= 0 ? 'text.primary' : 'error.light'}>{formatarMoeda(resumo.saldo)}</Typography>
                              </Box>
                          </Box>
                      </Grid>
                  </Grid>
              ) : (
                  <Typography color="text.secondary" sx={{pt: 2}}>Não foi possível carregar o resumo financeiro.</Typography>
              )}
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper sx={{ p: 3, height: 400, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" fontWeight="bold">Histórico de Balanço</Typography>
                <Box sx={{flexGrow: 1, mt: 2}}>
                    <GraficoBalanco />
                </Box>
            </Paper>
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Últimas Transações</Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Descrição</TableCell>
                    <TableCell>Tipo</TableCell>
                    <TableCell>Categoria</TableCell>
                    <TableCell>Data</TableCell>
                    <TableCell align="right">Valor</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transacoes.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell>{t.descricao}</TableCell>
                      <TableCell>
                        <Chip label={t.tipo} color={t.tipo === 'receita' ? 'success' : 'error'} size="small" />
                      </TableCell>
                      <TableCell>{t.categoria || '-'}</TableCell>
                      <TableCell>{new Date(t.data).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell align="right" sx={{ color: t.tipo === 'receita' ? 'success.light' : 'error.light' }}>
                        {formatarMoeda(t.valor)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}

export default Financeiro;
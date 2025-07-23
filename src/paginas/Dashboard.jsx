// src/paginas/Dashboard.jsx
import { useState, useEffect, useContext } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import apiClient from '../apiClient';
import { AuthContext } from '../contextos/AuthContext';
import {
  Box, Grid, Typography, Paper, CircularProgress, Button, List,
  ListItem, ListItemText, ListItemIcon, Avatar, Chip, Alert
} from '@mui/material';
import {
  Event as EventIcon,
  AddCircleOutline as AddCircleOutlineIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AccountBalanceWallet as AccountBalanceWalletIcon,
  EmojiEvents as EmojiEventsIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import Anuncio from '../componentes/Anuncio';
import GraficoBalanco from '../componentes/GraficoBalanco';

const formatarMoeda = (valor) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor || 0);

function Dashboard() {
  const [resumo, setResumo] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const { usuario } = useContext(AuthContext);
  const navigate = useNavigate();

  const abrirFormulario = (path) => {
    navigate(path, { state: { abrirFormulario: true } });
  };

  useEffect(() => {
    async function carregarResumo() {
      try {
        const [resumoFinanceiro, proximosCompromissos, ultimasConquistas] = await Promise.all([
          apiClient.get('/api/financeiro/resumo-mensal').catch(() => ({ data: null })),
          apiClient.get('/api/compromissos/proximos').catch(() => ({ data: [] })),
          apiClient.get('/api/conquistas/recentes').catch(() => ({ data: [] }))
        ]);
        
        if (!resumoFinanceiro.data && !proximosCompromissos.data && !ultimasConquistas.data) {
          setErro("Não foi possível carregar os dados do dashboard.");
        }
        
        setResumo({
          financeiro: resumoFinanceiro.data,
          compromissos: proximosCompromissos.data,
          conquistas: ultimasConquistas.data
        });

      } catch (error) {
        console.error("Erro ao carregar dados do dashboard:", error);
        setErro("Ocorreu um erro inesperado ao carregar o dashboard.");
      } finally {
        setCarregando(false);
      }
    }
    carregarResumo();
  }, []);

  if (carregando) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><CircularProgress color="inherit" /></Box>;
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" fontWeight="bold" sx={{ mb: 1 }}>
        Bem-vindo, {usuario?.nome}!
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>
        Aqui está um resumo da sua carreira hoje.
      </Typography>

      <Anuncio />

      {erro && <Alert severity="warning" sx={{ mb: 4 }}>{erro}</Alert>}

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 4 }}>
        
        <Box sx={{ flex: '2 1 65%', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {/* GRÁFICO DE BALANÇO FINANCEIRO */}
          <Paper sx={{ p: {xs: 2, md: 3}, height: 350, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" fontWeight="bold">Balanço dos Últimos Meses</Typography>
            <Box sx={{flexGrow: 1, mt: 2}}>
                <GraficoBalanco />
            </Box>
          </Paper>

          {/* BALANÇO DO MÊS ATUAL */}
          <Paper sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>Balanço do Mês</Typography>
              {resumo?.financeiro ? (
                  <Grid container spacing={3} mt={1}>
                      <Grid item xs={12} sm={4}>
                          <Box sx={{display: 'flex', alignItems: 'center'}}>
                              <Avatar sx={{ bgcolor: 'success.dark', mr: 2 }}><TrendingUpIcon /></Avatar>
                              <Box>
                                  <Typography color="text.secondary" variant="body2">Receitas</Typography>
                                  <Typography variant="h6" fontWeight="bold">{formatarMoeda(resumo.financeiro.totalReceitas)}</Typography>
                              </Box>
                          </Box>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                          <Box sx={{display: 'flex', alignItems: 'center'}}>
                              <Avatar sx={{ bgcolor: 'error.main', mr: 2 }}><TrendingDownIcon /></Avatar>
                              <Box>
                                  <Typography color="text.secondary" variant="body2">Despesas</Typography>
                                  <Typography variant="h6" fontWeight="bold">{formatarMoeda(resumo.financeiro.totalDespesas)}</Typography>
                              </Box>
                          </Box>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                          <Box sx={{display: 'flex', alignItems: 'center'}}>
                              <Avatar sx={{ bgcolor: resumo.financeiro.saldo >= 0 ? 'primary.dark' : 'error.dark', mr: 2 }}><AccountBalanceWalletIcon /></Avatar>
                              <Box>
                                  <Typography color="text.secondary" variant="body2">Saldo</Typography>
                                  <Typography variant="h6" fontWeight="bold" color={resumo.financeiro.saldo >= 0 ? 'text.primary' : 'error.light'}>{formatarMoeda(resumo.financeiro.saldo)}</Typography>
                              </Box>
                          </Box>
                      </Grid>
                  </Grid>
              ) : (
                  <Typography color="text.secondary" sx={{pt: 2}}>Não foi possível carregar o resumo financeiro.</Typography>
              )}
          </Paper>
        </Box>
        
        <Box sx={{ flex: '1 1 35%', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {/* PRÓXIMOS COMPROMISSOS */}
          <Paper sx={{ p: 3, flexGrow: 1 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>Próximos Compromissos</Typography>
            {resumo?.compromissos && resumo.compromissos.length > 0 ? (
              <List dense>
                {resumo.compromissos.map(c => (
                  <ListItem key={c.id} disablePadding sx={{ my: 1 }}>
                    <ListItemIcon sx={{minWidth: 40}}><EventIcon color="primary" /></ListItemIcon>
                    <ListItemText primary={c.nome_evento} secondary={c.local || 'Local a definir'} />
                    <Chip label={new Date(c.data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} size="small" />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography color="text.secondary" sx={{pt: 2}}>Nenhum compromisso agendado.</Typography>
            )}
              <Button component={RouterLink} to="/agenda" endIcon={<ArrowForwardIcon />} sx={{ mt: 2 }}>Ver agenda completa</Button>
          </Paper>

          {/* ÚLTIMAS CONQUISTAS */}
          <Paper sx={{ p: 3, flexGrow: 1 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>Últimas Conquistas</Typography>
                {resumo?.conquistas && resumo.conquistas.length > 0 ? (
                  <List dense>
                      {resumo.conquistas.map(c => (
                      <ListItem key={c.id} disablePadding sx={{ my: 1 }}>
                          <ListItemIcon sx={{minWidth: 40}}><EmojiEventsIcon sx={{color: '#FFD700'}} /></ListItemIcon>
                          <ListItemText primary={c.nome} primaryTypographyProps={{fontWeight: 'medium'}} />
                      </ListItem>
                      ))}
                  </List>
              ) : (
                  <Typography color="text.secondary" sx={{pt: 2}}>Continue a usar o app para desbloquear!</Typography>
              )}
              <Button component={RouterLink} to="/conquistas" endIcon={<ArrowForwardIcon />} sx={{ mt: 2 }}>Ver todas</Button>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}

export default Dashboard;
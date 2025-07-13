// src/paginas/Dashboard.jsx

import { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import apiClient from '../api';
import {
  Box,
  Container,
  Grid,
  Typography,
  Paper,
  CircularProgress,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  useTheme,
  Divider
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

const formatarMoeda = (valor) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);

function Dashboard() {
  const [resumo, setResumo] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const theme = useTheme();

  useEffect(() => {
    async function carregarResumo() {
      try {
        // Busca os dados em paralelo para mais performance
        const [resumoFinanceiro, proximosCompromissos, ultimasConquistas] = await Promise.all([
          apiClient.get('/api/financeiro/resumo-mensal'),
          apiClient.get('/api/compromissos/proximos'),
          apiClient.get('/api/conquistas/recentes')
        ]);
        
        setResumo({
          financeiro: resumoFinanceiro.data,
          compromissos: proximosCompromissos.data,
          conquistas: ultimasConquistas.data
        });

      } catch (error) {
        console.error("Erro ao carregar dados do dashboard:", error);
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
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" fontWeight="bold" sx={{ mb: 4 }}>
        Dashboard
      </Typography>

      <Grid container spacing={4}>
        {/* Coluna da Esquerda */}
        <Grid item xs={12} md={8}>
          {/* Widget de Próximos Compromissos */}
          <Paper elevation={6} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>Próximos Compromissos</Typography>
            {resumo.compromissos.length > 0 ? (
              <List>
                {resumo.compromissos.map(c => (
                  <ListItem key={c.id} secondaryAction={<Chip label={new Date(c.data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} />}>
                    <ListItemIcon><EventIcon color="primary" /></ListItemIcon>
                    <ListItemText primary={c.nome_evento} secondary={c.local || 'Local a definir'} />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography color="text.secondary">Nenhum compromisso agendado.</Typography>
            )}
            <Button component={RouterLink} to="/agenda" endIcon={<ArrowForwardIcon />} sx={{ mt: 2 }}>Ver agenda completa</Button>
          </Paper>

          {/* Widget de Atalhos Rápidos */}
          <Paper elevation={6} sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>Ações Rápidas</Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button variant="contained" component={RouterLink} to="/agenda" state={{abrirFormulario: true}} startIcon={<AddCircleOutlineIcon/>}>Novo Compromisso</Button>
                <Button variant="contained" component={RouterLink} to="/financeiro" state={{abrirFormulario: true}} startIcon={<AddCircleOutlineIcon/>}>Nova Transação</Button>
                <Button variant="contained" component={RouterLink} to="/repertorios" state={{abrirFormulario: true}} startIcon={<AddCircleOutlineIcon/>}>Novo Repertório</Button>
            </Box>
          </Paper>
        </Grid>

        {/* Coluna da Direita */}
        <Grid item xs={12} md={4}>
            {/* Widget Financeiro */}
            <Paper elevation={6} sx={{ p: 3, mb: 4 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>Balanço do Mês</Typography>
                <Box sx={{display: 'flex', alignItems: 'center', my: 2}}>
                    <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}><TrendingUpIcon /></Avatar>
                    <Box>
                        <Typography color="text.secondary">Receitas</Typography>
                        <Typography variant="h6" fontWeight="bold">{formatarMoeda(resumo.financeiro.totalReceitas)}</Typography>
                    </Box>
                </Box>
                 <Box sx={{display: 'flex', alignItems: 'center', my: 2}}>
                    <Avatar sx={{ bgcolor: 'error.main', mr: 2 }}><TrendingDownIcon /></Avatar>
                    <Box>
                        <Typography color="text.secondary">Despesas</Typography>
                        <Typography variant="h6" fontWeight="bold">{formatarMoeda(resumo.financeiro.totalDespesas)}</Typography>
                    </Box>
                </Box>
                <Divider sx={{ my: 1.5 }} />
                 <Box sx={{display: 'flex', alignItems: 'center', mt: 2}}>
                    <Avatar sx={{ bgcolor: resumo.financeiro.saldo >= 0 ? 'primary.dark' : 'error.dark', mr: 2 }}><AccountBalanceWalletIcon /></Avatar>
                    <Box>
                        <Typography color="text.secondary">Saldo Mensal</Typography>
                        <Typography variant="h5" fontWeight="bold" color={resumo.financeiro.saldo >= 0 ? 'primary.light' : 'error.light'}>{formatarMoeda(resumo.financeiro.saldo)}</Typography>
                    </Box>
                </Box>
            </Paper>

             {/* Widget de Conquistas */}
            <Paper elevation={6} sx={{ p: 3, mb: 4 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>Últimas Conquistas</Typography>
                 {resumo.conquistas.length > 0 ? (
                    <List>
                        {resumo.conquistas.map(c => (
                        <ListItem key={c.id} sx={{p: 0}}>
                            <ListItemIcon><EmojiEventsIcon sx={{color: '#FFD700'}} /></ListItemIcon>
                            <ListItemText primary={c.nome} primaryTypographyProps={{fontWeight: 'bold'}} />
                        </ListItem>
                        ))}
                    </List>
                ) : (
                    <Typography color="text.secondary">Continue usando o app para desbloquear!</Typography>
                )}
                 <Button component={RouterLink} to="/conquistas" endIcon={<ArrowForwardIcon />} sx={{ mt: 2 }}>Ver todas</Button>
            </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Dashboard;
// src/paginas/Assinatura.jsx
import React, { useContext, useState } from 'react';
import { AuthContext } from '../contextos/AuthContext';
import { useNotificacao } from '../contextos/NotificationContext';
import apiClient from '../api';
import { Box, Typography, Paper, Grid, Button, CircularProgress, Chip, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { CheckCircle as CheckCircleIcon, WorkspacePremium as WorkspacePremiumIcon } from '@mui/icons-material';

// Componente para exibir cada plano
const PlanoCard = ({ title, price, description, features, planType, currentPlan, statusAssinatura, onStartTrial, loading }) => (
  <Paper
    variant="outlined"
    sx={{
      p: 3,
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      borderColor: currentPlan === planType && statusAssinatura !== 'inativa' ? 'primary.main' : 'divider',
      borderWidth: 2
    }}
  >
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h5" component="h2" fontWeight="bold">{title}</Typography>
      <Typography variant="h4" component="p" fontWeight="bold" sx={{ my: 1 }}>
        {price} <Typography variant="body1" component="span" color="text.secondary">/mês</Typography>
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ minHeight: 40 }}>{description}</Typography>
      <List sx={{ my: 2 }}>
        {features.map((feature, index) => (
          <ListItem key={index} disableGutters>
            <ListItemIcon sx={{ minWidth: 32 }}><CheckCircleIcon color="success" fontSize="small" /></ListItemIcon>
            <ListItemText primary={feature} />
          </ListItem>
        ))}
      </List>
    </Box>
    {currentPlan === planType && statusAssinatura !== 'inativa' ? (
        <Chip label="Seu Plano Atual" color="primary" sx={{ mt: 2 }} />
    ) : (
      planType === 'premium' && statusAssinatura === 'inativa' && (
        <Button
          variant="contained"
          fullWidth
          sx={{ mt: 2 }}
          onClick={onStartTrial}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Iniciar 7 dias grátis'}
        </Button>
      )
    )}
  </Paper>
);


function Assinatura() {
  const { usuario, setUsuario } = useContext(AuthContext);
  const { mostrarNotificacao } = useNotificacao();
  const [carregando, setCarregando] = useState(false);

  const handleIniciarTeste = async () => {
    setCarregando(true);
    try {
      const resposta = await apiClient.post('/api/assinatura/iniciar-teste');
      setUsuario(resposta.data.usuario);
      mostrarNotificacao(resposta.data.mensagem, 'success');
    } catch (error) {
      mostrarNotificacao(error.response?.data?.mensagem || 'Falha ao iniciar o período de teste.', 'error');
    } finally {
      setCarregando(false);
    }
  };

  const isTrialActive = usuario?.status_assinatura === 'teste';
  const trialEndDate = isTrialActive ? new Date(usuario.teste_termina_em).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }) : null;

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight="bold">Assinatura</Typography>
        <Typography color="text.secondary">Escolha o plano que melhor se adapta à sua carreira.</Typography>
      </Box>

      {isTrialActive && (
        <Paper sx={{ p: 2, mb: 4, bgcolor: 'primary.dark', color: 'white' }}>
            <Typography>
                Você está a usufruir de um período de teste do plano Premium! Aproveite todos os recursos até **{trialEndDate}**.
            </Typography>
        </Paper>
      )}

      <Grid container spacing={4} alignItems="stretch">
        <Grid item xs={12} md={6}>
          <PlanoCard
            title="Plano Padrão"
            price="R$ 19,90"
            description="Todas as ferramentas essenciais para a sua gestão, com exibição de anúncios."
            features={['Agenda Completa', 'Controlo Financeiro', 'Gestão de Repertório', 'Suporte por E-mail']}
            planType="padrao"
            currentPlan={usuario?.plano}
            statusAssinatura={usuario?.status_assinatura}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <PlanoCard
            title="Plano Premium"
            price="R$ 29,90"
            description="A experiência completa do VOXGest, sem interrupções e com recursos avançados."
            features={['Todos os recursos do Padrão', 'Experiência sem Anúncios', 'Sugestão de Músicas (Em breve)', 'Suporte Prioritário']}
            planType="premium"
            currentPlan={usuario?.plano}
            statusAssinatura={usuario?.status_assinatura}
            onStartTrial={handleIniciarTeste}
            loading={carregando}
          />
        </Grid>
      </Grid>
    </Box>
  );
}

export default Assinatura;
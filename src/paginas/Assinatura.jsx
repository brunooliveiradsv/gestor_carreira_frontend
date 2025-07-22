// src/paginas/Assinatura.jsx
import React, { useContext, useState } from 'react';
import { AuthContext } from '../contextos/AuthContext';
import { useNotificacao } from '../contextos/NotificationContext';
import apiClient from '../apiClient';
import { 
    Box, Typography, Paper, Grid, Button, CircularProgress, Chip, List, ListItem, 
    ListItemIcon, ListItemText, ToggleButton, ToggleButtonGroup 
} from '@mui/material';
import { CheckCircle as CheckCircleIcon, WorkspacePremium as WorkspacePremiumIcon } from '@mui/icons-material';

const PlanoCard = ({ title, price, description, features, planType, currentPlan, statusAssinatura, onSubscribe, loading, billingPeriod }) => (
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
        {price} 
        <Typography variant="body1" component="span" color="text.secondary">
            /{billingPeriod === 'mensal' ? 'mês' : 'ano'}
        </Typography>
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
    <Box sx={{ mt: 2 }}>
      {currentPlan === planType && statusAssinatura !== 'inativa' ? (
        <Chip label="Seu Plano Atual" color="primary" sx={{ width: '100%' }} />
      ) : (
        <Button variant="contained" fullWidth onClick={() => onSubscribe(planType)} disabled={loading || statusAssinatura === 'ativa'}>
          {loading ? <CircularProgress size={24} color="inherit" /> : `Assinar ${title}`}
        </Button>
      )}
    </Box>
  </Paper>
);


function Assinatura() {
  const { usuario } = useContext(AuthContext);
  const { mostrarNotificacao } = useNotificacao();
  const [carregando, setCarregando] = useState(false);
  const [periodo, setPeriodo] = useState('mensal'); // Estado para controlar a seleção Mensal/Anual

  // Mapeamento completo dos preços
  const planos = {
    padrao: {
      nome: 'Padrão',
      precoMensal: 'R$ 9,90',
      precoAnual: 'R$ 99,90',
      priceIdMensal: 'price_1Rn7pw4CZGU00gKswDH0Hbxo', // <-- SUBSTITUA
      priceIdAnual: 'price_1Rn8HE4CZGU00gKsTNWcCZ4d', // <-- SUBSTITUA
      descricao: 'Todas as ferramentas essenciais para a sua gestão, com exibição de anúncios.',
      features: ['Agenda Completa', 'Controlo Financeiro', 'Gestão de Repertório', 'Suporte por E-mail']
    },
    premium: {
      nome: 'Premium',
      precoMensal: 'R$ 14,90',
      precoAnual: 'R$ 149,90',
      priceIdMensal: 'price_1Rn7qv4CZGU00gKsQXm5OTkf', // <-- SUBSTITUA
      priceIdAnual: 'price_1Rn8Hu4CZGU00gKsIi8RCuKe', // <-- SUBSTITUA
      descricao: 'A experiência completa do VOXGest, sem interrupções e com recursos avançados.',
      features: ['Todos os recursos do Padrão', 'Experiência sem Anúncios', 'Sugestão de Músicas (Em breve)', 'Suporte Prioritário']
    }
  };

  const handlePeriodoChange = (event, novoPeriodo) => {
    if (novoPeriodo !== null) {
      setPeriodo(novoPeriodo);
    }
  };

  const handleSubscribe = async (planoEscolhido) => {
    setCarregando(true);
    try {
      const priceId = periodo === 'mensal' 
        ? planos[planoEscolhido].priceIdMensal 
        : planos[planoEscolhido].priceIdAnual;

      const resposta = await apiClient.post('/api/assinatura/criar-sessao-checkout', {
        planoId: priceId,
      });
      window.location.href = resposta.data.url;
    } catch (error) {
      mostrarNotificacao(error.response?.data?.mensagem || 'Falha ao iniciar o processo de pagamento.', 'error');
      setCarregando(false);
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" fontWeight="bold">Assinatura</Typography>
        <Typography color="text.secondary">Escolha o plano que melhor se adapta à sua carreira.</Typography>
        
        <ToggleButtonGroup
          color="primary"
          value={periodo}
          exclusive
          onChange={handlePeriodoChange}
          aria-label="Período de cobrança"
          sx={{ mt: 3 }}
        >
          <ToggleButton value="mensal">Mensal</ToggleButton>
          <ToggleButton value="anual">Anual</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Grid container spacing={4} alignItems="stretch" justifyContent="center">
        {Object.keys(planos).map(key => {
            const plano = planos[key];
            return (
                <Grid item xs={12} md={5} key={key}>
                    <PlanoCard
                        title={plano.nome}
                        price={periodo === 'mensal' ? plano.precoMensal : plano.precoAnual}
                        description={plano.descricao}
                        features={plano.features}
                        planType={key}
                        currentPlan={usuario?.plano}
                        statusAssinatura={usuario?.status_assinatura}
                        onSubscribe={handleSubscribe}
                        loading={carregando}
                        billingPeriod={periodo}
                    />
                </Grid>
            )
        })}
      </Grid>
    </Box>
  );
}

export default Assinatura;
import React, { useContext, useState } from 'react';
import { AuthContext } from '../contextos/AuthContext';
import { useNotificacao } from '../contextos/NotificationContext';
import apiClient from '../apiClient';
import {
  Box, Typography, Paper, Grid, Button, CircularProgress, Chip, List, ListItem,
  ListItemIcon, ListItemText, ToggleButton, ToggleButtonGroup
} from '@mui/material';
import { CheckCircle as CheckCircleIcon, Block as BlockIcon } from '@mui/icons-material';

const PlanoCard = ({ title, price, description, features, planType, isCurrentPlan, onSubscribe, loading, billingPeriod, isFree = false }) => (
  <Paper
    variant="outlined"
    sx={{
      p: 3,
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      borderColor: isCurrentPlan ? 'primary.main' : 'divider',
      borderWidth: 2,
      opacity: isCurrentPlan && !isFree ? 0.7 : 1,
    }}
  >
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h5" component="h2" fontWeight="bold">{title}</Typography>
      {!isFree && (
        <Typography variant="h4" component="p" fontWeight="bold" sx={{ my: 1 }}>
          {price}
          <Typography variant="body1" component="span" color="text.secondary">
            /{billingPeriod === 'mensal' ? 'mês' : 'ano'}
          </Typography>
        </Typography>
      )}
      <Typography variant="body2" color="text.secondary" sx={{ minHeight: 40 }}>{description}</Typography>
      <List sx={{ my: 2 }}>
        {features.map((feature, index) => (
          <ListItem key={index} disableGutters>
            <ListItemIcon sx={{ minWidth: 32 }}>
              <CheckCircleIcon color={isFree ? "disabled" : "success"} fontSize="small" />
            </ListItemIcon>
            <ListItemText primary={feature} />
          </ListItem>
        ))}
      </List>
    </Box>
    <Box sx={{ mt: 2 }}>
      {isCurrentPlan ? (
        <Chip label="Seu Plano Atual" color="primary" sx={{ width: '100%' }} />
      ) : !isFree && (
        <Button variant="contained" fullWidth onClick={() => onSubscribe(planType)} disabled={loading}>
          {loading ? <CircularProgress size={24} color="inherit" /> : `Fazer Upgrade`}
        </Button>
      )}
    </Box>
  </Paper>
);

function Assinatura() {
  const { usuario } = useContext(AuthContext);
  const { mostrarNotificacao } = useNotificacao();
  const [carregando, setCarregando] = useState(false);
  const [periodo, setPeriodo] = useState('mensal');

  const planos = {
    free: {
        nome: 'Free',
        descricao: 'O essencial para começar a organizar sua carreira.',
        features: ['Gestão de Agenda', 'Gestão de Contatos', 'Até 2 Setlists', 'Funcionalidades com anúncios']
    },
    padrao: {
      nome: 'Padrão',
      precoMensal: 'R$ 9,90',
      precoAnual: 'R$ 99,90',
      priceIdMensal: import.meta.env.VITE_STRIPE_PRICE_ID_PADRAO_MENSAL,
      priceIdAnual: import.meta.env.VITE_STRIPE_PRICE_ID_PADRAO_ANUAL,
      descricao: 'Mais ferramentas para gerir repertórios e finanças, com menos anúncios.',
      features: ['Tudo do plano Free', 'Setlists Ilimitados', 'Controlo Financeiro Completo', 'Módulo de Equipamentos']
    },
    premium: {
      nome: 'Premium',
      precoMensal: 'R$ 14,90',
      precoAnual: 'R$ 149,90',
      priceIdMensal: import.meta.env.VITE_STRIPE_PRICE_ID_PREMIUM_MENSAL,
      priceIdAnual: import.meta.env.VITE_STRIPE_PRICE_ID_PREMIUM_ANUAL,
      descricao: 'A experiência completa do VOXGest, sem interrupções e com recursos avançados.',
      features: ['Tudo do plano Padrão', 'Experiência sem Anúncios', 'Página Showcase (Mural)', 'Modo Palco para Setlists']
    }
  };

  const handlePeriodoChange = (event, novoPeriodo) => {
    if (novoPeriodo !== null) setPeriodo(novoPeriodo);
  };

  const handleSubscribe = async (planoEscolhido) => {
    setCarregando(true);
    try {
      const priceId = periodo === 'mensal' 
        ? planos[planoEscolhido].priceIdMensal 
        : planos[planoEscolhido].priceIdAnual;

      const resposta = await apiClient.post('/api/assinatura/criar-sessao-checkout', { planoId: priceId });
      window.location.href = resposta.data.url;
    } catch (error) {
      mostrarNotificacao(error.response?.data?.mensagem || 'Falha ao iniciar o pagamento.', 'error');
      setCarregando(false);
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" fontWeight="bold">Nossos Planos</Typography>
        <Typography color="text.secondary">Evolua sua carreira com as ferramentas certas.</Typography>
        <ToggleButtonGroup color="primary" value={periodo} exclusive onChange={handlePeriodoChange} sx={{ mt: 3 }}>
          <ToggleButton value="mensal">Mensal</ToggleButton>
          <ToggleButton value="anual">Anual (2 meses grátis)</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Grid container spacing={4} alignItems="stretch" justifyContent="center">
        {Object.keys(planos).map(key => {
            const plano = planos[key];
            return (
                <Grid item xs={12} md={4} key={key}>
                    <PlanoCard
                        title={plano.nome}
                        price={plano.precoMensal ? (periodo === 'mensal' ? plano.precoMensal : plano.precoAnual) : 'Grátis'}
                        description={plano.descricao}
                        features={plano.features}
                        planType={key}
                        isCurrentPlan={usuario?.plano === key}
                        onSubscribe={handleSubscribe}
                        loading={carregando}
                        billingPeriod={periodo}
                        isFree={key === 'free'}
                    />
                </Grid>
            )
        })}
      </Grid>
    </Box>
  );
}

export default Assinatura;
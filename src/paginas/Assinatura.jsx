import React, { useContext, useState } from 'react';
import { AuthContext } from '../contextos/AuthContext';
import { useNotificacao } from '../contextos/NotificationContext';
import apiClient from '../apiClient';
import {
  Box, Typography, Paper, Button, CircularProgress, Chip, List, ListItem,
  ListItemIcon, ListItemText, ToggleButton, ToggleButtonGroup
} from '@mui/material';
import { CheckCircle as CheckCircleIcon, Block as BlockIcon } from '@mui/icons-material';

const PlanoCard = ({ title, price, description, features, planType, isCurrentPlan, onSubscribe, loading, billingPeriod, isFree = false }) => (
  <Paper
    variant="outlined"
    sx={{
      p: 3,
      flex: '1 1 300px', // Flexbox: permite crescer, base de 300px
      minWidth: '280px',
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
          <ListItem key={index} disableGutters sx={{py: 0.5}}>
            <ListItemIcon sx={{ minWidth: 32 }}>
              {feature.included ? 
                <CheckCircleIcon color="success" fontSize="small" /> : 
                <BlockIcon color="disabled" fontSize="small" />
              }
            </ListItemIcon>
            <ListItemText primary={feature.text} />
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

  // Informações dos planos atualizadas e corretas
  const planos = {
    free: {
        nome: 'Free',
        descricao: 'O essencial para começar a organizar sua carreira.',
        features: [
            { text: 'Limite de 1 Setlist, Contato e Equipamento', included: true },
            { text: 'Apenas importar músicas (sem criação/edição)', included: true },
            { text: 'Com anúncios', included: true },
            { text: 'Sem partilha de Setlist', included: false },
            { text: 'Sem gerador de Contrato', included: false },
            { text: 'Sem Página Pública (Showcase)', included: false },
            { text: 'Sem Modo Palco', included: false },
        ]
    },
    padrao: {
      nome: 'Padrão',
      precoMensal: 'R$ 9,90',
      precoAnual: 'R$ 99,90',
      priceIdMensal: import.meta.env.VITE_STRIPE_PRICE_ID_PADRAO_MENSAL,
      priceIdAnual: import.meta.env.VITE_STRIPE_PRICE_ID_PADRAO_ANUAL,
      descricao: 'Mais ferramentas para gerir repertórios e finanças, sem anúncios.',
      features: [
          { text: 'Limite de 5 Setlists, Contatos e Equipamentos', included: true },
          { text: 'Criar, editar e sugerir músicas', included: true },
          { text: 'Partilha de Setlist', included: true },
          { text: 'Experiência sem anúncios', included: true },
          { text: 'Sem gerador de Contrato', included: false },
          { text: 'Sem Página Pública (Showcase)', included: false },
          { text: 'Sem Modo Palco', included: false },
      ]
    },
    premium: {
      nome: 'Premium',
      precoMensal: 'R$ 14,90',
      precoAnual: 'R$ 149,90',
      priceIdMensal: import.meta.env.VITE_STRIPE_PRICE_ID_PREMIUM_MENSAL,
      priceIdAnual: import.meta.env.VITE_STRIPE_PRICE_ID_PREMIUM_ANUAL,
      descricao: 'A experiência completa do VOXGest, com recursos ilimitados.',
      features: [
          { text: 'Tudo ilimitado (Setlists, Contatos, etc.)', included: true },
          { text: 'Página Pública (Showcase)', included: true },
          { text: 'Gerador de Contrato', included: true },
          { text: 'Modo Palco para Setlists', included: true },
          { text: 'Acesso a todas as funcionalidades', included: true },
      ]
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

      {/* Container principal com Flexbox */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'stretch', justifyContent: 'center' }}>
        {Object.keys(planos).map(key => {
            const plano = planos[key];
            return (
                <PlanoCard
                    key={key}
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
            )
        })}
      </Box>
    </Box>
  );
}

export default Assinatura;
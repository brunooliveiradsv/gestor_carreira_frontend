import React, { useEffect } from 'react';
import { Box, Typography } from '@mui/material';

function Assinatura() {
  // Carrega o script da tabela de preços do Stripe quando o componente é montado
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/pricing-table.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Limpa o script quando o componente é desmontado para evitar duplicados
      document.body.removeChild(script);
    };
  }, []);

  // Obtém as chaves do seu ficheiro .env
  const pricingTableId = import.meta.env.VITE_STRIPE_PRICING_TABLE_ID;
  const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

  return (
    <Box>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" fontWeight="bold">Nossos Planos</Typography>
        <Typography color="text.secondary">Evolua sua carreira com as ferramentas certas.</Typography>
      </Box>

      {pricingTableId && publishableKey ? (
        // O componente do Stripe é renderizado aqui.
        // Ele precisa ser chamado como um componente React normal.
        React.createElement('stripe-pricing-table', {
          'pricing-table-id': pricingTableId,
          'publishable-key': publishableKey,
        })
      ) : (
        <Typography color="error" textAlign="center">
          A tabela de preços não pôde ser carregada. Verifique as configurações.
        </Typography>
      )}
    </Box>
  );
}

export default Assinatura;
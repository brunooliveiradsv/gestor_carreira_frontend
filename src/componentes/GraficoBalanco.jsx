// src/componentes/GraficoBalanco.jsx
import React from 'react';
import useApi from '../hooks/useApi';
import {
  Box, Typography, Paper, CircularProgress, useTheme
} from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

// Formata os valores do eixo Y (ex: 1000 -> R$ 1k)
const formatarEixoY = (valor) => {
    if (valor >= 1000) {
        return `R$ ${valor / 1000}k`;
    }
    return `R$ ${valor}`;
};

function GraficoBalanco() {
  const { data: dadosGrafico, carregando, erro } = useApi('/api/financeiro/balanco-mensal');
  const theme = useTheme();

  if (carregando) {
    return <CircularProgress />;
  }
  if (erro) {
    return <Typography color="error">Não foi possível carregar o gráfico.</Typography>;
  }
  if (!dadosGrafico || dadosGrafico.length === 0) {
      return <Typography color="text.secondary">Ainda não há dados suficientes para exibir o gráfico.</Typography>
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={dadosGrafico}
        margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
        <XAxis dataKey="mes" tick={{ fill: theme.palette.text.secondary, fontSize: 12 }} />
        <YAxis tickFormatter={formatarEixoY} tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}/>
        <Tooltip
            contentStyle={{
                backgroundColor: theme.palette.background.paper,
                borderColor: theme.palette.divider
            }}
            formatter={(value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)}
        />
        <Legend />
        <Bar dataKey="receitas" fill={theme.palette.success.main} name="Receitas" />
        <Bar dataKey="despesas" fill={theme.palette.error.main} name="Despesas" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export default GraficoBalanco;
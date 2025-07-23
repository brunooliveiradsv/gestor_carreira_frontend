// src/componentes/EnqueteShowcase.jsx
import React, { useState, useEffect } from 'react';
import apiClient from '../apiClient';
import { useNotificacao } from '../contextos/NotificationContext';
import { Box, Typography, Paper, Button, LinearProgress, useTheme } from '@mui/material';

function EnqueteShowcase({ enquete }) {
  const [votado, setVotado] = useState(null); // Guarda o ID da opção votada
  const [opcoes, setOpcoes] = useState(enquete.opcoes || []);
  const { mostrarNotificacao } = useNotificacao();
  const theme = useTheme();

  // Verifica no localStorage se o utilizador já votou nesta enquete
  useEffect(() => {
    const votoGuardado = localStorage.getItem(`voto_enquete_${enquete.id}`);
    if (votoGuardado) {
      setVotado(parseInt(votoGuardado, 10));
    }
  }, [enquete.id]);

  const handleVotar = async (idOpcao) => {
    if (votado) return; // Não permite votar novamente

    // Atualização otimista da UI para uma melhor experiência
    setVotado(idOpcao);
    setOpcoes(opcoesAtuais =>
      opcoesAtuais.map(opt =>
        opt.id === idOpcao ? { ...opt, votos: opt.votos + 1 } : opt
      )
    );
    localStorage.setItem(`voto_enquete_${enquete.id}`, idOpcao);

    try {
      await apiClient.post(`/api/vitrine/enquetes/votar/${idOpcao}`);
      mostrarNotificacao('O seu voto foi registado. Obrigado!', 'success');
    } catch (error) {
      mostrarNotificacao('Ocorreu um erro ao registar o seu voto.', 'error');
      // Reverte a UI em caso de erro
      localStorage.removeItem(`voto_enquete_${enquete.id}`);
      setVotado(null);
      setOpcoes(enquete.opcoes);
    }
  };

  const totalVotos = opcoes.reduce((acc, opt) => acc + opt.votos, 0);

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">
        {enquete.pergunta}
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 2 }}>
        {opcoes.map(opcao => {
          const percentagem = totalVotos > 0 ? (opcao.votos / totalVotos) * 100 : 0;
          const isVotadoNesta = votado === opcao.id;

          return (
            <Box key={opcao.id}>
              {votado ? (
                // --- VISTA DOS RESULTADOS (APÓS VOTAR) ---
                <>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography fontWeight={isVotadoNesta ? 'bold' : 'normal'}>
                      {opcao.texto_opcao}
                    </Typography>
                    <Typography color="text.secondary">
                      {percentagem.toFixed(0)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={percentagem}
                    color={isVotadoNesta ? 'primary' : 'inherit'}
                    sx={{ height: 8, borderRadius: 2 }}
                  />
                </>
              ) : (
                // --- VISTA DE VOTAÇÃO ---
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => handleVotar(opcao.id)}
                >
                  {opcao.texto_opcao}
                </Button>
              )}
            </Box>
          );
        })}
      </Box>
    </Paper>
  );
}

export default EnqueteShowcase;
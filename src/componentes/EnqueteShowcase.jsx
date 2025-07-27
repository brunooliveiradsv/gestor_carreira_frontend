// src/componentes/EnqueteShowcase.jsx
import React, { useState, useEffect } from 'react';
import apiClient from '../apiClient';
import { useNotificacao } from '../contextos/NotificationContext';
import { useFanAuth } from '../contextos/FanAuthContext'; // 1. Importar o hook de autenticação de fã
import { Box, Typography, Paper, Button, LinearProgress } from '@mui/material';

function EnqueteShowcase({ enquete }) {
  const [votado, setVotado] = useState(null);
  const [opcoes, setOpcoes] = useState(enquete.opcoes || []);
  const { mostrarNotificacao } = useNotificacao();
  const { fa } = useFanAuth(); // 2. Obter o estado do fã logado

  useEffect(() => {
    // Agora, a verificação no localStorage também depende do ID do fã
    if (fa) {
      const votoGuardado = localStorage.getItem(`voto_enquete_${enquete.id}_fa_${fa.id}`);
      if (votoGuardado) {
        setVotado(parseInt(votoGuardado, 10));
      }
    } else {
        // Se o fã não estiver logado, garante que o estado "votado" seja limpo
        setVotado(null);
    }
  }, [enquete.id, fa]);

  const handleVotar = async (idOpcao) => {
    // 3. Adicionar verificação de login
    if (!fa) {
        mostrarNotificacao('Faça o login como fã para poder votar na enquete!', 'info');
        return;
    }
    if (votado) return; // Não permite votar novamente

    setVotado(idOpcao);
    setOpcoes(opcoesAtuais =>
      opcoesAtuais.map(opt =>
        opt.id === idOpcao ? { ...opt, votos: opt.votos + 1 } : opt
      )
    );
    // Guarda o voto associado ao ID do fã
    localStorage.setItem(`voto_enquete_${enquete.id}_fa_${fa.id}`, idOpcao);

    try {
      // IMPORTANTE: A chamada à API agora está autenticada com o token do fã
      // (graças à configuração no FanAuthContext)
      await apiClient.post(`/api/vitrine/enquetes/votar/${idOpcao}`);
      mostrarNotificacao('O seu voto foi registado. Obrigado!', 'success');
    } catch (error) {
      mostrarNotificacao(error.response?.data?.mensagem || 'Ocorreu um erro ao registar o seu voto.', 'error');
      // Reverte a UI em caso de erro
      localStorage.removeItem(`voto_enquete_${enquete.id}_fa_${fa.id}`);
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
        {!fa && !votado && (
            <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', mt: 1}}>
                Faça o login com Google para votar.
            </Typography>
        )}
      </Box>
    </Paper>
  );
}

export default EnqueteShowcase;
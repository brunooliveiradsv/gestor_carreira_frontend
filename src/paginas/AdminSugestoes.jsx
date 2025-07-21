// src/paginas/AdminSugestoes.jsx
import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../api';
import { useNotificacao } from '../contextos/NotificationContext';
import {
  Box, Typography, Button, CircularProgress, Paper, List, ListItem,
  ListItemText, IconButton, Tooltip, Divider, Chip
} from '@mui/material';
import { CheckCircle as ApproveIcon, Cancel as RejectIcon, ArrowForward as ArrowIcon } from '@mui/icons-material';

function AdminSugestoes() {
  const [sugestoes, setSugestoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const { mostrarNotificacao } = useNotificacao();

  const buscarSugestoes = useCallback(async () => {
    try {
      setCarregando(true);
      const resposta = await apiClient.get('/api/admin/sugestoes');
      setSugestoes(resposta.data);
    } catch (error) {
      mostrarNotificacao('Erro ao carregar as sugestões.', 'error');
    } finally {
      setCarregando(false);
    }
  }, [mostrarNotificacao]);

  useEffect(() => {
    buscarSugestoes();
  }, [buscarSugestoes]);

  const handleAprovar = async (sugestaoId) => {
    try {
      await apiClient.put(`/api/admin/sugestoes/${sugestaoId}/aprovar`);
      mostrarNotificacao('Sugestão aprovada e música atualizada!', 'success');
      buscarSugestoes();
    } catch (error) {
      mostrarNotificacao('Falha ao aprovar a sugestão.', 'error');
    }
  };

  const handleRejeitar = async (sugestaoId) => {
    try {
      await apiClient.put(`/api/admin/sugestoes/${sugestaoId}/rejeitar`);
      mostrarNotificacao('Sugestão rejeitada.', 'success');
      buscarSugestoes();
    } catch (error) {
      mostrarNotificacao('Falha ao rejeitar a sugestão.', 'error');
    }
  };

  if (carregando) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Moderação de Sugestões
        </Typography>
        <Typography color="text.secondary">
          Aprove ou rejeite as melhorias sugeridas pelos usuários.
        </Typography>
      </Box>

      <Paper>
        <List>
          {sugestoes.length === 0 && (
            <Typography sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
              Nenhuma sugestão pendente no momento.
            </Typography>
          )}
          {sugestoes.map((sugestao, index) => {
            const valorAntigo = sugestao.musica[sugestao.campo_sugerido] || '(vazio)';
            
            return (
              <React.Fragment key={sugestao.id}>
                <ListItem
                  sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}
                  secondaryAction={
                    <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
                      <Tooltip title="Aprovar Sugestão">
                        <IconButton color="success" onClick={() => handleAprovar(sugestao.id)}>
                          <ApproveIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Rejeitar Sugestão">
                        <IconButton color="error" onClick={() => handleRejeitar(sugestao.id)}>
                          <RejectIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  }
                >
                  <ListItemText
                    sx={{ width: '100%', mb: 2 }}
                    primary={`Sugestão para: ${sugestao.musica.nome} - ${sugestao.musica.artista}`}
                    secondary={
                      <>
                        <Typography component="div" variant="body2">
                          <strong>Campo:</strong>&nbsp;<Chip label={sugestao.campo_sugerido} size="small" />
                        </Typography>
                        <Typography component="div" variant="caption" color="text.secondary">
                          Sugerido por: {sugestao.autor.nome} ({sugestao.autor.email})
                        </Typography>
                      </>
                    }
                  />

                  {/* --- LAYOUT DE COMPARAÇÃO CORRIGIDO --- */}
                  <Box sx={{ display: 'flex', width: '100%', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
                      {/* Valor Antigo */}
                      <Box sx={{ flex: 1 }}>
                          <Typography variant="overline" color="text.secondary">Valor Antigo</Typography>
                          <Paper variant="outlined" sx={{ p: 1.5, maxHeight: 150, overflowY: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                              {valorAntigo}
                          </Paper>
                      </Box>
                      {/* Valor Sugerido */}
                      <Box sx={{ flex: 1 }}>
                          <Typography variant="overline" color="primary.main">Valor Sugerido</Typography>
                          <Paper variant="outlined" sx={{ p: 1.5, maxHeight: 150, overflowY: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: 'monospace', fontSize: '0.8rem', borderColor: 'primary.main' }}>
                              {sugestao.valor_sugerido}
                          </Paper>
                      </Box>
                  </Box>
                </ListItem>
                {index < sugestoes.length - 1 && <Divider />}
              </React.Fragment>
            )
          })}
        </List>
      </Paper>
    </Box>
  );
}

export default AdminSugestoes;
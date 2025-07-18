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
            // Pega o valor antigo diretamente do objeto da música
            const valorAntigo = sugestao.musica[sugestao.campo_sugerido] || '(vazio)';
            
            return (
              <React.Fragment key={sugestao.id}>
                <ListItem
                  secondaryAction={
                    <Box>
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
                    primary={`Sugestão para: ${sugestao.musica.nome} - ${sugestao.musica.artista}`}
                    secondary={
                      <>
                        <Typography component="div" variant="body2" sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                          <strong>Campo:</strong>&nbsp;<Chip label={sugestao.campo_sugerido} size="small" />
                        </Typography>
                        <Typography component="div" variant="body2" sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', mt: 1 }}>
                          <Chip label={valorAntigo} size="small" variant="outlined" title="Valor Antigo" />
                          <ArrowIcon sx={{ mx: 1 }} />
                          <Chip label={sugestao.valor_sugerido} size="small" variant="outlined" color="primary" title="Novo Valor" />
                        </Typography>
                        <Typography component="div" variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                          Sugerido por: {sugestao.autor.nome} ({sugestao.autor.email})
                        </Typography>
                      </>
                    }
                  />
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
// src/paginas/AdminLogs.jsx
import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../api';
import { useNotificacao } from '../contextos/NotificationContext';
import {
  Box, Typography, CircularProgress, Paper, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Chip
} from '@mui/material';

// --- NOVO COMPONENTE AUXILIAR ---
// Pequeno componente para formatar os detalhes do log de forma mais legível
const DetalhesLog = ({ details }) => {
    if (!details || Object.keys(details).length === 0) {
        return '-';
    }
    return (
        <Box>
            {Object.entries(details).map(([key, value]) => (
                <Chip key={key} label={`${key}: ${value}`} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
            ))}
        </Box>
    );
};


function AdminLogs() {
  const [logs, setLogs] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const { mostrarNotificacao } = useNotificacao();

  const buscarLogs = useCallback(async () => {
    try {
      setCarregando(true);
      const resposta = await apiClient.get('/api/admin/logs');
      setLogs(resposta.data);
    } catch (error) {
      mostrarNotificacao('Erro ao carregar os logs de atividade.', 'error');
    } finally {
      setCarregando(false);
    }
  }, [mostrarNotificacao]);

  useEffect(() => {
    buscarLogs();
  }, [buscarLogs]);

  if (carregando) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Log de Atividades dos Usuários
        </Typography>
        <Typography color="text.secondary">
          As 100 ações mais recentes realizadas na plataforma.
        </Typography>
      </Box>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="tabela de logs">
          <TableHead>
            <TableRow>
              <TableCell sx={{width: '25%'}}>Usuário</TableCell>
              <TableCell sx={{width: '20%'}}>Ação</TableCell>
              <TableCell>Detalhes</TableCell>
              <TableCell sx={{width: '20%'}} align="right">Data</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell component="th" scope="row">
                  <Typography variant="body2" fontWeight="bold">{log.user.nome}</Typography>
                  <Typography variant="caption" color="text.secondary">{log.user.email}</Typography>
                </TableCell>
                <TableCell>
                    <Chip label={log.action_type} size="small" />
                </TableCell>
                <TableCell>
                    {/* --- CORREÇÃO AQUI (Detalhes) --- */}
                    <DetalhesLog details={log.details} />
                </TableCell>
                <TableCell align="right">
                    {/* --- CORREÇÃO AQUI (Data) --- */}
                    {/* Verifica se a data é válida antes de formatar */}
                    {log.created_at ? new Date(log.created_at).toLocaleString('pt-BR', {
                        day: '2-digit', month: '2-digit', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                    }) : '-'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default AdminLogs;
// src/paginas/AdminLogs.jsx
import React, { useState, useEffect, useMemo } from 'react';
import apiClient from '../apiClient';
import { useNotificacao } from '../contextos/NotificationContext';
import {
  Box, Typography, CircularProgress, Paper, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Chip,
  TextField, InputAdornment, Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import { Search as SearchIcon, History as HistoryIcon } from '@mui/icons-material';

// Função auxiliar para formatar o tempo relativo
const formatarTempoRelativo = (dataString) => {
    const data = new Date(dataString);
    const agora = new Date();
    const segundos = Math.round((agora - data) / 1000);

    const minutos = Math.round(segundos / 60);
    if (minutos < 60) return `há ${minutos} min`;

    const horas = Math.round(minutos / 60);
    if (horas < 24) return `há ${horas}h`;

    const dias = Math.round(horas / 24);
    return `há ${dias}d`;
};

const DetalhesLog = ({ details }) => {
    if (!details || Object.keys(details).length === 0) return '-';
    return (
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            {Object.entries(details).map(([key, value]) => (
                <Chip key={key} label={`${key}: ${value}`} size="small" />
            ))}
        </Box>
    );
};

function AdminLogs() {
  const [logs, setLogs] = useState([]);
  const [utilizadores, setUtilizadores] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [filtros, setFiltros] = useState({ utilizadorId: '', acao: '' });
  const { mostrarNotificacao } = useNotificacao();

  useEffect(() => {
    const buscarDados = async () => {
      try {
        const [respostaLogs, respostaUtilizadores] = await Promise.all([
          apiClient.get('/api/admin/logs'),
          apiClient.get('/api/admin/usuarios')
        ]);
        setLogs(respostaLogs.data);
        setUtilizadores(respostaUtilizadores.data);
      } catch (error) {
        mostrarNotificacao('Erro ao carregar os dados da página.', 'error');
      } finally {
        setCarregando(false);
      }
    };
    buscarDados();
  }, [mostrarNotificacao]);

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({ ...prev, [name]: value }));
  };

  const logsFiltrados = useMemo(() => {
    return logs.filter(log => {
      const correspondeUtilizador = !filtros.utilizadorId || log.user.id === filtros.utilizadorId;
      const correspondeAcao = !filtros.acao || log.action_type.toLowerCase().includes(filtros.acao.toLowerCase());
      return correspondeUtilizador && correspondeAcao;
    });
  }, [logs, filtros]);

  if (carregando) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Log de Atividades
        </Typography>
        <Typography color="text.secondary">
          Monitore as ações recentes realizadas na plataforma.
        </Typography>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Filtrar por Utilizador</InputLabel>
              <Select
                name="utilizadorId"
                value={filtros.utilizadorId}
                label="Filtrar por Utilizador"
                onChange={handleFiltroChange}
              >
                <MenuItem value=""><em>Todos os Utilizadores</em></MenuItem>
                {utilizadores.map(u => (
                  <MenuItem key={u.id} value={u.id}>{u.nome} ({u.email})</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              name="acao"
              label="Filtrar por Ação"
              placeholder="Ex: LOGIN, CREATE_SETLIST..."
              value={filtros.acao}
              onChange={handleFiltroChange}
              InputProps={{
                startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>),
              }}
            />
          </Grid>
        </Grid>
      </Paper>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{width: '25%'}}>Utilizador</TableCell>
              <TableCell sx={{width: '20%'}}>Ação</TableCell>
              <TableCell>Detalhes</TableCell>
              <TableCell sx={{width: '15%'}} align="right">Quando</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logsFiltrados.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 5 }}>
                  <HistoryIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                  <Typography color="text.secondary">Nenhum log encontrado com os filtros atuais.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              logsFiltrados.map((log) => (
                <TableRow key={log.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell component="th" scope="row">
                    <Typography variant="body2" fontWeight="bold">{log.user.nome}</Typography>
                    <Typography variant="caption" color="text.secondary">{log.user.email}</Typography>
                  </TableCell>
                  <TableCell>
                      <Chip label={log.action_type} size="small" />
                  </TableCell>
                  <TableCell>
                      <DetalhesLog details={log.details} />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title={new Date(log.created_at).toLocaleString('pt-BR')}>
                        <Typography variant="body2" color="text.secondary">
                            {formatarTempoRelativo(log.created_at)}
                        </Typography>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default AdminLogs;
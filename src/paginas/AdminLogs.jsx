// src/paginas/AdminLogs.jsx
import React, { useState, useEffect, useMemo } from 'react';
import apiClient from '../apiClient';
import { useNotificacao } from '../contextos/NotificationContext';
import {
  Box, Typography, CircularProgress, Paper, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Chip,
  TextField, InputAdornment, Select, MenuItem, FormControl, InputLabel, Grid, Tooltip,
  useTheme, useMediaQuery, List, Divider, Avatar
} from '@mui/material';
import { Search as SearchIcon, History as HistoryIcon, Person as PersonIcon } from '@mui/icons-material';

const formatarDetalhesLog = (log) => {
    const { action_type, details } = log;
    if (!details) return '-';

    switch (action_type) {
        case 'USER_REGISTER': return 'Novo utilizador registado na plataforma.';
        case 'USER_LOGIN': return 'Utilizador autenticado com sucesso.';
        case 'PASSWORD_RECOVERY': return 'Iniciou o processo de recuperação de senha.';
        case 'UPDATE_PROFILE_NAME': return `Alterou o nome para "${details.new_name}".`;
        case 'UPDATE_PROFILE_EMAIL': return `Alterou o e-mail para "${details.new_email}".`;
        case 'UPDATE_PASSWORD': return 'Alterou a sua senha de acesso.';
        case 'UPDATE_PROFILE_PICTURE': return 'Atualizou a foto de perfil.';
        case 'UPDATE_COVER_PICTURES': return 'Atualizou as fotos de capa da vitrine.';
        case 'UPDATE_PUBLIC_PROFILE': return `Atualizou a vitrine. Campos afetados: ${details.changes.join(', ')}.`;
        case 'CREATE_SETLIST': return `Criou o setlist: "${details.setlistName}" (ID: ${details.setlistId}).`;
        case 'UPDATE_SETLIST_DETAILS': return `Atualizou os detalhes do setlist #${details.setlistId}.`;
        case 'DELETE_SETLIST': return `Apagou o setlist #${details.setlistId}.`;
        case 'UPDATE_SETLIST_MUSICS': return `Atualizou ${details.musicCount} músicas no setlist #${details.setlistId}.`;
        default:
            const detailsString = JSON.stringify(details);
            return detailsString === '{}' ? '-' : detailsString;
    }
};

const formatarTempoRelativo = (dataString) => {
    const data = new Date(dataString);
    const agora = new Date();
    const segundos = Math.round((agora - data) / 1000);

    if (segundos < 60) return 'agora mesmo';
    const minutos = Math.round(segundos / 60);
    if (minutos < 60) return `há ${minutos} min`;

    const horas = Math.round(minutos / 60);
    if (horas < 24) return `há ${horas}h`;

    const dias = Math.round(horas / 24);
    return `há ${dias}d`;
};

function AdminLogs() {
  const [logs, setLogs] = useState([]);
  const [utilizadores, setUtilizadores] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [filtros, setFiltros] = useState({ utilizadorId: '', acao: '' });
  const { mostrarNotificacao } = useNotificacao();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    const buscarDados = async () => {
      try {
        setCarregando(true);
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
      if (!log.user) return false;
      const correspondeUtilizador = !filtros.utilizadorId || log.user.id === filtros.utilizadorId;
      const correspondeAcao = !filtros.acao || log.action_type.toLowerCase().includes(filtros.acao.toLowerCase());
      return correspondeUtilizador && correspondeAcao;
    });
  }, [logs, filtros]);

  if (carregando) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }

  const renderDesktopView = () => (
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
          {logsFiltrados.map((log) => (
            <TableRow key={log.id} hover>
              <TableCell>
                <Typography variant="body2" fontWeight="bold">{log.user.nome}</Typography>
                <Typography variant="caption" color="text.secondary">{log.user.email}</Typography>
              </TableCell>
              <TableCell><Chip label={log.action_type} size="small" /></TableCell>
              <TableCell>
                <Typography variant="body2">{formatarDetalhesLog(log)}</Typography>
              </TableCell>
              <TableCell align="right">
                <Tooltip title={new Date(log.created_at).toLocaleString('pt-BR')}>
                    <Typography variant="body2" color="text.secondary">
                        {formatarTempoRelativo(log.created_at)}
                    </Typography>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderMobileView = () => (
    <List sx={{ p: 0 }}>
      {logsFiltrados.map(log => (
        <Paper key={log.id} sx={{ mb: 2, p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
            <Avatar sx={{ bgcolor: 'primary.main', mr: 1.5 }}><PersonIcon /></Avatar>
            <Box>
                <Typography variant="body1" fontWeight="bold">{log.user.nome}</Typography>
                <Typography variant="caption" color="text.secondary">{new Date(log.created_at).toLocaleString('pt-BR')}</Typography>
            </Box>
          </Box>
          <Divider sx={{ mb: 1.5 }} />
          <Chip label={log.action_type} size="small" sx={{ mb: 1 }} />
          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{formatarDetalhesLog(log)}</Typography>
        </Paper>
      ))}
    </List>
  );

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight="bold">Log de Atividades</Typography>
        <Typography color="text.secondary">Monitore as ações recentes na plataforma.</Typography>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
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
            <Grid item xs={12} md={6}>
                <TextField
                fullWidth
                name="acao"
                label="Filtrar por Ação"
                placeholder="Ex: LOGIN, UPDATE_PASSWORD..."
                value={filtros.acao}
                onChange={handleFiltroChange}
                InputProps={{
                    startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>),
                }}
                />
            </Grid>
        </Grid>
      </Paper>

      {logsFiltrados.length === 0 ? (
        <Paper sx={{ py: 5, textAlign: 'center' }}>
          <HistoryIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
          <Typography color="text.secondary">Nenhum log encontrado com os filtros atuais.</Typography>
        </Paper>
      ) : (
        isMobile ? renderMobileView() : renderDesktopView()
      )}
    </Box>
  );
}

export default AdminLogs;
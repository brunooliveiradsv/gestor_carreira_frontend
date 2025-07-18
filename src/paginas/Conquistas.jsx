// src/paginas/Conquistas.jsx
import { useState, useEffect, useCallback } from 'react';
import apiClient from '../api';
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Avatar,
  Tooltip,
  Alert,
  LinearProgress,
  Chip,
  Grid,
  useTheme // <-- Importação adicionada
} from '@mui/material';
import {
  MilitaryTech as MilitaryTechIcon,
  MusicNote as MusicNoteIcon,
  AttachMoney as AttachMoneyIcon,
  People as PeopleIcon,
  WorkspacePremium as WorkspacePremiumIcon
} from '@mui/icons-material';

const formatarMoeda = (valor) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor || 0);
};

function Conquistas() {
  const [conquistas, setConquistas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const theme = useTheme(); // <-- Hook instanciado aqui

  const getConquistaIcon = (tipo) => {
    if (tipo.includes('SHOWS')) return <MusicNoteIcon />;
    if (tipo.includes('RECEITA')) return <AttachMoneyIcon />;
    if (tipo.includes('CONTATO')) return <PeopleIcon />;
    return <MilitaryTechIcon />;
  };

  const buscarEProcessarConquistas = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const resposta = await apiClient.get('/api/conquistas');
      const conquistasOrdenadas = resposta.data.sort((a, b) => b.desbloqueada - a.desbloqueada);
      setConquistas(conquistasOrdenadas);
    } catch (error) {
      console.error("Erro ao buscar conquistas:", error);
      setErro("Não foi possível carregar as conquistas.");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    buscarEProcessarConquistas();
  }, [buscarEProcessarConquistas]);

  if (carregando) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress color="inherit" /></Box>;
  }

  return (
    <Box>
       <Box sx={{ mb: 4 }}>
            <Typography variant="h4" component="h1" fontWeight="bold">Minhas Conquistas</Typography>
            <Typography color="text.secondary">Acompanhe seu progresso e marcos na carreira.</Typography>
        </Box>

      {erro && <Alert severity="error" sx={{ mb: 4 }}>{erro}</Alert>}

      {conquistas.length === 0 && !carregando ? (
         <Paper variant="outlined" sx={{p: 4, textAlign: 'center'}}>
            <WorkspacePremiumIcon sx={{fontSize: 48, color: 'text.secondary', mb: 2}} />
            <Typography variant="h6">Nenhuma conquista por aqui ainda.</Typography>
            <Typography color="text.secondary">Continue usando o VoxGest para desbloquear novas medalhas!</Typography>
          </Paper>
      ) : (
        <Grid container spacing={3}>
          {conquistas.map(conquista => (
            <Grid item xs={12} sm={6} md={4} key={conquista.id}>
                <Paper
                variant="outlined"
                sx={{
                    p: 2.5,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    opacity: conquista.desbloqueada ? 1 : 0.6,
                    borderWidth: conquista.desbloqueada ? '2px' : '1px',
                    borderColor: conquista.desbloqueada ? 'secondary.main' : 'divider',
                    boxShadow: conquista.desbloqueada ? `0px 0px 15px ${theme.palette.secondary.dark}55` : 'none',
                    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                     '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: conquista.desbloqueada ? `0px 4px 20px ${theme.palette.secondary.dark}77` : 'none',
                    },
                }}
                >
                <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2}}>
                        <Avatar
                            sx={{
                                width: 56,
                                height: 56,
                                bgcolor: conquista.desbloqueada ? 'secondary.main' : 'action.disabledBackground',
                                color: conquista.desbloqueada ? 'white' : 'text.disabled',
                            }}
                        >
                            {getConquistaIcon(conquista.tipo_condicao)}
                        </Avatar>
                        <Typography variant="h6" component="div" fontWeight="bold">
                            {conquista.nome}
                        </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                    {conquista.descricao}
                    </Typography>
                </Box>

                <Box sx={{ width: '100%', mt: 2.5 }}>
                    {conquista.desbloqueada ? (
                         <Tooltip title={`Desbloqueado em: ${new Date(conquista.data_desbloqueio).toLocaleDateString('pt-BR')}`}>
                            <Chip
                                label="Desbloqueada"
                                color="secondary"
                                variant="filled"
                                size="small"
                                sx={{ fontWeight: 'bold' }}
                            />
                        </Tooltip>
                    ) : conquista.tipo_progresso !== 'binario' ? (
                        <>
                            <LinearProgress
                                variant="determinate"
                                value={conquista.porcentagem_progresso}
                                sx={{ height: 8, borderRadius: 4 }}
                                color="secondary"
                            />
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block', textAlign: 'right' }}>
                            {conquista.tipo_progresso === 'monetario'
                                ? `${formatarMoeda(conquista.progresso_atual)} / ${formatarMoeda(conquista.progresso_total)}`
                                : `${conquista.progresso_atual} / ${conquista.progresso_total}`}
                            </Typography>
                        </>
                    ) : (
                        <Chip label="Pendente" size="small" variant="outlined" />
                    )}
                </Box>
                </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}

export default Conquistas;
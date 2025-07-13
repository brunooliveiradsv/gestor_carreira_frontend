// src/paginas/Conquistas.jsx
import { useState, useEffect, useCallback } from 'react';
import apiClient from '../api';
import { 
  Box, 
  Container, 
  Typography, 
  CircularProgress, 
  Card, 
  CardContent, 
  Paper, 
  Avatar, 
  Tooltip, 
  Alert,
  LinearProgress, 
  Chip 
} from '@mui/material';
import { 
  MilitaryTech as MilitaryTechIcon, 
  MusicNote as MusicNoteIcon, 
  AttachMoney as AttachMoneyIcon, 
  People as PeopleIcon 
} from '@mui/icons-material';

const formatarMoeda = (valor) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(valor);
};

function Conquistas() {
  const [conquistas, setConquistas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  const getConquistaIcon = (tipo) => {
    if (tipo.includes('SHOWS')) return <MusicNoteIcon fontSize="large" />;
    if (tipo.includes('RECEITA')) return <AttachMoneyIcon fontSize="large" />;
    if (tipo.includes('CONTATO')) return <PeopleIcon fontSize="large" />;
    return <MilitaryTechIcon fontSize="large" />;
  };

  const buscarEProcessarConquistas = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const resposta = await apiClient.get('/api/conquistas');
      setConquistas(resposta.data); 
    } catch (error) {
      console.error("Erro ao buscar conquistas:", error);
      setErro("Não foi possível carregar as conquistas. Por favor, tente novamente mais tarde.");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    buscarEProcessarConquistas();
  }, [buscarEProcessarConquistas]);

  if (carregando) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
        <CircularProgress color="inherit" size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>Carregando conquistas...</Typography>
      </Box>
    );
  }

  if (erro) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mt: 4, mb: 2 }}>
          {erro}
        </Alert>
        <Typography variant="body1" align="center" color="text.secondary">
            Por favor, verifique sua conexão ou tente novamente mais tarde.
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
      <Paper elevation={6} sx={{ p: { xs: 2, sm: 3, md: 4 }, borderRadius: 3, mb: 4 }}>
        <Typography 
          variant="h4" 
          component="h1" 
          fontWeight="bold" 
          gutterBottom 
          align="center"
          sx={{ mb: { xs: 3, md: 4 } }}
        >
          Minhas Conquistas
        </Typography>
        {conquistas.length === 0 && (
          <Typography variant="h6" color="text.secondary" align="center" sx={{ mt: 4, py: 4 }}>
            Nenhuma conquista encontrada ainda. Continue usando o app para desbloqueá-las!
          </Typography>
        )}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, md: 3 } }}>
          {conquistas.map(conquista => (
            <Card 
              key={conquista.id}
              variant="outlined" 
              sx={{ 
                display: 'flex',
                alignItems: 'center',
                p: { xs: 1.5, sm: 2 },
                opacity: conquista.desbloqueada ? 1 : 0.7,
                borderColor: conquista.desbloqueada ? 'gold' : 'rgba(0, 0, 0, 0.2)', 
                boxShadow: conquista.desbloqueada ? '0px 0px 8px rgba(255, 215, 0, 0.3)' : 'none',
                transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out, opacity 0.3s ease-in-out',
                '&:hover': {
                  transform: conquista.desbloqueada ? 'translateY(-3px) scale(1.005)' : 'none',
                  boxShadow: conquista.desbloqueada ? '0px 6px 15px rgba(255, 215, 0, 0.5)' : 'none',
                },
                borderRadius: 2,
              }}
            >
              <Avatar 
                sx={{ 
                  width: { xs: 56, sm: 64 }, 
                  height: { xs: 56, sm: 64 },
                  mr: { xs: 2, sm: 3 },
                  flexShrink: 0,
                  bgcolor: conquista.desbloqueada ? 'gold' : 'grey.300',
                  color: conquista.desbloqueada ? 'black' : 'grey.600',
                  border: conquista.desbloqueada ? '2px solid rgba(255, 215, 0, 0.8)' : 'none',
                  boxShadow: conquista.desbloqueada ? '0px 0px 10px rgba(255, 215, 0, 0.4)' : 'none'
                }}
              >
                {getConquistaIcon(conquista.tipo_condicao)}
              </Avatar>
              <CardContent sx={{ flexGrow: 1, p: 0, '&:last-child': { pb: 0 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5, flexWrap: 'wrap', gap: 1 }}>
                  <Typography variant="h6" component="div" fontWeight="bold">
                    {conquista.nome}
                  </Typography>
                  {conquista.desbloqueada && (
                    <Tooltip title={`Desbloqueado em: ${new Date(conquista.data_desbloqueio).toLocaleDateString('pt-BR')}`}>
                      <Chip 
                        label="DESBLOQUEADA" 
                        color="success" 
                        size="small" 
                        sx={{ fontWeight: 'bold', bgcolor: 'gold', color: 'black' }}
                      />
                    </Tooltip>
                  )}
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {conquista.descricao}
                </Typography>
                
                {!conquista.desbloqueada && conquista.tipo_progresso !== 'binario' && (
                  <Box sx={{ width: '100%', mt: 1 }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={conquista.porcentagem_progresso} 
                      sx={{ height: 8, borderRadius: 4 }} 
                      color="primary"
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                      Progresso: 
                      {conquista.tipo_progresso === 'monetario' 
                        ? `${formatarMoeda(conquista.progresso_atual)} / ${formatarMoeda(conquista.progresso_total)}`
                        : `${conquista.progresso_atual} / ${conquista.progresso_total}`} 
                      &nbsp;({conquista.porcentagem_progresso.toFixed(0)}%)
                    </Typography>
                  </Box>
                )}
                {!conquista.desbloqueada && conquista.tipo_progresso === 'binario' && (
                  <Typography variant="caption" color="text.disabled" sx={{mt: 1, display: 'block'}}>
                    Aguardando ação para desbloquear
                  </Typography>
                )}
              </CardContent>
            </Card>
          ))}
        </Box>
      </Paper>
    </Container>
  );
}

export default Conquistas;
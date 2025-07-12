// src/paginas/Conquistas.jsx
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
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

/**
 * Formata um valor numérico como moeda brasileira (BRL).
 * Usado para exibir valores de progresso monetário.
 * @param {number} valor - O valor a ser formatado.
 * @returns {string} O valor formatado como BRL.
 */
const formatarMoeda = (valor) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0, // Não mostra centavos se for zero
    maximumFractionDigits: 2, // Mostra até 2 casas decimais
  }).format(valor);
};

/**
 * Componente para exibir a página de Conquistas em formato de lista.
 * Agora, busca todos os dados processados diretamente de uma única API do backend,
 * incluindo status de desbloqueio, data de desbloqueio, progresso atual e tipo de progresso.
 */
function Conquistas() {
  const [conquistas, setConquistas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  /**
   * Mapeia o tipo de condição da conquista para um ícone Material-UI.
   * Os ícones são exibidos em tamanho 'large'.
   * @param {string} tipo - O tipo de condição da conquista (ex: 'SHOWS', 'RECEITA', 'CONTATO').
   * @returns {JSX.Element} O ícone Material-UI correspondente.
   */
  const getConquistaIcon = (tipo) => {
    if (tipo.includes('SHOWS')) return <MusicNoteIcon fontSize="large" />;
    if (tipo.includes('RECEITA')) return <AttachMoneyIcon fontSize="large" />;
    if (tipo.includes('CONTATO')) return <PeopleIcon fontSize="large" />;
    return <MilitaryTechIcon fontSize="large" />;
  };

  /**
   * Função assíncrona para buscar e processar os dados das conquistas.
   * Utiliza useCallback para memorizar a função e evitar recriação desnecessária.
   * Agora, faz apenas uma requisição para a API do backend que já retorna os dados consolidados.
   */
  const buscarEProcessarConquistas = useCallback(async () => {
    setCarregando(true);
    setErro(null); // Limpa qualquer erro anterior
    try {
      // Faz uma única requisição para a nova API que já retorna todas as conquistas
      // com status de desbloqueio, data e progresso do usuário.
      const resposta = await apiClient.get('/api/conquistas');
      
      // Os dados já vêm do backend completamente processados e ordenados
      setConquistas(resposta.data); 
    } catch (error) {
      console.error("Erro ao buscar conquistas:", error);
      setErro("Não foi possível carregar as conquistas. Por favor, tente novamente mais tarde.");
    } finally {
      setCarregando(false);
    }
  }, []); // Dependências vazias, pois a função não depende de props ou estados externos

  // useEffect para chamar a função de busca quando o componente for montado
  useEffect(() => {
    buscarEProcessarConquistas();
  }, [buscarEProcessarConquistas]); // Adicionado buscarEProcessarConquistas como dependência para useCallback

  // Exibição de estado de carregamento
  if (carregando) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
        <CircularProgress color="inherit" size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>Carregando conquistas...</Typography>
      </Box>
    );
  }

  // Exibição de estado de erro
  if (erro) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}> {/* Container menor para a mensagem de erro */}
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
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}> {/* Limitado a 'md' para o layout de lista */}
      <Paper elevation={6} sx={{ p: { xs: 2, sm: 3, md: 4 }, borderRadius: 3, mb: 4 }}>
        <Typography 
          variant="h4" 
          component="h1" 
          fontWeight="bold" 
          gutterBottom 
          align="center" // Centraliza o título
          sx={{ mb: { xs: 3, md: 4 } }} // Mais espaçamento abaixo do título
        >
          Minhas Conquistas
        </Typography>
        {/* Mensagem caso não haja conquistas */}
        {conquistas.length === 0 && (
          <Typography variant="h6" color="text.secondary" align="center" sx={{ mt: 4, py: 4 }}>
            Nenhuma conquista encontrada ainda. Continue jogando para desbloqueá-las!
          </Typography>
        )}
        {/* Contêiner para os itens da lista de conquistas */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, md: 3 } }}> {/* Layout de lista com espaçamento */}
          {conquistas.map(conquista => (
            <Card 
              key={conquista.id}
              variant="outlined" 
              sx={{ 
                display: 'flex', // Faz o card ser um flex container
                alignItems: 'center', // Alinha itens ao centro verticalmente
                p: { xs: 1.5, sm: 2 }, // Padding interno responsivo
                opacity: conquista.desbloqueada ? 1 : 0.7, // Opacidade ligeiramente menor para não desbloqueados
                borderColor: conquista.desbloqueada ? 'gold' : 'rgba(0, 0, 0, 0.2)', 
                boxShadow: conquista.desbloqueada ? '0px 0px 8px rgba(255, 215, 0, 0.3)' : 'none',
                transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out, opacity 0.3s ease-in-out',
                '&:hover': {
                  transform: conquista.desbloqueada ? 'translateY(-3px) scale(1.005)' : 'none', // Efeito de elevação sutil
                  boxShadow: conquista.desbloqueada ? '0px 6px 15px rgba(255, 215, 0, 0.5)' : 'none',
                },
                borderRadius: 2, // Bordas um pouco arredondadas
              }}
            >
              {/* Avatar com o ícone da conquista */}
              <Avatar 
                sx={{ 
                  width: 64, height: 64, mr: { xs: 2, sm: 3 }, // Margem direita para espaçamento
                  flexShrink: 0, // Garante que o avatar não diminua de tamanho
                  bgcolor: conquista.desbloqueada ? 'gold' : 'grey.300', // Cor de fundo do avatar
                  color: conquista.desbloqueada ? 'black' : 'grey.600', // Cor do ícone
                  border: conquista.desbloqueada ? '2px solid rgba(255, 215, 0, 0.8)' : 'none', // Borda dourada
                  boxShadow: conquista.desbloqueada ? '0px 0px 10px rgba(255, 215, 0, 0.4)' : 'none'
                }}
              >
                {getConquistaIcon(conquista.tipo_condicao)}
              </Avatar>
              {/* Conteúdo principal do card da conquista */}
              <CardContent sx={{ flexGrow: 1, p: 0, '&:last-child': { pb: 0 } }}> {/* Remove padding padrão do CardContent */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                  <Typography variant="h6" component="div" fontWeight="bold" sx={{ mr: 1 }}>
                    {conquista.nome}
                  </Typography>
                  {/* Chip para conquistas desbloqueadas */}
                  {conquista.desbloqueada && (
                    <Tooltip title={`Desbloqueado em: ${new Date(conquista.data_desbloqueio).toLocaleDateString('pt-BR')}`}>
                      <Chip 
                        label="DESBLOQUEADA" 
                        color="success" 
                        size="small" 
                        sx={{ fontWeight: 'bold', bgcolor: 'gold', color: 'black' }} // Chip dourado e texto preto
                      />
                    </Tooltip>
                  )}
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {conquista.descricao}
                </Typography>
                
                {/* Lógica de exibição da barra de progresso e texto de progresso */}
                {/* Exibe se NÃO estiver desbloqueada E NÃO for um tipo de progresso binário */}
                {!conquista.desbloqueada && conquista.tipo_progresso !== 'binario' && (
                  <Box sx={{ width: '100%', mt: 1 }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={conquista.porcentagem_progresso} 
                      sx={{ height: 8, borderRadius: 4 }} 
                      color="primary" // Cor da barra de progresso (do tema MUI)
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                      Progresso: 
                      {/* Formata o progresso com base no tipo (monetário ou quantidade) */}
                      {conquista.tipo_progresso === 'monetario' 
                        ? `${formatarMoeda(conquista.progresso_atual)} / ${formatarMoeda(conquista.progresso_total)}`
                        : `${conquista.progresso_atual} / ${conquista.progresso_total}`} 
                      &nbsp;({conquista.porcentagem_progresso.toFixed(0)}%)
                    </Typography>
                  </Box>
                )}
                {/* Texto para conquistas binárias não desbloqueadas */}
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
// src/paginas/Equipamentos.jsx
import { useState, useEffect } from 'react';
import apiClient from '../apiClient';
import { useNotificacao } from '../contextos/NotificationContext';
import {
    Box, Button, Typography, CircularProgress, Card,
    CardContent, CardActions, IconButton, Paper, Tooltip,
    // Grid removido, pois usaremos Flexbox
    useTheme, Avatar, Dialog, DialogContent,
    DialogTitle, DialogActions, DialogContentText // Importados para o diálogo de confirmação
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, AddCircleOutline as AddCircleOutlineIcon, Piano as PianoIcon } from '@mui/icons-material';
import FormularioEquipamento from '../componentes/FormularioEquipamento.jsx';

function Equipamentos() {
  const [equipamentos, setEquipamentos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const { mostrarNotificacao } = useNotificacao();
  const theme = useTheme();

  const [dialogoAberto, setDialogoAberto] = useState(false);
  const [equipamentoSelecionadoId, setEquipamentoSelecionadoId] = useState(null);

  // --- Novos estados para o diálogo de confirmação de exclusão ---
  const [dialogoConfirmacaoExcluirAberto, setDialogoConfirmacaoExcluirAberto] = useState(false);
  const [equipamentoParaExcluir, setEquipamentoParaExcluir] = useState(null);


  const buscarEquipamentos = async () => {
    try {
      const resposta = await apiClient.get('/api/equipamentos');
      setEquipamentos(resposta.data);
    } catch (erro) {
      mostrarNotificacao("Não foi possível carregar os equipamentos.", "error");
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    buscarEquipamentos();
  }, []);

  // --- Funções para o diálogo de confirmação de exclusão ---
  const handleAbrirDialogoConfirmacaoExcluir = (equipamento) => {
    setEquipamentoParaExcluir(equipamento);
    setDialogoConfirmacaoExcluirAberto(true);
  };

  const handleFecharDialogoConfirmacaoExcluir = () => {
    setEquipamentoParaExcluir(null);
    setDialogoConfirmacaoExcluirAberto(false);
  };

  const handleConfirmarApagar = async () => {
    if (!equipamentoParaExcluir) return; // Garante que há um equipamento para excluir
    try {
      await apiClient.delete(`/api/equipamentos/${equipamentoParaExcluir.id}`);
      mostrarNotificacao("Equipamento apagado com sucesso!", "success");
      handleFecharDialogoConfirmacaoExcluir(); // Fecha o diálogo após a exclusão
      buscarEquipamentos(); // Recarrega a lista de equipamentos
    } catch (erro) {
      mostrarNotificacao("Falha ao apagar o equipamento.", "error");
    }
  };

  const handleAbrirFormulario = (id = null) => {
    setEquipamentoSelecionadoId(id);
    setDialogoAberto(true);
  };

  const handleFecharFormulario = () => {
    setEquipamentoSelecionadoId(null);
    setDialogoAberto(false);
  };

  const handleSucessoFormulario = () => {
    handleFecharFormulario();
    buscarEquipamentos();
  };


  if (carregando) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress color="inherit" /></Box>;
  }

  return (
    <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
            <Box>
                <Typography variant="h4" component="h1" fontWeight="bold">Meus Equipamentos</Typography>
                <Typography color="text.secondary">Gerencie seu inventário de instrumentos e acessórios.</Typography>
            </Box>
            <Button variant="contained" startIcon={<AddCircleOutlineIcon />} onClick={() => handleAbrirFormulario()}>
            Novo Equipamento
            </Button>
        </Box>

        {equipamentos.length === 0 ? (
            <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
                <PianoIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6">Nenhum equipamento cadastrado.</Typography>
                <Typography color="text.secondary">Clique em "Novo Equipamento" para adicionar seu primeiro item.</Typography>
            </Paper>
        ) : (
            // ALTERADO: Usando Box com display: 'flex' e propriedades flexbox para responsividade
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, justifyContent: 'flex-start' }}>
            {equipamentos.map(eq => (
                // Cada item agora é um Box que controla sua largura relativa
                <Box 
                    key={eq.id} 
                    sx={{ 
                        flex: '1 1 300px', // Cresce e encolhe, base de 300px
                        maxWidth: '100%', // Padrão
                        // Media queries para ajustar maxWidth em diferentes breakpoints
                        '@media (min-width:600px)': { maxWidth: 'calc(50% - 12px)' }, // 2 colunas em telas sm
                        '@media (min-width:960px)': { maxWidth: 'calc(33.33% - 16px)' } // 3 colunas em telas md
                    }}
                >
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <CardContent sx={{ flexGrow: 1 }}>
                            <Box sx={{display: 'flex', alignItems: 'center', mb: 2}}>
                                <Avatar sx={{bgcolor: 'secondary.main', mr: 2}}><PianoIcon /></Avatar>
                                <Box>
                                    <Typography variant="h6" component="h2" fontWeight="bold">{eq.nome}</Typography>
                                    <Typography color="text.secondary" variant="body2">{eq.tipo || 'Sem tipo'}</Typography>
                                </Box>
                            </Box>
                            <Typography color="text.secondary" variant="body2">Marca: {eq.marca || 'N/A'}</Typography>
                            <Typography color="text.secondary" variant="body2">Modelo: {eq.modelo || 'N/A'}</Typography>
                            {eq.notas && <Typography variant="body2" sx={{mt: 2, whiteSpace: 'pre-wrap', fontStyle: 'italic', color: 'text.secondary'}}>"{eq.notas}"</Typography>}
                        </CardContent>
                        <CardActions sx={{ justifyContent: 'flex-end' }}>
                            <Tooltip title="Editar"><IconButton onClick={() => handleAbrirFormulario(eq.id)}><EditIcon /></IconButton></Tooltip>
                            <Tooltip title="Excluir">
                                {/* ALTERADO: Chama a função para abrir o diálogo de confirmação */}
                              <IconButton onClick={() => handleAbrirDialogoConfirmacaoExcluir(eq)} color="error">
                                    <DeleteIcon />
                                </IconButton>
                            </Tooltip>
                        </CardActions>
                    </Card>
                </Box>
            ))}
            </Box>
        )}

        <Dialog 
            open={dialogoAberto} 
            onClose={handleFecharFormulario} 
            fullWidth 
            maxWidth="md"
            PaperProps={{ elevation: 0 }}
        >
            <DialogContent>
                <FormularioEquipamento
                    id={equipamentoSelecionadoId}
                    onSave={handleSucessoFormulario}
                    onCancel={handleFecharFormulario}
                />
            </DialogContent>
        </Dialog>

        {/* --- Diálogo de Confirmação de Exclusão --- */}
        <Dialog
            open={dialogoConfirmacaoExcluirAberto}
            onClose={handleFecharDialogoConfirmacaoExcluir}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title">{"Confirmar Exclusão"}</DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-description">
                    Tem certeza que deseja excluir o equipamento "{equipamentoParaExcluir?.nome}"?
                    Esta ação não poderá ser desfeita.
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleFecharDialogoConfirmacaoExcluir}>Cancelar</Button>
                <Button onClick={handleConfirmarApagar} color="error" variant="contained" autoFocus>
                    Excluir
                </Button>
            </DialogActions>
        </Dialog>
    </Box>
  );
}

export default Equipamentos;
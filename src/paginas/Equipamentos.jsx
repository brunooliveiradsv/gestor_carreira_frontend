// src/paginas/Equipamentos.jsx
import { useState, useEffect } from 'react';
import apiClient from '../apiClient';
import { useNotificacao } from '../contextos/NotificationContext';
import {
    Box, Button, Typography, CircularProgress, Card,
    CardContent, CardActions, IconButton, Paper, Tooltip,
    Grid, useTheme, Avatar, Dialog, DialogContent
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

  const handleApagar = async (id) => {
    if (window.confirm("Tem certeza que deseja apagar este equipamento?")) {
      try {
        await apiClient.delete(`/api/equipamentos/${id}`);
        mostrarNotificacao("Equipamento apagado com sucesso!", "success");
        buscarEquipamentos();
      } catch (erro) {
        mostrarNotificacao("Falha ao apagar o equipamento.", "error");
      }
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
            <Grid container spacing={3}>
            {equipamentos.map(eq => (
                <Grid item xs={12} sm={6} md={4} key={eq.id}>
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
                            <Tooltip title="Excluir"><IconButton onClick={() => handleApagar(eq.id)} color="error"><DeleteIcon /></IconButton></Tooltip>
                        </CardActions>
                    </Card>
                </Grid>
            ))}
            </Grid>
        )}


        <Dialog 
            open={dialogoAberto} 
            onClose={handleFecharFormulario} 
            fullWidth 
            maxWidth="md"
            // ADICIONADO PARA REMOVER A SOMBRA
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
    </Box>
  );
}

export default Equipamentos;
import { useState, useContext } from "react";
import apiClient from '../apiClient';
import { useNotificacao } from "../contextos/NotificationContext";
import { AuthContext } from '../contextos/AuthContext';
import { useUpgradeDialog } from '../contextos/UpgradeDialogContext';
import useApi from "../hooks/useApi";
import {
  Box, Button, Typography, CircularProgress, Card, CardContent,
  CardActions, IconButton, Paper, Tooltip, Dialog, DialogActions,
  DialogContent, DialogContentText, DialogTitle, useTheme,
  Avatar
} from "@mui/material";
import {
  Edit as EditIcon, Delete as DeleteIcon, AddCircleOutline as AddCircleOutlineIcon,
  Piano as PianoIcon, Lock as LockIcon
} from "@mui/icons-material";
import FormularioEquipamento from "../componentes/FormularioEquipamento.jsx";

function Equipamentos() {
  const { mostrarNotificacao } = useNotificacao();
  const theme = useTheme();
  const { usuario } = useContext(AuthContext);
  const { abrirDialogoDeUpgrade } = useUpgradeDialog();

  const { data: equipamentos, carregando, refetch: buscarEquipamentos } = useApi('/api/equipamentos');

  const [dialogoFormularioAberto, setDialogoFormularioAberto] = useState(false);
  const [dialogoConfirmacaoAberto, setDialogoConfirmacaoAberto] = useState(false);
  const [equipamentoSelecionadoId, setEquipamentoSelecionadoId] = useState(null);
  const [equipamentoParaApagar, setEquipamentoParaApagar] = useState(null);

  const isPadraoOuSuperior = usuario?.plano === 'padrao' || usuario?.plano === 'premium';
  const limiteEquipamentos = (usuario.plano === 'free' && equipamentos?.length >= 1) || (usuario.plano === 'padrao' && equipamentos?.length >= 5);
  const mensagemLimite = `Você atingiu o limite de ${usuario.plano === 'free' ? 1 : 5} equipamentos do seu plano. Faça um upgrade para criar mais.`;

  const handleAbrirFormulario = (id = null) => {
    if (!id && !isPadraoOuSuperior) {
      abrirDialogoDeUpgrade("A gestão de equipamentos está disponível a partir do plano Padrão.");
      return;
    }
    if (!id && limiteEquipamentos) {
      abrirDialogoDeUpgrade(mensagemLimite);
      return;
    }
    setEquipamentoSelecionadoId(id);
    setDialogoFormularioAberto(true);
  };

  const handleFecharFormulario = () => {
    setEquipamentoSelecionadoId(null);
    setDialogoFormularioAberto(false);
  };

  const handleSucessoFormulario = () => {
    handleFecharFormulario();
    buscarEquipamentos();
  };

  const handleAbrirConfirmacaoApagar = (equipamento) => {
    setEquipamentoParaApagar(equipamento);
    setDialogoConfirmacaoAberto(true);
  };

  const handleFecharConfirmacaoApagar = () => {
    setEquipamentoParaApagar(null);
    setDialogoConfirmacaoAberto(false);
  };

  const handleConfirmarApagar = async () => {
    if (!equipamentoParaApagar) return;
    try {
      await apiClient.delete(`/api/equipamentos/${equipamentoParaApagar.id}`);
      mostrarNotificacao("Equipamento apagado com sucesso!", "success");
      buscarEquipamentos();
    } catch (erro) {
      mostrarNotificacao("Falha ao apagar o equipamento.", "error");
    } finally {
      handleFecharConfirmacaoApagar();
    }
  };

  if (carregando) {
    return <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}><CircularProgress color="inherit" /></Box>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
            <Typography variant="h4" component="h1" fontWeight="bold">Meus Equipamentos</Typography>
            <Typography color="text.secondary">Inventário dos seus instrumentos e equipamentos.</Typography>
        </Box>
        <Tooltip title={!isPadraoOuSuperior ? "Disponível no Plano Padrão ou superior" : (limiteEquipamentos ? mensagemLimite : 'Adicionar novo equipamento')}>
          <Button
            variant="contained"
            startIcon={!isPadraoOuSuperior || limiteEquipamentos ? <LockIcon /> : <AddCircleOutlineIcon />}
            onClick={() => handleAbrirFormulario()}
          >
            Novo Equipamento
          </Button>
        </Tooltip>
      </Box>

      {!isPadraoOuSuperior ? (
        <Paper sx={{ p: 4, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <PianoIcon sx={{ fontSize: 48, color: 'primary.main' }} />
            <Typography variant="h6" fontWeight="bold">Gestão de Equipamentos</Typography>
            <Typography color="text.secondary" sx={{ maxWidth: '500px' }}>
                Catalogue todos os seus instrumentos e equipamentos, incluindo informações de compra, para ter o seu inventário sempre à mão.
            </Typography>
            <Button 
                variant="contained" 
                onClick={() => navigate('/assinatura')}
                sx={{ mt: 1 }}
            >
                Fazer Upgrade para o Plano Padrão
            </Button>
        </Paper>
      ) : !equipamentos || equipamentos.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
            <PianoIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6">Nenhum equipamento cadastrado.</Typography>
            <Typography color="text.secondary">Clique em "Novo Equipamento" para começar a construir seu inventário.</Typography>
        </Paper>
      ) : (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, justifyContent: 'flex-start' }}>
          {equipamentos.map((equip) => (
            <Box key={equip.id} sx={{ flex: '1 1 300px', maxWidth: '100%', '@media (min-width:600px)': { maxWidth: 'calc(50% - 12px)' }, '@media (min-width:960px)': { maxWidth: 'calc(33.33% - 16px)' } }}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}><PianoIcon /></Avatar>
                    <Box>
                      <Typography variant="h6" component="h2" fontWeight="bold">{equip.nome}</Typography>
                      <Typography color="text.secondary" variant="body2">{equip.marca} {equip.modelo}</Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2" color="text.secondary">{equip.notas}</Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end' }}>
                  <Tooltip title="Editar">
                    <IconButton onClick={() => handleAbrirFormulario(equip.id)}><EditIcon /></IconButton>
                  </Tooltip>
                  <Tooltip title="Excluir">
                    <IconButton onClick={() => handleAbrirConfirmacaoApagar(equip)} color="error"><DeleteIcon /></IconButton>
                  </Tooltip>
                </CardActions>
              </Card>
            </Box>
          ))}
        </Box>
      )}

      <Dialog open={dialogoFormularioAberto} onClose={handleFecharFormulario} fullWidth maxWidth="sm">
        <DialogContent>
          <FormularioEquipamento
            id={equipamentoSelecionadoId}
            onSave={handleSucessoFormulario}
            onCancel={handleFecharFormulario}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={dialogoConfirmacaoAberto} onClose={handleFecharConfirmacaoApagar}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>Tem certeza que deseja apagar o equipamento "{equipamentoParaApagar?.nome}"?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleFecharConfirmacaoApagar}>Cancelar</Button>
          <Button onClick={handleConfirmarApagar} color="error">Apagar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Equipamentos;
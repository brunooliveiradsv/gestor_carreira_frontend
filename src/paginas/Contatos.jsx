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
  Person as PersonIcon, Phone as PhoneIcon, Email as EmailIcon, Star as StarIcon,
  ContactPage as ContactPageIcon, Lock as LockIcon
} from "@mui/icons-material";

import FormularioContato from "../componentes/FormularioContato.jsx";

function Contatos() {
  const { mostrarNotificacao } = useNotificacao();
  const theme = useTheme();
  const { usuario } = useContext(AuthContext);
  const { abrirDialogoDeUpgrade } = useUpgradeDialog();

  const { data: contatos, carregando, refetch: buscarContatos } = useApi('/api/contatos');

  const [dialogoFormularioAberto, setDialogoFormularioAberto] = useState(false);
  const [dialogoConfirmacaoAberto, setDialogoConfirmacaoAberto] = useState(false);
  const [contatoSelecionadoId, setContatoSelecionadoId] = useState(null);
  const [contatoParaApagar, setContatoParaApagar] = useState(null);

  const limiteContatos = (usuario.plano === 'free' && contatos?.length >= 1) || (usuario.plano === 'padrao' && contatos?.length >= 5);
  const mensagemLimite = `Você atingiu o limite de ${usuario.plano === 'free' ? 1 : 5} contatos do seu plano. Faça um upgrade para criar mais.`;

  const handleAbrirFormulario = (id = null) => {
    if (!id && limiteContatos) {
      abrirDialogoDeUpgrade(mensagemLimite);
      return;
    }
    setContatoSelecionadoId(id);
    setDialogoFormularioAberto(true);
  };

  const handleFecharFormulario = () => {
    setContatoSelecionadoId(null);
    setDialogoFormularioAberto(false);
  };

  const handleSucessoFormulario = () => {
    handleFecharFormulario();
    buscarContatos();
  };

  const handleAbrirConfirmacaoApagar = (contato) => {
    setContatoParaApagar(contato);
    setDialogoConfirmacaoAberto(true);
  };

  const handleFecharConfirmacaoApagar = () => {
    setContatoParaApagar(null);
    setDialogoConfirmacaoAberto(false);
  };

  const handleConfirmarApagar = async () => {
    if (!contatoParaApagar) return;
    try {
      await apiClient.delete(`/api/contatos/${contatoParaApagar.id}`);
      mostrarNotificacao("Contato apagado com sucesso!", "success");
      buscarContatos();
    } catch (erro) {
      mostrarNotificacao("Falha ao apagar o contato.", "error");
    } finally {
      handleFecharConfirmacaoApagar();
    }
  };
  
  const handleDefinirPublico = async (contatoId) => {
    try {
      await apiClient.patch(`/api/contatos/${contatoId}/definir-publico`);
      mostrarNotificacao('Contato destacado na sua página vitrine!', 'success');
      buscarContatos(); 
    } catch (error) {
      mostrarNotificacao('Erro ao destacar o contato.', 'error');
    }
  };

  if (carregando) {
    return <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}><CircularProgress color="inherit" /></Box>;
  }

  return (
    <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
            <Box>
                <Typography variant="h4" component="h1" fontWeight="bold">Meus Contatos</Typography>
                <Typography color="text.secondary">Sua rede de contatos profissionais.</Typography>
            </Box>
            <Tooltip title={limiteContatos ? mensagemLimite : 'Adicionar novo contato'}>
                <Button variant="contained" startIcon={limiteContatos ? <LockIcon /> : <AddCircleOutlineIcon />} onClick={() => handleAbrirFormulario()}>
                    Novo Contato
                </Button>
            </Tooltip>
        </Box>

        {!contatos || contatos.length === 0 ? (
            <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
                <ContactPageIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6">Nenhum contato na sua agenda.</Typography>
                <Typography color="text.secondary">Clique em "Novo Contato" para começar a construir sua rede!</Typography>
            </Paper>
        ) : (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, justifyContent: 'flex-start' }}>
            {contatos.map((contato) => (
                <Box
                    key={contato.id}
                    sx={{
                        flex: '1 1 300px',
                        maxWidth: '100%',
                        '@media (min-width:600px)': { maxWidth: 'calc(50% - 12px)' },
                        '@media (min-width:960px)': { maxWidth: 'calc(33.33% - 16px)' }
                    }}
                >
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', border: contato.publico ? `2px solid ${theme.palette.primary.main}` : 'none' }}>
                        <CardContent sx={{ flexGrow: 1 }}>
                            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                            <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}><PersonIcon /></Avatar>
                            <Box>
                                <Typography variant="h6" component="h2" fontWeight="bold">{contato.nome}</Typography>
                                {contato.funcao && <Typography color="text.secondary" variant="body2">{contato.funcao}</Typography>}
                            </Box>
                            </Box>
                            {contato.email && (
                            <Box sx={{ display: "flex", alignItems: "center", color: 'text.secondary', mb: 1 }}>
                                <EmailIcon sx={{ fontSize: "1.1rem", mr: 1.5, color: 'primary.light' }} />
                                <Typography variant="body2">{contato.email}</Typography>
                            </Box>
                            )}
                            {contato.telefone && (
                            <Box sx={{ display: "flex", alignItems: "center", color: 'text.secondary' }}>
                                <PhoneIcon sx={{ fontSize: "1.1rem", mr: 1.5, color: 'primary.light' }} />
                                <Typography variant="body2">{contato.telefone}</Typography>
                            </Box>
                            )}
                        </CardContent>
                        <CardActions sx={{ justifyContent: 'space-between', px: 2 }}>
                            <Tooltip title={contato.publico ? "Este contato já está na sua vitrine" : "Destacar na vitrine pública"}>
                                <span>
                                    <Button
                                        size="small"
                                        startIcon={<StarIcon />}
                                        onClick={() => handleDefinirPublico(contato.id)}
                                        disabled={contato.publico}
                                        color="primary"
                                    >
                                        {contato.publico ? "Público" : "Destacar"}
                                    </Button>
                                </span>
                            </Tooltip>
                            <Box>
                                <Tooltip title="Editar">
                                <IconButton onClick={() => handleAbrirFormulario(contato.id)}><EditIcon /></IconButton>
                                </Tooltip>
                                <Tooltip title="Excluir">
                                <IconButton onClick={() => handleAbrirConfirmacaoApagar(contato)} color="error"><DeleteIcon /></IconButton>
                                </Tooltip>
                            </Box>
                        </CardActions>
                    </Card>
                </Box>
            ))}
            </Box>
        )}

      <Dialog open={dialogoFormularioAberto} onClose={handleFecharFormulario} fullWidth maxWidth="sm" PaperProps={{ elevation: 0 }}>
        <DialogContent>
            <FormularioContato
                id={contatoSelecionadoId}
                onSave={handleSucessoFormulario}
                onCancel={handleFecharFormulario}
            />
        </DialogContent>
      </Dialog>

      <Dialog open={dialogoConfirmacaoAberto} onClose={handleFecharConfirmacaoApagar}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja apagar o contato "{contatoParaApagar?.nome}"?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleFecharConfirmacaoApagar}>Cancelar</Button>
          <Button onClick={handleConfirmarApagar} color="error">Apagar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Contatos;
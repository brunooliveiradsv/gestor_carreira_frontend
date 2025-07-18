// src/paginas/Contatos.jsx

import { useState, useEffect } from "react";
import apiClient from "../api";
import { useNotificacao } from "../contextos/NotificationContext";

import {
  Box, Button, Typography, CircularProgress, Card, CardContent,
  CardActions, IconButton, Paper, Tooltip, Dialog, DialogActions,
  DialogContent, DialogContentText, DialogTitle, useTheme, Grid, Avatar
} from "@mui/material";
import {
  Edit as EditIcon, Delete as DeleteIcon, AddCircleOutline as AddCircleOutlineIcon,
  Person as PersonIcon, Phone as PhoneIcon, Email as EmailIcon, Work as WorkIcon,
  ContactPage as ContactPageIcon
} from "@mui/icons-material";

import FormularioContato from "../componentes/FormularioContato.jsx";

function Contatos() {
  const [contatos, setContatos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const { mostrarNotificacao } = useNotificacao();
  const theme = useTheme();

  const [dialogoFormularioAberto, setDialogoFormularioAberto] = useState(false);
  const [dialogoConfirmacaoAberto, setDialogoConfirmacaoAberto] = useState(false);
  const [contatoSelecionadoId, setContatoSelecionadoId] = useState(null);
  const [contatoParaApagar, setContatoParaApagar] = useState(null);


  const buscarContatos = async () => {
    try {
      const resposta = await apiClient.get("/api/contatos");
      setContatos(resposta.data);
    } catch (erro) {
      mostrarNotificacao("Não foi possível carregar os contatos.", "error");
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    buscarContatos();
  }, []);

  const handleAbrirFormulario = (id = null) => {
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
            <Button variant="contained" startIcon={<AddCircleOutlineIcon />} onClick={() => handleAbrirFormulario()}>
                Novo Contato
            </Button>
        </Box>

        {contatos.length === 0 ? (
            <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
                <ContactPageIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6">Nenhum contato na sua agenda.</Typography>
                <Typography color="text.secondary">Clique em "Novo Contato" para começar a construir sua rede!</Typography>
            </Paper>
        ) : (
            <Grid container spacing={3}>
            {contatos.map((contato) => (
                <Grid item xs={12} sm={6} md={4} key={contato.id}>
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
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
                        <CardActions sx={{ justifyContent: 'flex-end' }}>
                            <Tooltip title="Editar">
                            <IconButton onClick={() => handleAbrirFormulario(contato.id)}><EditIcon /></IconButton>
                            </Tooltip>
                            <Tooltip title="Excluir">
                            <IconButton onClick={() => handleAbrirConfirmacaoApagar(contato)} color="error"><DeleteIcon /></IconButton>
                            </Tooltip>
                        </CardActions>
                    </Card>
                </Grid>
            ))}
            </Grid>
        )}


      <Dialog 
        open={dialogoFormularioAberto} 
        onClose={handleFecharFormulario} 
        fullWidth 
        maxWidth="sm"
        // ADICIONADO PARA REMOVER A SOMBRA
        PaperProps={{ elevation: 0 }}
      >
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
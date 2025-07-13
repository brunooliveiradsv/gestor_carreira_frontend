// src/paginas/Contatos.jsx

import { useState, useEffect } from "react";
import apiClient from "../api";
import { useNotificacao } from "../contextos/NotificationContext";

import {
  Box,
  Button,
  Container,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Paper,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  useTheme,
  Grid,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  AddCircleOutline as AddCircleOutlineIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Work as WorkIcon,
} from "@mui/icons-material";

import FormularioContato from "../componentes/FormularioContato.jsx";

function Contatos() {
  const [contatos, setContatos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [modo, setModo] = useState("lista");
  const [contatoSelecionadoId, setContatoSelecionadoId] = useState(null);
  const { mostrarNotificacao } = useNotificacao();
  const [dialogoAberto, setDialogoAberto] = useState(false);
  const [contatoParaApagar, setContatoParaApagar] = useState(null);
  const theme = useTheme();

  const buscarContatos = async () => {
    if (modo === "lista" && !carregando) setCarregando(true);
    try {
      const resposta = await apiClient.get("/api/contatos");
      setContatos(resposta.data);
    } catch (erro) {
      console.error("Erro ao buscar contatos:", erro);
      mostrarNotificacao("Não foi possível carregar os contatos.", "error");
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    if (modo === "lista") {
      buscarContatos();
    }
  }, [modo]);

  const handleAbrirConfirmacaoApagar = (contato) => {
    setContatoParaApagar(contato);
    setDialogoAberto(true);
  };

  const handleFecharConfirmacaoApagar = () => {
    setContatoParaApagar(null);
    setDialogoAberto(false);
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

  const handleSucessoFormulario = () => {
    setModo("lista");
    setContatoSelecionadoId(null);
  };
  const handleCancelarFormulario = () => {
    setModo("lista");
    setContatoSelecionadoId(null);
  };

  if (carregando && modo === "lista") {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress color="inherit" />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {modo === "lista" ? (
        <Paper elevation={6} sx={{ p: { xs: 2, md: 4 } }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', sm: 'center' },
              mb: 4,
              gap: 2,
            }}
          >
            <Typography variant="h4" component="h1" fontWeight="bold" sx={{ color: theme.palette.text.primary }}>
              Meus Contatos
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddCircleOutlineIcon />}
              onClick={() => setModo("criar")}
              color="primary"
              sx={{ alignSelf: { xs: 'stretch', sm: 'auto' } }}
            >
              Novo Contato
            </Button>
          </Box>
          {contatos.length === 0 ? (
            <Box
              sx={{
                p: { xs: 2, md: 4 },
                textAlign: "center",
                border: `1px dashed ${theme.palette.divider}`,
                borderRadius: 2,
              }}
            >
              <Typography variant="h6" sx={{ color: theme.palette.text.primary }}>
                Nenhum contato na sua agenda.
              </Typography>
              <Typography color="text.secondary">
                Comece a construir sua rede!
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {contatos.map((contato) => (
                <Card key={contato.id} variant="outlined">
                  <Grid container alignItems="center">
                    <Grid item xs={12} sm={8}>
                      <CardContent>
                        <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
                          <PersonIcon sx={{ mr: 1.5, color: 'primary.main' }} />
                          <Typography variant="h6" component="h2" fontWeight="bold">
                            {contato.nome}
                          </Typography>
                        </Box>
                        {contato.funcao && (
                          <Box sx={{ display: "flex", alignItems: "center", color: 'text.secondary', mb: 1, pl: 0.5 }}>
                            <WorkIcon sx={{ fontSize: "1rem", mr: 1.5, color: 'primary.main' }} />
                            <Typography variant="body2">{contato.funcao}</Typography>
                          </Box>
                        )}
                        {contato.email && (
                          <Box sx={{ display: "flex", alignItems: "center", color: 'text.secondary', mb: 1, pl: 0.5 }}>
                            <EmailIcon sx={{ fontSize: "1rem", mr: 1.5, color: 'primary.main' }} />
                            <Typography variant="body2">{contato.email}</Typography>
                          </Box>
                        )}
                        {contato.telefone && (
                          <Box sx={{ display: "flex", alignItems: "center", color: 'text.secondary', pl: 0.5 }}>
                            <PhoneIcon sx={{ fontSize: "1rem", mr: 1.5, color: 'primary.main' }} />
                            <Typography variant="body2">{contato.telefone}</Typography>
                          </Box>
                        )}
                      </CardContent>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <CardActions sx={{ justifyContent: {xs: 'flex-start', sm: 'flex-end'}, p: 2 }}>
                        <Tooltip title="Editar">
                          <IconButton onClick={() => { setContatoSelecionadoId(contato.id); setModo("editar"); }} color="primary">
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Excluir">
                          <IconButton onClick={() => handleAbrirConfirmacaoApagar(contato)} color="error">
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </CardActions>
                    </Grid>
                  </Grid>
                </Card>
              ))}
            </Box>
          )}
        </Paper>
      ) : (
        <FormularioContato
          id={contatoSelecionadoId}
          onSave={handleSucessoFormulario}
          onCancel={handleCancelarFormulario}
        />
      )}

      <Dialog open={dialogoAberto} onClose={handleFecharConfirmacaoApagar}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja apagar o contato "{contatoParaApagar?.nome}"?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleFecharConfirmacaoApagar}>Cancelar</Button>
          <Button onClick={handleConfirmarApagar} color="error">
            Apagar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Contatos;
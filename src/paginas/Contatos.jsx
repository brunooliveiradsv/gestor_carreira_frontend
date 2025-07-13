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
  useTheme, // Adicionado para acessar o tema
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
  const theme = useTheme(); // Hook para acessar o tema

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

  // Removendo primaryButtonStyle, pois o botão usará as props do tema
  // const primaryButtonStyle = {
  //   borderRadius: 2,
  //   bgcolor: "#4000F0",
  //   color: "white",
  //   py: 1.2,
  //   px: 3,
  //   "&:hover": { bgcolor: "#2C00A3" },
  // };

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
        // Removendo borderRadius e elevation fixos. Eles serão do tema
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
            <Typography variant="h4" component="h1" fontWeight="bold" sx={{ color: theme.palette.text.primary }}> {/* Usa a cor de texto primária do tema */}
              Meus Contatos
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddCircleOutlineIcon />}
              onClick={() => setModo("criar")}
              color="primary" // Usa a cor primária do tema
              sx={{ alignSelf: { xs: 'stretch', sm: 'auto' } }} // Mantém apenas o ajuste de alinhamento
            >
              Novo Contato
            </Button>
          </Box>
          {contatos.length === 0 ? (
            <Box
              sx={{
                p: { xs: 2, md: 4 },
                textAlign: "center",
                border: `1px dashed ${theme.palette.divider}`, // Usa a cor do divider do tema
                borderRadius: 2,
              }}
            >
              <Typography variant="h6" sx={{ color: theme.palette.text.primary }}> {/* Usa a cor de texto primária do tema */}
                Nenhum contato na sua agenda.
              </Typography>
              <Typography color="text.secondary">
                Comece a construir sua rede!
              </Typography>
            </Box>
          ) : (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: 3,
              }}
            >
              {contatos.map((contato) => (
                // Removendo variant="outlined" e usando o boxShadow do tema (se você configurou MuiCard no tema)
                <Card key={contato.id} sx={{ display: 'flex', flexDirection: 'column' }}>
                  <CardContent>
                    <Box
                      sx={{ display: "flex", alignItems: "center", mb: 1.5 }}
                    >
                      <PersonIcon sx={{ mr: 1.5, color: theme.palette.primary.main }} /> {/* Usa a cor primária do tema */}
                      <Typography variant="h6" component="h2" fontWeight="bold" sx={{ color: theme.palette.text.primary }}> {/* Usa a cor de texto primária do tema */}
                        {contato.nome}
                      </Typography>
                    </Box>
                    {contato.funcao && (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          color: theme.palette.text.secondary, // Usa a cor de texto secundária do tema
                          mb: 1,
                        }}
                      >
                        <WorkIcon sx={{ fontSize: "1rem", mr: 1, color: theme.palette.primary.main }} /> {/* Usa a cor primária do tema */}
                        <Typography variant="body2">
                          {contato.funcao}
                        </Typography>
                      </Box>
                    )}
                    {contato.email && (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          color: theme.palette.text.secondary, // Usa a cor de texto secundária do tema
                          mb: 1,
                        }}
                      >
                        <EmailIcon sx={{ fontSize: "1rem", mr: 1, color: theme.palette.primary.main }} /> {/* Usa a cor primária do tema */}
                        <Typography variant="body2">{contato.email}</Typography>
                      </Box>
                    )}
                    {contato.telefone && (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          color: theme.palette.text.secondary, // Usa a cor de texto secundária do tema
                        }}
                      >
                        <PhoneIcon sx={{ fontSize: "1rem", mr: 1, color: theme.palette.primary.main }} /> {/* Usa a cor primária do tema */}
                        <Typography variant="body2">
                          {contato.telefone}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                  <CardActions sx={{ justifyContent: "flex-end" }}>
                    <Tooltip title="Editar">
                      <IconButton
                        onClick={() => {
                          setContatoSelecionadoId(contato.id);
                          setModo("editar");
                        }}
                        color="primary" // Usa a cor primária do tema
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Excluir">
                      <IconButton
                        onClick={() => handleAbrirConfirmacaoApagar(contato)}
                        color="error" // Usa a cor de erro do tema
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </CardActions>
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

      <Dialog 
        open={dialogoAberto} 
        onClose={handleFecharConfirmacaoApagar}
        PaperProps={{ // Estiliza o Paper do Dialog
          sx: {
            bgcolor: theme.palette.background.paper, // Fundo do dialog como paper
            boxShadow: theme.shadows[6], // Sombra do tema
          }
        }}
      >
        <DialogTitle sx={{ color: theme.palette.text.primary }}>Confirmar Exclusão</DialogTitle> {/* Usa a cor de texto primária do tema */}
        <DialogContent>
          <DialogContentText sx={{ color: theme.palette.text.secondary }}> {/* Usa a cor de texto secundária do tema */}
            Tem certeza que deseja apagar o contato "{contatoParaApagar?.nome}"?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleFecharConfirmacaoApagar} sx={{ color: theme.palette.text.secondary }}>Cancelar</Button> {/* Usa a cor de texto secundária do tema */}
          <Button onClick={handleConfirmarApagar} color="error"> {/* Usa a cor de erro do tema */}
            Apagar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Contatos;
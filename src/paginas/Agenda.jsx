import { useState, useEffect, useCallback, useContext } from "react"; // 1. Adicionar useContext
import { useLocation, useNavigate } from "react-router-dom";
import apiClient from "../apiClient.js";
import { useNotificacao } from "../contextos/NotificationContext.jsx";
import { AuthContext } from "../contextos/AuthContext.jsx"; // 2. Importar AuthContext
import { useUpgradeDialog } from "../contextos/UpgradeDialogContext.jsx"; // 3. Importar o hook do diálogo
import useApi from "../hooks/useApi";

import {
  Box, Button, Typography, CircularProgress, Card, CardContent, CardActions,
  Chip, IconButton, Paper, Dialog, DialogTitle, DialogContent, Tooltip,
  useTheme, DialogActions, DialogContentText
} from "@mui/material";
import {
  Edit as EditIcon, Delete as DeleteIcon, Info as InfoIcon,
  AddCircleOutline as AddCircleOutlineIcon, Event as EventIcon, LocationOn as LocationOnIcon,
  MusicNote as MusicNoteIcon, Mic as MicIcon, Groups as GroupsIcon,
  Handshake as HandshakeIcon, Assignment as AssignmentIcon, PlaylistPlay as PlaylistPlayIcon
} from "@mui/icons-material";

import FormularioCompromisso from "../componentes/FormularioCompromisso.jsx";
import FormularioContrato from '../componentes/FormularioContrato';
import Anuncio from '../componentes/Anuncio'; // 1. Importar o componente de anúncio

function Agenda() {
  const { mostrarNotificacao } = useNotificacao();
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { usuario } = useContext(AuthContext); // 4. Obter o utilizador
  const { abrirDialogoDeUpgrade } = useUpgradeDialog(); // 5. Obter a função do diálogo

  const {
    data: compromissos,
    carregando,
    refetch: buscarCompromissos,
  } = useApi("/api/compromissos");

  const [dialogoFormularioAberto, setDialogoFormularioAberto] = useState(false);
  const [dialogoDetalhesAberto, setDialogoDetalhesAberto] = useState(false);
  const [compromissoSelecionado, setCompromissoSelecionado] = useState(null);
  const [dialogoApagarAberto, setDialogoApagarAberto] = useState(false);
  const [compromissoParaApagar, setCompromissoParaApagar] = useState(null);
  const [dialogoContratoAberto, setDialogoContratoAberto] = useState(false);
  const [carregandoContrato, setCarregandoContrato] = useState(false);

  useEffect(() => {
    if (location.state?.abrirFormulario) {
      handleAbrirFormulario();
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  const handleAbrirApagarDialogo = (compromisso) => {
    setCompromissoParaApagar(compromisso);
    setDialogoApagarAberto(true);
  };

  const handleFecharApagarDialogo = () => {
    setCompromissoParaApagar(null);
    setDialogoApagarAberto(false);
  };

  const handleConfirmarApagar = async () => {
    if (!compromissoParaApagar) return;
    try {
      await apiClient.delete(`/api/compromissos/${compromissoParaApagar.id}`);
      handleFecharApagarDialogo();
      buscarCompromissos();
      mostrarNotificacao("Compromisso apagado com sucesso!", "success");
    } catch (erro) {
      mostrarNotificacao("Falha ao apagar o compromisso.", "error");
    }
  };

  const handleAbrirFormulario = (compromisso = null) => {
    setCompromissoSelecionado(compromisso);
    setDialogoFormularioAberto(true);
  };

  const handleFecharFormulario = () => {
    setCompromissoSelecionado(null);
    setDialogoFormularioAberto(false);
  };

  const handleSucessoFormulario = () => {
    handleFecharFormulario();
    buscarCompromissos();
  };

  const handleAbrirDetalhes = (compromisso) => {
    setCompromissoSelecionado(compromisso);
    setDialogoDetalhesAberto(true);
  };

  const handleFecharDetalhes = () => {
    setCompromissoSelecionado(null);
    setDialogoDetalhesAberto(false);
  };

  // --- 6. LÓGICA ATUALIZADA ---
  const handleAbrirDialogoContrato = (compromisso) => {
    if (usuario?.plano !== 'premium') {
      abrirDialogoDeUpgrade('Gerar contratos é uma funcionalidade exclusiva do plano Premium.');
      return;
    }
    setCompromissoSelecionado(compromisso);
    setDialogoContratoAberto(true);
  };
  
  const handleFecharDialogoContrato = () => {
    setDialogoContratoAberto(false);
  };

  const handleGerarContrato = async (dadosContratante) => {
    if (!compromissoSelecionado) return;
    setCarregandoContrato(true);
    try {
      const resposta = await apiClient.post(
        `/api/compromissos/${compromissoSelecionado.id}/gerar-contrato`,
        dadosContratante,
        { responseType: 'blob' }
      );

      const url = window.URL.createObjectURL(new Blob([resposta.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `contrato_${compromissoSelecionado.nome_evento.replace(/\s+/g, '_')}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      mostrarNotificacao("Contrato gerado com sucesso!", "success");
      handleFecharDialogoContrato();
    } catch (error) {
      mostrarNotificacao("Erro ao gerar o contrato.", "error");
    } finally {
      setCarregandoContrato(false);
    }
  };

  // ... (funções getStatusColor e getTipoIcon permanecem iguais)
  const getStatusColor = (status) => {
    switch (status) {
      case "Realizado": return "success";
      case "Cancelado": return "error";
      default: return "info";
    }
  };

  const getTipoIcon = (tipo) => {
    switch (tipo) {
      case "Show": return <MusicNoteIcon fontSize="small" />;
      case "Gravação": return <MicIcon fontSize="small" />;
      case "Ensaio": return <GroupsIcon fontSize="small" />;
      case "Reunião": return <HandshakeIcon fontSize="small" />;
      default: return <EventIcon fontSize="small" />;
    }
  };


  if (carregando) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress color="inherit" />
      </Box>
    );
  }

  return (
    <Box>
       <Anuncio />

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          mb: 4,
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold">
            Minha Agenda
          </Typography>
          <Typography color="text.secondary">
            Visualize e gerencie seus próximos eventos.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddCircleOutlineIcon />}
          onClick={() => handleAbrirFormulario()}
          sx={{ width: { xs: "100%", sm: "auto" } }}
        >
          Novo Compromisso
        </Button>
      </Box>
      {(compromissos || []).length === 0 ? (
        <Paper variant="outlined" sx={{ p: 4, textAlign: "center" }}>
          <EventIcon sx={{ fontSize: 48, color: "text.secondary", mb: 2 }} />
          <Typography variant="h6">Sua agenda está vazia!</Typography>
          <Typography color="text.secondary">
            Clique em "Novo Compromisso" para começar a se organizar.
          </Typography>
        </Paper>
      ) : (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {(compromissos || []).map((c) => (
            <Box key={c.id} sx={{ flex: '1 1 350px', minWidth: '300px' }}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      mb: 1.5,
                    }}
                  >
                    <Chip
                      icon={getTipoIcon(c.tipo)}
                      label={c.tipo}
                      size="small"
                      variant="outlined"
                    />
                    <Chip
                      label={c.status}
                      color={getStatusColor(c.status)}
                      size="small"
                    />
                  </Box>
                  <Typography
                    variant="h6"
                    component="h2"
                    fontWeight="bold"
                    gutterBottom
                  >
                    {c.nome_evento}
                  </Typography>

                  <Box sx={{ display: "flex", alignItems: "center", color: "text.secondary", mb: 1 }}>
                    <EventIcon sx={{ fontSize: "1.2rem", mr: 1.5 }} />
                    <Typography variant="body2">
                      {new Date(c.data).toLocaleString("pt-BR", {
                        day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
                      })}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", color: "text.secondary", mb: 1 }}>
                    <LocationOnIcon sx={{ fontSize: "1.2rem", mr: 1.5 }} />
                    <Typography variant="body2" noWrap>
                      {c.local || "Local não informado"}
                    </Typography>
                  </Box>
                </CardContent>
                <CardActions sx={{ justifyContent: "flex-end", borderTop: `1px solid ${theme.palette.divider}` }}>
                  {/* --- 7. BOTÃO ATUALIZADO --- */}
                  <Tooltip title="Gerar Contrato (Funcionalidade Premium)">
                    <span>
                      <IconButton onClick={() => handleAbrirDialogoContrato(c)} disabled={c.status !== 'Agendado'}>
                        <AssignmentIcon color={usuario?.plano === 'premium' ? 'inherit' : 'disabled'} />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title="Detalhes">
                    <IconButton onClick={() => handleAbrirDetalhes(c)}><InfoIcon /></IconButton>
                  </Tooltip>
                  <Tooltip title={c.status !== "Agendado" ? "Não é possível editar" : "Editar"}>
                    <Box component="span">
                      <IconButton onClick={() => handleAbrirFormulario(c)} disabled={c.status !== "Agendado"}><EditIcon /></IconButton>
                    </Box>
                  </Tooltip>
                  <Tooltip title={c.status === "Realizado" ? "Não é possível excluir" : "Excluir"}>
                    <Box component="span">
                      <IconButton onClick={() => handleAbrirApagarDialogo(c)} disabled={c.status === "Realizado"} color="error"><DeleteIcon /></IconButton>
                    </Box>
                  </Tooltip>
                </CardActions>
              </Card>
            </Box>
          ))}
        </Box>
      )}

      <Dialog
        open={dialogoFormularioAberto}
        onClose={handleFecharFormulario}
        fullWidth
        maxWidth="md"
      >
        <DialogContent>
          <FormularioCompromisso
            id={compromissoSelecionado ? compromissoSelecionado.id : null}
            onSave={handleSucessoFormulario}
            onCancel={handleFecharFormulario}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={dialogoApagarAberto} onClose={handleFecharApagarDialogo}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja apagar o compromisso "{compromissoParaApagar?.nome_evento}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleFecharApagarDialogo}>Cancelar</Button>
          <Button onClick={handleConfirmarApagar} color="error">
            Apagar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={dialogoDetalhesAberto}
        onClose={handleFecharDetalhes}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle fontWeight="bold">
          Detalhes: {compromissoSelecionado?.nome_evento}
        </DialogTitle>
        <DialogContent dividers>
          {compromissoSelecionado && (
            <Box sx={{ lineHeight: 1.8 }}>
              <Typography><strong>Tipo:</strong> {compromissoSelecionado.tipo}</Typography>
              <Typography><strong>Data:</strong>{" "}
                {new Date(compromissoSelecionado.data).toLocaleString("pt-BR", { dateStyle: "full", timeStyle: "short" })}
              </Typography>
              <Typography><strong>Local:</strong> {compromissoSelecionado.local || "Não informado"}</Typography>
              <Typography><strong>Status:</strong> {compromissoSelecionado.status}</Typography>
              {compromissoSelecionado.valor_cache && (
                <Typography><strong>Cachê:</strong> R$ {parseFloat(compromissoSelecionado.valor_cache).toFixed(2)}</Typography>
              )}
              {compromissoSelecionado.setlist && (
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <PlaylistPlayIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography><strong>Setlist:</strong> {compromissoSelecionado.setlist.nome}</Typography>
                </Box>
              )}
              {compromissoSelecionado.despesas && compromissoSelecionado.despesas.length > 0 && (
                  <Box mt={2}>
                    <Typography fontWeight="bold">Despesas Previstas:</Typography>
                    <ul style={{ paddingLeft: "20px", margin: 0 }}>
                      {compromissoSelecionado.despesas.map((d, index) => (<li key={index}>{d.descricao}: R$ {parseFloat(d.valor).toFixed(2)}</li>))}
                    </ul>
                  </Box>
                )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleFecharDetalhes}>Fechar</Button>
        </DialogActions>
      </Dialog>
      
      {compromissoSelecionado && (
        <FormularioContrato
          open={dialogoContratoAberto}
          onClose={handleFecharDialogoContrato}
          onGerarContrato={handleGerarContrato}
          carregando={carregandoContrato}
        />
      )}
    </Box>
  );
}

export default Agenda;
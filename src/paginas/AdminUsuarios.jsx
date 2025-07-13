// src/paginas/AdminUsuarios.jsx

import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../contextos/AuthContext";
import { useNotificacao } from "../contextos/NotificationContext";
import apiClient from '../api';

import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Chip,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  InputAdornment,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  CardActions,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  SupervisorAccount as SupervisorAccountIcon,
  CleaningServices as CleaningServicesIcon,
  AdminPanelSettings as AdminPanelSettingsIcon,
  AddCircleOutline as AddCircleOutlineIcon,
  Search as SearchIcon,
} from "@mui/icons-material";

import FormularioUsuario from "../componentes/FormularioUsuario.jsx";

function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [modo, setModo] = useState("lista");
  const { usuario: adminLogado } = useContext(AuthContext);
  const { mostrarNotificacao } = useNotificacao();
  const [termoBusca, setTermoBusca] = useState("");
  const [dialogoAberto, setDialogoAberto] = useState(false);
  const [acaoPendente, setAcaoPendente] = useState(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const buscarUsuarios = async () => {
    if (modo === "lista" && !carregando) setCarregando(true);
    try {
      const resposta = await apiClient.get("/api/admin/usuarios");
      const usuariosOrdenados = resposta.data.sort((a, b) => {
        if (a.role === "admin" && b.role !== "admin") return -1;
        if (b.role === "admin" && a.role !== "admin") return 1;
        return a.nome.localeCompare(b.nome);
      });
      setUsuarios(usuariosOrdenados);
    } catch (erro) {
      console.error("Erro ao buscar usuários:", erro);
      mostrarNotificacao("Não foi possível carregar a lista de usuários.", "error");
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    if (modo === "lista") {
      buscarUsuarios();
    } else {
      setCarregando(false);
    }
  }, [modo]);

  const executarAcaoConfirmada = async () => {
    if (!acaoPendente) return;
    const { tipo, dados } = acaoPendente;
    try {
      if (tipo === "apagar") {
        await apiClient.delete(`/api/admin/usuarios/${dados.id}`);
        mostrarNotificacao("Usuário apagado com sucesso!", "success");
      } else if (tipo === "limpar") {
        await apiClient.delete(`/api/admin/usuarios/${dados.id}/dados`);
        mostrarNotificacao(`Dados de ${dados.nome} limpos com sucesso!`, "success");
      } else if (tipo === "role") {
        await apiClient.put(`/api/admin/usuarios/${dados.id}`, { role: dados.novoRole });
        mostrarNotificacao("Nível de acesso alterado com sucesso!", "success");
      }
      buscarUsuarios();
    } catch (erro) {
      mostrarNotificacao(erro.response?.data?.mensagem || `Falha ao executar a ação.`, "error");
    } finally {
      handleFecharDialogo();
    }
  };

  const abrirDialogoConfirmacao = (tipo, dados) => {
    setAcaoPendente({ tipo, dados });
    setDialogoAberto(true);
  };

  const handleFecharDialogo = () => {
    setDialogoAberto(false);
    setAcaoPendente(null);
  };

  const handleSalvarNovoUsuario = async (dadosDoFormulario) => {
    setCarregando(true);
    try {
      await apiClient.post("/api/admin/usuarios", dadosDoFormulario);
      mostrarNotificacao("Usuário criado com sucesso!", "success");
      setModo("lista");
    } catch (erro) {
      mostrarNotificacao(erro.response?.data?.mensagem || "Falha ao criar o usuário.", "error");
      setCarregando(false);
    }
  };

  const handleApagarUsuario = (usuario) => {
    if (adminLogado.id === usuario.id) return mostrarNotificacao("Você não pode apagar sua própria conta.", "warning");
    abrirDialogoConfirmacao("apagar", { id: usuario.id, nome: usuario.nome });
  };

  const handleLimparDados = (usuario) => {
    abrirDialogoConfirmacao("limpar", { id: usuario.id, nome: usuario.nome });
  };

  const handleAlternarRole = (usuario) => {
    if (adminLogado.id === usuario.id) return mostrarNotificacao("Você não pode alterar seu próprio nível.", "warning");
    const novoRole = usuario.role === "admin" ? "usuario" : "admin";
    abrirDialogoConfirmacao("role", { id: usuario.id, nome: usuario.nome, novoRole });
  };

  const usuariosFiltrados = usuarios.filter((usuario) =>
    usuario.nome.toLowerCase().includes(termoBusca.toLowerCase())
  );

  const renderizarVisaoMobile = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {usuariosFiltrados.map((usuario) => (
        <Card key={usuario.id} variant="outlined">
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="h6" fontWeight="bold">{usuario.nome}</Typography>
              <Chip
                label={usuario.role === "admin" ? "Admin" : "Usuário"}
                color={usuario.role === "admin" ? "primary" : "default"}
                size="small"
                icon={usuario.role === "admin" ? <SupervisorAccountIcon /> : undefined}
              />
            </Box>
            <Typography variant="body2" color="text.secondary" noWrap>{usuario.email}</Typography>
          </CardContent>
          <CardActions sx={{ justifyContent: 'space-around', borderTop: '1px solid rgba(0,0,0,0.12)' }}>
            <Tooltip title={usuario.role === "admin" ? "Rebaixar para Usuário" : "Promover para Admin"}>
              <span>
                <IconButton color="primary" onClick={() => handleAlternarRole(usuario)} disabled={adminLogado.id === usuario.id}>
                  <AdminPanelSettingsIcon />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Limpar Dados do Usuário">
              <IconButton color="warning" onClick={() => handleLimparDados(usuario)}>
                <CleaningServicesIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Excluir Usuário">
              <span>
                <IconButton color="error" onClick={() => handleApagarUsuario(usuario)} disabled={adminLogado.id === usuario.id}>
                  <DeleteIcon />
                </IconButton>
              </span>
            </Tooltip>
          </CardActions>
        </Card>
      ))}
    </Box>
  );

  const renderizarVisaoDesktop = () => (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: "bold" }}>ID</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Nome</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>E-mail</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Nível</TableCell>
            <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>Ações</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {usuariosFiltrados.map((usuario) => (
            <TableRow key={usuario.id} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
              <TableCell>{usuario.id}</TableCell>
              <TableCell>{usuario.nome}</TableCell>
              <TableCell>{usuario.email}</TableCell>
              <TableCell>
                <Chip
                  label={usuario.role === "admin" ? "Admin" : "Usuário"}
                  color={usuario.role === "admin" ? "primary" : "default"}
                  size="small"
                  icon={usuario.role === "admin" ? <SupervisorAccountIcon /> : undefined}
                />
              </TableCell>
              <TableCell align="center">
                <Tooltip title={usuario.role === "admin" ? "Rebaixar para Usuário" : "Promover para Admin"}>
                  <span>
                    <IconButton color="primary" onClick={() => handleAlternarRole(usuario)} disabled={adminLogado.id === usuario.id}>
                      <AdminPanelSettingsIcon />
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title="Limpar Dados do Usuário">
                  <IconButton color="warning" onClick={() => handleLimparDados(usuario)}>
                    <CleaningServicesIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Excluir Usuário">
                  <span>
                    <IconButton color="error" onClick={() => handleApagarUsuario(usuario)} disabled={adminLogado.id === usuario.id}>
                      <DeleteIcon />
                    </IconButton>
                  </span>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {carregando ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress color="inherit" />
        </Box>
      ) : (
        <>
          {modo === "criar" ? (
            <FormularioUsuario
              onSave={handleSalvarNovoUsuario}
              onCancel={() => setModo("lista")}
              carregando={carregando}
            />
          ) : (
            <Paper elevation={3} sx={{ borderRadius: 2, p: { xs: 2, md: 4 } }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 4,
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: 2,
                }}
              >
                <Typography variant="h4" component="h1" fontWeight="bold">
                  Gerenciamento de Usuários
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddCircleOutlineIcon />}
                  onClick={() => setModo("criar")}
                  sx={{ width: { xs: '100%', sm: 'auto' } }}
                >
                  Novo Usuário
                </Button>
              </Box>
              <Box sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Buscar usuário por nome..."
                  value={termoBusca}
                  onChange={(e) => setTermoBusca(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
              
              {isMobile ? renderizarVisaoMobile() : renderizarVisaoDesktop()}

            </Paper>
          )}

          <Dialog open={dialogoAberto} onClose={handleFecharDialogo}>
            <DialogTitle>Confirmar Ação</DialogTitle>
            <DialogContent>
              <DialogContentText>
                {acaoPendente?.tipo === "apagar" &&
                  `Tem certeza que deseja apagar o usuário ${acaoPendente.dados.nome}? Esta ação é irreversível.`}
                {acaoPendente?.tipo === "limpar" &&
                  `Tem certeza que deseja limpar TODOS os dados do usuário ${acaoPendente.dados.nome}?`}
                {acaoPendente?.tipo === "role" &&
                  `Tem certeza que deseja alterar o nível de ${acaoPendente.dados.nome} para ${acaoPendente.dados.novoRole}?`}
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleFecharDialogo}>Cancelar</Button>
              <Button
                onClick={executarAcaoConfirmada}
                color="primary"
                autoFocus
              >
                Confirmar
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </Container>
  );
}

export default AdminUsuarios;
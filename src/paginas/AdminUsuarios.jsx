import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../contextos/AuthContext.jsx";
import { useNotificacao } from "../contextos/NotificationContext.jsx";
import apiClient from '../apiClient';

import {
  Box, Typography, CircularProgress, Paper, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, IconButton,
  Tooltip, Chip, Button, Dialog, DialogActions, DialogContent,
  DialogContentText, DialogTitle, TextField, InputAdornment, useTheme,
  useMediaQuery, Card, CardContent, CardActions, Avatar,
  List, ListItem, ListItemButton, ListItemIcon, ListItemText
} from "@mui/material";
import {
  Delete as DeleteIcon, SupervisorAccount as SupervisorAccountIcon,
  CleaningServices as CleaningServicesIcon, AdminPanelSettings as AdminPanelSettingsIcon,
  AddCircleOutline as AddCircleOutlineIcon, Search as SearchIcon, Person as PersonIcon,
  WorkspacePremium as WorkspacePremiumIcon,
  CheckCircle as CheckCircleIcon,
  RemoveCircle as RemoveCircleIcon
} from "@mui/icons-material";

import FormularioUsuario from "../componentes/FormularioUsuario.jsx";

function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [modo, setModo] = useState("lista");
  const { usuario: adminLogado } = useContext(AuthContext);
  const { mostrarNotificacao } = useNotificacao();
  const [termoBusca, setTermoBusca] = useState("");
  const [dialogoConfirmacaoAberto, setDialogoConfirmacaoAberto] = useState(false);
  const [acaoPendente, setAcaoPendente] = useState(null);
  const [dialogoAssinaturaAberto, setDialogoAssinaturaAberto] = useState(false);
  const [usuarioParaGerir, setUsuarioParaGerir] = useState(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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
      handleFecharDialogoConfirmacao();
    }
  };

  const handleGerirAssinatura = async (acao, plano = null) => {
    try {
        await apiClient.put(`/api/admin/usuarios/${usuarioParaGerir.id}/assinatura`, { acao, plano });
        let mensagemSucesso = "";
        if (acao === "conceder") {
            mensagemSucesso = `Plano ${capitalizar(plano)} concedido a ${usuarioParaGerir.nome}!`;
        } else if (acao === "remover") {
            mensagemSucesso = `Assinatura de ${usuarioParaGerir.nome} removida com sucesso!`;
        }
        mostrarNotificacao(mensagemSucesso, "success");
        buscarUsuarios();
    } catch (error) {
        mostrarNotificacao(error.response?.data?.mensagem || 'Falha ao gerir assinatura. Por favor, tente novamente.', 'error');
    } finally {
        handleFecharDialogoAssinatura();
    }
  };

  const abrirDialogoConfirmacao = (tipo, dados) => { setAcaoPendente({ tipo, dados }); setDialogoConfirmacaoAberto(true); };
  const handleFecharDialogoConfirmacao = () => { setDialogoConfirmacaoAberto(false); setAcaoPendente(null); };

  const handleAbrirDialogoAssinatura = (usuario) => { setUsuarioParaGerir(usuario); setDialogoAssinaturaAberto(true); };
  const handleFecharDialogoAssinatura = () => { setUsuarioParaGerir(null); setDialogoAssinaturaAberto(false); };

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
  const handleLimparDados = (usuario) => { abrirDialogoConfirmacao("limpar", { id: usuario.id, nome: usuario.nome }); };
  const handleAlternarRole = (usuario) => {
    if (adminLogado.id === usuario.id) return mostrarNotificacao("Você não pode alterar seu próprio nível.", "warning");
    const novoRole = usuario.role === "admin" ? "usuario" : "admin";
    abrirDialogoConfirmacao("role", { id: usuario.id, nome: usuario.nome, novoRole });
  };
  const usuariosFiltrados = usuarios.filter((usuario) =>
    usuario.nome.toLowerCase().includes(termoBusca.toLowerCase()) ||
    usuario.email.toLowerCase().includes(termoBusca.toLowerCase())
  );

  const capitalizar = (texto) => texto.charAt(0).toUpperCase() + texto.slice(1);

  const renderizarVisaoMobile = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {usuariosFiltrados.map((usuario) => (
        <Card key={usuario.id} variant="outlined">
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                <Avatar sx={{bgcolor: usuario.role === "admin" ? 'primary.main' : 'secondary.main', mr: 2}}>
                    <PersonIcon />
                </Avatar>
                <Box>
                    <Typography variant="h6" fontWeight="bold">{usuario.nome}</Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>{usuario.email}</Typography>
                </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip label={usuario.role} color={usuario.role === "admin" ? "primary" : "default"} size="small" variant="outlined" />
                <Chip label={usuario.plano ? `Plano ${capitalizar(usuario.plano)}` : 'Sem Plano'} color={usuario.status_assinatura === 'ativa' || usuario.status_assinatura === 'teste' ? 'success' : 'default'} size="small" />
            </Box>
          </CardContent>
          <CardActions sx={{ justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            <Tooltip title="Gerir Assinatura"><IconButton onClick={() => handleAbrirDialogoAssinatura(usuario)} color="success"><WorkspacePremiumIcon /></IconButton></Tooltip>
            <Tooltip title={usuario.role === "admin" ? "Rebaixar" : "Promover"}><IconButton onClick={() => handleAlternarRole(usuario)} disabled={adminLogado.id === usuario.id}><AdminPanelSettingsIcon /></IconButton></Tooltip>
            <Tooltip title="Limpar Dados"><IconButton color="warning" onClick={() => handleLimparDados(usuario)}><CleaningServicesIcon /></IconButton></Tooltip>
            <Tooltip title="Excluir"><IconButton color="error" onClick={() => handleApagarUsuario(usuario)} disabled={adminLogado.id === usuario.id}><DeleteIcon /></IconButton></Tooltip>
          </CardActions>
        </Card>
      ))}
    </Box>
  );

  const renderizarVisaoDesktop = () => (
    <TableContainer component={Paper} variant="outlined">
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Usuário</TableCell>
            <TableCell>Assinatura</TableCell>
            <TableCell>Nível</TableCell>
            <TableCell align="right">Ações</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {usuariosFiltrados.map((usuario) => (
            <TableRow key={usuario.id} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
              <TableCell>
                <Typography fontWeight="medium">{usuario.nome}</Typography>
                <Typography variant="body2" color="text.secondary">{usuario.email}</Typography>
              </TableCell>
              <TableCell>
                <Chip
                    label={usuario.plano ? `${capitalizar(usuario.plano)} (${capitalizar(usuario.status_assinatura)})` : 'Nenhuma'}
                    color={usuario.status_assinatura === 'ativa' || usuario.status_assinatura === 'teste' ? 'success' : 'default'}
                    size="small"
                />
              </TableCell>
              <TableCell><Chip label={capitalizar(usuario.role)} color={usuario.role === "admin" ? "primary" : "default"} size="small" /></TableCell>
              <TableCell align="right">
                <Tooltip title="Gerir Assinatura">
                  <IconButton onClick={() => handleAbrirDialogoAssinatura(usuario)} color="success"><WorkspacePremiumIcon /></IconButton>
                </Tooltip>
                <Tooltip title={usuario.role === "admin" ? "Rebaixar para Usuário" : "Promover para Admin"}>
                  <span><IconButton onClick={() => handleAlternarRole(usuario)} disabled={adminLogado.id === usuario.id}><AdminPanelSettingsIcon /></IconButton></span>
                </Tooltip>
                <Tooltip title="Limpar Dados do Usuário">
                  <IconButton color="warning" onClick={() => handleLimparDados(usuario)}><CleaningServicesIcon /></IconButton>
                </Tooltip>
                <Tooltip title="Excluir Usuário">
                  <span><IconButton color="error" onClick={() => handleApagarUsuario(usuario)} disabled={adminLogado.id === usuario.id}><DeleteIcon /></IconButton></span>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Box>
      {carregando ? <CircularProgress /> :
      <>
        {modo === "criar" ? (
          <FormularioUsuario onSave={handleSalvarNovoUsuario} onCancel={() => setModo("lista")} carregando={carregando} />
        ) : (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
              <Button variant="contained" startIcon={<AddCircleOutlineIcon />} onClick={() => setModo("criar")} sx={{ width: { xs: '100%', sm: 'auto' } }}>
                Novo Usuário
              </Button>
              <Box sx={{width: { xs: '100%', sm: 'auto', md: 350 }}}>
                <TextField fullWidth placeholder="Buscar por nome ou e-mail..." value={termoBusca}
                  onChange={(e) => setTermoBusca(e.target.value)}
                  InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>), }}
                />
              </Box>
            </Box>

            {isMobile ? renderizarVisaoMobile() : renderizarVisaoDesktop()}
          </>
        )}

        <Dialog open={dialogoConfirmacaoAberto} onClose={handleFecharDialogoConfirmacao}>
            <DialogTitle>Confirmar Ação</DialogTitle>
            <DialogContent>
            <DialogContentText>
                {acaoPendente?.tipo === "apagar" && `Tem certeza que deseja apagar o usuário ${acaoPendente.dados.nome}? Esta ação é irreversível.`}
                {acaoPendente?.tipo === "limpar" && `Tem certeza que deseja limpar TODOS os dados do usuário ${acaoPendente.dados.nome}?`}
                {acaoPendente?.tipo === "role" && `Tem certeza que deseja alterar o nível de ${acaoPendente.dados.nome} para ${acaoPendente.dados.novoRole}?`}
            </DialogContentText>
            </DialogContent>
            <DialogActions>
            <Button onClick={handleFecharDialogoConfirmacao}>Cancelar</Button>
            <Button onClick={executarAcaoConfirmada} color="primary" autoFocus>Confirmar</Button>
            </DialogActions>
        </Dialog>

        {/* --- DIÁLOGO DE GESTÃO DE ASSINATURA ATUALIZADO --- */}
        <Dialog open={dialogoAssinaturaAberto} onClose={handleFecharDialogoAssinatura} fullWidth maxWidth="xs">
            <DialogTitle>Gerir Assinatura</DialogTitle>
            <DialogContent>
                <Typography>Selecione uma ação para **{usuarioParaGerir?.nome}**:</Typography>
                <List>
                    <ListItem disablePadding>
                        <ListItemButton onClick={() => handleGerirAssinatura('conceder', 'free')}>
                            <ListItemIcon><CheckCircleIcon /></ListItemIcon>
                            <ListItemText primary="Conceder Plano Free" />
                        </ListItemButton>
                    </ListItem>
                    <ListItem disablePadding>
                        <ListItemButton onClick={() => handleGerirAssinatura('conceder', 'padrao')}>
                            <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                            <ListItemText primary="Conceder Plano Padrão" />
                        </ListItemButton>
                    </ListItem>
                    <ListItem disablePadding>
                        <ListItemButton onClick={() => handleGerirAssinatura('conceder', 'premium')}>
                            <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
                            <ListItemText primary="Conceder Plano Premium" />
                        </ListItemButton>
                    </ListItem>
                    <Divider sx={{ my: 1 }} />
                    <ListItem disablePadding>
                        <ListItemButton onClick={() => handleGerirAssinatura('remover')}>
                            <ListItemIcon><RemoveCircleIcon color="error" /></ListItemIcon>
                            <ListItemText primary="Remover Assinatura (Voltar para Free)" />
                        </ListItemButton>
                    </ListItem>
                </List>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleFecharDialogoAssinatura}>Cancelar</Button>
            </DialogActions>
        </Dialog>
      </>
    }
    </Box>
  );
}

export default AdminUsuarios;
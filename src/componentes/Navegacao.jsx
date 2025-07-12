// src/componentes/Navegacao.jsx

import React, { useContext, useState, useEffect } from "react";
import { NavLink as RouterLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../contextos/AuthContext";
import apiClient from '../api';

// Imports do Material-UI
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Tooltip,
  Divider,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
// Imports dos Ícones
import {
  Notifications as NotificationsIcon,
  Close as CloseIcon,
  MilitaryTech as MilitaryTechIcon,
  MusicNote as MusicNoteIcon,
  AttachMoney as AttachMoneyIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material"; // Adicionado SettingsIcon

function Navegacao() {
  const { usuario, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [notificacoes, setNotificacoes] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [dialogoLimparAberto, setDialogoLimparAberto] = useState(false);

  const open = Boolean(anchorEl);
  const naoLidasCount = notificacoes.filter((n) => !n.lida).length;

  const buscarNotificacoes = async () => {
    if (!usuario) return;
    try {
      const resposta = await apiClient.get("/api/notificacoes");
      setNotificacoes(resposta.data);
    } catch (error) {
      console.error("Erro ao buscar notificações", error);
    }
  };

  useEffect(() => {
    buscarNotificacoes();
    const intervalId = setInterval(buscarNotificacoes, 30000);
    return () => clearInterval(intervalId);
  }, [usuario]);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMarcarComoLida = async (notificacaoId) => {
    const notificacao = notificacoes.find((n) => n.id === notificacaoId);
    if (notificacao && !notificacao.lida) {
      try {
        await apiClient.patch(
          `/api/notificacoes/${notificacaoId}/lida`
        );
        setNotificacoes((notificacoesAtuais) =>
          notificacoesAtuais.map((n) =>
            n.id === notificacaoId ? { ...n, lida: true } : n
          )
        );
      } catch (error) {
        console.error("Erro ao marcar notificação como lida", error);
      }
    }
  };

  const handleApagar = async (e, notificacaoId) => {
    e.stopPropagation();
    try {
      await apiClient.delete(
        `/api/notificacoes/${notificacaoId}`
      );
      setNotificacoes(notificacoes.filter((n) => n.id !== notificacaoId));
    } catch (error) {
      console.error("Erro ao apagar notificação", error);
    }
  };

  const abrirDialogoLimpar = () => {
    handleMenuClose();
    setDialogoLimparAberto(true);
  };

  const fecharDialogoLimpar = () => {
    setDialogoLimparAberto(false);
  };

  const handleConfirmarLimparTodas = async () => {
    try {
      await apiClient.delete("/api/notificacoes");
      setNotificacoes([]);
    } catch (error) {
      console.error("Erro ao limpar notificações", error);
    } finally {
      fecharDialogoLimpar();
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getConquistaIcon = (tipoCondicao) => {
    if (!tipoCondicao) return <NotificationsIcon fontSize="small" />;
    if (tipoCondicao.includes("SHOWS"))
      return <MusicNoteIcon fontSize="small" />;
    if (tipoCondicao.includes("RECEITA"))
      return <AttachMoneyIcon fontSize="small" />;
    if (tipoCondicao.includes("CONTATO"))
      return <PeopleIcon fontSize="small" />;
    return <MilitaryTechIcon fontSize="small" />;
  };

  const activeLinkStyle = {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  };

  return (
    <>
      <AppBar
        position="static"
        sx={{ background: "rgba(0, 0, 0, 0.3)", boxShadow: "none" }}
      >
        <Toolbar>
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{
              flexGrow: 1,
              fontWeight: "bold",
              color: "white",
              textDecoration: "none",
            }}
          >
            GESTOR MUSICAL
          </Typography>

          <Box sx={{ display: { xs: "none", md: "flex" } }}>
            <Button
              component={RouterLink}
              to="/"
              sx={{ color: "white", mx: 1 }}
              style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}
            >
              Agenda
            </Button>
            <Button
              component={RouterLink}
              to="/financeiro"
              sx={{ color: "white", mx: 1 }}
              style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}
            >
              Financeiro
            </Button>
            <Button
              component={RouterLink}
              to="/repertorios"
              sx={{ color: "white", mx: 1 }}
            >
              Repertórios
            </Button>
            <Button
              component={RouterLink}
              to="/equipamentos"
              sx={{ color: "white", mx: 1 }}
            >
              Equipamentos
            </Button>
            <Button
              component={RouterLink}
              to="/contatos"
              sx={{ color: "white", mx: 1 }}
              style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}
            >
              Contatos
            </Button>
            <Button
              component={RouterLink}
              to="/conquistas"
              sx={{ color: "white", mx: 1 }}
              style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}
            >
              Conquistas
            </Button>
            {usuario?.role === "admin" && (
              <Button
                component={RouterLink}
                to="/admin/usuarios"
                sx={{ color: "white", mx: 1 }}
                style={({ isActive }) =>
                  isActive ? activeLinkStyle : undefined
                }
              >
                Admin
              </Button>
            )}
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography sx={{ display: { xs: "none", sm: "block" } }}>
              Olá, {usuario?.nome}
            </Typography>

            {/* Ícone de Notificações */}
            <Tooltip title="Notificações">
              <IconButton color="inherit" onClick={handleMenuOpen}>
                <Badge badgeContent={naoLidasCount} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>

            {/* Ícone de Configurações */}
            <Tooltip title="Configurações">
              <IconButton
                color="inherit"
                component={RouterLink}
                to="/configuracoes"
              >
                <SettingsIcon />
              </IconButton>
            </Tooltip>

            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={handleMenuClose}
              PaperProps={{ sx: { maxHeight: 400, width: "400px", mt: 1 } }}
            >
              <Box
                sx={{
                  px: 2,
                  py: 1,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="subtitle1" fontWeight="bold">
                  Notificações
                </Typography>
                {notificacoes.length > 0 && (
                  <Button
                    size="small"
                    onClick={abrirDialogoLimpar}
                    sx={{ textTransform: "none", color: "error.main" }}
                  >
                    Limpar Todas
                  </Button>
                )}
              </Box>
              <Divider />
              {notificacoes.length > 0 ? (
                notificacoes.map((notificacao) => (
                  <MenuItem
                    key={notificacao.id}
                    onClick={() => handleMarcarComoLida(notificacao.id)}
                    sx={{
                      backgroundColor: notificacao.lida
                        ? "transparent"
                        : "rgba(0, 100, 255, 0.08)",
                      whiteSpace: "normal",
                      py: 1.5,
                      borderBottom: "1px solid #f0f0f0",
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: "36px",
                        mr: 1,
                        alignSelf: "flex-start",
                        mt: "4px",
                        color: "text.secondary",
                      }}
                    >
                      {getConquistaIcon(notificacao.conquista?.tipo_condicao)}
                    </ListItemIcon>
                    <ListItemText
                      primary={notificacao.mensagem}
                      primaryTypographyProps={{
                        sx: {
                          fontWeight: notificacao.lida ? "normal" : "bold",
                        },
                      }}
                    />
                    <Tooltip title="Remover notificação">
                      <IconButton
                        size="small"
                        onClick={(e) => handleApagar(e, notificacao.id)}
                        sx={{ ml: 1, alignSelf: "center" }}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>Nenhuma notificação nova</MenuItem>
              )}
            </Menu>

            <Button
              color="inherit"
              variant="outlined"
              onClick={handleLogout}
              sx={{
                borderColor: "rgba(255, 255, 255, 0.5)",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  borderColor: "white",
                },
              }}
            >
              Sair
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Dialog open={dialogoLimparAberto} onClose={fecharDialogoLimpar}>
        <DialogTitle>Limpar Todas as Notificações?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Esta ação é irreversível. Você tem certeza que deseja apagar todas
            as suas notificações?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={fecharDialogoLimpar}>Cancelar</Button>
          <Button onClick={handleConfirmarLimparTodas} color="error" autoFocus>
            Confirmar e Apagar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default Navegacao;

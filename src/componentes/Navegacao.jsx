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
  Menu as MenuIcon, // Adicionado para o menu hambúrguer em telas pequenas
} from "@mui/icons-material";

// Mapeamento de tipos de condição para ícones
const iconMap = {
  SHOWS: MusicNoteIcon,
  RECEITA: AttachMoneyIcon,
  CONTATO: PeopleIcon,
};

function Navegacao() {
  const { usuario, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [notificacoes, setNotificacoes] = useState([]);
  const [anchorElNotificacoes, setAnchorElNotificacoes] = useState(null); // Menu de notificações
  const [anchorElNav, setAnchorElNav] = useState(null); // Menu de navegação (para responsividade)
  const [dialogoLimparAberto, setDialogoLimparAberto] = useState(false);

  const openNotificacoes = Boolean(anchorElNotificacoes);
  const openNav = Boolean(anchorElNav);
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
    // Atualiza a cada 30 segundos
    const intervalId = setInterval(buscarNotificacoes, 30000);
    return () => clearInterval(intervalId);
  }, [usuario]);

  const handleMenuNotificacoesOpen = (event) => {
    setAnchorElNotificacoes(event.currentTarget);
  };

  const handleMenuNotificacoesClose = () => {
    setAnchorElNotificacoes(null);
  };

  const handleMenuNavOpen = (event) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleMenuNavClose = () => {
    setAnchorElNav(null);
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

  const handleMarcarTodasComoLidas = async () => {
    try {
      await apiClient.patch("/api/notificacoes/marcar-todas-lidas");
      setNotificacoes((notificacoesAtuais) =>
        notificacoesAtuais.map((n) => ({ ...n, lida: true }))
      );
      handleMenuNotificacoesClose();
    } catch (error) {
      console.error("Erro ao marcar todas as notificações como lidas", error);
    }
  };

  const handleApagar = async (e, notificacaoId) => {
    e.stopPropagation(); // Impede que o clique no botão feche o menu ou marque como lida
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
    handleMenuNotificacoesClose();
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
    
    // Encontra o ícone correspondente ou usa MilitaryTechIcon como padrão para conquistas
    const IconComponent = Object.keys(iconMap).find(key => tipoCondicao.includes(key))
                           ? iconMap[Object.keys(iconMap).find(key => tipoCondicao.includes(key))]
                           : MilitaryTechIcon;
    
    return <IconComponent fontSize="small" />;
  };

  const activeLinkStyle = {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  };

  const navLinks = [
    { to: "/", text: "Agenda" },
    { to: "/financeiro", text: "Financeiro" },
    { to: "/repertorios", text: "Repertórios" },
    { to: "/equipamentos", text: "Equipamentos" },
    { to: "/contatos", text: "Contatos" },
    { to: "/conquistas", text: "Conquistas" },
  ];

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

          {/* Botão de Menu para telas pequenas */}
          <Box sx={{ display: { xs: "block", md: "none" } }}>
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={handleMenuNavOpen}
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={openNav}
              onClose={handleMenuNavClose}
            >
              {navLinks.map((link) => (
                <MenuItem 
                  key={link.to} 
                  component={RouterLink} 
                  to={link.to} 
                  onClick={handleMenuNavClose}
                  style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}
                >
                  {link.text}
                </MenuItem>
              ))}
              {usuario?.role === "admin" && (
                <MenuItem
                  component={RouterLink}
                  to="/admin/usuarios"
                  onClick={handleMenuNavClose}
                  style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}
                >
                  Admin
                </MenuItem>
              )}
            </Menu>
          </Box>

          {/* Links de navegação para telas médias e grandes */}
          <Box sx={{ display: { xs: "none", md: "flex" } }}>
            {navLinks.map((link) => (
              <Button
                key={link.to}
                component={RouterLink}
                to={link.to}
                sx={{ color: "white", mx: 1 }}
                style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}
              >
                {link.text}
              </Button>
            ))}
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

          <Box sx={{ flexGrow: 1 }} /> {/* Empurra os itens para a direita */}

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {/* Nome do usuário visível em telas maiores */}
            <Typography sx={{ display: { xs: "none", sm: "block" } }}>
              Olá, {usuario?.nome}
            </Typography>

            {/* Ícone de Notificações */}
            <Tooltip title="Notificações">
              <IconButton color="inherit" onClick={handleMenuNotificacoesOpen}>
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
              anchorEl={anchorElNotificacoes}
              open={openNotificacoes}
              onClose={handleMenuNotificacoesClose}
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
                <Box>
                  {naoLidasCount > 0 && (
                    <Button
                      size="small"
                      onClick={handleMarcarTodasComoLidas}
                      sx={{ textTransform: "none", color: "primary.main", mr: 1 }}
                    >
                      Marcar todas como lidas
                    </Button>
                  )}
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
                <Box sx={{ p: 2, textAlign: "center", color: "text.secondary" }}>
                  <NotificationsIcon sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="body2">
                    Você não tem nenhuma notificação nova.
                  </Typography>
                </Box>
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
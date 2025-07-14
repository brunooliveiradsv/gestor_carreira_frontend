// src/componentes/Navegacao.jsx

import React, { useContext, useState, useEffect } from "react";
import { NavLink as RouterLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../contextos/AuthContext.jsx";
import apiClient from "../api";

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
  useTheme,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  Avatar,
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
  Menu as MenuIcon,
  Logout as LogoutIcon,
  AdminPanelSettings as AdminPanelSettingsIcon,
  Dashboard as DashboardIcon, 
  CalendarMonth as CalendarMonthIcon,
  MonetizationOn as MonetizationOnIcon,
  LibraryMusic as LibraryMusicIcon,
  Piano as PianoIcon,
  Contacts as ContactsIcon,
  EmojiEvents as EmojiEventsIcon,
} from "@mui/icons-material";

// Mapeamento de tipos de condição para ícones de notificação
const iconMapNotificacao = {
  SHOWS: MusicNoteIcon,
  RECEITA: AttachMoneyIcon,
  CONTATO: PeopleIcon,
};

function Navegacao() {
  const { usuario, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const theme = useTheme();

  const [notificacoes, setNotificacoes] = useState([]);
  const [anchorElNotificacoes, setAnchorElNotificacoes] = useState(null);
  const [dialogoLimparAberto, setDialogoLimparAberto] = useState(false);
  const [drawerAberto, setDrawerAberto] = useState(false);

  const openNotificacoes = Boolean(anchorElNotificacoes);
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

  const toggleDrawer = (aberto) => (event) => {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }
    setDrawerAberto(aberto);
  };

  const handleMenuNotificacoesOpen = (event) =>
    setAnchorElNotificacoes(event.currentTarget);
  const handleMenuNotificacoesClose = () => setAnchorElNotificacoes(null);

  const handleMarcarComoLida = async (notificacaoId) => {
    const notificacao = notificacoes.find((n) => n.id === notificacaoId);
    if (notificacao && !notificacao.lida) {
      try {
        await apiClient.patch(`/api/notificacoes/${notificacaoId}/lida`);
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
    e.stopPropagation();
    try {
      await apiClient.delete(`/api/notificacoes/${notificacaoId}`);
      setNotificacoes(notificacoes.filter((n) => n.id !== notificacaoId));
    } catch (error) {
      console.error("Erro ao apagar notificação", error);
    }
  };

  const abrirDialogoLimpar = () => {
    handleMenuNotificacoesClose();
    setDialogoLimparAberto(true);
  };

  const fecharDialogoLimpar = () => setDialogoLimparAberto(false);

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
    const IconComponent = Object.keys(iconMapNotificacao).find((key) =>
      tipoCondicao.includes(key)
    )
      ? iconMapNotificacao[
          Object.keys(iconMapNotificacao).find((key) =>
            tipoCondicao.includes(key)
          )
        ]
      : MilitaryTechIcon;
    return <IconComponent fontSize="small" />;
  };

  const activeLinkStyle = {
    backgroundColor: theme.palette.action.selected,
  };

  const navLinks = [
    { to: "/", text: "Dashboard", icon: <DashboardIcon /> },
    { to: "/agenda", text: "Agenda", icon: <CalendarMonthIcon /> },
    { to: "/financeiro", text: "Financeiro", icon: <MonetizationOnIcon /> },
    { to: "/repertorios", text: "Repertórios", icon: <LibraryMusicIcon /> },
    { to: "/equipamentos", text: "Equipamentos", icon: <PianoIcon /> },
    { to: "/contatos", text: "Contatos", icon: <ContactsIcon /> },
    { to: "/conquistas", text: "Conquistas", icon: <EmojiEventsIcon /> },
  ];

  const drawerContent = (
    <Box
      sx={{
        width: 270,
        bgcolor: "background.paper",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <Box
        sx={{
          p: 2,
          textAlign: "center",
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Avatar
          sx={{
            width: 80,
            height: 80,
            margin: "0 auto 16px",
            bgcolor: "primary.main",
            color: "primary.contrastText",
          }}
        >
          {usuario?.nome?.charAt(0).toUpperCase()}
        </Avatar>
        <Typography variant="h6">{usuario?.nome}</Typography>
        <Typography variant="body2" color="text.secondary">
          {usuario?.email}
        </Typography>
      </Box>
      <List sx={{ flexGrow: 1 }}>
        {navLinks.map((link) => (
          <ListItem key={link.text} disablePadding>
            <ListItemButton
              component={RouterLink}
              to={link.to}
              style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}
            >
              <ListItemIcon sx={{ color: "inherit" }}>{link.icon}</ListItemIcon>
              <ListItemText primary={link.text} />
            </ListItemButton>
          </ListItem>
        ))}
        {usuario?.role === "admin" && (
          <ListItem disablePadding>
            <ListItemButton
              component={RouterLink}
              to="/admin/usuarios"
              style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}
            >
              <ListItemIcon sx={{ color: "inherit" }}>
                <AdminPanelSettingsIcon />
              </ListItemIcon>
              <ListItemText primary="Admin" />
            </ListItemButton>
          </ListItem>
        )}
      </List>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton component={RouterLink} to="/configuracoes">
            <ListItemIcon sx={{ color: "inherit" }}>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText primary="Configurações" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout}>
            <ListItemIcon sx={{ color: "inherit" }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Sair" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
      <AppBar
        position="static"
        sx={{
          background: theme.palette.background.paper,
          boxShadow: theme.shadows[3],
        }}
      >
        <Toolbar>
          <Box sx={{ display: { xs: "block", md: "none" }, mr: 1 }}>
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={toggleDrawer(true)}
            >
              <MenuIcon />
            </IconButton>
          </Box>

          <Box
            component={RouterLink}
            to="/"
            sx={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              color: 'inherit'
            }}
          >
            <Typography
              variant="h6"
              component="span"
              sx={{
                mr: 0.5,
                fontWeight: 'bold',
                color: 'primary.main',
              }}
            >
              VOX
            </Typography>
            <Typography
              variant="subtitle1"
              component="span"
               sx={{
                fontWeight: 'normal',
                color: 'text.primary',
              }}
            >
              Gest
            </Typography>
          </Box>


          {/* Links de navegação para telas médias e grandes */}
          <Box sx={{ display: { xs: "none", md: "flex" }, ml: 4 }}>
            {navLinks.map((link) => (
              <Button
                key={link.to}
                component={RouterLink}
                to={link.to}
                sx={{ color: "text.primary", mx: 1 }}
                style={({ isActive }) =>
                  isActive ? activeLinkStyle : undefined
                }
              >
                {link.text}
              </Button>
            ))}
            {usuario?.role === "admin" && (
              <Button
                component={RouterLink}
                to="/admin/usuarios"
                sx={{ color: "text.primary", mx: 1 }}
                style={({ isActive }) =>
                  isActive ? activeLinkStyle : undefined
                }
              >
                Admin
              </Button>
            )}
          </Box>

          {/* O espaçador agora fica AQUI, empurrando o que vem depois para a direita */}
          <Box sx={{ flexGrow: 1 }} />

          {/* Ícones do lado direito */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: { xs: 0.5, sm: 1 },
            }}
          >
            <Typography
              sx={{
                display: { xs: "none", sm: "block" },
                color: "text.primary",
                mr: 1,
              }}
            >
              Olá, {usuario?.nome}
            </Typography>

            <Tooltip title="Notificações">
              <IconButton color="inherit" onClick={handleMenuNotificacoesOpen}>
                <Badge badgeContent={naoLidasCount} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>

            <Tooltip title="Configurações">
              <IconButton
                color="inherit"
                component={RouterLink}
                to="/configuracoes"
                sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
              >
                <SettingsIcon />
              </IconButton>
            </Tooltip>

            <Button
              variant="outlined"
              onClick={handleLogout}
              color="primary"
              sx={{ display: { xs: "none", md: "flex" } }}
            >
              Sair
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer anchor="left" open={drawerAberto} onClose={toggleDrawer(false)}>
        {drawerContent}
      </Drawer>

      <Menu
        anchorEl={anchorElNotificacoes}
        open={openNotificacoes}
        onClose={handleMenuNotificacoesClose}
        PaperProps={{
          sx: {
            maxHeight: 400,
            width: { xs: "calc(100vw - 32px)", sm: "400px" },
            mt: 1,
            bgcolor: "background.paper",
            boxShadow: theme.shadows[6],
          },
        }}
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
          <Typography
            variant="subtitle1"
            fontWeight="bold"
            sx={{ color: "text.primary" }}
          >
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
        <Divider sx={{ borderColor: "divider" }} />
        {notificacoes.length > 0 ? (
          notificacoes.map((notificacao) => (
            <MenuItem
              key={notificacao.id}
              onClick={() => handleMarcarComoLida(notificacao.id)}
              sx={{
                backgroundColor: notificacao.lida
                  ? "transparent"
                  : "action.hover",
                whiteSpace: "normal",
                py: 1.5,
                borderBottom: `1px solid ${theme.palette.divider}`,
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
                    color: "text.primary",
                  },
                }}
              />
              <Tooltip title="Remover notificação">
                <IconButton
                  size="small"
                  onClick={(e) => handleApagar(e, notificacao.id)}
                  sx={{ ml: 1, alignSelf: "center", color: "action.active" }}
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

      <Dialog
        open={dialogoLimparAberto}
        onClose={fecharDialogoLimpar}
        PaperProps={{
          sx: { bgcolor: "background.paper", boxShadow: theme.shadows[6] },
        }}
      >
        <DialogTitle sx={{ color: "text.primary" }}>
          Limpar Todas as Notificações?
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: "text.secondary" }}>
            Esta ação é irreversível. Você tem certeza que deseja apagar todas
            as suas notificações?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={fecharDialogoLimpar}
            sx={{ color: "text.secondary" }}
          >
            Cancelar
          </Button>
          <Button onClick={handleConfirmarLimparTodas} color="error" autoFocus>
            Confirmar e Apagar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default Navegacao;
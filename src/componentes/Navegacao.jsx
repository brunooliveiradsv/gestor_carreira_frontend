import React, { useContext, useState, useEffect, useCallback } from "react";
import { NavLink as RouterLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../contextos/AuthContext.jsx";
import apiClient from '../apiClient';
import {
  AppBar, Toolbar, Typography, Box, IconButton, Badge, Menu,
  MenuItem, Tooltip, Divider, ListItemIcon, ListItemText, Dialog,
  DialogActions, DialogContent, DialogContentText, DialogTitle,
  useTheme, Drawer, List, ListItem, ListItemButton, Avatar, Button, Chip
} from "@mui/material";
import {
  Notifications as NotificationsIcon, Close as CloseIcon, MilitaryTech as MilitaryTechIcon,
  MusicNote as MusicNoteIcon, AttachMoney as AttachMoneyIcon, People as PeopleIcon,
  Settings as SettingsIcon, Menu as MenuIcon, Logout as LogoutIcon,
  AdminPanelSettings as AdminPanelSettingsIcon, Dashboard as DashboardIcon, CalendarMonth as CalendarMonthIcon,
  MonetizationOn as MonetizationOnIcon, LibraryMusic as LibraryMusicIcon, Piano as PianoIcon,
  Contacts as ContactsIcon, PlaylistAddCheck as PlaylistAddCheckIcon,
  EmojiEvents as EmojiEventsIcon,
  Announcement as MuralIcon,
  WorkspacePremium as WorkspacePremiumIcon,
  DoneAll as DoneAllIcon,
  DeleteSweep as DeleteSweepIcon,
  Lock as LockIcon
} from "@mui/icons-material";
import { useUpgradeDialog } from "../contextos/UpgradeDialogContext.jsx";

const iconMapNotificacao = {
  SHOWS: MusicNoteIcon,
  RECEITA: AttachMoneyIcon,
  CONTATO: PeopleIcon,
};

function Navegacao() {
  const { usuario, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const theme = useTheme();
  const { abrirDialogoDeUpgrade } = useUpgradeDialog();

  const [notificacoes, setNotificacoes] = useState([]);
  const [anchorElNotificacoes, setAnchorElNotificacoes] = useState(null);
  const [dialogoLimparAberto, setDialogoLimparAberto] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const openNotificacoes = Boolean(anchorElNotificacoes);
  const naoLidasCount = notificacoes.filter((n) => !n.lida).length;
  const drawerWidth = 270;

  const buscarNotificacoes = useCallback(async () => {
    if (!usuario) return;
    try {
      const resposta = await apiClient.get("/api/notificacoes");
      setNotificacoes(resposta.data);
    } catch (error) {
      console.error("Erro ao buscar notificações", error);
    }
  }, [usuario]);

  useEffect(() => {
    buscarNotificacoes();
    const intervalId = setInterval(buscarNotificacoes, 30000);
    return () => clearInterval(intervalId);
  }, [buscarNotificacoes]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuNotificacoesOpen = (event) => setAnchorElNotificacoes(event.currentTarget);
  const handleMenuNotificacoesClose = () => setAnchorElNotificacoes(null);

  const handleMarcarComoLida = async (notificacaoId) => {
    const notificacao = notificacoes.find((n) => n.id === notificacaoId);
    if (notificacao && !notificacao.lida) {
      try {
        await apiClient.patch(`/api/notificacoes/${notificacaoId}/lida`);
        setNotificacoes((atuais) => atuais.map((n) => n.id === notificacaoId ? { ...n, lida: true } : n));
      } catch (error) {
        console.error("Erro ao marcar notificação como lida", error);
      }
    }
  };

  const handleMarcarTodasComoLidas = async () => {
    try {
      await apiClient.patch("/api/notificacoes/marcar-todas-lidas");
      setNotificacoes((atuais) => atuais.map((n) => ({ ...n, lida: true })));
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
    const Icone = Object.keys(iconMapNotificacao).find(key => tipoCondicao.includes(key))
        ? iconMapNotificacao[Object.keys(iconMapNotificacao).find(key => tipoCondicao.includes(key))]
        : MilitaryTechIcon;
    return <Icone fontSize="small" />;
  };

  const handleMuralClick = () => {
    if (usuario?.plano !== 'premium') {
        abrirDialogoDeUpgrade('O Painel Showcase é uma funcionalidade exclusiva do plano Premium.');
    } else {
        navigate('/mural');
    }
    if(mobileOpen) handleDrawerToggle();
  }

  const navLinks = [
    { to: "/", text: "Dashboard", icon: <DashboardIcon /> },
    { to: "/agenda", text: "Agenda", icon: <CalendarMonthIcon /> },
    { to: "/financeiro", text: "Financeiro", icon: <MonetizationOnIcon /> },
    { to: "/repertorio", text: "Repertório", icon: <LibraryMusicIcon /> },
    { to: "/setlists", text: "Setlists", icon: <PlaylistAddCheckIcon /> },
    { to: "/equipamentos", text: "Equipamentos", icon: <PianoIcon /> },
    { to: "/contatos", text: "Contatos", icon: <ContactsIcon /> },
    { to: "/conquistas", text: "Conquistas", icon: <EmojiEventsIcon /> },
  ];

  let fotoUrlCompleta = null;
  if (usuario?.foto_url) {
    fotoUrlCompleta = usuario.foto_url.startsWith('http')
        ? usuario.foto_url
        : `${apiClient.defaults.baseURL}${usuario.foto_url}`;
  }
  
  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
         <Box component={RouterLink} to="/" sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit', mb: 3 }}>
            <Typography variant="h4" component="span" sx={{ mr: 0.5, fontWeight: 'bold', color: 'primary.main' }}>VOX</Typography>
            <Typography variant="h5" component="span" sx={{ fontWeight: 'normal', color: 'text.primary' }}>Gest</Typography>
          </Box>
        <Avatar
          src={fotoUrlCompleta}
          sx={{ width: 80, height: 80, mb: 2, bgcolor: 'primary.main', fontSize: '2.5rem' }}
        >
          {usuario?.nome?.charAt(0).toUpperCase()}
        </Avatar>
        <Typography variant="h6">{usuario?.nome}</Typography>
        <Typography variant="body2" color="text.secondary">{usuario?.email}</Typography>
      </Box>
      <Divider />
      <List sx={{ p: 1, overflowY: 'auto', flexGrow: 1 }}>
        {navLinks.map((link) => (
            <ListItem key={link.text} disablePadding sx={{ my: 0.5 }}>
                <ListItemButton component={RouterLink} to={link.to} onClick={handleDrawerToggle} sx={{ borderRadius: theme.shape.borderRadius, '&.active': { backgroundColor: theme.palette.action.selected, color: theme.palette.primary.main, '& .MuiListItemIcon-root': { color: theme.palette.primary.main } } }}>
                    <ListItemIcon>{link.icon}</ListItemIcon>
                    <ListItemText primary={link.text} />
                </ListItemButton>
            </ListItem>
        ))}

        <ListItem disablePadding sx={{ my: 0.5 }}>
            <ListItemButton onClick={handleMuralClick} sx={{ borderRadius: theme.shape.borderRadius }}>
                <ListItemIcon>{usuario.plano === 'premium' ? <MuralIcon /> : <LockIcon />}</ListItemIcon>
                <ListItemText primary="Painel Showcase" />
                {usuario.plano !== 'premium' && <Chip label="Premium" color="primary" size="small" />}
            </ListItemButton>
        </ListItem>

        {usuario?.role === "admin" && (
          <ListItem disablePadding sx={{ my: 0.5 }}>
            <ListItemButton component={RouterLink} to="/admin" onClick={handleDrawerToggle} sx={{ borderRadius: theme.shape.borderRadius, '&.active': { backgroundColor: theme.palette.action.selected, color: theme.palette.primary.main, '& .MuiListItemIcon-root': { color: theme.palette.primary.main } } }}>
              <ListItemIcon><AdminPanelSettingsIcon /></ListItemIcon>
              <ListItemText primary="Painel Admin" />
            </ListItemButton>
          </ListItem>
        )}
      </List>

      <Divider />
      <Box sx={{ display: { xs: 'none', md: 'block' } }}>
        <List sx={{ p: 1, flexShrink: 0 }}>
          <ListItem disablePadding>
            <ListItemButton component={RouterLink} to="/configuracoes" onClick={handleDrawerToggle} sx={{ borderRadius: theme.shape.borderRadius }}>
              <ListItemIcon><SettingsIcon /></ListItemIcon>
              <ListItemText primary="Configurações" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton onClick={handleLogout} sx={{ borderRadius: theme.shape.borderRadius }}>
              <ListItemIcon><LogoutIcon /></ListItemIcon>
              <ListItemText primary="Sair" />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </Box>
  );

  return (
    <>
      <AppBar position="fixed" elevation={0} sx={{ width: { md: `calc(100% - ${drawerWidth}px)` }, ml: { md: `${drawerWidth}px` }, borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Toolbar>
          <IconButton color="inherit" aria-label="open drawer" edge="start" onClick={handleDrawerToggle} sx={{ mr: 2, display: { md: 'none' } }} >
            <MenuIcon />
          </IconButton>
           <Box sx={{ flexGrow: 1 }} />

          <Tooltip title="Configurações">
            <IconButton color="inherit" onClick={() => navigate('/configuracoes')} sx={{ display: { xs: 'inline-flex', md: 'none' } }}>
              <SettingsIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Sair">
            <IconButton color="inherit" onClick={handleLogout} sx={{ display: { xs: 'inline-flex', md: 'none' } }}>
              <LogoutIcon />
            </IconButton>
          </Tooltip>

          <IconButton color="inherit" onClick={handleMenuNotificacoesOpen}>
            <Badge badgeContent={naoLidasCount} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
        </Toolbar>
      </AppBar>
      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
        <Drawer variant="temporary" open={mobileOpen} onClose={handleDrawerToggle} ModalProps={{ keepMounted: true }} sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth } }}>
          {drawerContent}
        </Drawer>
        <Drawer variant="permanent" sx={{ display: { xs: 'none', md: 'block' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: 'none' } }} open>
          {drawerContent}
        </Drawer>
      </Box>
      <Menu
        anchorEl={anchorElNotificacoes}
        open={openNotificacoes}
        onClose={handleMenuNotificacoesClose}
        PaperProps={{
          sx: {
            width: { xs: "calc(100vw - 32px)", sm: "400px" },
            mt: 1,
            bgcolor: "background.paper",
            boxShadow: theme.shadows[6],
            display: 'flex',
            flexDirection: 'column'
          }
        }}
      >
        <Box sx={{ px: 2, py: 1.5, flexShrink: 0 }}>
          <Typography variant="h6" fontWeight="bold" sx={{ color: "text.primary" }}>Notificações</Typography>
        </Box>
        <Divider sx={{ borderColor: "divider" }} />

        <Box sx={{ overflowY: 'auto', maxHeight: 320, flexGrow: 1 }}>
          {notificacoes.length > 0 ? (
            notificacoes.map((notificacao) => (
              <MenuItem key={notificacao.id} onClick={() => handleMarcarComoLida(notificacao.id)} sx={{ backgroundColor: notificacao.lida ? "transparent" : "action.hover", whiteSpace: "normal", py: 1.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
                <ListItemIcon sx={{ minWidth: "36px", mr: 1, alignSelf: "flex-start", mt: "4px", color: "text.secondary" }}>{getConquistaIcon(notificacao.conquista?.tipo_condicao)}</ListItemIcon>
                <ListItemText primary={notificacao.mensagem} primaryTypographyProps={{ sx: { fontWeight: notificacao.lida ? "normal" : "bold", color: "text.primary" } }} />
                <Tooltip title="Remover notificação">
                  <IconButton size="small" onClick={(e) => handleApagar(e, notificacao.id)} sx={{ ml: 1, alignSelf: "center", color: "action.active" }}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </MenuItem>
            ))
          ) : (
            <Box sx={{ p: 4, textAlign: "center", color: "text.secondary" }}>
              <NotificationsIcon sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="body2">Você não tem nenhuma notificação nova.</Typography>
            </Box>
          )}
        </Box>

        {notificacoes.length > 0 && (
            <>
                <Divider sx={{ borderColor: "divider" }} />
                <Box sx={{ p: 1, display: 'flex', justifyContent: 'space-around', flexShrink: 0 }}>
                    <Tooltip title="Marcar todas como lidas">
                        <span>
                            <IconButton onClick={handleMarcarTodasComoLidas} disabled={naoLidasCount === 0}>
                                <DoneAllIcon />
                            </IconButton>
                        </span>
                    </Tooltip>
                    <Tooltip title="Limpar todas as notificações">
                        <IconButton onClick={abrirDialogoLimpar} color="error">
                            <DeleteSweepIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
            </>
        )}
      </Menu>

      <Dialog open={dialogoLimparAberto} onClose={fecharDialogoLimpar} PaperProps={{ sx: { bgcolor: "background.paper", boxShadow: theme.shadows[6] } }}>
        <DialogTitle sx={{ color: "text.primary" }}>Limpar Todas as Notificações?</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: "text.secondary" }}>
            Esta ação é irreversível. Você tem certeza que deseja apagar todas as suas notificações?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={fecharDialogoLimpar} sx={{ color: "text.secondary" }}>Cancelar</Button>
          <Button onClick={handleConfirmarLimparTodas} color="error" autoFocus>Confirmar e Apagar</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default Navegacao;
// src/componentes/Navegacao.jsx
import React, { useContext, useState, useEffect, useCallback } from "react";
import { NavLink as RouterLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../contextos/AuthContext.jsx";
import apiClient from "../api";
import {
  AppBar, Toolbar, Typography, Box, IconButton, Badge, Menu,
  MenuItem, Tooltip, Divider, ListItemIcon, ListItemText, Dialog,
  DialogActions, DialogContent, DialogContentText, DialogTitle,
  useTheme, Drawer, List, ListItem, ListItemButton, Avatar, Button
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
  DeleteSweep as DeleteSweepIcon
} from "@mui/icons-material";

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
  const handleMarcarComoLida = async (notificacaoId) => { /* ... (sem alterações) ... */ };
  const handleMarcarTodasComoLidas = async () => { /* ... (sem alterações) ... */ };
  const handleApagar = async (e, notificacaoId) => { /* ... (sem alterações) ... */ };
  const abrirDialogoLimpar = () => { /* ... (sem alterações) ... */ };
  const fecharDialogoLimpar = () => setDialogoLimparAberto(false);
  const handleConfirmarLimparTodas = async () => { /* ... (sem alterações) ... */ };
  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  const getConquistaIcon = (tipoCondicao) => { /* ... (sem alterações) ... */ };
  const navLinks = [ /* ... (sem alterações) ... */ ];
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
            <ListItemButton component={RouterLink} to={link.to} sx={{ borderRadius: theme.shape.borderRadius, '&.active': { backgroundColor: theme.palette.action.selected, color: theme.palette.primary.main, '& .MuiListItemIcon-root': { color: theme.palette.primary.main } } }}>
              <ListItemIcon>{link.icon}</ListItemIcon>
              <ListItemText primary={link.text} />
            </ListItemButton>
          </ListItem>
        ))}
        {usuario?.role === "admin" && (
          <ListItem disablePadding sx={{ my: 0.5 }}>
            <ListItemButton component={RouterLink} to="/admin" sx={{ borderRadius: theme.shape.borderRadius, '&.active': { backgroundColor: theme.palette.action.selected, color: theme.palette.primary.main, '& .MuiListItemIcon-root': { color: theme.palette.primary.main } } }}>
              <ListItemIcon><AdminPanelSettingsIcon /></ListItemIcon>
              <ListItemText primary="Painel Admin" />
            </ListItemButton>
          </ListItem>
        )}
      </List>
      
      <Divider />
      {/* --- ALTERAÇÃO AQUI: Esconde os links no Drawer em ecrãs pequenos --- */}
      <Box sx={{ display: { xs: 'none', md: 'block' } }}>
        <List sx={{ p: 1, flexShrink: 0 }}>
          <ListItem disablePadding>
            <ListItemButton component={RouterLink} to="/configuracoes" sx={{ borderRadius: theme.shape.borderRadius }}>
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
          
          {/* --- ALTERAÇÃO AQUI: Adiciona os novos ícones apenas para mobile --- */}
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
        {/* ... (componentes Drawer sem alterações) ... */}
      </Box>
      <Menu anchorEl={anchorElNotificacoes} open={openNotificacoes} onClose={handleMenuNotificacoesClose} PaperProps={{ /* ... */ }}>
        {/* ... (conteúdo do Menu de Notificações sem alterações) ... */}
      </Menu>
      <Dialog open={dialogoLimparAberto} onClose={fecharDialogoLimpar} PaperProps={{ /* ... */ }}>
        {/* ... (conteúdo do Dialog de Limpar sem alterações) ... */}
      </Dialog>
    </>
  );
}

export default Navegacao;
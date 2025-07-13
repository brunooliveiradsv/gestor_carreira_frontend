// src/componentes/Navegacao.jsx

import React, { useContext, useState, useEffect } from "react";
import { NavLink as RouterLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../contextos/AuthContext.jsx"; // Caminho original correto
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
  useTheme, // Adicionado para acessar o tema
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
  const theme = useTheme(); // Hook para acessar o tema

  const [notificacoes, setNotificacoes] = useState([]);
  const [anchorElNotificacoes, setAnchorElNotificacoes] = useState(null);
  const [anchorElNav, setAnchorElNav] = useState(null);
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
    
    const IconComponent = Object.keys(iconMap).find(key => tipoCondicao.includes(key))
                           ? iconMap[Object.keys(iconMap).find(key => tipoCondicao.includes(key))]
                           : MilitaryTechIcon;
    
    return <IconComponent fontSize="small" />;
  };

  // Ajustado para usar as cores do tema
  const activeLinkStyle = {
    backgroundColor: theme.palette.action.selected, // Usa a cor de seleção do tema
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
        // Removendo background fixo. Usa a cor de fundo do Paper do tema para o AppBar
        sx={{ background: theme.palette.background.paper, boxShadow: theme.shadows[3] }} 
      >
        <Toolbar>
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{
              flexGrow: 1,
              fontWeight: "bold",
              // Cor do texto será herdada do tema (text.primary ou uma cor customizada para AppBar)
              color: theme.palette.primary.main, // Usando o verde vibrante para o título
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
              color="inherit" // Usa a cor de texto padrão do AppBar (do tema)
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
              PaperProps={{ // Estiliza o Paper do Menu
                sx: {
                  bgcolor: theme.palette.background.paper, // Fundo do menu como paper
                  boxShadow: theme.shadows[6],
                }
              }}
            >
              {navLinks.map((link) => (
                <MenuItem 
                  key={link.to} 
                  component={RouterLink} 
                  to={link.to} 
                  onClick={handleMenuNavClose}
                  style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}
                  sx={{ color: theme.palette.text.primary }} // Cor do texto do MenuItem
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
                  sx={{ color: theme.palette.text.primary }}
                >
                  Admin
                </MenuItem>
              )}
               <Divider sx={{ my: 0.5 }} />
              <MenuItem onClick={handleLogout} sx={{ color: theme.palette.text.primary }}>
                <ListItemIcon><NotificationsIcon sx={{ color: theme.palette.text.secondary }} /></ListItemIcon> {/* Apenas para um exemplo de ícone */}
                Sair
              </MenuItem>
            </Menu>
          </Box>

          {/* Links de navegação para telas médias e grandes */}
          <Box sx={{ display: { xs: "none", md: "flex" } }}>
            {navLinks.map((link) => (
              <Button
                key={link.to}
                component={RouterLink}
                to={link.to}
                sx={{ color: theme.palette.text.primary, mx: 1 }} // Usa a cor de texto principal do tema
                style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}
              >
                {link.text}
              </Button>
            ))}
            {usuario?.role === "admin" && (
              <Button
                component={RouterLink}
                to="/admin/usuarios"
                sx={{ color: theme.palette.text.primary, mx: 1 }}
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
            {/* Nome do usuário visível em telas maiores */}
            <Typography sx={{ display: { xs: "none", sm: "block" }, color: theme.palette.text.primary }}>
              Olá, {usuario?.nome}
            </Typography>

            {/* Ícone de Notificações */}
            <Tooltip title="Notificações">
              <IconButton color="inherit" onClick={handleMenuNotificacoesOpen}> {/* Cor do ícone será herdada do tema */}
                <Badge badgeContent={naoLidasCount} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>

            {/* Ícone de Configurações */}
            <Tooltip title="Configurações">
              <IconButton
                color="inherit" // Cor do ícone será herdada do tema
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
              PaperProps={{ 
                sx: { 
                  maxHeight: 400, 
                  width: { xs: 'calc(100vw - 32px)', sm: '400px' }, // Responsividade para mobile
                  mt: 1,
                  bgcolor: theme.palette.background.paper, // Fundo do menu como paper
                  boxShadow: theme.shadows[6],
                } 
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
                <Typography variant="subtitle1" fontWeight="bold" sx={{ color: theme.palette.text.primary }}>
                  Notificações
                </Typography>
                <Box>
                  {naoLidasCount > 0 && (
                    <Button
                      size="small"
                      onClick={handleMarcarTodasComoLidas}
                      sx={{ textTransform: "none", color: theme.palette.primary.main, mr: 1 }} // Cor do tema
                    >
                      Marcar todas como lidas
                    </Button>
                  )}
                  {notificacoes.length > 0 && (
                    <Button
                      size="small"
                      onClick={abrirDialogoLimpar}
                      sx={{ textTransform: "none", color: theme.palette.error.main }} // Cor do tema
                    >
                      Limpar Todas
                    </Button>
                  )}
                </Box>
              </Box>
              <Divider sx={{ borderColor: theme.palette.divider }} /> {/* Cor do divider do tema */}
              {notificacoes.length > 0 ? (
                notificacoes.map((notificacao) => (
                  <MenuItem
                    key={notificacao.id}
                    onClick={() => handleMarcarComoLida(notificacao.id)}
                    sx={{
                      backgroundColor: notificacao.lida
                        ? "transparent"
                        : theme.palette.action.hover, // Cor do tema para notificação não lida
                      whiteSpace: "normal",
                      py: 1.5,
                      borderBottom: `1px solid ${theme.palette.divider}`, // Cor do divider do tema
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: "36px",
                        mr: 1,
                        alignSelf: "flex-start",
                        mt: "4px",
                        color: theme.palette.text.secondary,
                      }}
                    >
                      {getConquistaIcon(notificacao.conquista?.tipo_condicao)}
                    </ListItemIcon>
                    <ListItemText
                      primary={notificacao.mensagem}
                      primaryTypographyProps={{
                        sx: {
                          fontWeight: notificacao.lida ? "normal" : "bold",
                          color: theme.palette.text.primary // Cor do texto da notificação
                        },
                      }}
                    />
                    <Tooltip title="Remover notificação">
                      <IconButton
                        size="small"
                        onClick={(e) => handleApagar(e, notificacao.id)}
                        sx={{ ml: 1, alignSelf: "center", color: theme.palette.action.active }} // Cor do ícone de remover
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </MenuItem>
                ))
              ) : (
                <Box sx={{ p: 2, textAlign: "center", color: theme.palette.text.secondary }}>
                  <NotificationsIcon sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="body2">
                    Você não tem nenhuma notificação nova.
                  </Typography>
                </Box>
              )}
            </Menu>

            <Button
              variant="outlined"
              onClick={handleLogout}
              color="primary" // Usa a cor primária do tema para o botão "Sair"
              sx={{
                // Removidas as cores de borda e hover fixas, pois 'color="primary"' já cuida disso para botões outlined
              }}
            >
              Sair
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Dialog open={dialogoLimparAberto} onClose={fecharDialogoLimpar} PaperProps={{ sx: { bgcolor: theme.palette.background.paper, boxShadow: theme.shadows[6] } }}>
        <DialogTitle sx={{ color: theme.palette.text.primary }}>Limpar Todas as Notificações?</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: theme.palette.text.secondary }}>
            Esta ação é irreversível. Você tem certeza que deseja apagar todas
            as suas notificações?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={fecharDialogoLimpar} sx={{ color: theme.palette.text.secondary }}>Cancelar</Button>
          <Button onClick={handleConfirmarLimparTodas} color="error" autoFocus>
            Confirmar e Apagar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default Navegacao;
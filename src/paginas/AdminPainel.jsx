// src/paginas/AdminPainel.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, Button } from '@mui/material';
import { People as PeopleIcon, LibraryMusic as LibraryMusicIcon, Announcement as AnnouncementIcon, History as HistoryIcon } from '@mui/icons-material';

// --- COMPONENTE AdminCard ATUALIZADO ---
// Agora ele não é mais um Grid item e controla o seu próprio tamanho no Flexbox
const AdminCard = ({ title, description, icon, linkTo }) => {
  const navigate = useNavigate();
  return (
    // O Box exterior define o comportamento do cartão dentro do contentor Flexbox
    <Box sx={{ flex: '1 1 300px', minWidth: '280px' }}>
      <Paper 
        sx={{ 
          p: 3, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          textAlign: 'center',
          height: '100%',
          justifyContent: 'space-between'
        }}
      >
        <Box>
          {icon}
          <Typography variant="h6" component="h2" fontWeight="bold" sx={{ mt: 2 }}>
            {title}
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1, mb: 2 }}>
            {description}
          </Typography>
        </Box>
        <Button variant="contained" onClick={() => navigate(linkTo)}>
          Acessar
        </Button>
      </Paper>
    </Box>
  );
};

function AdminPainel() {
  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Painel do Administrador
        </Typography>
        <Typography color="text.secondary">
          Gerencie os recursos globais e monitore a atividade do sistema.
        </Typography>
      </Box>

      {/* --- LAYOUT ATUALIZADO PARA USAR FLEXBOX --- */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        <AdminCard
          title="Gerenciar Usuários"
          description="Visualize, edite e remova usuários da plataforma."
          icon={<PeopleIcon color="primary" sx={{ fontSize: 40 }} />}
          linkTo="/admin/usuarios"
        />
        <AdminCard
          title="Gerenciar Músicas"
          description="Adicione ou edite as músicas do banco de dados mestre."
          icon={<LibraryMusicIcon color="primary" sx={{ fontSize: 40 }} />}
          linkTo="/admin/musicas"
        />
        <AdminCard
          title="Gerenciar Sugestões"
          description="Aprove ou rejeite as sugestões enviadas pelos usuários."
          icon={<AnnouncementIcon color="primary" sx={{ fontSize: 40 }} />}
          linkTo="/admin/sugestoes"
        />
        <AdminCard
          title="Log de Atividades"
          description="Visualize as ações recentes dos usuários na plataforma."
          icon={<HistoryIcon color="primary" sx={{ fontSize: 40 }} />}
          linkTo="/admin/logs"
        />
      </Box>
    </Box>
  );
}

export default AdminPainel;
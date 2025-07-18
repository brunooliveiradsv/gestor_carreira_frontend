// src/paginas/AdminPainel.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Grid, Paper, Button } from '@mui/material';
import { People as PeopleIcon, LibraryMusic as LibraryMusicIcon, Announcement as AnnouncementIcon } from '@mui/icons-material';

// Componente para os cartões de navegação do painel
const AdminCard = ({ title, description, icon, linkTo }) => {
  const navigate = useNavigate();
  return (
    <Grid item xs={12} sm={6} md={4}>
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
    </Grid>
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
          Gerencie os recursos globais do sistema.
        </Typography>
      </Box>

      <Grid container spacing={3}>
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
          description="Aprove ou rejeite as sugestões de melhoria enviadas pelos usuários."
          icon={<AnnouncementIcon color="primary" sx={{ fontSize: 40 }} />}
          linkTo="/admin/sugestoes" // Esta rota também precisará ser criada no App.jsx
        />
      </Grid>
    </Box>
  );
}

export default AdminPainel;
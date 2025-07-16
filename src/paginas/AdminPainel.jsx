// src/paginas/AdminPainel.jsx

import { useState } from 'react';
import { Box, Tabs, Tab, Container, Paper, Typography } from '@mui/material';
import AdminUsuarios from './AdminUsuarios.jsx'; // Reutilizamos a página que já existe
import AdminSugestoes from './AdminSugestoes.jsx'; // Reutilizamos a página que já existe
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import RateReviewIcon from '@mui/icons-material/RateReview';

// Um componente auxiliar para os painéis das abas
function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: { xs: 2, md: 3 } }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function AdminPainel() {
  const [abaAtiva, setAbaAtiva] = useState(0);

  const handleChange = (event, novaAba) => {
    setAbaAtiva(novaAba);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" fontWeight="bold" sx={{ mb: 2 }}>
            Painel de Administração
        </Typography>
        <Paper elevation={6}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={abaAtiva} onChange={handleChange} aria-label="Abas do painel de administração" variant="fullWidth">
                    <Tab icon={<SupervisorAccountIcon />} iconPosition="start" label="Gerir Utilizadores" id="admin-tab-0" />
                    <Tab icon={<RateReviewIcon />} iconPosition="start" label="Moderar Sugestões" id="admin-tab-1" />
                </Tabs>
            </Box>
            <TabPanel value={abaAtiva} index={0}>
                {/* O conteúdo da primeira aba será a nossa página de gestão de utilizadores */}
                <AdminUsuarios />
            </TabPanel>
            <TabPanel value={abaAtiva} index={1}>
                {/* O conteúdo da segunda aba será a nossa página de moderação */}
                <AdminSugestoes />
            </TabPanel>
        </Paper>
    </Container>
  );
}

export default AdminPainel;
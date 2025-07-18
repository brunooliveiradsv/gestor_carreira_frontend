// src/paginas/AdminPainel.jsx

import { useState } from 'react';
import { Box, Tabs, Tab, Typography, Paper } from '@mui/material';
import AdminUsuarios from './AdminUsuarios.jsx';
import AdminSugestoes from './AdminSugestoes.jsx';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import RateReviewIcon from '@mui/icons-material/RateReview';

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} id={`admin-tabpanel-${index}`} aria-labelledby={`admin-tab-${index}`} {...other}>
      {value === index && (<Box sx={{ p: { xs: 2, md: 3 } }}>{children}</Box>)}
    </div>
  );
}

function AdminPainel() {
  const [abaAtiva, setAbaAtiva] = useState(0);

  const handleChange = (event, novaAba) => {
    setAbaAtiva(novaAba);
  };

  return (
    <Box>
        <Box sx={{ mb: 4 }}>
            <Typography variant="h4" component="h1" fontWeight="bold">Painel de Administração</Typography>
            <Typography color="text.secondary">Gerencie usuários e modere o conteúdo do sistema.</Typography>
        </Box>
        <Paper>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={abaAtiva} onChange={handleChange} variant="fullWidth">
                    <Tab icon={<SupervisorAccountIcon />} iconPosition="start" label="Gerenciar Usuários" />
                    <Tab icon={<RateReviewIcon />} iconPosition="start" label="Moderar Sugestões" />
                </Tabs>
            </Box>
            <TabPanel value={abaAtiva} index={0}>
                <AdminUsuarios />
            </TabPanel>
            <TabPanel value={abaAtiva} index={1}>
                <AdminSugestoes />
            </TabPanel>
        </Paper>
    </Box>
  );
}

export default AdminPainel;
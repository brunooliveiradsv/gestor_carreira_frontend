import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Container, Typography, Grid, Paper, useTheme } from '@mui/material';
import { 
    CalendarMonth as CalendarMonthIcon, 
    MonetizationOn as MonetizationOnIcon, 
    LibraryMusic as LibraryMusicIcon,
    Mic as MicIcon
} from '@mui/icons-material';

// Componente para os cards de funcionalidades
const FeatureCard = ({ icon, title, description }) => {
    const theme = useTheme();
    return (
        <Paper variant="outlined" sx={{ p: 3, textAlign: 'center', height: '100%' }}>
            <Box sx={{ color: theme.palette.primary.main, mb: 2 }}>
                {icon}
            </Box>
            <Typography variant="h6" fontWeight="bold" gutterBottom>{title}</Typography>
            <Typography color="text.secondary">{description}</Typography>
        </Paper>
    );
};

function LandingPage() {
    const navigate = useNavigate();
    const theme = useTheme();

    return (
        <Box sx={{ bgcolor: 'background.default', color: 'text.primary' }}>
            {/* Secção Principal (Hero) */}
            <Box 
                sx={{ 
                    minHeight: '100vh', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    textAlign: 'center',
                    p: 3,
                    background: `linear-gradient(rgba(18, 18, 18, 0.7), rgba(18, 18, 18, 0.9)), url('https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                }}
            >
                <Container maxWidth="md">
                    <Typography variant="h1" component="h1" fontWeight="bold" sx={{ mb: 2, color: 'primary.main' }}>
                        VoxGest
                    </Typography>
                    <Typography variant="h4" component="p" sx={{ mb: 4, color: 'text.primary' }}>
                        O seu assistente de carreira musical, tudo num só lugar.
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 6, maxWidth: '700px', mx: 'auto', color: 'text.secondary' }}>
                        Desde a organização da sua agenda de shows e repertório até à gestão financeira e promoção do seu trabalho. O VoxGest foi feito para artistas que querem ir mais longe.
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
                        <Button variant="contained" color="primary" size="large" onClick={() => navigate('/login')}>
                            Criar Conta
                        </Button>
                        <Button variant="outlined" color="primary" size="large" onClick={() => navigate('/login')}>
                            Fazer Login
                        </Button>
                    </Box>
                </Container>
            </Box>

            {/* Secção de Funcionalidades */}
            <Container maxWidth="lg" sx={{ py: 8 }}>
                <Typography variant="h3" textAlign="center" fontWeight="bold" sx={{ mb: 6 }}>
                    Ferramentas Poderosas para a Sua Carreira
                </Typography>
                <Grid container spacing={4}>
                    <Grid item xs={12} sm={6} md={3}>
                        <FeatureCard 
                            icon={<CalendarMonthIcon sx={{ fontSize: 40 }} />}
                            title="Agenda Inteligente"
                            description="Nunca perca um compromisso. Organize shows, ensaios e reuniões com facilidade."
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <FeatureCard 
                            icon={<MonetizationOnIcon sx={{ fontSize: 40 }} />}
                            title="Controlo Financeiro"
                            description="Registe os seus cachês e despesas. Tenha uma visão clara da saúde financeira da sua carreira."
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <FeatureCard 
                            icon={<LibraryMusicIcon sx={{ fontSize: 40 }} />}
                            title="Gestão de Repertório"
                            description="Mantenha todas as suas músicas, cifras e setlists organizados e prontos para o palco."
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <FeatureCard 
                            icon={<MicIcon sx={{ fontSize: 40 }} />}
                            title="Página Showcase"
                            description="Uma página pública para os seus fãs verem as suas novidades, agenda e interagirem consigo."
                        />
                    </Grid>
                </Grid>
            </Container>

             {/* Secção Final (Call to Action) */}
            <Box sx={{ bgcolor: 'background.paper', py: 8, textAlign: 'center' }}>
                <Container maxWidth="sm">
                    <Typography variant="h4" fontWeight="bold" sx={{ mb: 4 }}>
                        Pronto para organizar a sua carreira?
                    </Typography>
                    <Button variant="contained" color="primary" size="large" onClick={() => navigate('/login')}>
                        Comece Agora Gratuitamente
                    </Button>
                </Container>
            </Box>
        </Box>
    );
}

export default LandingPage;
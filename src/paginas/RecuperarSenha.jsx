// src/paginas/RecuperarSenha.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api';

import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  TextField,
  CircularProgress,
  Alert,
  useTheme,
  Avatar,
} from '@mui/material';
import {
  LockReset as LockResetIcon,
  CheckCircleOutline,
} from '@mui/icons-material';

function RecuperarSenha() {
  const navigate = useNavigate();
  const theme = useTheme();

  const [email, setEmail] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  const handleSolicitarNovaSenha = async (e) => {
    e.preventDefault();
    setCarregando(true);
    setErro('');
    setSucesso('');
    try {
      // A rota do backend agora será /recuperar-senha
      await apiClient.post('/api/usuarios/recuperar-senha', { email });
      setSucesso('Se o e-mail estiver cadastrado em nosso sistema, uma nova senha foi enviada para ele. Verifique sua caixa de entrada e spam.');
    } catch (err) {
       // Por segurança, mesmo em caso de erro, mostramos uma mensagem genérica.
       // O erro real deve ser logado no console do servidor.
      console.error("Falha na solicitação de recuperação:", err);
      setSucesso('Se o e-mail estiver cadastrado em nosso sistema, uma nova senha foi enviada para ele. Verifique sua caixa de entrada e spam.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        width: '100vw',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(to right bottom, ${theme.palette.background.default}, ${theme.palette.background.paper})`,
      }}
    >
      <Container component="main" maxWidth="xs">
        <Paper
          elevation={12}
          sx={{
            padding: { xs: 2, sm: 4 },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            {sucesso ? <CheckCircleOutline /> : <LockResetIcon />}
          </Avatar>
          <Typography component="h1" variant="h5" sx={{ fontWeight: 'bold' }}>
            Recuperar Acesso
          </Typography>

          {erro && <Alert severity="error" sx={{ width: '100%', mt: 2, mb: 2 }}>{erro}</Alert>}
          
          {sucesso ? (
            <Alert severity="success" sx={{ width: '100%', mt: 2, textAlign: 'center' }}>
                {sucesso}
            </Alert>
          ) : (
             <>
                <Typography color="text.secondary" sx={{ mt: 1, mb: 2, textAlign: 'center' }}>
                    Digite seu e-mail e enviaremos uma nova senha provisória para você.
                </Typography>
                <Box component="form" onSubmit={handleSolicitarNovaSenha} noValidate sx={{ mt: 1, width: '100%' }}>
                    <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="email"
                    label="Endereço de E-mail"
                    name="email"
                    autoComplete="email"
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    />
                    <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={carregando}
                    sx={{ mt: 3, mb: 2, py: 1.5 }}
                    >
                    {carregando ? <CircularProgress size={24} color="inherit" /> : 'Enviar Nova Senha'}
                    </Button>
                </Box>
            </>
          )}

          <Button onClick={() => navigate('/login')} sx={{ mt: 2 }}>
              Voltar para o Login
          </Button>
        </Paper>
      </Container>
    </Box>
  );
}

export default RecuperarSenha;
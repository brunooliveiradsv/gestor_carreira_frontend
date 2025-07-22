// src/paginas/RecuperarSenha.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../apiClient';

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
  CheckCircleOutline as CheckCircleOutlineIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';

function RecuperarSenha() {
  const navigate = useNavigate();
  const theme = useTheme();

  const [email, setEmail] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(''); // Erro não está sendo usado, mas mantido para futuras implementações
  const [sucesso, setSucesso] = useState('');

  const handleSolicitarNovaSenha = async (e) => {
    e.preventDefault();
    setCarregando(true);
    setErro('');
    setSucesso('');
    try {
      await apiClient.post('/api/usuarios/recuperar-senha', { email });
      setSucesso('Se o e-mail estiver registado no nosso sistema, um link para redefinição de senha foi enviado. Verifique a sua caixa de entrada e spam.');
    } catch (err) {
      console.error("Falha na solicitação de recuperação:", err);
      // Por segurança, mesmo em caso de erro, mostramos a mesma mensagem de sucesso.
      setSucesso('Se o e-mail estiver registado no nosso sistema, um link para redefinição de senha foi enviado. Verifique a sua caixa de entrada e spam.');
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
        bgcolor: 'background.default'
      }}
    >
        <Paper
            elevation={0}
            sx={{
            p: { xs: 3, sm: 4, md: 5 },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            maxWidth: 450,
            border: `1px solid ${theme.palette.divider}`,
            bgcolor: 'background.paper'
            }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
            {sucesso ? <CheckCircleOutlineIcon /> : <LockResetIcon />}
          </Avatar>
          <Typography component="h1" variant="h5" sx={{ fontWeight: 'bold' }}>
            Recuperar Acesso
          </Typography>

          {sucesso ? (
            <Box sx={{width: '100%', mt: 3, textAlign: 'center'}}>
                <Alert severity="success" sx={{ mb: 3 }}>
                    {sucesso}
                </Alert>
                <Button variant="contained" onClick={() => navigate('/login')}>
                    Voltar para o Login
                </Button>
            </Box>
          ) : (
             <>
                <Typography color="text.secondary" sx={{ mt: 1, mb: 3, textAlign: 'center' }}>
                    Não se preocupe! Digite seu e-mail e enviaremos as instruções para redefinir sua senha.
                </Typography>
                <Box component="form" onSubmit={handleSolicitarNovaSenha} noValidate sx={{ width: '100%' }}>
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
                    {carregando ? <CircularProgress size={24} color="inherit" /> : 'Enviar Link de Recuperação'}
                    </Button>
                </Box>
            </>
          )}
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/login')} sx={{ mt: 3 }} disabled={carregando}>
            Voltar para o Login
        </Button>
        </Paper>
    </Box>
  );
}

export default RecuperarSenha;
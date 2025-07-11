// src/componentes/FormularioUsuario.jsx

import { useState } from 'react';
import { Box, Button, TextField, Select, MenuItem, FormControl, InputLabel, Typography, Paper, CircularProgress } from '@mui/material';

function FormularioUsuario({ onSave, onCancel, carregando }) {
  const [dadosForm, setDadosForm] = useState({
    nome: '',
    email: '',
    senha: '',
    role: 'usuario',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDadosForm(dadosAtuais => ({ ...dadosAtuais, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(dadosForm);
  };

  return (
    <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="h6">Novo Usuário</Typography>
        <TextField name="nome" label="Nome Completo" value={dadosForm.nome} onChange={handleChange} required fullWidth />
        <TextField name="email" label="E-mail" type="email" value={dadosForm.email} onChange={handleChange} required fullWidth />
        <TextField name="senha" label="Senha Provisória" type="password" value={dadosForm.senha} onChange={handleChange} required fullWidth />
        <FormControl fullWidth>
          <InputLabel id="role-select-label">Nível de Acesso</InputLabel>
          <Select
            labelId="role-select-label"
            name="role"
            label="Nível de Acesso"
            value={dadosForm.role}
            onChange={handleChange}
          >
            <MenuItem value="usuario">Usuário</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
          </Select>
        </FormControl>
        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <Button type="submit" variant="contained" disabled={carregando}>
            {carregando ? <CircularProgress size={24} /> : 'Salvar Usuário'}
          </Button>
          <Button type="button" variant="text" onClick={onCancel}>Cancelar</Button>
        </Box>
      </Box>
    </Paper>
  );
}

export default FormularioUsuario;
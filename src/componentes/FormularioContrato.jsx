// src/componentes/FormularioContrato.jsx
import React, { useState } from 'react';
import { Box, Button, TextField, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, CircularProgress } from '@mui/material';

function FormularioContrato({ open, onClose, onGerarContrato, carregando }) {
  const [dados, setDados] = useState({ nome: '', nif: '', morada: '' });

  const handleChange = (e) => {
    setDados({ ...dados, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onGerarContrato(dados);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <Box component="form" onSubmit={handleSubmit}>
        <DialogTitle>Gerar Contrato</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Preencha os dados do contratante para gerar o contrato em PDF.
          </DialogContentText>
          <TextField autoFocus name="nome" label="Nome Completo do Contratante" fullWidth required sx={{ mb: 2 }} value={dados.nome} onChange={handleChange} />
          <TextField name="nif" label="NIF / CPF do Contratante" fullWidth required sx={{ mb: 2 }} value={dados.nif} onChange={handleChange} />
          <TextField name="morada" label="Morada do Contratante" fullWidth required value={dados.morada} onChange={handleChange} />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="contained" disabled={carregando}>
            {carregando ? <CircularProgress size={24} /> : 'Gerar e Descarregar PDF'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
export default FormularioContrato;
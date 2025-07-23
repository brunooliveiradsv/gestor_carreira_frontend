// src/componentes/FormularioContrato.jsx
import React, { useState } from 'react';
import { Box, Button, TextField, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, CircularProgress, Grid } from '@mui/material';

function FormularioContrato({ open, onClose, onGerarContrato, carregando }) {
  // --- NOVOS CAMPOS ADICIONADOS AO ESTADO ---
  const [dados, setDados] = useState({ 
    nome: '', 
    nif: '', 
    morada: '',
    forma_pagamento: '', // Novo
    cidade_foro: '',     // Novo
    estado_foro: ''      // Novo
  });

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
            Preencha os dados abaixo para gerar o contrato em PDF.
          </DialogContentText>
          <TextField autoFocus name="nome" label="Nome Completo do Contratante" fullWidth required sx={{ mb: 2 }} value={dados.nome} onChange={handleChange} />
          <TextField name="nif" label="CPF/CNPJ do Contratante" fullWidth required sx={{ mb: 2 }} value={dados.nif} onChange={handleChange} />
          <TextField name="morada" label="Endereço do Contratante" fullWidth required sx={{ mb: 2 }} value={dados.morada} onChange={handleChange} />
          
          {/* --- NOVOS CAMPOS ADICIONADOS AO FORMULÁRIO --- */}
          <TextField 
            name="forma_pagamento" 
            label="Forma de Pagamento" 
            placeholder="Ex: 50% na assinatura, 50% após o show."
            fullWidth 
            required 
            multiline
            rows={2}
            sx={{ mb: 2 }} 
            value={dados.forma_pagamento} 
            onChange={handleChange} 
          />
          <Grid container spacing={2}>
            <Grid item xs={8}>
                <TextField name="cidade_foro" label="Cidade do Foro do Contrato" fullWidth required value={dados.cidade_foro} onChange={handleChange} />
            </Grid>
            <Grid item xs={4}>
                <TextField name="estado_foro" label="Estado (UF)" fullWidth required value={dados.estado_foro} onChange={handleChange} />
            </Grid>
          </Grid>

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
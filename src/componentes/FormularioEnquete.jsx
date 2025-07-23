// src/componentes/FormularioEnquete.jsx
import React, { useState } from 'react';
import {
  Box, Button, TextField, Dialog, DialogActions, DialogContent,
  DialogTitle, CircularProgress, IconButton, Typography
} from '@mui/material';
import { AddCircleOutline as AddIcon, RemoveCircleOutline as RemoveIcon } from '@mui/icons-material';

function FormularioEnquete({ open, onClose, onSave, carregando }) {
  const [pergunta, setPergunta] = useState('');
  const [opcoes, setOpcoes] = useState(['', '']); // Começa com duas opções

  const handleOpcaoChange = (index, value) => {
    const novasOpcoes = [...opcoes];
    novasOpcoes[index] = value;
    setOpcoes(novasOpcoes);
  };

  const handleAdicionarOpcao = () => {
    if (opcoes.length < 5) { // Limite de 5 opções
      setOpcoes([...opcoes, '']);
    }
  };

  const handleRemoverOpcao = (index) => {
    if (opcoes.length > 2) { // Mínimo de 2 opções
      const novasOpcoes = opcoes.filter((_, i) => i !== index);
      setOpcoes(novasOpcoes);
    }
  };
  
  const handleSubmit = () => {
    // Filtra opções vazias antes de enviar
    const opcoesValidas = opcoes.filter(opt => opt.trim() !== '');
    if (!pergunta.trim() || opcoesValidas.length < 2) {
        // Idealmente, usar a notificação do contexto aqui
        alert('A pergunta e pelo menos duas opções são obrigatórias.');
        return;
    }
    onSave({ pergunta, opcoes: opcoesValidas });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Criar Nova Enquete</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Qual a sua pergunta?"
          fullWidth
          variant="outlined"
          value={pergunta}
          onChange={(e) => setPergunta(e.target.value)}
          sx={{ mt: 2, mb: 3 }}
        />
        <Typography color="text.secondary" sx={{ mb: 1 }}>Opções de Resposta (mín. 2, máx. 5)</Typography>
        {opcoes.map((opcao, index) => (
          <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
            <TextField
              label={`Opção ${index + 1}`}
              fullWidth
              variant="outlined"
              size="small"
              value={opcao}
              onChange={(e) => handleOpcaoChange(index, e.target.value)}
            />
            <IconButton onClick={() => handleRemoverOpcao(index)} disabled={opcoes.length <= 2}>
              <RemoveIcon />
            </IconButton>
          </Box>
        ))}
        <Button
          startIcon={<AddIcon />}
          onClick={handleAdicionarOpcao}
          disabled={opcoes.length >= 5}
          size="small"
        >
          Adicionar Opção
        </Button>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={carregando}>
            {carregando ? <CircularProgress size={24} /> : 'Salvar Enquete'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default FormularioEnquete;
// src/paginas/AdminMusicas.jsx
import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../api';
import { useNotificacao } from '../contextos/NotificationContext';
import {
  Box, Typography, Button, CircularProgress, Paper, List, ListItem,
  ListItemText, IconButton, Tooltip, Switch, FormControlLabel, Dialog,
  DialogTitle, DialogContent, DialogContentText, DialogActions
} from '@mui/material';
import { AddCircleOutline as AddCircleOutlineIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

import FormularioMusicaMestre from '../componentes/FormularioMusicaMestre';

function AdminMusicas() {
  const [musicasMestre, setMusicasMestre] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const { mostrarNotificacao } = useNotificacao();

  const [dialogoFormAberto, setDialogoFormAberto] = useState(false);
  const [musicaEmEdicao, setMusicaEmEdicao] = useState(null);

  const [dialogoApagarAberto, setDialogoApagarAberto] = useState(false);
  const [musicaParaApagar, setMusicaParaApagar] = useState(null);

  const buscarMusicasMestre = useCallback(async () => {
    try {
      setCarregando(true);
      const resposta = await apiClient.get('/api/admin/musicas');
      setMusicasMestre(resposta.data);
    } catch (error) {
      mostrarNotificacao('Erro ao carregar o banco de dados de músicas.', 'error');
    } finally {
      setCarregando(false);
    }
  }, [mostrarNotificacao]);

  useEffect(() => {
    buscarMusicasMestre();
  }, [buscarMusicasMestre]);

  const handleAbrirForm = (musica = null) => {
    setMusicaEmEdicao(musica);
    setDialogoFormAberto(true);
  };

  const handleFecharForm = () => {
    setMusicaEmEdicao(null);
    setDialogoFormAberto(false);
  };

  const handleSucessoForm = () => {
    handleFecharForm();
    buscarMusicasMestre();
  };
  
  const handleAbrirApagarDialogo = (musica) => {
    setMusicaParaApagar(musica);
    setDialogoApagarAberto(true);
  };

  const handleFecharApagarDialogo = () => {
    setMusicaParaApagar(null);
    setDialogoApagarAberto(false);
  };

  const handleConfirmarApagar = async () => {
    try {
      await apiClient.delete(`/api/admin/musicas/${musicaParaApagar.id}`);
      mostrarNotificacao("Música mestre apagada com sucesso!", "success");
      handleFecharApagarDialogo();
      buscarMusicasMestre();
    } catch (error) {
      mostrarNotificacao(error.response?.data?.mensagem || "Falha ao apagar a música.", "error");
    }
  };

  const handleTogglePublica = async (musica) => {
    try {
      await apiClient.put(`/api/admin/musicas/${musica.id}`, { is_publica: !musica.is_publica });
      mostrarNotificacao('Status da música atualizado!', 'success');
      buscarMusicasMestre();
    } catch (error) {
      mostrarNotificacao('Falha ao atualizar o status da música.', 'error');
    }
  };

  if (carregando) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold">Banco de Dados de Músicas</Typography>
          <Typography color="text.secondary">Gerencie as músicas disponíveis para todos os usuários.</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddCircleOutlineIcon />} onClick={() => handleAbrirForm()}>
          Adicionar Música
        </Button>
      </Box>

      <Paper>
        <List>
          {musicasMestre.map((musica) => (
            <ListItem
              key={musica.id}
              secondaryAction={
                <Box sx={{display: 'flex', alignItems: 'center'}}>
                  <Tooltip title={musica.is_publica ? "Visível para todos" : "Oculta"}>
                    <FormControlLabel control={<Switch checked={musica.is_publica} onChange={() => handleTogglePublica(musica)} />} label="Pública" />
                  </Tooltip>
                  <Tooltip title="Editar"><IconButton onClick={() => handleAbrirForm(musica)}><EditIcon /></IconButton></Tooltip>
                  <Tooltip title="Apagar"><IconButton onClick={() => handleAbrirApagarDialogo(musica)} color="error"><DeleteIcon /></IconButton></Tooltip>
                </Box>
              }
            >
              <ListItemText primary={musica.nome} secondary={musica.artista} />
            </ListItem>
          ))}
        </List>
      </Paper>

      <Dialog open={dialogoFormAberto} onClose={handleFecharForm} fullWidth maxWidth="sm">
        <FormularioMusicaMestre musica={musicaEmEdicao} onSave={handleSucessoForm} onCancel={handleFecharForm} />
      </Dialog>
      
      <Dialog open={dialogoApagarAberto} onClose={handleFecharApagarDialogo}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja apagar a música "{musicaParaApagar?.nome}"? Esta ação não pode ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleFecharApagarDialogo}>Cancelar</Button>
          <Button onClick={handleConfirmarApagar} color="error">Apagar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default AdminMusicas;
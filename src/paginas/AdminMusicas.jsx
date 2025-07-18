// src/paginas/AdminMusicas.jsx
import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../api';
import { useNotificacao } from '../contextos/NotificationContext';
import {
  Box, Typography, Button, CircularProgress, Paper, List, ListItem,
  ListItemText, IconButton, Tooltip, Switch, FormControlLabel
} from '@mui/material';
import { AddCircleOutline as AddCircleOutlineIcon, Edit as EditIcon } from '@mui/icons-material';

// Você precisará de um formulário para criar/editar, que pode ser um Dialog
// Para simplificar, a lógica do formulário não está incluída aqui,
// mas os botões para abri-lo estão prontos.

function AdminMusicas() {
  const [musicasMestre, setMusicasMestre] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const { mostrarNotificacao } = useNotificacao();

  const buscarMusicasMestre = useCallback(async () => {
    try {
      setCarregando(true);
      const resposta = await apiClient.get('/api/admin/musicas'); // Rota de admin
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
          <Typography variant="h4" component="h1" fontWeight="bold">
            Banco de Dados de Músicas
          </Typography>
          <Typography color="text.secondary">
            Gerencie as músicas disponíveis para todos os usuários.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddCircleOutlineIcon />}>
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
                  <Tooltip title={musica.is_publica ? "Visível para todos os usuários" : "Oculta para os usuários"}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={musica.is_publica}
                          onChange={() => handleTogglePublica(musica)}
                          color="primary"
                        />
                      }
                      label="Pública"
                    />
                  </Tooltip>
                  <IconButton>
                    <EditIcon />
                  </IconButton>
                </Box>
              }
            >
              <ListItemText primary={musica.nome} secondary={musica.artista} />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );
}

export default AdminMusicas;
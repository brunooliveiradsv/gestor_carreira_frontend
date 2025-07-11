// src/paginas/Equipamentos.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNotificacao } from '../contextos/NotificationContext';
import { Box, Button, Container, Typography, CircularProgress, Card, CardContent, CardActions, IconButton, Paper, Tooltip } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, AddCircleOutline as AddCircleOutlineIcon, Piano as PianoIcon } from '@mui/icons-material';
import FormularioEquipamento from '../componentes/FormularioEquipamento.jsx';

function Equipamentos() {
  const [equipamentos, setEquipamentos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [modo, setModo] = useState('lista');
  const [equipamentoSelecionadoId, setEquipamentoSelecionadoId] = useState(null);
  const { mostrarNotificacao } = useNotificacao();

  const buscarEquipamentos = async () => {
    if(modo === 'lista' && !carregando) setCarregando(true);
    try {
      const resposta = await axios.get('http://localhost:3000/api/equipamentos');
      setEquipamentos(resposta.data);
    } catch (erro) {
      mostrarNotificacao("Não foi possível carregar os equipamentos.", "error");
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    if (modo === 'lista') {
      buscarEquipamentos();
    }
  }, [modo]);

  const handleApagar = async (id) => {
    if (window.confirm("Tem certeza que deseja apagar este equipamento?")) {
      try {
        await axios.delete(`http://localhost:3000/api/equipamentos/${id}`);
        mostrarNotificacao("Equipamento apagado com sucesso!", "success");
        buscarEquipamentos();
      } catch (erro) {
        mostrarNotificacao("Falha ao apagar o equipamento.", "error");
      }
    }
  };
  
  const handleSucessoFormulario = () => { setModo('lista'); setEquipamentoSelecionadoId(null); };
  const handleCancelarFormulario = () => { setModo('lista'); setEquipamentoSelecionadoId(null); };

  if (carregando && modo === 'lista') {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress color="inherit" /></Box>;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {modo === 'lista' ? (
        <Paper elevation={6} sx={{ p: { xs: 2, md: 4 }, borderRadius: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Typography variant="h4" component="h1" fontWeight="bold">Meus Equipamentos</Typography>
            <Button variant="contained" color="primary" startIcon={<AddCircleOutlineIcon />} onClick={() => setModo('criar')}>Novo Equipamento</Button>
          </Box>
          {equipamentos.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center', border: '1px dashed grey', borderRadius: 2 }}>
              <Typography variant="h6">Nenhum equipamento cadastrado.</Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 3 }}>
              {equipamentos.map(eq => (
                <Card key={eq.id} variant="outlined">
                  <CardContent>
                    <Box sx={{display: 'flex', alignItems: 'center', mb: 1.5}}>
                      <PianoIcon sx={{mr: 1.5, color: 'primary.main'}}/>
                      <Typography variant="h6" component="h2" fontWeight="bold">{eq.nome}</Typography>
                    </Box>
                    <Typography color="text.secondary">Marca: {eq.marca || 'N/A'}</Typography>
                    <Typography color="text.secondary">Modelo: {eq.modelo || 'N/A'}</Typography>
                    <Typography color="text.secondary">Tipo: {eq.tipo || 'N/A'}</Typography>
                    {eq.notas && <Typography variant="body2" sx={{mt: 1}}>Notas: {eq.notas}</Typography>}
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'flex-end' }}>
                    <Tooltip title="Editar"><IconButton onClick={() => { setEquipamentoSelecionadoId(eq.id); setModo('editar'); }} color="secondary"><EditIcon /></IconButton></Tooltip>
                    <Tooltip title="Excluir"><IconButton onClick={() => handleApagar(eq.id)} color="error"><DeleteIcon /></IconButton></Tooltip>
                  </CardActions>
                </Card>
              ))}
            </Box>
          )}
        </Paper>
      ) : (
        <FormularioEquipamento id={equipamentoSelecionadoId} onSave={handleSucessoFormulario} onCancel={handleCancelarFormulario} />
      )}
    </Container>
  );
}

export default Equipamentos;
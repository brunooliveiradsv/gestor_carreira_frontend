// src/paginas/Agenda.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// --- A CORREÇÃO ESTÁ NESTA LINHA DE IMPORT ---
import { Box, Button, Container, Typography, CircularProgress, Card, CardContent, CardActions, Chip, IconButton, Paper, Dialog, DialogTitle, DialogContent, DialogActions, Tooltip } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Info as InfoIcon, AddCircleOutline as AddCircleOutlineIcon, Event as EventIcon, LocationOn as LocationOnIcon, MusicNote as MusicNoteIcon, Mic as MicIcon, Groups as GroupsIcon, Handshake as HandshakeIcon } from '@mui/icons-material';

import FormularioCompromisso from '../componentes/FormularioCompromisso.jsx';

function Agenda() {
  const [compromissos, setCompromissos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [modo, setModo] = useState('lista');
  const [compromissoSelecionado, setCompromissoSelecionado] = useState(null);
  const navigate = useNavigate();

   const buscarCompromissos = async () => {
    if (modo === 'lista' && !carregando) setCarregando(true);
    try {
      const resposta = await axios.get('http://localhost:3000/api/compromissos');
      // --- CORREÇÃO APLICADA AQUI ---
      // Removemos a ordenação .sort() do frontend.
      // Agora usamos os dados exatamente na ordem que o backend nos envia.
      setCompromissos(resposta.data);
    } catch (erro) {
      console.error("Erro ao buscar compromissos:", erro);
      alert("Não foi possível carregar os compromissos.");
    } finally {
      setCarregando(false);
    }
  };
  useEffect(() => {
    if (modo === 'lista') {
      buscarCompromissos();
    }
  }, [modo]);

  const handleApagar = async (idDoCompromisso) => {
    if (window.confirm("Tem certeza que deseja apagar este compromisso?")) {
      try {
        await axios.delete(`http://localhost:3000/api/compromissos/${idDoCompromisso}`);
        buscarCompromissos();
        alert("Compromisso apagado com sucesso!");
      } catch (erro) {
        console.error("Erro ao apagar compromisso:", erro);
        alert("Falha ao apagar o compromisso.");
      }
    }
  };
  
  const handleNovo = () => { setCompromissoSelecionado(null); setModo('criar'); };
  const handleEditar = (compromisso) => { setCompromissoSelecionado(compromisso); setModo('editar'); };
  const handleDetalhes = (compromisso) => { setCompromissoSelecionado(compromisso); };
  const handleFecharDetalhes = () => { setCompromissoSelecionado(null); };
  const handleSucessoFormulario = () => { setModo('lista'); setCompromissoSelecionado(null); };
  const handleCancelarFormulario = () => { setModo('lista'); setCompromissoSelecionado(null); };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Realizado': return 'success';
      case 'Cancelado': return 'error';
      default: return 'info';
    }
  };

  const getTipoIcon = (tipo) => {
    switch (tipo) {
      case 'Show': return <MusicNoteIcon fontSize="small" />;
      case 'Gravação': return <MicIcon fontSize="small" />;
      case 'Ensaio': return <GroupsIcon fontSize="small" />;
      case 'Reunião': return <HandshakeIcon fontSize="small" />;
      default: return <MusicNoteIcon fontSize="small" />;
    }
  };

  const primaryButtonStyle = {
    borderRadius: 2, bgcolor: "#4000F0", color: 'white', py: 1.2, px: 3, "&:hover": { bgcolor: "#2C00A3" },
  };

  const renderizarConteudo = () => {
    if (modo === 'criar' || modo === 'editar') {
      return (
        <Paper elevation={6} sx={{ p: { xs: 2, sm: 3, md: 4 }, borderRadius: 3 }}>
          <FormularioCompromisso 
            id={compromissoSelecionado ? compromissoSelecionado.id : null}
            onSave={handleSucessoFormulario}
            onCancel={handleCancelarFormulario}
          />
        </Paper>
      );
    }
    
    return (
      <Paper elevation={6} sx={{ p: {xs: 2, sm: 3, md: 4}, borderRadius: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1" fontWeight="bold">Minha Agenda</Typography>
          <Button variant="contained" startIcon={<AddCircleOutlineIcon />} onClick={handleNovo} sx={primaryButtonStyle}>Novo Compromisso</Button>
        </Box>
        {compromissos.length === 0 ? (
          <Box sx={{p: 4, textAlign: 'center', border: '1px dashed grey', borderRadius: 2}}>
            <Typography variant="h6">Sua agenda está vazia!</Typography>
            <Typography color="text.secondary">Clique em "Novo Compromisso" para começar.</Typography>
          </Box>
        ) : (
          <Box>{compromissos.map(c => (
            <Card key={c.id} variant="outlined" sx={{ mb: 2 }}>
              <CardContent sx={{ pb: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                  <Typography variant="h6" component="h2" fontWeight="bold">{c.nome_evento}</Typography>
                  <Chip label={c.status} color={getStatusColor(c.status)} size="small" />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', mb: 1, gap: 3, flexWrap: 'wrap' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>{getTipoIcon(c.tipo)}<Typography variant="body2" sx={{ ml: 1 }}>{c.tipo}</Typography></Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}><EventIcon sx={{ fontSize: '1.1rem', mr: 1 }} /><Typography variant="body2">{new Date(c.data).toLocaleString('pt-BR', { day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit' })}</Typography></Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}><LocationOnIcon sx={{ fontSize: '1.1rem', mr: 1 }} /><Typography variant="body2">{c.local || 'Não informado'}</Typography></Box>
                </Box>
              </CardContent>
              <CardActions sx={{ justifyContent: 'flex-end' }}>
                <Tooltip title="Detalhes"><IconButton onClick={() => handleDetalhes(c)} color="primary"><InfoIcon /></IconButton></Tooltip>
                <Tooltip title={c.status !== 'Agendado' ? 'Não é possível editar um evento finalizado' : 'Editar'}><Box component="span"><IconButton onClick={() => handleEditar(c)} color="secondary" disabled={c.status !== 'Agendado'}><EditIcon /></IconButton></Box></Tooltip>
                <Tooltip title={c.status === 'Realizado' ? 'Não é possível excluir um evento realizado' : 'Excluir'}><Box component="span"><IconButton onClick={() => handleApagar(c.id)} color="error" disabled={c.status === 'Realizado'}><DeleteIcon /></IconButton></Box></Tooltip>
              </CardActions>
            </Card>
          ))}
        </Box>
      )}
    </Paper>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {carregando ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress color="inherit" /></Box>
      ) : (
        renderizarConteudo()
      )}

      <Dialog open={!!compromissoSelecionado && modo === 'lista'} onClose={handleFecharDetalhes} fullWidth maxWidth="sm">
        <DialogTitle fontWeight="bold">Detalhes: {compromissoSelecionado?.nome_evento}</DialogTitle>
        <DialogContent dividers>
          {compromissoSelecionado && (
            <Box sx={{lineHeight: 1.8}}>
              <Typography><strong>Tipo:</strong> {compromissoSelecionado.tipo}</Typography>
              <Typography><strong>Data:</strong> {new Date(compromissoSelecionado.data).toLocaleString('pt-BR', { dateStyle: 'full', timeStyle: 'short' })}</Typography>
              <Typography><strong>Local:</strong> {compromissoSelecionado.local || 'Não informado'}</Typography>
              <Typography><strong>Status:</strong> {compromissoSelecionado.status}</Typography>
              {compromissoSelecionado.valor_cache && <Typography><strong>Cachê:</strong> R$ {parseFloat(compromissoSelecionado.valor_cache).toFixed(2)}</Typography>}
              {compromissoSelecionado.repertorio_id && <Typography><strong>ID do Repertório:</strong> {compromissoSelecionado.repertorio_id}</Typography>}
              {compromissoSelecionado.despesas && compromissoSelecionado.despesas.length > 0 && (
                <Box mt={2}><Typography fontWeight="bold">Despesas Previstas:</Typography><ul style={{paddingLeft: '20px', margin: 0}}>{compromissoSelecionado.despesas.map((d, index) => <li key={index}>{d.descricao}: R$ {parseFloat(d.valor).toFixed(2)}</li>)}</ul></Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleFecharDetalhes}>Fechar</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Agenda;
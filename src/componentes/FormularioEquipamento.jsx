// src/componentes/FormularioEquipamento.jsx

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNotificacao } from '../contextos/NotificationContext';
import { Box, Button, TextField, Typography, Paper, CircularProgress, Select, MenuItem, FormControl, InputLabel, Checkbox, FormControlLabel } from '@mui/material';

function FormularioEquipamento({ id, onSave, onCancel }) {
  const [dadosForm, setDadosForm] = useState({
    nome: '',
    marca: '',
    modelo: '',
    tipo: '',
    notas: '',
    valor_compra: '', // Novo campo
    data_compra: '',  // Novo campo
  });
  
  // Novo estado para controlar o checkbox de gerar despesa
  const [gerarDespesa, setGerarDespesa] = useState(true);
  
  const [carregando, setCarregando] = useState(false);
  const { mostrarNotificacao } = useNotificacao();

  useEffect(() => {
    if (id) {
      // No modo de edição, não mostramos os campos de compra para simplificar
      axios.get(`http://localhost:3000/api/equipamentos/${id}`)
        .then(resposta => {
            // Garante que a data seja formatada corretamente se existir
            const dados = resposta.data;
            if (dados.data_compra) {
                dados.data_compra = new Date(dados.data_compra).toISOString().slice(0, 10);
            }
            setDadosForm(dados);
        })
        .catch(erro => mostrarNotificacao("Erro ao buscar dados do equipamento.", "error"));
    } else {
        // No modo de criação, define a data de compra padrão como hoje
        setDadosForm(atuais => ({...atuais, data_compra: new Date().toISOString().slice(0, 10)}));
    }
  }, [id, mostrarNotificacao]);

  const handleChange = (e) => {
    setDadosForm(atuais => ({ ...atuais, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCarregando(true);
    
    // Junta os dados do formulário com a opção de gerar despesa
    const dadosParaEnviar = { ...dadosForm, gerar_despesa: gerarDespesa };

    try {
      if (id) {
        await axios.put(`http://localhost:3000/api/equipamentos/${id}`, dadosParaEnviar);
        mostrarNotificacao('Equipamento atualizado com sucesso!', 'success');
      } else {
        await axios.post('http://localhost:3000/api/equipamentos', dadosParaEnviar);
        mostrarNotificacao('Equipamento criado com sucesso!', 'success');
      }
      onSave();
    } catch (erro) {
      mostrarNotificacao('Falha ao salvar o equipamento.', 'error');
    } finally {
      setCarregando(false);
    }
  };
  
  const tiposDeEquipamento = [
    'Instrumento de Corda', 'Instrumento de Sopro', 'Instrumento de Tecla', 'Percussão',
    'Áudio (Microfone, Mesa, etc.)', 'Iluminação', 'Cabos e Conectores', 'Acessório', 'Outro',
  ];

  return (
    <Paper elevation={6} sx={{ p: { xs: 2, md: 4 }, borderRadius: 3 }}>
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="h5" component="h2" fontWeight="bold" gutterBottom>
          {id ? 'Editar Equipamento' : 'Novo Equipamento'}
        </Typography>
        
        <TextField name="nome" label="Nome do Equipamento (ex: Guitarra Fender)" value={dadosForm.nome} onChange={handleChange} required fullWidth />
        <TextField name="marca" label="Marca" value={dadosForm.marca || ''} onChange={handleChange} fullWidth />
        <TextField name="modelo" label="Modelo" value={dadosForm.modelo || ''} onChange={handleChange} fullWidth />
        <FormControl fullWidth>
          <InputLabel>Tipo</InputLabel>
          <Select name="tipo" label="Tipo" value={dadosForm.tipo || ''} onChange={handleChange}>
            {tiposDeEquipamento.map((tipo) => <MenuItem key={tipo} value={tipo}>{tipo}</MenuItem>)}
          </Select>
        </FormControl>
        <TextField name="notas" label="Notas (nº de série, etc.)" multiline rows={3} value={dadosForm.notas || ''} onChange={handleChange} fullWidth />
        
        {/* --- SEÇÃO NOVA DE COMPRA (só aparece no modo 'criar') --- */}
        {!id && (
          <Paper variant="outlined" sx={{ p: 2, mt: 2, borderColor: 'rgba(0, 0, 0, 0.23)' }}>
            <Typography variant="h6" gutterBottom>Informações da Compra</Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 2}}>
                <TextField name="valor_compra" label="Valor da Compra (R$)" type="number" inputProps={{ step: "0.01" }} value={dadosForm.valor_compra} onChange={handleChange} fullWidth />
                <TextField name="data_compra" label="Data da Compra" type="date" value={dadosForm.data_compra} onChange={handleChange} fullWidth InputLabelProps={{ shrink: true }} />
            </Box>
            <FormControlLabel 
              control={<Checkbox checked={gerarDespesa} onChange={(e) => setGerarDespesa(e.target.checked)} />} 
              label="Lançar esta compra como uma despesa no Financeiro" 
            />
          </Paper>
        )}

        <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
          <Button type="submit" variant="contained" disabled={carregando}>
            {carregando ? <CircularProgress size={24} /> : 'Salvar'}
          </Button>
          <Button type="button" variant="text" onClick={onCancel}>Cancelar</Button>
        </Box>
      </Box>
    </Paper>
  );
}

export default FormularioEquipamento;
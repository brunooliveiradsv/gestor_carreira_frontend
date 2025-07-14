// src/componentes/FormularioCompromisso.jsx

import { useState, useEffect } from 'react';
import apiClient from '../api';
import { 
  Box, 
  Button, 
  TextField, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  Typography, 
  Paper, 
  CircularProgress, 
  useTheme 
} from '@mui/material'; 
import { useNotificacao } from '../contextos/NotificationContext';
import Autocomplete from 'react-google-autocomplete';

function FormularioCompromisso({ id, onSave, onCancel }) {
  const [dadosForm, setDadosForm] = useState({
    tipo: 'Show', 
    nome_evento: '', 
    data: '', // Será uma string local 'YYYY-MM-DDTHH:mm'
    local: '', 
    status: 'Agendado', 
    valor_cache: '', 
    despesas: [],
  });
  const [carregando, setCarregando] = useState(false);
  const { mostrarNotificacao } = useNotificacao();
  const theme = useTheme();

  useEffect(() => {
    if (id) {
      apiClient.get(`/api/compromissos/${id}`)
        .then(resposta => {
          // --- CORREÇÃO DE FUSO HORÁRIO AO CARREGAR PARA EDIÇÃO ---
          // A API retorna a data em UTC. Precisamos converter para a data/hora LOCAL do usuário
          // para preencher o input type="datetime-local" corretamente.
          const dataUTC = new Date(resposta.data.data);
          // Calcula o offset do fuso horário local em minutos e converte para milissegundos
          const offset = dataUTC.getTimezoneOffset() * 60000;
          // Ajusta a data para o fuso horário local
          const dataLocal = new Date(dataUTC.getTime() - offset);
          // Formata para "YYYY-MM-DDTHH:mm", que é o formato esperado pelo input type="datetime-local"
          const dataFormatadaParaInput = dataLocal.toISOString().slice(0, 16);
          
          const despesasSeguro = resposta.data.despesas || [];
          setDadosForm({ 
            ...resposta.data, 
            data: dataFormatadaParaInput, // Usa a data formatada para o input
            despesas: despesasSeguro 
          });
        })
        .catch(erro => {
            console.error("Erro ao buscar dados para edição", erro);
            mostrarNotificacao("Não foi possível carregar os dados do compromisso para edição.", "error");
        });
    }
  }, [id, mostrarNotificacao]); 

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDadosForm(dadosAtuais => ({ ...dadosAtuais, [name]: value }));
  };

  const handleDespesaChange = (index, campo, valor) => {
    const novasDespesas = [...dadosForm.despesas];
    novasDespesas[index][campo] = valor;
    setDadosForm(dadosAtuais => ({ ...dadosAtuais, despesas: novasDespesas }));
  };

  const adicionarDespesa = () => {
    setDadosForm(dadosAtuais => ({
      ...dadosAtuais,
      despesas: [...(dadosAtuais.despesas || []), { descricao: '', valor: '' }]
    }));
  };

  const removerDespesa = (index) => {
    if (window.confirm("Remover esta despesa?")) {
      const novasDespesas = [...dadosForm.despesas];
      novasDespesas.splice(index, 1);
      setDadosForm(dadosAtuais => ({ ...dadosAtuais, despesas: novasDespesas }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCarregando(true);
    const dadosParaEnviar = { ...dadosForm };

    // --- CORREÇÃO DE FUSO HORÁRIO AO SALVAR ---
    // O input type="datetime-local" retorna uma string no formato local ("YYYY-MM-DDTHH:mm").
    // Precisamos converter esta string local para UTC antes de enviar para a API.
    if (dadosParaEnviar.data) {
      try {
        // Cria um objeto Date a partir da string local.
        // O construtor Date() vai interpretar a string como hora local.
        const dataObjLocal = new Date(dadosParaEnviar.data);
        // Converte para ISO string, que é sempre em UTC, e este é o formato que o backend deve esperar.
        dadosParaEnviar.data = dataObjLocal.toISOString();
      } catch (error) {
        console.error("Erro ao converter data para UTC:", error);
        mostrarNotificacao("Erro na data. Por favor, verifique o formato.", "error");
        setCarregando(false);
        return; // Impede o envio se a data for inválida
      }
    }

    try {
      if (id) {
        await apiClient.put(`/api/compromissos/${id}`, dadosParaEnviar);
        mostrarNotificacao('Compromisso atualizado com sucesso!', 'success');
      } else {
        await apiClient.post('/api/compromissos', dadosParaEnviar);
        mostrarNotificacao('Compromisso criado com sucesso!', 'success');
      }
      onSave(); // Retorna para a lista de compromissos
    } catch (erro) {
      console.error("Erro ao salvar:", erro);
      mostrarNotificacao(erro.response?.data?.mensagem || 'Falha ao salvar o compromisso.', 'error');
    } finally {
      setCarregando(false);
    }
  };

  const getStatusOptions = () => {
    if (!id) {
      return [
        <MenuItem key="agendado-novo" value="Agendado">
          Agendado
        </MenuItem>,
      ];
    }
    if (dadosForm.status === "Realizado" || dadosForm.status === "Cancelado") {
      return [
        <MenuItem key={dadosForm.status} value={dadosForm.status}>
          {dadosForm.status}
        </MenuItem>,
      ];
    }
    return [
      <MenuItem key="agendado" value="Agendado">
        Agendado
      </MenuItem>,
      <MenuItem key="cancelado" value="Cancelado">
        Cancelado
      </MenuItem>,
    ];
  };

  const isStatusDisabled = () => {
    if (!id) return true; // Desabilitado na criação
    return dadosForm.status === "Realizado" || dadosForm.status === "Cancelado";
  };

  return (
    <Paper elevation={6} sx={{ p: { xs: 2, sm: 3, md: 4 } }}> {/* Sem borderRadius fixo, usa o do tema */}
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: "flex", flexDirection: "column", gap: 2 }}
      >
        <Typography variant="h5" component="h2" fontWeight="bold" gutterBottom sx={{ color: theme.palette.text.primary }}>
          {id ? "Editar Compromisso" : "Novo Compromisso"}
        </Typography>

        <TextField
          name="nome_evento"
          label="Nome do Evento"
          value={dadosForm.nome_evento}
          onChange={handleChange}
          required
          fullWidth
          // As cores do TextField serão controladas pelo tema
        />

        <FormControl fullWidth>
          <InputLabel sx={{ color: theme.palette.text.secondary }}>Tipo</InputLabel>
          <Select
            name="tipo"
            label="Tipo"
            value={dadosForm.tipo}
            onChange={handleChange}
            sx={{ color: theme.palette.text.primary }}
            // As cores do Select (ícone, borda) serão controladas pelo tema
          >
            <MenuItem value="Show">Show</MenuItem>
            <MenuItem value="Ensaio">Ensaio</MenuItem>
            <MenuItem value="Gravação">Gravação</MenuItem>
            <MenuItem value="Reunião">Reunião</MenuItem>
          </Select>
        </FormControl>

        {id && (
          <FormControl fullWidth>
            <InputLabel sx={{ color: theme.palette.text.secondary }}>Status</InputLabel>
            <Select
              name="status"
              label="Status"
              value={dadosForm.status}
              onChange={handleChange}
              disabled={isStatusDisabled()}
              sx={{ color: theme.palette.text.primary }}
            >
              {getStatusOptions()}
            </Select>
          </FormControl>
        )}

        <TextField
          name="data"
          label="Data e Hora"
          type="datetime-local"
          value={dadosForm.data} 
          onChange={handleChange}
          required
          fullWidth
          InputLabelProps={{ shrink: true }}
          // As cores do TextField serão controladas pelo tema
        />
               <Autocomplete
            apiKey="AIzaSyBW9LJRPX7DPHlSiYxtFUO8VuZew-Q7KD8" // Use a mesma chave que colocou no index.html
            onPlaceSelected={(place) => {
                // Quando um local é selecionado, atualizamos o estado do formulário
                setDadosForm(dadosAtuais => ({ ...dadosAtuais, local: place.formatted_address }));
            }}
            options={{
                types: ['(cities)'], // Restringe a busca para cidades
            }}
            // Usamos um componente TextField do Material-UI para manter a aparência
            renderInput={(params) => (
                <TextField
                    {...params}
                    label="Local"
                    variant="outlined"
                    fullWidth
                    // Se estiver editando, o valor inicial será o do estado
                    defaultValue={dadosForm.local}
                />
            )}
        />
        <TextField
          name="valor_cache"
          label="Cachê (R$)"
          type="number"
          inputProps={{ step: "0.01" }}
          value={dadosForm.valor_cache || ""}
          onChange={handleChange}
          fullWidth
          // As cores do TextField serão controladas pelo tema
        />

        <Box>
          <Typography variant="h6" gutterBottom sx={{ color: theme.palette.text.primary }}>
            Despesas do Evento
          </Typography>
          {(dadosForm.despesas || []).map((despesa, index) => (
            <Box
              key={index}
              sx={{ display: "flex", gap: "10px", alignItems: "center", mb: 1 }}
            >
              <TextField
                label="Descrição da Despesa"
                value={despesa.descricao}
                onChange={(e) =>
                  handleDespesaChange(index, "descricao", e.target.value)
                }
                sx={{ flex: 2 }}
                // As cores do TextField serão controladas pelo tema
              />
              <TextField
                label="Valor (R$)"
                type="number"
                inputProps={{ step: "0.01" }}
                value={despesa.valor}
                onChange={(e) =>
                  handleDespesaChange(index, "valor", e.target.value)
                }
                sx={{ flex: 1 }}
                // As cores do TextField serão controladas pelo tema
              />
              <Button
                type="button"
                onClick={() => removerDespesa(index)}
                color="error" 
                size="small"
              >
                Remover
              </Button>
            </Box>
          ))}
          <Button
            type="button"
            onClick={adicionarDespesa}
            variant="outlined"
            size="small"
            color="primary" 
          >
            + Adicionar Despesa
          </Button>
        </Box>

        <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
          <Button type="submit" variant="contained" disabled={carregando} color="primary">
            {carregando ? <CircularProgress size={24} /> : "Salvar"}
          </Button>
          <Button type="button" variant="text" onClick={onCancel} sx={{ color: theme.palette.text.secondary }}>
            Cancelar
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}

export default FormularioCompromisso;
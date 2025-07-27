// src/componentes/FormularioCompromisso.jsx
import { useEffect, useState } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form'; // 1. Importar hooks
import apiClient from '../apiClient';
import {
  Box, Button, TextField, Select, MenuItem, FormControl, InputLabel,
  Typography, CircularProgress, Dialog, DialogActions, DialogContent,
  DialogContentText, DialogTitle
} from '@mui/material';
import { useNotificacao } from '../contextos/NotificationContext';
import usePlacesAutocomplete from 'use-places-autocomplete';

import { TIPOS_COMPROMISSO } from '../constants';

// O componente PlacesAutocomplete não precisa de alterações
function PlacesAutocomplete({ initialValue, onSelectPlace, error }) {
  const { ready, value, suggestions: { data }, setValue, clearSuggestions } = usePlacesAutocomplete({ debounce: 300 });

  useEffect(() => {
    if (initialValue) setValue(initialValue, false);
  }, [initialValue, setValue]);

  const handleSelect = (description) => {
    setValue(description, false);
    clearSuggestions();
    onSelectPlace(description);
  };

  return (
    <FormControl fullWidth error={!!error}>
      <TextField
        label="Local"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={!ready}
        placeholder="Digite o nome de uma cidade..."
        helperText={error?.message}
      />
      {data.length > 0 && (
        <Paper elevation={2} sx={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 1300 }}>
          <List>
            {data.map(({ place_id, description }) => (
              <ListItem key={place_id} button onClick={() => handleSelect(description)}>
                <ListItemText primary={description} />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </FormControl>
  );
}

function FormularioCompromisso({ id, onSave, onCancel }) {
  const { mostrarNotificacao } = useNotificacao();
  const [setlistsDisponiveis, setSetlistsDisponiveis] = useState([]);
  const [dialogoConfirmacaoAberto, setDialogoConfirmacaoAberto] = useState(false);
  const [indiceDespesaParaRemover, setIndiceDespesaParaRemover] = useState(null);

  // 2. Configuração do React Hook Form
  const { control, handleSubmit, setValue, watch, reset, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      tipo: 'Show', nome_evento: '', data: '', local: '', status: 'Agendado',
      valor_cache: '', despesas: [], setlist_id: ''
    }
  });

  // Observa o valor do status para desabilitar o campo
  const statusAtual = watch('status');

  // Hook para gerir o array de despesas
  const { fields, append, remove } = useFieldArray({ control, name: "despesas" });

  useEffect(() => {
    apiClient.get('/api/setlists')
      .then(resposta => setSetlistsDisponiveis(resposta.data))
      .catch(() => mostrarNotificacao("Não foi possível carregar seus setlists.", "warning"));

    if (id) {
      apiClient.get(`/api/compromissos/${id}`)
        .then(resposta => {
          const dataUTC = new Date(resposta.data.data);
          const offset = dataUTC.getTimezoneOffset() * 60000;
          const dataLocal = new Date(dataUTC.getTime() - offset);
          const dataFormatadaParaInput = dataLocal.toISOString().slice(0, 16);
          
          // 3. Preenche o formulário com os dados da API
          reset({
            ...resposta.data,
            data: dataFormatadaParaInput,
            despesas: resposta.data.despesas || [],
            local: resposta.data.local || '',
            setlist_id: resposta.data.setlist_id || ''
          });
        })
        .catch(() => mostrarNotificacao("Não foi possível carregar os dados do compromisso.", "error"));
    }
  }, [id, mostrarNotificacao, reset]);

  // 4. Função de submissão que recebe os dados do formulário
  const onSubmit = async (dadosForm) => {
    const dadosParaEnviar = { ...dadosForm };
    if (dadosParaEnviar.data) {
      dadosParaEnviar.data = new Date(dadosParaEnviar.data).toISOString();
    }
    if (dadosParaEnviar.setlist_id === '') {
      dadosParaEnviar.setlist_id = null;
    }

    try {
      const method = id ? 'put' : 'post';
      const endpoint = id ? `/api/compromissos/${id}` : '/api/compromissos';
      await apiClient[method](endpoint, dadosParaEnviar);
      mostrarNotificacao(`Compromisso ${id ? 'atualizado' : 'criado'} com sucesso!`, 'success');
      onSave();
    } catch (erro) {
      mostrarNotificacao(erro.response?.data?.mensagem || 'Falha ao salvar.', 'error');
    }
  };

  const abrirDialogoRemoverDespesa = (index) => {
    setIndiceDespesaParaRemover(index);
    setDialogoConfirmacaoAberto(true);
  };
  
  const handleConfirmarRemocaoDespesa = () => {
    if (indiceDespesaParaRemover !== null) {
      remove(indiceDespesaParaRemover);
    }
    setDialogoConfirmacaoAberto(false);
    setIndiceDespesaParaRemover(null);
  };

  const isStatusDisabled = () => {
    if (!id) return true;
    return statusAtual === "Realizado" || statusAtual === "Cancelado";
  };

  return (
    <>
      <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: "flex", flexDirection: "column", gap: 2, p: 1 }}>
        <Typography variant="h5" component="h2" fontWeight="bold" gutterBottom>
          {id ? "Editar Compromisso" : "Novo Compromisso"}
        </Typography>

        <Controller name="nome_evento" control={control} rules={{ required: 'O nome do evento é obrigatório.' }}
          render={({ field }) => <TextField {...field} label="Nome do Evento" fullWidth error={!!errors.nome_evento} helperText={errors.nome_evento?.message} />}
        />
        
        <Controller name="tipo" control={control}
          render={({ field }) => (
            <FormControl fullWidth>
              <InputLabel>Tipo</InputLabel>
              <Select {...field} label="Tipo">
                {TIPOS_COMPROMISSO.map(tipo => <MenuItem key={tipo} value={tipo}>{tipo}</MenuItem>)}
              </Select>
            </FormControl>
          )}
        />

        {id && (
          <Controller name="status" control={control}
            render={({ field }) => (
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select {...field} label="Status" disabled={isStatusDisabled()}>
                  <MenuItem value="Agendado">Agendado</MenuItem>
                  <MenuItem value="Cancelado">Cancelado</MenuItem>
                  <MenuItem value="Realizado">Realizado</MenuItem>
                </Select>
              </FormControl>
            )}
          />
        )}
        
        <Controller name="data" control={control} rules={{ required: 'A data é obrigatória.' }}
          render={({ field }) => <TextField {...field} type="datetime-local" label="Data e Hora" fullWidth InputLabelProps={{ shrink: true }} error={!!errors.data} helperText={errors.data?.message} />}
        />

        <Controller name="local" control={control}
          render={({ field }) => <PlacesAutocomplete initialValue={field.value} onSelectPlace={(place) => field.onChange(place)} error={errors.local} />}
        />

        <Controller name="valor_cache" control={control}
          render={({ field }) => <TextField {...field} label="Cachê (R$)" type="number" inputProps={{ step: "0.01" }} fullWidth />}
        />

        <Controller name="setlist_id" control={control}
          render={({ field }) => (
            <FormControl fullWidth>
              <InputLabel>Setlist (Opcional)</InputLabel>
              <Select {...field} label="Setlist (Opcional)">
                <MenuItem value=""><em>Nenhum</em></MenuItem>
                {setlistsDisponiveis.map(s => <MenuItem key={s.id} value={s.id}>{s.nome}</MenuItem>)}
              </Select>
            </FormControl>
          )}
        />

        <Box>
          <Typography variant="h6" gutterBottom>Despesas do Evento</Typography>
          {fields.map((item, index) => (
            <Box key={item.id} sx={{ display: "flex", gap: 2, alignItems: "center", mb: 1.5 }}>
              <Controller name={`despesas.${index}.descricao`} control={control} rules={{ required: true }}
                render={({ field }) => <TextField {...field} label="Descrição da Despesa" fullWidth size="small" />}
              />
              <Controller name={`despesas.${index}.valor`} control={control} rules={{ required: true }}
                render={({ field }) => <TextField {...field} label="Valor (R$)" type="number" inputProps={{ step: "0.01" }} sx={{ minWidth: 120 }} size="small" />}
              />
              <Button type="button" onClick={() => abrirDialogoRemoverDespesa(index)} color="error" size="small">Remover</Button>
            </Box>
          ))}
          <Button type="button" onClick={() => append({ descricao: '', valor: '' })} variant="outlined" size="small">
            + Adicionar Despesa
          </Button>
        </Box>

        <Box sx={{ mt: 2, display: "flex", justifyContent: 'flex-end', gap: 2 }}>
          <Button type="button" variant="text" onClick={onCancel}>Cancelar</Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? <CircularProgress size={24} /> : "Salvar"}
          </Button>
        </Box>
      </Box>

      <Dialog open={dialogoConfirmacaoAberto} onClose={() => setDialogoConfirmacaoAberto(false)}>
        <DialogTitle>Confirmar Remoção</DialogTitle>
        <DialogContent><DialogContentText>Tem certeza que deseja remover esta despesa?</DialogContentText></DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogoConfirmacaoAberto(false)}>Cancelar</Button>
          <Button onClick={handleConfirmarRemocaoDespesa} color="error" autoFocus>Remover</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default FormularioCompromisso;
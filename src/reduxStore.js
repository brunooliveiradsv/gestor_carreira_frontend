// src/store.js
import { createStore } from 'redux';

// Reducer mínimo para satisfazer o requisito do store
// Este reducer não faz nada por enquanto, mas é necessário para criar o store
const rootReducer = (state = {}, action) => {
  return state;
};

// Cria o store
const store = createStore(rootReducer);

export default store;
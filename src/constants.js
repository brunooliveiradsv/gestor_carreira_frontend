// src/constants.js

/**
 * Endpoints da API para centralizar todas as chamadas ao backend.
 */
export const API_ENDPOINTS = {
  // Autenticação e Utilizadores
  LOGIN: '/api/usuarios/login',
  REGISTRAR: '/api/usuarios/registrar',
  RECUPERAR_SENHA: '/api/usuarios/recuperar-senha',
  PERFIL: '/api/usuarios/perfil',
  
  // Agenda
  COMPROMISSOS: '/api/compromissos',
  COMPROMISSOS_PROXIMOS: '/api/compromissos/proximos',

  // Financeiro
  FINANCEIRO_TRANSACOES: '/api/financeiro/transacoes',
  FINANCEIRO_RESUMO_MENSAL: '/api/financeiro/resumo-mensal',

  // Repertório
  MUSICAS: '/api/musicas',
  MUSICAS_PUBLICAS: '/api/musicas/buscar-publicas',
  MUSICAS_IMPORTAR: '/api/musicas/importar',
  MUSICAS_MANUAL: '/api/musicas/manual',

  // Outros
  CONTATOS: '/api/contatos',
  SETLISTS: '/api/setlists',
  CONQUISTAS: '/api/conquistas',
  CONQUISTAS_RECENTES: '/api/conquistas/recentes',
  EQUIPAMENTOS: '/api/equipamentos',
  POSTS: '/api/posts',
  ENQUETES: '/api/enquetes',

  // Admin
  ADMIN_USUARIOS: '/api/admin/usuarios',
  ADMIN_MUSICAS: '/api/admin/musicas',
  ADMIN_SUGESTOES: '/api/admin/sugestoes',
  ADMIN_LOGS: '/api/admin/logs',
};

/**
 * Tipos de compromisso para usar nos formulários e na exibição.
 */
export const TIPOS_COMPROMISSO = [
    'Show', 
    'Ensaio', 
    'Gravação', 
    'Reunião'
];

/**
 * Status possíveis para um compromisso.
 */
export const STATUS_COMPROMISSO = {
    AGENDADO: 'Agendado',
    REALIZADO: 'Realizado',
    CANCELADO: 'Cancelado',
};

/**
 * Define a hierarquia dos planos. Quanto maior o número, maior o nível.
 */
export const HIERARQUIA_PLANOS = {
  free: 0,
  padrao: 1,
  premium: 2,
};
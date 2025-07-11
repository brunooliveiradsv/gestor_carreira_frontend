// src/App.jsx

import { Routes, Route } from 'react-router-dom';

// Importando nossas páginas e componentes de layout
import Autenticacao from './paginas/Autenticacao.jsx'; // A nova página unificada
import Agenda from './paginas/Agenda.jsx';
import Financeiro from './paginas/Financeiro.jsx';
import Conquistas from './paginas/Conquistas.jsx';
import RotaProtegida from './componentes/RotaProtegida.jsx';
import LayoutPrincipal from './componentes/LayoutPrincipal.jsx';
import AdminUsuarios from './paginas/AdminUsuarios.jsx';
import Contatos from './paginas/Contatos.jsx';
import Configuracoes from './paginas/Configuracoes.jsx';
import Repertorios from './paginas/Repertorios.jsx';
import Equipamentos from './paginas/Equipamentos.jsx';

function App() {
  return (
    <Routes>
      {/* Rotas Públicas: Login e Cadastro apontam para o mesmo componente */}
      <Route path="/login" element={<Autenticacao />} />
      <Route path="/cadastro" element={<Autenticacao />} />

      {/* Rota "Pai" que aplica o Layout e a Proteção a todas as rotas "filhas" */}
      <Route 
        element={
          <RotaProtegida>
            <LayoutPrincipal />
          </RotaProtegida>
        }
      >
        {/* As rotas abaixo são as páginas internas da aplicação */}
        <Route path="/" element={<Agenda />} />
        <Route path="/financeiro" element={<Financeiro />} />
        <Route path="/conquistas" element={<Conquistas />} />
         <Route path="/admin/usuarios" element={<AdminUsuarios />} />
         <Route path="/contatos" element={<Contatos />} />
         <Route path="/configuracoes" element={<Configuracoes />} />
         <Route path="/repertorios" element={<Repertorios />} />
         <Route path="/equipamentos" element={<Equipamentos />} />
        {/* Aqui entrarão as futuras rotas para Contatos, Repertório, etc. */}
      </Route>
    </Routes>
  )
}

export default App
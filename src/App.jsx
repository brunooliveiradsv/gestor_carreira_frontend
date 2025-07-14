// src/App.jsx

import { Routes, Route } from 'react-router-dom';

// Importando nossas páginas e componentes de layout
import Autenticacao from './paginas/Autenticacao.jsx';
import Dashboard from './paginas/Dashboard.jsx';
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
import RecuperarSenha from './paginas/RecuperarSenha.jsx';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Autenticacao />} />
      <Route path="/cadastro" element={<Autenticacao />} />
      {/* Apenas a rota para solicitar a recuperação é necessária */}
      <Route path="/recuperar-senha" element={<RecuperarSenha />} />
      
      {/* Rota com token foi REMOVIDA */}
      {/* <Route path="/redefinir-senha/:token" element={<RecuperarSenha />} /> */}

      <Route 
        element={
          <RotaProtegida>
            <LayoutPrincipal />
          </RotaProtegida>
        }
      >
        <Route path="/" element={<Dashboard />} /> 
        <Route path="/agenda" element={<Agenda />} />
        <Route path="/financeiro" element={<Financeiro />} />
        <Route path="/conquistas" element={<Conquistas />} />
        <Route path="/admin/usuarios" element={<AdminUsuarios />} />
        <Route path="/contatos" element={<Contatos />} />
        <Route path="/configuracoes" element={<Configuracoes />} />
        <Route path="/repertorios" element={<Repertorios />} />
        <Route path="/equipamentos" element={<Equipamentos />} />
      </Route>
    </Routes>
  )
}

export default App;
import { Routes, Route } from "react-router-dom";
import Autenticacao from "./paginas/Autenticacao.jsx";
import Dashboard from "./paginas/Dashboard.jsx";
import Agenda from "./paginas/Agenda.jsx";
import Financeiro from "./paginas/Financeiro.jsx";
import Conquistas from "./paginas/Conquistas.jsx";
import RotaProtegida from "./componentes/RotaProtegida.jsx";
import LayoutPrincipal from "./componentes/LayoutPrincipal.jsx";
import Contatos from "./paginas/Contatos.jsx";
import Configuracoes from "./paginas/Configuracoes.jsx";
import Repertorio from "./paginas/Repertorio.jsx";
import Equipamentos from "./paginas/Equipamentos.jsx";
import RecuperarSenha from "./paginas/RecuperarSenha.jsx";
import Setlists from "./paginas/Setlists.jsx";
import EditorDeSetlist from "./paginas/EditorDeSetlist.jsx";
import PaginaVitrine from "./paginas/PaginaVitrine.jsx"; 
import AdminPainel from "./paginas/AdminPainel.jsx";
import AdminUsuarios from "./paginas/AdminUsuarios.jsx";
import AdminMusicas from "./paginas/AdminMusicas.jsx";
import AdminSugestoes from "./paginas/AdminSugestoes.jsx";
import AdminLogs from "./paginas/AdminLogs.jsx";
import Mural from "./paginas/Mural.jsx";
import Assinatura from "./paginas/Assinatura.jsx"; // <-- Importando a nova página de Assinatura

function App() {
  return (
    <Routes>
      {/* Rotas Públicas */}
      <Route path="/login" element={<Autenticacao />} />
      <Route path="/cadastro" element={<Autenticacao />} />
      <Route path="/recuperar-senha" element={<RecuperarSenha />} />
      <Route path="/vitrine/:url_unica" element={<PaginaVitrine />} /> {/* <-- ROTA PÚBLICA NOVA */}

      {/* Rotas Protegidas */}
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
        <Route path="/contatos" element={<Contatos />} />
        <Route path="/configuracoes" element={<Configuracoes />} />
        <Route path="/repertorio" element={<Repertorio />} />
        <Route path="/equipamentos" element={<Equipamentos />} />
        <Route path="/setlists" element={<Setlists />} />
        <Route path="/setlists/editar/:id" element={<EditorDeSetlist />} />
        <Route path="/admin" element={<AdminPainel />} />
        <Route path="/admin/usuarios" element={<AdminUsuarios />} />
        <Route path="/admin/musicas" element={<AdminMusicas />} />
        <Route path="/admin/sugestoes" element={<AdminSugestoes />} />
        <Route path="/admin/logs" element={<AdminLogs />} />
        <Route path="/mural" element={<Mural />} />
        <Route path="/assinatura" element={<Assinatura />} /> {/* <-- ROTA PROTEGIDA NOVA */}
        
      </Route>
    </Routes>
  );
}

export default App;
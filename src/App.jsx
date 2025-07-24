// src/App.jsx
import { Routes, Route } from "react-router-dom";
import Autenticacao from "./paginas/Autenticacao.jsx";
import Dashboard from "./paginas/Dashboard.jsx";
import Agenda from "./paginas/Agenda.jsx";
import Financeiro from "./paginas/Financeiro.jsx";
import Conquistas from "./paginas/Conquistas.jsx";
import RotaProtegida from "./componentes/RotaProtegida.jsx";
import LayoutPrincipal from "./componentes/LayoutPrincipal.jsx";
import ProtegerPorPlano from "./componentes/ProtegerPorPlano.jsx";
import Contatos from "./paginas/Contatos.jsx";
import Configuracoes from "./paginas/Configuracoes.jsx";
import Repertorio from "./paginas/Repertorio.jsx";
import Equipamentos from "./paginas/Equipamentos.jsx";
import RecuperarSenha from "./paginas/RecuperarSenha.jsx";
import Setlists from "./paginas/Setlists.jsx";
import EditorDeSetlist from "./paginas/EditorDeSetlist.jsx";
import ShowCase from "./paginas/ShowCase.jsx"; 
import AdminPainel from "./paginas/AdminPainel.jsx";
import AdminUsuarios from "./paginas/AdminUsuarios.jsx";
import AdminMusicas from "./paginas/AdminMusicas.jsx";
import AdminSugestoes from "./paginas/AdminSugestoes.jsx";
import AdminLogs from "./paginas/AdminLogs.jsx";
import Mural from "./paginas/Mural.jsx";
import Assinatura from "./paginas/Assinatura.jsx";
import ModoPalco from "./paginas/ModoPalco.jsx";
import PaginaSetlistPublico from "./paginas/PaginaSetlistPublico.jsx";

function App() {
  return (
    <Routes>
      {/* Rotas Públicas */}
      <Route path="/login" element={<Autenticacao />} />
      <Route path="/cadastro" element={<Autenticacao />} />
      <Route path="/recuperar-senha" element={<RecuperarSenha />} />
      <Route path="/showcase/:url_unica" element={<ShowCase />} />
      <Route path="/setlist/:uuid" element={<PaginaSetlistPublico />} />
      
      {/* Rota de Tela Cheia */}
      <Route path="/setlists/palco/:id" element={<RotaProtegida><ProtegerPorPlano planoMinimo="premium"><ModoPalco /></ProtegerPorPlano></RotaProtegida>} />

      {/* ROTAS COM O LAYOUT PRINCIPAL */}
      <Route element={<RotaProtegida><LayoutPrincipal /></RotaProtegida>}>
        
        {/* Funcionalidades do Plano FREE (e superiores) */}
        <Route element={<ProtegerPorPlano planoMinimo="free" />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/agenda" element={<Agenda />} />
          <Route path="/contatos" element={<Contatos />} />
          <Route path="/conquistas" element={<Conquistas />} />
        </Route>

        {/* Funcionalidades do Plano PADRÃO (e superiores) */}
        <Route element={<ProtegerPorPlano planoMinimo="padrao" />}>
          <Route path="/financeiro" element={<Financeiro />} />
          <Route path="/equipamentos" element={<Equipamentos />} />
          <Route path="/repertorio" element={<Repertorio />} />
          <Route path="/setlists" element={<Setlists />} />
          <Route path="/setlists/editar/:id" element={<EditorDeSetlist />} />
        </Route>
        
        {/* Funcionalidades do Plano PREMIUM */}
        <Route element={<ProtegerPorPlano planoMinimo="premium" />}>
            <Route path="/mural" element={<Mural />} />
        </Route>

        {/* Funcionalidades de ADMIN */}
        <Route path="/admin" element={<AdminPainel />} />
        <Route path="/admin/usuarios" element={<AdminUsuarios />} />
        <Route path="/admin/musicas" element={<AdminMusicas />} />
        <Route path="/admin/sugestoes" element={<AdminSugestoes />} />
        <Route path="/admin/logs" element={<AdminLogs />} />

        {/* Rotas que não precisam de verificação de plano */}
        <Route path="/configuracoes" element={<Configuracoes />} />
        <Route path="/assinatura" element={<Assinatura />} />
      </Route>
    </Routes>
  );
}

export default App;
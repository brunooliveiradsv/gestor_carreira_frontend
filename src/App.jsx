// src/App.jsx
import { Routes, Route } from "react-router-dom";
import Autenticacao from "./paginas/Autenticacao.jsx";
import Dashboard from "./paginas/Dashboard.jsx";
// ... (outras importações de páginas)
import Mural from "./paginas/Mural.jsx";
import Assinatura from "./paginas/Assinatura.jsx";

import RotaProtegida from "./componentes/RotaProtegida.jsx";
import LayoutPrincipal from "./componentes/LayoutPrincipal.jsx";
// --- 1. IMPORTE O NOVO COMPONENTE ---
import VerificarAssinatura from "./componentes/VerificarAssinatura.jsx";

function App() {
  return (
    <Routes>
      {/* Rotas Públicas */}
      <Route path="/login" element={<Autenticacao />} />
      <Route path="/cadastro" element={<Autenticacao />} />
      <Route path="/recuperar-senha" element={<RecuperarSenha />} />
      <Route path="/vitrine/:url_unica" element={<PaginaVitrine />} />

      {/* Rotas Protegidas (exigem apenas login) */}
      <Route
        element={
          <RotaProtegida>
            <LayoutPrincipal />
          </RotaProtegida>
        }
      >
        {/* --- 2. ROTAS QUE NÃO PRECISAM DE ASSINATURA ATIVA --- */}
        {/* O usuário sempre pode aceder a estas páginas para gerir a sua conta */}
        <Route path="/assinatura" element={<Assinatura />} />
        <Route path="/configuracoes" element={<Configuracoes />} />

        {/* --- 3. ROTAS QUE EXIGEM ASSINATURA ATIVA --- */}
        {/* O novo componente "abraça" todas as rotas que precisam de pagamento */}
        <Route element={<VerificarAssinatura />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/agenda" element={<Agenda />} />
          <Route path="/financeiro" element={<Financeiro />} />
          <Route path="/conquistas" element={<Conquistas />} />
          <Route path="/contatos" element={<Contatos />} />
          <Route path="/repertorio" element={<Repertorio />} />
          <Route path="/equipamentos" element={<Equipamentos />} />
          <Route path="/setlists" element={<Setlists />} />
          <Route path="/setlists/editar/:id" element={<EditorDeSetlist />} />
          <Route path="/mural" element={<Mural />} />
          
          {/* As rotas de Admin também podem ser colocadas aqui dentro se exigirem assinatura */}
          <Route path="/admin" element={<AdminPainel />} />
          <Route path="/admin/usuarios" element={<AdminUsuarios />} />
          <Route path="/admin/musicas" element={<AdminMusicas />} />
          <Route path="/admin/sugestoes" element={<AdminSugestoes />} />
          <Route path="/admin/logs" element={<AdminLogs />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
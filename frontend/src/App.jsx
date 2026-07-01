import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './contexts/AuthContext';
import { CustomerAuthProvider } from './contexts/CustomerAuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import MenuPublico from './pages/MenuPublico';
import Login from './pages/Admin/Login';
import Dashboard from './pages/Admin/Dashboard';
import ClienteLogin from './pages/Cliente/ClienteLogin';
import ClienteCadastro from './pages/Cliente/ClienteCadastro';
import ClienteEsqueciSenha from './pages/Cliente/ClienteEsqueciSenha';
import ClienteRedefinirSenha from './pages/Cliente/ClienteRedefinirSenha';
import MeusPedidos from './pages/Cliente/MeusPedidos';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

function AppRoutes() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CustomerAuthProvider>
          <Routes>
            {/* Rotas Públicas */}
            <Route path="/" element={<MenuPublico />} />
            <Route path="/menu" element={<MenuPublico />} />

            {/* Autenticação de clientes */}
            <Route path="/entrar" element={<ClienteLogin />} />
            <Route path="/cadastro" element={<ClienteCadastro />} />
            <Route path="/esqueci-senha" element={<ClienteEsqueciSenha />} />
            <Route path="/redefinir-senha" element={<ClienteRedefinirSenha />} />
            <Route path="/meus-pedidos" element={<MeusPedidos />} />

            {/* Login de administrador */}
            <Route path="/admin/login" element={<Login />} />

            {/* Rotas Protegidas */}
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            {/* Rota padrão - redireciona para home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </CustomerAuthProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

function App() {
  if (GOOGLE_CLIENT_ID) {
    return (
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <AppRoutes />
      </GoogleOAuthProvider>
    );
  }
  return <AppRoutes />;
}

export default App;

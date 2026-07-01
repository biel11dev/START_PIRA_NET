import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useCustomerAuth } from '../../contexts/CustomerAuthContext';
import './ClienteAuth.css';

function ClienteLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, loginGoogle } = useCustomerAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const destino = location.state?.from || '/menu';
  const googleAtivo = !!import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.success) {
      navigate(destino, { replace: true });
    } else {
      setError(result.error);
    }
  };

  const handleGoogle = async (credentialResponse) => {
    setError('');
    setLoading(true);
    const result = await loginGoogle(credentialResponse.credential);
    setLoading(false);
    if (result.success) {
      navigate(destino, { replace: true });
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="cliente-auth-container">
      <div className="cliente-auth-box">
        <div className="cliente-auth-header">
          <img src="/start.png" alt="Start Pira" />
          <h1>Entrar</h1>
          <p>Acesse sua conta para finalizar o pedido</p>
        </div>

        <form className="cliente-auth-form" onSubmit={handleSubmit}>
          <div className="cliente-form-group">
            <label><FaEnvelope /> E-mail</label>
            <input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="cliente-form-group">
            <label><FaLock /> Senha</label>
            <div className="cliente-password-input">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="cliente-toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <Link className="cliente-link" to="/esqueci-senha">Esqueci a senha</Link>
          </div>

          {error && <div className="cliente-error">{error}</div>}

          <button type="submit" className="cliente-btn-primary" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        {googleAtivo && (
          <>
            <div className="cliente-divider">ou</div>
            <div className="cliente-google-wrap">
              <GoogleLogin
                onSuccess={handleGoogle}
                onError={() => setError('Não foi possível entrar com o Google')}
                text="continue_with"
                shape="pill"
              />
            </div>
          </>
        )}

        <div className="cliente-auth-footer">
          Não tem conta?{' '}
          <Link to="/cadastro" state={{ from: destino }}>Cadastre-se</Link>
        </div>
        <button className="cliente-back" onClick={() => navigate('/menu')}>
          ← Voltar ao cardápio
        </button>
      </div>
    </div>
  );
}

export default ClienteLogin;

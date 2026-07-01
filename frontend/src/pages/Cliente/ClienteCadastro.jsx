import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { FaUser, FaEnvelope, FaPhone, FaIdCard, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useCustomerAuth } from '../../contexts/CustomerAuthContext';
import './ClienteAuth.css';

// Máscara simples de CPF: 000.000.000-00
const formatarCpf = (v) =>
  v.replace(/\D/g, '').slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');

// Máscara simples de telefone: (00) 00000-0000
const formatarTelefone = (v) =>
  v.replace(/\D/g, '').slice(0, 11)
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2');

function ClienteCadastro() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    cpf: '',
    password: '',
    acceptedTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { cadastrar, loginGoogle } = useCustomerAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const destino = location.state?.from || '/menu';
  const googleAtivo = !!import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const setCampo = (campo, valor) => setForm((f) => ({ ...f, [campo]: valor }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.acceptedTerms) {
      setError('É necessário aceitar os termos e condições');
      return;
    }
    setLoading(true);
    const result = await cadastrar(form);
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
          <h1>Criar conta</h1>
          <p>Cadastre-se para acompanhar seus pedidos</p>
        </div>

        <form className="cliente-auth-form" onSubmit={handleSubmit}>
          <div className="cliente-form-row">
            <div className="cliente-form-group">
              <label><FaUser /> Nome</label>
              <input
                type="text"
                placeholder="Nome"
                value={form.firstName}
                onChange={(e) => setCampo('firstName', e.target.value)}
                required
                autoFocus
              />
            </div>
            <div className="cliente-form-group">
              <label>Sobrenome</label>
              <input
                type="text"
                placeholder="Sobrenome"
                value={form.lastName}
                onChange={(e) => setCampo('lastName', e.target.value)}
              />
            </div>
          </div>

          <div className="cliente-form-group">
            <label><FaEnvelope /> E-mail</label>
            <input
              type="email"
              placeholder="seu@email.com"
              value={form.email}
              onChange={(e) => setCampo('email', e.target.value)}
              required
            />
          </div>

          <div className="cliente-form-row">
            <div className="cliente-form-group">
              <label><FaPhone /> Telefone</label>
              <input
                type="tel"
                placeholder="(00) 00000-0000"
                value={form.phone}
                onChange={(e) => setCampo('phone', formatarTelefone(e.target.value))}
              />
            </div>
            <div className="cliente-form-group">
              <label><FaIdCard /> CPF</label>
              <input
                type="text"
                placeholder="000.000.000-00"
                value={form.cpf}
                onChange={(e) => setCampo('cpf', formatarCpf(e.target.value))}
              />
            </div>
          </div>

          <div className="cliente-form-group">
            <label><FaLock /> Senha</label>
            <div className="cliente-password-input">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Mínimo 6 caracteres"
                value={form.password}
                onChange={(e) => setCampo('password', e.target.value)}
                minLength={6}
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

          <label className="cliente-checkbox">
            <input
              type="checkbox"
              checked={form.acceptedTerms}
              onChange={(e) => setCampo('acceptedTerms', e.target.checked)}
            />
            <span>
              Li e aceito os <a href="/termos" target="_blank" rel="noreferrer">termos e condições</a> e a
              política de privacidade.
            </span>
          </label>

          {error && <div className="cliente-error">{error}</div>}

          <button type="submit" className="cliente-btn-primary" disabled={loading}>
            {loading ? 'Criando conta...' : 'Cadastrar'}
          </button>
        </form>

        {googleAtivo && (
          <>
            <div className="cliente-divider">ou</div>
            <div className="cliente-google-wrap">
              <GoogleLogin
                onSuccess={handleGoogle}
                onError={() => setError('Não foi possível entrar com o Google')}
                text="signup_with"
                shape="pill"
              />
            </div>
          </>
        )}

        <div className="cliente-auth-footer">
          Já tem conta?{' '}
          <Link to="/entrar" state={{ from: destino }}>Entrar</Link>
        </div>
        <button className="cliente-back" onClick={() => navigate('/menu')}>
          ← Voltar ao cardápio
        </button>
      </div>
    </div>
  );
}

export default ClienteCadastro;

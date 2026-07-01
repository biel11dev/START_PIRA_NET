import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { validarTokenResetCliente, redefinirSenhaCliente } from '../../services/api';
import './ClienteAuth.css';

function ClienteRedefinirSenha() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sucesso, setSucesso] = useState(false);
  const [tokenValido, setTokenValido] = useState(null); // null = validando
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      setTokenValido(false);
      return;
    }
    validarTokenResetCliente(token)
      .then(() => setTokenValido(true))
      .catch(() => setTokenValido(false));
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('A senha deve ter ao menos 6 caracteres');
      return;
    }
    if (password !== confirm) {
      setError('As senhas não coincidem');
      return;
    }
    setLoading(true);
    try {
      await redefinirSenhaCliente(token, password);
      setSucesso(true);
      setTimeout(() => navigate('/entrar'), 2500);
    } catch (err) {
      setError(err?.response?.data?.error || 'Não foi possível redefinir a senha.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cliente-auth-container">
      <div className="cliente-auth-box">
        <div className="cliente-auth-header">
          <img src="/start.png" alt="Start Pira" />
          <h1>Nova senha</h1>
          <p>Defina uma nova senha para sua conta</p>
        </div>

        {tokenValido === null && <p style={{ textAlign: 'center', color: '#777' }}>Validando link...</p>}

        {tokenValido === false && (
          <>
            <div className="cliente-error">
              Link inválido ou expirado. Solicite um novo link de recuperação.
            </div>
            <div className="cliente-auth-footer">
              <Link to="/esqueci-senha">Recuperar senha</Link>
            </div>
          </>
        )}

        {tokenValido === true && !sucesso && (
          <form className="cliente-auth-form" onSubmit={handleSubmit}>
            <div className="cliente-form-group">
              <label><FaLock /> Nova senha</label>
              <div className="cliente-password-input">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                  required
                  autoFocus
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

            <div className="cliente-form-group">
              <label><FaLock /> Confirmar senha</label>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Repita a senha"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                minLength={6}
                required
              />
            </div>

            {error && <div className="cliente-error">{error}</div>}

            <button type="submit" className="cliente-btn-primary" disabled={loading}>
              {loading ? 'Salvando...' : 'Redefinir senha'}
            </button>
          </form>
        )}

        {sucesso && (
          <div className="cliente-success">
            Senha redefinida com sucesso! Redirecionando para o login...
          </div>
        )}
      </div>
    </div>
  );
}

export default ClienteRedefinirSenha;

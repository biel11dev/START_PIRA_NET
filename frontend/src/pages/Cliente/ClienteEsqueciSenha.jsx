import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaEnvelope } from 'react-icons/fa';
import { esqueciSenhaCliente } from '../../services/api';
import './ClienteAuth.css';

function ClienteEsqueciSenha() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [enviado, setEnviado] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await esqueciSenhaCliente(email);
      setEnviado(true);
    } catch (err) {
      setError(err?.response?.data?.error || 'Não foi possível enviar o e-mail. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cliente-auth-container">
      <div className="cliente-auth-box">
        <div className="cliente-auth-header">
          <img src="/start.png" alt="Start Pira" />
          <h1>Recuperar senha</h1>
          <p>Enviaremos um link de redefinição para o seu e-mail</p>
        </div>

        {enviado ? (
          <>
            <div className="cliente-success">
              Se houver uma conta com este e-mail, você receberá as instruções em instantes.
              Verifique também a caixa de spam.
            </div>
            <button
              className="cliente-btn-primary"
              style={{ marginTop: 16, width: '100%' }}
              onClick={() => navigate('/entrar')}
            >
              Voltar ao login
            </button>
          </>
        ) : (
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

            {error && <div className="cliente-error">{error}</div>}

            <button type="submit" className="cliente-btn-primary" disabled={loading}>
              {loading ? 'Enviando...' : 'Enviar link de recuperação'}
            </button>
          </form>
        )}

        <div className="cliente-auth-footer">
          Lembrou a senha?{' '}
          <Link to="/entrar">Entrar</Link>
        </div>
      </div>
    </div>
  );
}

export default ClienteEsqueciSenha;

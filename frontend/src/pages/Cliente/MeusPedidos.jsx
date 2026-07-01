import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaBoxOpen, FaSyncAlt, FaReceipt } from 'react-icons/fa';
import { getPedidosCliente } from '../../services/api';
import { useCustomerAuth } from '../../contexts/CustomerAuthContext';
import './MeusPedidos.css';

// Rótulo e cor do status de pagamento
const PAGAMENTO_INFO = {
  approved: { label: 'Pago', cor: 'verde' },
  pending: { label: 'Aguardando pagamento', cor: 'laranja' },
  rejected: { label: 'Pagamento recusado', cor: 'vermelho' },
  cancelled: { label: 'Cancelado', cor: 'cinza' },
  expired: { label: 'Expirado', cor: 'cinza' },
  error: { label: 'Erro no pagamento', cor: 'vermelho' },
};

// Rótulo do andamento do pedido
const STATUS_INFO = {
  pending: 'Em análise',
  preparing: 'Em preparo',
  ready: 'Pronto para retirada',
  out_for_delivery: 'Saiu para entrega',
  delivered: 'Entregue',
  cancelled: 'Cancelado',
};

const formatarData = (iso) => {
  try {
    return new Date(iso).toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return '';
  }
};

const formatarValor = (v) =>
  Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function MeusPedidos() {
  const { isAuthenticated, customer } = useCustomerAuth();
  const navigate = useNavigate();
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  const carregar = useCallback(async () => {
    setLoading(true);
    setErro('');
    try {
      const dados = await getPedidosCliente();
      setPedidos(Array.isArray(dados) ? dados : []);
    } catch (e) {
      setErro(e?.response?.data?.error || 'Não foi possível carregar seus pedidos.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/entrar', { state: { from: '/meus-pedidos' } });
      return;
    }
    carregar();
  }, [isAuthenticated, navigate, carregar]);

  return (
    <div className="pedidos-page">
      <header className="pedidos-header">
        <button className="pedidos-voltar" onClick={() => navigate('/menu')}>
          <FaArrowLeft /> Voltar ao cardápio
        </button>
        <button className="pedidos-atualizar" onClick={carregar} disabled={loading}>
          <FaSyncAlt className={loading ? 'girando' : ''} /> Atualizar
        </button>
      </header>

      <div className="pedidos-container">
        <div className="pedidos-titulo">
          <FaReceipt />
          <div>
            <h1>Meus Pedidos</h1>
            {customer && <p>Olá, {customer.firstName}! Acompanhe aqui seus pedidos.</p>}
          </div>
        </div>

        {loading && <p className="pedidos-info">Carregando seus pedidos...</p>}

        {!loading && erro && <div className="pedidos-erro">{erro}</div>}

        {!loading && !erro && pedidos.length === 0 && (
          <div className="pedidos-vazio">
            <FaBoxOpen />
            <h2>Nenhum pedido ainda</h2>
            <p>Quando você finalizar uma compra, ela aparecerá aqui.</p>
            <button className="pedidos-btn-primary" onClick={() => navigate('/menu')}>
              Ver cardápio
            </button>
          </div>
        )}

        {!loading && !erro && pedidos.length > 0 && (
          <div className="pedidos-lista">
            {pedidos.map((pedido) => {
              const pag = PAGAMENTO_INFO[pedido.paymentStatus] || { label: pedido.paymentStatus || '—', cor: 'cinza' };
              const statusLabel = STATUS_INFO[pedido.status] || pedido.status;
              return (
                <div key={pedido.id} className="pedido-card">
                  <div className="pedido-card-topo">
                    <div>
                      <span className="pedido-numero">Pedido #{pedido.id}</span>
                      <span className="pedido-data">{formatarData(pedido.createdAt)}</span>
                    </div>
                    <span className={`pedido-badge ${pag.cor}`}>{pag.label}</span>
                  </div>

                  <div className="pedido-itens">
                    {(pedido.items || []).map((item) => (
                      <div key={item.id} className="pedido-item">
                        <span>{item.quantity}x {item.productName}</span>
                        <span>R$ {formatarValor(item.subtotal)}</span>
                      </div>
                    ))}
                  </div>

                  {pedido.observations && (
                    <p className="pedido-obs">Obs.: {pedido.observations}</p>
                  )}

                  <div className="pedido-card-rodape">
                    <span className="pedido-status">Situação: <strong>{statusLabel}</strong></span>
                    <span className="pedido-total">Total: <strong>R$ {formatarValor(pedido.total)}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default MeusPedidos;

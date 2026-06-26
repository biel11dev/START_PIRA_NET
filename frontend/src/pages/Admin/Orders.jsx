import { useState, useEffect } from 'react';
import { FaUser, FaPhone, FaMapMarkerAlt, FaShoppingBag, FaClipboardList } from 'react-icons/fa';
import { getOrders, updateOrderStatus } from '../../services/api';
import './Orders.css';
import '../Admin/Products.css';

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    pending: 0,
    ready: 0,
    outForDelivery: 0,
    delivered: 0,
    total: 0
  });

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await getOrders();
      setOrders(data);
      
      // Calculate stats
      const statsData = {
        pending: data.filter(o => o.status === 'pending').length,
        ready: data.filter(o => o.status === 'ready').length,
        outForDelivery: data.filter(o => o.status === 'out_for_delivery').length,
        delivered: data.filter(o => o.status === 'delivered').length,
        total: data.length
      };
      setStats(statsData);
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
      alert('Erro ao carregar pedidos');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const updated = await updateOrderStatus(orderId, newStatus);
      await loadOrders();

      // Follow-up por WhatsApp ao cliente conforme a nova etapa
      const followUp = updated?.whatsapp;
      if (followUp?.link) {
        window.open(followUp.link, '_blank');
      } else if (followUp && followUp.hasPhone === false) {
        alert('Status atualizado, mas o cliente não informou telefone — não foi possível enviar a mensagem.');
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      alert('Erro ao atualizar status do pedido');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Pendente',
      ready: 'Pronto',
      out_for_delivery: 'Saiu para entrega',
      delivered: 'Entregue',
      cancelled: 'Cancelado',
      // compatibilidade com pedidos antigos
      confirmed: 'Confirmado',
      preparing: 'Preparando'
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner"></div>
        <p>Carregando pedidos...</p>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <div className="page-header">
        <h2>Gerenciar Pedidos</h2>
      </div>

      <div className="stats-cards">
        <div className="stat-card pending">
          <h4>Pendentes</h4>
          <p>{stats.pending}</p>
        </div>
        <div className="stat-card ready">
          <h4>Prontos</h4>
          <p>{stats.ready}</p>
        </div>
        <div className="stat-card out_for_delivery">
          <h4>Saiu para entrega</h4>
          <p>{stats.outForDelivery}</p>
        </div>
        <div className="stat-card delivered">
          <h4>Entregues</h4>
          <p>{stats.delivered}</p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="empty-state">
          <FaShoppingBag />
          <p>Nenhum pedido encontrado</p>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map(order => (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <div>
                  <h3 className="order-id">Pedido #{order.id}</h3>
                  <p className="order-date">{formatDate(order.createdAt)}</p>
                </div>
                <div className="order-status">
                  <select
                    className={`status-select ${order.status}`}
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                  >
                    <option value="pending">Pendente</option>
                    <option value="ready">Pronto</option>
                    <option value="out_for_delivery">Saiu para entrega</option>
                    <option value="delivered">Entregue</option>
                    <option value="cancelled">Cancelado</option>
                  </select>
                </div>
              </div>

              <div className="order-body">
                <div className="customer-info">
                  <h4>Informações do Cliente</h4>
                  <div className="info-row">
                    <FaUser />
                    <span>{order.customerName}</span>
                  </div>
                  {order.customerPhone && (
                    <div className="info-row">
                      <FaPhone />
                      <span>{order.customerPhone}</span>
                    </div>
                  )}
                  {order.customerAddress && (
                    <div className="info-row">
                      <FaMapMarkerAlt />
                      <span>{order.customerAddress}</span>
                    </div>
                  )}
                </div>

                <div className="order-items">
                  <h4>
                    <FaClipboardList /> Itens do Pedido
                  </h4>
                  <div className="items-list">
                    {order.items.map(item => (
                      <div key={item.id} className="item-row">
                        <div className="item-info">
                          <div className="item-name">{item.productName}</div>
                          <div className="item-quantity">
                            Quantidade: {item.quantity} × R$ {item.unitPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </div>
                        </div>
                        <div className="item-price">
                          R$ {item.subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {order.observations && (
                  <div className="observations-section">
                    <h4>Observações:</h4>
                    <p>{order.observations}</p>
                  </div>
                )}

                <div className="order-total">
                  <span>Total:</span>
                  <span>R$ {order.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Orders;

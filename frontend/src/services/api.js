import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://api-start-pira-net.vercel.app/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Injeta o token de cliente (quando logado) nas requisições, para que
// os pedidos criados sejam vinculados à conta do cliente.
api.interceptors.request.use((config) => {
  const customerToken = localStorage.getItem('customerToken');
  if (customerToken) {
    config.headers.Authorization = `Bearer ${customerToken}`;
  }
  return config;
});

// ============================================
// AUTENTICAÇÃO DE CLIENTES
// ============================================

export const cadastrarCliente = async (dados) => {
  const response = await api.post('/customer/register', dados);
  return response.data;
};

export const loginCliente = async (email, password) => {
  const response = await api.post('/customer/login', { email, password });
  return response.data;
};

export const loginClienteGoogle = async (credential) => {
  const response = await api.post('/customer/google', { credential });
  return response.data;
};

export const getClienteAtual = async () => {
  const response = await api.get('/customer/me');
  return response.data;
};

export const esqueciSenhaCliente = async (email) => {
  const response = await api.post('/customer/forgot-password', { email });
  return response.data;
};

export const validarTokenResetCliente = async (token) => {
  const response = await api.post('/customer/validate-reset-token', { token });
  return response.data;
};

export const redefinirSenhaCliente = async (token, newPassword) => {
  const response = await api.post('/customer/reset-password', { token, newPassword });
  return response.data;
};

export const getPedidosCliente = async () => {
  const response = await api.get('/customer/orders');
  return response.data;
};

// Recupera os dados de um pedido pelo id (usado no retorno do Checkout Pro)
export const getPedidoPorId = async (id) => {
  const response = await api.get(`/pedido/${id}`);
  return response.data;
};

// ============================================
// CATEGORIAS
// ============================================

export const getCategories = async () => {
  const response = await api.get('/categories');
  return response.data;
};

export const getCategoryById = async (id) => {
  const response = await api.get(`/categories/${id}`);
  return response.data;
};

export const createCategory = async (categoryData) => {
  const response = await api.post('/categories', categoryData);
  return response.data;
};

export const updateCategory = async (id, categoryData) => {
  const response = await api.put(`/categories/${id}`, categoryData);
  return response.data;
};

export const deleteCategory = async (id) => {
  const response = await api.delete(`/categories/${id}`);
  return response.data;
};

// ============================================
// PRODUTOS
// ============================================

export const getProducts = async (params = {}) => {
  const response = await api.get('/products', { params });
  return response.data;
};

export const getProductById = async (id) => {
  const response = await api.get(`/products/${id}`);
  return response.data;
};

export const createProduct = async (productData) => {
  const response = await api.post('/products', productData);
  return response.data;
};

export const updateProduct = async (id, productData) => {
  const response = await api.put(`/products/${id}`, productData);
  return response.data;
};

export const updateProductAvailability = async (id, available) => {
  const response = await api.put(`/products/${id}/disponibilidade`, { available });
  return response.data;
};

export const deleteProduct = async (id) => {
  const response = await api.delete(`/products/${id}`);
  return response.data;
};

// ============================================
// CARDÁPIO (para clientes)
// ============================================

export const getCardapio = async () => {
  const response = await api.get('/cardapio');
  return response.data;
};

// ============================================
// CARDÁPIO POR COMPONENTES (sistema interno / QA)
// ============================================

// Cardápio com produtos montados por componentes (composição) vindo do sistema interno
export const getCardapioComponentes = async () => {
  const response = await api.get('/cardapio-qa');
  return response.data;
};

// Registra o pedido público como venda no sistema interno (baixa estoque)
export const criarPedidoComponentes = async (pedidoData) => {
  const response = await api.post('/pedido-qa', pedidoData);
  return response.data;
};

// ============================================
// PAGAMENTO PIX (Mercado Pago)
// ============================================

// Cria a cobrança PIX (NÃO dá baixa de estoque ainda). Retorna qrCode (copia e cola) etc.
export const criarPagamentoPix = async (pedidoData) => {
  const response = await api.post('/pagamento-pix', pedidoData);
  return response.data;
};

// Consulta o status do pagamento PIX (polling). Retorna { paid, status, orderId }.
export const consultarStatusPix = async (orderId) => {
  const response = await api.get(`/pagamento-pix/${orderId}/status`);
  return response.data;
};
// ============================================
// CHECKOUT PRO (Mercado Pago)
// ============================================

// Cria uma preferência de pagamento (Checkout Pro). Retorna { orderId, preferenceId, initPoint, publicKey }.
export const criarCheckoutPro = async (pedidoData) => {
  const response = await api.post('/preferencia-mp', pedidoData);
  return response.data;
};

// ============================================
// PEDIDOS
// ============================================

export const getOrders = async (params = {}) => {
  const response = await api.get('/orders', { params });
  return response.data;
};

export const getOrderById = async (id) => {
  const response = await api.get(`/orders/${id}`);
  return response.data;
};

export const createOrder = async (orderData) => {
  const response = await api.post('/pedido', orderData);
  return response.data;
};

export const updateOrderStatus = async (id, status) => {
  const response = await api.put(`/orders/${id}/status`, { status });
  return response.data;
};

// ============================================
// SUGESTÕES
// ============================================

export const getSugestoes = async () => {
  const response = await api.get('/sugestoes');
  return response.data;
};

export const createSugestao = async (sugestaoData) => {
  const response = await api.post('/sugestoes', sugestaoData);
  return response.data;
};

export const deleteSugestao = async (id) => {
  const response = await api.delete(`/sugestoes/${id}`);
  return response.data;
};

// ============================================
// SUGESTÕES DE MELHORIAS
// ============================================

export const getSugestoesMelhorias = async () => {
  const response = await api.get('/sugestoes-melhorias');
  return response.data;
};

export const createSugestaoMelhoria = async (sugestaoData) => {
  const response = await api.post('/sugestoes-melhorias', sugestaoData);
  return response.data;
};

export const votarSugestaoMelhoria = async (id, incremento) => {
  const response = await api.put(`/sugestoes-melhorias/${id}/votar`, { incremento });
  return response.data;
};

export const deleteSugestaoMelhoria = async (id) => {
  const response = await api.delete(`/sugestoes-melhorias/${id}`);
  return response.data;
};

// ============================================
// CONFIGURAÇÕES
// ============================================

export const getSettings = async () => {
  const response = await api.get('/settings');
  return response.data;
};

export const getSettingByKey = async (key) => {
  const response = await api.get(`/settings/${key}`);
  return response.data;
};

export const saveSettings = async (settingsData) => {
  const response = await api.post('/settings', settingsData);
  return response.data;
};

export const updateSetting = async (key, value, description = null) => {
  const response = await api.put(`/settings/${key}`, { value, description });
  return response.data;
};

export const deleteSetting = async (key) => {
  const response = await api.delete(`/settings/${key}`);
  return response.data;
};

// ============================================
// HEALTH CHECK
// ============================================

export const healthCheck = async () => {
  const response = await api.get('/health');
  return response.data;
};

export default api;

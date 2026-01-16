import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://api-start-pira-net.vercel.app/';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
// HEALTH CHECK
// ============================================

export const healthCheck = async () => {
  const response = await api.get('/health');
  return response.data;
};

export default api;

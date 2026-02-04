import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaEye, FaEyeSlash, FaBox } from 'react-icons/fa';
import { getProducts, getCategories, createProduct, updateProduct, deleteProduct, updateProductAvailability } from '../../services/api';
import './Products.css';

function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    available: ''
  });

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    available: true,
    categoryId: '',
    quantity: '',
    unit: '',
    costPrice: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsData, categoriesData] = await Promise.all([
        getProducts(),
        getCategories()
      ]);
      setProducts(productsData);
      
      // Flatten categories and subcategories
      const allCategories = [];
      categoriesData.forEach(cat => {
        allCategories.push(cat);
        if (cat.subcategories) {
          cat.subcategories.forEach(sub => allCategories.push(sub));
        }
      });
      setCategories(allCategories);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      alert('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        categoryId: formData.categoryId ? parseInt(formData.categoryId) : null,
        quantity: formData.quantity ? parseInt(formData.quantity) : null,
        costPrice: formData.costPrice ? parseFloat(formData.costPrice) : null
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, productData);
      } else {
        await createProduct(productData);
      }

      await loadData();
      closeModal();
      alert(editingProduct ? 'Produto atualizado!' : 'Produto criado!');
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      alert('Erro ao salvar produto');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      image: product.image || '',
      available: product.available,
      categoryId: product.categoryId?.toString() || '',
      quantity: product.quantity?.toString() || '',
      unit: product.unit || '',
      costPrice: product.costPrice?.toString() || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;
    
    try {
      await deleteProduct(id);
      await loadData();
      alert('Produto excluído!');
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      alert('Erro ao excluir produto');
    }
  };

  const toggleAvailability = async (id, currentStatus) => {
    try {
      await updateProductAvailability(id, !currentStatus);
      await loadData();
    } catch (error) {
      console.error('Erro ao atualizar disponibilidade:', error);
      alert('Erro ao atualizar disponibilidade');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      image: '',
      available: true,
      categoryId: '',
      quantity: '',
      unit: '',
      costPrice: ''
    });
  };

  const filteredProducts = products.filter(product => {
    const matchSearch = product.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                       product.description?.toLowerCase().includes(filters.search.toLowerCase());
    const matchCategory = !filters.category || product.categoryId?.toString() === filters.category;
    const matchAvailable = filters.available === '' || 
                          (filters.available === 'true' ? product.available : !product.available);
    
    return matchSearch && matchCategory && matchAvailable;
  });

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner"></div>
        <p>Carregando produtos...</p>
      </div>
    );
  }

  return (
    <div className="products-page">
      <div className="page-header">
        <h2>Gerenciar Produtos</h2>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <FaPlus /> Novo Produto
        </button>
      </div>

      <div className="filters-section">
        <div className="filters-grid">
          <div className="filter-group">
            <label>Buscar</label>
            <input
              type="text"
              placeholder="Nome ou descrição..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
          <div className="filter-group">
            <label>Categoria</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            >
              <option value="">Todas</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label>Disponibilidade</label>
            <select
              value={filters.available}
              onChange={(e) => setFilters({ ...filters, available: e.target.value })}
            >
              <option value="">Todos</option>
              <option value="true">Disponíveis</option>
              <option value="false">Indisponíveis</option>
            </select>
          </div>
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="empty-state">
          <FaBox />
          <p>Nenhum produto encontrado</p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="products-table-container desktop-view">
            <table className="products-table">
              <thead>
                <tr>
                  <th>Imagem</th>
                  <th>Nome</th>
                  <th>Descrição</th>
                  <th>Categoria</th>
                  <th>Preço</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map(product => (
                  <tr key={product.id}>
                    <td className="product-image-cell">{product.image || '📦'}</td>
                    <td className="product-name-cell">{product.name}</td>
                    <td className="product-description-cell">{product.description || '-'}</td>
                    <td>{product.category?.name || '-'}</td>
                    <td className="product-price-cell">
                      R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td>
                      <span className={`status-badge ${product.available ? 'available' : 'unavailable'}`}>
                        {product.available ? 'Disponível' : 'Indisponível'}
                      </span>
                    </td>
                    <td className="actions-cell">
                      <button
                        className="btn-icon toggle"
                        onClick={() => toggleAvailability(product.id, product.available)}
                        title={product.available ? 'Marcar como indisponível' : 'Marcar como disponível'}
                      >
                        {product.available ? <FaEye /> : <FaEyeSlash />}
                      </button>
                      <button
                        className="btn-icon edit"
                        onClick={() => handleEdit(product)}
                        title="Editar"
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="btn-icon delete"
                        onClick={() => handleDelete(product.id)}
                        title="Excluir"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards View */}
          <div className="products-cards-container mobile-view">
            {filteredProducts.map(product => (
              <div key={product.id} className="product-card">
                <div className="product-card-header">
                  <div className="product-card-image">{product.image || '📦'}</div>
                  <div className="product-card-info">
                    <h3>{product.name}</h3>
                    <span className={`status-badge ${product.available ? 'available' : 'unavailable'}`}>
                      {product.available ? 'Disponível' : 'Indisponível'}
                    </span>
                  </div>
                </div>
                
                <div className="product-card-body">
                  <div className="product-card-row">
                    <span className="label">Descrição:</span>
                    <span className="value">{product.description || '-'}</span>
                  </div>
                  <div className="product-card-row">
                    <span className="label">Categoria:</span>
                    <span className="value">{product.category?.name || '-'}</span>
                  </div>
                  <div className="product-card-row">
                    <span className="label">Preço:</span>
                    <span className="value price">R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>

                <div className="product-card-actions">
                  <button
                    className="btn-card-action toggle"
                    onClick={() => toggleAvailability(product.id, product.available)}
                  >
                    {product.available ? <FaEyeSlash /> : <FaEye />}
                    {product.available ? 'Ocultar' : 'Exibir'}
                  </button>
                  <button
                    className="btn-card-action edit"
                    onClick={() => handleEdit(product)}
                  >
                    <FaEdit /> Editar
                  </button>
                  <button
                    className="btn-card-action delete"
                    onClick={() => handleDelete(product.id)}
                  >
                    <FaTrash /> Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingProduct ? 'Editar Produto' : 'Novo Produto'}</h3>
              <button className="btn-close" onClick={closeModal}>×</button>
            </div>

            <form className="product-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nome *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Descrição</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Preço (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Preço de Custo (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.costPrice}
                    onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Emoji/Imagem</label>
                  <input
                    type="text"
                    placeholder="🍕"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Categoria</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  >
                    <option value="">Sem categoria</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Quantidade em Estoque</label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Unidade</label>
                  <input
                    type="text"
                    placeholder="un, kg, litro..."
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.available}
                    onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                  />
                  {' '}Produto disponível
                </label>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={closeModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  {editingProduct ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Products;

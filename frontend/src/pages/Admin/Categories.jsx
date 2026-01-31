import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaFolder } from 'react-icons/fa';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../../services/api';
import './Categories.css';
import '../Admin/Products.css';

function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    parentId: null,
    isSubcategory: false
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      alert('Erro ao carregar categorias');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const categoryData = {
        name: formData.name,
        parentId: formData.isSubcategory && formData.parentId ? parseInt(formData.parentId) : null
      };

      if (editingCategory) {
        await updateCategory(editingCategory.id, categoryData);
      } else {
        await createCategory(categoryData);
      }

      await loadCategories();
      closeModal();
      alert(editingCategory ? 'Categoria atualizada!' : 'Categoria criada!');
    } catch (error) {
      console.error('Erro ao salvar categoria:', error);
      alert('Erro ao salvar categoria');
    }
  };

  const handleEdit = (category, isSubcategory = false) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      parentId: category.parentId?.toString() || '',
      isSubcategory: !!category.parentId
    });
    setShowModal(true);
  };

  const handleDelete = async (id, hasSubcategories, hasProducts) => {
    if (hasSubcategories) {
      alert('Não é possível excluir uma categoria que possui subcategorias. Exclua as subcategorias primeiro.');
      return;
    }

    if (hasProducts) {
      if (!confirm('Esta categoria possui produtos. Ao excluir, os produtos ficarão sem categoria. Deseja continuar?')) {
        return;
      }
    } else {
      if (!confirm('Tem certeza que deseja excluir esta categoria?')) {
        return;
      }
    }
    
    try {
      await deleteCategory(id);
      await loadCategories();
      alert('Categoria excluída!');
    } catch (error) {
      console.error('Erro ao excluir categoria:', error);
      alert('Erro ao excluir categoria: ' + (error.response?.data?.error || error.message));
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setFormData({
      name: '',
      parentId: null,
      isSubcategory: false
    });
  };

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner"></div>
        <p>Carregando categorias...</p>
      </div>
    );
  }

  return (
    <div className="categories-page">
      <div className="page-header">
        <h2>Gerenciar Categorias</h2>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <FaPlus /> Nova Categoria
        </button>
      </div>

      {categories.length === 0 ? (
        <div className="empty-state">
          <FaFolder />
          <p>Nenhuma categoria cadastrada</p>
        </div>
      ) : (
        <div className="admin-categories-grid">
          {categories.map(category => (
            <div key={category.id} className="admin-category-card">
              <div className="admin-category-header">
                <div className="admin-category-info">
                  <h3>{category.name}</h3>
                  <p>
                    {category.subcategories?.length || 0} subcategoria(s) • {category.products?.length || 0} produto(s)
                  </p>
                </div>
                <div className="admin-category-actions">
                  <button
                    className="btn-icon-white"
                    onClick={() => handleEdit(category)}
                    title="Editar categoria"
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="btn-icon-white"
                    onClick={() => handleDelete(
                      category.id,
                      category.subcategories?.length > 0,
                      category.products?.length > 0
                    )}
                    title="Excluir categoria"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>

              {category.subcategories && category.subcategories.length > 0 ? (
                <div className="subcategories-list">
                  {category.subcategories.map(sub => (
                    <div key={sub.id} className="subcategory-item">
                      <div className="subcategory-info">
                        <h4>{sub.name}</h4>
                        <p>{sub.products?.length || 0} produto(s)</p>
                      </div>
                      <div className="actions-cell">
                        <button
                          className="btn-icon edit"
                          onClick={() => handleEdit(sub, true)}
                          title="Editar"
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="btn-icon delete"
                          onClick={() => handleDelete(sub.id, false, sub.products?.length > 0)}
                          title="Excluir"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-subcategories">
                  Nenhuma subcategoria
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingCategory ? 'Editar Categoria' : 'Nova Categoria'}</h3>
              <button className="btn-close" onClick={closeModal}>×</button>
            </div>

            <form className="product-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nome *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Pizzas, Bebidas, Sobremesas..."
                  required
                />
              </div>

              <div className="form-checkbox">
                <input
                  type="checkbox"
                  id="isSubcategory"
                  checked={formData.isSubcategory}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    isSubcategory: e.target.checked,
                    parentId: e.target.checked ? formData.parentId : null
                  })}
                />
                <label htmlFor="isSubcategory">Esta é uma subcategoria</label>
              </div>

              {formData.isSubcategory && (
                <div className="form-group">
                  <label>Categoria Pai *</label>
                  <select
                    value={formData.parentId || ''}
                    onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                    required={formData.isSubcategory}
                  >
                    <option value="">Selecione a categoria pai</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={closeModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  {editingCategory ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Categories;

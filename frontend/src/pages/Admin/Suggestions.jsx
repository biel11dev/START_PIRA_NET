import { useState, useEffect } from 'react';
import { FaThumbsUp, FaThumbsDown, FaTrash, FaLightbulb } from 'react-icons/fa';
import { getSugestoesMelhorias, votarSugestaoMelhoria, deleteSugestaoMelhoria } from '../../services/api';
import './Suggestions.css';
import '../Admin/Products.css';

function Suggestions() {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    category: ''
  });

  useEffect(() => {
    loadSuggestions();
  }, []);

  const loadSuggestions = async () => {
    try {
      setLoading(true);
      const data = await getSugestoesMelhorias();
      setSuggestions(data);
    } catch (error) {
      console.error('Erro ao carregar sugestões:', error);
      alert('Erro ao carregar sugestões');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (id, incremento) => {
    try {
      await votarSugestaoMelhoria(id, incremento);
      await loadSuggestions();
    } catch (error) {
      console.error('Erro ao votar:', error);
      alert('Erro ao registrar voto');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja excluir esta sugestão?')) return;
    
    try {
      await deleteSugestaoMelhoria(id);
      await loadSuggestions();
      alert('Sugestão excluída!');
    } catch (error) {
      console.error('Erro ao excluir sugestão:', error);
      alert('Erro ao excluir sugestão');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const filteredSuggestions = suggestions.filter(sug => {
    const matchSearch = sug.titulo.toLowerCase().includes(filters.search.toLowerCase()) ||
                       sug.descricao?.toLowerCase().includes(filters.search.toLowerCase());
    const matchCategory = !filters.category || sug.categoria === filters.category;
    
    return matchSearch && matchCategory;
  });

  const categories = [...new Set(suggestions.map(s => s.categoria))];
  
  const stats = {
    total: suggestions.length,
    totalVotes: suggestions.reduce((sum, s) => sum + s.votos, 0),
    avgVotes: suggestions.length > 0 
      ? (suggestions.reduce((sum, s) => sum + s.votos, 0) / suggestions.length).toFixed(1)
      : 0
  };

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner"></div>
        <p>Carregando sugestões...</p>
      </div>
    );
  }

  return (
    <div className="suggestions-page">
      <div className="page-header">
        <h2>Sugestões de Melhorias dos Clientes</h2>
      </div>

      <div className="stats-row">
        <div className="stat-box">
          <h4>Total de Sugestões</h4>
          <p>{stats.total}</p>
        </div>
        <div className="stat-box">
          <h4>Total de Votos</h4>
          <p>{stats.totalVotes}</p>
        </div>
        <div className="stat-box">
          <h4>Média de Votos</h4>
          <p>{stats.avgVotes}</p>
        </div>
      </div>

      <div className="filters-section">
        <div className="filters-row">
          <div className="filter-group">
            <label>Buscar</label>
            <input
              type="text"
              placeholder="Título ou descrição..."
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
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {filteredSuggestions.length === 0 ? (
        <div className="empty-state">
          <FaLightbulb />
          <p>Nenhuma sugestão encontrada</p>
        </div>
      ) : (
        <div className="suggestions-grid">
          {filteredSuggestions
            .sort((a, b) => b.votos - a.votos)
            .map(suggestion => (
            <div key={suggestion.id} className="suggestion-card">
              <div className="suggestion-header">
                <div className="suggestion-title-area">
                  <h3 className="suggestion-title">{suggestion.titulo}</h3>
                  <div className="suggestion-meta">
                    <span className="category-badge">{suggestion.categoria}</span>
                    <span className="suggestion-date">
                      {formatDate(suggestion.createdAt)}
                    </span>
                  </div>
                </div>
                <div className="votes-section">
                  <p className="votes-count">{suggestion.votos}</p>
                  <span className="votes-label">Votos</span>
                </div>
              </div>

              {suggestion.descricao && (
                <p className="suggestion-description">{suggestion.descricao}</p>
              )}

              <div className="suggestion-actions">
                <button
                  className="btn-vote-up"
                  onClick={() => handleVote(suggestion.id, 1)}
                  title="Adicionar voto"
                >
                  <FaThumbsUp /> Votar
                </button>
                <button
                  className="btn-vote-down"
                  onClick={() => handleVote(suggestion.id, -1)}
                  title="Remover voto"
                  disabled={suggestion.votos === 0}
                >
                  <FaThumbsDown /> Remover
                </button>
                <button
                  className="btn-icon delete"
                  onClick={() => handleDelete(suggestion.id)}
                  title="Excluir sugestão"
                  style={{ marginLeft: 'auto' }}
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Suggestions;

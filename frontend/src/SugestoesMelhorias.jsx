import { useState, useEffect } from 'react';
import { FaArrowUp, FaSearch, FaLightbulb, FaTimes } from 'react-icons/fa';
import './SugestoesMelhorias.css';

function SugestoesMelhorias({ onVoltar }) {
  const [sugestoes, setSugestoes] = useState([]);
  const [busca, setBusca] = useState('');
  const [filtro, setFiltro] = useState('mais-votados');
  const [modalNova, setModalNova] = useState(false);
  const [novaSugestao, setNovaSugestao] = useState({
    titulo: '',
    descricao: ''
  });
  const [loading, setLoading] = useState(true);
  const [votosUsuario, setVotosUsuario] = useState({});

  // Carregar sugestões do localStorage (simulação)
  useEffect(() => {
    carregarSugestoes();
  }, []);

  const carregarSugestoes = () => {
    setLoading(true);
    // Simulação de dados - em produção viria da API
    const sugestoesStorage = localStorage.getItem('sugestoes');
    const votosStorage = localStorage.getItem('votosUsuario');
    
    if (sugestoesStorage) {
      setSugestoes(JSON.parse(sugestoesStorage));
    }

    if (votosStorage) {
      setVotosUsuario(JSON.parse(votosStorage));
    }
    
    setLoading(false);
  };

  const votar = (id) => {
    const jaVotou = votosUsuario[id];
    
    if (jaVotou) {
      // Remover voto
      const novosVotos = { ...votosUsuario };
      delete novosVotos[id];
      setVotosUsuario(novosVotos);
      localStorage.setItem('votosUsuario', JSON.stringify(novosVotos));
      
      const novasSugestoes = sugestoes.map(s => 
        s.id === id ? { ...s, votos: s.votos - 1 } : s
      );
      setSugestoes(novasSugestoes);
      localStorage.setItem('sugestoes', JSON.stringify(novasSugestoes));
    } else {
      // Adicionar voto
      const novosVotos = { ...votosUsuario, [id]: true };
      setVotosUsuario(novosVotos);
      localStorage.setItem('votosUsuario', JSON.stringify(novosVotos));
      
      const novasSugestoes = sugestoes.map(s => 
        s.id === id ? { ...s, votos: s.votos + 1 } : s
      );
      setSugestoes(novasSugestoes);
      localStorage.setItem('sugestoes', JSON.stringify(novasSugestoes));
    }
  };

  const adicionarSugestao = () => {
    if (!novaSugestao.titulo.trim()) {
      alert('Por favor, adicione um título para a sugestão!');
      return;
    }

    const novaSugestaoObj = {
      id: Date.now(),
      titulo: novaSugestao.titulo,
      descricao: novaSugestao.descricao,
      votos: 0,
      categoria: 'Sugestão'
    };

    const novasSugestoes = [novaSugestaoObj, ...sugestoes];
    setSugestoes(novasSugestoes);
    localStorage.setItem('sugestoes', JSON.stringify(novasSugestoes));
    
    setModalNova(false);
    setNovaSugestao({ titulo: '', descricao: '' });
  };

  // Filtrar e ordenar sugestões
  const sugestoesFiltradas = sugestoes
    .filter(s => 
      s.titulo.toLowerCase().includes(busca.toLowerCase()) ||
      s.descricao.toLowerCase().includes(busca.toLowerCase())
    )
    .sort((a, b) => {
      if (filtro === 'mais-votados') return b.votos - a.votos;
      if (filtro === 'recentes') return b.id - a.id;
      return 0;
    });

  return (
    <div className="sugestoes-container">
      {/* Header */}
      <div className="sugestoes-header">
        <button className="btn-voltar" onClick={onVoltar}>
          ← Voltar ao Cardápio
        </button>
        <div className="header-content">
          <h1>
            <FaLightbulb /> Start Pira
          </h1>
          <p>Deixe-nos saber como podemos melhorar. Vote em ideias existentes ou sugira novas.</p>
        </div>
        <button className="btn-sugerir" onClick={() => setModalNova(true)}>
          Faça uma sugestão
        </button>
      </div>

      {/* Barra de busca e filtros */}
      <div className="sugestoes-toolbar">
        <div className="search-box">
          <FaSearch />
          <input
            type="text"
            placeholder="Pesquisar..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
        <div className="filtros">
          <button 
            className={filtro === 'mais-votados' ? 'active' : ''}
            onClick={() => setFiltro('mais-votados')}
          >
            ▲ Mais votados
          </button>
          <button 
            className={filtro === 'recentes' ? 'active' : ''}
            onClick={() => setFiltro('recentes')}
          >
            Recentes
          </button>
        </div>
      </div>

      {/* Lista de sugestões */}
      <div className="sugestoes-lista">
        {loading ? (
          <div className="loading">Carregando sugestões...</div>
        ) : sugestoesFiltradas.length === 0 ? (
          <div className="empty">
            <FaLightbulb size={50} />
            <p>Nenhuma sugestão encontrada</p>
          </div>
        ) : (
          sugestoesFiltradas.map(sugestao => (
            <div key={sugestao.id} className="sugestao-card">
              <button 
                className={`btn-votar ${votosUsuario[sugestao.id] ? 'votado' : ''}`}
                onClick={() => votar(sugestao.id)}
                title={votosUsuario[sugestao.id] ? 'Remover voto' : 'Votar'}
              >
                <FaArrowUp />
                <span>{sugestao.votos}</span>
              </button>
              <div className="sugestao-content">
                <h3>
                  {sugestao.titulo}
                  <span className="numero">#{sugestao.id}</span>
                </h3>
                <p>{sugestao.descricao}</p>
                <div className="sugestao-footer">
                  <span className="categoria">{sugestao.categoria}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Nova Sugestão */}
      {modalNova && (
        <div className="modal-overlay" onClick={() => setModalNova(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Nova Sugestão</h2>
              <button className="btn-close" onClick={() => setModalNova(false)}>
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Título da Sugestão *</label>
                <input
                  type="text"
                  placeholder="Ex: Adicionar notificação de pedidos no celular"
                  value={novaSugestao.titulo}
                  onChange={(e) => setNovaSugestao({ ...novaSugestao, titulo: e.target.value })}
                  maxLength={100}
                />
              </div>
              <div className="form-group">
                <label>Descrição (opcional)</label>
                <textarea
                  placeholder="Descreva sua sugestão com mais detalhes..."
                  value={novaSugestao.descricao}
                  onChange={(e) => setNovaSugestao({ ...novaSugestao, descricao: e.target.value })}
                  rows={5}
                  maxLength={500}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancelar" onClick={() => setModalNova(false)}>
                Cancelar
              </button>
              <button className="btn-enviar" onClick={adicionarSugestao}>
                Enviar Sugestão
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SugestoesMelhorias;

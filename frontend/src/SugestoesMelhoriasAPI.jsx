import { useState, useEffect } from 'react';
import { FaArrowUp, FaSearch, FaLightbulb, FaTimes } from 'react-icons/fa';
import { getSugestoesMelhorias, createSugestaoMelhoria, votarSugestaoMelhoria } from './services/api';
import './SugestoesMelhorias.css';

/**
 * Componente de Sugestões de Melhorias com integração à API
 * 
 * Esta versão se conecta ao backend para persistir dados
 * Use esta versão em produção quando o backend estiver configurado
 */
function SugestoesMelhoriasAPI({ onVoltar }) {
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
  const [erro, setErro] = useState(null);

  // Carregar sugestões da API
  useEffect(() => {
    carregarSugestoes();
    carregarVotosLocais();
  }, []);

  const carregarSugestoes = async () => {
    setLoading(true);
    setErro(null);
    try {
      const data = await getSugestoesMelhorias();
      setSugestoes(data);
    } catch (error) {
      console.error('Erro ao carregar sugestões:', error);
      setErro('Erro ao carregar sugestões. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const carregarVotosLocais = () => {
    const votosStorage = localStorage.getItem('votosUsuario');
    if (votosStorage) {
      setVotosUsuario(JSON.parse(votosStorage));
    }
  };

  const votar = async (id) => {
    const jaVotou = votosUsuario[id];
    const incremento = jaVotou ? -1 : 1;
    
    try {
      // Atualizar no backend
      await votarSugestaoMelhoria(id, incremento);
      
      // Atualizar estado local
      if (jaVotou) {
        const novosVotos = { ...votosUsuario };
        delete novosVotos[id];
        setVotosUsuario(novosVotos);
        localStorage.setItem('votosUsuario', JSON.stringify(novosVotos));
      } else {
        const novosVotos = { ...votosUsuario, [id]: true };
        setVotosUsuario(novosVotos);
        localStorage.setItem('votosUsuario', JSON.stringify(novosVotos));
      }
      
      // Atualizar lista de sugestões
      const novasSugestoes = sugestoes.map(s => 
        s.id === id ? { ...s, votos: s.votos + incremento } : s
      );
      setSugestoes(novasSugestoes);
    } catch (error) {
      console.error('Erro ao votar:', error);
      alert('Erro ao registrar voto. Tente novamente.');
    }
  };

  const adicionarSugestao = async () => {
    if (!novaSugestao.titulo.trim()) {
      alert('Por favor, adicione um título para a sugestão!');
      return;
    }

    try {
      const novaSugestaoObj = {
        titulo: novaSugestao.titulo.trim(),
        descricao: novaSugestao.descricao.trim(),
        categoria: 'Sugestão'
      };

      // Criar no backend
      const sugestaoCriada = await createSugestaoMelhoria(novaSugestaoObj);
      
      // Adicionar à lista local
      setSugestoes([sugestaoCriada, ...sugestoes]);
      
      setModalNova(false);
      setNovaSugestao({ titulo: '', descricao: '' });
      
      alert('Sugestão enviada com sucesso! Obrigado pelo feedback.');
    } catch (error) {
      console.error('Erro ao criar sugestão:', error);
      alert('Erro ao enviar sugestão. Tente novamente.');
    }
  };

  // Filtrar e ordenar sugestões
  const sugestoesFiltradas = sugestoes
    .filter(s => 
      s.titulo.toLowerCase().includes(busca.toLowerCase()) ||
      (s.descricao && s.descricao.toLowerCase().includes(busca.toLowerCase()))
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

      {/* Erro */}
      {erro && (
        <div className="error-message">
          <p>{erro}</p>
          <button onClick={carregarSugestoes}>Tentar novamente</button>
        </div>
      )}

      {/* Lista de sugestões */}
      <div className="sugestoes-lista">
        {loading ? (
          <div className="loading">Carregando sugestões...</div>
        ) : sugestoesFiltradas.length === 0 ? (
          <div className="empty">
            <FaLightbulb size={50} />
            <p>Nenhuma sugestão encontrada</p>
            <button className="btn-criar-primeira" onClick={() => setModalNova(true)}>
              Seja o primeiro a sugerir!
            </button>
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

export default SugestoesMelhoriasAPI;

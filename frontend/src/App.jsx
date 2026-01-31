import { useState, useEffect } from 'react';
import { FaShoppingCart, FaWhatsapp, FaSearch, FaTimes, FaPlus, FaMinus, FaStar, FaFire, FaTag, FaChevronDown, FaChevronUp, FaLightbulb } from 'react-icons/fa';
import { getCategories, getSugestoes, createOrder } from './services/api';
import SugestoesMelhorias from './SugestoesMelhoriasAPI';
import './App.css';

function App() {
  const [cardapio, setCardapio] = useState([]);
  const [sugestoes, setSugestoes] = useState([]);
  const [carrinho, setCarrinho] = useState([]);
  const [busca, setBusca] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('Todas');
  const [categoriaAtiva, setCategoriaAtiva] = useState('Todas');
  const [modalCarrinho, setModalCarrinho] = useState(false);
  const [loading, setLoading] = useState(true);
  const [subcategoriasAbertas, setSubcategoriasAbertas] = useState({});
  const [categoriasAbertas, setCategoriasAbertas] = useState({});
  const [modalConfirmacao, setModalConfirmacao] = useState(false);
  const [pedidoEnviado, setPedidoEnviado] = useState(null);
  const [enviandoPedido, setEnviandoPedido] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', produto: null });
  const [paginaAtual, setPaginaAtual] = useState('cardapio'); // 'cardapio' ou 'sugestoes'
  
  // Dados do cliente
  const [cliente, setCliente] = useState({
    nome: '',
    telefone: '',
    endereco: ''
  });
  const [observacoes, setObservacoes] = useState('');

  // Carregar cardápio e sugestões
  useEffect(() => {
    console.log('Iniciando carregamento de dados...');
    Promise.all([
      getCategories(), // Usar getCategories ao invés de getCardapio
      getSugestoes()
    ])
      .then(([categoriesData, sugestoesData]) => {
        console.log('Categorias recebidas:', categoriesData);
        console.log('Sugestões recebidas:', sugestoesData);
        setCardapio(categoriesData);
        setSugestoes(sugestoesData);
        setLoading(false);
      })
      .catch(error => {
        console.error('Erro ao carregar dados:', error);
        console.error('Detalhes do erro:', error.response?.data || error.message);
        setLoading(false);
      });
  }, []);

  // Scroll Spy - Detectar categoria visível
  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll('.category-section');
      let currentCategory = 'Todas';

      sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        const categoryName = section.getAttribute('data-category');
        
        // Se a seção está visível na viewport (considerando offset do header)
        if (rect.top <= 200 && rect.bottom >= 200) {
          currentCategory = categoryName;
        }
      });

      if (currentCategory !== categoriaAtiva) {
        setCategoriaAtiva(currentCategory);
        // Auto-scroll da barra de categorias
        const activeChip = document.querySelector(`.category-chip[data-category="${currentCategory}"]`);
        if (activeChip) {
          activeChip.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Executar uma vez ao montar

    return () => window.removeEventListener('scroll', handleScroll);
  }, [categoriaAtiva, cardapio]);

  // Scroll suave para categoria
  const scrollToCategory = (categoryName) => {
    setCategoriaFiltro('Todas'); // Mostrar todas para o scroll funcionar
    
    if (categoryName === 'Todas') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setTimeout(() => {
      const section = document.querySelector(`.category-section[data-category="${categoryName}"]`);
      if (section) {
        const headerOffset = 140; // Altura do header + barra de categorias (ajustado)
        const elementPosition = section.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }, 100);
  };

  // Toggle subcategoria
  const toggleSubcategoria = (subcategoriaId) => {
    setSubcategoriasAbertas(prev => ({
      ...prev,
      [subcategoriaId]: !prev[subcategoriaId]
    }));
  };

  // Toggle categoria principal
  const toggleCategoria = (categoriaId) => {
    setCategoriasAbertas(prev => ({
      ...prev,
      [categoriaId]: !prev[categoriaId]
    }));
  };

  // Adicionar ao carrinho
  const adicionarAoCarrinho = (produto) => {
    const itemExistente = carrinho.find(item => item.id === produto.id);
    
    if (itemExistente) {
      setCarrinho(carrinho.map(item =>
        item.id === produto.id
          ? { ...item, quantidade: item.quantidade + 1 }
          : item
      ));
    } else {
      setCarrinho([...carrinho, { ...produto, quantidade: 1 }]);
    }

    // Mostrar notificação
    setToast({ 
      show: true, 
      message: 'Produto adicionado ao carrinho!', 
      produto: produto.nome 
    });
    
    // Esconder após 3 segundos
    setTimeout(() => {
      setToast({ show: false, message: '', produto: null });
    }, 3000);
  };

  // Remover do carrinho
  const removerDoCarrinho = (produtoId) => {
    const item = carrinho.find(i => i.id === produtoId);
    if (item && item.quantidade > 1) {
      setCarrinho(carrinho.map(i =>
        i.id === produtoId ? { ...i, quantidade: i.quantidade - 1 } : i
      ));
    } else {
      setCarrinho(carrinho.filter(i => i.id !== produtoId));
    }
  };

  // Calcular total
  const calcularTotal = () => {
    return carrinho.reduce((total, item) => total + (item.preco * item.quantidade), 0);
  };

  // Enviar pedido para WhatsApp
  const enviarPedido = () => {
    if (!cliente.nome) {
      alert('Por favor, informe seu nome!');
      return;
    }
    
    if (carrinho.length === 0) {
      alert('Seu carrinho está vazio!');
      return;
    }

    const pedido = {
      cliente,
      itens: carrinho.map(item => ({
        produtoId: item.id,
        quantidade: item.quantidade
      })),
      observacoes
    };

    setEnviandoPedido(true);

    createOrder(pedido)
      .then(response => {
        // Salvar dados do pedido para exibir na confirmação
        setPedidoEnviado({
          orderId: response.orderId,
          total: calcularTotal(),
          itens: carrinho.length,
          cliente: cliente.nome
        });
        
        // Abrir WhatsApp
        window.open(response.whatsappLink, '_blank');
        
        // Limpar carrinho e fechar modal
        setCarrinho([]);
        setModalCarrinho(false);
        setCliente({ nome: '', telefone: '', endereco: '' });
        setObservacoes('');
        setEnviandoPedido(false);
        
        // Mostrar modal de confirmação
        setModalConfirmacao(true);
        
        // Fechar modal de confirmação após 5 segundos
        setTimeout(() => {
          setModalConfirmacao(false);
          setPedidoEnviado(null);
        }, 5000);
      })
      .catch(error => {
        console.error('Erro ao enviar pedido:', error);
        setEnviandoPedido(false);
        alert('Erro ao processar pedido. Tente novamente!');
      });
  };

  // Filtrar produtos
  const produtosFiltrados = cardapio
    .filter(categoria => categoriaFiltro === 'Todas' || categoria.name === categoriaFiltro)
    .map(categoria => {
      // Filtrar produtos diretos da categoria
      const produtosDiretos = (categoria.products || []).filter(produto =>
        produto.name.toLowerCase().includes(busca.toLowerCase()) ||
        (produto.description && produto.description.toLowerCase().includes(busca.toLowerCase()))
      );

      // Filtrar subcategorias e seus produtos
      const subcategoriasFiltradas = (categoria.subcategories || [])
        .map(sub => ({
          ...sub,
          products: (sub.products || []).filter(produto =>
            produto.available &&
            (produto.name.toLowerCase().includes(busca.toLowerCase()) ||
            (produto.description && produto.description.toLowerCase().includes(busca.toLowerCase())))
          )
        }))
        .filter(sub => sub.products.length > 0);

      return {
        ...categoria,
        products: produtosDiretos,
        subcategories: subcategoriasFiltradas
      };
    })
    .filter(categoria => 
      categoria.products.length > 0 || 
      (categoria.subcategories && categoria.subcategories.length > 0)
    );

  const categorias = ['Todas', ...cardapio.map(c => c.name)];
  const totalItensCarrinho = carrinho.reduce((total, item) => total + item.quantidade, 0);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Carregando cardápio...</p>
      </div>
    );
  }

  // Se está na página de sugestões
  if (paginaAtual === 'sugestoes') {
    return <SugestoesMelhorias onVoltar={() => setPaginaAtual('cardapio')} />;
  }

  return (
    <div className="app-container">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <img src="/start.png" alt="Start Pira" className="logo-image" />
          <h1 className="logo">Menu Digital - Start Pira Net</h1>
          <div className="header-actions">
            <button 
              className="sugestoes-button"
              onClick={() => setPaginaAtual('sugestoes')}
              title="Sugerir Melhorias"
            >
              <FaLightbulb />
            </button>
            <button 
              className="cart-button"
              onClick={() => setModalCarrinho(true)}
            >
              <FaShoppingCart />
              {totalItensCarrinho > 0 && (
                <span className="cart-badge">{totalItensCarrinho}</span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Barra de busca */}
      <div className="search-container">
        <div className="search-bar">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Buscar no cardápio..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
          {busca && (
            <FaTimes 
              className="clear-icon" 
              onClick={() => setBusca('')}
            />
          )}
        </div>
      </div>

      {/* Filtro de categorias */}
      <div className="categories-filter">
        {categorias.map(categoria => (
          <button
            key={categoria}
            data-category={categoria}
            className={`category-chip ${categoriaAtiva === categoria ? 'active' : ''}`}
            onClick={() => scrollToCategory(categoria)}
          >
            {categoria}
          </button>
        ))}
      </div>

      <div className="main-content">
        {/* Sugestões */}
        {sugestoes.length > 0 && categoriaFiltro === 'Todas' && !busca && (
          <section className="suggestions-section">
            <h2 className="section-title">
              <FaStar className="section-icon" /> Sugestões do Chef
            </h2>
            <div className="suggestions-grid">
              {sugestoes.map(produto => (
                <div key={produto.id} className="suggestion-card">
                  <div className="suggestion-badge">
                    {produto.motivo === 'Promoção' && <FaTag />}
                    {produto.motivo === 'Mais vendido' && <FaFire />}
                    {produto.motivo === 'Novidade' && <FaStar />}
                    <span>{produto.motivo}</span>
                  </div>
                  <div className="product-emoji">{produto.imagem}</div>
                  <h3>{produto.nome}</h3>
                  <p className="product-description">{produto.descricao}</p>
                  <div className="product-footer">
                    <span className="product-price">R$ {produto.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    <button 
                      className="add-button"
                      onClick={() => adicionarAoCarrinho(produto)}
                      disabled={!produto.disponivel}
                    >
                      <FaPlus /> Adicionar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Cardápio */}
        {produtosFiltrados.map(categoria => {
          const totalProdutos = (categoria.products?.length || 0) + 
            (categoria.subcategories?.reduce((acc, sub) => acc + (sub.products?.length || 0), 0) || 0);
          
          return (
            <section key={categoria.id} className="category-section" data-category={categoria.name}>
              <div 
                className="category-header"
                onClick={() => toggleCategoria(categoria.id)}
              >
                <h2 className="section-title">
                  {categoria.name}
                  <span className="product-count">
                    ({totalProdutos} {totalProdutos === 1 ? 'produto' : 'produtos'})
                  </span>
                </h2>
                <button className="toggle-button toggle-button-large">
                  {categoriasAbertas[categoria.id] ? <FaChevronUp /> : <FaChevronDown />}
                </button>
              </div>

              {categoriasAbertas[categoria.id] && (
                <div className="category-content">
                  {/* Produtos diretos da categoria */}
                  {categoria.products && categoria.products.length > 0 && (
                    <div className="products-grid">
                      {categoria.products.map(produto => (
                        <div key={produto.id} className="product-card">
                          <div className="product-emoji">{produto.image}</div>
                          <h3>{produto.name}</h3>
                          <p className="product-description">{produto.description}</p>
                          <div className="product-footer">
                            <span className="product-price">R$ {produto.price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            <button 
                              className="add-button"
                              onClick={() => adicionarAoCarrinho({
                                id: produto.id,
                                nome: produto.name,
                                descricao: produto.description,
                                preco: produto.price,
                                imagem: produto.image,
                                disponivel: produto.available
                              })}
                              disabled={!produto.available}
                            >
                              <FaPlus /> Adicionar
                            </button>
                          </div>
                          {!produto.available && (
                            <div className="unavailable-overlay">Indisponível</div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

            {/* Subcategorias com produtos */}
            {categoria.subcategories && categoria.subcategories.map(subcategoria => (
              <div key={subcategoria.id} className="subcategory-section">
                <div 
                  className="subcategory-header"
                  onClick={() => toggleSubcategoria(subcategoria.id)}
                >
                  <h3 className="subcategory-title">
                    {subcategoria.name}
                    <span className="product-count">
                      ({subcategoria.products.length} {subcategoria.products.length === 1 ? 'produto' : 'produtos'})
                    </span>
                  </h3>
                  <button className="toggle-button">
                    {subcategoriasAbertas[subcategoria.id] ? <FaChevronUp /> : <FaChevronDown />}
                  </button>
                </div>
                
                {subcategoriasAbertas[subcategoria.id] && (
                  <div className="products-grid subcategory-products">
                    {subcategoria.products.map(produto => (
                      <div key={produto.id} className="product-card">
                        <div className="product-emoji">{produto.image}</div>
                        <h3>{produto.name}</h3>
                        <p className="product-description">{produto.description}</p>
                        <div className="product-footer">
                          <span className="product-price">R$ {produto.price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          <button 
                            className="add-button"
                            onClick={() => adicionarAoCarrinho({
                              id: produto.id,
                              nome: produto.name,
                              descricao: produto.description,
                              preco: produto.price,
                              imagem: produto.image,
                              disponivel: produto.available
                            })}
                            disabled={!produto.available}
                          >
                            <FaPlus /> Adicionar
                          </button>
                        </div>
                        {!produto.available && (
                          <div className="unavailable-overlay">Indisponível</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
                </div>
              )}
            </section>
          );
        })}

        {produtosFiltrados.length === 0 && (
          <div className="empty-state">
            <p>😔 Nenhum produto encontrado</p>
          </div>
        )}
      </div>

      {/* Modal do Carrinho */}
      {modalCarrinho && (
        <div className="modal-overlay" onClick={() => setModalCarrinho(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🛒 Seu Pedido</h2>
              <button 
                className="close-button"
                onClick={() => setModalCarrinho(false)}
              >
                <FaTimes />
              </button>
            </div>

            <div className="modal-body">
              {carrinho.length === 0 ? (
                <div className="empty-cart">
                  <p>Seu carrinho está vazio</p>
                </div>
              ) : (
                <>
                  <div className="cart-items">
                    {carrinho.map(item => (
                      <div key={item.id} className="cart-item">
                        <div className="cart-item-info">
                          <span className="cart-item-emoji">{item.imagem}</span>
                          <div>
                            <h4>{item.nome}</h4>
                            <p className="cart-item-price">R$ {item.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                          </div>
                        </div>
                        <div className="cart-item-controls">
                          <button onClick={() => removerDoCarrinho(item.id)}>
                            <FaMinus />
                          </button>
                          <span className="quantity">{item.quantidade}</span>
                          <button onClick={() => adicionarAoCarrinho(item)}>
                            <FaPlus />
                          </button>
                        </div>
                        <span className="cart-item-total">
                          R$ {(item.preco * item.quantidade).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="cart-total">
                    <h3>Total</h3>
                    <h3 className="total-value">R$ {calcularTotal().toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
                  </div>

                  <div className="customer-form">
                    <h3>Seus Dados</h3>
                    <input
                      type="text"
                      placeholder="Nome *"
                      value={cliente.nome}
                      onChange={(e) => setCliente({ ...cliente, nome: e.target.value })}
                      required
                    />
                    <input
                      type="tel"
                      placeholder="Telefone"
                      value={cliente.telefone}
                      onChange={(e) => setCliente({ ...cliente, telefone: e.target.value })}
                    />
                    <input
                      type="text"
                      placeholder="Endereço (para entrega)"
                      value={cliente.endereco}
                      onChange={(e) => setCliente({ ...cliente, endereco: e.target.value })}
                    />
                    <textarea
                      placeholder="Observações (opcional)"
                      value={observacoes}
                      onChange={(e) => setObservacoes(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <button 
                    className="whatsapp-button"
                    onClick={enviarPedido}
                    disabled={enviandoPedido}
                  >
                    {enviandoPedido ? (
                      <>
                        <span className="spinner"></span> Enviando pedido...
                      </>
                    ) : (
                      <>
                        <FaWhatsapp /> Enviar Pedido pelo WhatsApp
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação */}
      {modalConfirmacao && pedidoEnviado && (
        <div className="modal-overlay modal-confirmacao">
          <div className="modal-content confirmacao-content">
            <div className="confirmacao-icon">
              <div className="checkmark-circle">
                <div className="checkmark"></div>
              </div>
            </div>
            <h2 className="confirmacao-title">🎉 Pedido Enviado com Sucesso!</h2>
            <div className="confirmacao-details">
              <p className="confirmacao-numero">Pedido #{pedidoEnviado.orderId}</p>
              <div className="confirmacao-info">
                <p>👤 <strong>Cliente:</strong> {pedidoEnviado.cliente}</p>
                <p>📦 <strong>Itens:</strong> {pedidoEnviado.itens} {pedidoEnviado.itens === 1 ? 'produto' : 'produtos'}</p>
                <p>💰 <strong>Total:</strong> R$ {pedidoEnviado.total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
            </div>
            <div className="confirmacao-mensagem">
              <p>✅ Seu pedido foi encaminhado para o WhatsApp</p>
              <p>📱 Complete o envio pela conversa aberta</p>
            </div>
            <button 
              className="confirmacao-button"
              onClick={() => {
                setModalConfirmacao(false);
                setPedidoEnviado(null);
              }}
            >
              Entendi
            </button>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.show && (
        <div className="toast-notification">
          <div className="toast-content">
            <FaShoppingCart className="toast-icon" />
            <div className="toast-text">
              <strong>{toast.message}</strong>
              {toast.produto && <span>{toast.produto}</span>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

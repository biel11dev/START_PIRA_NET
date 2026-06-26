import { useState, useEffect, useRef } from 'react';
import { FaShoppingCart, FaWhatsapp, FaSearch, FaTimes, FaPlus, FaMinus, FaStar, FaFire, FaTag, FaChevronDown, FaChevronUp, FaLightbulb, FaMoon, FaSun, FaCopy, FaCheck, FaQrcode } from 'react-icons/fa';
import { getCardapioComponentes, criarPagamentoPix, consultarStatusPix, criarCheckoutPro, getSugestoes, getSettings } from '../services/api';
import SugestoesMelhorias from '../SugestoesMelhoriasAPI';
import '../App.css';

function MenuPublico() {
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
  // Pagamento PIX (Mercado Pago)
  const [pixData, setPixData] = useState(null); // { orderId, qrCode, qrCodeBase64, ticketUrl, total }
  const [pixStatus, setPixStatus] = useState('idle'); // idle | pending | paid | expired | rejected | cancelled
  const [pixCopiado, setPixCopiado] = useState(false);
  // Pagamento Checkout Pro (Mercado Pago)
  const [checkoutData, setCheckoutData] = useState(null); // { orderId, preferenceId, publicKey, initPoint, total }
  const [checkoutStatus, setCheckoutStatus] = useState('idle'); // idle | pending | paid | rejected | cancelled | expired
  const [iniciandoCheckout, setIniciandoCheckout] = useState(false);
  const walletBrickRef = useRef(null);
  const [toast, setToast] = useState({ show: false, message: '', produto: null });
  const [paginaAtual, setPaginaAtual] = useState('cardapio'); // 'cardapio' ou 'sugestoes'
  const [bannerImage, setBannerImage] = useState('');
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });
  
  // Dados do cliente
  const [cliente, setCliente] = useState({
    nome: '',
    telefone: '',
    endereco: ''
  });
  const [observacoes, setObservacoes] = useState('');

  // Composição (produtos montados por componentes)
  const [compModalProduct, setCompModalProduct] = useState(null);
  const [compSelections, setCompSelections] = useState({}); // { composicaoId: [opcaoId, ...] }
  // Variação de unidade selecionada por produto (groupId -> estoqueId)
  const [variacaoSel, setVariacaoSel] = useState({});

  // Aplicar tema ao carregar e quando mudar
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Alternar tema
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  // Carregar cardápio e sugestões
  useEffect(() => {
    console.log('Iniciando carregamento de dados...');
    
    Promise.all([
      getCardapioComponentes(),
      getSugestoes(),
      getSettings()
    ])
      .then(([categoriesData, sugestoesData, settingsData]) => {
        console.log('Categorias recebidas:', categoriesData);
        console.log('Sugestões recebidas:', sugestoesData);
        console.log('Configurações recebidas:', settingsData);
        setCardapio(categoriesData);
        setSugestoes(sugestoesData);
        setBannerImage(settingsData.bannerImage || '');
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

  // Polling do status do pagamento PIX enquanto estiver pendente
  useEffect(() => {
    if (!pixData?.orderId || pixStatus !== 'pending') return;

    const interval = setInterval(async () => {
      try {
        const res = await consultarStatusPix(pixData.orderId);
        if (res.paid) {
          setPixStatus('paid');
          setPedidoEnviado({
            orderId: pixData.orderId,
            total: pixData.total,
            itens: pixData.itens,
            cliente: pixData.cliente
          });
          setCarrinho([]);
          clearInterval(interval);
          // Notifica a empresa pelo WhatsApp com o pedido pago
          if (res.whatsappLink) {
            window.open(res.whatsappLink, '_blank');
          }
        } else if (['rejected', 'cancelled', 'expired'].includes(res.status)) {
          setPixStatus(res.status);
          clearInterval(interval);
        }
      } catch (e) {
        // Ignora falhas transit\u00f3rias de rede durante o polling
        console.debug('Polling PIX:', e.message);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [pixData, pixStatus]);

  // Polling do status do pagamento Checkout Pro enquanto estiver pendente
  useEffect(() => {
    if (!checkoutData?.orderId || checkoutStatus !== 'pending') return;

    const interval = setInterval(async () => {
      try {
        const res = await consultarStatusPix(checkoutData.orderId);
        if (res.paid) {
          setCheckoutStatus('paid');
          setPedidoEnviado({
            orderId: checkoutData.orderId,
            total: checkoutData.total,
            itens: checkoutData.itens,
            cliente: checkoutData.cliente
          });
          setCarrinho([]);
          clearInterval(interval);
          if (res.whatsappLink) {
            window.open(res.whatsappLink, '_blank');
          }
        } else if (['rejected', 'cancelled', 'expired'].includes(res.status)) {
          setCheckoutStatus(res.status);
          clearInterval(interval);
        }
      } catch (e) {
        console.debug('Polling Checkout Pro:', e.message);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [checkoutData, checkoutStatus]);

  // Renderiza o botão Wallet Brick do Mercado Pago quando a preferência está pronta
  useEffect(() => {
    if (!checkoutData?.preferenceId || !checkoutData?.publicKey) return;
    if (typeof window === 'undefined' || !window.MercadoPago) return;

    let cancelado = false;
    const container = document.getElementById('walletBrick_container');
    if (container) container.innerHTML = '';

    try {
      const mp = new window.MercadoPago(checkoutData.publicKey, { locale: 'pt-BR' });
      const bricks = mp.bricks();
      bricks
        .create('wallet', 'walletBrick_container', {
          initialization: { preferenceId: checkoutData.preferenceId },
          customization: { texts: { valueProp: 'smart_option' } }
        })
        .then((controller) => {
          if (cancelado) controller?.unmount?.();
          else walletBrickRef.current = controller;
        })
        .catch((err) => console.debug('Wallet Brick:', err?.message));
    } catch (err) {
      console.debug('MercadoPago SDK:', err?.message);
    }

    return () => {
      cancelado = true;
      try { walletBrickRef.current?.unmount?.(); } catch { /* noop */ }
      walletBrickRef.current = null;
    };
  }, [checkoutData]);

  // Retorno das back_urls do Checkout Pro: retoma o acompanhamento do pedido
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pagamento = params.get('pagamento');
    const pedidoId = params.get('pedido');
    if (!pagamento || !pedidoId) return;

    setCheckoutData({ orderId: Number(pedidoId), preferenceId: null, publicKey: null, total: 0, itens: 0, cliente: '' });
    setCheckoutStatus(pagamento === 'falha' ? 'rejected' : 'pending');

    // Limpa os parâmetros da URL para evitar reprocessar ao recarregar
    window.history.replaceState({}, '', window.location.pathname);
  }, []);

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

  // Chave única de um item do carrinho (produto simples ou montado por componentes)
  const chaveItem = (item) => item.compostoKey || `p${item.id}`;

  // Mostra notificação de item adicionado
  const notificarAdicao = (nome) => {
    setToast({ show: true, message: 'Produto adicionado ao carrinho!', produto: nome });
    setTimeout(() => setToast({ show: false, message: '', produto: null }), 3000);
  };

  // Adiciona um item já pronto ao carrinho (incrementa se já existir)
  const adicionarItemCarrinho = (novoItem) => {
    const chave = chaveItem(novoItem);
    const existente = carrinho.find(i => chaveItem(i) === chave);
    if (existente) {
      setCarrinho(carrinho.map(i =>
        chaveItem(i) === chave ? { ...i, quantidade: i.quantidade + 1 } : i
      ));
    } else {
      setCarrinho([...carrinho, { ...novoItem, quantidade: 1 }]);
    }
    notificarAdicao(novoItem.nome);
  };

  // Decide entre abrir modal de composição ou adicionar direto
  const handleAdicionar = (produto, variacao) => {
    if (variacao.composicoes && variacao.composicoes.length > 0) {
      setCompSelections({});
      setCompModalProduct({
        id: variacao.estoqueId,
        name: produto.name,
        description: produto.description,
        image: produto.image,
        unit: variacao.unit,
        price: variacao.price,
        available: variacao.available,
        composicoes: variacao.composicoes
      });
      return;
    }
    adicionarItemCarrinho({
      id: variacao.estoqueId,
      nome: produto.name,
      descricao: produto.description,
      preco: variacao.price,
      imagem: produto.image,
      unit: variacao.unit,
      disponivel: variacao.available
    });
  };

  // Retorna a variação de unidade atualmente selecionada de um produto
  const getVariacaoSelecionada = (produto) => {
    const selId = variacaoSel[produto.groupId];
    return produto.variacoes.find(v => v.estoqueId === selId) || produto.variacoes[0];
  };

  // Seleciona/desmarca uma opção de composição
  const toggleCompOpcao = (composicaoId, opcaoId, multiplo, maxOpcoes) => {
    setCompSelections(prev => {
      const atual = prev[composicaoId] || [];
      if (atual.includes(opcaoId)) {
        return { ...prev, [composicaoId]: atual.filter(id => id !== opcaoId) };
      }
      if (!multiplo) return { ...prev, [composicaoId]: [opcaoId] };
      if (atual.length >= maxOpcoes) return { ...prev, [composicaoId]: [...atual.slice(1), opcaoId] };
      return { ...prev, [composicaoId]: [...atual, opcaoId] };
    });
  };

  // Preço extra acumulado das opções selecionadas
  const calcularExtrasComposicao = (produto, selecoes) => {
    let extra = 0;
    (produto.composicoes || []).forEach(comp => {
      const sel = selecoes[comp.id] || [];
      comp.opcoes.filter(o => sel.includes(o.id)).forEach(o => { extra += o.valorExtra || 0; });
    });
    return extra;
  };

  // Confirma a composição e adiciona ao carrinho
  const confirmarComposicao = () => {
    if (!compModalProduct) return;
    const comps = compModalProduct.composicoes || [];

    // Validar grupos obrigatórios
    for (const comp of comps) {
      if (comp.obrigatorio && (compSelections[comp.id] || []).length < 1) {
        alert(`Selecione uma opção para: "${comp.nome}"`);
        return;
      }
    }

    const labelParts = [];
    comps.forEach(comp => {
      const sel = compSelections[comp.id] || [];
      const selecionadas = comp.opcoes.filter(o => sel.includes(o.id));
      if (selecionadas.length > 0) labelParts.push(`${comp.nome}: ${selecionadas.map(o => o.nome).join(', ')}`);
    });

    const precoFinal = compModalProduct.price + calcularExtrasComposicao(compModalProduct, compSelections);
    const composicaoJSON = JSON.stringify(compSelections);
    const compostoKey = `${compModalProduct.id}__${composicaoJSON}`;

    adicionarItemCarrinho({
      id: compModalProduct.id,
      compostoKey,
      nome: compModalProduct.name,
      descricao: compModalProduct.description,
      preco: precoFinal,
      imagem: compModalProduct.image,
      unit: compModalProduct.unit,
      disponivel: compModalProduct.available,
      composicao: composicaoJSON,
      composicaoLabel: labelParts.join(' | ')
    });
    setCompModalProduct(null);
  };

  // Remover do carrinho
  const removerDoCarrinho = (chave) => {
    const item = carrinho.find(i => chaveItem(i) === chave);
    if (item && item.quantidade > 1) {
      setCarrinho(carrinho.map(i =>
        chaveItem(i) === chave ? { ...i, quantidade: i.quantidade - 1 } : i
      ));
    } else {
      setCarrinho(carrinho.filter(i => chaveItem(i) !== chave));
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
        id: item.id,
        name: item.nome,
        price: item.preco,
        quantity: item.quantidade,
        unit: item.unit,
        composicao: item.composicao || null,
        composicaoLabel: item.composicaoLabel || null
      })),
      observacoes
    };

    setEnviandoPedido(true);

    // Gera a cobrança PIX (a baixa de estoque só ocorre após o pagamento confirmado)
    criarPagamentoPix(pedido)
      .then(response => {
        setPixData({
          orderId: response.orderId,
          qrCode: response.qrCode,
          qrCodeBase64: response.qrCodeBase64,
          ticketUrl: response.ticketUrl,
          total: response.total ?? calcularTotal(),
          itens: carrinho.length,
          cliente: cliente.nome
        });
        setPixStatus('pending');
        setPixCopiado(false);
        setEnviandoPedido(false);
        setModalCarrinho(false);
      })
      .catch(error => {
        console.error('Erro ao gerar PIX:', error);
        setEnviandoPedido(false);
        const msg = error.response?.data?.error || error.response?.data?.details || 'Erro ao gerar o PIX. Tente novamente!';
        alert(msg);
      });
  };

  // Copia o código PIX (copia e cola) para a área de transferência
  const copiarPix = async () => {
    if (!pixData?.qrCode) return;
    try {
      await navigator.clipboard.writeText(pixData.qrCode);
      setPixCopiado(true);
      setTimeout(() => setPixCopiado(false), 2500);
    } catch {
      alert('Não foi possível copiar. Selecione e copie o código manualmente.');
    }
  };

  // Fecha o modal do PIX. Se já foi pago, limpa os dados do cliente.
  const fecharPix = () => {
    const pago = pixStatus === 'paid';
    setPixData(null);
    setPixStatus('idle');
    if (pago) {
      setCliente({ nome: '', telefone: '', endereco: '' });
      setObservacoes('');
    }
  };

  // Inicia o pagamento via Checkout Pro (cartão, PIX, boleto na página do Mercado Pago)
  const pagarComCheckoutPro = () => {
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
        id: item.id,
        name: item.nome,
        price: item.preco,
        quantity: item.quantidade,
        unit: item.unit,
        composicao: item.composicao || null,
        composicaoLabel: item.composicaoLabel || null
      })),
      observacoes,
      backBase: window.location.origin
    };

    setIniciandoCheckout(true);

    criarCheckoutPro(pedido)
      .then(response => {
        setCheckoutData({
          orderId: response.orderId,
          preferenceId: response.preferenceId,
          publicKey: response.publicKey,
          initPoint: response.initPoint,
          total: response.total ?? calcularTotal(),
          itens: carrinho.length,
          cliente: cliente.nome
        });
        setCheckoutStatus('pending');
        setIniciandoCheckout(false);
        setModalCarrinho(false);
      })
      .catch(error => {
        console.error('Erro ao iniciar Checkout Pro:', error);
        setIniciandoCheckout(false);
        const msg = error.response?.data?.error || error.response?.data?.details || 'Erro ao iniciar o checkout. Tente novamente!';
        alert(msg);
      });
  };

  // Fecha o modal do Checkout Pro. Se já foi pago, limpa os dados do cliente.
  const fecharCheckout = () => {
    const pago = checkoutStatus === 'paid';
    try { walletBrickRef.current?.unmount?.(); } catch { /* noop */ }
    walletBrickRef.current = null;
    setCheckoutData(null);
    setCheckoutStatus('idle');
    if (pago) {
      setCliente({ nome: '', telefone: '', endereco: '' });
      setObservacoes('');
    }
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

  // Renderiza um card de produto com seletor de variação de unidade (quando houver mais de uma)
  const renderProduto = (produto) => {
    const variacao = getVariacaoSelecionada(produto);
    const multiVariacao = produto.variacoes.length > 1;
    const temComposicao = variacao.composicoes && variacao.composicoes.length > 0;
    return (
      <div key={produto.groupId} className="product-card">
        <div className="product-emoji">
          {produto.image && (produto.image.startsWith('http') || produto.image.startsWith('data:image')) ? (
            <img src={produto.image} alt={produto.name} className="product-image" />
          ) : (
            <span>{produto.image || '📦'}</span>
          )}
        </div>
        <h3>{produto.name}</h3>
        {produto.description && <p className="product-description">{produto.description}</p>}

        {multiVariacao ? (
          <div className="variacao-options">
            {produto.variacoes.map(v => (
              <button
                key={v.estoqueId}
                type="button"
                className={`variacao-option ${v.estoqueId === variacao.estoqueId ? 'ativa' : ''} ${!v.available ? 'esgotada' : ''}`}
                onClick={() => setVariacaoSel(prev => ({ ...prev, [produto.groupId]: v.estoqueId }))}
              >
                <span className="variacao-unit">{v.unit}</span>
                <span className="variacao-price">R$ {v.price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="product-unit-label">{variacao.unit}</div>
        )}

        <div className="product-footer">
          <span className="product-price">R$ {variacao.price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          <button
            className="add-button"
            onClick={() => handleAdicionar(produto, variacao)}
            disabled={!variacao.available}
          >
            <FaPlus /> {temComposicao ? 'Montar' : 'Adicionar'}
          </button>
        </div>
        {!variacao.available && (
          <div className="unavailable-overlay">Indisponível</div>
        )}
      </div>
    );
  };

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
              className="theme-toggle-button"
              onClick={toggleTheme}
              title={theme === 'light' ? 'Modo Escuro' : 'Modo Claro'}
            >
              {theme === 'light' ? <FaMoon /> : <FaSun />}
            </button>
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

      {/* Banner/Capa */}
      {bannerImage && (
        <div className="hero-banner">
          <img src={bannerImage} alt="Banner Start Pira" className="banner-image" />
        </div>
      )}

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
                      onClick={() => adicionarItemCarrinho(produto)}
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
                      {categoria.products.map(produto => renderProduto(produto))}
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
                    {subcategoria.products.map(produto => renderProduto(produto))}
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
                      <div key={chaveItem(item)} className="cart-item">
                        <div className="cart-item-info">
                          <span className="cart-item-emoji">
                            {item.imagem && (item.imagem.startsWith('http') || item.imagem.startsWith('data:image')) ? (
                              <img src={item.imagem} alt={item.nome} className="cart-item-image" />
                            ) : (
                              <span>{item.imagem || '📦'}</span>
                            )}
                          </span>
                          <div>
                            <h4>{item.nome}</h4>
                            {item.composicaoLabel && (
                              <p className="cart-item-composicao">{item.composicaoLabel}</p>
                            )}
                            <p className="cart-item-price">R$ {item.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                          </div>
                        </div>
                        <div className="cart-item-controls">
                          <button className="alternador" onClick={() => removerDoCarrinho(chaveItem(item))}>
                            <FaMinus />
                          </button>
                          <span className="quantity">{item.quantidade}</span>
                          <button className="alternador" onClick={() => adicionarItemCarrinho(item)}>
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
                    disabled={enviandoPedido || iniciandoCheckout}
                  >
                    {enviandoPedido ? (
                      <>
                        <span className="spinner"></span> Gerando PIX...
                      </>
                    ) : (
                      <>
                        <FaQrcode /> Pagar com PIX (copia e cola)
                      </>
                    )}
                  </button>

                  <button
                    className="checkout-pro-button"
                    onClick={pagarComCheckoutPro}
                    disabled={enviandoPedido || iniciandoCheckout}
                  >
                    {iniciandoCheckout ? (
                      <>
                        <span className="spinner"></span> Abrindo checkout...
                      </>
                    ) : (
                      <>
                        <FaShoppingCart /> Pagar com Mercado Pago (cartão, PIX, boleto)
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Pagamento PIX */}
      {pixData && (
        <div className="modal-overlay pix-overlay">
          <div className="modal-content pix-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2><FaQrcode /> Pagamento via PIX</h2>
              <button className="close-button" onClick={fecharPix}>
                <FaTimes />
              </button>
            </div>

            <div className="modal-body pix-body">
              {pixStatus === 'paid' ? (
                <div className="pix-pago">
                  <div className="checkmark-circle"><div className="checkmark"></div></div>
                  <h3>Pagamento confirmado! 🎉</h3>
                  <p>Pedido #{pixData.orderId} recebido.</p>
                  <p className="pix-valor-pago">
                    Total pago: R$ {pixData.total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <button className="confirmacao-button" onClick={fecharPix}>Concluir</button>
                </div>
              ) : ['rejected', 'cancelled', 'expired'].includes(pixStatus) ? (
                <div className="pix-falha">
                  <p className="pix-falha-titulo">
                    {pixStatus === 'expired' ? '⏰ O PIX expirou.' : '❌ Pagamento não concluído.'}
                  </p>
                  <p>Você pode gerar um novo PIX e tentar novamente.</p>
                  <button className="confirmacao-button" onClick={fecharPix}>Fechar</button>
                </div>
              ) : (
                <>
                  <p className="pix-instrucao">
                    Escaneie o QR Code ou use o <strong>copia e cola</strong> no app do seu banco.
                  </p>

                  <p className="pix-total">
                    Valor: <strong>R$ {pixData.total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                  </p>

                  {pixData.qrCodeBase64 && (
                    <div className="pix-qr">
                      <img src={`data:image/png;base64,${pixData.qrCodeBase64}`} alt="QR Code PIX" />
                    </div>
                  )}

                  {pixData.qrCode && (
                    <div className="pix-copiacola">
                      <textarea readOnly value={pixData.qrCode} onClick={(e) => e.target.select()} />
                      <button className="pix-copiar-btn" onClick={copiarPix}>
                        {pixCopiado ? <><FaCheck /> Copiado!</> : <><FaCopy /> Copiar código</>}
                      </button>
                    </div>
                  )}

                  <div className="pix-aguardando">
                    <span className="pix-spinner"></span>
                    Aguardando confirmação do pagamento...
                  </div>

                  {pixData.ticketUrl && (
                    <a className="pix-ticket-link" href={pixData.ticketUrl} target="_blank" rel="noopener noreferrer">
                      Abrir comprovante / pagar pelo Mercado Pago
                    </a>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Pagamento Checkout Pro (Mercado Pago) */}
      {checkoutData && (
        <div className="modal-overlay pix-overlay">
          <div className="modal-content pix-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2><FaShoppingCart /> Pagamento Mercado Pago</h2>
              <button className="close-button" onClick={fecharCheckout}>
                <FaTimes />
              </button>
            </div>

            <div className="modal-body pix-body">
              {checkoutStatus === 'paid' ? (
                <div className="pix-pago">
                  <div className="checkmark-circle"><div className="checkmark"></div></div>
                  <h3>Pagamento confirmado! 🎉</h3>
                  <p>Pedido #{checkoutData.orderId} recebido.</p>
                  {checkoutData.total > 0 && (
                    <p className="pix-valor-pago">
                      Total pago: R$ {checkoutData.total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  )}
                  <button className="confirmacao-button" onClick={fecharCheckout}>Concluir</button>
                </div>
              ) : ['rejected', 'cancelled', 'expired'].includes(checkoutStatus) ? (
                <div className="pix-falha">
                  <p className="pix-falha-titulo">
                    {checkoutStatus === 'expired' ? '⏰ O pagamento expirou.' : '❌ Pagamento não concluído.'}
                  </p>
                  <p>Você pode tentar novamente.</p>
                  <button className="confirmacao-button" onClick={fecharCheckout}>Fechar</button>
                </div>
              ) : (
                <>
                  <p className="pix-instrucao">
                    Conclua o pagamento com <strong>cartão, PIX ou boleto</strong> de forma segura pelo Mercado Pago.
                  </p>

                  {checkoutData.total > 0 && (
                    <p className="pix-total">
                      Valor: <strong>R$ {checkoutData.total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                    </p>
                  )}

                  {/* Botão oficial do Mercado Pago (Wallet Brick) */}
                  <div id="walletBrick_container"></div>

                  {checkoutData.initPoint && (
                    <a className="pix-ticket-link" href={checkoutData.initPoint} target="_blank" rel="noopener noreferrer">
                      Abrir checkout do Mercado Pago
                    </a>
                  )}

                  <div className="pix-aguardando">
                    <span className="pix-spinner"></span>
                    Aguardando confirmação do pagamento...
                  </div>
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

      {/* Modal de Composição (montar produto por componentes) */}
      {compModalProduct && (
        <div className="modal-overlay" onClick={() => setCompModalProduct(null)}>
          <div className="modal-content composicao-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🧩 Montar {compModalProduct.name}</h2>
              <button className="close-button" onClick={() => setCompModalProduct(null)}>
                <FaTimes />
              </button>
            </div>

            <div className="modal-body">
              {(() => {
                const comps = compModalProduct.composicoes || [];
                // Mostra apenas até o primeiro grupo ainda não preenchido (revelação progressiva)
                const firstEmptyIdx = comps.findIndex(c => !(compSelections[c.id] || []).length);
                const visibleComps = firstEmptyIdx === -1 ? comps : comps.slice(0, firstEmptyIdx + 1);
                return visibleComps.map(comp => {
                  const selecionadas = compSelections[comp.id] || [];
                  return (
                  <div key={comp.id} className="composicao-grupo">
                    <div className="composicao-grupo-header">
                      <h3>
                        {comp.nome}
                        {comp.obrigatorio && <span className="composicao-obrigatorio"> *</span>}
                      </h3>
                      {comp.multiplo && (
                        <span className="composicao-limite">até {comp.maxOpcoes}</span>
                      )}
                    </div>
                    {comp.descricao && <p className="composicao-descricao">{comp.descricao}</p>}
                    <div className="composicao-opcoes">
                      {comp.opcoes.map(opcao => {
                        const ativa = selecionadas.includes(opcao.id);
                        return (
                          <button
                            key={opcao.id}
                            type="button"
                            className={`composicao-opcao ${ativa ? 'ativa' : ''}`}
                            onClick={() => toggleCompOpcao(comp.id, opcao.id, comp.multiplo, comp.maxOpcoes)}
                          >
                            <span>{opcao.nome}</span>
                            {opcao.valorExtra > 0 && (
                              <span className="composicao-extra">
                                +R$ {opcao.valorExtra.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  );
                });
              })()}

              <div className="cart-total">
                <h3>Total do item</h3>
                <h3 className="total-value">
                  R$ {(compModalProduct.price + calcularExtrasComposicao(compModalProduct, compSelections)).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h3>
              </div>

              <button className="whatsapp-button" onClick={confirmarComposicao}>
                <FaPlus /> Adicionar ao Carrinho
              </button>
            </div>
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

export default MenuPublico;

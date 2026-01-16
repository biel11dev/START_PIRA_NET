# Pedidos Online - Frontend

Frontend do sistema de pedidos online com cardápio digital e integração com WhatsApp.

## 🚀 Tecnologias

- **React** - Biblioteca JavaScript para construção de interfaces
- **Vite** - Build tool e dev server
- **Axios** - Cliente HTTP para requisições à API
- **React Icons** - Biblioteca de ícones

## 📦 Instalação

```bash
npm install
```

## ⚙️ Configuração

1. Copie o arquivo de exemplo de variáveis de ambiente:
```bash
copy .env.example .env
```

2. Configure a URL da API no arquivo `.env`:
```env
VITE_API_URL=http://localhost:3001/api
```

## 🏃 Execução

### Modo desenvolvimento
```bash
npm run dev
```
O frontend estará disponível em `http://localhost:5173`

### Build para produção
```bash
npm run build
```

### Preview da build
```bash
npm run preview
```

## 📁 Estrutura do Projeto

```
frontend/
├── src/
│   ├── assets/          # Imagens e recursos estáticos
│   ├── services/        # Serviços de API
│   │   └── api.js      # Cliente HTTP configurado
│   ├── App.jsx         # Componente principal
│   ├── App.css         # Estilos do app
│   ├── main.jsx        # Entry point
│   └── index.css       # Estilos globais
├── public/             # Arquivos públicos
├── .env                # Variáveis de ambiente
├── .env.example        # Exemplo de variáveis
├── index.html          # HTML principal
├── vite.config.js      # Configuração do Vite
└── package.json        # Dependências
```

## 🔌 API Service

O projeto utiliza um serviço centralizado de API (`src/services/api.js`) com as seguintes funções:

### Categorias
- `getCategories()` - Lista todas as categorias
- `getCategoryById(id)` - Busca categoria por ID
- `createCategory(data)` - Cria nova categoria
- `updateCategory(id, data)` - Atualiza categoria
- `deleteCategory(id)` - Remove categoria

### Produtos
- `getProducts(params)` - Lista produtos (com filtros opcionais)
- `getProductById(id)` - Busca produto por ID
- `createProduct(data)` - Cria novo produto
- `updateProduct(id, data)` - Atualiza produto
- `updateProductAvailability(id, available)` - Atualiza disponibilidade
- `deleteProduct(id)` - Remove produto

### Cardápio
- `getCardapio()` - Retorna cardápio completo para clientes

### Pedidos
- `getOrders(params)` - Lista pedidos
- `getOrderById(id)` - Busca pedido por ID
- `createOrder(data)` - Cria novo pedido
- `updateOrderStatus(id, status)` - Atualiza status do pedido

### Sugestões
- `getSugestoes()` - Lista sugestões ativas
- `createSugestao(data)` - Cria nova sugestão
- `deleteSugestao(id)` - Remove sugestão

## 🎨 Funcionalidades

- ✅ Visualização do cardápio digital
- ✅ Busca de produtos
- ✅ Filtro por categorias
- ✅ Sugestões e destaques do chef
- ✅ Carrinho de compras
- ✅ Integração com WhatsApp
- ✅ Interface responsiva

## 🔗 Integração com Backend

Certifique-se de que a API backend está rodando na porta configurada no `.env`. Por padrão:
- Backend: `http://localhost:3001`
- Frontend: `http://localhost:5173`

## 📝 Variáveis de Ambiente

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `VITE_API_URL` | URL base da API | `http://localhost:3001/api` |

## 🛠️ Scripts Disponíveis

- `npm run dev` - Inicia servidor de desenvolvimento
- `npm run build` - Cria build de produção
- `npm run preview` - Preview da build
- `npm run lint` - Executa linter

## 📱 Fluxo de Pedido

1. Cliente navega pelo cardápio
2. Adiciona produtos ao carrinho
3. Preenche dados pessoais (nome, telefone, endereço)
4. Envia pedido
5. Sistema cria pedido no banco de dados
6. Gera mensagem formatada do WhatsApp
7. Redireciona para WhatsApp com mensagem pronta

## 🎯 Próximas Melhorias

- [ ] Painel administrativo para gerenciar produtos
- [ ] Sistema de autenticação
- [ ] Histórico de pedidos
- [ ] Notificações em tempo real
- [ ] Modo escuro
- [ ] PWA (Progressive Web App)

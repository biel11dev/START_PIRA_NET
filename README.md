# 🍽️ Sistema de Pedidos Online

Sistema completo de pedidos online com cardápio digital e integração com WhatsApp.

## 📋 Sobre o Projeto

Este é o projeto **frontend** do sistema de pedidos online. O backend foi movido para um projeto separado chamado **api-start-pira-net**.

## 🏗️ Estrutura dos Projetos

```
📁 PEDIDOS_ONLINE (Frontend)
├── frontend/              # Aplicação React
│   ├── src/
│   │   ├── services/     # Serviços de API
│   │   ├── App.jsx       # Componente principal
│   │   └── ...
│   ├── .env              # Variáveis de ambiente
│   └── package.json
└── package.json          # Scripts do workspace

📁 api-start-pira-net (Backend) - Projeto Separado
├── server.js             # Servidor Express
├── schema.prisma         # Schema do Prisma
├── .env                  # Variáveis de ambiente
└── package.json
```

## 🚀 Tecnologias

### Frontend
- React + Vite
- Axios
- React Icons

### Backend (projeto separado)
- Node.js + Express
- Prisma ORM
- PostgreSQL (Neon)
- CORS

## ⚙️ Configuração

### 1. Frontend (este projeto)

```bash
cd frontend
npm install
```

Crie o arquivo `.env`:
```env
VITE_API_URL=http://localhost:3001/api
```

Execute:
```bash
npm run dev
```

### 2. Backend (api-start-pira-net)

Navegue para o projeto backend:
```bash
cd ..\api-start-pira-net
npm install
```

Configure o `.env` com sua connection string do banco de dados:
```env
DATABASE_URL="sua_connection_string_postgresql"
PORT=3001
WHATSAPP_NUMBER=5511999999999
```

Execute as migrations do Prisma:
```bash
npx prisma migrate dev
npx prisma generate
```

Inicie o servidor:
```bash
npm run dev
```

## 🌐 URLs

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001/api

## 📱 Funcionalidades

### Para Clientes
- ✅ Visualizar cardápio completo
- ✅ Buscar produtos
- ✅ Filtrar por categorias
- ✅ Ver sugestões do chef
- ✅ Adicionar produtos ao carrinho
- ✅ Fazer pedido via WhatsApp

### API Backend
- ✅ CRUD de Categorias
- ✅ CRUD de Produtos
- ✅ Gestão de Pedidos
- ✅ Sugestões/Destaques
- ✅ Integração com banco PostgreSQL via Prisma

## 🗃️ Banco de Dados

O sistema utiliza PostgreSQL (Neon) com as seguintes tabelas:

- `categories` - Categorias e subcategorias
- `products` - Produtos do cardápio
- `orders` - Pedidos realizados
- `order_items` - Itens dos pedidos
- `suggestions` - Sugestões de produtos

## 📝 Scripts Disponíveis

### Frontend
```bash
npm run dev       # Servidor de desenvolvimento
npm run build     # Build de produção
npm run preview   # Preview da build
```

### Backend
```bash
npm start         # Produção
npm run dev       # Desenvolvimento com watch
```

## 🔗 Documentação Adicional

- [Frontend README](./frontend/LEIAME.md)
- [Backend README](../api-start-pira-net/README.md)

## 📞 Contato

Sistema desenvolvido para Start Pira Net - Pedidos Online

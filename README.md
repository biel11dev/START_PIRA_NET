# 🍽️ Sistema de Pedidos Online

Sistema completo de pedidos online com cardápio digital e integração com WhatsApp.

## 📋 Sobre o Projeto

Este é o projeto **frontend** do sistema de pedidos online.

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

- `categorias` - Categorias e subcategorias
- `produtos` - Produtos do cardápio
- `pedidos` - Pedidos realizados
- `pedidos_itens` - Itens dos pedidos
- `sugestoes` - Sugestões de produtos

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

## 📞 Contato

Sistema desenvolvido para Start Pira Net - Pedidos Online (Todos os diretos reservados)


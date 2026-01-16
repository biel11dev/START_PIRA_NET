# 🚀 Guia de Execução - Sistema de Pedidos Online

## 📦 Estrutura dos Projetos

O sistema está dividido em **2 projetos independentes**:

1. **PEDIDOS_ONLINE** - Frontend (React + Vite)
2. **api-start-pira-net** - Backend (Node.js + Express + Prisma)

## ⚙️ Passo a Passo para Executar

### 1️⃣ Backend (API)

```bash
# Navegue até o diretório do backend
cd c:\Users\estud\api-start-pira-net

# Instale as dependências (se ainda não instalou)
npm install

# Configure o arquivo .env com:
# - DATABASE_URL (connection string PostgreSQL)
# - PORT=3001
# - WHATSAPP_NUMBER

# Execute as migrations do Prisma (primeira vez)
npx prisma migrate dev
npx prisma generate

# Inicie o servidor em modo desenvolvimento
npm run dev
```

✅ O backend estará rodando em: **http://localhost:3001**

### 2️⃣ Frontend

Abra um **novo terminal** e execute:

```bash
# Navegue até o diretório do frontend
cd c:\Users\estud\PEDIDOS_ONLINE\frontend

# Instale as dependências (se ainda não instalou)
npm install

# Configure o arquivo .env com:
# VITE_API_URL=http://localhost:3001/api

# Inicie o servidor de desenvolvimento
npm run dev
```

✅ O frontend estará rodando em: **http://localhost:5173**

## 🧪 Testando a Aplicação

1. Acesse http://localhost:5173 no navegador
2. Verifique se o cardápio carrega corretamente
3. Teste adicionar produtos ao carrinho
4. Tente fazer um pedido (será redirecionado para WhatsApp)

### Teste de Conexão da API

Abra o console do navegador (F12) e execute:

```javascript
// Verificar URL da API
console.log(import.meta.env.VITE_API_URL);

// Teste rápido de conexão
fetch('http://localhost:3001/health')
  .then(r => r.json())
  .then(data => console.log('API Health:', data))
  .catch(err => console.error('Erro:', err));
```

## 🔧 Comandos Úteis

### Backend
```bash
# Desenvolvimento com auto-reload
npm run dev

# Produção
npm start

# Ver logs do Prisma
npx prisma studio

# Resetar banco de dados
npx prisma migrate reset
```

### Frontend
```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview

# Lint
npm run lint
```

## 🐛 Problemas Comuns

### Backend não conecta ao banco
- ✅ Verifique a variável `DATABASE_URL` no `.env`
- ✅ Certifique-se de que executou `npx prisma migrate dev`
- ✅ Teste a connection string diretamente no Prisma Studio

### Frontend não conecta à API
- ✅ Verifique se o backend está rodando na porta 3001
- ✅ Confirme a variável `VITE_API_URL` no `.env`
- ✅ Reinicie o servidor Vite após alterar variáveis de ambiente
- ✅ Verifique CORS no backend

### CORS Error
- ✅ Certifique-se de que o CORS está habilitado no backend
- ✅ Verifique se a URL do frontend está correta

## 📱 URLs Importantes

| Serviço | URL | Descrição |
|---------|-----|-----------|
| Frontend | http://localhost:5173 | Aplicação React |
| Backend API | http://localhost:3001/api | API REST |
| Health Check | http://localhost:3001/health | Status da API |
| Prisma Studio | http://localhost:5555 | Admin do banco |

## 📂 Estrutura de Arquivos Importantes

```
api-start-pira-net/
├── server.js              # ⚡ Servidor Express
├── schema.prisma          # 🗃️ Schema do banco
├── .env                   # 🔐 Variáveis de ambiente
└── package.json

PEDIDOS_ONLINE/
└── frontend/
    ├── src/
    │   ├── App.jsx        # 🎨 Componente principal
    │   ├── services/
    │   │   └── api.js     # 🔌 Cliente HTTP
    │   └── apiTest.js     # 🧪 Testes de conexão
    ├── .env               # 🔐 Variáveis de ambiente
    └── package.json
```

## ✅ Checklist de Configuração

### Backend
- [ ] Node.js instalado
- [ ] Dependências instaladas (`npm install`)
- [ ] Arquivo `.env` configurado
- [ ] Migrations executadas (`npx prisma migrate dev`)
- [ ] Servidor rodando (`npm run dev`)
- [ ] Health check respondendo (http://localhost:3001/health)

### Frontend
- [ ] Node.js instalado
- [ ] Dependências instaladas (`npm install`)
- [ ] Arquivo `.env` configurado
- [ ] Servidor Vite rodando (`npm run dev`)
- [ ] Aplicação carregando (http://localhost:5173)
- [ ] Console sem erros

## 🎯 Próximos Passos

Depois de configurar e testar:
1. ✅ Adicione produtos no banco de dados
2. ✅ Crie categorias
3. ✅ Configure sugestões
4. ✅ Teste o fluxo completo de pedido
5. ✅ Configure o número do WhatsApp

---

**Dica**: Mantenha sempre **2 terminais abertos** - um para o backend e outro para o frontend!

# Sugestões de Melhorias

## 📋 Visão Geral

A Gestão de sugestões de melhorias permite que os clientes votem em problemas e sugestões mais relevantes, criando uma ordem de prioridade para correção de bugs e implementação de novos recursos.

## ✨ Funcionalidades

### 1. **Votação em Sugestões**
- Usuários podem votar nas sugestões que consideram mais importantes
- Cada usuário pode votar apenas uma vez por sugestão
- Os votos são armazenados localmente no navegador (localStorage)
- Sistema de upvote/downvote com contador em tempo real

### 2. **Criar Novas Sugestões**
- Botão "Faça uma sugestão" no topo da página
- Modal para criar nova sugestão com:
  - Título (obrigatório, até 100 caracteres)
  - Descrição (opcional, até 500 caracteres)
  - Categoria (padrão: "Sugestão")
- Validação de campos obrigatórios

### 3. **Filtros e Busca**
- **Busca**: pesquisar por título ou descrição
- **Filtros**:
  - Mais votados (ordenação por número de votos)
  - Recentes (ordenação por data de criação)

### 4. **Interface Visual**
- Design consistente 
- Cards com informações da sugestão:
  - Título em destaque
  - Número da sugestão (#ID)
  - Descrição resumida
  - Categoria
  - Botão de votação com contador
- Estado visual para sugestões já votadas
- Animações e hover effects

## 🎨 Acesso ao Sistema

### Pelo Cardápio:
1. Clique no ícone de **lâmpada** (💡) no header
2. Será redirecionado para a página de sugestões

### Na Página de Sugestões:
- Botão "← Voltar ao Cardápio" para retornar

## 🔧 Estrutura Técnica

### Frontend
```
frontend/src/
├── SugestoesMelhorias.jsx  # Componente principal
├── SugestoesMelhorias.css  # Estilos
└── services/
    └── api.js              # Funções de API
```

### Backend (API)
```javascript
GET    /api/sugestoes-melhorias        # Listar todas
POST   /api/sugestoes-melhorias        # Criar nova
PUT    /api/sugestoes-melhorias/:id/votar  # Votar
DELETE /api/sugestoes-melhorias/:id    # Excluir
```

### Banco de Dados (Prisma)
```prisma
model SugestaoMelhoria {
  id           Int       @id @default(autoincrement())
  titulo       String
  descricao    String?
  categoria    String    @default("Sugestão")
  votos        Int       @default(0)
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
}
```



### Por que localStorage?
- ✅ Funciona sem necessidade de login
- ✅ Persistência local entre sessões
- ✅ Sem necessidade de backend complexo de usuários
- ⚠️ Limitação: votos são por dispositivo/navegador

## 🚀 Como Usar

### Para Clientes:

1. **Visualizar Sugestões**
   - Acesse pelo ícone 💡 no header
   - Veja todas as sugestões ordenadas por votos

2. **Votar em Sugestão**
   - Clique na seta ▲ para votar
   - Clique novamente para remover seu voto
   - O contador atualiza em tempo real

3. **Criar Nova Sugestão**
   - Clique em "Faça uma sugestão"
   - Preencha o título (obrigatório)
   - Adicione uma descrição (opcional)
   - Clique em "Enviar Sugestão"

4. **Pesquisar**
   - Use a barra de busca para filtrar
   - Alterne entre "Mais votados" e "Recentes"

### Para Administradores:

As sugestões ficam armazenadas no banco de dados e podem ser:
- Visualizadas no painel admin
- Exportadas para análise
- Marcadas como implementadas
- Excluídas se necessário

## 🎯 Benefícios

1. **Priorização Inteligente**
   - Recursos mais votados = maior prioridade
   - Feedback direto dos usuários
   - Decisões baseadas em dados reais

2. **Engajamento do Cliente**
   - Clientes sentem que são ouvidos
   - Participação ativa no desenvolvimento
   - Transparência no processo

3. **Organização**
   - Centralize todo o feedback
   - Evite duplicação de sugestões
   - Histórico de todas as solicitações

## 📱 Responsividade

O sistema é totalmente responsivo:
- ✅ Desktop 
- ✅ Tablet 
- ✅ Mobile 

## 📝 Notas Importantes

1. **Votos são por dispositivo**: Se o usuário limpar o cache ou trocar de navegador, os votos serão resetados
2. **Sugestões duplicadas**: Recomenda-se revisar periodicamente para mesclar sugestões similares
3. **Moderação**: Considere adicionar moderação de conteúdo em versões futuras
4. **Analytics**: Os votos podem ser usados para priorizar o roadmap de desenvolvimento
---

**Desenvolvido para**: Start Pira Net  
**Versão**: 1.0.0  
**Data**: Janeiro 2026

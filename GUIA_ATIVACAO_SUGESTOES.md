# 🚀 Guia Rápido - Ativar Sistema de Sugestões

## Passos para Ativar

### 1. Migração do Banco de Dados
Execute no terminal (diretório raiz do projeto):

```bash
# Criar a tabela no banco de dados
npx prisma migrate dev --name adicionar_sugestoes_melhorias

# Gerar o cliente Prisma atualizado
npx prisma generate
```

### 2. Reiniciar o Servidor Backend
```bash
# Se estiver rodando, pare o servidor (Ctrl+C) e reinicie
npm run dev
```

### 3. Testar o Sistema

#### No Frontend:
1. Acesse o cardápio
2. Clique no ícone de 💡 (lâmpada) no header
3. Você verá a página de sugestões com exemplos
4. Teste:
   - Votar em sugestões
   - Criar nova sugestão
   - Buscar sugestões
   - Filtrar por "Mais votados" ou "Recentes"

#### Verificar API:
```bash
# Testar endpoint de listagem
curl http://localhost:3001/api/sugestoes-melhorias

# Criar uma sugestão (teste)
curl -X POST http://localhost:3001/api/sugestoes-melhorias \
  -H "Content-Type: application/json" \
  -d '{"titulo":"Teste","descricao":"Descrição teste","categoria":"Teste"}'
```

## ✅ Checklist de Verificação

- [ ] Tabela `sugestoes_melhorias` criada no banco
- [ ] Servidor backend reiniciado sem erros
- [ ] Ícone de lâmpada aparece no header
- [ ] Página de sugestões carrega corretamente
- [ ] É possível votar em sugestões
- [ ] É possível criar novas sugestões
- [ ] Busca funciona
- [ ] Filtros funcionam
- [ ] Botão "Voltar ao Cardápio" funciona

## 🐛 Resolução de Problemas

### Erro: "Table 'sugestoes_melhorias' doesn't exist"
**Solução**: Execute a migração do Prisma
```bash
npx prisma migrate dev
```

### Erro: "Cannot find module 'SugestoesMelhorias'"
**Solução**: Verifique se os arquivos foram criados:
- `frontend/src/SugestoesMelhorias.jsx`
- `frontend/src/SugestoesMelhorias.css`

### Ícone não aparece no header
**Solução**: Limpe o cache do navegador (Ctrl+Shift+R) ou reinicie o servidor frontend

### Votos não persistem
**Normal**: Votos são armazenados no localStorage do navegador. Se limpar cache, os votos somem.

## 📝 Configurações Opcionais

### Alterar URL da API
Edite `frontend/.env`:
```env
VITE_API_URL=http://localhost:3001/api
```

### Personalizar Cores
Edite `frontend/src/SugestoesMelhorias.css` nas variáveis de cor.

## 🎉 Pronto!

O sistema de sugestões está ativo e funcionando!

Agora seus clientes podem:
- ✅ Sugerir melhorias
- ✅ Votar nas mais importantes
- ✅ Ajudar a priorizar o desenvolvimento

---

**Dúvidas?** Consulte o arquivo `SISTEMA_SUGESTOES.md` para documentação completa.

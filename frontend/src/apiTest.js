import api, { healthCheck, getCardapio, getSugestoes } from './services/api';

/**
 * Script de teste para verificar a conexão com a API
 * 
 * Execute no console do navegador para testar as conexões:
 * 
 * import { testAPI } from './apiTest';
 * testAPI();
 */

export const testAPI = async () => {
  console.log('🧪 Testando conexão com API...');
  
  try {
    // 1. Health Check
    console.log('\n1️⃣ Health Check...');
    const health = await healthCheck();
    console.log('✅ Health Check:', health);
    
    // 2. Buscar Cardápio
    console.log('\n2️⃣ Buscando cardápio...');
    const cardapio = await getCardapio();
    console.log('✅ Cardápio:', cardapio);
    console.log(`   - ${cardapio.length} categorias encontradas`);
    
    // 3. Buscar Sugestões
    console.log('\n3️⃣ Buscando sugestões...');
    const sugestoes = await getSugestoes();
    console.log('✅ Sugestões:', sugestoes);
    console.log(`   - ${sugestoes.length} sugestões encontradas`);
    
    console.log('\n✅ Todos os testes passaram!');
    return { health, cardapio, sugestoes };
    
  } catch (error) {
    console.error('❌ Erro nos testes:', error);
    console.error('   Mensagem:', error.message);
    
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Dados:', error.response.data);
    } else if (error.request) {
      console.error('   Nenhuma resposta recebida do servidor');
      console.error('   Verifique se o backend está rodando');
    }
    
    return null;
  }
};

// Teste automático em desenvolvimento
if (import.meta.env.DEV) {
  console.log('🔧 Modo desenvolvimento - API configurada para:', import.meta.env.VITE_API_URL);
}

export default api;

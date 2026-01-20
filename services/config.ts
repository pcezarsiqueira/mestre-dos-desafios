
/**
 * CONFIGURAÇÃO GLOBAL DO MESTRE DOS DESAFIOS
 * 
 * - Gemini: A chave é lida automaticamente de process.env.API_KEY.
 * - Stripe: A chave Publishable é lida do localStorage ('stripe_api_key') ou do valor padrão abaixo.
 */

export const CONFIG = {
  STRIPE: {
    PUBLISHABLE_KEY: 'pk_test_INSIRA_SUA_CHAVE_AQUI',
    ENABLED: true,
  },
  GEMINI: {
    // Modelo Flash é 3x mais rápido que o Pro e excelente para JSON estruturado
    MODEL_MAIN: 'gemini-3-flash-preview',
    MODEL_PRO: 'gemini-3-pro-preview',
  },
  APP: {
    NAME: 'Mestre dos Desafios',
    VERSION: '1.5.0-HighPerformance',
  }
};

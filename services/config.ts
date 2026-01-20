
/**
 * CONFIGURAÇÃO GLOBAL DO MESTRE DOS DESAFIOS
 * 
 * - Gemini: A chave é lida automaticamente de process.env.API_KEY.
 * - Stripe: Insira sua Publishable Key (pk_test_...) abaixo.
 */

export const CONFIG = {
  STRIPE: {
    // INSIRA SUA CHAVE DO STRIPE AQUI:
    PUBLISHABLE_KEY: 'pk_test_SUA_CHAVE_AQUI',
    ENABLED: true,
  },
  GEMINI: {
    MODEL_PRO: 'gemini-3-pro-preview',
    MODEL_FLASH: 'gemini-3-flash-preview',
  },
  APP: {
    NAME: 'Mestre dos Desafios',
    VERSION: '1.2.0-SaaS',
  }
};

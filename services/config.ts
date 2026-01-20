
/**
 * CONFIGURAÇÃO GLOBAL DO MESTRE DOS DESAFIOS
 * 
 * - Gemini: A chave é lida automaticamente de process.env.API_KEY.
 * - Stripe: A chave Publishable é lida do localStorage ('stripe_api_key') ou do valor padrão abaixo.
 */

export const CONFIG = {
  STRIPE: {
    // COLE SUA CHAVE PUBLISHABLE ABAIXO (pk_test_...)
    PUBLISHABLE_KEY: 'pk_test_INSIRA_SUA_CHAVE_AQUI',
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

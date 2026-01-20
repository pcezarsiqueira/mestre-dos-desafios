
import { StripePackage } from "../types";
import { CONFIG } from "./config";

export const STRIPE_PACKAGES: StripePackage[] = [
  { id: 'pkg_basic', name: 'Plano Essentials', credits: 5, price: 47 },
  { id: 'pkg_pro', name: 'Plano Expert', credits: 20, price: 147, popular: true },
  { id: 'pkg_elite', name: 'Plano Master', credits: 50, price: 297 }
];

const getStripePublishableKey = () => {
  // Tenta pegar a chave que o mentor salvou na UI, se não houver, usa a do config.ts
  return localStorage.getItem('stripe_api_key') || CONFIG.STRIPE.PUBLISHABLE_KEY;
};

export const createCheckoutSession = async (packageId: string, userEmail: string) => {
  const apiKey = getStripePublishableKey();
  
  // Este log agora mostrará a chave REAL sendo utilizada no momento
  console.log(`[Stripe] Iniciando checkout. API Key ativa: ${apiKey}`);
  
  return new Promise<{ url: string }>((resolve) => {
    setTimeout(() => {
      // Simulação de chamada ao backend Node.js que criaria a Session com a Secret Key
      resolve({ url: 'https://checkout.stripe.com/pay/simulated_session' });
    }, 1000);
  });
};

export const verifyPaymentStatus = async (sessionId: string) => {
  return { success: true, creditsToAdd: 20 };
};

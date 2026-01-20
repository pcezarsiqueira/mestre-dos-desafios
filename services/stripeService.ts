
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
  const pkg = STRIPE_PACKAGES.find(p => p.id === packageId);
  
  // Log de segurança para o desenvolvedor
  console.log(`[Stripe Checkout] Inicializando...`);
  console.log(`[Stripe API Key]: ${apiKey.substring(0, 10)}...`);
  console.log(`[Pacote]: ${pkg?.name} | [Email]: ${userEmail}`);

  // Simulação de delay de rede
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Simulação de uma URL real do Stripe Checkout
  // Em um ambiente real, você faria um POST para seu backend Node/Express aqui
  const sessionId = `cs_test_${Math.random().toString(36).substring(2, 15)}`;
  const simulatedUrl = `https://checkout.stripe.com/pay/${sessionId}#package=${packageId}&key=${apiKey}`;

  return { 
    url: simulatedUrl,
    sessionId: sessionId
  };
};

export const verifyPaymentStatus = async (sessionId: string) => {
  // Simula a verificação de webhook do Stripe
  console.log(`[Stripe] Verificando status da sessão: ${sessionId}`);
  return { success: true, creditsToAdd: 20 };
};

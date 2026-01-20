
import { StripePackage } from "../types";
import { CONFIG } from "./config";

export const STRIPE_PACKAGES: StripePackage[] = [
  { id: 'pkg_basic', name: 'Plano Essentials', credits: 5, price: 47 },
  { id: 'pkg_pro', name: 'Plano Expert', credits: 20, price: 147, popular: true },
  { id: 'pkg_elite', name: 'Plano Master', credits: 50, price: 297 }
];

export const createCheckoutSession = async (packageId: string, userEmail: string) => {
  // CONFIG.STRIPE.PUBLISHABLE_KEY seria usada aqui para inicializar o Stripe.js no frontend
  console.log(`[Stripe] Usando Publishable Key: ${CONFIG.STRIPE.PUBLISHABLE_KEY}`);
  
  return new Promise<{ url: string }>((resolve) => {
    setTimeout(() => {
      // Em um app real, chamaria seu backend Node/Express aqui
      resolve({ url: 'https://checkout.stripe.com/pay/simulated_session' });
    }, 1000);
  });
};

export const verifyPaymentStatus = async (sessionId: string) => {
  return { success: true, creditsToAdd: 20 };
};

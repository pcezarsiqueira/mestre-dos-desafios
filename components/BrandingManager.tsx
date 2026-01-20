
import React, { useState, useEffect } from 'react';
import { User, BrandingSettings } from '../types';
import { Palette, Image, CreditCard, Save, PlusCircle, Check, Loader2, Rocket, Zap, Crown, Key } from 'lucide-react';
import { updateBranding, addCredits } from '../services/store';
import { STRIPE_PACKAGES, createCheckoutSession } from '../services/stripeService';

interface BrandingManagerProps {
  user: User;
  onUpdate: (user: User) => void;
}

const BrandingManager: React.FC<BrandingManagerProps> = ({ user, onUpdate }) => {
  const [branding, setBranding] = useState<BrandingSettings>(user.branding || {
    primaryColor: '#fe7501',
    secondaryColor: '#10b981',
    accentColor: '#f43f5e',
    mentoryName: '',
    expertName: user.name
  });
  
  const [stripeApiKey, setStripeApiKey] = useState(localStorage.getItem('stripe_api_key') || '');
  const [saved, setSaved] = useState(false);
  const [loadingPkg, setLoadingPkg] = useState<string | null>(null);

  const handleSave = () => {
    const updatedUser = updateBranding(branding);
    localStorage.setItem('stripe_api_key', stripeApiKey);
    
    if (updatedUser) {
      onUpdate(updatedUser);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const handleBuy = async (pkg: any) => {
    setLoadingPkg(pkg.id);
    try {
      // 1. Chama a criação de sessão de checkout (que contém o delay simulado)
      const session = await createCheckoutSession(pkg.id, user.email);
      
      console.log(`[Mestre dos Desafios] Sessão iniciada: ${session.sessionId}`);
      
      // 2. Simulação de Redirecionamento e Sucesso
      // Em produção real, faríamos: window.location.href = session.url;
      // Como estamos no ambiente de desenvolvimento, procedemos com o crédito imediato.
      
      const updatedUser = addCredits(pkg.credits);
      if (updatedUser) {
        onUpdate(updatedUser);
        alert(`Sucesso! O pacote "${pkg.name}" foi processado via Stripe. \n\nForam adicionados +${pkg.credits} créditos à sua conta.`);
      } else {
        throw new Error("Falha ao adicionar créditos no banco de dados local.");
      }
    } catch (e) {
      console.error("Erro no fluxo de compra:", e);
      alert("Não foi possível processar a compra. Verifique sua conexão e se a Chave API do Stripe foi configurada corretamente.");
    } finally {
      setLoadingPkg(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-500 pb-20">
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Branding & API Form */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-card p-8 rounded-3xl border border-white/5 shadow-xl space-y-6">
            <div className="flex items-center gap-3 border-b border-white/5 pb-6">
              <Palette className="text-primary" size={20} />
              <h3 className="text-xl font-bold text-white">Identidade White-Label</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Nome da Mentoria</label>
                <input 
                  type="text"
                  className="w-full bg-dark border border-white/10 rounded-xl p-4 text-white outline-none focus:ring-2 focus:ring-primary transition-all"
                  value={branding.mentoryName}
                  onChange={e => setBranding({...branding, mentoryName: e.target.value})}
                  placeholder="Ex: Formação Elite"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                {(['primaryColor', 'secondaryColor', 'accentColor'] as const).map((key) => (
                  <div key={key}>
                    <label className="block text-[8px] font-black text-slate-500 uppercase mb-2 text-center">{key.replace('Color','')}</label>
                    <div className="relative h-12 rounded-lg overflow-hidden border border-white/10 group">
                      <input 
                        type="color"
                        className="absolute inset-0 w-full h-full bg-transparent border-none cursor-pointer scale-150"
                        value={branding[key]}
                        onChange={e => setBranding({...branding, [key]: e.target.value})}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-card p-8 rounded-3xl border border-white/5 shadow-xl space-y-6">
            <div className="flex items-center gap-3 border-b border-white/5 pb-6">
              <Key className="text-yellow-500" size={20} />
              <h3 className="text-xl font-bold text-white">Pagamentos (Stripe)</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Stripe Publishable Key</label>
                <input 
                  type="password"
                  className="w-full bg-dark border border-white/10 rounded-xl p-4 text-white outline-none focus:ring-2 focus:ring-yellow-500 transition-all"
                  value={stripeApiKey}
                  onChange={e => setStripeApiKey(e.target.value)}
                  placeholder="pk_test_..."
                />
                <p className="text-[10px] text-slate-500 mt-2 italic">Sua chave pública para processar pagamentos.</p>
              </div>

              <button 
                onClick={handleSave}
                className="w-full bg-primary text-dark font-black py-4 rounded-xl hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
              >
                {saved ? <Check size={20} /> : <Save size={20} />}
                {saved ? 'Configurações Salvas' : 'Salvar Alterações'}
              </button>
            </div>
          </div>
        </div>

        {/* Stripe Credit Store */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CreditCard className="text-emerald-500" size={24} />
              <h3 className="text-2xl font-black text-white">Loja de Créditos</h3>
            </div>
            <div className="px-6 py-3 bg-dark/80 backdrop-blur-md rounded-2xl border border-white/10 flex items-center gap-3 shadow-lg">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Saldo Disponível</span>
              <span className="text-primary font-black text-xl">{user.credits}</span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {STRIPE_PACKAGES.map((pkg) => (
              <div 
                key={pkg.id} 
                className={`p-8 rounded-[32px] border transition-all flex flex-col justify-between relative overflow-hidden group ${pkg.popular ? 'bg-primary/5 border-primary/40 shadow-2xl shadow-primary/5' : 'bg-card border-white/5 hover:border-white/20'}`}
              >
                {pkg.popular && (
                  <div className="absolute top-0 right-0 bg-primary text-dark text-[10px] font-black px-6 py-1.5 rounded-bl-2xl uppercase tracking-tighter">
                    🔥 Popular
                  </div>
                )}
                <div>
                  <div className="mb-6">
                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500">
                      {pkg.credits <= 5 ? <Rocket size={24}/> : pkg.credits <= 20 ? <Zap size={24}/> : <Crown size={24}/>}
                    </div>
                  </div>
                  <h4 className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-1">{pkg.name}</h4>
                  <p className="text-3xl font-black text-white mb-6">R$ {pkg.price}</p>
                  
                  <div className="space-y-4 mb-10">
                     <div className="flex items-center gap-3 text-xs text-slate-300">
                       <Check size={16} className="text-emerald-500 shrink-0" />
                       <span><strong>{pkg.credits}</strong> Créditos de Jornada</span>
                     </div>
                     <div className="flex items-center gap-3 text-xs text-slate-300">
                       <Check size={16} className="text-emerald-500 shrink-0" />
                       <span>Geração Ilimitada de Desafios</span>
                     </div>
                     <div className="flex items-center gap-3 text-xs text-slate-300">
                       <Check size={16} className="text-emerald-500 shrink-0" />
                       <span>Acesso ao Painel Estrategista</span>
                     </div>
                  </div>
                </div>
                
                <button 
                  onClick={() => handleBuy(pkg)}
                  disabled={!!loadingPkg}
                  className={`w-full py-4 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 ${pkg.popular ? 'bg-primary text-dark shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95' : 'bg-white/5 text-white hover:bg-white/10 active:scale-95'}`}
                >
                  {loadingPkg === pkg.id ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <>Adquirir Agora <PlusCircle size={18} /></>
                  )}
                </button>
              </div>
            ))}
          </div>
          
          <div className="flex items-center justify-center gap-2 pt-6 opacity-30 grayscale hover:grayscale-0 transition-all cursor-default">
            <i className="ri-shield-check-fill text-xl text-emerald-500"></i>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Ambiente Seguro & Criptografado</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default BrandingManager;

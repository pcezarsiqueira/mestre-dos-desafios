
import React, { useState } from 'react';
import { User, BrandingSettings } from '../types';
import { Palette, Image, CreditCard, Save, PlusCircle, Check, Loader2, Rocket, Zap, Crown } from 'lucide-react';
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
  const [saved, setSaved] = useState(false);
  const [loadingPkg, setLoadingPkg] = useState<string | null>(null);

  const handleSave = () => {
    const updatedUser = updateBranding(branding);
    if (updatedUser) {
      onUpdate(updatedUser);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const handleBuy = async (pkg: any) => {
    setLoadingPkg(pkg.id);
    try {
      const session = await createCheckoutSession(pkg.id, user.email);
      // Em produção: window.location.href = session.url;
      alert(`Redirecionando para o Checkout Stripe: ${pkg.name}. Em produção você veria a tela de pagamento segura.`);
      
      // Simulação de sucesso para teste local
      setTimeout(() => {
        const updatedUser = addCredits(pkg.credits);
        if (updatedUser) onUpdate(updatedUser);
        setLoadingPkg(null);
        alert(`Pagamento Confirmado! +${pkg.credits} Créditos adicionados.`);
      }, 1500);
    } catch (e) {
      alert("Erro no processamento do Stripe.");
      setLoadingPkg(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-500 pb-20">
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Branding Form */}
        <div className="lg:col-span-1 bg-card p-8 rounded-3xl border border-white/5 shadow-xl space-y-6">
          <div className="flex items-center gap-3 border-b border-white/5 pb-6">
            <Palette className="text-primary" />
            <h3 className="text-xl font-bold text-white">Identidade White-Label</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Nome da Mentoria</label>
              <input 
                type="text"
                className="w-full bg-dark border border-white/10 rounded-xl p-4 text-white outline-none focus:ring-2 focus:ring-primary"
                value={branding.mentoryName}
                onChange={e => setBranding({...branding, mentoryName: e.target.value})}
                placeholder="Ex: Formação Elite"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              {['primaryColor', 'secondaryColor', 'accentColor'].map((key) => (
                <div key={key}>
                  <label className="block text-[8px] font-black text-slate-500 uppercase mb-2 text-center">{key.replace('Color','')}</label>
                  <input 
                    type="color"
                    className="w-full h-12 bg-transparent border-none rounded-lg cursor-pointer"
                    value={(branding as any)[key]}
                    onChange={e => setBranding({...branding, [key]: e.target.value})}
                  />
                </div>
              ))}
            </div>

            <button 
              onClick={handleSave}
              className="w-full bg-primary text-dark font-black py-4 rounded-xl hover:brightness-110 transition-all flex items-center justify-center gap-2"
            >
              {saved ? <Check size={20} /> : <Save size={20} />}
              {saved ? 'Configurações Salvas' : 'Salvar Identidade'}
            </button>
          </div>
        </div>

        {/* Stripe Credit Store */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CreditCard className="text-emerald-500" />
              <h3 className="text-2xl font-black text-white">Comprar Créditos</h3>
            </div>
            <div className="px-6 py-2 bg-dark rounded-full border border-white/10 flex items-center gap-2">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Saldo Atual</span>
              <span className="text-primary font-black text-lg">{user.credits}</span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {STRIPE_PACKAGES.map((pkg) => (
              <div 
                key={pkg.id} 
                className={`p-6 rounded-3xl border transition-all flex flex-col justify-between relative overflow-hidden ${pkg.popular ? 'bg-primary/5 border-primary/40' : 'bg-card border-white/5'}`}
              >
                {pkg.popular && <div className="absolute top-0 right-0 bg-primary text-dark text-[8px] font-black px-4 py-1 rounded-bl-xl uppercase">Mais Vendido</div>}
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-primary">
                      {pkg.credits <= 5 ? <Rocket size={20}/> : pkg.credits <= 20 ? <Zap size={20}/> : <Crown size={20}/>}
                    </div>
                  </div>
                  <h4 className="text-white font-black mb-1">{pkg.name}</h4>
                  <p className="text-2xl font-black text-white mb-4">R$ {pkg.price}</p>
                  <div className="space-y-2 mb-8">
                     <p className="text-xs text-slate-400 flex items-center gap-2"><Check size={14} className="text-emerald-500" /> {pkg.credits} Jornadas de IA</p>
                     <p className="text-xs text-slate-400 flex items-center gap-2"><Check size={14} className="text-emerald-500" /> Dashboards White-label</p>
                     <p className="text-xs text-slate-400 flex items-center gap-2"><Check size={14} className="text-emerald-500" /> Suporte Prioritário</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleBuy(pkg)}
                  disabled={!!loadingPkg}
                  className={`w-full py-3 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 ${pkg.popular ? 'bg-primary text-dark hover:scale-105' : 'bg-white/5 text-white hover:bg-white/10'}`}
                >
                  {loadingPkg === pkg.id ? <Loader2 className="animate-spin" size={18} /> : 'Adquirir Pacote'}
                </button>
              </div>
            ))}
          </div>
          
          <p className="text-center text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em] pt-4">Pagamento 100% Seguro via Stripe Checkout</p>
        </div>

      </div>
    </div>
  );
};

export default BrandingManager;

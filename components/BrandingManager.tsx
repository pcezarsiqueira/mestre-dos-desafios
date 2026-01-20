
import React, { useState } from 'react';
import { User, BrandingSettings } from '../types';
import { Palette, Image, CreditCard, Save, PlusCircle, Check } from 'lucide-react';
import { updateBranding, addCredits } from '../services/store';

interface BrandingManagerProps {
  user: User;
  onUpdate: (user: User) => void;
}

const BrandingManager: React.FC<BrandingManagerProps> = ({ user, onUpdate }) => {
  const [branding, setBranding] = useState<BrandingSettings>(user.branding || {
    primaryColor: '#6366f1',
    secondaryColor: '#10b981',
    accentColor: '#f43f5e',
    mentoryName: '',
    expertName: user.name
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    const updatedUser = updateBranding(branding);
    if (updatedUser) {
      onUpdate(updatedUser);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const buyCredits = () => {
    const updatedUser = addCredits(10);
    if (updatedUser) onUpdate(updatedUser);
    alert("Saldo atualizado com sucesso! +10 Créditos adicionados.");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Branding Form */}
        <div className="bg-card p-8 rounded-2xl border border-slate-700 shadow-xl space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-700 pb-4">
            <Palette className="text-primary" />
            <h3 className="text-xl font-bold text-white">Paleta e Identidade</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Nome da Mentoria / Desafio</label>
              <input 
                type="text"
                className="w-full bg-dark border border-slate-600 rounded-lg p-3 text-white outline-none focus:ring-2 focus:ring-primary"
                value={branding.mentoryName}
                onChange={e => setBranding({...branding, mentoryName: e.target.value})}
                placeholder="Ex: Formação Expert 5k"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 text-center">Primária</label>
                <input 
                  type="color"
                  className="w-full h-12 bg-transparent border-none rounded cursor-pointer"
                  value={branding.primaryColor}
                  onChange={e => setBranding({...branding, primaryColor: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 text-center">Secundária</label>
                <input 
                  type="color"
                  className="w-full h-12 bg-transparent border-none rounded cursor-pointer"
                  value={branding.secondaryColor}
                  onChange={e => setBranding({...branding, secondaryColor: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 text-center">Acento</label>
                <input 
                  type="color"
                  className="w-full h-12 bg-transparent border-none rounded cursor-pointer"
                  value={branding.accentColor}
                  onChange={e => setBranding({...branding, accentColor: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">URL da Sua Logo</label>
              <div className="flex gap-2">
                <input 
                  type="text"
                  className="flex-1 bg-dark border border-slate-600 rounded-lg p-3 text-white outline-none focus:ring-2 focus:ring-primary text-xs"
                  value={branding.logoUrl}
                  onChange={e => setBranding({...branding, logoUrl: e.target.value})}
                  placeholder="https://sua-logo.com/img.png"
                />
                <button className="bg-slate-700 p-3 rounded-lg text-slate-300">
                  <Image size={20} />
                </button>
              </div>
            </div>

            <button 
              onClick={handleSave}
              className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              {saved ? <Check size={20} /> : <Save size={20} />}
              {saved ? 'Configurações Salvas' : 'Salvar Identidade'}
            </button>
          </div>
        </div>

        {/* Credit Manager */}
        <div className="bg-card p-8 rounded-2xl border border-slate-700 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 border-b border-slate-700 pb-4 mb-6">
              <CreditCard className="text-secondary" />
              <h3 className="text-xl font-bold text-white">Saldo de Créditos</h3>
            </div>

            <div className="text-center py-8 bg-dark/50 rounded-2xl border border-slate-800 mb-6">
              <p className="text-slate-500 text-sm uppercase tracking-widest font-bold">Créditos Disponíveis</p>
              <p className="text-6xl font-black text-white my-2">{user.credits}</p>
              <p className="text-slate-400 text-xs">Utilize para criar novas jornadas</p>
            </div>

            <div className="space-y-3">
               <div className="flex justify-between items-center p-3 bg-slate-800 rounded-lg border border-slate-700">
                  <span className="text-white text-sm">Pacote Iniciante (5)</span>
                  <span className="text-secondary font-bold">R$ 47</span>
               </div>
               <div className="flex justify-between items-center p-3 bg-indigo-500/10 rounded-lg border border-indigo-500/30">
                  <span className="text-white text-sm">Pacote Expert (20)</span>
                  <span className="text-indigo-400 font-bold">R$ 147</span>
               </div>
            </div>
          </div>

          <button 
            onClick={buyCredits}
            className="mt-6 w-full border-2 border-secondary text-secondary hover:bg-secondary hover:text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <PlusCircle size={20} /> Adquirir Créditos
          </button>
        </div>

      </div>
    </div>
  );
};

export default BrandingManager;

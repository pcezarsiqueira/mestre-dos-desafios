
import React, { useState } from 'react';
import { UserRole, User } from '../types';
import { Rocket, Zap, ChevronRight, Star, Check, Brain, Crown, Trophy, Target, Instagram, Phone, Mail, User as UserIcon, Lock } from 'lucide-react';
import { registerLead, loginAdmin } from '../services/store';
import { STRIPE_PACKAGES } from '../services/stripeService';
import { useTenant } from '../contexts/TenantContext';

interface LandingPageProps {
  onAuthSuccess: (user: User) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onAuthSuccess }) => {
  const { config, isLoading } = useTenant();
  const [modalMode, setModalMode] = useState<'register' | 'admin' | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', instagram: '', password: '' });

  if (isLoading) return null;

  const mentoryName = config?.branding.mentoryName || "MESTRE DESAFIOS";

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;
    const user = registerLead(formData);
    onAuthSuccess(user);
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = loginAdmin(formData.email, formData.password);
    if (user) onAuthSuccess(user);
    else alert("Credenciais administrativas incorretas.");
  };

  return (
    <div className="landing-wrapper bg-dark min-h-screen">
      <header className="fixed top-0 w-full z-50 backdrop-blur-xl bg-dark/60 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-[#fdd831] rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <Rocket className="text-dark w-6 h-6" />
            </div>
            <span className="font-mont text-xl font-black text-white uppercase">{mentoryName}</span>
          </div>
          <button 
            onClick={() => setModalMode('admin')}
            className="text-xs font-black text-slate-500 hover:text-primary transition-colors uppercase tracking-widest"
          >
            Acesso Admin
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-48 pb-32 px-6 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] bg-primary/5 blur-[120px] rounded-full -z-10" />
        <div className="max-w-5xl mx-auto text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-primary text-xs font-black uppercase tracking-widest">
            <Star size={14} fill="currentColor" /> Plataforma SaaS para Mentores de Elite
          </div>
          <h1 className="font-mont text-5xl md:text-8xl font-black text-white leading-[0.9] tracking-tighter">
            {config?.landing.headline || "Escale sua Mentoria com Desafios"}
          </h1>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
            {config?.landing.subheadline || "Abandone os PDFs estáticos. Capture leads e entregue experiências gamificadas."}
          </p>
          <div className="pt-6">
            <button 
              onClick={() => setModalMode('register')}
              className="group px-12 py-6 bg-gradient-to-br from-primary to-[#fdd831] text-dark font-black text-xl rounded-2xl shadow-2xl shadow-primary/40 hover:scale-105 transition-all flex items-center justify-center gap-3 mx-auto"
            >
              Começar Agora Gratuitamente <ChevronRight />
            </button>
            <p className="text-slate-500 text-xs mt-4 font-bold uppercase tracking-widest">Ganhe 3 créditos ao se cadastrar</p>
          </div>
        </div>
      </section>

      {/* Modal Auth */}
      {modalMode && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-dark/95 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="max-w-md w-full bg-card p-10 rounded-[40px] border border-white/10 shadow-2xl relative">
            <button onClick={() => setModalMode(null)} className="absolute top-6 right-6 text-white/30 hover:text-white transition-colors">
              <XIcon />
            </button>
            
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary">
                {modalMode === 'register' ? <Target size={32} /> : <Crown size={32} />}
              </div>
              <h3 className="font-mont text-2xl font-black text-white mb-2">
                {modalMode === 'register' ? "Criar Minha Conta" : "Portal do Mestre"}
              </h3>
              <p className="text-slate-500 text-sm">
                {modalMode === 'register' ? "Cadastre-se para coletar seus primeiros créditos." : "Acesso restrito para administradores."}
              </p>
            </div>

            <form onSubmit={modalMode === 'register' ? handleRegister : handleAdminLogin} className="space-y-4">
              {modalMode === 'register' && (
                <>
                  <Input icon={<UserIcon size={18}/>} placeholder="Nome Completo" value={formData.name} onChange={v => setFormData({...formData, name: v})} />
                  <Input icon={<Instagram size={18}/>} placeholder="@instagram" value={formData.instagram} onChange={v => setFormData({...formData, instagram: v})} />
                  <Input icon={<Phone size={18}/>} placeholder="WhatsApp" value={formData.phone} onChange={v => setFormData({...formData, phone: v})} />
                </>
              )}
              <Input icon={<Mail size={18}/>} type="email" placeholder="Seu melhor e-mail" value={formData.email} onChange={v => setFormData({...formData, email: v})} />
              {modalMode === 'admin' && (
                <Input icon={<Lock size={18}/>} type="password" placeholder="Sua senha secreta" value={formData.password} onChange={v => setFormData({...formData, password: v})} />
              )}
              
              <button className="w-full p-6 rounded-3xl bg-primary text-dark font-black text-lg shadow-xl shadow-primary/10 hover:brightness-110 transition-all">
                {modalMode === 'register' ? "Garantir 3 Créditos Grátis" : "Entrar como Admin"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const Input = ({ icon, type = "text", placeholder, value, onChange }: any) => (
  <div className="relative group">
    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors">
      {icon}
    </div>
    <input 
      type={type} 
      required
      placeholder={placeholder}
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full bg-dark/50 border border-white/10 rounded-2xl p-4 pl-12 text-white outline-none focus:border-primary transition-all placeholder:text-slate-600"
    />
  </div>
);

const XIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

export default LandingPage;

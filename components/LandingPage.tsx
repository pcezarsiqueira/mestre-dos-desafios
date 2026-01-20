
import React, { useState } from 'react';
import { UserRole } from '../types';
import { 
  Rocket, Zap, Layout, ChevronRight, Star, Check, Brain, 
  Crown, MousePointer2, Trophy, Target
} from 'lucide-react';
import { STRIPE_PACKAGES } from '../services/stripeService';
import { useTenant } from '../contexts/TenantContext';

interface LandingPageProps {
  onLogin: (role: UserRole) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLogin }) => {
  const { config, isLoading } = useTenant();
  const [showLoginOptions, setShowLoginOptions] = useState(false);

  if (isLoading) return null;

  // Fallbacks baseados no config do tenant
  const headline = config?.landing.headline || "Escale sua Mentoria com Desafios de 21 Dias";
  const subheadline = config?.landing.subheadline || "Abandone os PDFs estáticos. Crie experiências imersivas, gamificadas e 100% automatizadas.";
  const ctaText = config?.landing.ctaText || "Começar Agora Gratuitamente";
  const mentoryName = config?.branding.mentoryName || "MESTRE DESAFIOS";

  const isAdmin = config?.isAdminTenant ?? true;

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="landing-wrapper selection:bg-primary selection:text-dark scroll-smooth bg-dark min-h-screen">
      <header className="fixed top-0 w-full z-50 backdrop-blur-xl bg-dark/60 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-[#fdd831] rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <Rocket className="text-dark w-6 h-6" />
            </div>
            <span className="font-mont text-xl font-black text-white tracking-tighter uppercase">{mentoryName}</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8">
            <button 
              onClick={() => scrollToSection('funcionalidades')}
              className="text-sm font-bold text-slate-400 hover:text-white transition-colors"
            >
              Funcionalidades
            </button>
            {isAdmin && (
              <button 
                onClick={() => scrollToSection('investimento')}
                className="text-sm font-bold text-slate-400 hover:text-white transition-colors"
              >
                Investimento
              </button>
            )}
            <button 
              onClick={() => setShowLoginOptions(true)}
              className="px-6 py-2.5 bg-white/5 border border-white/10 rounded-full text-sm font-black text-white hover:bg-white/10 transition-all"
            >
              Acessar
            </button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-48 pb-32 px-6 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] bg-primary/5 blur-[120px] rounded-full -z-10" />
        
        <div className="max-w-5xl mx-auto text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-primary text-xs font-black uppercase tracking-widest animate-pulse">
            <Star size={14} fill="currentColor" /> {isAdmin ? "Plataforma White-Label para Mentores" : `Sistema Gamificado: ${mentoryName}`}
          </div>
          <h1 className="font-mont text-5xl md:text-8xl font-black text-white leading-[0.9] tracking-tighter">
            {headline}
          </h1>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
            {subheadline}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6">
            <button 
              onClick={() => setShowLoginOptions(true)}
              className="group w-full sm:w-auto px-12 py-6 bg-gradient-to-br from-primary to-[#fdd831] text-dark font-black text-xl rounded-2xl shadow-2xl shadow-primary/40 hover:scale-105 transition-all flex items-center justify-center gap-3"
            >
              {ctaText} <ChevronRight className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* Funcionalidades */}
      <section id="funcionalidades" className="py-32 bg-card/40 border-y border-white/5 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="font-mont text-4xl md:text-5xl font-black text-white mb-4">A ciência da <span className="text-primary">gamificação</span></h2>
            <p className="text-slate-400">Transformamos conhecimento passivo em ação diária e resultados reais.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { icon: <Brain className="text-pink-500" />, title: "Mapeamento Cognitivo", desc: "Nossa IA extrai as missões práticas do seu material bruto em segundos." },
              { icon: <Layout className="text-primary" />, title: "Interface Heroica", desc: "O aluno se sente em um jogo onde cada dia é um nível a ser superado." },
              { icon: <Zap className="text-yellow-500" />, title: "Foco em Execução", desc: "Menos teoria, mais prática. Objetivos claros e tarefas metrificadas." }
            ].map((f, i) => (
              <div key={i} className="p-10 bg-dark/60 rounded-[40px] border border-white/5 hover:border-primary/30 transition-all group relative overflow-hidden">
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-all duration-500">{f.icon}</div>
                <h3 className="font-mont text-2xl font-black text-white mb-4">{f.title}</h3>
                <p className="text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Investimento */}
      {isAdmin && (
        <section id="investimento" className="py-32 relative">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="font-mont text-4xl md:text-5xl font-black text-white mb-4">Planos de <span className="text-primary">Investimento</span></h2>
              <p className="text-slate-400">Escolha o nível ideal para a escala da sua mentoria.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {STRIPE_PACKAGES.map((pkg) => (
                <div 
                  key={pkg.id} 
                  className={`p-10 rounded-[48px] border flex flex-col justify-between transition-all hover:-translate-y-2 hover:shadow-2xl ${
                    pkg.popular 
                      ? 'border-primary bg-primary/5 shadow-primary/10' 
                      : 'border-white/5 bg-card/40 hover:border-white/20'
                  }`}
                >
                  <div>
                    {pkg.popular && (
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary text-dark rounded-full text-[10px] font-black uppercase tracking-widest mb-6">
                        <Trophy size={12} /> Mais Recomendado
                      </div>
                    )}
                    <h4 className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-2">{pkg.name}</h4>
                    <div className="flex items-baseline gap-1 mb-8">
                      <span className="text-4xl font-black text-white">R$ {pkg.price}</span>
                      <span className="text-slate-500 text-xs font-bold">/ pagamento único</span>
                    </div>
                    
                    <div className="space-y-4 mb-10">
                      <div className="flex items-center gap-3 text-sm text-slate-300">
                        <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                          <Check size={14} className="text-emerald-500" />
                        </div>
                        <span><strong>{pkg.credits}</strong> Créditos de Jornada</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-slate-300">
                        <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                          <Check size={14} className="text-emerald-500" />
                        </div>
                        <span>White-Label Customizável</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-slate-300">
                        <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                          <Check size={14} className="text-emerald-500" />
                        </div>
                        <span>Exportação de Instâncias (Tenants)</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-slate-300">
                        <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                          <Check size={14} className="text-emerald-500" />
                        </div>
                        <span>Suporte Prioritário</span>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => setShowLoginOptions(true)} 
                    className={`w-full py-5 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-2 ${
                      pkg.popular 
                        ? 'bg-primary text-dark shadow-xl shadow-primary/20 hover:brightness-110' 
                        : 'bg-white/5 text-white hover:bg-white/10'
                    }`}
                  >
                    {pkg.popular ? <Zap size={18} fill="currentColor" /> : <MousePointer2 size={18} />}
                    Selecionar Plano
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <footer className="py-20 border-t border-white/5 text-center bg-dark">
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center gap-6">
          <div className="flex items-center gap-3 opacity-50">
            <Rocket className="text-primary w-5 h-5" />
            <span className="font-mont font-black text-white text-sm tracking-tighter uppercase">{mentoryName}</span>
          </div>
          <p className="text-slate-500 text-xs">© 2024 {mentoryName}. Todos os direitos reservados. Powered by Mestre dos Desafios.</p>
        </div>
      </footer>

      {/* Modal de Login */}
      {showLoginOptions && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-dark/95 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="max-w-md w-full bg-card p-10 rounded-[40px] border border-white/10 shadow-2xl relative">
            <button 
              onClick={() => setShowLoginOptions(false)} 
              className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors"
            >
              <Check size={24} className="rotate-45" />
            </button>
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-primary">
                {isAdmin ? <Crown size={32} /> : <Target size={32} />}
              </div>
              <h3 className="font-mont text-2xl font-black text-white mb-2">{isAdmin ? "Painel do Mentor" : "Portal do Aluno"}</h3>
              <p className="text-slate-500 text-sm">
                {isAdmin 
                  ? "Acesse para criar novas jornadas e gerenciar seus subdomínios." 
                  : "Comece sua jornada de 21 dias e acompanhe seu progresso gamificado."}
              </p>
            </div>
            <div className="space-y-4">
              <button 
                onClick={() => onLogin(isAdmin ? UserRole.MENTOR : UserRole.STUDENT)} 
                className="w-full p-6 rounded-3xl bg-primary text-dark hover:brightness-110 transition-all text-center font-black text-lg shadow-xl shadow-primary/10"
              >
                Acessar Plataforma
              </button>
              <button 
                onClick={() => setShowLoginOptions(false)}
                className="w-full p-4 text-slate-500 hover:text-white transition-colors text-sm font-bold"
              >
                Voltar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;

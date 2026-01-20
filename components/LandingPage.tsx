
import React, { useState } from 'react';
import { UserRole } from '../types';
import { Rocket, ShieldCheck, Zap, BarChart3, Users, Layout, ChevronRight, Star } from 'lucide-react';

interface LandingPageProps {
  onLogin: (role: UserRole) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLogin }) => {
  const [showLoginOptions, setShowLoginOptions] = useState(false);

  return (
    <div className="landing-wrapper selection:bg-primary selection:text-dark">
      {/* Header Profissional SaaS */}
      <header className="fixed top-0 w-full z-50 backdrop-blur-xl bg-dark/60 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-[#fdd831] rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <Rocket className="text-dark w-6 h-6" />
            </div>
            <span className="font-mont text-xl font-black text-white tracking-tighter">MESTRE<span className="text-primary">DESAFIOS</span></span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8">
            <a href="#funcionalidades" className="text-sm font-bold text-slate-400 hover:text-white transition-colors">Funcionalidades</a>
            <a href="#precos" className="text-sm font-bold text-slate-400 hover:text-white transition-colors">Preços</a>
            <button 
              onClick={() => setShowLoginOptions(true)}
              className="px-6 py-2.5 bg-white/5 border border-white/10 rounded-full text-sm font-black text-white hover:bg-white/10 transition-all"
            >
              Acessar Plataforma
            </button>
          </nav>
        </div>
      </header>

      {/* Hero Section - Venda do SaaS */}
      <section className="pt-40 pb-20 px-6 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] bg-primary/5 blur-[120px] rounded-full -z-10" />
        
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-primary text-xs font-black uppercase tracking-widest animate-bounce">
            <Star size={14} fill="currentColor" /> Plataforma White-Label para Mentores
          </div>
          <h1 className="font-mont text-5xl md:text-7xl font-black text-white leading-[1.1] tracking-tighter">
            Escale sua Mentoria com <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-[#fdd831] to-primary">Desafios Inteligentes</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
            Pare de enviar PDFs que ninguém lê. Crie jornadas de 21 dias gamificadas, 
            gere links de convite e acompanhe a evolução dos seus alunos em tempo real com nossa IA.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button 
              onClick={() => setShowLoginOptions(true)}
              className="w-full sm:w-auto px-10 py-5 bg-gradient-to-br from-primary to-[#fdd831] text-dark font-black text-lg rounded-2xl shadow-2xl shadow-primary/20 hover:scale-105 transition-all flex items-center justify-center gap-3"
            >
              Começar Agora Gratuitamente <ChevronRight />
            </button>
            <div className="flex items-center gap-4 text-slate-500 text-sm font-bold">
              <span className="flex items-center gap-1"><ShieldCheck size={18} className="text-emerald-500" /> Teste Grátis</span>
              <span className="flex items-center gap-1"><Zap size={18} className="text-yellow-500" /> IA Gemini Integrada</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features SaaS */}
      <section id="funcionalidades" className="py-24 bg-card/40 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                icon: <Layout className="text-primary" />, 
                title: "Identidade Visual (Branding)", 
                desc: "Sua logo, suas cores, seu nome. O aluno se sente dentro da sua própria plataforma." 
              },
              { 
                icon: <BarChart3 className="text-blue-400" />, 
                title: "Gestão de Alunos & Grupos", 
                desc: "Crie links únicos para mentorias individuais ou coletivas. Veja quem está travado e quem está evoluindo." 
              },
              { 
                icon: <Users className="text-emerald-400" />, 
                title: "IA Estrategista (Upsell)", 
                desc: "Nossa IA analisa o feedback dos seus alunos e sugere quais novos produtos você deve criar para eles." 
              }
            ].map((f, i) => (
              <div key={i} className="p-8 bg-dark/60 rounded-[32px] border border-white/5 hover:border-primary/30 transition-all group">
                <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">{f.icon}</div>
                <h3 className="font-mont text-xl font-black text-white mb-3">{f.title}</h3>
                <p className="text-slate-400 leading-relaxed text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof Simples */}
      <section className="py-20 text-center">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-10">Confiado por grandes mentores nas áreas de</p>
        <div className="flex flex-wrap justify-center gap-12 opacity-40 grayscale hover:grayscale-0 transition-all">
          {['Finanças', 'Saúde Sistêmica', 'Performance', 'Carreira', 'Relacionamentos'].map(t => (
            <span key={t} className="text-2xl font-mont font-black text-white">{t}</span>
          ))}
        </div>
      </section>

      {/* Modal de Login (Acesso do Expert) */}
      {showLoginOptions && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-dark/95 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="max-w-md w-full bg-card p-10 rounded-[40px] border border-white/10 shadow-2xl relative">
            <button onClick={() => setShowLoginOptions(false)} className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors">
              <i className="ri-close-line text-2xl"></i>
            </button>
            <div className="text-center mb-8">
              <h3 className="font-mont text-2xl font-black text-white mb-2">Acesso Restrito</h3>
              <p className="text-white/40 text-sm">Selecione seu perfil para entrar no painel.</p>
            </div>
            <div className="space-y-4">
              <button 
                onClick={() => onLogin(UserRole.MENTOR)}
                className="w-full p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-primary/50 transition-all text-left flex items-center gap-4 group"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-dark transition-all">
                  <Layout size={24} />
                </div>
                <div>
                  <p className="font-mont font-bold text-white">Sou um Mentor</p>
                  <p className="text-xs text-white/40">Quero criar e vender desafios</p>
                </div>
              </button>
              <button 
                onClick={() => onLogin(UserRole.STUDENT)}
                className="w-full p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-emerald-500/50 transition-all text-left flex items-center gap-4 group"
              >
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-dark transition-all">
                  <Users size={24} />
                </div>
                <div>
                  <p className="font-mont font-bold text-white">Sou um Aluno</p>
                  <p className="text-xs text-white/40">Entrar em uma jornada existente</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;

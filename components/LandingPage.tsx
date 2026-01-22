
import React, { useState } from 'react';
import { UserRole, User } from '../types';
import { 
  Rocket, Zap, ChevronRight, Star, Check, Brain, Crown, 
  Trophy, Target, Instagram, Phone, Mail, User as UserIcon, 
  Lock, ArrowDown, ShieldCheck, BarChart3, Users, Flame, Sparkles, X
} from 'lucide-react';
import { registerLead, loginAdmin } from '../services/store';

interface LandingPageProps {
  onAuthSuccess: (user: User) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onAuthSuccess }) => {
  const [modalMode, setModalMode] = useState<'register' | 'admin' | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', instagram: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;
    setIsLoading(true);
    try {
      const user = await registerLead(formData);
      onAuthSuccess(user);
    } catch (error) {
      alert("Erro ao registrar. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const user = await loginAdmin(formData.email, formData.password);
      if (user) {
        onAuthSuccess(user);
      } else {
        alert("Credenciais administrativas incorretas ou conta bloqueada.");
      }
    } catch (error) {
      alert("Erro ao conectar com o servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="landing-wrapper bg-dark text-slate-200">
      {/* Header Fixo */}
      <header className="fixed top-0 w-full z-50 backdrop-blur-md bg-dark/40 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-[#fdd831] rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <Rocket className="text-dark w-6 h-6" />
            </div>
            <span className="font-mont text-xl font-black text-white uppercase tracking-tighter">Mestre <span className="text-primary">dos Desafios</span></span>
          </div>
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setModalMode('admin')}
              className="hidden md:block text-[10px] font-black text-slate-500 hover:text-primary transition-colors uppercase tracking-[0.2em]"
            >
              Portal do Mentor
            </button>
            <button 
              onClick={() => setModalMode('register')}
              className="px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-xs font-black text-white transition-all uppercase tracking-widest"
            >
              Criar Conta Grátis
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-primary/10 blur-[120px] rounded-full -z-10" />
        <div className="max-w-6xl mx-auto text-center space-y-10">
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-primary/10 border border-primary/20 rounded-full text-primary text-[10px] font-black uppercase tracking-[0.2em] animate-bounce">
            <Sparkles size={14} /> Inteligência Artificial para Mentores de Elite
          </div>
          <h1 className="font-mont text-5xl md:text-8xl font-black text-white leading-[0.95] tracking-tighter">
            Pare de entregar PDFs,<br />comece a gerar <span className="text-primary">Resultados.</span>
          </h1>
          <p className="text-lg md:text-2xl text-slate-400 max-w-3xl mx-auto leading-relaxed font-medium">
            A primeira plataforma SaaS que utiliza IA para criar jornadas de 21 dias gamificadas, 
            extraindo o melhor do seu método e garantindo o engajamento do seu aluno.
          </p>
          <div className="pt-6 flex flex-col items-center gap-4">
            <button 
              onClick={() => setModalMode('register')}
              className="group px-12 py-7 bg-gradient-to-br from-primary to-[#fdd831] text-dark font-black text-2xl rounded-[32px] shadow-2xl shadow-primary/40 hover:scale-105 transition-all flex items-center justify-center gap-4"
            >
              Começar Agora Gratuitamente <ChevronRight size={28} />
            </button>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em]">3 Créditos Iniciais • Configuração em 2 Minutos</p>
          </div>
        </div>
      </section>

      {/* Para Quem é? */}
      <section className="py-24 px-6 bg-card/30 border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="font-mont text-3xl md:text-5xl font-black text-white">Para quem é o <span className="text-primary">Mestre?</span></h2>
            <div className="w-20 h-1 bg-primary mx-auto rounded-full" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <TargetCard 
              icon={<Users size={32} />} 
              title="Mentores de Grupo" 
              desc="Aumente o LTV dos seus alunos criando desafios que forçam a aplicação prática do seu conteúdo semanal." 
            />
            <TargetCard 
              icon={<Crown size={32} />} 
              title="Infoprodutores" 
              desc="Transforme seu curso estático em uma experiência ativa. Menos abandono, mais depoimentos de sucesso." 
            />
            <TargetCard 
              icon={<ShieldCheck size={32} />} 
              title="Treinadores" 
              desc="Acompanhe a evolução das 7 saúdes dos seus coachees com diagnósticos gerados por Inteligência Artificial." 
            />
          </div>
        </div>
      </section>

      {/* Benefícios / O que você terá */}
      <section className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8 text-left">
            <h2 className="font-mont text-4xl md:text-6xl font-black text-white leading-tight">A Ciência da<br /><span className="text-primary">Transformação Real.</span></h2>
            <p className="text-slate-400 text-lg">Nossa IA não apenas escreve tarefas; ela arquiteta uma jornada baseada na psicologia da dopamina e micro-vitórias.</p>
            
            <div className="space-y-6">
              <BenefitItem 
                title="Gamificação com Propósito" 
                desc="Cálculo automático de XP e níveis de dificuldade por área da saúde." 
              />
              <BenefitItem 
                title="White-Label Completo" 
                desc="Sua logo, suas cores, seu domínio. O aluno nem percebe que está em outra ferramenta." 
              />
              <BenefitItem 
                title="Diagnóstico 360º de IA" 
                desc="Mapa automático de dores emocionais e físicas baseado no perfil do aluno." 
              />
              <BenefitItem 
                title="Prova de Fogo (Fire Trial)" 
                desc="O dia 21 é desenhado para ser o rito de passagem definitivo para a nova identidade do aluno." 
              />
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full" />
            <div className="bg-card p-2 rounded-[48px] border border-white/10 shadow-3xl rotate-2 relative z-10">
               <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800" alt="Dashboard Preview" className="rounded-[40px] opacity-80" />
               <div className="absolute -bottom-6 -left-6 bg-primary text-dark p-6 rounded-3xl shadow-2xl font-black text-xl animate-pulse">
                 +90% de Engajamento
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Resultados */}
      <section className="py-24 px-6 bg-primary">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <h2 className="font-mont text-4xl md:text-6xl font-black text-dark">O Resultado? Sua mentoria se torna <span className="underline">irresistível</span>.</h2>
          <p className="text-dark/70 text-xl font-bold">Menos suporte, mais escala e alunos que não conseguem parar de avançar.</p>
          <button 
            onClick={() => setModalMode('register')}
            className="px-12 py-6 bg-dark text-white font-black text-xl rounded-full shadow-2xl hover:scale-105 transition-all"
          >
            Quero Meus 3 Créditos Grátis
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 text-center">
        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">© 2024 Mestre dos Desafios • Made for Experts</p>
      </footer>

      {/* Modais */}
      {modalMode && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-dark/95 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="max-w-md w-full bg-card p-10 rounded-[40px] border border-white/10 shadow-2xl relative">
            <button onClick={() => setModalMode(null)} className="absolute top-6 right-6 text-white/30 hover:text-white transition-colors">
              <X size={24} />
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
                  <Input icon={<UserIcon size={18}/>} placeholder="Seu Nome de Expert" value={formData.name} onChange={(v: string) => setFormData({...formData, name: v})} />
                  <Input icon={<Instagram size={18}/>} placeholder="@seuinstagram" value={formData.instagram} onChange={(v: string) => setFormData({...formData, instagram: v})} />
                  <Input icon={<Phone size={18}/>} placeholder="WhatsApp (DDD + Número)" value={formData.phone} onChange={(v: string) => setFormData({...formData, phone: v})} />
                </>
              )}
              <Input icon={<Mail size={18}/>} type="email" placeholder="E-mail de Acesso" value={formData.email} onChange={(v: string) => setFormData({...formData, email: v})} />
              {modalMode === 'admin' && (
                <Input icon={<Lock size={18}/>} type="password" placeholder="Senha Mestre" value={formData.password} onChange={(v: string) => setFormData({...formData, password: v})} />
              )}
              
              <button disabled={isLoading} className="w-full p-6 rounded-3xl bg-primary text-dark font-black text-lg shadow-xl shadow-primary/10 hover:brightness-110 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                {isLoading ? "Aguarde..." : (modalMode === 'register' ? "Desbloquear 3 Créditos" : "Acessar Painel")} <ChevronRight size={20} />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const TargetCard = ({ icon, title, desc }: any) => (
  <div className="p-10 bg-dark/40 border border-white/5 rounded-[40px] space-y-6 hover:border-primary/30 transition-all group">
    <div className="text-primary group-hover:scale-110 transition-transform duration-500">{icon}</div>
    <h3 className="font-mont text-2xl font-black text-white">{title}</h3>
    <p className="text-slate-500 leading-relaxed text-sm">{desc}</p>
  </div>
);

const BenefitItem = ({ title, desc }: any) => (
  <div className="flex gap-4">
    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0 mt-1">
      <Check size={14} strokeWidth={4} />
    </div>
    <div>
      <h4 className="font-black text-white text-lg">{title}</h4>
      <p className="text-slate-500 text-sm">{desc}</p>
    </div>
  </div>
);

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
      className="w-full bg-dark border border-white/10 rounded-2xl p-4 pl-12 text-white outline-none focus:border-primary transition-all placeholder:text-slate-600"
    />
  </div>
);

export default LandingPage;

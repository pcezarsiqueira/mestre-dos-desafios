
import React, { useState } from 'react';
import { UserRole } from '../types';

interface LandingPageProps {
  onLogin: (role: UserRole) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLogin }) => {
  const [activeTab, setActiveTab] = useState<'mentores' | 'mentorados'>('mentores');
  const [showLoginOptions, setShowLoginOptions] = useState(false);

  const scrollToSelector = (id: string) => {
    const el = document.getElementById(id.replace('#', ''));
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const audienceContent = {
    mentores: {
      title: "Mentores: Escale Seu Impacto",
      bullets: [
        "Transforme seu conhecimento em desafios práticos e mensuráveis",
        "Crie jornadas gamificadas que mantêm os alunos engajados",
        "Acompanhe o progresso em tempo real com métricas claras",
        "Automatize o processo de evolução dos seus mentorados"
      ],
      img: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&w=1026&q=80"
    },
    mentorados: {
      title: "Mentorados: Evolua sem Travar",
      bullets: [
        "Receba desafios claros (7 a 21 dias) com foco em uma primeira vitória",
        "Execute tarefas práticas e rápidas, sem depender de motivação infinita",
        "Ganhe pontos, badges e sensação real de progresso",
        "Acompanhe sua evolução e mantenha consistência com metas simples"
      ],
      img: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1280&q=80"
    }
  };

  return (
    <div className="landing-wrapper overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-dark/70 border-b border-white/10">
        <div className="max-w-[1120px] mx-auto px-6 h-[74px] flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-[240px]">
            <div className="w-[42px] h-[42px] rounded-full flex items-center justify-center bg-gradient-to-br from-primary to-[#fdd831] shadow-lg">
              <i className="ri-trophy-line text-dark text-xl"></i>
            </div>
            <h1 className="font-mont text-[22px] font-extrabold tracking-tight text-white">Mestre dos Desafios</h1>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <button onClick={() => scrollToSelector('#como-funciona')} className="text-[rgba(246,245,255,.72)] font-semibold hover:text-[#fdd831] transition-colors">Como Funciona</button>
            <button onClick={() => scrollToSelector('#exemplos')} className="text-[rgba(246,245,255,.72)] font-semibold hover:text-[#fdd831] transition-colors">Exemplos</button>
            <button 
              onClick={() => setShowLoginOptions(true)}
              className="px-5 py-3 rounded-full bg-gradient-to-br from-primary to-[#fdd831] text-dark font-extrabold shadow-lg hover:brightness-105 transition-all flex items-center gap-2"
            >
              <i className="ri-login-circle-line"></i>
              Entrar / Cadastrar
            </button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section id="topo" className="relative min-h-[620px] flex items-center justify-center overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-cover bg-center opacity-95 scale-[1.02]" style={{ backgroundImage: 'linear-gradient(180deg, rgba(11,10,18,.60), rgba(11,10,18,.92)), url("https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1471&q=80")' }} />
        <div className="relative max-w-[1120px] mx-auto px-6 py-24 text-center">
          <h2 className="font-mont text-4xl md:text-6xl font-black leading-[1.05] tracking-tight mb-4">
            Transforme Conhecimento em <span className="text-[#fdd831]">Desafios Práticos</span>
          </h2>
          <p className="max-w-[980px] mx-auto text-[rgba(246,245,255,.72)] text-lg md:text-xl leading-relaxed mb-8">
            O app que transforma mentores em criadores de jornadas gamificadas.
            Crie desafios motivacionais e mensuráveis que levam seus mentorados ao próximo nível.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={() => scrollToSelector('#como-funciona')} className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-br from-primary to-[#fdd831] text-dark font-extrabold shadow-lg hover:brightness-105 transition-all flex items-center justify-center gap-2">
              <i className="ri-rocket-line"></i>
              Criar Meus Desafios
            </button>
            <button onClick={() => scrollToSelector('#como-funciona')} className="w-full sm:w-auto px-8 py-4 rounded-full border-2 border-white/20 text-white font-extrabold hover:bg-white/5 transition-all flex items-center justify-center gap-2">
              <i className="ri-play-circle-line"></i>
              Ver Demonstração
            </button>
          </div>
        </div>
      </section>

      {/* Audience */}
      <section id="publico" className="py-20 bg-dark/55 border-y border-white/10">
        <div className="max-w-[1120px] mx-auto px-6">
          <div className="text-center mb-10">
            <h3 className="font-mont text-3xl md:text-4xl font-black mb-2">Para Quem É o Mestre dos Desafios?</h3>
            <p className="text-[rgba(246,245,255,.80)]">Uma plataforma completa para mentores e mentorados evoluírem juntos</p>
          </div>

          <div className="flex justify-center mb-10">
            <div className="flex gap-2 p-1.5 bg-dark/55 border border-white/10 rounded-full">
              <button 
                onClick={() => setActiveTab('mentores')}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-extrabold transition-all ${activeTab === 'mentores' ? 'bg-gradient-to-br from-primary to-[#fdd831] text-dark' : 'text-[rgba(246,245,255,.72)]'}`}
              >
                <i className="ri-user-star-line"></i> Para Mentores
              </button>
              <button 
                onClick={() => setActiveTab('mentorados')}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-extrabold transition-all ${activeTab === 'mentorados' ? 'bg-gradient-to-br from-primary to-[#fdd831] text-dark' : 'text-[rgba(246,245,255,.72)]'}`}
              >
                <i className="ri-graduation-cap-line"></i> Para Mentorados
              </button>
            </div>
          </div>

          <div className="grid lg:grid-cols-[1.1fr_.9fr] gap-10 items-center">
            <div className="animate-in fade-in slide-in-from-left-4 duration-500">
              <h4 className="font-mont text-3xl font-black mb-4">{audienceContent[activeTab].title}</h4>
              <ul className="space-y-4">
                {audienceContent[activeTab].bullets.map((bullet, i) => (
                  <li key={i} className="flex gap-4 items-start text-[rgba(246,245,255,.82)]">
                    <span className="w-6 h-6 rounded-full flex items-center justify-center bg-[#fdd831]/15 border border-[#fdd831]/20 mt-0.5 shrink-0">
                      <i className="ri-check-line text-[#fdd831]"></i>
                    </span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
              <img src={audienceContent[activeTab].img} alt="Audience" className="w-full h-full object-cover transition-all duration-700" />
            </div>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section id="como-funciona" className="py-20">
        <div className="max-w-[1120px] mx-auto px-6">
          <div className="text-center mb-10">
            <h3 className="font-mont text-3xl md:text-4xl font-black mb-2">Como Funciona em 3 Passos</h3>
            <p className="text-[rgba(246,245,255,.80)]">Um processo simples que gera resultados extraordinários</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { step: '01', icon: 'ri-target-line', title: 'Defina Seu Nicho', desc: 'Conte-nos sua área de expertise, as dores dos seus mentorados e os objetivos que eles querem alcançar.' },
              { step: '02', icon: 'ri-brain-line', title: 'IA Cria os Desafios', desc: 'Nossa IA transforma suas informações em uma jornada de 7 a 21 desafios práticos e gamificados.' },
              { step: '03', icon: 'ri-line-chart-line', title: 'Acompanhe a Evolução', desc: 'Monitore o progresso em tempo real e celebre cada conquista com sistema de pontos e badges.' }
            ].map((s, i) => (
              <div key={i} className="p-8 rounded-3xl bg-card/70 border border-white/10 hover:border-primary/55 hover:-translate-y-1 transition-all">
                <div className="w-16 h-16 rounded-full flex items-center justify-center bg-gradient-to-br from-primary to-[#fdd831] text-dark shadow-xl mb-4">
                  <i className={`${s.icon} text-2xl`}></i>
                </div>
                <span className="text-[#fdd831] text-xs font-black tracking-widest uppercase">PASSO {s.step}</span>
                <h4 className="font-mont text-xl font-black mt-2 mb-2">{s.title}</h4>
                <p className="text-[rgba(246,245,255,.78)] leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="exemplos" className="py-24 bg-gradient-to-br from-primary/90 to-[#fdd831]/90 text-dark">
        <div className="max-w-[1120px] mx-auto px-6 text-center">
          <h3 className="font-mont text-3xl md:text-5xl font-black mb-4">Pronto para Revolucionar sua Mentoria?</h3>
          <p className="max-w-[920px] mx-auto text-lg md:text-xl font-medium text-dark/85 leading-relaxed mb-8">
            Junte-se aos mentores que já estão transformando conhecimento em jornadas práticas e gamificadas.
          </p>
          <button 
            onClick={() => scrollToSelector('#topo')}
            className="px-8 py-4 rounded-full bg-dark/90 text-white font-extrabold shadow-2xl hover:brightness-110 transition-all flex items-center justify-center gap-2 mx-auto"
          >
            <i className="ri-magic-line"></i>
            Criar Meus Desafios Agora
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-dark/85 border-t border-white/10">
        <div className="max-w-[1120px] mx-auto px-6">
          <div className="grid md:grid-cols-[1.3fr_1fr_1fr] gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-full flex items-center justify-center bg-gradient-to-br from-primary to-[#fdd831]">
                  <i className="ri-trophy-line text-dark text-lg"></i>
                </div>
                <h5 className="font-mont text-lg font-black text-white">Mestre dos Desafios</h5>
              </div>
              <p className="text-[rgba(246,245,255,.72)] leading-relaxed mb-4">
                Transformando conhecimento em jornadas práticas e gamificadas para mentores e mentorados evoluírem juntos.
              </p>
              <div className="flex gap-3">
                {['ri-linkedin-fill', 'ri-twitter-x-fill', 'ri-instagram-line', 'ri-youtube-fill'].map((icon, i) => (
                  <a key={i} href="#" className="w-10 h-10 rounded-full flex items-center justify-center border border-white/10 bg-card/60 text-[rgba(246,245,255,.72)] hover:bg-primary/20 hover:text-white transition-all">
                    <i className={icon}></i>
                  </a>
                ))}
              </div>
            </div>
            <div>
              <h5 className="font-mont font-black mb-4">Plataforma</h5>
              <ul className="space-y-3">
                <li><button onClick={() => scrollToSelector('#como-funciona')} className="text-[rgba(246,245,255,.72)] font-bold hover:text-[#fdd831] transition-colors">Como Funciona</button></li>
                <li><button onClick={() => scrollToSelector('#exemplos')} className="text-[rgba(246,245,255,.72)] font-bold hover:text-[#fdd831] transition-colors">Exemplos</button></li>
                <li><a href="#" className="text-[rgba(246,245,255,.72)] font-bold hover:text-[#fdd831] transition-colors">Preços</a></li>
                <li><a href="#" className="text-[rgba(246,245,255,.72)] font-bold hover:text-[#fdd831] transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-mont font-black mb-4">Links Rápidos</h5>
              <ul className="space-y-3">
                <li><a href="#" className="text-[rgba(246,245,255,.72)] font-bold hover:text-[#fdd831] transition-colors">Termos de Uso</a></li>
                <li><a href="#" className="text-[rgba(246,245,255,.72)] font-bold hover:text-[#fdd831] transition-colors">Privacidade</a></li>
                <li><a href="#" className="text-[rgba(246,245,255,.72)] font-bold hover:text-[#fdd831] transition-colors">Suporte</a></li>
                <li><a href="#" className="text-[rgba(246,245,255,.72)] font-bold hover:text-[#fdd831] transition-colors">Contato</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-white/10 text-center text-[rgba(246,245,255,.55)] font-semibold">
            © {new Date().getFullYear()} Mestre dos Desafios. Todos os direitos reservados.
          </div>
        </div>
      </footer>

      {/* Login Modal / Selection */}
      {showLoginOptions && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-dark/95 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="max-w-md w-full bg-card p-10 rounded-[32px] border border-white/10 shadow-2xl relative">
            <button onClick={() => setShowLoginOptions(false)} className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors">
              <i className="ri-close-line text-2xl"></i>
            </button>
            <div className="text-center mb-8">
              <h3 className="font-mont text-2xl font-black text-white mb-2">Seja Bem-vindo</h3>
              <p className="text-white/60">Escolha seu perfil para acessar a plataforma.</p>
            </div>
            <div className="space-y-4">
              <button 
                onClick={() => onLogin(UserRole.MENTOR)}
                className="w-full p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/50 transition-all text-left flex items-center gap-4 group"
              >
                <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-dark transition-all">
                  <i className="ri-user-star-line text-2xl"></i>
                </div>
                <div>
                  <p className="font-mont font-bold text-white">Sou Mentor / Expert</p>
                  <p className="text-xs text-white/40">Criar e gerenciar jornadas</p>
                </div>
              </button>
              <button 
                onClick={() => onLogin(UserRole.STUDENT)}
                className="w-full p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-500/50 transition-all text-left flex items-center gap-4 group"
              >
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-dark transition-all">
                  <i className="ri-graduation-cap-line text-2xl"></i>
                </div>
                <div>
                  <p className="font-mont font-bold text-white">Sou Aluno / Mentorado</p>
                  <p className="text-xs text-white/40">Realizar desafios e evoluir</p>
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

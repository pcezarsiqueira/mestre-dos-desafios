
import React, { useState, useEffect } from 'react';
import { User, UserRole, ChallengePlan, GeneratePlanPayload, PlanResponse } from './types';
import * as Store from './services/store';
import * as GeminiService from './services/geminiService';
import AssessmentWizard from './components/AssessmentWizard';
import Dashboard from './components/Dashboard';
import BrandingManager from './components/BrandingManager';
import InsightsPanel from './components/InsightsPanel';
import ManagementPanel from './components/ManagementPanel';
import LandingPage from './components/LandingPage';
import { LayoutDashboard, LogOut, User as UserIcon, GraduationCap, Settings, Users, Package } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [plan, setPlan] = useState<ChallengePlan | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'management' | 'settings' | 'insights'>('dashboard');

  useEffect(() => {
    const currentUser = Store.getCurrentUser();
    if (currentUser) setUser(currentUser);

    const currentPlan = Store.getPlan();
    if (currentPlan) setPlan(currentPlan);
  }, []);

  useEffect(() => {
    if (user?.branding) {
      document.documentElement.style.setProperty('--color-primary', user.branding.primaryColor);
      document.documentElement.style.setProperty('--color-secondary', user.branding.secondaryColor);
      document.documentElement.style.setProperty('--color-accent', user.branding.accentColor);
    }
  }, [user]);

  const handleLogin = (role: UserRole) => {
    // Alinhado ao prompt: Expert Bruno ganha 10 créditos iniciais
    const newUser = Store.loginUser(role === UserRole.MENTOR ? "Expert Bruno" : "Aluno Lucas", role);
    setUser(newUser);
  };

  const handleLogout = () => {
    Store.logoutUser();
    setUser(null);
  };

  const handleWizardFinish = async (payload: GeneratePlanPayload) => {
    if (!user || user.credits <= 0) {
      alert("Você não tem créditos suficientes. Adquira mais na aba Identidade.");
      return;
    }
    
    setIsGenerating(true);

    try {
        const generatedChallenges = await GeminiService.generateChallengePlan(payload);
        
        const newPlan: ChallengePlan = {
          id: crypto.randomUUID(),
          mentorId: user.id,
          studentName: payload.student_name,
          niche: payload.mentor_profile.substring(0, 50),
          selectedAreas: payload.health_areas,
          planTitle: `Jornada ${payload.student_name}: METADESAFIOS`,
          planDescription: `Um plano de 21 dias estruturado em 3 atos para transformação integral.`,
          challenges: generatedChallenges.map((c: any) => ({ 
            ...c, 
            completed: false,
            comments: [] 
          })),
          createdAt: new Date().toISOString(),
          isGroupPlan: payload.isGroupPlan,
          methodology: 'METADESAFIOS'
        };
        
        Store.savePlan(newPlan);
        const updatedUser = Store.deductCredit();
        if (updatedUser) setUser(updatedUser);
        setPlan(newPlan);
        setActiveTab('dashboard');
    } catch (error) {
        console.error("Erro na geração:", error);
        alert("Ocorreu um erro ao gerar sua jornada. Verifique sua conexão ou créditos.");
    } finally {
        setIsGenerating(false);
    }
  };

  if (!user) {
    return <LandingPage onLogin={handleLogin} />;
  }

  const branding = user.branding;

  return (
    <div className="min-h-screen bg-dark text-slate-200 font-sans">
      <style>{`
        :root { 
          --primary-custom: ${branding?.primaryColor || '#fe7501'}; 
          --secondary-custom: ${branding?.secondaryColor || '#10b981'}; 
          --accent-custom: ${branding?.accentColor || '#f43f5e'}; 
        }
        .bg-primary-custom { background-color: var(--primary-custom); }
        .text-primary-custom { color: var(--primary-custom); }
        .border-primary-custom { border-color: var(--primary-custom); }
        .font-mont { font-family: 'Montserrat', sans-serif; }
      `}</style>
      
      {/* Navbar Branding */}
      <nav className="bg-card/80 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {branding?.logoUrl ? (
              <img src={branding.logoUrl} alt="Logo" className="h-8 w-auto" />
            ) : (
              <div className="w-9 h-9 rounded-full flex items-center justify-center bg-gradient-to-br from-primary-custom to-[#fdd831]">
                <i className="ri-trophy-line text-dark"></i>
              </div>
            )}
            <span className="font-mont font-black text-white text-lg">
              {user.role === UserRole.MENTOR ? 'Mestre dos Desafios' : branding?.mentoryName || 'Mentoria'}
            </span>
          </div>

          {user.role === UserRole.MENTOR && (
            <div className="hidden lg:flex bg-dark/50 p-1 rounded-lg border border-white/10 mx-8">
              <button onClick={() => setActiveTab('dashboard')} className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${activeTab === 'dashboard' ? 'bg-white/10 text-white' : 'text-slate-400'}`}>
                Jornadas
              </button>
              <button onClick={() => setActiveTab('management')} className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${activeTab === 'management' ? 'bg-white/10 text-white' : 'text-slate-400'}`}>
                Gerenciamento
              </button>
              <button onClick={() => setActiveTab('insights')} className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${activeTab === 'insights' ? 'bg-white/10 text-white' : 'text-slate-400'}`}>
                Insights IA
              </button>
              <button onClick={() => setActiveTab('settings')} className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${activeTab === 'settings' ? 'bg-white/10 text-white' : 'text-slate-400'}`}>
                Identidade
              </button>
            </div>
          )}

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-white leading-none">{user.name}</p>
              <p className="text-[10px] uppercase font-black text-primary-custom">
                {user.role === UserRole.MENTOR ? `${user.credits} Créditos` : 'Aluno'}
              </p>
            </div>
            <img src={user.avatar} alt="Avatar" className="w-9 h-9 rounded-full border border-white/10" />
            <button onClick={handleLogout} className="text-slate-500 hover:text-white transition-colors">
              <i className="ri-logout-box-line text-lg"></i>
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        
        {user.role === UserRole.MENTOR && activeTab === 'settings' && (
          <BrandingManager user={user} onUpdate={setUser} />
        )}

        {user.role === UserRole.MENTOR && activeTab === 'management' && (
          <ManagementPanel />
        )}

        {user.role === UserRole.MENTOR && activeTab === 'insights' && plan && (
          <InsightsPanel plan={plan} />
        )}

        {activeTab === 'dashboard' && (
          <>
            {!plan && user.role === UserRole.MENTOR && (
              <AssessmentWizard onFinish={handleWizardFinish} isLoading={isGenerating} />
            )}

            {!plan && user.role === UserRole.STUDENT && (
               <div className="text-center py-20 bg-card/50 rounded-[32px] border border-white/10 shadow-2xl">
                 <div className="w-20 h-20 bg-primary-custom/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary-custom">
                   <i className="ri-hourglass-line text-4xl"></i>
                 </div>
                 <h2 className="font-mont text-3xl font-black text-white mb-2">Aguardando seu Mestre</h2>
                 <p className="text-slate-400">Sua jornada de 21 dias ainda não foi iniciada pelo seu mentor.</p>
               </div>
            )}

            {plan && (
              <div className="animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row justify-between items-start mb-10 gap-6">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                       <h1 className="font-mont text-4xl font-black text-white">{plan.planTitle}</h1>
                       {plan.isGroupPlan && <span className="bg-primary-custom/20 text-primary-custom text-[10px] font-black px-2 py-0.5 rounded-full border border-primary-custom/30 tracking-widest uppercase">GRUPO</span>}
                    </div>
                    <p className="text-slate-400 max-w-2xl text-lg">{plan.planDescription}</p>
                    <p className="text-xs text-slate-600 mt-2 font-semibold">Criado por {branding?.expertName || 'Mentor'} • {new Date(plan.createdAt).toLocaleDateString()}</p>
                  </div>
                  {user.role === UserRole.MENTOR && (
                    <button 
                      onClick={() => { if(confirm("Apagar jornada atual?")) { setPlan(null); Store.savePlan(null); } }}
                      className="bg-red-500/10 text-red-400 border border-red-500/20 px-6 py-3 rounded-2xl text-sm font-bold hover:bg-red-500 hover:text-white transition-all shadow-lg"
                    >
                      Nova Jornada
                    </button>
                  )}
                </div>
                <Dashboard plan={plan} onUpdate={setPlan} isMentorView={user.role === UserRole.MENTOR} />
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default App;

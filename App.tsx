
import React, { useState, useEffect } from 'react';
import { User, UserRole, ChallengePlan, GeneratePlanPayload } from './types';
import * as Store from './services/store';
import * as GeminiService from './services/geminiService';
import * as NotificationService from './services/notificationService';
import AssessmentWizard from './components/AssessmentWizard';
import Dashboard from './components/Dashboard';
import BrandingManager from './components/BrandingManager';
import InsightsPanel from './components/InsightsPanel';
import ManagementPanel from './components/ManagementPanel';
import LandingPage from './components/LandingPage';
import { CONFIG } from './services/config';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [plan, setPlan] = useState<ChallengePlan | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'management' | 'settings' | 'insights'>('dashboard');

  useEffect(() => {
    console.log(`Iniciando ${CONFIG.APP.NAME} v${CONFIG.APP.VERSION}`);
    const currentUser = Store.getCurrentUser();
    if (currentUser) setUser(currentUser);

    const currentPlan = Store.getPlan();
    if (currentPlan) setPlan(currentPlan);
  }, []);

  useEffect(() => {
    if (user?.branding) {
      const { primaryColor, secondaryColor, accentColor } = user.branding;
      document.documentElement.style.setProperty('--primary-custom', primaryColor);
      document.documentElement.style.setProperty('--secondary-custom', secondaryColor);
      document.documentElement.style.setProperty('--accent-custom', accentColor);
    }
  }, [user]);

  const handleLogin = (role: UserRole) => {
    const name = role === UserRole.MENTOR ? "Expert Bruno" : "Aluno Lucas";
    const newUser = Store.loginUser(name, role);
    setUser(newUser);
    
    // Solicitar permissão de notificação no login se for aluno
    if (role === UserRole.STUDENT) {
      NotificationService.requestNotificationPermission();
    }
  };

  const handleLogout = () => {
    Store.logoutUser();
    setUser(null);
  };

  const handleWizardFinish = async (payload: GeneratePlanPayload) => {
    if (!user || user.credits <= 0) {
      alert("Créditos insuficientes. Adquira mais no painel de Identidade.");
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
          planTitle: `Jornada ${payload.student_name}: Transformação`,
          planDescription: `Plano personalizado de 21 dias focado em ${payload.health_areas.length} áreas da saúde.`,
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
        alert("Erro ao gerar jornada. Verifique sua conexão.");
    } finally {
        setIsGenerating(false);
    }
  };

  if (!user) {
    return <LandingPage onLogin={handleLogin} />;
  }

  const branding = user.branding;

  return (
    <div className="min-h-screen bg-dark text-slate-200 font-sans selection:bg-primary-custom selection:text-dark">
      <style>{`
        :root { 
          --primary-custom: ${branding?.primaryColor || '#fe7501'}; 
          --secondary-custom: ${branding?.secondaryColor || '#10b981'}; 
          --accent-custom: ${branding?.accentColor || '#f43f5e'}; 
        }
        .bg-primary-custom { background-color: var(--primary-custom); }
        .text-primary-custom { color: var(--primary-custom); }
        .border-primary-custom { border-color: var(--primary-custom); }
      `}</style>
      
      <nav className="bg-card/80 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center bg-gradient-to-br from-primary-custom to-[#fdd831]">
              <i className="ri-rocket-fill text-dark"></i>
            </div>
            <span className="font-mont font-black text-white text-lg">
              {user.role === UserRole.MENTOR ? 'Mestre dos Desafios' : branding?.mentoryName || 'Jornada Hero'}
            </span>
          </div>

          {user.role === UserRole.MENTOR && (
            <div className="hidden lg:flex bg-dark/50 p-1 rounded-lg border border-white/10 mx-8">
              <button onClick={() => setActiveTab('dashboard')} className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${activeTab === 'dashboard' ? 'bg-white/10 text-white' : 'text-slate-400'}`}>Dashboard</button>
              <button onClick={() => setActiveTab('management')} className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${activeTab === 'management' ? 'bg-white/10 text-white' : 'text-slate-400'}`}>Gestão</button>
              <button onClick={() => setActiveTab('insights')} className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${activeTab === 'insights' ? 'bg-white/10 text-white' : 'text-slate-400'}`}>Estratégia</button>
              <button onClick={() => setActiveTab('settings')} className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${activeTab === 'settings' ? 'bg-white/10 text-white' : 'text-slate-400'}`}>Identidade</button>
            </div>
          )}

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-white leading-none">{user.name}</p>
              <p className="text-[10px] uppercase font-black text-primary-custom">
                {user.role === UserRole.MENTOR ? `${user.credits} Créditos` : 'Aluno Ativo'}
              </p>
            </div>
            <button onClick={handleLogout} className="text-slate-500 hover:text-white transition-colors">
              <i className="ri-logout-box-line text-lg"></i>
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {user.role === UserRole.MENTOR && activeTab === 'settings' && <BrandingManager user={user} onUpdate={setUser} />}
        {user.role === UserRole.MENTOR && activeTab === 'management' && <ManagementPanel />}
        {user.role === UserRole.MENTOR && activeTab === 'insights' && plan && <InsightsPanel plan={plan} />}

        {activeTab === 'dashboard' && (
          <>
            {!plan && user.role === UserRole.MENTOR && (
              <AssessmentWizard onFinish={handleWizardFinish} isLoading={isGenerating} />
            )}

            {plan && (
              <div className="animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row justify-between items-start mb-10 gap-6">
                  <div>
                    <h1 className="font-mont text-4xl font-black text-white mb-2">{plan.planTitle}</h1>
                    <p className="text-slate-400 max-w-2xl">{plan.planDescription}</p>
                  </div>
                  {user.role === UserRole.MENTOR && (
                    <button 
                      onClick={() => { if(confirm("Apagar jornada atual?")) { setPlan(null); Store.savePlan(null); } }}
                      className="bg-red-500/10 text-red-400 border border-red-500/20 px-6 py-3 rounded-2xl text-sm font-bold hover:bg-red-500 hover:text-white transition-all"
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

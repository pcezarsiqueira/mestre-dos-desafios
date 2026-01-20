
import React, { useState, useEffect } from 'react';
import { User, UserRole, ChallengePlan, GeneratePlanPayload, HealthArea } from './types';
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
import { useTenant } from './contexts/TenantContext';

const App: React.FC = () => {
  const { slug, config, isLoading: tenantLoading } = useTenant();
  const [user, setUser] = useState<User | null>(null);
  const [plan, setPlan] = useState<ChallengePlan | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'management' | 'settings' | 'insights'>('dashboard');

  useEffect(() => {
    if (tenantLoading) return;

    console.log(`Iniciando ${CONFIG.APP.NAME} v${CONFIG.APP.VERSION} | Tenant: ${slug}`);
    
    const currentUser = Store.getCurrentUser();
    if (currentUser) setUser(currentUser);

    const currentPlan = Store.getPlan();
    if (currentPlan) {
      setPlan(currentPlan);
    } else if (!config?.isAdminTenant && config?.tracks && config.tracks.length > 0) {
      // Se for um tenant de aluno e não tiver plano, podemos pré-carregar a track do tenant
      // Note: Isso simula o aluno iniciando a jornada gamificada do expert
    }
  }, [tenantLoading, slug, config]);

  // Se o config do tenant define cores, elas sobrepõem o branding do usuário (White label real)
  const branding = config?.branding || user?.branding;

  useEffect(() => {
    if (branding) {
      const { primaryColor, secondaryColor, accentColor } = branding;
      document.documentElement.style.setProperty('--primary-custom', primaryColor);
      document.documentElement.style.setProperty('--secondary-custom', secondaryColor);
      document.documentElement.style.setProperty('--accent-custom', accentColor);
    }
  }, [branding]);

  const handleLogin = (role: UserRole) => {
    const name = role === UserRole.MENTOR ? (config?.branding.expertName || "Expert") : "Aluno";
    const newUser = Store.loginUser(name, role);
    setUser(newUser);
    
    if (role === UserRole.STUDENT) {
      NotificationService.requestNotificationPermission();
      
      // Se não houver plano e estivermos num subdomínio com tracks, criamos um plano baseado na track
      if (!plan && config && config.tracks.length > 0) {
        const track = config.tracks[0];
        const studentPlan: ChallengePlan = {
          id: crypto.randomUUID(),
          mentorId: 'system',
          studentName: name,
          niche: config.slug,
          selectedAreas: [HealthArea.MENTAL, HealthArea.PHYSICAL, HealthArea.EMOTIONAL],
          planTitle: track.name,
          planDescription: track.description,
          challenges: track.challenges.map(c => ({ ...c, completed: false, comments: [] })),
          createdAt: new Date().toISOString(),
          isGroupPlan: false,
          methodology: 'METADESAFIOS'
        };
        Store.savePlan(studentPlan);
        setPlan(studentPlan);
      }
    }
  };

  const handleLogout = () => {
    Store.logoutUser();
    setUser(null);
  };

  const handleWizardFinish = async (payload: GeneratePlanPayload) => {
    if (!user || (user.credits <= 0 && config?.isAdminTenant)) {
      alert("Créditos insuficientes.");
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
        if (config?.isAdminTenant) {
          const updatedUser = Store.deductCredit();
          if (updatedUser) setUser(updatedUser);
        }
        setPlan(newPlan);
        setActiveTab('dashboard');
    } catch (error) {
        console.error("Erro na geração:", error);
        alert("Erro ao gerar jornada.");
    } finally {
        setIsGenerating(false);
    }
  };

  if (tenantLoading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Carregando Instância...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LandingPage onLogin={handleLogin} />;
  }

  const isMentorMode = user.role === UserRole.MENTOR && config?.isAdminTenant;

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
              {branding?.mentoryName || 'Mestre dos Desafios'}
            </span>
          </div>

          {isMentorMode && (
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
                {isMentorMode ? `${user.credits} Créditos` : 'Jornada Ativa'}
              </p>
            </div>
            <button onClick={handleLogout} className="text-slate-500 hover:text-white transition-colors">
              <i className="ri-logout-box-line text-lg"></i>
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {isMentorMode && activeTab === 'settings' && <BrandingManager user={user} onUpdate={setUser} />}
        {isMentorMode && activeTab === 'management' && <ManagementPanel />}
        {isMentorMode && activeTab === 'insights' && plan && <InsightsPanel plan={plan} />}

        {activeTab === 'dashboard' && (
          <>
            {!plan && isMentorMode && (
              <AssessmentWizard onFinish={handleWizardFinish} isLoading={isGenerating} />
            )}

            {plan && (
              <div className="animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row justify-between items-start mb-10 gap-6">
                  <div>
                    <h1 className="font-mont text-4xl font-black text-white mb-2">{plan.planTitle}</h1>
                    <p className="text-slate-400 max-w-2xl">{plan.planDescription}</p>
                  </div>
                  {isMentorMode && (
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

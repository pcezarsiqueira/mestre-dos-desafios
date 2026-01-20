
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
    const loadAppData = async () => {
      if (tenantLoading) return;
      
      const currentUser = Store.getCurrentUser();
      if (currentUser) setUser(currentUser);
      
      // Correção: getPlan é assíncrono, precisa ser awaitado
      const currentPlan = await Store.getPlan();
      setPlan(currentPlan);
    };

    loadAppData();
  }, [tenantLoading, slug]);

  const branding = config?.branding || user?.branding;

  useEffect(() => {
    if (branding) {
      const { primaryColor, secondaryColor, accentColor } = branding;
      document.documentElement.style.setProperty('--primary-custom', primaryColor);
      document.documentElement.style.setProperty('--secondary-custom', secondaryColor);
      document.documentElement.style.setProperty('--accent-custom', accentColor);
    }
  }, [branding]);

  const handleAuthSuccess = (u: User) => {
    setUser(u);
    NotificationService.requestNotificationPermission();
  };

  const handleLogout = () => {
    Store.logoutUser();
    setUser(null);
    setPlan(null);
  };

  const handleWizardFinish = async (payload: GeneratePlanPayload) => {
    if (!user) return;
    
    if (user.credits <= 0 && user.role !== UserRole.ADMIN) {
      alert("Seus créditos acabaram. Faça o upgrade para continuar transformando vidas!");
      return;
    }
    
    // Regra: se generationsCount for 0, é full. Se 1 ou 2, é 7 dias. Se Admin, é sempre full.
    const isFreeGeneration = user.role !== UserRole.ADMIN && user.generationsCount > 0 && user.generationsCount < 3;
    const isFullGeneration = user.role === UserRole.ADMIN || user.generationsCount === 0 || payload.forceFullGeneration;

    setIsGenerating(true);

    try {
        const result = await GeminiService.generateChallengePlan(payload);
        
        // Se for geração limitada, filtramos apenas os 7 primeiros desafios
        const challengesToSave = isFullGeneration 
          ? result.challenges 
          : result.challenges.filter(c => c.day <= 7);

        const newPlan: ChallengePlan = {
          id: crypto.randomUUID(),
          mentorId: user.id,
          studentName: payload.student_name,
          niche: payload.mentor_profile.substring(0, 50),
          selectedAreas: payload.health_areas,
          planTitle: result.plan_title + (isFullGeneration ? "" : " (Versão Teste 7 Dias)"),
          planDescription: result.description,
          transformationMapping: result.transformation_mapping,
          isFullVersion: isFullGeneration,
          challenges: challengesToSave.map((c: any) => ({ 
            ...c, 
            completed: false,
            comments: [] 
          })),
          createdAt: new Date().toISOString(),
          isGroupPlan: payload.isGroupPlan,
          methodology: 'METADESAFIOS'
        };
        
        await Store.savePlan(newPlan);
        const updatedUser = Store.deductCredit();
        if (updatedUser) setUser(updatedUser);
        
        setPlan(newPlan);
        setActiveTab('dashboard');

        if (!isFullGeneration) {
          alert("Você utilizou um crédito de teste. Esta jornada contém os primeiros 7 dias estratégicos. Adquira o plano completo para desbloquear os 21 dias!");
        }

    } catch (error) {
        console.error("Erro na geração:", error);
        alert("Erro ao gerar jornada. Tente novamente.");
    } finally {
        setIsGenerating(false);
    }
  };

  if (tenantLoading) return null;

  if (!user) {
    return <LandingPage onAuthSuccess={handleAuthSuccess} />;
  }

  const isMentorMode = user.role === UserRole.MENTOR || user.role === UserRole.ADMIN;

  return (
    <div className="min-h-screen bg-dark text-slate-200 font-sans">
      <nav className="bg-card/80 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center bg-gradient-to-br from-primary-custom to-[#fdd831]">
              <i className="ri-rocket-fill text-dark"></i>
            </div>
            <span className="font-mont font-black text-white text-lg">{branding?.mentoryName || 'Mestre'}</span>
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
            <div className="text-right">
              <p className="text-sm font-bold text-white leading-none">{user.name}</p>
              <p className="text-[10px] uppercase font-black text-primary-custom">
                {user.role === UserRole.ADMIN ? 'SUPER ADMIN' : `${user.credits} CRÉDITOS`}
              </p>
            </div>
            <button onClick={handleLogout} className="text-slate-500 hover:text-white transition-colors">
              <i className="ri-logout-box-line text-lg"></i>
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'dashboard' && (
          <>
            {!plan && isMentorMode && <AssessmentWizard onFinish={handleWizardFinish} isLoading={isGenerating} />}
            {plan && (
              <div className="animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row justify-between items-start mb-10 gap-6">
                  <div>
                    <h1 className="font-mont text-4xl font-black text-white mb-2">{plan.planTitle}</h1>
                    <p className="text-slate-400 max-w-2xl">{plan.planDescription}</p>
                    {!plan.isFullVersion && (
                      <div className="mt-4 px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 rounded-xl text-xs font-bold inline-flex items-center gap-2">
                        <i className="ri-error-warning-line"></i> VERSÃO LIMITADA (7 DIAS) - FAÇA O UPGRADE PARA 21 DIAS
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={() => { if(confirm("Apagar jornada atual?")) { setPlan(null); Store.savePlan(null); } }}
                    className="bg-red-500/10 text-red-400 border border-red-500/20 px-6 py-3 rounded-2xl text-sm font-bold hover:bg-red-500 hover:text-white transition-all"
                  >
                    Nova Jornada
                  </button>
                </div>
                <Dashboard plan={plan} onUpdate={setPlan} isMentorView={user.role !== UserRole.STUDENT} />
              </div>
            )}
          </>
        )}
        {activeTab === 'management' && <ManagementPanel />}
        {activeTab === 'insights' && plan && <InsightsPanel plan={plan} />}
        {activeTab === 'settings' && <BrandingManager user={user} onUpdate={setUser} />}
      </main>
    </div>
  );
};

export default App;

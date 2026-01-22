
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
import { useTenant } from './contexts/TenantContext';

const App: React.FC = () => {
  const { config, isLoading: tenantLoading } = useTenant();
  const [user, setUser] = useState<User | null>(null);
  const [plan, setPlan] = useState<ChallengePlan | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'management' | 'settings' | 'insights'>('dashboard');

  useEffect(() => {
    const loadAppData = async () => {
      if (tenantLoading) return;
      const currentUser = Store.getCurrentUser();
      if (currentUser) {
          setUser(currentUser);
          try {
            // Tenta buscar o plano do banco de dados remoto primeiro
            const response = await fetch(`/api/plans/${currentUser.id}`);
            if (response.ok) {
                const remotePlan = await response.json();
                setPlan(remotePlan);
            } else {
                const currentPlan = await Store.getPlan();
                setPlan(currentPlan);
            }
          } catch (e) {
            const currentPlan = await Store.getPlan();
            setPlan(currentPlan);
          }
      }
    };
    loadAppData();
  }, [tenantLoading]);

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
      alert("Créditos insuficientes.");
      return;
    }
    
    setIsGenerating(true);
    try {
        const result = await GeminiService.generateChallengePlan(payload);
        const newPlan: ChallengePlan = {
          id: crypto.randomUUID(),
          mentorId: user.id,
          studentName: payload.student_name,
          niche: payload.mentor_profile,
          selectedAreas: payload.health_areas,
          planTitle: result.plan_title,
          planDescription: result.description,
          transformationMapping: result.transformation_mapping,
          isFullVersion: true,
          challenges: result.challenges.map((c: any) => ({ ...c, completed: false, comments: [] })),
          createdAt: new Date().toISOString(),
          isGroupPlan: payload.isGroupPlan,
          methodology: 'METADESAFIOS'
        };
        
        // Salva no banco de dados remoto
        await fetch('/api/plans', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newPlan)
        });

        await Store.savePlan(newPlan);
        const updatedUser = Store.deductCredit();
        if (updatedUser) setUser(updatedUser);
        
        setPlan(newPlan);
        setActiveTab('dashboard');
    } catch (error) {
        alert("Erro na geração.");
    } finally {
        setIsGenerating(false);
    }
  };

  if (tenantLoading) return null;
  if (!user) return <LandingPage onAuthSuccess={handleAuthSuccess} />;

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
              <p className="text-[10px] uppercase font-black text-primary-custom">{user.credits} CRÉDITOS</p>
            </div>
            <button onClick={handleLogout} className="text-slate-500 hover:text-white transition-colors"><i className="ri-logout-box-line text-lg"></i></button>
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
                  </div>
                  <button onClick={() => { if(confirm("Apagar jornada atual?")) { setPlan(null); Store.savePlan(null); } }} className="bg-red-500/10 text-red-400 border border-red-500/20 px-6 py-3 rounded-2xl text-sm font-bold hover:bg-red-500 hover:text-white transition-all">Nova Jornada</button>
                </div>
                <Dashboard plan={plan} onUpdate={setPlan} isMentorView={user.role !== UserRole.STUDENT} />
              </div>
            )}
          </>
        )}
        {activeTab === 'management' && <ManagementPanel onBack={() => setActiveTab('dashboard')} />}
        {activeTab === 'insights' && plan && <InsightsPanel plan={plan} onBack={() => setActiveTab('dashboard')} />}
        {activeTab === 'settings' && <BrandingManager user={user} onUpdate={setUser} onBack={() => setActiveTab('dashboard')} />}
      </main>
    </div>
  );
};

export default App;

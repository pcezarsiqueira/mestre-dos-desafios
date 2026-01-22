
import React, { useState, useEffect } from 'react';
import { Mentorship, RegisteredStudent, RegisteredGroup, ChallengePlan, User, UserRole } from '../types';
import * as Store from '../services/store';
import { saveTenantConfig } from '../services/tenantService';
import { 
  Users, Target, Rocket, Globe, AlertTriangle, Loader2, ShieldAlert, Ban, Unlock, Edit3, Trash2, Save, X, Key, Share2
} from 'lucide-react';
import { useTenant } from '../contexts/TenantContext';

const ManagementPanel: React.FC = () => {
  const { config: tenantConfig } = useTenant();
  const currentUser = Store.getCurrentUser();
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [plan, setPlan] = useState<ChallengePlan | null>(null);
  const [slug, setSlug] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [activeAdminTab, setActiveAdminTab] = useState<'portal' | 'users' | 'profile'>('portal');

  useEffect(() => {
    Store.getPlan().then(p => {
        setPlan(p);
        if (p) setSlug(currentUser?.name.toLowerCase().replace(/\s/g, '-') || '');
    });
    if (currentUser?.role === UserRole.ADMIN) loadAllUsers();
  }, []);

  const loadAllUsers = async () => {
    const users = await Store.fetchAllUsers();
    setAllUsers(Array.isArray(users) ? users : []);
  };

  const handleSaveSubdomain = async () => {
    if (!currentUser || !plan) return;
    setIsSaving(true);
    try {
      await saveTenantConfig({
        slug,
        mentorId: currentUser.id,
        branding: currentUser.branding || { primaryColor: '#fe7501', secondaryColor: '#10b981', accentColor: '#f43f5e', mentoryName: 'Minha Mentoria', expertName: currentUser.name },
        landing: { headline: `Bem-vindo à Jornada ${plan.planTitle}`, subheadline: plan.planDescription, ctaText: 'Iniciar Jornada' }
      });
      alert(`Sucesso! Subdomínio ${slug}.mestredosdesafios.com.br ativado.`);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      
      <div className="flex gap-4 mb-8 bg-card/50 p-1 rounded-2xl border border-white/10 w-fit mx-auto">
          <button onClick={() => setActiveAdminTab('portal')} className={`px-6 py-2 rounded-xl text-sm font-black transition-all ${activeAdminTab === 'portal' ? 'bg-primary text-dark' : 'text-slate-400'}`}>Domínio do Mentor</button>
          {currentUser?.role === UserRole.ADMIN && <button onClick={() => setActiveAdminTab('users')} className={`px-6 py-2 rounded-xl text-sm font-black transition-all ${activeAdminTab === 'users' ? 'bg-primary text-dark' : 'text-slate-400'}`}>Usuários</button>}
      </div>

      {activeAdminTab === 'portal' && (
          <div className="max-w-4xl mx-auto space-y-8">
              <div className="bg-card p-1 rounded-[40px] border border-white/5 shadow-2xl overflow-hidden">
                <div className="bg-dark/40 p-10 rounded-[38px] space-y-8">
                   <div className="flex items-center gap-4 text-left">
                        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary"><Globe size={32} /></div>
                        <div>
                          <h3 className="font-mont text-2xl font-black text-white">Configuração do Subdomínio</h3>
                          <p className="text-slate-400 text-sm">Este é o portal que seus alunos usarão para entrar.</p>
                        </div>
                   </div>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="space-y-6">
                        <div>
                          <label className="block text-xs font-black text-slate-500 uppercase mb-3">Nome do Subdomínio</label>
                          <div className="flex items-center gap-2">
                            <input type="text" className="flex-1 bg-dark border border-white/10 rounded-2xl p-5 text-white outline-none focus:border-primary transition-all font-mono" placeholder="meu-portal" value={slug} onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} />
                            <span className="text-slate-500 font-bold">.mestredosdesafios.com.br</span>
                          </div>
                        </div>
                        <div className="p-6 bg-primary/5 border border-primary/10 rounded-2xl flex gap-4">
                          <Key className="text-primary shrink-0" size={20} />
                          <p className="text-xs text-slate-400 leading-relaxed">Cada aluno receberá uma <strong>Chave de Acesso</strong> única para visualizar sua jornada personalizada neste endereço.</p>
                        </div>
                      </div>

                      <div className="bg-dark p-8 rounded-3xl border border-white/5 flex flex-col justify-center items-center text-center space-y-6">
                         <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Visualização do Link</p>
                         <div className="text-xl font-black text-white flex items-center gap-1">
                           <span className="text-primary">{slug || '...'}</span><span className="opacity-40">.mestredosdesafios.com.br</span>
                         </div>
                         <button onClick={handleSaveSubdomain} disabled={!slug || isSaving} className="px-10 py-5 bg-primary text-dark rounded-2xl font-black hover:scale-105 transition-all shadow-xl flex items-center gap-3">
                           {isSaving ? <Loader2 className="animate-spin" /> : <Rocket size={20} />} Publicar Subdomínio
                         </button>
                      </div>
                   </div>
                </div>
              </div>

              {plan && (
                <div className="bg-card p-10 rounded-[40px] border border-white/5 shadow-xl flex items-center justify-between">
                   <div>
                     <h4 className="text-[10px] font-black text-slate-500 uppercase mb-1">Jornada Ativa</h4>
                     <p className="text-xl font-black text-white">{plan.planTitle}</p>
                   </div>
                   <button className="flex items-center gap-2 p-4 bg-white/5 hover:bg-white/10 rounded-2xl text-white transition-all">
                     <Share2 size={18} /> <span className="text-sm font-bold">Enviar para Aluno</span>
                   </button>
                </div>
              )}
          </div>
      )}
    </div>
  );
};

export default ManagementPanel;


import React, { useState, useEffect } from 'react';
import { Mentorship, RegisteredStudent, RegisteredGroup, ChallengePlan, User, UserRole } from '../types';
import * as Store from '../services/store';
import { saveTenantConfig } from '../services/tenantService';
import { Users, Target, Rocket, Globe, Loader2, Key, Share2, ArrowLeft, Shield, AlertCircle } from 'lucide-react';

interface ManagementPanelProps {
    onBack: () => void;
}

const ManagementPanel: React.FC<ManagementPanelProps> = ({ onBack }) => {
  const currentUser = Store.getCurrentUser();
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [plan, setPlan] = useState<ChallengePlan | null>(null);
  const [slug, setSlug] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [activeAdminTab, setActiveAdminTab] = useState<'portal' | 'users'>('portal');

  useEffect(() => {
    Store.getPlan().then(p => {
        setPlan(p);
        if (p) setSlug(currentUser?.name.toLowerCase().replace(/\s/g, '-') || '');
    });
    if (currentUser?.role === UserRole.ADMIN) {
        loadAllUsers();
    }
  }, [currentUser?.role]);

  const loadAllUsers = async () => {
    setIsLoadingUsers(true);
    try {
        const users = await Store.fetchAllUsers();
        setAllUsers(users);
    } catch (e) {
        console.error(e);
    } finally {
        setIsLoadingUsers(false);
    }
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
      
      <div className="flex items-center justify-between mb-4">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors font-bold text-sm">
          <ArrowLeft size={18} /> Voltar ao Dashboard
        </button>
      </div>

      <div className="flex gap-4 mb-8 bg-card/50 p-1 rounded-2xl border border-white/10 w-fit mx-auto">
          <button onClick={() => setActiveAdminTab('portal')} className={`px-6 py-2 rounded-xl text-sm font-black transition-all ${activeAdminTab === 'portal' ? 'bg-primary text-dark' : 'text-slate-400'}`}>Domínio do Mentor</button>
          {currentUser?.role === UserRole.ADMIN && <button onClick={() => setActiveAdminTab('users')} className={`px-6 py-2 rounded-xl text-sm font-black transition-all ${activeAdminTab === 'users' ? 'bg-primary text-dark' : 'text-slate-400'}`}>Gestão de Usuários</button>}
      </div>

      {activeAdminTab === 'portal' && (
          <div className="max-w-4xl mx-auto space-y-8">
              <div className="bg-card p-1 rounded-[40px] border border-white/5 shadow-2xl overflow-hidden">
                <div className="bg-dark/40 p-10 rounded-[38px] space-y-8">
                   <div className="flex items-center gap-4 text-left">
                        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary"><Globe size={32} /></div>
                        <div>
                          <h3 className="font-mont text-2xl font-black text-white">Configuração do Subdomínio</h3>
                          <p className="text-slate-400 text-sm">Personalize o endereço de acesso dos seus alunos.</p>
                        </div>
                   </div>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="space-y-6">
                        <div>
                          <label className="block text-xs font-black text-slate-500 uppercase mb-3">Nome do Subdomínio</label>
                          <div className="flex items-center gap-2">
                            <input type="text" className="flex-1 bg-dark border border-white/10 rounded-2xl p-5 text-white outline-none focus:border-primary font-mono" placeholder="meu-portal" value={slug} onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} />
                          </div>
                          <p className="mt-2 text-[10px] text-slate-500">Ex: {slug || 'seu-nome'}.mestredosdesafios.com.br</p>
                        </div>
                      </div>

                      <div className="bg-dark p-8 rounded-3xl border border-white/5 flex flex-col justify-center items-center text-center space-y-6">
                         <button onClick={handleSaveSubdomain} disabled={!slug || isSaving} className="px-10 py-5 bg-primary text-dark rounded-2xl font-black hover:scale-105 transition-all shadow-xl flex items-center gap-3">
                           {isSaving ? <Loader2 className="animate-spin" /> : <Rocket size={20} />} Ativar Portal
                         </button>
                      </div>
                   </div>
                </div>
              </div>

              {plan && (
                <div className="bg-card p-10 rounded-[40px] border border-white/5 shadow-xl flex items-center justify-between">
                   <div>
                     <h4 className="text-[10px] font-black text-slate-500 uppercase mb-1">Jornada Vinculada</h4>
                     <p className="text-xl font-black text-white">{plan.planTitle}</p>
                   </div>
                   <button className="flex items-center gap-2 p-4 bg-white/5 hover:bg-white/10 rounded-2xl text-white transition-all">
                     <Share2 size={18} /> <span className="text-sm font-bold">Compartilhar</span>
                   </button>
                </div>
              )}
          </div>
      )}

      {activeAdminTab === 'users' && currentUser?.role === UserRole.ADMIN && (
          <div className="max-w-6xl mx-auto bg-card rounded-[32px] border border-white/10 overflow-hidden">
              {isLoadingUsers ? (
                  <div className="p-20 flex flex-col items-center gap-4 text-slate-500">
                      <Loader2 className="animate-spin" size={40} />
                      <p className="font-bold">Carregando usuários do MySQL...</p>
                  </div>
              ) : allUsers.length === 0 ? (
                  <div className="p-20 flex flex-col items-center gap-4 text-slate-500">
                      <AlertCircle size={40} />
                      <p className="font-bold text-lg">Nenhum usuário encontrado no banco de dados.</p>
                      <button onClick={loadAllUsers} className="text-primary hover:underline font-bold">Tentar novamente</button>
                  </div>
              ) : (
                  <table className="w-full text-left">
                      <thead className="bg-dark/50 border-b border-white/10">
                          <tr>
                              <th className="p-6 text-[10px] font-black text-slate-500 uppercase">Usuário</th>
                              <th className="p-6 text-[10px] font-black text-slate-500 uppercase">Cargo</th>
                              <th className="p-6 text-[10px] font-black text-slate-500 uppercase">Créditos</th>
                              <th className="p-6 text-[10px] font-black text-slate-500 uppercase text-right">Ações</th>
                          </tr>
                      </thead>
                      <tbody>
                          {allUsers.map(u => (
                              <tr key={u.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                  <td className="p-6">
                                      <p className="text-sm font-bold text-white">{u.name}</p>
                                      <p className="text-xs text-slate-500">{u.email}</p>
                                  </td>
                                  <td className="p-6">
                                      <span className={`text-[9px] font-black px-2 py-1 rounded-full ${u.role === UserRole.ADMIN ? 'bg-primary/20 text-primary' : 'bg-slate-500/20 text-slate-500'}`}>
                                          {u.role}
                                      </span>
                                  </td>
                                  <td className="p-6">
                                      <span className="text-sm font-black text-white">{u.credits}</span>
                                  </td>
                                  <td className="p-6 text-right">
                                      <button className="text-slate-500 hover:text-white"><Shield size={18} /></button>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              )}
          </div>
      )}
    </div>
  );
};

export default ManagementPanel;

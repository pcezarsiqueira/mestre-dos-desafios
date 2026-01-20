
import React, { useState, useEffect } from 'react';
import { Mentorship, RegisteredStudent, RegisteredGroup, ChallengePlan, User, UserRole } from '../types';
import * as Store from '../services/store';
import { saveTenantConfig } from '../services/tenantService';
import { 
  Users, GraduationCap, Package, Plus, Trash2, Mail, 
  Copy, Check, Share2, Globe, Rocket, AlertTriangle, 
  ExternalLink, Loader2, ShieldAlert, Ban, Unlock, Edit3, 
  Coins, UserPlus, Key, Settings
} from 'lucide-react';
import { useTenant } from '../contexts/TenantContext';

const ManagementPanel: React.FC = () => {
  const { config: tenantConfig } = useTenant();
  const currentUser = Store.getCurrentUser();
  const [mentorships, setMentorships] = useState<Mentorship[]>([]);
  const [students, setStudents] = useState<RegisteredStudent[]>([]);
  const [groups, setGroups] = useState<RegisteredGroup[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [plan, setPlan] = useState<ChallengePlan | null>(null);
  
  const [slug, setSlug] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const [showUserModal, setShowUserModal] = useState<User | null>(null);
  const [activeAdminTab, setActiveAdminTab] = useState<'my_portal' | 'users' | 'profile'>('my_portal');

  useEffect(() => {
    setMentorships(Store.getMentorships());
    setStudents(Store.getStudents());
    setGroups(Store.getGroups());
    Store.getPlan().then(p => {
        setPlan(p);
        if (p) setSlug(currentUser?.name.toLowerCase().replace(/\s/g, '-') || '');
    });
    if (currentUser?.role === UserRole.ADMIN) loadAllUsers();
  }, []);

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

  const handleToggleBlock = async (user: User) => {
    if (!confirm(`Tem certeza que deseja ${user.isBlocked ? 'desbloquear' : 'bloquear'} ${user.name}?`)) return;
    const success = await Store.toggleUserBlockStatus(user.id, !user.isBlocked);
    if (success) loadAllUsers();
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm("AÇÃO IRREVERSÍVEL: Deseja remover permanentemente este usuário e todos os seus dados?")) return;
    const success = await Store.deleteUserAccount(id);
    if (success) loadAllUsers();
  };

  const handleAddCredits = async (id: string, amount: number) => {
    const success = await Store.modifyUserCredits(id, amount);
    if (success) {
        loadAllUsers();
        if (showUserModal) setShowUserModal({...showUserModal, credits: showUserModal.credits + amount});
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
      alert(`Sucesso! Portal publicado.`);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* Admin Tabs */}
      {currentUser?.role === UserRole.ADMIN && (
        <div className="flex gap-4 mb-8 bg-card/50 p-1 rounded-2xl border border-white/10 w-fit mx-auto">
            <button onClick={() => setActiveAdminTab('my_portal')} className={`px-6 py-2 rounded-xl text-sm font-black transition-all ${activeAdminTab === 'my_portal' ? 'bg-primary text-dark' : 'text-slate-400'}`}>Meu Portal</button>
            <button onClick={() => setActiveAdminTab('users')} className={`px-6 py-2 rounded-xl text-sm font-black transition-all ${activeAdminTab === 'users' ? 'bg-primary text-dark' : 'text-slate-400'}`}>Gerenciar Usuários</button>
            <button onClick={() => setActiveAdminTab('profile')} className={`px-6 py-2 rounded-xl text-sm font-black transition-all ${activeAdminTab === 'profile' ? 'bg-primary text-dark' : 'text-slate-400'}`}>Meu Perfil</button>
        </div>
      )}

      {activeAdminTab === 'users' && (
        <div className="bg-card p-8 rounded-[40px] border border-white/5 shadow-2xl animate-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <ShieldAlert className="text-primary" size={24} />
                    <h3 className="text-2xl font-black text-white">Central de Comando Super Admin</h3>
                </div>
                <button onClick={loadAllUsers} className="p-3 bg-white/5 rounded-xl hover:bg-white/10 text-white transition-all">
                    {isLoadingUsers ? <Loader2 className="animate-spin" /> : "Atualizar Lista"}
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-white/5 text-[10px] uppercase font-black text-slate-500 tracking-widest">
                            <th className="pb-4 pl-4">Usuário</th>
                            <th className="pb-4">Status</th>
                            <th className="pb-4">Role</th>
                            <th className="pb-4">Créditos</th>
                            <th className="pb-4">Investimento</th>
                            <th className="pb-4 text-right pr-4">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {allUsers.map(user => (
                            <tr key={user.id} className="group hover:bg-white/5 transition-all">
                                <td className="py-4 pl-4">
                                    <div className="flex items-center gap-3">
                                        <img src={`https://ui-avatars.com/api/?name=${user.name}&background=random`} className="w-8 h-8 rounded-full" />
                                        <div>
                                            <p className="text-sm font-bold text-white">{user.name}</p>
                                            <p className="text-xs text-slate-500">{user.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${user.isBlocked ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                                        {user.isBlocked ? 'Bloqueado' : 'Ativo'}
                                    </span>
                                </td>
                                <td><span className="text-xs font-bold text-slate-400">{user.role}</span></td>
                                <td><span className="text-sm font-black text-primary">{user.credits}</span></td>
                                <td><span className="text-sm font-bold text-white">R$ {user.totalSpent || '0.00'}</span></td>
                                <td className="py-4 text-right pr-4 space-x-2">
                                    <button onClick={() => setShowUserModal(user)} className="p-2 bg-white/5 text-white rounded-lg hover:bg-primary hover:text-dark transition-all"><Edit3 size={14}/></button>
                                    <button onClick={() => handleToggleBlock(user)} className={`p-2 rounded-lg transition-all ${user.isBlocked ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                        {user.isBlocked ? <Unlock size={14}/> : <Ban size={14}/>}
                                    </button>
                                    <button onClick={() => handleDeleteUser(user.id)} className="p-2 bg-white/5 text-slate-600 hover:text-red-500 rounded-lg transition-all"><Trash2 size={14}/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      )}

      {activeAdminTab === 'profile' && (
        <div className="max-w-2xl mx-auto bg-card p-10 rounded-[40px] border border-white/5 shadow-2xl space-y-8 animate-in zoom-in-95">
            <div className="text-center">
                <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center text-primary mx-auto mb-4 border border-primary/20">
                    <Settings size={40} />
                </div>
                <h3 className="text-2xl font-black text-white">Configurações de Perfil</h3>
                <p className="text-slate-500 text-sm">Gerencie suas credenciais de acesso.</p>
            </div>

            <div className="space-y-6">
                <div>
                    <label className="block text-xs font-black text-slate-500 uppercase mb-2">Nome Completo</label>
                    <input type="text" className="w-full bg-dark border border-white/10 rounded-2xl p-5 text-white outline-none focus:border-primary" defaultValue={currentUser?.name} />
                </div>
                <div>
                    <label className="block text-xs font-black text-slate-500 uppercase mb-2">E-mail</label>
                    <input type="email" className="w-full bg-dark border border-white/10 rounded-2xl p-5 text-white outline-none focus:border-primary" defaultValue={currentUser?.email} />
                </div>
                <div>
                    <label className="block text-xs font-black text-slate-500 uppercase mb-2">Nova Senha (deixe em branco para manter)</label>
                    <input type="password" placeholder="••••••••" className="w-full bg-dark border border-white/10 rounded-2xl p-5 text-white outline-none focus:border-primary" />
                </div>
                <button className="w-full py-5 bg-primary text-dark font-black rounded-2xl shadow-xl hover:scale-105 transition-all">Salvar Alterações</button>
            </div>
        </div>
      )}

      {activeAdminTab === 'my_portal' && (
          <div className="space-y-8">
              {/* Conteúdo original de ManagementPanel (Subdomínio, Planos, etc) */}
              <div className="bg-card p-1 rounded-[40px] border border-white/5 shadow-2xl overflow-hidden">
                <div className="bg-dark/40 p-10 rounded-[38px] space-y-8">
                   <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                      <div className="flex items-center gap-4 text-left">
                        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary backdrop-blur-md">
                          <Globe size={32} />
                        </div>
                        <div>
                          <h3 className="font-mont text-2xl font-black text-white">Portal do Expert</h3>
                          <p className="text-slate-400 text-sm">Configure seu endereço exclusivo white-label.</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 px-6 py-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-full text-[10px] font-black uppercase tracking-widest">
                        <Rocket size={14} /> Sistema Online
                      </div>
                   </div>
                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                      <div className="space-y-6">
                        <div>
                          <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Escolha seu Subdomínio</label>
                          <div className="flex items-center gap-2">
                            <input 
                              type="text"
                              className="flex-1 bg-dark border border-white/10 rounded-2xl p-5 text-white outline-none focus:border-primary transition-all font-mono"
                              placeholder="seu-nome-aqui"
                              value={slug}
                              onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                            />
                            <span className="text-slate-500 font-bold">.mestredosdesafios.com.br</span>
                          </div>
                        </div>
                        <div className="p-6 bg-yellow-500/5 border border-yellow-500/10 rounded-2xl flex gap-4">
                          <AlertTriangle className="text-yellow-500 shrink-0" size={20} />
                          <p className="text-xs text-slate-400 leading-relaxed">Seu portal será criado instantaneamente com sua identidade visual.</p>
                        </div>
                      </div>
                      <div className="bg-dark p-8 rounded-3xl border border-white/5 flex flex-col justify-center items-center text-center space-y-6">
                         <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Visualização do Link</p>
                         <div className="text-2xl font-black text-white flex items-center gap-2 truncate max-w-full">
                           <span className="text-primary">{slug || '...'}</span>
                           <span className="opacity-40">.mestredosdesafios.com.br</span>
                         </div>
                         <button onClick={handleSaveSubdomain} disabled={!slug || isSaving} className="px-8 py-4 bg-primary text-dark rounded-2xl font-black hover:scale-105 transition-all shadow-xl flex items-center gap-2">
                           {isSaving ? <Loader2 className="animate-spin" /> : <Globe size={20} />} Publicar Portal
                         </button>
                      </div>
                   </div>
                </div>
              </div>
          </div>
      )}

      {/* User Management Modal */}
      {showUserModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-dark/95 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="max-w-md w-full bg-card p-10 rounded-[40px] border border-white/10 shadow-2xl relative">
                <button onClick={() => setShowUserModal(null)} className="absolute top-6 right-6 text-white/30 hover:text-white transition-colors"><Trash2/></button>
                <div className="text-center mb-8">
                    <img src={`https://ui-avatars.com/api/?name=${showUserModal.name}&size=128&background=random`} className="w-20 h-20 rounded-3xl mx-auto mb-4" />
                    <h3 className="text-2xl font-black text-white">{showUserModal.name}</h3>
                    <p className="text-slate-500 text-sm">{showUserModal.email}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-dark p-4 rounded-2xl border border-white/5 text-center">
                        <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Créditos</p>
                        <p className="text-xl font-black text-primary">{showUserModal.credits}</p>
                    </div>
                    <div className="bg-dark p-4 rounded-2xl border border-white/5 text-center">
                        <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Status</p>
                        <p className={`text-sm font-black ${showUserModal.isBlocked ? 'text-red-500' : 'text-emerald-500'}`}>{showUserModal.isBlocked ? 'Bloqueado' : 'Ativo'}</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex gap-2">
                        <button onClick={() => handleAddCredits(showUserModal.id, 5)} className="flex-1 py-3 bg-white/5 text-white rounded-xl font-bold border border-white/10 hover:bg-white/10">+5 Credits</button>
                        <button onClick={() => handleAddCredits(showUserModal.id, -5)} className="flex-1 py-3 bg-white/5 text-slate-500 rounded-xl font-bold border border-white/10 hover:bg-white/10">-5 Credits</button>
                    </div>
                    <button onClick={() => handleToggleBlock(showUserModal)} className={`w-full py-4 rounded-xl font-black text-sm uppercase ${showUserModal.isBlocked ? 'bg-emerald-500 text-dark' : 'bg-red-500 text-white'}`}>
                        {showUserModal.isBlocked ? 'Desbloquear Acesso' : 'Suspender Conta'}
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default ManagementPanel;

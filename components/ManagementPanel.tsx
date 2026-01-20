
import React, { useState, useEffect } from 'react';
import { Mentorship, RegisteredStudent, RegisteredGroup, ChallengePlan, User, UserRole } from '../types';
import * as Store from '../services/store';
import { saveTenantConfig } from '../services/tenantService';
import { 
  Users, GraduationCap, Package, Plus, Trash2, Mail, 
  Copy, Check, Share2, Globe, Rocket, AlertTriangle, 
  ExternalLink, Loader2, ShieldAlert, Ban, Unlock, Edit3, 
  Coins, UserPlus, Key, Settings, Save, X
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
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    role: UserRole.MENTOR,
    password: ''
  });
  const [activeAdminTab, setActiveAdminTab] = useState<'my_portal' | 'users' | 'profile'>('my_portal');

  useEffect(() => {
    setMentorships(Store.getMentorships() || []);
    setStudents(Store.getStudents() || []);
    setGroups(Store.getGroups() || []);
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
        setAllUsers(Array.isArray(users) ? users : []);
    } catch (e) {
        console.error("Erro ao carregar usuários:", e);
        setAllUsers([]);
    } finally {
        setIsLoadingUsers(false);
    }
  };

  const handleEditClick = (user: User) => {
    setShowUserModal(user);
    setEditFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      password: ''
    });
  };

  const handleUpdateUser = async () => {
    if (!showUserModal) return;
    try {
        const success = await Store.updateUserInfo(showUserModal.id, editFormData);
        if (success) {
            alert("Usuário atualizado com sucesso!");
            loadAllUsers();
            setShowUserModal(null);
        } else {
            alert("Erro ao atualizar usuário.");
        }
    } catch (error) {
        alert("Erro de conexão com o servidor.");
    }
  };

  const handleToggleBlock = async (user: User) => {
    if (!confirm(`Tem certeza que deseja ${user.isBlocked ? 'desbloquear' : 'bloquear'} ${user.name}?`)) return;
    try {
        const success = await Store.toggleUserBlockStatus(user.id, !user.isBlocked);
        if (success) loadAllUsers();
    } catch (error) {
        alert("Erro ao alterar status de bloqueio.");
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm("AÇÃO IRREVERSÍVEL: Deseja remover permanentemente este usuário e todos os seus dados?")) return;
    try {
        const success = await Store.deleteUserAccount(id);
        if (success) loadAllUsers();
    } catch (error) {
        alert("Erro ao remover usuário.");
    }
  };

  const handleAddCredits = async (id: string, amount: number) => {
    try {
        const success = await Store.modifyUserCredits(id, amount);
        if (success) {
            loadAllUsers();
            if (showUserModal) setShowUserModal(prev => prev ? {...prev, credits: prev.credits + amount} : null);
        }
    } catch (error) {
        alert("Erro ao modificar créditos.");
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
                    <h3 className="text-2xl font-black text-white">Painel do Administrador</h3>
                </div>
                <button onClick={loadAllUsers} className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl hover:bg-white/10 text-white transition-all text-xs font-bold">
                    {isLoadingUsers ? <Loader2 className="animate-spin w-4 h-4" /> : "Sincronizar"}
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-white/5 text-[10px] uppercase font-black text-slate-500 tracking-widest">
                            <th className="pb-4 pl-4">Expert / Usuário</th>
                            <th className="pb-4">Status</th>
                            <th className="pb-4">Role</th>
                            <th className="pb-4">Créditos</th>
                            <th className="pb-4">Total Gasto</th>
                            <th className="pb-4 text-right pr-4">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {allUsers?.length > 0 ? allUsers.map(user => (
                            <tr key={user.id} className="group hover:bg-white/5 transition-all">
                                <td className="py-4 pl-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black uppercase">
                                            {user.name?.charAt(0) || 'U'}
                                        </div>
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
                                <td><span className="text-sm font-bold text-white">R$ {Number(user.totalSpent || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></td>
                                <td className="py-4 text-right pr-4 space-x-2">
                                    <button onClick={() => handleEditClick(user)} className="p-2 bg-white/5 text-white rounded-lg hover:bg-primary hover:text-dark transition-all" title="Editar Usuário"><Edit3 size={14}/></button>
                                    <button onClick={() => handleToggleBlock(user)} className={`p-2 rounded-lg transition-all ${user.isBlocked ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`} title={user.isBlocked ? 'Desbloquear' : 'Bloquear'}>
                                        {user.isBlocked ? <Unlock size={14}/> : <Ban size={14}/>}
                                    </button>
                                    <button onClick={() => handleDeleteUser(user.id)} className="p-2 bg-white/5 text-slate-600 hover:text-red-500 rounded-lg transition-all" title="Excluir Permanentemente"><Trash2 size={14}/></button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={6} className="py-10 text-center text-slate-500 text-sm italic">
                                    {isLoadingUsers ? 'Carregando usuários...' : 'Nenhum usuário encontrado.'}
                                </td>
                            </tr>
                        )}
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
                <h3 className="text-2xl font-black text-white">Configurações do Admin</h3>
                <p className="text-slate-500 text-sm">Atualize seus dados de acesso mestre.</p>
            </div>

            <div className="space-y-6">
                <div>
                    <label className="block text-xs font-black text-slate-500 uppercase mb-2">Seu Nome</label>
                    <input type="text" className="w-full bg-dark border border-white/10 rounded-2xl p-5 text-white outline-none focus:border-primary" defaultValue={currentUser?.name} />
                </div>
                <div>
                    <label className="block text-xs font-black text-slate-500 uppercase mb-2">E-mail de Administrador</label>
                    <input type="email" className="w-full bg-dark border border-white/10 rounded-2xl p-5 text-white outline-none focus:border-primary" defaultValue={currentUser?.email} />
                </div>
                <div>
                    <label className="block text-xs font-black text-slate-500 uppercase mb-2">Alterar Senha</label>
                    <input type="password" placeholder="••••••••" className="w-full bg-dark border border-white/10 rounded-2xl p-5 text-white outline-none focus:border-primary" />
                </div>
                <button className="w-full py-5 bg-primary text-dark font-black rounded-2xl shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2">
                    <Save size={20} /> Salvar Meus Dados
                </button>
            </div>
        </div>
      )}

      {activeAdminTab === 'my_portal' && (
          <div className="space-y-8">
              <div className="bg-card p-1 rounded-[40px] border border-white/5 shadow-2xl overflow-hidden">
                <div className="bg-dark/40 p-10 rounded-[38px] space-y-8">
                   <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                      <div className="flex items-center gap-4 text-left">
                        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary backdrop-blur-md">
                          <Globe size={32} />
                        </div>
                        <div>
                          <h3 className="font-mont text-2xl font-black text-white">Customização de Domínio</h3>
                          <p className="text-slate-400 text-sm">Defina o endereço público da sua plataforma.</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 px-6 py-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-full text-[10px] font-black uppercase tracking-widest">
                        <Rocket size={14} /> Redes Ativas
                      </div>
                   </div>
                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                      <div className="space-y-6">
                        <div>
                          <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Subdomínio</label>
                          <div className="flex items-center gap-2">
                            <input 
                              type="text"
                              className="flex-1 bg-dark border border-white/10 rounded-2xl p-5 text-white outline-none focus:border-primary transition-all font-mono"
                              placeholder="sua-mentoria"
                              value={slug}
                              onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                            />
                            <span className="text-slate-500 font-bold">.mestredosdesafios.com.br</span>
                          </div>
                        </div>
                        <div className="p-6 bg-yellow-500/5 border border-yellow-500/10 rounded-2xl flex gap-4">
                          <AlertTriangle className="text-yellow-500 shrink-0" size={20} />
                          <p className="text-xs text-slate-400 leading-relaxed">Este endereço será usado por seus alunos para acessar os desafios personalizados.</p>
                        </div>
                      </div>
                      <div className="bg-dark p-8 rounded-3xl border border-white/5 flex flex-col justify-center items-center text-center space-y-6">
                         <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">URL do Portal</p>
                         <div className="text-2xl font-black text-white flex items-center gap-2 truncate max-w-full">
                           <span className="text-primary">{slug || '...'}</span>
                           <span className="opacity-40">.mestredosdesafios.com.br</span>
                         </div>
                         <button onClick={handleSaveSubdomain} disabled={!slug || isSaving} className="px-8 py-4 bg-primary text-dark rounded-2xl font-black hover:scale-105 transition-all shadow-xl flex items-center gap-2">
                           {isSaving ? <Loader2 className="animate-spin" /> : <Globe size={20} />} Publicar Tenant
                         </button>
                      </div>
                   </div>
                </div>
              </div>
          </div>
      )}

      {/* MODAL: EDIÇÃO COMPLETA DE USUÁRIO */}
      {showUserModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-dark/95 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="max-w-2xl w-full bg-card p-1 rounded-[40px] border border-white/10 shadow-2xl relative overflow-hidden">
                <div className="bg-dark/40 p-10 space-y-8">
                  <button onClick={() => setShowUserModal(null)} className="absolute top-8 right-8 text-white/30 hover:text-white transition-colors">
                    <X size={24} />
                  </button>
                  
                  <div className="flex items-center gap-6 mb-8 border-b border-white/5 pb-8">
                      <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center text-primary font-black text-3xl uppercase">
                        {showUserModal.name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <h3 className="text-3xl font-black text-white">{showUserModal.name}</h3>
                        <p className="text-slate-500 font-bold">{showUserModal.email}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-[10px] font-black uppercase text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">ID: {showUserModal.id.substring(0,8)}</span>
                          <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full border ${showUserModal.isBlocked ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}`}>
                            {showUserModal.isBlocked ? 'Bloqueado' : 'Conta Ativa'}
                          </span>
                        </div>
                      </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Dados de Perfil */}
                    <div className="space-y-6">
                      <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest border-l-2 border-primary pl-3">Perfil & Segurança</h4>
                      <div>
                        <label className="block text-[10px] font-black text-slate-600 uppercase mb-2">Nome</label>
                        <input type="text" className="w-full bg-dark border border-white/10 rounded-xl p-4 text-sm text-white focus:border-primary outline-none" value={editFormData.name} onChange={e => setEditFormData({...editFormData, name: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-600 uppercase mb-2">E-mail</label>
                        <input type="email" className="w-full bg-dark border border-white/10 rounded-xl p-4 text-sm text-white focus:border-primary outline-none" value={editFormData.email} onChange={e => setEditFormData({...editFormData, email: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-600 uppercase mb-2">Nível de Acesso</label>
                        <select className="w-full bg-dark border border-white/10 rounded-xl p-4 text-sm text-white focus:border-primary outline-none" value={editFormData.role} onChange={e => setEditFormData({...editFormData, role: e.target.value as UserRole})}>
                          <option value={UserRole.MENTOR}>MENTOR</option>
                          <option value={UserRole.STUDENT}>ALUNO</option>
                          <option value={UserRole.ADMIN}>ADMINISTRADOR</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-600 uppercase mb-2">Redefinir Senha</label>
                        <input type="password" placeholder="Nova senha se desejar mudar" className="w-full bg-dark border border-white/10 rounded-xl p-4 text-sm text-white focus:border-primary outline-none" value={editFormData.password} onChange={e => setEditFormData({...editFormData, password: e.target.value})} />
                      </div>
                      <button onClick={handleUpdateUser} className="w-full py-4 bg-white text-dark font-black rounded-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2 text-sm shadow-xl">
                        <Save size={18} /> Salvar Perfil
                      </button>
                    </div>

                    {/* Finanças e Créditos */}
                    <div className="space-y-6">
                      <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest border-l-2 border-emerald-500 pl-3">Saldo & Gestão</h4>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-dark/50 p-5 rounded-2xl border border-white/5 text-center">
                          <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Créditos</p>
                          <p className="text-2xl font-black text-primary">{showUserModal.credits}</p>
                        </div>
                        <div className="bg-dark/50 p-5 rounded-2xl border border-white/5 text-center">
                          <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Total Pago</p>
                          <p className="text-sm font-black text-white">R$ {Number(showUserModal.totalSpent || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <p className="text-[10px] font-black text-slate-500 uppercase text-center">Modificar Créditos</p>
                        <div className="flex gap-2">
                            <button onClick={() => handleAddCredits(showUserModal.id, 1)} className="flex-1 py-3 bg-emerald-500/10 text-emerald-500 rounded-xl font-bold border border-emerald-500/20 hover:bg-emerald-500 hover:text-dark transition-all">+1</button>
                            <button onClick={() => handleAddCredits(showUserModal.id, 5)} className="flex-1 py-3 bg-emerald-500/10 text-emerald-500 rounded-xl font-bold border border-emerald-500/20 hover:bg-emerald-500 hover:text-dark transition-all">+5</button>
                            <button onClick={() => handleAddCredits(showUserModal.id, -1)} className="flex-1 py-3 bg-red-500/10 text-red-500 rounded-xl font-bold border border-red-500/20 hover:bg-red-500 hover:text-white transition-all">-1</button>
                        </div>
                      </div>

                      <div className="pt-6 border-t border-white/5 space-y-3">
                        <button onClick={() => handleToggleBlock(showUserModal)} className={`w-full py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${showUserModal.isBlocked ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30' : 'bg-red-500/20 text-red-500 border border-red-500/30'}`}>
                            {showUserModal.isBlocked ? 'Reativar Conta' : 'Suspender Acesso'}
                        </button>
                        <button onClick={() => { handleDeleteUser(showUserModal.id); setShowUserModal(null); }} className="w-full py-4 text-slate-600 hover:text-red-500 text-xs font-black uppercase tracking-widest transition-all">
                            Apagar Permanentemente
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default ManagementPanel;


import React, { useState, useEffect } from 'react';
import { Mentorship, RegisteredStudent, RegisteredGroup, ChallengePlan, TenantConfig } from '../types';
import * as Store from '../services/store';
import { Users, GraduationCap, Package, Plus, Trash2, Mail, Link, Copy, Check, Share2, Download, FileJson } from 'lucide-react';
import { useTenant } from '../contexts/TenantContext';

const ManagementPanel: React.FC = () => {
  const { config: tenantConfig } = useTenant();
  const [mentorships, setMentorships] = useState<Mentorship[]>([]);
  const [students, setStudents] = useState<RegisteredStudent[]>([]);
  const [groups, setGroups] = useState<RegisteredGroup[]>([]);
  const [plan, setPlan] = useState<ChallengePlan | null>(null);
  const [copied, setCopied] = useState(false);
  
  const [showAddMentorship, setShowAddMentorship] = useState(false);
  const [newM, setNewM] = useState({ title: '', description: '' });

  useEffect(() => {
    setMentorships(Store.getMentorships());
    setStudents(Store.getStudents());
    setGroups(Store.getGroups());
    setPlan(Store.getPlan());
  }, []);

  const handleCopyLink = () => {
    if (!plan) return;
    const shareUrl = `${window.location.origin}/?invite=${plan.id}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportTenant = () => {
    const user = Store.getCurrentUser();
    const plan = Store.getPlan();

    if (!user || !plan) {
      alert("Crie uma jornada (plano) antes de exportar.");
      return;
    }

    // Converte o plano atual em uma Track gamificada para o Tenant
    const tenantToExport: TenantConfig = {
      slug: user.name.toLowerCase().replace(/\s/g, ''),
      isAdminTenant: false,
      branding: user.branding || {
        primaryColor: '#fe7501',
        secondaryColor: '#10b981',
        accentColor: '#f43f5e',
        mentoryName: 'Minha Mentoria',
        expertName: user.name
      },
      landing: {
        headline: `Bem-vindo à Jornada ${plan.planTitle}`,
        subheadline: plan.planDescription,
        ctaText: 'Iniciar Jornada Gamificada'
      },
      tracks: [
        {
          id: plan.id,
          name: plan.planTitle,
          description: plan.planDescription,
          days: plan.challenges.length,
          challenges: plan.challenges.map(c => {
            const { completed, comments, ...rest } = c;
            return {
              ...rest,
              proofType: 'text',
              badge: 'Conquistador'
            };
          })
        }
      ]
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(tenantToExport, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `${tenantToExport.slug}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    
    alert(`Instância [${tenantToExport.slug}.json] exportada com sucesso! \n\nPróximo passo: Coloque esse arquivo na pasta /public/tenants/ e configure seu subdomínio.`);
  };

  const addMentorship = () => {
    if (!newM.title) return;
    const m: Mentorship = {
      id: crypto.randomUUID(),
      expertId: Store.getCurrentUser()?.id || 'me',
      title: newM.title,
      description: newM.description,
      price: 0,
      createdAt: new Date().toISOString()
    };
    Store.saveMentorship(m);
    setMentorships([...mentorships, m]);
    setNewM({ title: '', description: '' });
    setShowAddMentorship(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Exportação de Instância */}
      <div className="bg-gradient-to-r from-primary/20 to-indigo-500/20 p-8 rounded-[40px] border border-white/10 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 text-left">
          <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-primary backdrop-blur-md">
            <FileJson size={32} />
          </div>
          <div>
            <h3 className="font-mont text-xl font-black text-white">Publicar como Sistema Gamificado</h3>
            <p className="text-slate-400 text-sm">Exporte sua jornada atual para seu próprio subdomínio white-label.</p>
          </div>
        </div>
        <button 
          onClick={handleExportTenant}
          className="flex items-center gap-2 px-8 py-4 bg-white text-dark rounded-2xl font-black hover:scale-105 transition-all shadow-xl"
        >
          <Download size={20} /> Exportar Tenant (.json)
        </button>
      </div>

      {plan && (
        <div className="bg-card p-8 rounded-[40px] border border-white/5 shadow-2xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                <Share2 size={24} />
              </div>
              <div className="text-left">
                <h3 className="font-mont text-lg font-black text-white">Convite Rápido</h3>
                <p className="text-slate-500 text-xs">Acesso direto à jornada atual.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-dark/50 p-2 rounded-2xl border border-white/10 w-full md:w-auto">
              <code className="px-4 text-xs text-primary font-mono truncate max-w-[200px]">
                {window.location.origin}/?invite={plan.id.substring(0,8)}...
              </code>
              <button 
                onClick={handleCopyLink}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${copied ? 'bg-emerald-500 text-white' : 'bg-primary text-dark hover:brightness-110'}`}
              >
                {copied ? <Check size={18} /> : <Copy size={18} />}
                {copied ? 'Copiado!' : 'Copiar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grid de Gestão */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-card p-8 rounded-2xl border border-white/5 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Package className="text-primary" />
              <h3 className="text-xl font-bold text-white">Seus Produtos</h3>
            </div>
            <button onClick={() => setShowAddMentorship(true)} className="bg-white/5 text-white text-[10px] font-black px-4 py-2 rounded-lg border border-white/10">NOVO</button>
          </div>
          {/* Listagem Simplificada */}
          <div className="space-y-3">
            {mentorships.map(m => (
              <div key={m.id} className="p-4 bg-dark/30 rounded-2xl border border-white/5 flex justify-between items-center group">
                <span className="text-sm font-bold text-white group-hover:text-primary transition-colors">{m.title}</span>
                <Trash2 size={14} className="text-slate-600 hover:text-red-500 cursor-pointer" />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card p-8 rounded-2xl border border-white/5 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <GraduationCap className="text-emerald-500" />
            <h3 className="text-xl font-bold text-white">Alunos Ativos</h3>
          </div>
          <div className="space-y-3">
             {students.length > 0 ? students.map(s => (
               <div key={s.id} className="flex items-center justify-between p-4 bg-dark/30 rounded-2xl border border-white/5">
                  <span className="text-sm font-bold text-white">{s.name}</span>
                  <Mail size={16} className="text-slate-500" />
               </div>
             )) : (
               <p className="text-slate-600 text-xs italic text-center py-4">Aguardando primeiros alunos...</p>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagementPanel;

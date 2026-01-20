
import React, { useState, useEffect } from 'react';
import { Mentorship, RegisteredStudent, RegisteredGroup, ChallengePlan } from '../types';
import * as Store from '../services/store';
import { Users, GraduationCap, Package, Plus, Trash2, Mail, Link, Copy, Check, Share2 } from 'lucide-react';

const ManagementPanel: React.FC = () => {
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

  const addMentorship = () => {
    if (!newM.title) return;
    const m: Mentorship = {
      id: crypto.randomUUID(),
      title: newM.title,
      description: newM.description,
      createdAt: new Date().toISOString()
    };
    Store.saveMentorship(m);
    setMentorships([...mentorships, m]);
    setNewM({ title: '', description: '' });
    setShowAddMentorship(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Jornada Ativa e Compartilhamento */}
      {plan && (
        <div className="bg-gradient-to-br from-card to-dark p-8 rounded-[40px] border border-primary/20 shadow-2xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-primary/20 rounded-full flex items-center justify-center text-primary shadow-inner">
                <Share2 size={28} />
              </div>
              <div>
                <h3 className="font-mont text-xl font-black text-white">Convidar para a Jornada</h3>
                <p className="text-slate-500 text-sm">Envie este link para seu mentorado iniciar o desafio.</p>
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
                {copied ? 'Copiado!' : 'Copiar Link'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mentorias / Produtos */}
      <div className="bg-card p-8 rounded-2xl border border-white/5 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Package className="text-primary" />
            <h3 className="text-xl font-bold text-white">Suas Mentorias & Produtos</h3>
          </div>
          <button 
            onClick={() => setShowAddMentorship(true)}
            className="bg-primary/10 text-primary border border-primary/20 text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary hover:text-dark transition-all"
          >
            <Plus size={14} /> Nova Mentoria
          </button>
        </div>

        {showAddMentorship && (
          <div className="mb-6 p-6 bg-dark/50 rounded-3xl border border-white/10 space-y-4 animate-in slide-in-from-top-4">
            <input 
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-primary" 
              placeholder="Nome da Mentoria (Ex: Mentoria de Emagrecimento Sistêmico)"
              value={newM.title}
              onChange={e => setNewM({...newM, title: e.target.value})}
            />
            <textarea 
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white outline-none h-20" 
              placeholder="Qual o objetivo principal desta mentoria?"
              value={newM.description}
              onChange={e => setNewM({...newM, description: e.target.value})}
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowAddMentorship(false)} className="text-slate-400 text-sm font-bold">Cancelar</button>
              <button onClick={addMentorship} className="bg-primary text-dark px-6 py-2 rounded-xl text-sm font-black">Salvar Mentoria</button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mentorships.length > 0 ? mentorships.map(m => (
            <div key={m.id} className="p-6 bg-dark/30 rounded-3xl border border-white/5 hover:border-primary/50 transition-all group">
              <h4 className="text-white font-black mb-1 group-hover:text-primary transition-colors">{m.title}</h4>
              <p className="text-slate-500 text-xs mb-4 line-clamp-2">{m.description}</p>
              <div className="flex justify-between items-center text-[10px] text-slate-600 font-bold uppercase tracking-widest">
                <span>{new Date(m.createdAt).toLocaleDateString()}</span>
                <button className="text-red-500/30 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
              </div>
            </div>
          )) : (
            <div className="col-span-full py-12 text-center text-slate-600 text-sm italic border-2 border-dashed border-white/5 rounded-3xl">
              Nenhuma mentoria cadastrada ainda. Comece criando sua primeira oferta.
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Alunos Cadastrados */}
        <div className="bg-card p-8 rounded-2xl border border-white/5 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <GraduationCap className="text-emerald-500" />
            <h3 className="text-xl font-bold text-white">Base de Mentorados</h3>
          </div>
          <div className="space-y-3">
             {students.length > 0 ? students.map(s => (
               <div key={s.id} className="flex items-center justify-between p-4 bg-dark/30 rounded-2xl border border-white/5 hover:bg-dark/50 transition-all">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                      <i className="ri-user-line"></i>
                    </div>
                    <div>
                      <p className="text-sm font-black text-white leading-none">{s.name}</p>
                      <p className="text-[10px] text-slate-500 font-bold">{s.email}</p>
                    </div>
                 </div>
                 <button className="p-2 text-slate-500 hover:text-primary transition-all">
                    <Mail size={18} />
                 </button>
               </div>
             )) : (
               <div className="py-8 text-center bg-dark/20 rounded-2xl border border-dashed border-white/5">
                 <p className="text-slate-600 text-sm italic">Seus alunos aparecerão aqui conforme entrarem pelos links.</p>
               </div>
             )}
          </div>
        </div>

        {/* Grupos de Desafio */}
        <div className="bg-card p-8 rounded-2xl border border-white/5 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <Users className="text-indigo-400" />
            <h3 className="text-xl font-bold text-white">Grupos de Desafio</h3>
          </div>
          <div className="space-y-3">
             {groups.length > 0 ? groups.map(g => (
               <div key={g.id} className="flex items-center justify-between p-4 bg-dark/30 rounded-2xl border border-white/5">
                 <div>
                   <p className="text-sm font-black text-white leading-none">{g.name}</p>
                   <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{g.studentCount} Participantes</p>
                 </div>
                 <span className="text-[10px] font-black px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full border border-indigo-500/20">ATIVO</span>
               </div>
             )) : (
               <div className="py-8 text-center bg-dark/20 rounded-2xl border border-dashed border-white/5">
                 <p className="text-slate-600 text-sm italic">Crie grupos para jornadas coletivas de mentorias.</p>
               </div>
             )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ManagementPanel;

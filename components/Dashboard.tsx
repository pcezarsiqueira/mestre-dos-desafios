
import React, { useMemo, useState } from 'react';
import { ChallengePlan, HealthArea, Challenge } from '../types';
import { updateChallengeStatus, addCommentToChallenge } from '../services/store';
import { CheckCircle2, Circle, Trophy, BarChart3, Activity, Clock, Zap, MessageSquare, Send, Flame, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface DashboardProps {
  plan: ChallengePlan;
  onUpdate: (updatedPlan: ChallengePlan) => void;
  isMentorView: boolean;
}

// Define interface for Act mapping
interface ActGroup {
  title: string;
  desc: string;
  challenges: Challenge[];
}

const Dashboard: React.FC<DashboardProps> = ({ plan, onUpdate, isMentorView }) => {
  const [commentText, setCommentText] = useState<Record<number, string>>({});
  const [expandedActs, setExpandedActs] = useState<Record<number, boolean>>({ 1: true, 2: false, 3: false });

  const progress = useMemo(() => {
    const total = plan.challenges.length;
    const completed = plan.challenges.filter(c => c.completed).length;
    return Math.round((completed / total) * 100);
  }, [plan.challenges]);

  const totalXP = useMemo(() => {
    return plan.challenges.filter(c => c.completed).reduce((acc, curr) => acc + curr.xp, 0);
  }, [plan.challenges]);

  // Agrupar desafios por Atos
  // Fix: Explicitly type 'acts' to avoid 'unknown' type inference in Object.entries mapping
  const acts: Record<number, ActGroup> = useMemo(() => {
    return {
      1: { title: 'ATO 1: Mundo Comum & Diagnóstico', desc: 'Foco em clareza, crenças e primeira vitória.', challenges: plan.challenges.filter(c => c.day >= 1 && c.day <= 7) },
      2: { title: 'ATO 2: O Chamado & Conflito', desc: 'Enfrentando as travas e aumentando a exposição.', challenges: plan.challenges.filter(c => c.day >= 8 && c.day <= 13) },
      3: { title: 'ATO 3: A Grande Transformação', desc: 'Consolidação, prova real e nova identidade.', challenges: plan.challenges.filter(c => c.day >= 14 && c.day <= 21) },
    };
  }, [plan.challenges]);

  const chartData = useMemo(() => {
    const weights: Record<string, number> = {};
    Object.values(HealthArea).forEach(area => weights[area] = 0);
    plan.challenges.forEach(c => {
      if (c.health_area_weights) {
        Object.entries(c.health_area_weights).forEach(([area, weight]) => {
          if (weights[area] !== undefined) weights[area] += Number(weight);
        });
      }
    });
    return Object.keys(weights).map(area => ({
      subject: area,
      A: weights[area],
      fullMark: Math.max(...Object.values(weights)) || 10
    }));
  }, [plan.challenges]);

  const handleAddComment = (day: number) => {
    if (!commentText[day]) return;
    const updated = addCommentToChallenge(day, isMentorView ? "Mentor" : plan.studentName, commentText[day]);
    if (updated) {
      onUpdate(updated);
      setCommentText({...commentText, [day]: ''});
    }
  };

  const toggleChallenge = (day: number, currentStatus: boolean) => {
    if (isMentorView) return;
    const updated = updateChallengeStatus(day, !currentStatus);
    if (updated) onUpdate(updated);
  };

  const toggleAct = (id: number) => {
    setExpandedActs(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
      
      {/* Listagem por Atos */}
      <div className="lg:col-span-2 space-y-10">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-card/50 backdrop-blur-sm p-5 rounded-[24px] border border-white/5 text-center shadow-xl">
             <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Experiência</p>
             <p className="text-2xl font-black text-white flex items-center justify-center gap-2">
               <Sparkles className="text-primary w-5 h-5" /> {totalXP}
             </p>
          </div>
          <div className="bg-card/50 backdrop-blur-sm p-5 rounded-[24px] border border-white/5 text-center shadow-xl">
             <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Progresso</p>
             <p className="text-2xl font-black text-white">{progress}%</p>
          </div>
          <div className="bg-card/50 backdrop-blur-sm p-5 rounded-[24px] border border-white/5 text-center shadow-xl">
             <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Check-ins</p>
             <p className="text-2xl font-black text-white">{plan.challenges.filter(c => c.completed).length}/21</p>
          </div>
        </div>

        {/* Fix: Cast Object.entries to [string, ActGroup][] to ensure type safety for 'act' */}
        {(Object.entries(acts) as unknown as [string, ActGroup][]).map(([id, act]) => (
          <div key={id} className="space-y-4">
            <button 
              onClick={() => toggleAct(Number(id))}
              className="w-full flex items-center justify-between p-6 bg-dark/40 rounded-[28px] border border-white/10 hover:border-primary/30 transition-all text-left group"
            >
              <div>
                <h3 className="font-mont text-lg font-black text-white group-hover:text-primary transition-colors">{act.title}</h3>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">{act.desc}</p>
              </div>
              {expandedActs[Number(id)] ? <ChevronUp className="text-slate-500" /> : <ChevronDown className="text-slate-500" />}
            </button>

            {expandedActs[Number(id)] && (
              <div className="space-y-6 animate-in slide-in-from-top-4 duration-300">
                {act.challenges.map((challenge) => (
                  <ChallengeCard 
                    key={challenge.day} 
                    challenge={challenge} 
                    isMentorView={isMentorView} 
                    onToggle={toggleChallenge}
                    onAddComment={handleAddComment}
                    commentValue={commentText[challenge.day] || ''}
                    onCommentChange={(val) => setCommentText({...commentText, [challenge.day]: val})}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Sidebar (Radar) */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-card p-8 rounded-[40px] border border-white/5 sticky top-24 shadow-2xl overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full -mr-16 -mt-16" />
           <div className="text-center mb-8 relative z-10">
             <div className="w-14 h-14 bg-gradient-to-br from-primary to-[#fdd831] rounded-2xl flex items-center justify-center text-dark mx-auto mb-4 shadow-xl rotate-3">
               <Activity size={28} />
             </div>
             <h3 className="font-mont text-xl font-black text-white">Impacto Sistêmico</h3>
             <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-1">Status Evolutivo 360º</p>
           </div>

           <div className="h-64 w-full relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                  <PolarGrid stroke="rgba(255,255,255,0.05)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 9, fontWeight: 'bold' }} />
                  <Radar
                    name="Impacto"
                    dataKey="A"
                    stroke="var(--primary-custom)"
                    fill="var(--primary-custom)"
                    fillOpacity={0.4}
                  />
                  <Tooltip contentStyle={{ backgroundColor: '#0b0a12', border: 'none', borderRadius: '16px', fontSize: '10px' }} />
                </RadarChart>
              </ResponsiveContainer>
           </div>
           
           <div className="mt-8 space-y-3 relative z-10">
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest text-center border-b border-white/5 pb-3">Pilares de Crescimento</p>
              {chartData.sort((a,b) => b.A - a.A).slice(0, 4).map((area, i) => (
                <div key={area.subject} className="flex justify-between items-center group">
                  <span className="text-xs text-slate-400 group-hover:text-white transition-colors font-bold">{area.subject}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-primary to-[#fdd831]" style={{ width: `${Math.min((area.A / 15) * 100, 100)}%` }} />
                    </div>
                    <span className="text-[10px] font-black text-primary">+{area.A}</span>
                  </div>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};

// Subcomponente para organizar melhor o código
const ChallengeCard = ({ challenge, isMentorView, onToggle, onAddComment, commentValue, onCommentChange }: any) => {
  return (
    <div 
      className={`
        bg-card/60 backdrop-blur-sm rounded-[32px] border overflow-hidden transition-all relative
        ${challenge.isFireTrial ? 'border-primary/40 shadow-[0_0_50px_rgba(254,117,1,0.15)] bg-primary/5' : 'border-white/5'}
        ${challenge.completed ? 'opacity-60 grayscale-[0.5]' : 'shadow-2xl hover:border-white/20 hover:-translate-y-1'}
      `}
    >
      {challenge.isFireTrial && (
        <div className="absolute top-5 right-20 flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest bg-primary/15 px-4 py-1.5 rounded-full border border-primary/20">
          <Flame size={12} fill="currentColor" className="animate-pulse" /> Prova de Fogo
        </div>
      )}
      
      <div className="h-2 w-full" style={{ background: challenge.isFireTrial ? 'linear-gradient(90deg, var(--primary-custom), #fdd831)' : 'rgba(255,255,255,0.03)' }} />
      
      <div className="p-8">
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-[10px] font-black px-3 py-1 bg-primary/10 rounded-full text-primary border border-primary/10 tracking-widest">DIA {challenge.day}</span>
              {challenge.completed && <span className="text-[10px] font-black px-3 py-1 bg-emerald-500/10 rounded-full text-emerald-500 border border-emerald-500/10 tracking-widest uppercase">CONCLUÍDO</span>}
            </div>
            <h3 className={`text-2xl font-black leading-tight font-mont ${challenge.isFireTrial ? 'text-primary' : 'text-white'}`}>
              {challenge.title}
            </h3>
          </div>
          <button 
            onClick={() => onToggle(challenge.day, challenge.completed)}
            disabled={isMentorView}
            className="transition-transform active:scale-90 ml-4"
          >
            {challenge.completed ? <CheckCircle2 className="text-emerald-500 w-12 h-12" /> : <Circle className="text-white/10 w-12 h-12 hover:text-white/30" />}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
           <div className="flex items-center gap-2 text-xs text-slate-500 font-bold"><Clock size={14} className="text-slate-400" /> {challenge.estimated_time}</div>
           <div className="flex items-center gap-2 text-xs text-primary font-black uppercase tracking-widest"><Zap size={14} fill="currentColor" /> {challenge.xp} XP</div>
        </div>

        <div className="bg-dark/40 p-6 rounded-[24px] border border-white/5 mb-6">
           <p className="text-slate-200 text-sm leading-relaxed mb-4 font-bold italic">"{challenge.objective}"</p>
           <ul className="space-y-4">
              {challenge.instructions.map((inst: string, i: number) => (
                <li key={i} className="flex gap-3 text-sm text-slate-400 leading-relaxed">
                  <span className="w-5 h-5 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5 border border-primary/10">{i+1}</span>
                  {inst}
                </li>
              ))}
           </ul>
        </div>

        {/* Diário da Jornada */}
        <div className="border-t border-white/5 pt-6">
           <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-4">
             <MessageSquare size={14} /> Relato de Evolução
           </h4>
           
           <div className="space-y-4 mb-4 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
              {challenge.comments?.length > 0 ? challenge.comments.map((c: any) => (
                <div key={c.id} className="bg-white/5 p-4 rounded-2xl border border-white/5 animate-in fade-in">
                  <div className="flex justify-between text-[10px] mb-2 font-black uppercase tracking-widest">
                    <span className="text-primary">{c.studentName}</span>
                    <span className="text-slate-600">{new Date(c.timestamp).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed font-medium">{c.text}</p>
                </div>
              )) : (
                <p className="text-[10px] text-slate-600 italic">Nenhum relato para este dia ainda.</p>
              )}
           </div>

           {!isMentorView && (
             <div className="flex gap-2 bg-dark/50 p-1 rounded-2xl border border-white/10">
               <input 
                 type="text"
                 placeholder="O que você aprendeu com este desafio?"
                 className="flex-1 bg-transparent px-4 py-3 text-sm text-white outline-none"
                 value={commentValue}
                 onChange={e => onCommentChange(e.target.value)}
                 onKeyPress={e => e.key === 'Enter' && onAddComment(challenge.day)}
               />
               <button 
                onClick={() => onAddComment(challenge.day)}
                disabled={!commentValue}
                className="p-3 bg-primary text-dark rounded-xl hover:brightness-110 transition-all shadow-lg disabled:opacity-50"
               >
                  <Send size={20} />
               </button>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

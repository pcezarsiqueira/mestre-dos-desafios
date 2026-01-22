
import React, { useMemo, useState, useEffect } from 'react';
import { ChallengePlan, HealthArea, Challenge, UserRole } from '../types';
import { updateChallengeStatus, addCommentToChallenge, getStudents, getGroups } from '../services/store';
import { CheckCircle2, Circle, Trophy, BarChart3, Activity, Clock, Zap, MessageSquare, Send, Brain, Target, ShieldCheck, Users as UsersIcon, ChevronDown, ChevronUp, User as UserIcon } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface DashboardProps {
  plan: ChallengePlan;
  onUpdate: (updatedPlan: ChallengePlan) => void;
  isMentorView: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ plan, onUpdate, isMentorView }) => {
  const [commentText, setCommentText] = useState<Record<number, string>>({});
  const [expandedActs, setExpandedActs] = useState<Record<number, boolean>>({ 1: true, 2: false, 3: false });
  const [viewMode, setViewMode] = useState<'individual' | 'group' | 'all'>('individual');
  
  // Dados simulados para o mentor acompanhar outros alunos
  const [otherStudents] = useState(getStudents());
  const [otherGroups] = useState(getGroups());

  const progress = useMemo(() => {
    const total = plan.challenges.length;
    if (total === 0) return 0;
    const completed = plan.challenges.filter(c => c.completed).length;
    return Math.round((completed / total) * 100);
  }, [plan.challenges]);

  // Fix: Added explicit return type to acts to avoid 'unknown' inference
  const acts = useMemo((): Record<number, { title: string; challenges: Challenge[] }> => {
    const ch = plan.challenges;
    return {
      1: { title: 'ATO 1: Clareza e Diagnóstico', challenges: ch.filter(c => c.day <= 7) },
      2: { title: 'ATO 2: Confronto e Quebra', challenges: ch.filter(c => c.day > 7 && c.day <= 14) },
      3: { title: 'ATO 3: Transformação e Fire Trial', challenges: ch.filter(c => c.day > 14) },
    };
  }, [plan.challenges]);

  const chartData = useMemo(() => {
    const weights: Record<string, number> = {};
    Object.values(HealthArea).forEach(area => weights[area] = 0);
    plan.challenges.forEach(c => {
      Object.entries(c.health_area_weights || {}).forEach(([area, weight]) => {
        if (weights[area] !== undefined) weights[area] += Number(weight);
      });
    });
    return Object.keys(weights).map(area => ({ subject: area, A: weights[area] }));
  }, [plan.challenges]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 pb-20">
      
      {/* Menu Lateral do Mentor (Visão Geral) */}
      {isMentorView && (
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-card p-6 rounded-[32px] border border-white/5 space-y-4">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Gestão de Alunos</h4>
            <div className="space-y-2">
               <button onClick={() => setViewMode('all')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${viewMode === 'all' ? 'bg-primary text-dark' : 'hover:bg-white/5 text-slate-300'}`}>
                 <UsersIcon size={18} /> <span className="text-sm font-bold">Ver Todos</span>
               </button>
               <button onClick={() => setViewMode('individual')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${viewMode === 'individual' ? 'bg-primary text-dark' : 'hover:bg-white/5 text-slate-300'}`}>
                 <UserIcon size={18} /> <span className="text-sm font-bold">Individuais</span>
               </button>
               <button onClick={() => setViewMode('group')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${viewMode === 'group' ? 'bg-primary text-dark' : 'hover:bg-white/5 text-slate-300'}`}>
                 <Target size={18} /> <span className="text-sm font-bold">Grupos</span>
               </button>
            </div>
            
            <div className="pt-4 border-t border-white/5">
               <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2 mb-3">Ativos Agora</h4>
               <div className="space-y-3">
                 {[plan.studentName, "Carlos Souza", "Grupo Beta"].map(name => (
                   <div key={name} className="flex items-center justify-between p-2">
                     <span className="text-xs font-bold text-white">{name}</span>
                     <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">Online</span>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Coluna Central */}
      <div className={`${isMentorView ? 'lg:col-span-2' : 'lg:col-span-3'} space-y-8`}>
        {/* Progresso Geral */}
        <div className="grid grid-cols-3 gap-4">
          <StatBox label="Check-ins" value={`${plan.challenges.filter(c => c.completed).length}/21`} />
          <StatBox label="Progresso" value={`${progress}%`} color="text-primary" />
          <StatBox label="XP Acumulado" value={plan.challenges.filter(c => c.completed).reduce((a, b) => a + b.xp, 0).toString()} />
        </div>

        {/* Lista de Atos */}
        {/* Fix: Explicitly cast Object.entries results to resolve 'unknown' property access errors */}
        {(Object.entries(acts) as [string, { title: string; challenges: Challenge[] }][]).map(([id, act]) => (
          <div key={id} className="space-y-4">
            <div className="p-4 bg-dark/40 rounded-2xl border border-white/10 flex justify-between items-center">
              <h3 className="font-mont text-sm font-black text-white uppercase tracking-widest">{act.title}</h3>
              <span className="text-[10px] font-bold text-slate-500">{act.challenges.filter(c => c.completed).length}/{act.challenges.length} Concluídos</span>
            </div>
            <div className="space-y-4">
              {act.challenges.map(c => (
                <ChallengeItem key={c.day} challenge={c} isMentor={isMentorView} onToggle={(day: number) => {
                  if(!isMentorView) {
                    const upd = updateChallengeStatus(day, !c.completed);
                    if(upd) onUpdate(upd);
                  }
                }} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Coluna de Insights (Saúde) */}
      <div className="lg:col-span-1 space-y-6">
         <div className="bg-card p-8 rounded-[40px] border border-white/5 shadow-2xl sticky top-24">
            <h3 className="font-mont text-lg font-black text-white text-center mb-6">Equilíbrio das 7 Saúdes</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={chartData}>
                  <PolarGrid stroke="rgba(255,255,255,0.05)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 9 }} />
                  <Radar name="Impacto" dataKey="A" stroke="var(--primary-custom)" fill="var(--primary-custom)" fillOpacity={0.4} />
                  <Tooltip contentStyle={{ backgroundColor: '#121125', borderRadius: '12px' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            {plan.studentInterests && (
              <div className="mt-6 p-4 bg-primary/5 rounded-2xl border border-primary/10">
                <h4 className="text-[10px] font-black text-primary uppercase mb-2">Foco Contextual</h4>
                <p className="text-xs text-slate-300 italic">"Gerado com base no interesse em {plan.studentInterests}"</p>
              </div>
            )}
         </div>
      </div>
    </div>
  );
};

const StatBox = ({ label, value, color = "text-white" }: any) => (
  <div className="bg-card/50 p-6 rounded-[28px] border border-white/5 text-center shadow-xl">
    <p className="text-[10px] text-slate-500 uppercase font-black mb-1">{label}</p>
    <p className={`text-2xl font-black ${color}`}>{value}</p>
  </div>
);

const ChallengeItem = ({ challenge, isMentor, onToggle }: any) => (
  <div className={`p-6 bg-card/60 rounded-3xl border transition-all ${challenge.completed ? 'border-emerald-500/20 opacity-50' : 'border-white/5'}`}>
    <div className="flex items-center justify-between gap-4">
      <div className="flex-1">
        <span className="text-[9px] font-black text-primary uppercase">Dia {challenge.day}</span>
        <h4 className="text-lg font-black text-white leading-tight">{challenge.title}</h4>
      </div>
      <button onClick={() => onToggle(challenge.day)} disabled={isMentor} className="shrink-0">
        {challenge.completed ? <CheckCircle2 className="text-emerald-500" size={32} /> : <Circle className="text-white/10" size={32} />}
      </button>
    </div>
    {!challenge.completed && (
      <div className="mt-4 text-xs text-slate-400 leading-relaxed italic border-l border-white/10 pl-3">
        {challenge.objective}
      </div>
    )}
  </div>
);

export default Dashboard;

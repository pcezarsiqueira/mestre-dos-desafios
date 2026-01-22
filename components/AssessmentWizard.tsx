
import React, { useState, useEffect } from 'react';
import { HealthArea, GeneratePlanPayload, WizardStepId } from '../types';
import { 
  CheckCircle, ChevronRight, ChevronLeft, Loader2, Sparkles, 
  BookOpen, Users, User, Star, Upload, FileText, X, Brain, Heart, Zap, Smile, Briefcase, Coins, Palette
} from 'lucide-react';

interface AssessmentWizardProps {
  onFinish: (payload: GeneratePlanPayload) => void;
  isLoading: boolean;
}

const PROGRESS_MESSAGES = [
  "Iniciando conexão com a Matriz...",
  "Analisando perfil do mentor e material de apoio...",
  "Mapeando dores emocionais e bloqueios ocultos...",
  "Estruturando os 21 dias da Jornada Heróica...",
  "Contextualizando com os hobbies do aluno...",
  "Aplicando gamificação e cálculos de XP...",
  "Quase pronto! Organizando desafios..."
];

const AssessmentWizard: React.FC<AssessmentWizardProps> = ({ onFinish, isLoading }) => {
  const [step, setStep] = useState<WizardStepId>('welcome');
  const [fileName, setFileName] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progressMsgIndex, setProgressMsgIndex] = useState(0);

  const [payload, setPayload] = useState<GeneratePlanPayload>({
    mentor_profile: '',
    transformation_type: '',
    method_status: '',
    has_material: false,
    materials_summary: '',
    student_name: '',
    student_profile: '',
    student_interests: '',
    student_hobbies: '',
    health_areas: [],
    isGroupPlan: false,
    plan_type: 'custom'
  });

  useEffect(() => {
    let interval: any;
    if (isLoading) {
      interval = setInterval(() => {
        setProgressMsgIndex(prev => (prev + 1) % PROGRESS_MESSAGES.length);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleUpdate = (updates: Partial<GeneratePlanPayload>) => {
    setPayload(prev => ({ ...prev, ...updates }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || file.type !== 'application/pdf') return;
    setFileName(file.name);
    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      handleUpdate({ pdf_base64: base64, has_material: true });
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const next = (nextStep: WizardStepId) => {
    setStep(nextStep);
    window.scrollTo(0, 0);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-center p-6 bg-card/40 rounded-[40px] border border-white/10 animate-in fade-in duration-500">
        <div className="relative mb-12">
          <div className="absolute inset-0 bg-primary blur-[80px] opacity-20 animate-pulse"></div>
          <div className="w-24 h-24 border-4 border-primary/20 border-t-primary rounded-full animate-spin relative z-10 flex items-center justify-center">
             <Brain className="text-primary animate-pulse" size={32} />
          </div>
        </div>
        <h2 className="font-mont text-3xl font-black text-white mb-4">Arquitetando sua Jornada</h2>
        <div className="w-64 h-1.5 bg-white/5 rounded-full overflow-hidden mx-auto mb-6">
           <div className="h-full bg-primary transition-all duration-1000 ease-out" style={{ width: `${((progressMsgIndex + 1) / PROGRESS_MESSAGES.length) * 100}%` }} />
        </div>
        <p className="text-primary font-bold uppercase tracking-[0.2em] text-[10px] h-4 animate-bounce">{PROGRESS_MESSAGES[progressMsgIndex]}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-10">
      {step === 'welcome' && (
        <div className="bg-card/80 backdrop-blur-xl p-10 md:p-16 rounded-[40px] border border-white/10 shadow-2xl text-center space-y-8 animate-in fade-in zoom-in-95 duration-500">
           <div className="w-20 h-20 bg-gradient-to-br from-primary to-[#fdd831] rounded-full flex items-center justify-center mx-auto text-dark shadow-xl">
             <Star size={40} className="fill-current" />
           </div>
           <h2 className="font-mont text-4xl font-black text-white leading-tight">Prepare-se para escalar sua mentoria.</h2>
           <button onClick={() => next('qualification')} className="px-10 py-5 bg-gradient-to-br from-primary to-[#fdd831] text-dark font-black text-xl rounded-full shadow-2xl hover:scale-105 transition-all flex items-center gap-3 mx-auto">
             Vamos lá <ChevronRight />
           </button>
        </div>
      )}

      {step === 'qualification' && (
        <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
          <div className="text-center"><h3 className="font-mont text-3xl font-black text-white mb-2">Qual seu modelo de negócio?</h3></div>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { id: 'B', label: 'Mentoria em Grupo', icon: <Users />, isGroup: true },
              { id: 'C', label: 'Mentoria Individual', icon: <User />, isGroup: false }
            ].map(opt => (
              <button key={opt.id} onClick={() => { handleUpdate({ transformation_type: opt.label, isGroupPlan: opt.isGroup }); next('method'); }} className={`p-6 rounded-[24px] border-2 text-left flex items-center gap-4 transition-all ${payload.transformation_type === opt.label ? 'border-primary bg-primary/10 text-white' : 'border-white/10 bg-dark hover:border-white/30 text-slate-400'}`}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-white/5">{opt.icon}</div>
                <span className="font-bold text-lg">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 'method' && (
        <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
          <div className="text-center"><h3 className="font-mont text-3xl font-black text-white mb-2">Sobre o seu Método</h3></div>
          <div className="grid gap-4">
            {['Já possuo um método validado', 'Vou criar do zero agora com a IA'].map(opt => (
              <button key={opt} onClick={() => { handleUpdate({ method_status: opt }); next(payload.isGroupPlan ? 'content-choice' : 'avatar-creation'); }} className={`p-5 rounded-2xl border-2 text-left flex items-center gap-4 transition-all ${payload.method_status === opt ? 'border-primary bg-primary/10 text-white' : 'border-white/10 bg-dark hover:border-white/30 text-slate-400'}`}>
                <span className="font-bold">{opt}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 'content-choice' && (
        <div className="bg-card p-10 rounded-[32px] border border-white/10 space-y-8 animate-in zoom-in-95">
          <h3 className="font-mont text-2xl font-black text-white text-center">Deseja subir seu material base?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button onClick={() => { handleUpdate({ has_material: true }); next('material-upload'); }} className="p-8 bg-dark border border-white/10 rounded-2xl hover:border-primary transition-all group text-center"><FileText size={32} className="mx-auto mb-4" /><p className="font-black text-white">Subir PDF</p></button>
            <button onClick={() => { handleUpdate({ has_material: false }); next('avatar-creation'); }} className="p-8 bg-dark border border-white/10 rounded-2xl hover:border-white/30 transition-all group text-center"><Brain size={32} className="mx-auto mb-4" /><p className="font-black text-white">IA Pura</p></button>
          </div>
        </div>
      )}

      {step === 'avatar-creation' && (
        <div className="space-y-8 animate-in slide-in-from-right-4">
           <div className="text-center"><h3 className="font-mont text-3xl font-black text-white mb-2">{payload.isGroupPlan ? 'Quem é o seu Grupo?' : 'Quem é o seu Aluno?'}</h3></div>
           <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase">Nome/Identidade</label>
                <input className="w-full bg-dark border border-white/10 rounded-xl p-4 text-white outline-none focus:border-primary" placeholder="Ex: Alunos de Emagrecimento" value={payload.student_name} onChange={e => handleUpdate({ student_name: e.target.value })} />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase">Dores Principais</label>
                <textarea className="w-full h-32 bg-dark border border-white/10 rounded-xl p-4 text-white outline-none focus:border-primary" placeholder="Quais os obstáculos hoje?" value={payload.student_profile} onChange={e => handleUpdate({ student_profile: e.target.value })} />
              </div>
           </div>
           <div className="flex justify-between mt-8">
             <button onClick={() => next('method')} className="text-slate-500 font-bold px-6">Voltar</button>
             <button disabled={!payload.student_name} onClick={() => next(payload.isGroupPlan ? 'health-areas' : 'interests')} className="bg-primary text-dark font-black px-10 py-4 rounded-2xl">Próximo <ChevronRight className="inline" /></button>
           </div>
        </div>
      )}

      {step === 'interests' && (
        <div className="space-y-8 animate-in slide-in-from-right-4">
           <div className="text-center"><h3 className="font-mont text-3xl font-black text-white mb-2">Personalização Individual</h3><p className="text-slate-500">Isso torna os desafios únicos (Opcional).</p></div>
           <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase">Áreas de Interesse</label>
                <input className="w-full bg-dark border border-white/10 rounded-xl p-4 text-white outline-none focus:border-primary" placeholder="Ex: Bíblia, Marketing, Xadrez" value={payload.student_interests} onChange={e => handleUpdate({ student_interests: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase">Hobbies/Lazer</label>
                <input className="w-full bg-dark border border-white/10 rounded-xl p-4 text-white outline-none focus:border-primary" placeholder="Ex: Musculação, Games, Leitura" value={payload.student_hobbies} onChange={e => handleUpdate({ student_hobbies: e.target.value })} />
              </div>
           </div>
           <div className="flex justify-between mt-8">
             <button onClick={() => next('avatar-creation')} className="text-slate-500 font-bold px-6">Voltar</button>
             <button onClick={() => next('health-areas')} className="bg-primary text-dark font-black px-10 py-4 rounded-2xl">Continuar <ChevronRight className="inline" /></button>
           </div>
        </div>
      )}

      {step === 'health-areas' && (
        <div className="space-y-8 animate-in slide-in-from-right-4">
           <div className="text-center"><h3 className="font-mont text-3xl font-black text-white mb-2">As 7 Saúdes</h3><p className="text-slate-500">Selecione pelo menos 5 áreas.</p></div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.values(HealthArea).map((area) => (
                <button key={area} onClick={() => {
                  const isSelected = payload.health_areas.includes(area);
                  if (isSelected) handleUpdate({ health_areas: payload.health_areas.filter(a => a !== area) });
                  else if (payload.health_areas.length < 7) handleUpdate({ health_areas: [...payload.health_areas, area] });
                }} className={`p-4 rounded-2xl border-2 flex items-center gap-4 transition-all ${payload.health_areas.includes(area) ? 'border-primary bg-primary/10 text-white' : 'border-white/10 bg-dark text-slate-500'}`}>
                  <span className="font-bold">{area}</span>
                </button>
              ))}
           </div>
           <div className="flex justify-between mt-8">
             <button onClick={() => next(payload.isGroupPlan ? 'avatar-creation' : 'interests')} className="text-slate-500 font-bold px-6">Voltar</button>
             <button disabled={payload.health_areas.length < 5} onClick={() => onFinish(payload)} className="bg-gradient-to-br from-primary to-[#fdd831] text-dark font-black px-12 py-5 rounded-3xl shadow-2xl">Gerar Jornada <Sparkles className="inline ml-2" /></button>
           </div>
        </div>
      )}
    </div>
  );
};

export default AssessmentWizard;

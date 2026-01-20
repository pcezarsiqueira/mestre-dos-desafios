
import React, { useState } from 'react';
import { HealthArea, GeneratePlanPayload, WizardStepId } from '../types';
import { 
  CheckCircle, ChevronRight, ChevronLeft, Loader2, Sparkles, 
  BookOpen, Users, User, Star, Upload, FileText, X, Brain, Heart, Zap, Smile, Briefcase, Coins
} from 'lucide-react';

interface AssessmentWizardProps {
  onFinish: (payload: GeneratePlanPayload) => void;
  isLoading: boolean;
}

const AssessmentWizard: React.FC<AssessmentWizardProps> = ({ onFinish, isLoading }) => {
  const [step, setStep] = useState<WizardStepId>('welcome');
  const [fileName, setFileName] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [payload, setPayload] = useState<GeneratePlanPayload>({
    mentor_profile: '',
    transformation_type: '',
    method_status: '',
    has_material: false,
    materials_summary: '',
    student_name: '',
    student_profile: '',
    student_interests: '',
    health_areas: [],
    isGroupPlan: false,
    plan_type: 'custom'
  });

  const [customTransform, setCustomTransform] = useState('');
  const [customMethod, setCustomMethod] = useState('');

  const handleUpdate = (updates: Partial<GeneratePlanPayload>) => {
    setPayload(prev => ({ ...prev, ...updates }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert("Por favor, selecione um arquivo PDF.");
      return;
    }

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
      <div className="flex flex-col items-center justify-center min-h-[500px] text-center p-6 bg-card/40 rounded-[40px] border border-white/10 animate-pulse">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-primary blur-3xl opacity-30 animate-pulse"></div>
          <Loader2 className="w-20 h-20 text-primary animate-spin relative z-10" />
        </div>
        <h2 className="font-mont text-3xl font-black text-white mb-4">Arquitetando sua Jornada...</h2>
        <p className="text-slate-400 max-w-md mx-auto text-lg">
          Lendo seu material e aplicando o método <span className="text-primary font-bold">METADESAFIOS</span> para {payload.student_name}.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-10">
      
      {/* Boas-vindas */}
      {step === 'welcome' && (
        <div className="bg-card/80 backdrop-blur-xl p-10 md:p-16 rounded-[40px] border border-white/10 shadow-2xl text-center space-y-8 animate-in fade-in zoom-in-95 duration-500">
           <div className="w-20 h-20 bg-gradient-to-br from-primary to-[#fdd831] rounded-full flex items-center justify-center mx-auto text-dark shadow-xl">
             <Star size={40} className="fill-current" />
           </div>
           <div className="space-y-4">
             <h2 className="font-mont text-4xl font-black text-white">Seu interesse é um sinal de que quer avançar.</h2>
             <p className="text-slate-400 text-lg leading-relaxed max-w-2xl mx-auto">
               Isso está em congruência com a busca de seu propósito. Você acaba de receber <span className="text-primary font-bold">10 créditos</span>, o suficiente para criar sua primeira jornada e entender o poder da ferramenta.
             </p>
           </div>
           <div className="p-6 bg-primary/10 rounded-2xl border border-primary/20 text-primary font-bold">
             Antes de continuarmos, precisamos de algumas respostas estratégicas.
           </div>
           <button 
             onClick={() => next('qualification')}
             className="px-10 py-5 bg-gradient-to-br from-primary to-[#fdd831] text-dark font-black text-xl rounded-full shadow-2xl hover:scale-105 transition-all flex items-center gap-3 mx-auto"
           >
             Sim, podemos continuar <ChevronRight />
           </button>
        </div>
      )}

      {/* Qualificação 1 */}
      {step === 'qualification' && (
        <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
          <div className="text-center">
            <h3 className="font-mont text-3xl font-black text-white mb-2">1. Qual sua forma de transformar pessoas?</h3>
            <p className="text-slate-500">Isso define a escala e a linguagem dos desafios.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { id: 'A', label: 'Formação', icon: <BookOpen />, isGroup: true },
              { id: 'B', label: 'Mentoria em Grupo', icon: <Users />, isGroup: true },
              { id: 'C', label: 'Mentoria Individual', icon: <User />, isGroup: false },
              { id: 'D', label: 'Outras', icon: <Sparkles />, isGroup: false }
            ].map(opt => (
              <button
                key={opt.id}
                onClick={() => {
                  handleUpdate({ transformation_type: opt.label, isGroupPlan: opt.isGroup });
                  if (opt.id !== 'D') next('method');
                }}
                className={`p-6 rounded-[24px] border-2 text-left flex items-center gap-4 transition-all ${payload.transformation_type === opt.label ? 'border-primary bg-primary/10 text-white' : 'border-white/10 bg-dark hover:border-white/30 text-slate-400'}`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${payload.transformation_type === opt.label ? 'bg-primary text-dark' : 'bg-white/5'}`}>{opt.icon}</div>
                <span className="font-bold text-lg">{opt.label}</span>
              </button>
            ))}
          </div>
          {payload.transformation_type === 'Outras' && (
            <div className="mt-4 animate-in fade-in">
              <input 
                autoFocus
                className="w-full bg-dark border-2 border-primary/30 rounded-2xl p-4 text-white outline-none focus:border-primary"
                placeholder="Descreva sua forma de transformação..."
                value={customTransform}
                onChange={e => setCustomTransform(e.target.value)}
                onBlur={() => handleUpdate({ transformation_type: customTransform })}
              />
              <button onClick={() => next('method')} className="mt-4 px-8 py-3 bg-primary text-dark font-bold rounded-xl ml-auto block">Continuar</button>
            </div>
          )}
        </div>
      )}

      {/* Qualificação 2 */}
      {step === 'method' && (
        <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
          <div className="text-center">
            <h3 className="font-mont text-3xl font-black text-white mb-2">2. Você já possui um método próprio?</h3>
            <p className="text-slate-500">Vamos alinhar a IA ao seu nível de maturidade atual.</p>
          </div>
          <div className="grid gap-4">
            {[
              { id: 'A', label: 'Claro, já possuo e estou satisfeito(a)' },
              { id: 'B', label: 'Já possuo algo, mas preciso melhorar' },
              { id: 'C', label: 'Ainda não possuo, estou criando agora' },
              { id: 'D', label: 'Outro' }
            ].map(opt => (
              <button
                key={opt.id}
                onClick={() => {
                  handleUpdate({ method_status: opt.label });
                  if (opt.id !== 'D') next(payload.isGroupPlan ? 'content-choice' : 'avatar-creation');
                }}
                className={`p-5 rounded-2xl border-2 text-left flex items-center gap-4 transition-all ${payload.method_status === opt.label ? 'border-primary bg-primary/10 text-white' : 'border-white/10 bg-dark hover:border-white/30 text-slate-400'}`}
              >
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${payload.method_status === opt.label ? 'border-primary bg-primary' : 'border-white/10'}`}>
                  {payload.method_status === opt.label && <CheckCircle size={16} className="text-dark" />}
                </div>
                <span className="font-bold">{opt.label}</span>
              </button>
            ))}
          </div>
          {payload.method_status === 'Outro' && (
            <div className="animate-in fade-in">
              <input 
                autoFocus
                className="w-full bg-dark border-2 border-primary/30 rounded-2xl p-4 text-white outline-none focus:border-primary"
                placeholder="Descreva seu status..."
                value={customMethod}
                onChange={e => setCustomMethod(e.target.value)}
                onBlur={() => handleUpdate({ method_status: customMethod })}
              />
              <button onClick={() => next(payload.isGroupPlan ? 'content-choice' : 'avatar-creation')} className="mt-4 px-8 py-3 bg-primary text-dark font-bold rounded-xl ml-auto block">Continuar</button>
            </div>
          )}
        </div>
      )}

      {/* Escolha de Conteúdo */}
      {step === 'content-choice' && (
        <div className="bg-card p-10 rounded-[32px] border border-white/10 space-y-8 animate-in zoom-in-95">
          <h3 className="font-mont text-2xl font-black text-white text-center">Deseja criar um desafio baseado em seu material (Ebook, PDF)?</h3>
          <p className="text-center text-slate-400">Nossa IA consegue processar seu PDF para manter a essência do seu método.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button 
              onClick={() => { handleUpdate({ has_material: true }); next('material-upload'); }}
              className="p-8 bg-dark border border-white/10 rounded-2xl hover:border-primary transition-all group text-center"
            >
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary group-hover:text-dark transition-all">
                <FileText size={32} />
              </div>
              <p className="font-black text-white text-lg">Sim, subir PDF/Ebook</p>
              <p className="text-xs text-slate-500 mt-2 italic">A IA lerá seu arquivo completo</p>
            </button>
            <button 
              onClick={() => { handleUpdate({ has_material: false }); next('avatar-creation'); }}
              className="p-8 bg-dark border border-white/10 rounded-2xl hover:border-white/30 transition-all group text-center"
            >
               <div className="w-16 h-16 bg-white/5 text-slate-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Brain size={32} />
              </div>
              <p className="font-black text-white text-lg">Não, criar com IA pura</p>
              <p className="text-xs text-slate-500 mt-2 italic">IA usará dados do avatar apenas</p>
            </button>
          </div>
        </div>
      )}

      {/* Upload de Material (Melhorado para PDF) */}
      {step === 'material-upload' && (
        <div className="space-y-6 animate-in slide-in-from-right-4">
           <div className="text-center">
             <h3 className="font-mont text-3xl font-black text-white mb-2">Upload de Inteligência</h3>
             <p className="text-slate-500">Suba seu ebook ou cole o conteúdo principal.</p>
           </div>
           
           <div className="grid grid-cols-1 gap-6">
              {!fileName ? (
                <div className="relative border-2 border-dashed border-white/10 rounded-[32px] p-12 text-center hover:border-primary transition-all group bg-dark/40 cursor-pointer">
                  <input 
                    type="file" 
                    accept="application/pdf"
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-500 group-hover:text-primary transition-colors">
                    <Upload size={32} />
                  </div>
                  <h4 className="text-white font-bold text-lg">Selecionar PDF do Ebook</h4>
                  <p className="text-slate-500 text-sm mt-2">Arraste aqui ou clique para buscar</p>
                </div>
              ) : (
                <div className="bg-primary/5 border border-primary/20 p-8 rounded-[32px] flex items-center justify-between animate-in zoom-in-95">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-primary text-dark rounded-2xl flex items-center justify-center shadow-lg">
                      <FileText size={28} />
                    </div>
                    <div>
                      <p className="font-black text-white">{fileName}</p>
                      <p className="text-xs text-primary font-bold uppercase tracking-widest">Arquivo Pronto para Processar</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => { setFileName(null); handleUpdate({ pdf_base64: undefined }); }}
                    className="p-3 bg-white/5 text-white/40 hover:text-red-400 rounded-xl transition-colors"
                  >
                    <X />
                  </button>
                </div>
              )}

              <div className="relative">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
                <div className="relative flex justify-center text-xs uppercase font-black text-slate-600 tracking-[0.3em]"><span className="bg-dark px-4">Ou Cole Texto Abaixo</span></div>
              </div>

              <textarea 
                className="w-full h-40 bg-dark border border-white/10 rounded-3xl p-6 text-white outline-none focus:border-primary transition-all font-mono text-xs"
                placeholder="Se preferir, cole o resumo ou roteiro aqui..."
                value={payload.materials_summary}
                onChange={e => handleUpdate({ materials_summary: e.target.value })}
              />
           </div>

           <div className="flex justify-between items-center pt-6">
             <button onClick={() => next('content-choice')} className="text-slate-500 font-bold px-6">Voltar</button>
             <button 
               disabled={!payload.pdf_base64 && !payload.materials_summary || isUploading}
               onClick={() => next('avatar-creation')} 
               className="bg-primary text-dark font-black px-12 py-4 rounded-2xl disabled:opacity-50 shadow-xl hover:scale-105 transition-all flex items-center gap-2"
             >
               {isUploading ? <Loader2 className="animate-spin" /> : 'Confirmar Material'} <ChevronRight />
             </button>
           </div>
        </div>
      )}

      {/* Criação de Avatar */}
      {step === 'avatar-creation' && (
        <div className="space-y-8 animate-in slide-in-from-right-4">
           <div className="text-center">
             <h3 className="font-mont text-3xl font-black text-white mb-2">Quem vamos transformar hoje?</h3>
             <p className="text-slate-500">Defina o avatar para que a IA personalize a linguagem baseada no seu material.</p>
           </div>
           
           <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Nome do Avatar</label>
                <input 
                  className="w-full bg-dark border border-white/10 rounded-xl p-4 text-white focus:border-primary outline-none" 
                  placeholder="Ex: Empreendedores Ansiosos" 
                  value={payload.student_name}
                  onChange={e => handleUpdate({ student_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Interesses / Hobbies</label>
                <input 
                  className="w-full bg-dark border border-white/10 rounded-xl p-4 text-white focus:border-primary outline-none" 
                  placeholder="Ex: Tecnologia, Viagens, Meditação" 
                  value={payload.student_interests}
                  onChange={e => handleUpdate({ student_interests: e.target.value })}
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Dores e Problemas Atuais</label>
                <textarea 
                  className="w-full h-32 bg-dark border border-white/10 rounded-xl p-4 text-white focus:border-primary outline-none" 
                  placeholder="O que tira o sono do seu aluno hoje?" 
                  value={payload.student_profile}
                  onChange={e => handleUpdate({ student_profile: e.target.value })}
                />
              </div>
           </div>

           <div className="flex justify-between mt-8">
             <button onClick={() => next(payload.has_material ? 'material-upload' : 'content-choice')} className="text-slate-500 font-bold px-6">Voltar</button>
             <button 
               disabled={!payload.student_name || !payload.student_profile}
               onClick={() => next('health-areas')} 
               className="bg-primary text-dark font-black px-10 py-4 rounded-2xl disabled:opacity-50 shadow-xl"
             >
               Definir Áreas de Foco <ChevronRight className="inline" />
             </button>
           </div>
        </div>
      )}

      {/* Áreas da Saúde */}
      {step === 'health-areas' && (
        <div className="space-y-8 animate-in slide-in-from-right-4">
           <div className="text-center">
             <h3 className="font-mont text-3xl font-black text-white mb-2">Equilíbrio em 360º</h3>
             <p className="text-slate-500">Selecione de 5 a 7 áreas que serão impactadas nesta jornada.</p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.values(HealthArea).map((area) => {
                const isSelected = payload.health_areas.includes(area);
                return (
                  <button
                    key={area}
                    onClick={() => {
                      if (isSelected) handleUpdate({ health_areas: payload.health_areas.filter(a => a !== area) });
                      else if (payload.health_areas.length < 7) handleUpdate({ health_areas: [...payload.health_areas, area] });
                    }}
                    className={`p-4 rounded-2xl border-2 flex items-center gap-4 transition-all ${isSelected ? 'border-primary bg-primary/10 text-white shadow-lg shadow-primary/5' : 'border-white/10 bg-dark text-slate-500'}`}
                  >
                    <div className={`p-2 rounded-lg ${isSelected ? 'bg-primary text-dark' : 'bg-white/5'}`}>{getAreaIcon(area)}</div>
                    <span className="font-bold">{area}</span>
                  </button>
                );
              })}
           </div>

           <div className="flex justify-between mt-8">
             <button onClick={() => next('avatar-creation')} className="text-slate-500 font-bold px-6">Voltar</button>
             <button 
               disabled={payload.health_areas.length < 5}
               onClick={() => onFinish(payload)} 
               className="bg-gradient-to-br from-primary to-[#fdd831] text-dark font-black px-12 py-5 rounded-3xl shadow-2xl hover:scale-105 transition-all"
             >
               Gerar Desafio METADESAFIOS <Sparkles className="inline ml-2" />
             </button>
           </div>
        </div>
      )}

    </div>
  );
};

const getAreaIcon = (area: HealthArea) => {
  switch(area) {
    case HealthArea.SPIRITUAL: return <Zap size={18} />;
    case HealthArea.MENTAL: return <Brain size={18} />;
    case HealthArea.PHYSICAL: return <Heart size={18} />;
    case HealthArea.EMOTIONAL: return <Smile size={18} />;
    case HealthArea.SOCIAL: return <Users size={18} />;
    case HealthArea.PROFESSIONAL: return <Briefcase size={18} />;
    case HealthArea.FINANCIAL: return <Coins size={18} />;
    default: return <Heart size={18} />;
  }
};

export default AssessmentWizard;

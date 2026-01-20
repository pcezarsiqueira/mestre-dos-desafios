
import React, { useState } from 'react';
import { HealthArea, GeneratePlanPayload } from '../types';
import { Upload, X, CheckCircle, Loader2 } from 'lucide-react';
import * as GeminiService from '../services/geminiService';

interface AssessmentData {
  niche: string;
  painPoints: string;
  goals: string;
  studentName: string;
  selectedAreas: HealthArea[];
  contextFilesContent: string[];
}

interface AssessmentFormProps {
  onPlanGenerated: (data: any) => void;
}

const AssessmentForm: React.FC<AssessmentFormProps> = ({ onPlanGenerated }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<AssessmentData>({
    niche: '',
    painPoints: '',
    goals: '',
    studentName: '',
    selectedAreas: [],
    contextFilesContent: []
  });

  const toggleArea = (area: HealthArea) => {
    setFormData(prev => {
      const exists = prev.selectedAreas.includes(area);
      if (exists) {
        return { ...prev, selectedAreas: prev.selectedAreas.filter(a => a !== area) };
      }
      if (prev.selectedAreas.length >= 7) return prev; 
      return { ...prev, selectedAreas: [...prev.selectedAreas, area] };
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Simple mock: read text file, or just append filename as "context" for demo purposes
      // since PDF parsing in browser is heavy for this snippet.
      const text = await file.text();
      setFormData(prev => ({
        ...prev,
        contextFilesContent: [...prev.contextFilesContent, `Arquivo: ${file.name}\nConteúdo: ${text.substring(0, 1000)}...`]
      }));
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Fix: Added missing properties to match GeneratePlanPayload interface
      const payload: GeneratePlanPayload = {
        mentor_profile: `Nicho: ${formData.niche}`,
        transformation_type: 'Mentoria Individual', // Added missing property
        method_status: 'Ainda não possuo, estou criando agora', // Added missing property
        has_material: formData.contextFilesContent.length > 0, // Added missing property
        student_name: formData.studentName,
        student_profile: `Dores: ${formData.painPoints}. Objetivos: ${formData.goals}`,
        student_interests: 'N/A',
        plan_type: 'timidez',
        health_areas: formData.selectedAreas,
        materials_summary: formData.contextFilesContent.join('\n\n'),
        isGroupPlan: false
      };

      const generatedChallenges = await GeminiService.generateChallengePlan(payload);
      onPlanGenerated({
        ...formData,
        challenges: generatedChallenges.map(c => ({ ...c, completed: false }))
      });
    } catch (error) {
      alert("Erro ao gerar desafios. Verifique sua API Key ou tente novamente.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center animate-in fade-in duration-500">
        <Loader2 className="w-16 h-16 text-primary animate-spin mb-4" />
        <h2 className="text-2xl font-bold text-white">A Inteligência Artificial está criando seu plano...</h2>
        <p className="text-slate-400 mt-2">Analisando dores, definindo estratégias e estruturando os 21 dias.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto bg-card p-8 rounded-xl border border-slate-700 shadow-2xl">
      {/* Step Indicators */}
      <div className="flex justify-between mb-8">
        {[1, 2, 3].map(i => (
          <div key={i} className={`flex items-center ${i <= step ? 'text-primary' : 'text-slate-500'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${i <= step ? 'border-primary bg-primary/10' : 'border-slate-600'}`}>
              {i}
            </div>
            {i < 3 && <div className={`w-24 h-0.5 mx-2 ${i < step ? 'bg-primary' : 'bg-slate-700'}`} />}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white">Definição do Avatar</h2>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Nome ou Perfil do Aluno</label>
            <input 
              type="text" 
              className="w-full bg-dark border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-primary outline-none"
              placeholder="Ex: Empreendedores ansiosos"
              value={formData.studentName}
              onChange={e => setFormData({...formData, studentName: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Nicho de Atuação</label>
            <input 
              type="text" 
              className="w-full bg-dark border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-primary outline-none"
              placeholder="Ex: Alta Performance e Bem-estar"
              value={formData.niche}
              onChange={e => setFormData({...formData, niche: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Dores Principais</label>
              <textarea 
                className="w-full bg-dark border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-primary outline-none h-32"
                placeholder="Ex: Falta de tempo, estresse elevado..."
                value={formData.painPoints}
                onChange={e => setFormData({...formData, painPoints: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Objetivo Final</label>
              <textarea 
                className="w-full bg-dark border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-primary outline-none h-32"
                placeholder="Ex: Reequilibrar vida pessoal e profissional..."
                value={formData.goals}
                onChange={e => setFormData({...formData, goals: e.target.value})}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button 
              onClick={() => setStep(2)}
              disabled={!formData.niche || !formData.goals}
              className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              Próximo
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white">Escolha as Áreas (5 a 7)</h2>
          <p className="text-slate-400">Selecione quais das 7 saúdes farão parte deste desafio.</p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.values(HealthArea).map((area) => (
              <button
                key={area}
                onClick={() => toggleArea(area)}
                className={`p-4 rounded-xl border-2 transition-all flex items-center justify-between ${
                  formData.selectedAreas.includes(area) 
                    ? 'border-primary bg-primary/20 text-white' 
                    : 'border-slate-700 bg-dark text-slate-400 hover:border-slate-500'
                }`}
              >
                <span>{area}</span>
                {formData.selectedAreas.includes(area) && <CheckCircle size={16} />}
              </button>
            ))}
          </div>

          <div className="flex justify-between mt-6">
            <button 
              onClick={() => setStep(1)}
              className="text-slate-400 hover:text-white"
            >
              Voltar
            </button>
            <button 
              onClick={() => setStep(3)}
              disabled={formData.selectedAreas.length < 5}
              className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              Próximo ({formData.selectedAreas.length} selecionadas)
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white">Materiais de Apoio & Contexto</h2>
          <p className="text-slate-400">Faça upload de materiais (TXT, MD) para a IA usar como base de conhecimento.</p>
          
          <div className="border-2 border-dashed border-slate-600 rounded-xl p-8 text-center hover:border-primary transition-colors cursor-pointer bg-dark/50 relative">
            <input 
              type="file" 
              onChange={handleFileChange} 
              className="absolute inset-0 opacity-0 cursor-pointer"
              accept=".txt,.md,.json"
            />
            <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-white font-medium">Clique para selecionar arquivos</p>
            <p className="text-sm text-slate-500">Suporta .txt, .md (Parsing simples para demo)</p>
          </div>

          <div className="space-y-2">
             {formData.contextFilesContent.map((fileContent, idx) => (
               <div key={idx} className="flex items-center justify-between bg-slate-800 p-3 rounded-lg border border-slate-700">
                 <span className="text-sm text-slate-300 truncate w-3/4">{fileContent.split('\n')[0]}</span>
                 <button onClick={() => {
                   const newFiles = [...formData.contextFilesContent];
                   newFiles.splice(idx, 1);
                   setFormData({...formData, contextFilesContent: newFiles});
                 }}>
                   <X size={16} className="text-red-400 hover:text-red-300" />
                 </button>
               </div>
             ))}
          </div>

          <div className="flex justify-between mt-6">
            <button 
              onClick={() => setStep(2)}
              className="text-slate-400 hover:text-white"
            >
              Voltar
            </button>
            <button 
              onClick={handleSubmit}
              className="bg-secondary hover:bg-secondary/90 text-white px-8 py-3 rounded-lg font-bold shadow-lg shadow-secondary/20 transition-all transform hover:scale-105"
            >
              Gerar Desafio com IA
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssessmentForm;

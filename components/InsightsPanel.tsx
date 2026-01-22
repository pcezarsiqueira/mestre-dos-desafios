
import React, { useState } from 'react';
import { Brain, TrendingUp, Loader2, Sparkles, ArrowLeft } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { ChallengePlan } from '../types';

interface InsightsPanelProps {
  plan: ChallengePlan;
  onBack: () => void;
}

const InsightsPanel: React.FC<InsightsPanelProps> = ({ plan, onBack }) => {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<string | null>(null);

  const generateInsights = async () => {
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const allComments = plan.challenges
        .flatMap(c => c.comments || [])
        .map(c => `${c.studentName}: ${c.text}`)
        .join("\n");

      if (!allComments) {
        setInsights("Ainda não há comentários suficientes dos alunos para gerar insights precisos. Incentive a participação e check-ins!");
        setLoading(false);
        return;
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Analise o feedback dos alunos para a mentoria "${plan.planTitle}". Sugira 3 ideias de upsell ou próximos passos baseados nas dores relatadas: \n\n ${allComments}`
      });

      setInsights(response.text || "Sem insights disponíveis.");
    } catch (error) {
      setInsights("Erro ao conectar com a IA estrategista.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card p-10 rounded-[40px] border border-white/5 shadow-2xl space-y-6">
      
      <div className="flex items-center justify-between mb-4">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors font-bold text-sm">
          <ArrowLeft size={18} /> Voltar ao Dashboard
        </button>
      </div>

      <div className="flex items-center justify-between border-b border-white/5 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-pink-500/10 rounded-2xl flex items-center justify-center text-pink-500">
             <Brain size={24} />
          </div>
          <div>
            <h3 className="text-xl font-black text-white">IA Estrategista de Vendas</h3>
            <p className="text-xs text-slate-500">Mapeamento de oportunidades e Upsell</p>
          </div>
        </div>
        {!insights && !loading && (
          <button 
            onClick={generateInsights}
            className="bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold px-6 py-3 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-pink-600/20"
          >
            <Sparkles size={16} /> Analisar Performance
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center py-16 text-slate-400">
          <Loader2 className="w-12 h-12 animate-spin mb-4 text-pink-500" />
          <p className="font-bold">Cruzando dados de engajamento e feedback...</p>
        </div>
      ) : insights ? (
        <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-500">
           <div className="bg-dark/40 p-8 rounded-3xl border border-pink-500/10 text-slate-300 leading-relaxed whitespace-pre-wrap text-sm italic">
             {insights}
           </div>
           <button onClick={() => setInsights(null)} className="text-slate-500 hover:text-white text-xs font-bold underline">Refazer análise estratégica</button>
        </div>
      ) : (
        <div className="text-center py-12">
          <TrendingUp className="w-16 h-16 text-white/5 mx-auto mb-4" />
          <p className="text-slate-500 text-sm max-w-sm mx-auto font-bold">
            Os insights de negócios aparecerão aqui após os primeiros comentários e atividades dos seus alunos.
          </p>
        </div>
      )}
    </div>
  );
};

export default InsightsPanel;

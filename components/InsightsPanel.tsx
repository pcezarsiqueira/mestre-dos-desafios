
import React, { useState } from 'react';
import { Brain, Lightbulb, TrendingUp, Loader2, Sparkles } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { ChallengePlan } from '../types';

interface InsightsPanelProps {
  plan: ChallengePlan;
}

const InsightsPanel: React.FC<InsightsPanelProps> = ({ plan }) => {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<string | null>(null);

  const generateInsights = async () => {
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Coletar todos os comentários
      const allComments = plan.challenges
        .flatMap(c => c.comments || [])
        .map(c => `${c.studentName}: ${c.text}`)
        .join("\n");

      if (!allComments) {
        setInsights("Ainda não há comentários suficientes dos alunos para gerar insights precisos. Incentive a participação!");
        setLoading(false);
        return;
      }

      const prompt = `
        Aja como um estrategista de negócios para mentores.
        Analise o feedback abaixo de uma turma de mentoria focada em: ${plan.planTitle}.
        Com base nas dores, dificuldades e vitórias relatadas, sugira 3 ideias de novos infoprodutos ou mentorias de acompanhamento (Upsell).
        Seja criativo e focado em lucro e transformação.

        FEEDBACK DOS ALUNOS:
        ${allComments}
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt
      });

      setInsights(response.text || "Não foi possível gerar insights agora.");
    } catch (error) {
      console.error(error);
      setInsights("Erro ao conectar com a IA estrategista.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card p-8 rounded-2xl border border-slate-700 shadow-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Brain className="text-pink-500" />
          <h3 className="text-xl font-bold text-white">IA Estrategista de Vendas</h3>
        </div>
        {!insights && !loading && (
          <button 
            onClick={generateInsights}
            className="bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-2 transition-all"
          >
            <Sparkles size={14} /> Analisar Feedback dos Alunos
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center py-12 text-slate-400">
          <Loader2 className="w-10 h-10 animate-spin mb-4 text-pink-500" />
          <p>Analisando padrões comportamentais e dores ocultas...</p>
        </div>
      ) : insights ? (
        <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-500">
           <div className="bg-dark/50 p-6 rounded-xl border border-pink-500/20 text-slate-300 leading-relaxed whitespace-pre-wrap text-sm">
             {insights}
           </div>
           <button 
            onClick={() => setInsights(null)}
            className="text-slate-500 hover:text-white text-xs underline"
           >
             Gerar nova análise
           </button>
        </div>
      ) : (
        <div className="text-center py-8">
          <TrendingUp className="w-12 h-12 text-slate-700 mx-auto mb-3" />
          <p className="text-slate-500 text-sm max-w-sm mx-auto">
            Assim que seus alunos começarem a comentar nos desafios, usaremos IA para sugerir seus próximos passos como expert.
          </p>
        </div>
      )}
    </div>
  );
};

export default InsightsPanel;


import { GoogleGenAI, Type } from "@google/genai";
import { GeneratePlanPayload, HealthArea, PlanResponse } from "../types";
import { CONFIG } from "./config";

export const generateChallengePlan = async (payload: GeneratePlanPayload): Promise<PlanResponse> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const modelName = CONFIG.GEMINI.MODEL_MAIN; 

  const areasString = payload.health_areas.join(", ");
  const contextualInfo = payload.isGroupPlan 
    ? "Esta é uma jornada para GRUPO." 
    : `Aluno Individual: ${payload.student_name}. Interesses: ${payload.student_interests || 'Não informados'}. Hobbies: ${payload.student_hobbies || 'Não informados'}.`;

  const promptText = `
    ESTRATEGISTA "METADESAFIOS" - MODO PERSONALIZAÇÃO EXTREMA.
    Você deve criar 21 desafios para o Mentor (${payload.mentor_profile}).
    
    CONTEXTO DO ALUNO/GRUPO:
    ${contextualInfo}
    Perfil e Dores: ${payload.student_profile}

    REGRAS DE CONTEXTO:
    - Se o aluno tiver interesses específicos (ex: Bíblia, Esportes, Tecnologia), os desafios DEVEM usar esse vocabulário e contexto.
    - Se ele gosta de Bíblia/Evangelho, cite passagens ou princípios aplicados à saúde física/mental.
    - Se gosta de Tecnologia, use analogias de 'sistema', 'upgrade' e 'hardware'.

    FONTE DE CONHECIMENTO (ESTRATÉGIA DO MENTOR):
    ${payload.materials_summary ? `Use o seguinte material base fornecido pelo mentor: \n ${payload.materials_summary}` : "Crie baseado nas melhores práticas do nicho, focando em micro-vitórias."}

    ESTRUTURA DA JORNADA:
    - Dias 1-7 (ATO 1): Clareza, Diagnóstico e Vitórias rápidas.
    - Dias 8-14 (ATO 2): Confronto, Quebra de padrões e Incomodidade.
    - Dias 15-21 (ATO 3): Expansão, Transformação e Dia 21 é o FIRE TRIAL (Ritual de passagem).
    
    Regras Técnicas: 
    - Áreas de Saúde Focais: (${areasString}).
    - Gamificação: XP (100-500 por desafio).
    - Saída: JSON estrito.
    ${payload.pdf_base64 ? "IMPORTANTE: Siga rigorosamente o método contido no arquivo PDF anexado." : ""}
  `;

  const healthAreaProperties: Record<string, any> = {};
  Object.values(HealthArea).forEach(area => {
    healthAreaProperties[area] = { type: Type.INTEGER };
  });

  const parts: any[] = [{ text: promptText }];
  
  if (payload.pdf_base64) {
    parts.push({
      inlineData: {
        data: payload.pdf_base64,
        mimeType: 'application/pdf'
      }
    });
  }

  const response = await ai.models.generateContent({
    model: modelName,
    contents: { parts },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          plan_title: { type: Type.STRING },
          description: { type: Type.STRING },
          transformation_mapping: {
            type: Type.OBJECT,
            properties: {
              painPoints: {
                type: Type.OBJECT,
                properties: {
                  emotional: { type: Type.STRING },
                  physical: { type: Type.STRING },
                  spiritual: { type: Type.STRING },
                  social: { type: Type.STRING }
                }
              },
              inferredCoreBeliefs: { type: Type.STRING },
              strategySummary: { type: Type.STRING }
            }
          },
          challenges: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                day: { type: Type.INTEGER },
                title: { type: Type.STRING },
                objective: { type: Type.STRING },
                instructions: { type: Type.ARRAY, items: { type: Type.STRING } },
                estimated_time: { type: Type.STRING },
                style_notes: { type: Type.STRING },
                health_area_weights: { type: Type.OBJECT, properties: healthAreaProperties },
                xp: { type: Type.INTEGER },
                isFireTrial: { type: Type.BOOLEAN }
              },
              required: ["day", "title", "objective", "instructions", "estimated_time", "health_area_weights", "xp", "isFireTrial"]
            }
          }
        },
        required: ["plan_title", "description", "challenges"]
      }
    }
  });

  if (!response.text) throw new Error("IA sem resposta.");
  return JSON.parse(response.text.trim()) as PlanResponse;
};

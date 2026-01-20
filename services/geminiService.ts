
import { GoogleGenAI, Type } from "@google/genai";
import { GeneratePlanPayload, Challenge, HealthArea, PlanResponse } from "../types";
import { CONFIG } from "./config";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateChallengePlan = async (payload: GeneratePlanPayload): Promise<PlanResponse> => {
  // Alterado para Flash para velocidade máxima (latência reduzida em até 70%)
  const modelName = CONFIG.GEMINI.MODEL_MAIN; 

  const areasString = payload.health_areas.join(", ");

  const promptText = `
    ESTRATEGISTA "METADESAFIOS" - GERAÇÃO VELOZ.
    Crie um diagnóstico 360º e 21 desafios baseados no Nicho (${payload.mentor_profile}) e Avatar (${payload.student_profile}).

    # DIAGNÓSTICO AUTOMÁTICO
    Infira dores Emocionais, Físicas, Espirituais e Sociais. 
    ${payload.pdf_base64 ? "Baseie-se estritamente no PDF anexo para o tom de voz e método." : "Crie um método original e disruptivo."}

    # JORNADA HERÓICA (21 DIAS)
    - DIAS 1-7: Clareza e rápida dopamina.
    - DIAS 8-14: Quebra de padrões e sombras.
    - DIAS 15-21: Expansão e Fire Trial (dia 21).

    # REGRAS TÉCNICAS
    - Áreas: ${areasString}.
    - Saída: JSON ESTRITO. Sem preâmbulos.
    - Linguagem: Direta, motivadora e prática.
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
      // Otimização: Não usamos thinkingBudget no Flash para reduzir latência de primeira resposta
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
                },
                required: ["emotional", "physical", "spiritual", "social"]
              },
              inferredCoreBeliefs: { type: Type.STRING },
              strategySummary: { type: Type.STRING }
            },
            required: ["painPoints", "inferredCoreBeliefs", "strategySummary"]
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
        required: ["plan_title", "description", "transformation_mapping", "challenges"]
      }
    }
  });

  if (!response.text) throw new Error("A IA não retornou conteúdo.");
  return JSON.parse(response.text.trim()) as PlanResponse;
};


import { GoogleGenAI, Type } from "@google/genai";
import { GeneratePlanPayload, Challenge, HealthArea, PlanResponse } from "../types";
import { CONFIG } from "./config";

export const generateChallengePlan = async (payload: GeneratePlanPayload): Promise<PlanResponse> => {
  // Initialize AI inside the function to ensure it uses the latest configuration
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Garantindo o uso do modelo FLASH para latência mínima
  const modelName = CONFIG.GEMINI.MODEL_MAIN; 

  const areasString = payload.health_areas.join(", ");

  const promptText = `
    ESTRATEGISTA "METADESAFIOS" - MODO VELOZ.
    Crie 21 desafios para Mentor (${payload.mentor_profile}) e Aluno (${payload.student_profile}).
    
    ESTRUTURA:
    - Dias 1-7: Vitórias rápidas.
    - Dias 8-14: Quebra de padrões.
    - Dias 15-21: Expansão (Dia 21 é FIRE TRIAL).
    
    Regras: Áreas (${areasString}), XP (100-500), JSON estrito.
    ${payload.pdf_base64 ? "Siga o método do PDF anexo." : ""}
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
      // Desabilitamos o thinkingBudget para o Flash para evitar latência de raciocínio em tarefas estruturadas
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

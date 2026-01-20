
import { GoogleGenAI, Type } from "@google/genai";
import { GeneratePlanPayload, Challenge, HealthArea } from "../types";
import { CONFIG } from "./config";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateChallengePlan = async (payload: GeneratePlanPayload): Promise<Omit<Challenge, 'completed'>[]> => {
  const modelName = CONFIG.GEMINI.MODEL_PRO; 

  const areasString = payload.health_areas.join(", ");

  const promptText = `
    ATUE COMO UM ESTRATEGISTA DO MÉTODO "METADESAFIOS".
    Sua missão é criar um desafio de 21 dias baseado na Jornada do Herói e no acrônimo METADESAFIOS.

    # CONTEXTO DO MENTOR
    - Tipo de Mentoria: ${payload.transformation_type}
    - Status do Método: ${payload.method_status}
    - Perfil: ${payload.mentor_profile}

    # CONTEXTO DO ALUNO / AVATAR
    - Nome/Perfil: ${payload.student_name}
    - Dores/Interesses: ${payload.student_profile} | ${payload.student_interests}

    # BASE DE CONHECIMENTO
    ${payload.pdf_base64 ? "Analise o arquivo PDF anexo para extrair a metodologia e conteúdo." : (payload.materials_summary || "Criar baseado no avatar, pois não foi fornecido material prévio.")}

    # METODOLOGIA METADESAFIOS
    Crie uma sequência lógica de 21 dias com progressão de dificuldade.
    
    # ESTRUTURA DE 21 DIAS (3 ATOS)
    ATO 1 (Dias 1-7): Diagnóstico e vitórias rápidas.
    ATO 2 (Dias 8-13): Superação de travas e novos hábitos.
    ATO 3 (Dias 14-21): Consolidação e Prova de Fogo final (Fire Trial).

    # ÁREAS DE FOCO SELECIONADAS
    ${areasString}

    Retorne um JSON array com 21 objetos.
  `;

  const healthAreaProperties: Record<string, any> = {};
  Object.values(HealthArea).forEach(area => {
    healthAreaProperties[area] = { type: Type.INTEGER };
  });

  // Construção de partes multimodais
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
    }
  });

  if (!response.text) throw new Error("A IA não retornou conteúdo.");
  return JSON.parse(response.text.trim()) as Omit<Challenge, 'completed'>[];
};

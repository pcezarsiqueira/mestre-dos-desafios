
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { GeneratePlanPayload, Challenge, HealthArea } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateChallengePlan = async (payload: GeneratePlanPayload): Promise<Omit<Challenge, 'completed'>[]> => {
  const modelName = 'gemini-3-pro-preview'; 

  const areasString = payload.health_areas.join(", ");

  const prompt = `
    ATUE COMO UM ESTRATEGISTA DO MÉTODO "METADESAFIOS".
    Sua missão é criar um desafio de 21 dias baseado na Jornada do Herói e no acrônimo METADESAFIOS.

    # CONTEXTO DO MENTOR
    - Tipo de Mentoria: ${payload.transformation_type}
    - Status do Método: ${payload.method_status}
    - Perfil: ${payload.mentor_profile}

    # CONTEXTO DO ALUNO / AVATAR
    - Nome/Perfil: ${payload.student_name}
    - Dores/Interesses: ${payload.student_profile} | ${payload.student_interests}

    # BASE DE CONHECIMENTO (MATERIAL DO EXPERT)
    ${payload.materials_summary || "Criar baseado no avatar, pois não foi fornecido material prévio."}

    # METODOLOGIA METADESAFIOS
    M — Metas claras (SMART)
    E — Evolução, não perfeição
    T — Tempo curto, ações específicas
    A — Acompanhamento e ajuste
    D — Divisão em etapas
    E — Envolvimento emocional
    S — Sequência lógica (Jornada do Herói)
    A — Aplicação prática imediata
    F — Feedback constante
    I — Inspiração
    O — Objetivos alcançáveis (primeiras vitórias)
    S — Sustentabilidade (transformar em rotina)

    # ESTRUTURA DE 21 DIAS (3 ATOS)
    ATO 1 (Dias 1-7 - Mundo Comum): Foco em diagnóstico, crenças e primeira vitória rápida.
    ATO 2 (Dias 8-13 - Chamado/Conflito): Enfrentar travas, aumentar exposição e técnica.
    ATO 3 (Dias 14-21 - Transformação): Consolidação, prova pública e nova identidade.

    # PROVAS DE FOGO (OBRIGATÓRIO)
    - Dia 7: Prova de Fogo 1 (Check-point emocional/prático)
    - Dia 13: Prova de Fogo 2 (Desafio de coragem/exposição)
    - Dia 21: Prova de Fogo 3 (Entrega real final)

    # REGRAS ADICIONAIS
    - Áreas de saúde a impactar: ${areasString}
    - XP: 100 a 500 por dia.

    Retorne um JSON array com 21 objetos.
  `;

  const healthAreaProperties: Record<string, Schema> = {};
  Object.values(HealthArea).forEach(area => {
    healthAreaProperties[area] = { type: Type.INTEGER };
  });

  const response = await ai.models.generateContent({
    model: modelName,
    contents: prompt,
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
            isFireTrial: { type: Type.BOOLEAN, description: "Verdadeiro se for Dia 7, 13 ou 21" }
          },
          required: ["day", "title", "objective", "instructions", "estimated_time", "health_area_weights", "xp", "isFireTrial"]
        }
      }
    }
  });

  if (!response.text) throw new Error("IA falhou.");
  return JSON.parse(response.text) as Omit<Challenge, 'completed'>[];
};

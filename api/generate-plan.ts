
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { GeneratePlanPayload, HealthArea } from "../types";

// Always initialize GoogleGenAI with a named parameter using process.env.API_KEY directly
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const POST = async (request: Request) => {
  try {
    const payload: GeneratePlanPayload = await request.json();

    const modelName = 'gemini-3-pro-preview'; 

    const areasString = payload.health_areas.join(", ");

    const prompt = `
      ATUE COMO UM "MESTRE DOS DESAFIOS" E MENTOR DE ALTA PERFORMANCE.

      Use estas informações:

      Mentor: ${payload.mentor_profile}
      Aluno: ${payload.student_profile}
      Interesses do aluno: ${payload.student_interests}
      Tipo de plano: ${payload.plan_type}
      Áreas da vida escolhidas: ${areasString}
      Resumo dos materiais: ${payload.materials_summary}

      # DIRETRIZES DE ESTILO E LINGUAGEM
      1. **Estilo Personalizado**: Use metáforas e analogias baseadas no PERFIL DO MENTOR e INTERESSES DO ALUNO fornecidos acima.
      2. **Clareza Radical**: As instruções devem ser diretas. O aluno deve saber EXATAMENTE o que fazer.
      3. **Tipo de Plano**: Se for "timidez", foque em coragem social. Se for "neurobicas", foque em plasticidade cerebral.

      # REGRAS ESTRUTURAIS
      1. Gere EXATAMENTE 21 desafios.
      2. **Distribuição de Peso**: Distribua o impacto nas áreas selecionadas (${areasString}). Use pesos 0-3.
      3. **XP (Gamificação)**: Atribua XP (Experience Points) de 100 a 500 para cada desafio.
      4. **Tempo**: Estime o tempo necessário (ex: "15 min", "1 hora").

      # FORMATO DE SAÍDA (JSON ESTRITO)
      Responda APENAS com o objeto JSON abaixo, sem markdown, sem texto antes ou depois.
    `;

    // Prepare properties for health_area_weights schema
    const healthAreaProperties: Record<string, Schema> = {};
    Object.values(HealthArea).forEach(area => {
      healthAreaProperties[area] = { type: Type.INTEGER };
    });

    // Define strict schema for the complex object structure
    const challengeSchema: Schema = {
      type: Type.OBJECT,
      properties: {
        day: { type: Type.INTEGER, description: "Dia 1 a 21" },
        title: { type: Type.STRING, description: "Título criativo e temático" },
        objective: { type: Type.STRING, description: "O objetivo de transformação deste dia" },
        instructions: { 
          type: Type.ARRAY, 
          items: { type: Type.STRING },
          description: "Passo a passo prático do que fazer"
        },
        estimated_time: { type: Type.STRING, description: "Ex: '20 min'" },
        style_notes: { type: Type.STRING, description: "Breve nota sobre o estilo/metáfora usada" },
        health_area_weights: { 
          type: Type.OBJECT,
          description: "Pesos (0-3) para cada área impactada. Chaves devem ser exatamente os nomes das áreas.",
          properties: healthAreaProperties
        },
        xp: { type: Type.INTEGER, description: "Pontos de experiência (100-500)" }
      },
      required: ["day", "title", "objective", "instructions", "estimated_time", "health_area_weights", "xp"]
    };

    // Use ai.models.generateContent to query GenAI with model and prompt
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            plan_title: { type: Type.STRING },
            description: { type: Type.STRING },
            plan_type: { type: Type.STRING, enum: ["timidez", "neurobicas", "custom"] },
            health_areas: { type: Type.ARRAY, items: { type: Type.STRING } },
            challenges: {
              type: Type.ARRAY,
              items: challengeSchema
            }
          },
          required: ["plan_title", "description", "plan_type", "challenges"]
        }
      }
    });

    // Directly access the .text property from GenerateContentResponse
    if (!response.text) {
      return new Response(JSON.stringify({ error: "Falha na geração da IA" }), { status: 500 });
    }

    const plan = JSON.parse(response.text.trim());
    return new Response(JSON.stringify(plan), { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error("API Error:", error);
    return new Response(JSON.stringify({ error: "Erro interno do servidor" }), { status: 500 });
  }
};

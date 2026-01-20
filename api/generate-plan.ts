
import { GoogleGenAI, Type } from "@google/genai";
import { GeneratePlanPayload, HealthArea } from "../types";

export const POST = async (request: Request) => {
  try {
    const payload: GeneratePlanPayload = await request.json();

    // Initialize AI inside the handler to ensure it uses current environment variables
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    // MODELO FLASH: 3-4x mais rápido que o Pro para geração de listas longas
    const modelName = 'gemini-3-flash-preview'; 

    const areasString = payload.health_areas.join(", ");

    const prompt = `
      GERADOR DE JORNADA 21 DIAS - MESTRE DOS DESAFIOS.
      Contexto: Mentor (${payload.mentor_profile}), Aluno (${payload.student_profile}).
      Foco: ${payload.plan_type} em ${areasString}.
      Material Base: ${payload.materials_summary || 'Nenhum'}.

      REGRAS:
      1. Gere EXATAMENTE 21 desafios práticos e gamificados.
      2. Use metáforas do nicho do mentor.
      3. Atribua XP (100-500) e pesos (0-3) nas áreas: ${areasString}.
      4. Saída: APENAS JSON.
    `;

    const healthAreaProperties: Record<string, any> = {};
    Object.values(HealthArea).forEach(area => {
      healthAreaProperties[area] = { type: Type.INTEGER };
    });

    const challengeSchema: any = {
      type: Type.OBJECT,
      properties: {
        day: { type: Type.INTEGER },
        title: { type: Type.STRING },
        objective: { type: Type.STRING },
        instructions: { type: Type.ARRAY, items: { type: Type.STRING } },
        estimated_time: { type: Type.STRING },
        style_notes: { type: Type.STRING },
        health_area_weights: { 
          type: Type.OBJECT,
          properties: healthAreaProperties
        },
        xp: { type: Type.INTEGER },
        isFireTrial: { type: Type.BOOLEAN }
      },
      required: ["day", "title", "objective", "instructions", "estimated_time", "health_area_weights", "xp", "isFireTrial"]
    };

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
            challenges: { type: Type.ARRAY, items: challengeSchema }
          },
          required: ["plan_title", "description", "challenges"]
        }
      }
    });

    if (!response.text) {
      return new Response(JSON.stringify({ error: "Falha na geração" }), { status: 500 });
    }

    return new Response(response.text.trim(), { 
      status: 200, 
      headers: { 'Content-Type': 'application/json' } 
    });

  } catch (error) {
    console.error("API Error:", error);
    return new Response(JSON.stringify({ error: "Erro interno" }), { status: 500 });
  }
};

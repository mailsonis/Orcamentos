import { GoogleGenAI, Type } from "@google/genai";
import { BudgetItem } from "../types";

export const analyzeBudgetPhoto = async (base64Image: string): Promise<BudgetItem[]> => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    throw new Error("Chave de API (API_KEY) não encontrada. Certifique-se de que a variável de ambiente está configurada corretamente no painel da Vercel.");
  }

  const ai = new GoogleGenAI({ apiKey });
  const modelName = 'gemini-3-flash-preview';
  
  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image,
            },
          },
          {
            text: "Extraia todos os itens deste orçamento ou lista de produtos. Retorne uma lista de objetos com 'quantity' (número), 'description' (string) e 'unitPrice' (número). Se a quantidade não estiver clara, use 1. Se o preço unitário não estiver claro, use 0. Mantenha a ordem original da imagem.",
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              quantity: { type: Type.NUMBER, description: "A quantidade do item" },
              description: { type: Type.STRING, description: "O nome ou descrição do produto" },
              unitPrice: { type: Type.NUMBER, description: "O preço unitário se disponível" },
            },
            required: ["quantity", "description", "unitPrice"],
          },
        },
      },
    });

    const text = response.text;
    if (!text) {
      console.warn("Gemini retornou uma resposta vazia.");
      return [];
    }

    const parsedItems: any[] = JSON.parse(text);
    
    return parsedItems.map((item, index) => ({
      id: `item-${Date.now()}-${index}`,
      quantity: typeof item.quantity === 'number' ? item.quantity : 1,
      description: item.description || "Produto sem descrição",
      unitPrice: typeof item.unitPrice === 'number' ? item.unitPrice : 0,
    }));
  } catch (error: any) {
    console.error("Erro detalhado na chamada do Gemini:", error);
    
    // Tratamento de erros específicos da API
    if (error.message?.includes("API key not valid")) {
      throw new Error("A chave de API do Gemini fornecida é inválida. Verifique o valor configurado na Vercel.");
    }
    
    if (error.message?.includes("User location is not supported")) {
      throw new Error("A API do Gemini não está disponível na sua região atual.");
    }

    throw new Error(`Falha ao analisar imagem: ${error.message || 'Erro desconhecido na API do Gemini'}`);
  }
};

import { GoogleGenAI, Type } from "@google/genai";
import { Transaction, Category, TransactionType } from '../types';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

let ai: GoogleGenAI | null = null;
if (API_KEY) {
  ai = new GoogleGenAI({ apiKey: API_KEY });
}

export const getFinancialAdvice = async (transactions: Transaction[]): Promise<string> => {
  if (transactions.length === 0) {
    return "Adicione algumas transações para que eu possa analisar seus hábitos financeiros.";
  }
if (!ai) {
  return "⚠️ A análise por IA está desativada porque a chave VITE_GEMINI_API_KEY não foi configurada no Netlify.";
}
  // Prepare a simplified version of data for the AI to save tokens and improve focus
  const dataSummary = transactions.map(t => ({
    date: t.date,
    dueDate: t.dueDate,
    desc: t.description,
    amount: t.amount,
    type: t.type,
    cat: t.category
  }));

  const prompt = `
    Atue como um consultor financeiro pessoal especialista.
    Analise os seguintes dados financeiros (transações) de um usuário brasileiro:
    ${JSON.stringify(dataSummary)}

    Por favor, forneça:
    1. Um breve resumo da saúde financeira atual.
    2. Identifique a maior categoria de gastos.
    3. Dê 3 dicas práticas e acionáveis para economizar dinheiro baseadas nesses dados específicos.
    4. Use formatação Markdown (negrito, listas) para facilitar a leitura.
    5. Mantenha o tom amigável, encorajador e direto. Responda em Português do Brasil.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: "Você é um assistente financeiro útil e inteligente.",
        temperature: 0.7,
      }
    });

    return response.text || "Não foi possível gerar uma análise no momento.";
  } catch (error) {
    console.error("Erro ao chamar Gemini:", error);
    return "Desculpe, ocorreu um erro ao tentar analisar suas finanças. Verifique sua chave de API.";
  }
};

// Function to analyze a bill image
export const analyzeBillImage = async (base64Image: string, availableCategories?: string[]): Promise<Partial<Transaction> | null> => {
  const categoriesToList = availableCategories && availableCategories.length > 0 
    ? availableCategories 
    : Object.values(Category);

  const prompt = `
    Analise esta imagem de uma conta, boleto ou recibo fiscal brasileiro.
    Extraia as informações necessárias para preencher os campos de uma nova transação financeira.
    Identifique especificamente a data de emissão (date) e a data de vencimento (dueDate), se houver.
    Escolha a categoria mais apropriada DESTA LISTA EXATA: [${categoriesToList.join(', ')}].
  `;

  try {
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            description: {
              type: Type.STRING,
              description: "O nome do estabelecimento ou beneficiário"
            },
            amount: {
              type: Type.NUMBER,
              description: "O valor total numérico"
            },
            date: {
              type: Type.STRING,
              description: "A data de emissão no formato YYYY-MM-DD"
            },
            dueDate: {
              type: Type.STRING,
              description: "A data de vencimento no formato YYYY-MM-DD"
            },
            category: {
              type: Type.STRING,
              description: "A categoria escolhida da lista fornecida"
            }
          },
          required: ["description", "amount", "date", "category"]
        }
      }
    });

    const text = response.text;
    if (!text) return null;

    const data = JSON.parse(text);
    
    return {
      description: data.description,
      amount: typeof data.amount === 'number' ? data.amount : parseFloat(data.amount),
      date: data.date,
      dueDate: data.dueDate || data.date,
      category: data.category,
      type: TransactionType.EXPENSE
    };

  } catch (error) {
    console.error("Erro ao analisar imagem da conta:", error);
    return null;
  }
};

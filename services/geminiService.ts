import { GoogleGenAI } from "@google/genai";
import { Transaction, Category, TransactionType } from '../types';

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

export const getFinancialAdvice = async (transactions: Transaction[]): Promise<string> => {
  if (transactions.length === 0) {
    return "Adicione algumas transações para que eu possa analisar seus hábitos financeiros.";
  }

  // Prepare a simplified version of data for the AI to save tokens and improve focus
  const dataSummary = transactions.map(t => ({
    date: t.date,
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
      model: 'gemini-2.5-flash',
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
  // Use provided categories or fallback to default Enum values
  const categoriesToList = availableCategories && availableCategories.length > 0 
    ? availableCategories 
    : Object.values(Category);

  const prompt = `
    Analise esta imagem de uma conta, boleto ou recibo fiscal brasileiro.
    Extraia as seguintes informações em formato JSON estrito:
    1. "description": O nome do estabelecimento ou beneficiário (ex: "Conta de Luz Enel", "Supermercado X", "Netflix").
    2. "amount": O valor total numérico (float).
    3. "date": A data de vencimento ou da compra no formato YYYY-MM-DD.
    4. "category": Escolha a categoria mais apropriada DESTA LISTA EXATA: [${categoriesToList.join(', ')}]. Se nenhuma se encaixar perfeitamente, escolha "Outros" ou a mais próxima.
    
    Se não conseguir identificar algum campo, tente inferir pelo contexto ou deixe nulo.
    Retorne APENAS o JSON, sem markdown.
  `;

  try {
    // Clean the base64 string if it contains the data header
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text;
    if (!text) return null;

    const data = JSON.parse(text);
    
    return {
      description: data.description,
      amount: typeof data.amount === 'number' ? data.amount : parseFloat(data.amount),
      date: data.date,
      category: data.category,
      type: TransactionType.EXPENSE // Scanned bills are usually expenses
    };

  } catch (error) {
    console.error("Erro ao analisar imagem da conta:", error);
    return null;
  }
};

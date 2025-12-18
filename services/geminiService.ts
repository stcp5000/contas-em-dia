import { Transaction, Category, TransactionType } from "../types";

/**
 * Gera análise financeira chamando o backend (Netlify Function)
 */
export const getFinancialAdvice = async (
  transactions: Transaction[]
): Promise<string> => {
  if (!transactions || transactions.length === 0) {
    return "Adicione algumas transações para que eu possa analisar seus hábitos financeiros.";
  }

  try {
    const res = await fetch("/.netlify/functions/gemini-advice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transactions }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return `⚠️ Não foi possível gerar a análise agora. (${data?.error || `HTTP ${res.status}`})`;
    }

    return data?.advice || "⚠️ Não consegui gerar a análise agora.";
  } catch (err: any) {
    return `⚠️ Erro ao chamar o serviço de IA. (${err?.message || err})`;
  }
};

/**
 * Analisa imagem (boleto/recibo) chamando o backend (Netlify Function)
 */
export const analyzeBillImage = async (
  base64Image: string,
  availableCategories?: string[]
): Promise<Partial<Transaction> | null> => {
  try {
    const categoriesToList =
      availableCategories && availableCategories.length > 0
        ? availableCategories
        : Object.values(Category);

    const res = await fetch("/.netlify/functions/gemini-bill", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        base64Image,
        availableCategories: categoriesToList,
      }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      console.error("Erro gemini-bill:", data?.error || res.statusText);
      return null;
    }

    const t = data?.transaction;
    if (!t) return null;

    return {
      description: t.description,
      amount: typeof t.amount === "number" ? t.amount : parseFloat(t.amount),
      date: t.date,
      dueDate: t.dueDate || t.date,
      category: t.category,
      type: TransactionType.EXPENSE,
    };
  } catch (error) {
    console.error("Erro ao analisar imagem da conta:", error);
    return null;
  }
};

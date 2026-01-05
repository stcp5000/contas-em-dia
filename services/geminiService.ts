import { Transaction, Category, TransactionType } from '../types';

export const getFinancialAdvice = async (transactions: Transaction[]): Promise<string> => {
  if (!transactions || transactions.length === 0) {
    return "Adicione algumas transações para que eu possa analisar seus hábitos financeiros.";
  }

  const res = await fetch('/.netlify/functions/gemini-advice', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ transactions }),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(txt || 'Erro ao chamar gemini-advice');
  }

  const data = await res.json();
  return data.advice || data.text || "Não foi possível gerar uma análise no momento.";
};

// Mantém a assinatura, mas chama função no servidor (evita chave no browser)
export const analyzeBillImage = async (
  base64Image: string,
  availableCategories?: string[]
): Promise<Partial<Transaction> | null> => {
  const categoriesToList =
    availableCategories && availableCategories.length > 0
      ? availableCategories
      : Object.values(Category);

  const res = await fetch('/.netlify/functions/analyze-bill-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ base64Image, categories: categoriesToList }),
  });

  if (!res.ok) return null;

  const data = await res.json();

  // espera que a function retorne os campos da transação
  return {
    description: data.description,
    amount: typeof data.amount === 'number' ? data.amount : parseFloat(data.amount),
    date: data.date,
    dueDate: data.dueDate || data.date,
    category: data.category,
    type: TransactionType.EXPENSE,
  };
};

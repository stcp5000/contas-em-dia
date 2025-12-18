// netlify/functions/gemini-advice.cjs

function buildPrompt(transactions) {
  const dataSummary = transactions.map(t => ({
    date: t.date,
    dueDate: t.dueDate,
    desc: t.description,
    amount: t.amount,
    type: t.type,
    cat: t.category,
  }));

  return `
Atue como um consultor financeiro pessoal especialista.
Analise os seguintes dados financeiros (transações) de um usuário brasileiro:
${JSON.stringify(dataSummary, null, 2)}

Por favor, forneça:
1. Um breve resumo da saúde financeira atual.
2. Identifique a maior categoria de gastos.
3. Dê 3 dicas práticas e acionáveis para economizar dinheiro baseadas nesses dados específicos.
4. Use formatação Markdown (negrito, listas) para facilitar a leitura.
5. Mantenha o tom amigável, encorajador e direto. Responda em Português do Brasil.
`.trim();
}

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "text/plain; charset=utf-8",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: "Method Not Allowed" };
  }

  const API_KEY = process.env.GEMINI_API_KEY;
  if (!API_KEY) {
    return { statusCode: 500, headers, body: "Falta configurar GEMINI_API_KEY nas variáveis do Netlify." };
  }

  let parsed;
  try {
    parsed = JSON.parse(event.body || "{}");
  } catch {
    parsed = {};
  }

  const transactions = Array.isArray(parsed) ? parsed : parsed.transactions;

  if (!Array.isArray(transactions) || transactions.length === 0) {
    return { statusCode: 400, headers, body: 'Envie um JSON no formato: { "transactions": [...] }' };
  }

  const model = "gemini-3-flash-preview";
  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`;

  const reqBody = {
    contents: [
      { role: "user", parts: [{ text: buildPrompt(transactions) }] }
    ],
    generationConfig: { temperature: 0.7 }
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reqBody),
    });

    const json = await res.json().catch(() => null);

    if (!res.ok) {
      const msg = json?.error?.message || `Gemini API error (${res.status})`;
      return { statusCode: 502, headers, body: msg };
    }

    const text =
      json?.candidates?.[0]?.content?.parts?.map(p => p.text).join("") || "";

    return { statusCode: 200, headers, body: text || "Não foi possível gerar uma análise no momento." };
  } catch (err) {
    return { statusCode: 502, headers, body: `Erro ao chamar Gemini: ${err?.message || err}` };
  }
};


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
    "Content-Type": "application/json; charset=utf-8",
  };

  const json = (statusCode, payload) => ({
    statusCode,
    headers,
    body: JSON.stringify(payload),
  });

  if (event.httpMethod === "OPTIONS") {
    return json(200, {});
  }

  if (event.httpMethod !== "POST") {
    return json(405, { error: "Method Not Allowed" });
  }

  const API_KEY = process.env.GEMINI_API_KEY;
  if (!API_KEY) {
    return json(500, { error: "Falta configurar GEMINI_API_KEY nas variáveis do Netlify." });
  }

  let parsed;
  try {
    parsed = JSON.parse(event.body || "{}");
  } catch {
    parsed = {};
  }

  const transactions = Array.isArray(parsed) ? parsed : parsed.transactions;

  if (!Array.isArray(transactions) || transactions.length === 0) {
    return json(400, { error: 'Envie um JSON no formato: { "transactions": [...] }' });
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

    const body = await res.json().catch(() => null);

    if (!res.ok) {
      const msg = body?.error?.message || `Gemini API error (${res.status})`;
      return json(502, { error: msg });
    }

    const text =
      body?.candidates?.[0]?.content?.parts?.map(p => p.text).join("") || "";

    return json(200, { text: text || "Não foi possível gerar uma análise no momento." });
  } catch (err) {
    return json(502, { error: `Erro ao chamar Gemini: ${err?.message || err}` });
  }
};

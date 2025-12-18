// netlify/functions/gemini-advice.cjs

function buildPrompt(transactions) {
  return `
Atue como um consultor financeiro pessoal especialista.

Analise as transações abaixo (de um usuário brasileiro) e entregue:
1) Resumo da saúde financeira atual
2) Maior categoria de gastos
3) 3 recomendações práticas e acionáveis (baseadas nesses dados)
4) Alertas de risco (se houver)
5) Um plano simples para os próximos 7 dias

Transações:
${JSON.stringify(transactions, null, 2)}
`.trim();
}

exports.handler = async (event) => {
  // CORS (se precisar)
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
      body: "",
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return {
        statusCode: 500,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Missing GEMINI_API_KEY in Netlify env vars." }),
      };
    }

    const body = event.body ? JSON.parse(event.body) : {};
    const transactions = Array.isArray(body) ? body : body.transactions;

    if (!Array.isArray(transactions)) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Body must be { transactions: [...] }" }),
      };
    }

    const model = process.env.GEMINI_MODEL || "gemini-1.5-flash";
    const prompt = buildPrompt(transactions);

    const url =
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7 },
      }),
    });

    const json = await resp.json();

    if (!resp.ok) {
      return {
        statusCode: resp.status,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: json?.error || json }),
      };
    }

    const text =
      json?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") ||
      "Não foi possível gerar a análise no momento.";

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ text }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: String(err?.message || err) }),
    };
  }
};

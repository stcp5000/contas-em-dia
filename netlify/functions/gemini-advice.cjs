// netlify/functions/gemini-advice.cjs

function buildPrompt(transactions) {
  return `
Atue como um consultor financeiro pessoal especialista.
Analise os seguintes dados financeiros (transações) de um usuário brasileiro:
${JSON.stringify(transactions, null, 2)}

Por favor, forneça:
1. Um breve resumo da saúde financeira atual.
2. Identifique a maior categoria de gastos.
3. Dê 3 dicas práticas e acionáveis para economizar dinheiro baseadas nesses dados específicos.
4. Use formatação Markdown (negrito, listas) para facilitar a leitura.
5. Mantenha o tom amigável, encorajador e direto. Responda em Português do Brasil.
`.trim();
}

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: "Method Not Allowed" };
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "GEMINI_API_KEY não configurada no Netlify." }),
      };
    }

    const body = JSON.parse(event.body || "{}");
    const transactions = body.transactions || [];

    const prompt = buildPrompt(transactions);

    const url =
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7 },
      }),
    });

    const data = await resp.json();

    if (!resp.ok) {
      console.error("Gemini error:", data);
      return { statusCode: resp.status, body: JSON.stringify({ error: data }) };
    }

    const text =
      data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") || "";

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, advice: text }),
    };
  } catch (err) {
    console.error("Function crash:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: String(err?.message || err) }),
    };
  }
};

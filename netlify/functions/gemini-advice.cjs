// netlify/functions/gemini-advice.cjs

function buildPrompt(transactions) {
  return `
Atue como um consultor financeiro pessoal especialista.
Analise as transações abaixo (de um usuário brasileiro) e entregue:
1) Resumo da saúde financeira
2) Principais padrões (gastos/receitas)
3) 3 recomendações práticas
4) Alertas de risco (se houver)
5) Um plano simples para os próximos 7 dias

Transações:
${JSON.stringify(transactions, null, 2)}
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Missing GEMINI_API_KEY on server." }),
      };
    }

    const body = JSON.parse(event.body || "{}");
    const transactions = body.transactions;

    if (!Array.isArray(transactions) || transactions.length === 0) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "No transactions provided." }),
      };
    }

    // @google/genai é ESM; por isso usamos import() dinâmico
    const { GoogleGenAI } = await import("@google/genai");

    const ai = new GoogleGenAI({ apiKey });

    const prompt = buildPrompt(transactions);

    const result = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });

    // tenta extrair texto de formas diferentes (robusto)
    const advice =
      (typeof result?.text === "function" ? result.text() : result?.text) ||
      (typeof result?.response?.text === "function" ? result.response.text() : null) ||
      JSON.stringify(result);

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ advice }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: String(err?.message || err) }),
    };
  }
};

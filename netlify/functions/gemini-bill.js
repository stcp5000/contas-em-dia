// netlify/functions/gemini-bill.js

export const handler = async (event) => {
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
    const base64Image = body.base64Image;
    const availableCategories = body.availableCategories;

    if (!base64Image) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "base64Image is required." }),
      };
    }

    const categoriesToList =
      Array.isArray(availableCategories) && availableCategories.length > 0
        ? availableCategories
        : null;

    const prompt = `
Analise esta imagem de uma conta, boleto ou recibo fiscal brasileiro.
Extraia as informações para preencher uma nova transação financeira.
Identifique especificamente a data de emissão (date) e a data de vencimento (dueDate), se houver.
${categoriesToList ? `Escolha a categoria DESTA LISTA EXATA: [${categoriesToList.join(", ")}].` : ""}
Responda somente em JSON.
`.trim();

    const cleanBase64 = String(base64Image).replace(
      /^data:image\/(png|jpeg|jpg|webp);base64,/,
      ""
    );

    const { GoogleGenAI, Type } = await import("@google/genai");
    const ai = new GoogleGenAI({ apiKey });

    const result = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: {
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: cleanBase64 } },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            description: { type: Type.STRING },
            amount: { type: Type.NUMBER },
            date: { type: Type.STRING },
            dueDate: { type: Type.STRING },
            category: { type: Type.STRING },
          },
          required: ["description", "amount", "date", "category"],
        },
      },
    });

    const text =
      (typeof result?.text === "function" ? result.text() : result?.text) ||
      (typeof result?.response?.text === "function" ? result.response.text() : null);

    if (!text) {
      return {
        statusCode: 500,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Empty response from model." }),
      };
    }

    const data = JSON.parse(text);

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transaction: data }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: String(err?.message || err) }),
    };
  }
};

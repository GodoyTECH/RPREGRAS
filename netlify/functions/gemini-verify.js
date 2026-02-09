const GEMINI_MODEL = "gemini-1.5-flash";
const DEFAULT_HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

function buildPrompt(relato, regras) {
  const regrasCompactas = regras.map(regra => ({
    id: regra.codigo,
    title: regra.nome,
    category: regra.categoria,
    description: regra.descricao,
    keywords: regra.keywords || []
  }));

  return `Você é um verificador de regras e crimes. Analise o relato e selecione as regras MAIS prováveis (máx. 5) com justificativa objetiva.

Requisitos:
- Compare o relato com descrição e palavras-chave.
- Só retorne regras existentes na lista.
- Confidence deve ser de 0 a 1.
- Se nada se aplicar, matched_rules deve ficar vazio.

Relato:
"${relato}"

Regras disponíveis (JSON):
${JSON.stringify(regrasCompactas)}

Responda SOMENTE com JSON no formato:
{
  "matched_rules": [
    {"id": "CODIGO", "title": "NOME", "reason": "Justificativa objetiva", "confidence": 0.0}
  ],
  "summary": "Resumo curto"
}`;
}

function extractJson(texto) {
  if (!texto) {
    return null;
  }
  try {
    return JSON.parse(texto);
  } catch (erro) {
    const match = texto.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch (innerError) {
        return null;
      }
    }
    return null;
  }
}

exports.handler = async function handler(event) {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: DEFAULT_HEADERS,
      body: ""
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: DEFAULT_HEADERS,
      body: JSON.stringify({ error: "Method not allowed" })
    };
  }

  const apiKey = process.env.IA_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      headers: DEFAULT_HEADERS,
      body: JSON.stringify({
        matched_rules: [],
        summary: "IA_KEY/GEMINI_API_KEY não configurada no Netlify.",
        error: "missing_api_key"
      })
    };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch (error) {
    return {
      statusCode: 400,
      headers: DEFAULT_HEADERS,
      body: JSON.stringify({ error: "Invalid JSON body" })
    };
  }

  const relato = (payload.relato || "").trim();
  const regras = Array.isArray(payload.regras) ? payload.regras : [];

  if (!relato || regras.length === 0) {
    return {
      statusCode: 400,
      headers: DEFAULT_HEADERS,
      body: JSON.stringify({
        matched_rules: [],
        summary: "Relato ou regras ausentes.",
        error: "invalid_input"
      })
    };
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;
  const prompt = buildPrompt(relato, regras);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json"
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        statusCode: response.status,
        headers: DEFAULT_HEADERS,
        body: JSON.stringify({
          matched_rules: [],
          summary: "Falha na IA.",
          error: errorText
        })
      };
    }

    const data = await response.json();
    const candidateText = data?.candidates?.[0]?.content?.parts?.map(part => part.text).join("") || "";
    const parsed = extractJson(candidateText);

    if (!parsed) {
      return {
        statusCode: 500,
        headers: DEFAULT_HEADERS,
        body: JSON.stringify({
          matched_rules: [],
          summary: "Resposta da IA inválida.",
          error: "invalid_response"
        })
      };
    }

    return {
      statusCode: 200,
      headers: DEFAULT_HEADERS,
      body: JSON.stringify({
        matched_rules: Array.isArray(parsed.matched_rules) ? parsed.matched_rules : [],
        summary: parsed.summary || ""
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: DEFAULT_HEADERS,
      body: JSON.stringify({
        matched_rules: [],
        summary: "Erro ao consultar IA.",
        error: error.message
      })
    };
  }
};

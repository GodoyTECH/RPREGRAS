(function () {
    const GEMINI_API_KEY = ""; // Configure sua chave aqui.
    const GEMINI_MODEL = "gemini-1.5-flash";

    function buildPrompt(relato, regras) {
        const regrasCompactas = regras.map(regra => ({
            id: regra.codigo,
            title: regra.nome,
            category: regra.categoria,
            description: regra.descricao
        }));

        return `Você é um verificador de regras. Analise o relato e retorne um JSON estrito com as regras aplicáveis.

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
}

Se nenhuma regra se aplicar, retorne matched_rules vazio e um resumo explicando.`;
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

    async function geminiVerifyRules(relato, regras) {
        if (!GEMINI_API_KEY) {
            return {
                matched_rules: [],
                summary: "Chave do Gemini não configurada. Atualize ai/geminiVerify.js com GEMINI_API_KEY.",
                error: "missing_api_key"
            };
        }

        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
        const prompt = buildPrompt(relato, regras);

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
            throw new Error(`Gemini error: ${response.status} ${errorText}`);
        }

        const data = await response.json();
        const candidateText = data?.candidates?.[0]?.content?.parts?.map(part => part.text).join("") || "";
        const parsed = extractJson(candidateText);

        if (!parsed) {
            throw new Error("Resposta do Gemini não está em JSON válido.");
        }

        return {
            matched_rules: Array.isArray(parsed.matched_rules) ? parsed.matched_rules : [],
            summary: parsed.summary || ""
        };
    }

    window.geminiVerifyRules = geminiVerifyRules;
})();

const GEMINI_MODEL = "gemini-1.5-flash";
const MAX_TEXT_LENGTH = 10000;

function buildPrompt({ text, mode, rules }) {
    const regrasCompactas = rules.map(regra => ({
        ruleId: regra.codigo,
        ruleTitle: regra.nome,
        category: regra.categoria,
        description: regra.descricao
    }));

    return `Você é um verificador de regras. Analise o relato e retorne SOMENTE JSON válido, sem markdown.

Modo: ${mode}
Relato:
"${text}"

Regras disponíveis (JSON):
${JSON.stringify(regrasCompactas)}

Formato obrigatório da resposta:
{
  "success": true,
  "mode": "${mode}",
  "inputText": "${text}",
  "violations": [
    {
      "ruleId": "CODIGO",
      "ruleTitle": "TITULO",
      "evidence": "trecho do texto",
      "severity": "low|medium|high",
      "explanation": "por que viola"
    }
  ],
  "summary": "Resumo curto"
}

Se nenhuma regra se aplicar, retorne violations vazio e summary explicando.`;
}

function extractJson(text) {
    if (!text) {
        return null;
    }
    try {
        return JSON.parse(text);
    } catch (error) {
        const match = text.match(/\{[\s\S]*\}/);
        if (!match) {
            return null;
        }
        try {
            return JSON.parse(match[0]);
        } catch (innerError) {
            return null;
        }
    }
}

function mapMatchedRulesToViolations(matchedRules) {
    return matchedRules.map(rule => {
        const confidence = typeof rule.confidence === "number"
            ? (rule.confidence > 1 ? rule.confidence / 100 : rule.confidence)
            : 0.8;
        let severity = "medium";
        if (confidence >= 0.9) {
            severity = "high";
        } else if (confidence < 0.75) {
            severity = "low";
        }
        return {
            ruleId: rule.id || rule.ruleId || "",
            ruleTitle: rule.title || rule.ruleTitle || "",
            evidence: "",
            severity,
            explanation: rule.reason || ""
        };
    }).filter(rule => rule.ruleId);
}

exports.handler = async (event) => {
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS"
    };

    if (event.httpMethod === "OPTIONS") {
        return {
            statusCode: 204,
            headers
        };
    }

    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ success: false, error: "Método não permitido." })
        };
    }

    let payload;
    try {
        payload = JSON.parse(event.body || "{}");
    } catch (error) {
        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ success: false, error: "JSON inválido." })
        };
    }

    const text = (payload.text || "").trim();
    const mode = payload.mode;
    const rules = Array.isArray(payload.rules) ? payload.rules : [];

    if (!text) {
        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ success: false, error: "O texto não pode estar vazio." })
        };
    }

    if (text.length > MAX_TEXT_LENGTH) {
        return {
            statusCode: 413,
            headers,
            body: JSON.stringify({ success: false, error: "O texto excede o limite permitido." })
        };
    }

    if (mode !== "rules" && mode !== "police") {
        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ success: false, error: "Modo inválido." })
        };
    }

    if (!process.env.IA_KEY) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ success: false, error: "Chave da IA não configurada." })
        };
    }

    if (!rules.length) {
        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ success: false, error: "Regras não fornecidas para análise." })
        };
    }

    const prompt = buildPrompt({ text, mode, rules });

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${process.env.IA_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.2,
                    responseMimeType: "application/json"
                }
            })
        });

        if (!response.ok) {
            return {
                statusCode: response.status,
                headers,
                body: JSON.stringify({ success: false, error: "Falha ao consultar a IA." })
            };
        }

        const data = await response.json();
        const candidateText = data?.candidates?.[0]?.content?.parts?.map(part => part.text).join("") || "";
        const parsed = extractJson(candidateText);

        if (!parsed) {
            return {
                statusCode: 502,
                headers,
                body: JSON.stringify({ success: false, error: "Resposta inválida da IA." })
            };
        }

        if (parsed.success === false) {
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: false,
                    error: parsed.error || \"A IA retornou um erro.\"
                })
            };
        }

        let output = parsed;
        if (!output.violations && Array.isArray(output.matched_rules)) {
            output = {
                success: true,
                mode,
                inputText: text,
                violations: mapMatchedRulesToViolations(output.matched_rules),
                summary: output.summary || ""
            };
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                mode,
                inputText: text,
                violations: Array.isArray(output.violations) ? output.violations : [],
                summary: output.summary || ""
            })
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ success: false, error: "Erro interno ao processar a IA." })
        };
    }
};

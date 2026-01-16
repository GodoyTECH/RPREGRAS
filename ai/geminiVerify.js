(function () {
    const FUNCTION_ENDPOINT = "/.netlify/functions/ai-verify";

    async function geminiVerifyRules(relato, regras, mode) {
        const response = await fetch(FUNCTION_ENDPOINT, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                text: relato,
                mode,
                rules
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`AI verify error: ${response.status} ${errorText}`);
        }

        const data = await response.json();
        if (!data || data.success === false) {
            const errorMessage = data && data.error ? data.error : "Não foi possível analisar com IA.";
            throw new Error(errorMessage);
        }

        return data;
    }

    window.geminiVerifyRules = geminiVerifyRules;
})();

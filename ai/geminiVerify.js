(function () {
    async function geminiVerifyRules(relato, regras) {
        const response = await fetch('/.netlify/functions/gemini-verify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                relato,
                regras
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Gemini function error: ${response.status} ${errorText}`);
        }

        const data = await response.json();

        return {
            matched_rules: Array.isArray(data.matched_rules) ? data.matched_rules : [],
            summary: data.summary || ''
        };
    }

    window.geminiVerifyRules = geminiVerifyRules;
})();

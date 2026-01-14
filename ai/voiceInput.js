(function () {
    function setupVoiceInput({ buttonEl, inputEl, statusEl }) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            if (buttonEl) {
                buttonEl.disabled = true;
                buttonEl.title = "Seu navegador não suporta voz. Digite o texto.";
            }
            if (statusEl) {
                statusEl.textContent = "Seu navegador não suporta voz. Digite o texto.";
            }
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = "pt-BR";
        recognition.interimResults = false;
        recognition.continuous = false;

        let listening = false;

        const setStatus = (message) => {
            if (statusEl) {
                statusEl.textContent = message;
            }
        };

        const setListeningState = (isListening) => {
            listening = isListening;
            if (buttonEl) {
                buttonEl.classList.toggle("listening", isListening);
                buttonEl.setAttribute("aria-pressed", isListening ? "true" : "false");
            }
        };

        recognition.onstart = () => {
            setListeningState(true);
            setStatus("Ouvindo... Clique novamente para parar.");
        };

        recognition.onend = () => {
            setListeningState(false);
            setStatus("");
        };

        recognition.onerror = (event) => {
            setListeningState(false);
            const erroMensagem = event?.error === "not-allowed"
                ? "Permissão de microfone negada. Digite o texto manualmente."
                : "Não foi possível capturar sua voz. Tente novamente.";
            setStatus(erroMensagem);
        };

        recognition.onresult = (event) => {
            let transcript = "";
            for (let i = event.resultIndex; i < event.results.length; i += 1) {
                transcript += event.results[i][0].transcript;
            }

            if (transcript) {
                const atual = inputEl.value.trim();
                inputEl.value = atual ? `${atual} ${transcript.trim()}` : transcript.trim();
                inputEl.focus();
            }
        };

        if (buttonEl) {
            buttonEl.addEventListener("click", () => {
                if (listening) {
                    recognition.stop();
                } else {
                    recognition.start();
                }
            });
        }
    }

    window.setupVoiceInput = setupVoiceInput;
})();

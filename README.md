# Verific OneS RP

Este repositório contém uma SPA estática para verificação de infrações e crimes no ONESTATE RP, com suporte opcional ao Gemini e entrada por voz.

## Configuração da IA (Gemini)

Como o projeto é 100% front-end, a chave do Gemini precisa ficar no arquivo abaixo (visível no navegador):

- `ai/geminiVerify.js` → edite a constante `GEMINI_API_KEY`.

> **Atenção:** em apps somente front-end não há como esconder a chave. Para produção, o ideal é usar um backend que injete a chave via variável de ambiente e faça a chamada do Gemini no servidor.

## Execução local

Basta abrir o `index.html` ou iniciar um servidor simples, por exemplo:

```bash
python -m http.server 8000
```

Depois acesse `http://localhost:8000`.

## Voz → Texto

O botão de microfone ao lado do relato usa a Web Speech API. Em navegadores sem suporte, o botão fica desabilitado e uma mensagem orienta a digitar.

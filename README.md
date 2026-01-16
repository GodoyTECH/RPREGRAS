# Verific OneS RP

Este repositório contém uma SPA estática para verificação de infrações e crimes no ONESTATE RP, com suporte opcional ao Gemini e entrada por voz.

## Configuração da IA (Gemini)

A integração com IA é feita por uma Netlify Function. Configure a variável de ambiente:

- `AI_KEY` no ambiente do Netlify.

A chamada do front-end é feita para `/.netlify/functions/ai-verify`.

## Execução local

Basta abrir o `index.html` ou iniciar um servidor simples, por exemplo:

```bash
python -m http.server 8000
```

Depois acesse `http://localhost:8000`.

## Voz → Texto

O botão de microfone ao lado do relato usa a Web Speech API. Em navegadores sem suporte, o botão fica desabilitado e uma mensagem orienta a digitar.

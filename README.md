# Verific OneS RP

Este repositório contém uma SPA estática para verificação de infrações e crimes no ONESTATE RP, com suporte opcional ao Gemini e entrada por voz.

## Configuração da IA (Gemini)

O projeto usa uma função Netlify (`/.netlify/functions/gemini-verify`) para consultar o Gemini e manter a chave fora do front-end.

1. Configure a variável de ambiente `IA_KEY` (ou `GEMINI_API_KEY`) no Netlify (ou no ambiente local).
2. Suba o projeto normalmente; o front-end chama a função serverless com o relato e as regras.

> **Atenção:** se você abrir apenas o `index.html` sem a função Netlify rodando, a IA não responderá. Use Netlify CLI (`netlify dev`) ou hospede em um ambiente com suporte a funções.

## Execução local

Basta abrir o `index.html` ou iniciar um servidor simples, por exemplo:

```bash
python -m http.server 8000
```

Depois acesse `http://localhost:8000`.

Para testar a IA localmente, prefira:

```bash
IA_KEY="sua-chave" netlify dev
```

## Voz → Texto

O botão de microfone ao lado do relato usa a Web Speech API. Em navegadores sem suporte, o botão fica desabilitado e uma mensagem orienta a digitar.

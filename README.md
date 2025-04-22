# Gerador de Conteúdo SEO

Este projeto é um gerador de conteúdo SEO que utiliza IA para criar textos otimizados a partir de palavras-chave fornecidas pelo usuário. O sistema realiza três tarefas principais:

1. **Geração de texto**: Cria um texto completo baseado na palavra-chave e no template selecionado
2. **Conversão para Markdown**: Formata o texto gerado em Markdown para melhor legibilidade
3. **Estruturação em JSON**: Converte o conteúdo em um formato JSON estruturado para uso em aplicações

## Funcionalidades

- Seleção de diferentes templates de conteúdo (Squeeze Personalizado, Calculadora Personalizada, etc.)
- Geração de texto otimizado para SEO com base na palavra-chave fornecida
- Visualização do conteúdo em três formatos: texto simples, Markdown e JSON estruturado
- Interface amigável e responsiva

## Estrutura do Projeto

```
client/
  ├── app/
  │   ├── components/
  │   ├── prompts/
  │   │   ├── calculadora-personalizada.json
  │   │   ├── example.json
  │   │   └── template-structure.json
  │   ├── prompts.json
  │   ├── routes/
  │   │   └── home.tsx
  │   ├── service/
  │   │   └── index.js
  │   └── utils/
  │       └── markdownToJson.ts
  ├── public/
  └── ...
```

## Como Funciona

1. O usuário insere uma palavra-chave e seleciona um template
2. O sistema utiliza a API de IA para gerar um texto otimizado para SEO
3. O texto é convertido para formato Markdown
4. O Markdown é analisado e convertido em uma estrutura JSON padronizada
5. O usuário pode visualizar e copiar o conteúdo em qualquer um dos três formatos

## Formato JSON Estruturado

O formato JSON estruturado segue este padrão:

```json
{
  "type": "category",
  "from": "1015101",
  "contents": {
    "title": {
      "content": "Título do Conteúdo",
      "firstBlock": "Parágrafo introdutório"
    },
    "subtitles": [
      {
        "id": 0,
        "content": "Primeiro Subtítulo",
        "for": "text"
      }
    ],
    "paragraphs": [
      {
        "blocks": ["Texto do parágrafo"],
        "subtitleId": 0
      }
    ],
    "lists": [
      {
        "id": 0,
        "title": "Título da Lista",
        "blocks": ["Introdução da lista"],
        "content": ["Item 1", "Item 2"],
        "type": "unordened"
      }
    ],
    "cta": {
      "title": "Título do CTA",
      "content": "Texto do call-to-action"
    }
  },
  "blueprint": [
    {
      "type": "title",
      "id": null
    },
    {
      "type": "list",
      "id": 0
    }
  ],
  "audioFileName": "palavra-chave.wav"
}
```

## Tecnologias Utilizadas

- React
- TypeScript
- Tailwind CSS
- OpenRouter API para geração de conteúdo com IA

## Configuração

1. Clone o repositório
2. Instale as dependências: `npm install`
3. Configure a variável de ambiente `VITE_OPR_API_KEY` com sua chave da API OpenRouter
4. Execute o projeto: `npm run dev`

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo LICENSE para mais detalhes.
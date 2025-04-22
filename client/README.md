# Gerador de Conteúdo SEO - Cliente

Este é o cliente React para o Gerador de Conteúdo SEO, uma aplicação que utiliza IA para criar textos otimizados para SEO a partir de palavras-chave.

## Funcionalidades

- Geração de texto otimizado para SEO com base em palavras-chave
- Conversão automática para formato Markdown
- Estruturação do conteúdo em JSON para uso em aplicações
- Interface amigável e responsiva
- Suporte a múltiplos templates de conteúdo

## Tecnologias

- React com TypeScript
- Vite para desenvolvimento rápido
- React Router para navegação
- TailwindCSS para estilização
- Integração com API de IA para geração de conteúdo

## Iniciando

### Instalação

Instale as dependências:

```bash
npm install
```

### Configuração

Crie um arquivo `.env` na raiz do projeto com sua chave de API:

```
VITE_OPR_API_KEY=sua_chave_api_aqui
```

### Desenvolvimento

Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

Sua aplicação estará disponível em `http://localhost:5173`.

## Construção para Produção

Crie uma build de produção:

```bash
npm run build
```

## Implantação com Docker

Para construir e executar usando Docker:

```bash
docker build -t gerador-seo .

# Executar o container
docker run -p 3000:3000 gerador-seo
```

## Estrutura do Projeto

```
app/
├── components/     # Componentes reutilizáveis
├── prompts/        # Templates de prompts para IA
├── prompts.json    # Configuração dos prompts
├── routes/         # Rotas da aplicação
├── service/        # Serviços para comunicação com API
└── utils/          # Utilitários, incluindo conversão Markdown para JSON
```

---

Desenvolvido com ❤️ para otimização de conteúdo SEO.
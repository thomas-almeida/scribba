# API de Gerau00e7u00e3o de Textos

Esta API permite gerar textos descritivos-informativos utilizando a API da ABACUS AI, com foco em SEO e parametrizau00e7u00e3o de conteu00fado.

## Requisitos

- Node.js (v14 ou superior)
- npm ou yarn

## Instalau00e7u00e3o

1. Clone o repositu00f3rio
2. Instale as dependu00eancias:

```bash
npm install
```

3. Configure o banco de dados e popule com dados iniciais:

```bash
npm run setup
```

4. Inicie o servidor:

```bash
npm run dev
```

O servidor estaru00e1 rodando em `http://localhost:3000`.

## Integrau00e7u00e3o com a API da ABACUS AI

A aplicau00e7u00e3o utiliza a API da ABACUS AI para gerar textos descritivos-informativos. A chave da API estu00e1 configurada no arquivo `.env` na raiz do projeto.

### Como funciona a integrau00e7u00e3o

1. Quando um usuu00e1rio solicita a gerau00e7u00e3o de um texto, o sistema envia uma requisiu00e7u00e3o para a API da ABACUS AI com a palavra-chave e paru00e2metros especu00edficos.

2. A API processa a solicitau00e7u00e3o e retorna um texto estruturado que u00e9 formatado para o padru00e3o esperado pelo frontend.

3. O sistema salva o texto gerado no banco de dados e o retorna para o usuu00e1rio.

### Paru00e2metros utilizados

Os textos gerados seguem uma estrutura especu00edfica com:
- Tu00edtulo atrativo
- Subtu00edtulos relevantes
- Paru00e1grafos informativos
- Lista de benefu00edcios/vantagens
- Menu00e7u00f5es de branding, valor agregado e CTA

### Tratamento de falhas

Em caso de falha na comunicau00e7u00e3o com a API, o sistema possui um mecanismo de fallback que gera um texto padru00e3o baseado na palavra-chave fornecida.

## Endpoints

### Adicionar email u00e0 wishlist

```
POST /wishlist
```

Body:
```json
{
  "email": "usuario@exemplo.com"
}
```

### Login

```
POST /login
```

Body:
```json
{
  "email": "usuario@exemplo.com"
}
```

### Gerar texto

```
POST /texts
```

Headers:
```
Authorization: Bearer {token}
```

Body:
```json
{
  "keyword": "Squeeze",
  "type": "category",
  "from": "1015092"
}
```

### Listar textos do usuu00e1rio

```
GET /texts
```

Headers:
```
Authorization: Bearer {token}
```

### Obter texto por ID

```
GET /texts/:id
```

Headers:
```
Authorization: Bearer {token}
```

## Estrutura do Projeto

- `/prisma`: Configurau00e7u00e3o do banco de dados e modelos
- `/src/controllers`: Controladores da aplicau00e7u00e3o
- `/src/middlewares`: Middlewares, incluindo autenticau00e7u00e3o
- `/src/services`: Serviu00e7os externos, como integrau00e7u00e3o com a API da ABACUS AI
- `/src/routes.js`: Definiu00e7u00e3o das rotas da API
- `/src/server.js`: Ponto de entrada da aplicau00e7u00e3o
# API de Clima e Condições de Estudo

API desenvolvida para a disciplina de Programação Web, com o objetivo de consultar o clima de uma cidade, gerar recomendações de estudo com base na temperatura e permitir autenticação de usuários.

O projeto utiliza uma API externa de clima, banco de dados SQLite com Prisma ORM, autenticação com JWT e uma interface web integrada ao backend.

## Funcionalidades

- Cadastro de usuário
- Login de usuário com autenticação JWT
- Consulta de clima por cidade
- Geração de recomendação de estudo conforme a temperatura
- Salvamento de histórico de consultas
- Listagem do histórico de consultas
- Interface web integrada ao backend
- Mudança visual da página conforme a temperatura consultada
- Banco de dados local utilizando SQLite
- ORM configurado com Prisma
- Documentação da API no APIDog

## Tecnologias utilizadas

- Node.js
- TypeScript
- Express
- Prisma ORM
- SQLite
- JWT
- Bcrypt
- Axios
- OpenWeather API
- HTML
- CSS
- JavaScript
- APIDog
- GitHub

## Requisitos atendidos

- Utilização de biblioteca ORM com Prisma
- Autenticação de usuários com JWT
- Documentação da API com APIDog
- Projeto disponibilizado no GitHub
- Desenvolvimento em equipe
- Integração com API externa de clima

## Como rodar o projeto

### 1. Clone o repositório

```bash
git clone https://github.com/Isah-006/Climate-api.git
```

### 2. Acesse a pasta do projeto

```bash
cd Climate-api
```

### 3. Instale as dependências

```bash
npm install
```

### 4. Configure as variáveis de ambiente

Crie um arquivo chamado `.env` na raiz do projeto, usando como base o arquivo `.env.example`.

Exemplo:

```env
DATABASE_URL="file:./dev.db"
OPENWEATHER_API_KEY="SUA_CHAVE_OPENWEATHER_AQUI"
```

A variável `OPENWEATHER_API_KEY` deve receber uma chave válida da API OpenWeather.

### 5. Gere o Prisma Client

```bash
npx prisma generate
```

### 6. Execute as migrations do banco de dados

```bash
npx prisma migrate dev
```

### 7. Rode o projeto

```bash
npm run dev
```

Ou, se preferir rodar diretamente com TSX:

```bash
npx tsx watch src/server.ts
```

Após executar o comando, o servidor ficará disponível em:

```txt
http://localhost:3000
```

## Scripts disponíveis

| Comando | Descrição |
|---|---|
| `npm run dev` | Inicia o servidor em modo desenvolvimento com watch |
| `npm start` | Inicia o servidor |
| `npx prisma generate` | Gera/atualiza o Prisma Client |
| `npx prisma migrate dev` | Executa as migrations do banco de dados |

## Variáveis de ambiente

| Variável | Descrição |
|---|---|
| `DATABASE_URL` | Define o caminho do banco de dados SQLite |
| `OPENWEATHER_API_KEY` | Chave necessária para consumir a API externa OpenWeather |

## Banco de dados

O projeto utiliza SQLite como banco de dados local e Prisma como ORM.

O Prisma é responsável por mapear as tabelas do banco de dados e facilitar as operações de criação, leitura e armazenamento dos dados.

Principais dados armazenados:

- usuários cadastrados;
- nome, e-mail e senha criptografada dos usuários;
- histórico de consultas climáticas;
- cidade, temperatura, condição climática, recomendação e data da consulta.

## Modelos principais do banco

### Usuario

Armazena os dados do usuário cadastrado.

Campos principais:

- `id`
- `nome`
- `email`
- `senha`

### ClimaPesquisado

Armazena o histórico de consultas climáticas realizadas.

Campos principais:

- `id`
- `cidade`
- `temperatura`
- `condicao`
- `recomendacao`
- `dataPesquisa`
- `usuarioId`

## Endpoints principais

Os endpoints abaixo seguem a mesma estrutura utilizada na documentação do APIDog.

| Método | Módulo | Endpoint | Descrição | Autenticação |
|---|---|---|---|---|
| POST | Autenticação | `/register` | Cadastra um novo usuário | Não |
| POST | Autenticação | `/login` | Realiza login do usuário e retorna o token JWT | Não |
| GET | Clima | `/clima/{cidade}` | Consulta o clima de uma cidade | Sim |
| POST | Histórico | `/historico` | Salva uma consulta climática no histórico | Sim |
| GET | Histórico | `/historico` | Lista o histórico de consultas | Sim |

## Exemplos de requisição

### Cadastro de usuário

```http
POST /register
```

Exemplo de body:

```json
{
  "nome": "Lorena",
  "email": "lorena@email.com",
  "senha": "123456"
}
```

Resposta esperada:

```json
{
  "mensagem": "Usuário criado com sucesso!",
  "usuario": {
    "id": 1,
    "nome": "Lorena",
    "email": "lorena@email.com"
  }
}
```

Possíveis erros:

```json
{
  "erro": "Este email já está cadastrado."
}
```

```json
{
  "erros": {
    "nome": {
      "_errors": [
        "O nome deve ter no mínimo 2 caracteres"
      ]
    }
  }
}
```

---

### Login de usuário

```http
POST /login
```

Exemplo de body:

```json
{
  "email": "lorena@email.com",
  "senha": "123456"
}
```

Resposta esperada:

```json
{
  "mensagem": "Login efetuado com sucesso!",
  "token": "token_jwt_aqui"
}
```

Possíveis erros:

```json
{
  "erro": "Usuário não encontrado."
}
```

```json
{
  "erro": "Senha incorreta."
}
```

---

### Consultar clima por cidade

```http
GET /clima/{cidade}
```

Exemplo:

```http
GET /clima/Ribeirão Preto
```

Essa rota consulta a API externa OpenWeather e retorna os dados climáticos da cidade informada.

Essa rota exige autenticação. O token JWT deve ser enviado no cabeçalho da requisição:

```http
Authorization: Bearer token_jwt_aqui
```

Resposta esperada:

```json
{
  "cidade": "Ribeirão Preto",
  "temperatura": 32,
  "condicao": "céu limpo",
  "recomendacao": "Está muito quente! Beba bastante água e faça pausas curtas nos estudos.",
  "data": "2026-05-25T00:00:00.000Z"
}
```

Possíveis erros:

```json
{
  "erro": "Token não fornecido."
}
```

```json
{
  "erro": "Cidade não encontrada."
}
```

```json
{
  "erro": "Erro interno ou na API externa."
}
```

---

### Salvar histórico de consulta

```http
POST /historico
```

Essa rota salva manualmente uma consulta climática no histórico do usuário autenticado.

Essa rota exige autenticação. O token JWT deve ser enviado no cabeçalho da requisição:

```http
Authorization: Bearer token_jwt_aqui
```

Exemplo de body:

```json
{
  "cidade": "Ribeirão Preto",
  "temperatura": 32,
  "condicao": "Ensolarado",
  "recomendacao": "Beba água e ligue o ventilador para estudar."
}
```

Resposta esperada:

```json
{
  "mensagem": "Histórico salvo com sucesso!",
  "historico": {
    "id": 1,
    "cidade": "Ribeirão Preto",
    "temperatura": 32,
    "condicao": "Ensolarado",
    "recomendacao": "Beba água e ligue o ventilador para estudar.",
    "data": "2026-05-25T00:00:00.000Z"
  }
}
```

Possíveis erros:

```json
{
  "erro": "Token não fornecido."
}
```

```json
{
  "erro": "Erro interno ao salvar histórico."
}
```

---

### Listar histórico

```http
GET /historico
```

Essa rota retorna o histórico de consultas climáticas salvas pelo usuário autenticado.

Essa rota exige autenticação. O token JWT deve ser enviado no cabeçalho da requisição:

```http
Authorization: Bearer token_jwt_aqui
```

Resposta esperada:

```json
{
  "historico": [
    {
      "id": 1,
      "cidade": "Ribeirão Preto",
      "temperatura": 32,
      "condicao": "Ensolarado",
      "recomendacao": "Beba água e ligue o ventilador para estudar.",
      "data": "2026-05-25T00:00:00.000Z"
    }
  ]
}
```

Possíveis erros:

```json
{
  "erro": "Token não fornecido."
}
```

```json
{
  "erro": "Erro interno ao listar histórico."
}
```

## Autenticação

O projeto utiliza autenticação com JWT.

Fluxo básico:

1. O usuário realiza o cadastro em `/register`.
2. O usuário faz login em `/login` com e-mail e senha.
3. A API retorna um token JWT.
4. O token deve ser utilizado para acessar rotas protegidas.

As senhas são armazenadas de forma criptografada, utilizando Bcrypt.

Rotas protegidas:

- `GET /clima/{cidade}`
- `POST /historico`
- `GET /historico`

Para acessar as rotas protegidas, é necessário enviar o token no cabeçalho da requisição:

```http
Authorization: Bearer token_jwt_aqui
```

## API externa

O projeto consome dados da API OpenWeather para obter informações climáticas de uma cidade.

Com base na temperatura retornada, o sistema gera uma recomendação de estudo.

Exemplos de recomendações:

- clima muito quente: recomendação para beber bastante água e fazer pausas curtas nos estudos;
- clima agradável: recomendação para manter o foco e bater as metas do dia;
- clima frio: recomendação para estudar em um ambiente confortável.

## Frontend

O projeto possui uma interface web simples integrada ao backend.

A página permite:

- criar conta;
- fazer login;
- consultar o clima de uma cidade;
- exibir temperatura, condição climática e recomendação;
- visualizar o histórico de consultas;
- alterar o visual da página conforme a temperatura retornada.

Exemplos de comportamento visual:

- temperaturas altas podem alterar o fundo para tons mais quentes;
- temperaturas baixas podem alterar o fundo para tons mais frios;
- temperaturas agradáveis podem alterar o fundo para tons verdes.

## Documentação da API

A documentação da API foi desenvolvida no APIDog.

Ela contém:

- endpoints;
- métodos HTTP;
- exemplos de requisição;
- exemplos de resposta;
- schemas;
- autenticação;
- possíveis respostas de erro.

## Estrutura básica do projeto

```txt
Climate-api/
│
├── prisma/
│   ├── migrations/
│   ├── dev.db
│   └── schema.prisma
│
├── public/
│   └── index.html
│
├── src/
│   ├── schemas/
│   │   └── userSchema.ts
│   ├── auth.ts
│   ├── prismaClient.ts
│   ├── routes.ts
│   └── server.ts
│
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
├── README.md
└── tsconfig.json
```

## Observações importantes

O arquivo `.env` não deve ser enviado para o GitHub, pois contém informações sensíveis, como a chave da API externa.

O arquivo `.env.example` deve ser enviado para o GitHub apenas como modelo para configuração do ambiente.

O banco de dados local `dev.db` não deve ser versionado como parte das alterações locais de teste.

Caso ocorram alterações no `schema.prisma`, é necessário rodar novamente:

```bash
npx prisma migrate dev
```

E depois:

```bash
npx prisma generate
```

## Integrantes

- Isabela Souza Oliveira
- Gabriel Affonso Lorenz Barboza
- Lelio Carvalho Soares Neto

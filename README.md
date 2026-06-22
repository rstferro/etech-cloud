# E-Tech Cloud ⚡

[![CI](https://github.com/rstferro/etech-cloud/actions/workflows/ci.yml/badge.svg)](https://github.com/rstferro/etech-cloud/actions/workflows/ci.yml)

SaaS de **PDV + estoque** e **gestão de ordens de serviço** (assistência técnica),
com tema cyberpunk/dark. Versão web do ecossistema E-Tech, originalmente feito em
C (PDV) e Python/PyQt6 (O.S.) para uma loja de tecnologia em Pelotas/RS.

> 🔗 **Demo ao vivo:** **https://etech-cloud.vercel.app** &nbsp;·&nbsp; entre com `admin@etech.local` / `admin123`

> 🧪 Projeto de portfólio full-stack. Um **case study** detalhado virá em breve.

## ✨ Funcionalidades
- **Dashboard** com métricas e gráficos (Recharts): receita, OS por status, estoque.
- **CRUD de produtos/estoque** com geração de SKU e alerta de estoque baixo.
- **Kanban de Ordens de Serviço** com drag-and-drop (@dnd-kit).
- **Laudo técnico com IA** (Claude) — sugere o diagnóstico a partir do problema.
- **Autenticação** (Auth.js v5) com papéis (admin / funcionário).

## 🧰 Stack
Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 ·
Prisma 7 + libSQL/Turso · Auth.js v5 · Zod · Recharts · @dnd-kit ·
Anthropic SDK (Claude) · Vitest. Deploy na Vercel.

## 📚 Material de estudo
Quer entender as tecnologias usadas? Veja [`docs/estudo/`](docs/estudo/README.md)
(curso em Markdown ancorado no código) ou abra [`docs/estudo.html`](docs/estudo.html)
no navegador (guia interativo, funciona offline).

---

## 🚀 Como rodar

### Pré-requisitos
- **Node.js 20+** (o Next 16 exige). Verifique com `node -v`.
- **Git**.

> ⚠️ **Não copie a pasta `node_modules` entre sistemas operacionais** — rode
> `npm install` em cada máquina (o `@libsql/client` usa binários nativos por SO/arquitetura).

### 🪟 Windows (PowerShell)
```powershell
git clone https://github.com/rstferro/etech-cloud.git
cd etech-cloud

Copy-Item .env.example .env   # cria o .env
npx auth secret               # gera o AUTH_SECRET dentro do .env

npm install
npx prisma generate           # gera o client do Prisma (src/generated)
npx prisma migrate dev        # cria o dev.db + aplica as migrations
npm run db:seed               # popula dados de demonstração

npm run dev                   # http://localhost:3000
```
> O `@libsql/client` baixa binário pré-compilado no Windows — sem necessidade de
> ferramentas de build na maioria dos casos.

### 🍎 macOS (zsh/bash)
```bash
git clone https://github.com/rstferro/etech-cloud.git
cd etech-cloud

cp .env.example .env          # cria o .env
npx auth secret               # gera o AUTH_SECRET dentro do .env

npm install
npx prisma generate           # gera o client do Prisma (src/generated)
npx prisma migrate dev        # cria o dev.db + aplica as migrations
npm run db:seed               # popula dados de demonstração

npm run dev                   # http://localhost:3000
```
> O `@libsql/client` traz binário pré-compilado pra macOS (Intel e Apple Silicon)
> — normalmente sem dor de compilação.

### 🐧 Linux (bash)
```bash
git clone https://github.com/rstferro/etech-cloud.git
cd etech-cloud

cp .env.example .env          # cria o .env
npx auth secret               # gera o AUTH_SECRET dentro do .env

npm install
npx prisma generate           # gera o client do Prisma (src/generated)
npx prisma migrate dev        # cria o dev.db + aplica as migrations
npm run db:seed               # popula dados de demonstração

npm run dev                   # http://localhost:3000
```
> O `@libsql/client` traz binário pré-compilado pra Linux x64/arm64 — normalmente
> sem necessidade de toolchain de build.

> 💡 Por que os passos do Prisma? O banco (`dev.db`), o client gerado
> (`src/generated`) e o `.env` **não vão pro git** — cada máquina monta o seu.

## 🔐 Contas de demonstração (após o seed)
| Papel | E-mail | Senha |
|-------|--------|-------|
| Admin | `admin@etech.local` | `admin123` |
| Funcionário | `funcionario@etech.local` | `func123` |

## 🤖 IA (laudo técnico)
O botão **"✨ Sugerir com IA"** na Ordem de Serviço usa o **Claude**. Por padrão o
`.env.example` vem com `LAUDO_DEMO="true"`, que gera o laudo **localmente, sem
custo** (ótimo pra testar e pro deploy). Para usar a IA de verdade, defina sua
`ANTHROPIC_API_KEY` no `.env` e troque `LAUDO_DEMO` para `"false"`.

## 🧪 Testes
Testes unitários das funções core (geração de SKU e validações Zod) com **Vitest**:
```bash
npm test          # roda a suíte uma vez
npm run test:watch # modo watch
```
Rodam também no **CI** (GitHub Actions) a cada push/PR: lint → testes → build.

## 🚀 Deploy
Em produção na **Vercel** com banco **Turso** (libSQL). Passo a passo completo em
[`docs/deploy.md`](docs/deploy.md).

## 📜 Scripts
| Comando | O que faz |
|---------|-----------|
| `npm run dev` | servidor de desenvolvimento |
| `npm run build` | build de produção (checa TypeScript) |
| `npm run start` | roda o build de produção |
| `npm run lint` | ESLint |
| `npm test` | testes unitários (Vitest) |
| `npm run db:push` | aplica o schema no banco |
| `npm run db:seed` | popula dados de demonstração |
| `npm run db:studio` | UI pra ver/editar o banco (Prisma Studio) |

## 🗂️ Estrutura
```
src/
├─ app/            # rotas (App Router) — (auth)/login, (dashboard)/...
├─ components/     # UI por domínio (ui, dashboard, produtos, ordens)
├─ lib/
│  ├─ db/          # camada de dados (queries por domínio)
│  ├─ auth/        # config do Auth.js
│  ├─ ai/          # laudo com Claude
│  └─ validations/ # schemas Zod
└─ types/          # tipos compartilhados
```

---
Feito com 💜 em Pelotas/RS.

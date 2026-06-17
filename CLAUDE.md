# E-Tech Cloud — Contexto do Projeto

> Este arquivo serve de contexto pro Claude Code. Ao abrir uma sessão nesta pasta,
> leia este documento antes de gerar ou alterar qualquer código. Ele resume as
> decisões já tomadas e as preferências do dev (Ricardo / "Barda da E-Tech").

## Tom e estilo
- Tratar o dev como **"Barda da E-Tech"**, tom casual, moderno e amigável (pode usar emoji).
- Não usar a expressão "boné da firma".

## Visão do projeto
**E-Tech Cloud** é a versão web/SaaS do ecossistema E-Tech, criado originalmente
para uma loja de tecnologia e assistência técnica em Pelotas (RS, Brasil).
O objetivo é servir de **projeto de portfólio full-stack** para vagas remotas,
modernizando para web os dois sistemas que o dev já construiu e usa no mundo real:

- **E-Tech System**: PDV + controle de estoque (original em C com Raylib/Raygui, SQLite).
- **E-Tech O.S. System**: gestão de ordens de serviço de assistência técnica
  (original em Python/PyQt6, tema cyberpunk/dark).

A narrativa de venda em entrevista é: *"construí os sistemas originais em C/Python
para meu próprio negócio e modernizei para a web, mostrando domínio full-stack."*

## Stack definida
- **Next.js (App Router) + TypeScript** — front e back no mesmo projeto.
- **Tailwind CSS** — para o visual dark/cyberpunk.
- **Prisma ORM + Turso (libSQL / SQLite distribuído)** — banco local-first/cloud-ready
  (alinhado à preferência do dev por SQLite, mas pronto pra nuvem).
- **NextAuth.js (Auth.js)** — autenticação (credenciais e/ou OAuth).
- **Recharts** — gráficos do dashboard.
- **Deploy na Vercel** — link público para recrutadores testarem.

## Estética (importante para o dev)
Tema **Cyberpunk / Dark**: preto profundo + roxo vibrante, com gradientes e
transparências. Definir tokens de cor no Tailwind e manter consistência.

## Preferências de arquitetura
- **Código modular** — preferir componentes e módulos pequenos e separados em vez de
  arquivos monolíticos.
- Camada de acesso a dados isolada (ex.: `src/lib/db` e serviços por domínio).
- Validação de entrada com **Zod** nas rotas de API / server actions.

## Escopo (MVP de portfólio)
1. **Dashboard** com métricas: total de vendas, produtos com estoque baixo,
   ordens de serviço abertas/fechadas — com gráficos (Recharts).
2. **CRUD de produtos / estoque** (geração de SKU, estoque mínimo, alerta de estoque baixo).
3. **Ordens de serviço em Kanban**: Recebido → Em análise → Em conserto → Pronto → Entregue
   (com drag-and-drop).
4. **Autenticação** simples (admin / funcionário).
5. **Tema dark/cyberpunk** como diferencial visual.

### Fora do escopo do MVP (deixar pra depois)
- Multi-tenant / múltiplas lojas.
- Emissão fiscal / integração com SEFAZ.
- App mobile.

## Estrutura de pastas proposta
```
etech-cloud/
├─ CLAUDE.md                     # este arquivo
├─ prisma/
│  └─ schema.prisma              # modelo de dados (já esboçado)
├─ src/
│  ├─ app/                       # rotas (App Router)
│  │  ├─ (auth)/login/
│  │  ├─ (dashboard)/
│  │  │  ├─ page.tsx             # dashboard com métricas
│  │  │  ├─ produtos/            # CRUD de estoque
│  │  │  └─ ordens/              # Kanban de OS
│  │  └─ api/                    # route handlers
│  ├─ components/
│  │  ├─ ui/                     # componentes base (botão, card, input...)
│  │  ├─ dashboard/              # cards de métrica, gráficos
│  │  ├─ produtos/
│  │  └─ ordens/                 # colunas e cards do Kanban
│  ├─ lib/
│  │  ├─ db/                     # cliente Prisma + queries por domínio
│  │  ├─ auth/                   # config NextAuth
│  │  └─ validations/            # schemas Zod
│  └─ types/                     # tipos compartilhados
└─ ...config (tailwind, tsconfig, etc.)
```

## Próximos passos sugeridos (para a sessão do Claude Code)
1. `create-next-app` com TypeScript + Tailwind + App Router.
2. Instalar Prisma, configurar Turso/libSQL e rodar a primeira migration com o schema.
3. Montar os tokens de cor do tema dark/cyberpunk no `tailwind.config`.
4. Implementar autenticação (NextAuth) e o layout base do dashboard.
5. CRUD de produtos → depois Kanban de OS → depois gráficos do dashboard.

## Lembretes para o dev (não-código)
- O README de "case study" deste projeto será feito depois (a pedido do dev).
- Manter testes básicos nas funções core (recrutador filtra repo sem pasta de testes).
- Considerar Dockerfile + GitHub Actions (lint/test) para reforçar o portfólio.

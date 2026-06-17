# 📚 Material de estudo — E-Tech Cloud

Guia de estudos **ancorado no código real deste projeto**. A ideia não é decorar
sintaxe solta de tutorial, e sim entender cada tecnologia olhando para um arquivo
que **já está rodando** no E-Tech Cloud.

> Feito sob medida pro Barda da E-Tech voltar a ficar afiado — com foco extra em
> TypeScript, que era o ponto mais enferrujado.

## Como usar

1. Leia na ordem dos números (cada módulo assume o anterior).
2. Sempre que ver `arquivo.ts`, **abra o arquivo de verdade** no editor e compare.
3. No fim de cada módulo tem um bloco **🧪 Pratique** — mexa no código e veja o que acontece.

Tem também um **guia interativo** mais ilustrado: abra [`docs/estudo.html`](../estudo.html)
no navegador (é um arquivo único, funciona offline).

## Índice

| # | Módulo | O que você vai entender |
|---|--------|--------------------------|
| 00 | [Visão geral & arquitetura](00-visao-geral.md) | Como as peças se conectam (o diagrama da "anatomia de uma ação") |
| 01 | [TypeScript do zero ao projeto](01-typescript.md) | **Trilha completa** — tipos, unions, generics, utility types |
| 02 | [Next.js App Router](02-nextjs-app-router.md) | Server vs Client Components, rotas, layouts, route groups |
| 03 | [Server Actions & Zod](03-server-actions-e-zod.md) | Mutations sem API REST + validação type-safe |
| 04 | [Prisma 7](04-prisma.md) | Schema, migrations, client gerado, queries |
| 05 | [Autenticação (Auth.js v5)](05-auth.md) | Sessão, JWT, proteção de rotas, RBAC |
| 06 | [Tailwind CSS v4](06-tailwind-v4.md) | `@theme`, tokens de cor, utilities |
| 07 | [React 19 — hooks novos](07-react19-hooks.md) | `useActionState`, `useTransition`, `use client` |
| 08 | [@dnd-kit & Recharts](08-dnd-kit-e-recharts.md) | Drag-and-drop e gráficos |

## Mapa rápido do projeto

```
src/
├─ app/                      # rotas (App Router)
│  ├─ (auth)/login/          # tela de login
│  ├─ (dashboard)/           # área logada (layout protegido)
│  │  ├─ dashboard/          # métricas + gráficos
│  │  ├─ produtos/           # CRUD de estoque
│  │  └─ ordens/             # Kanban de OS
│  └─ api/auth/[...nextauth] # rota do Auth.js
├─ components/               # UI por domínio (ui/dashboard/produtos/ordens)
├─ lib/
│  ├─ db/                    # camada de dados (queries por domínio)
│  ├─ auth/                  # config do NextAuth
│  └─ validations/           # schemas Zod
└─ generated/prisma/         # client do Prisma (gerado, não commitado)
```

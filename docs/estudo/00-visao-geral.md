# 00 · Visão geral & arquitetura

Antes de mergulhar em cada tecnologia, entenda **como tudo se conecta**. Esse é o
modelo mental mais importante do projeto.

## A "anatomia de uma ação"

Quando você cria um produto, abre uma OS ou arrasta um card no Kanban, os dados
percorrem **sempre as mesmas camadas**:

```
🖥️  Client Component          ("use client")
        │   formulário / Kanban com @dnd-kit
        ▼
⚡  Server Action             ("use server" — roda NO servidor)
        │   src/app/(dashboard)/.../actions.ts
        ▼
🛡️  auth()                    a sessão é válida?  (guarda)
        ▼
✅  Validação Zod             schema.safeParse()  (guarda)
        ▼
🗄️  Camada de dados           src/lib/db/*  (queries por domínio)
        ▼
🔷  Prisma → SQLite           ORM type-safe → dev.db
        │
        └──▶ revalidatePath()  ⇒ Server Component re-renderiza ⇒ UI atualiza ✨
```

**Por que isso é bom?**
- Cada camada tem **uma responsabilidade** (separation of concerns).
- A validação e a autenticação são **guardas** que tudo precisa atravessar.
- Não existe "API REST" no meio: o Client chama a Server Action **direto**, como
  se fosse uma função — o Next cuida da ponte pela rede.

## As 3 grandes ideias do Next.js moderno

1. **Server Components por padrão** — a maioria dos componentes roda no servidor,
   busca dados direto do banco e manda só HTML pro navegador. Zero JavaScript
   extra. (ex.: [`dashboard/page.tsx`](../../src/app/(dashboard)/dashboard/page.tsx))

2. **Client Components quando precisa de interatividade** — clique, estado,
   drag-and-drop. Marcados com `"use client"` no topo.
   (ex.: [`kanban-board.tsx`](../../src/components/ordens/kanban-board.tsx))

3. **Server Actions** — funções `async` marcadas com `"use server"` que o cliente
   chama para **mudar dados** (criar/editar/excluir). Substituem o `fetch` + rota
   de API. (ex.: [`ordens/actions.ts`](../../src/app/(dashboard)/ordens/actions.ts))

## Onde cada coisa mora

| Camada | Pasta | Exemplo |
|--------|-------|---------|
| Rotas / páginas | `src/app/` | `produtos/page.tsx` |
| UI reutilizável | `src/components/` | `produtos/product-form.tsx` |
| Acesso a dados | `src/lib/db/` | `products.ts` |
| Validação | `src/lib/validations/` | `product.ts` |
| Auth | `src/lib/auth/` | `config.ts`, `index.ts` |
| Tipos compartilhados | `src/types/` | `next-auth.d.ts` |

## 🧪 Pratique
Abra [`src/app/(dashboard)/produtos/actions.ts`](../../src/app/(dashboard)/produtos/actions.ts)
e identifique no `createProductAction` cada uma das camadas do diagrama acima
(o `"use server"`, o `auth()`, o `safeParse`, a chamada ao `src/lib/db` e o
`revalidatePath`). Elas estão todas ali, em ~15 linhas.

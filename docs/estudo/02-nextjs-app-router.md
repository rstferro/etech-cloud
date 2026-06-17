# 02 · Next.js App Router

O Next.js é o framework full-stack por cima do React. Usamos o **App Router**
(pasta `src/app/`), onde **a estrutura de pastas = as rotas**.

## Roteamento por arquivos

| Arquivo | Vira |
|---------|------|
| `app/page.tsx` | `/` |
| `app/(dashboard)/dashboard/page.tsx` | `/dashboard` |
| `app/(dashboard)/produtos/page.tsx` | `/produtos` |
| `app/api/auth/[...nextauth]/route.ts` | `/api/auth/*` (catch-all) |

- `page.tsx` = a página daquela rota.
- `layout.tsx` = casca compartilhada por tudo abaixo (não re-renderiza ao navegar).
- `[colchetes]` = segmento dinâmico; `[...spread]` = catch-all.

## Route groups: `(parênteses)`

Pastas entre parênteses **organizam sem aparecer na URL**:

```
app/
├─ (auth)/login/page.tsx        → /login    (sem layout do dashboard)
└─ (dashboard)/
   ├─ layout.tsx                → casca de TODA área logada
   ├─ dashboard/page.tsx        → /dashboard
   ├─ produtos/page.tsx         → /produtos
   └─ ordens/page.tsx           → /ordens
```

Assim o **layout protegido** envolve só `(dashboard)`, e o `/login` fica de fora.

## Server Components (o padrão)

Por padrão, todo componente é **Server Component**: roda no servidor, pode ser
`async` e buscar dados **direto do banco**. O navegador recebe HTML pronto.

```tsx
// src/app/(dashboard)/produtos/page.tsx  — Server Component
export default async function ProdutosPage() {
  const products = await listProducts();          // query direta, sem fetch!
  return <ProductsManager products={products} />;  // passa pro client
}
```

Repare: **não tem `"use client"`**, a função é `async`, e ela chama o `lib/db`
sem nenhuma rota de API no meio. Isso só é possível porque roda no servidor.

## Client Components (`"use client"`)

Precisa de interatividade (estado, clique, efeitos, drag-and-drop)? Marque o topo
do arquivo com `"use client"`:

```tsx
"use client";
import { useState } from "react";

export function ProductsManager({ products }: { products: Product[] }) {
  const [dialog, setDialog] = useState<DialogState>(null); // estado = client
  // ...
}
```

> 🔑 Padrão de ouro do projeto: a **página** (server) busca os dados e passa via
> props para um **manager** (client) que cuida da interação. Você vê isso em
> produtos *e* ordens.

## Layout protegido (auth no servidor)

```tsx
// src/app/(dashboard)/layout.tsx
export default async function DashboardLayout({ children }) {
  const session = await auth();
  if (!session?.user) redirect("/login"); // checa ANTES de renderizar
  return <div className="flex"><Sidebar .../>{children}</div>;
}
```

A verificação acontece no servidor, antes de mandar qualquer HTML. Mais sobre
isso no [módulo 05](05-auth.md).

## `metadata` — SEO/título da aba

```tsx
export const metadata: Metadata = { title: "Produtos · E-Tech Cloud" };
```

## `revalidatePath` — atualizar a tela após mudar dados

Depois de uma Server Action mexer no banco, você avisa o Next quais rotas
"sujaram", e ele re-busca os Server Components:

```ts
revalidatePath("/produtos");
revalidatePath("/dashboard");
```

## 🧪 Pratique
Compare [`produtos/page.tsx`](../../src/app/(dashboard)/produtos/page.tsx) (server,
`async`, busca dados) com [`products-manager.tsx`](../../src/components/produtos/products-manager.tsx)
(`"use client"`, `useState`). Esse é o "sanduíche" server→client do projeto.

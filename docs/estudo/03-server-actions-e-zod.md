# 03 · Server Actions & Zod

## O que é uma Server Action

Uma função `async` que roda **no servidor** mas pode ser chamada **do cliente**
como se fosse local. Substitui o velho trio "criar rota de API + `fetch` + tratar
resposta". Marca-se com `"use server"`.

```ts
// src/app/(dashboard)/ordens/actions.ts
"use server";

export async function createOrderAction(_prev, formData: FormData) {
  const session = await auth();                       // 1. guarda: logado?
  if (!session?.user) return { ok: false, error: "Não autorizado." };

  const parsed = serviceOrderSchema.safeParse(        // 2. guarda: dados válidos?
    Object.fromEntries(formData),
  );
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message };
  }

  await createServiceOrder(parsed.data);              // 3. grava no banco
  revalidate();                                       // 4. atualiza a tela
  return { ok: true };
}
```

Toda action do projeto segue essa **mesma receita de 4 passos**: auth → validar →
gravar → revalidar. Consistência = previsibilidade.

## Como o formulário chama a action

No Client Component, você liga o `<form>` direto na action via `useActionState`:

```tsx
"use client";
const [state, formAction, pending] =
  useActionState(createOrderAction, undefined);

return (
  <form action={formAction}>
    <input name="customerName" />
    <button disabled={pending}>{pending ? "Salvando..." : "Abrir OS"}</button>
  </form>
);
```

- `formAction` → vai no `action={}` do form.
- `state` → o que a action retornou (`{ ok }` ou `{ error }`).
- `pending` → `true` enquanto roda (pra desabilitar o botão). Sem `useState`! ✨

## Por que `FormData` e `Object.fromEntries`

O form manda os campos como `FormData`. `Object.fromEntries(formData)` vira um
objeto comum `{ customerName: "...", price: "150" }` — pronto pro Zod validar.

> ⚠️ Tudo que vem de `FormData` é **string** (até números). Por isso o Zod usa
> `z.coerce.number()` — ele converte `"150"` em `150`.

## Zod — validação que vira tipo

Zod valida dados em **runtime** (quando o código roda) e, de quebra, gera o
**tipo TypeScript**. Uma fonte da verdade pros dois mundos.

```ts
// src/lib/validations/service-order.ts
export const serviceOrderSchema = z.object({
  customerName: z.string().trim().min(2, "Nome do cliente é obrigatório"),
  deviceType:   z.string().trim().min(2, "Tipo de aparelho é obrigatório"),
  problem:      z.string().trim().min(3, "Descreva o problema relatado"),
  price:        optionalPrice,   // veja abaixo
});

export type ServiceOrderInput = z.infer<typeof serviceOrderSchema>;
```

### `safeParse` vs `parse`
- `safeParse(data)` → retorna `{ success: true, data }` **ou** `{ success: false, error }`.
  Não quebra. É o que usamos (dá pra devolver msg de erro bonita).
- `parse(data)` → retorna os dados ou **lança exceção**.

### `preprocess` — tratar antes de validar
```ts
const optionalPrice = z.preprocess(
  (v) => (v === "" || v == null ? undefined : v),  // "" vira undefined
  z.coerce.number().min(0).optional(),             // depois coage pra número
);
```
Útil pra campos opcionais que chegam como `""` do formulário.

### `z.enum` — só valores permitidos
```ts
export const moveSchema = z.object({
  status: z.enum(SERVICE_STATUSES),  // só os 5 status do Kanban
  orderedIds: z.array(z.string()).min(1),
});
```

## O fluxo completo (resumo)

```
<form action={formAction}>  ──▶  Server Action  ──▶  Zod.safeParse
                                      │                    │ válido?
                                      │                    ▼
                                      └──────────────▶  lib/db ▶ Prisma ▶ SQLite
                                                           │
                                              revalidatePath ▶ tela atualiza
```

## 🧪 Pratique
Em [`ordens/actions.ts`](../../src/app/(dashboard)/ordens/actions.ts), troque um
`min(2)` por `min(50)` no schema, tente salvar uma OS no app e veja a mensagem de
erro do Zod aparecer no formulário (vinda de `state.error`).

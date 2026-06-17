# 01 · TypeScript — do zero ao projeto

> Trilha turbinada. TypeScript = JavaScript + **tipos**. Os tipos são checados
> quando você escreve/compila (não em produção), pegando bugs antes do usuário.
> Todo o exemplo aqui sai do código real do E-Tech Cloud.

## 1. Tipos básicos

```ts
let nome: string = "E-Tech";
let estoque: number = 12;
let ativo: boolean = true;
let nada: null = null;
let lista: string[] = ["a", "b"];        // array de strings
let tupla: [number, number] = [10, 20];  // tamanho/tipos fixos
```

Na prática você **quase nunca anota** quando o TS já consegue inferir:

```ts
const total = 25 * 3; // TS já sabe que é number — não precisa escrever ": number"
```

> 📌 Regra de ouro: **deixe o TS inferir** o que ele consegue; anote nas
> "fronteiras" (parâmetros de função, retornos públicos, props de componente).

## 2. `interface` vs `type`

Ambos descrevem o formato de um objeto. No projeto usamos `type` (mais flexível).

```ts
// objeto "Accent" só pode ser uma destas 4 strings (union de literais):
type Accent = "primary" | "warning" | "success" | "cyan";
```
*(real, de [`metric-card.tsx`](../../src/components/dashboard/metric-card.tsx))*

Diferença prática: `interface` é melhor pra contratos extensíveis (pode ser
reaberta/estendida); `type` faz tudo que interface faz **e mais** (unions,
interseções, tipos derivados). Para a maioria dos casos, escolha um e seja
consistente.

## 3. Union types (`|`) e narrowing

Union = "pode ser A **ou** B". O TS te obriga a tratar cada caso (**narrowing**).

```ts
type DialogState = null | { product?: Product };
```
*(real, de [`products-manager.tsx`](../../src/components/produtos/products-manager.tsx))*

`DialogState` é `null` (modal fechado) **ou** um objeto (modal aberto). Para usar
o objeto com segurança, você "estreita" o tipo:

```ts
if (dialog) {
  // aqui dentro o TS SABE que dialog não é null
  console.log(dialog.product);
}
```

Narrowing com `typeof` (real, de [`produtos/actions.ts`](../../src/app/(dashboard)/produtos/actions.ts)):

```ts
const id = formData.get("id"); // tipo: FormDataEntryValue | null
if (typeof id !== "string" || !id) {
  return { ok: false, error: "Produto inválido." };
}
// a partir daqui o TS garante: id é string
await updateProduct(id, parsed.data);
```

## 4. Optional (`?`), `??` e `||`

```ts
type Props = {
  hint?: string;        // "?" = pode não vir (string | undefined)
};

const nome = session?.user.name ?? "Barda"; // se for null/undefined, usa "Barda"
description: data.description || null;       // se for "" (falsy), vira null
```

- `?.` (optional chaining): acessa sem quebrar se o objeto for null/undefined.
- `??` (nullish coalescing): fallback **só** pra `null`/`undefined`.
- `||`: fallback pra **qualquer falsy** (`""`, `0`, `false`, null, undefined).

## 5. `Record<K, V>` — objeto com chaves tipadas

```ts
const accents: Record<Accent, string> = {
  primary: "text-primary-soft",
  warning: "text-warning",
  success: "text-success",
  cyan:    "text-cyan",
};
```
*(real, [`metric-card.tsx`](../../src/components/dashboard/metric-card.tsx))*

`Record<Accent, string>` = "um objeto cujas chaves são os valores de `Accent` e os
valores são `string`". Se você esquecer uma chave (ex.: `cyan`), o TS reclama. 🔒

## 6. Generics — tipos como "parâmetros"

Generic é um tipo que recebe **outro tipo** como argumento (`<T>`). Você já usa:

```ts
const [state, formAction, pending] =
  useActionState<ProductFormState, FormData>(action, undefined);
```
*(real, [`product-form.tsx`](../../src/components/produtos/product-form.tsx))*

Aqui `useActionState` é genérico: o **1º** tipo é o formato do estado retornado,
o **2º** é o que a action recebe. Outro exemplo seu, `Map` genérico:

```ts
const buckets = new Map<string, { label: string; total: number }>();
```
*(real, [`dashboard.ts`](../../src/lib/db/dashboard.ts))*

## 7. Utility types — o pulo do gato 🐈

São tipos prontos que **transformam** outros tipos. Os mais úteis:

| Utility | O que faz | Exemplo |
|---------|-----------|---------|
| `Partial<T>` | deixa tudo opcional | `Partial<Product>` |
| `Pick<T, K>` | só algumas chaves | `Pick<Product, "id" \| "name">` |
| `Omit<T, K>` | tudo menos algumas | `Omit<Product, "createdAt">` |
| `ReturnType<F>` | o tipo que a função retorna | veja abaixo |
| `Awaited<P>` | "desembrulha" uma Promise | veja abaixo |

### O exemplo mais avançado do seu projeto

```ts
export type ServiceOrderWithCustomer =
  Awaited<ReturnType<typeof listServiceOrders>>[number];
```
*(real, [`service-orders.ts`](../../src/lib/db/service-orders.ts))*

Lê-se de dentro pra fora:
1. `typeof listServiceOrders` → o **tipo da função**.
2. `ReturnType<...>` → o que ela retorna → `Promise<ServiceOrder[]>` (com customer).
3. `Awaited<...>` → desembrulha a Promise → `ServiceOrder[]`.
4. `[number]` → o tipo de **um item** do array → `ServiceOrder & { customer }`.

Resultado: um tipo que **se atualiza sozinho** se você mudar a query. Você nunca
precisa redigitar o formato à mão. Isso é TypeScript trabalhando pra você. ✨

## 8. `as const` e derivar union de um array

```ts
export const SERVICE_STATUSES = [
  "RECEBIDO", "EM_ANALISE", "EM_CONSERTO", "PRONTO", "ENTREGUE",
] as const;

export type ServiceStatusValue = (typeof SERVICE_STATUSES)[number];
// => "RECEBIDO" | "EM_ANALISE" | "EM_CONSERTO" | "PRONTO" | "ENTREGUE"
```
*(real, [`service-order.ts`](../../src/lib/validations/service-order.ts))*

`as const` congela o array (vira readonly de literais). Aí `[number]` extrai a
union de todos os valores. **Uma fonte da verdade**: muda o array, muda o tipo.

## 9. Type-only imports

```ts
import type { Product } from "@/generated/prisma/client";
```

`import type` importa **só o tipo** (some no build, não vira JS). Use sempre que
importar algo que serve apenas para tipagem.

## 10. `z.infer` — Zod gera o tipo pra você

```ts
export const productSchema = z.object({ /* ... */ });
export type ProductInput = z.infer<typeof productSchema>;
```
*(real, [`validations/product.ts`](../../src/lib/validations/product.ts))*

Você descreve o schema **uma vez** e o tipo TS sai de graça. Validação em runtime
+ tipo em build, sempre em sincronia. Detalhes no [módulo 03](03-server-actions-e-zod.md).

## 11. Casts (`as`) — use com parcimônia

```ts
token.id = user.id;
session.user.id = token.id as string;
```

`as` diz "confia em mim, TS, isso é uma string". Útil quando você sabe mais que o
compilador (ex.: tipos do JWT do Auth.js), mas **evite** abusar — cada `as` é um
lugar onde o TS para de te proteger.

## 🧪 Pratique
1. Em [`service-orders.ts`](../../src/lib/db/service-orders.ts), passe o mouse sobre
   `ServiceOrderWithCustomer` no editor e veja o tipo expandido.
2. Adicione um status novo em `SERVICE_STATUSES` e veja o `ServiceStatusValue`
   mudar sozinho (e o `moveSchema` aceitar o novo valor).
3. Tente passar um número onde se espera `string` numa função do `lib/db` — leia
   o erro do TS. Ele é seu amigo. 💜

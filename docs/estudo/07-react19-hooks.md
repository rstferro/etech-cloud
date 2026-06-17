# 07 · React 19 — hooks que o projeto usa

React = biblioteca de UI baseada em **componentes** (funções que retornam JSX) e
**estado** (dados que, ao mudar, re-renderizam a tela). Aqui vão os hooks que
aparecem no E-Tech Cloud.

## `useState` — estado local

```tsx
const [dialog, setDialog] = useState<DialogState>(null);
setDialog({ product: p });  // muda o estado → componente re-renderiza
```
Retorna `[valor, função que atualiza]`. Mudou o valor → React redesenha.

## `useActionState` — formulários com Server Action (novo no 19)

Conecta um `<form>` a uma Server Action e te dá o resultado + o "carregando":

```tsx
const [state, formAction, pending] = useActionState(createProductAction, undefined);

<form action={formAction}>
  ...
  {state?.error && <p className="text-danger">{state.error}</p>}
  <button disabled={pending}>{pending ? "Salvando..." : "Criar"}</button>
</form>
```

- `state` → o que a action retornou (`{ ok }` / `{ error }`).
- `formAction` → vai no `action={}`.
- `pending` → `true` enquanto roda. **Sem precisar de `useState` pra loading.** ✨

## `useTransition` — ações sem travar a UI

Pra mutations que não são via `<form>` (ex.: excluir ao clicar, ou persistir o
drag-and-drop), marca a atualização como "não urgente":

```tsx
const [isPending, startTransition] = useTransition();

function handleDelete(id: string) {
  startTransition(async () => {
    await deleteProductAction(id);
    setConfirmingId(null);
  });
}
```

No Kanban, é o que persiste o movimento sem congelar o arraste:
```tsx
startTransition(() => { moveOrderAction(activeId, overContainer, orderedIds); });
```

## `useEffect` — sincronizar com algo externo

Roda **depois** do render, quando as dependências mudam:

```tsx
// fecha o modal quando a action deu certo
useEffect(() => { if (state?.ok) onDone(); }, [state, onDone]);

// mantém o board em sincronia com os dados do servidor
useEffect(() => { setColumns(groupByStatus(orders)); }, [orders]);
```
O array `[...]` no fim são as **dependências**: o efeito só roda quando elas mudam.

## `"use client"` — a fronteira

Hooks de estado/efeito **só funcionam em Client Components**. Por isso todo arquivo
que usa `useState`/`useEffect`/`useTransition` começa com `"use client"`. Server
Components não têm estado (eles só renderizam dados).

## Padrão de props tipadas

```tsx
export function MetricCard({ label, value, accent = "primary" }: {
  label: string;
  value: string | number;   // union: aceita texto OU número
  accent?: Accent;          // opcional, default "primary"
}) { /* ... */ }
```

## 🧪 Pratique
Em [`product-form.tsx`](../../src/components/produtos/product-form.tsx), siga o
caminho do `useActionState`: onde `pending` desabilita o botão, onde `state.error`
aparece, e o `useEffect` que fecha o modal no sucesso.

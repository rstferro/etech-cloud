# 08 · @dnd-kit & Recharts

Duas bibliotecas que dão o "uau" no portfólio: **drag-and-drop** (Kanban) e
**gráficos** (dashboard).

---

## @dnd-kit — o Kanban arrastável

Três pacotes: `@dnd-kit/core` (motor), `@dnd-kit/sortable` (listas ordenáveis),
`@dnd-kit/utilities` (helpers de CSS).

### As 3 peças

```
DndContext         → o "cérebro": sensores + eventos de arraste
  └─ KanbanColumn  → useDroppable (área que RECEBE cards) + SortableContext
       └─ OrderCard → useSortable (item que pode SER arrastado)
```

### `DndContext` — o motor
```tsx
<DndContext
  sensors={sensors}                 // mouse / touch / teclado (acessível!)
  collisionDetection={closestCorners}
  onDragStart={...} onDragOver={...} onDragEnd={...}
>
```

- **`onDragOver`** → move o card entre colunas **em tempo real** (update otimista:
  a tela responde na hora, antes de gravar).
- **`onDragEnd`** → finaliza a ordem e **persiste** via `moveOrderAction`
  (dentro de `startTransition`).

### Sensores (UX + acessibilidade)
```tsx
useSensor(PointerSensor, { activationConstraint: { distance: 6 } }), // arrasta só após 6px
useSensor(TouchSensor,   { activationConstraint: { delay: 150, tolerance: 8 } }),
useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
```
O `distance: 6` é o truque que permite **clicar** o card (abrir edição) sem
disparar arraste sem querer.

### Update otimista + persistência
A tela atualiza imediatamente (estado local `columns`), e o banco é atualizado em
segundo plano. Se a página recarregar, o `useEffect([orders])` re-sincroniza com a
verdade do servidor. É o que faz o Kanban parecer **instantâneo**.

---

## Recharts — os gráficos

Componível: você monta o gráfico com componentes (`<AreaChart>`, `<Bar>`, `<Pie>`).
Usamos a **v3** (a v2 está deprecada).

### Sempre client + ResponsiveContainer
```tsx
"use client";
<ResponsiveContainer width="100%" height="100%">
  <AreaChart data={data}>...</AreaChart>
</ResponsiveContainer>
```
O `ResponsiveContainer` precisa de um pai com **altura definida** — por isso o
`ChartCard` envolve tudo num `<div className="h-64">`.

### Os 3 gráficos do projeto
| Componente | Tipo | Dado (de `lib/db/dashboard.ts`) |
|------------|------|----------------------------------|
| `sales-area-chart` | área | `getSalesTrend()` — receita 14 dias |
| `orders-status-chart` | donut | `getOrdersByStatus()` — OS por status |
| `stock-bar-chart` | barras | `getStockByProduct()` — estoque (low destacado) |

### Cores por item (`<Cell>`)
```tsx
<Bar dataKey="stock">
  {data.map((d) => <Cell key={d.name} fill={d.low ? "#f59e0b" : "#8c5aff"} />)}
</Bar>
```
Cada barra ganha cor própria: amarelo se estoque baixo, roxo se ok.

### ⚠️ Pegadinha do Recharts v3 + TypeScript
O `formatter` do `<Tooltip>` tipa o valor como `ValueType | undefined`. **Não**
anote `(v: number)` — use `(value) => ...` e converta com `Number(value)`:
```tsx
formatter={(value) => [brl.format(Number(value)), "Vendas"]}
```

## 🧪 Pratique
No app, arraste um card no Kanban e **recarregue a página**: ele continua onde você
soltou (persistência via `$transaction`). Depois passe o mouse sobre as barras do
dashboard e veja o tooltip com o aviso de estoque baixo.

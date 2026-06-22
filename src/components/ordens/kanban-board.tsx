"use client";

import { useState, useTransition } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import {
  SERVICE_STATUSES,
  type ServiceStatusValue,
} from "@/lib/validations/service-order";
import type { ServiceOrderWithCustomer } from "@/lib/db/service-orders";
import { moveOrderAction } from "@/app/(dashboard)/ordens/actions";
import { KanbanColumn, type ColumnMeta } from "./kanban-column";
import { OrderCard } from "./order-card";

const COLUMNS: ColumnMeta[] = [
  { status: "RECEBIDO", label: "Recebido", accent: "bg-cyan" },
  { status: "EM_ANALISE", label: "Em análise", accent: "bg-primary-soft" },
  { status: "EM_CONSERTO", label: "Em conserto", accent: "bg-warning" },
  { status: "PRONTO", label: "Pronto", accent: "bg-success" },
  { status: "ENTREGUE", label: "Entregue", accent: "bg-muted-foreground" },
];

type Columns = Record<string, ServiceOrderWithCustomer[]>;

function groupByStatus(orders: ServiceOrderWithCustomer[]): Columns {
  const cols: Columns = {};
  for (const s of SERVICE_STATUSES) cols[s] = [];
  for (const o of orders) (cols[o.status] ??= []).push(o);
  for (const s of SERVICE_STATUSES) cols[s].sort((a, b) => a.position - b.position);
  return cols;
}

export function KanbanBoard({
  orders,
  onEdit,
}: {
  orders: ServiceOrderWithCustomer[];
  onEdit: (order: ServiceOrderWithCustomer) => void;
}) {
  const [columns, setColumns] = useState<Columns>(() => groupByStatus(orders));
  const [activeId, setActiveId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  // mantém o board em sincronia com o servidor (após create/edit/delete/revalidate).
  // Ajuste de state durante o render (padrão React) em vez de useEffect: quando a
  // prop `orders` muda de referência, reagrupa as colunas na hora.
  const [prevOrders, setPrevOrders] = useState(orders);
  if (orders !== prevOrders) {
    setPrevOrders(orders);
    setColumns(groupByStatus(orders));
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 150, tolerance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function findContainer(id: string): string | undefined {
    if (id in columns) return id;
    return SERVICE_STATUSES.find((s) => columns[s].some((o) => o.id === id));
  }

  const activeOrder = activeId
    ? Object.values(columns)
        .flat()
        .find((o) => o.id === activeId) ?? null
    : null;

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  // move o card entre colunas em tempo real (feedback visual suave)
  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;
    const activeId = String(active.id);
    const overId = String(over.id);
    const activeContainer = findContainer(activeId);
    const overContainer = findContainer(overId);
    if (!activeContainer || !overContainer || activeContainer === overContainer)
      return;

    setColumns((prev) => {
      const activeItems = prev[activeContainer];
      const overItems = prev[overContainer];
      const activeIndex = activeItems.findIndex((o) => o.id === activeId);
      if (activeIndex < 0) return prev;
      const moved = activeItems[activeIndex];

      let overIndex: number;
      if (overId in prev) {
        overIndex = overItems.length;
      } else {
        const i = overItems.findIndex((o) => o.id === overId);
        overIndex = i < 0 ? overItems.length : i;
      }

      return {
        ...prev,
        [activeContainer]: activeItems.filter((o) => o.id !== activeId),
        [overContainer]: [
          ...overItems.slice(0, overIndex),
          { ...moved, status: overContainer as ServiceStatusValue },
          ...overItems.slice(overIndex),
        ],
      };
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);
    const overContainer = findContainer(overId);
    const activeContainer = findContainer(activeId);
    if (!activeContainer || !overContainer) return;

    const items = columns[overContainer];
    const oldIndex = items.findIndex((o) => o.id === activeId);
    if (oldIndex < 0) return;

    let newIndex: number;
    if (overId in columns) {
      newIndex = items.length - 1;
    } else {
      const i = items.findIndex((o) => o.id === overId);
      newIndex = i < 0 ? items.length - 1 : i;
    }

    const reordered =
      oldIndex === newIndex ? items : arrayMove(items, oldIndex, newIndex);
    setColumns({ ...columns, [overContainer]: reordered });

    const orderedIds = reordered.map((o) => o.id);
    startTransition(() => {
      moveOrderAction(activeId, overContainer, orderedIds);
    });
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((meta) => (
          <KanbanColumn
            key={meta.status}
            meta={meta}
            orders={columns[meta.status] ?? []}
            onEdit={onEdit}
          />
        ))}
      </div>

      <DragOverlay>
        {activeOrder ? <OrderCard order={activeOrder} isOverlay /> : null}
      </DragOverlay>
    </DndContext>
  );
}

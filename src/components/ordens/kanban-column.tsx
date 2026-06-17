"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { ServiceOrderWithCustomer } from "@/lib/db/service-orders";
import { OrderCard } from "./order-card";

export type ColumnMeta = {
  status: string;
  label: string;
  /** classe Tailwind da barrinha de destaque no topo */
  accent: string;
};

export function KanbanColumn({
  meta,
  orders,
  onEdit,
}: {
  meta: ColumnMeta;
  orders: ServiceOrderWithCustomer[];
  onEdit: (order: ServiceOrderWithCustomer) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: meta.status });

  return (
    <div className="flex w-72 shrink-0 flex-col">
      <div className="mb-3 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${meta.accent}`} />
          <h2 className="text-sm font-semibold text-foreground">
            {meta.label}
          </h2>
        </div>
        <span className="rounded-full bg-surface-3 px-2 py-0.5 text-xs text-muted">
          {orders.length}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className={[
          "flex min-h-32 flex-1 flex-col gap-2 rounded-xl border p-2 transition",
          isOver
            ? "border-primary/60 bg-primary/5"
            : "border-border bg-surface/40",
        ].join(" ")}
      >
        <SortableContext
          items={orders.map((o) => o.id)}
          strategy={verticalListSortingStrategy}
        >
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} onEdit={onEdit} />
          ))}
        </SortableContext>

        {orders.length === 0 && (
          <p className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-border/60 py-6 text-center text-xs text-muted-foreground">
            Solte uma OS aqui
          </p>
        )}
      </div>
    </div>
  );
}

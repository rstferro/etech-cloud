"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { ServiceOrderWithCustomer } from "@/lib/db/service-orders";

const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function OrderCard({
  order,
  onEdit,
  isOverlay = false,
}: {
  order: ServiceOrderWithCustomer;
  onEdit?: (order: ServiceOrderWithCustomer) => void;
  isOverlay?: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: order.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onEdit?.(order)}
      className={[
        "group cursor-grab touch-none rounded-lg border border-border bg-surface-3 p-3 text-left shadow-sm transition",
        "hover:border-primary/60 active:cursor-grabbing",
        isDragging ? "opacity-40" : "",
        isOverlay ? "cursor-grabbing border-primary shadow-glow rotate-2" : "",
      ].join(" ")}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[11px] text-muted-foreground">
          {order.code}
        </span>
        {order.price != null && (
          <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[11px] font-medium text-primary-soft">
            {brl.format(order.price)}
          </span>
        )}
      </div>

      <p className="mt-1.5 text-sm font-semibold text-foreground">
        {order.deviceType}
        {order.deviceModel ? (
          <span className="font-normal text-muted"> · {order.deviceModel}</span>
        ) : null}
      </p>

      <p className="mt-0.5 truncate text-xs text-muted">
        👤 {order.customer.name}
      </p>

      <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
        {order.problem}
      </p>
    </article>
  );
}

"use client";

import { useState } from "react";
import type { ServiceOrderWithCustomer } from "@/lib/db/service-orders";
import { KanbanBoard } from "./kanban-board";
import { OrderForm } from "./order-form";

type CustomerBrief = { id: string; name: string; phone: string | null };
type DialogState = null | { order?: ServiceOrderWithCustomer };

export function OrdersManager({
  orders,
  customers,
  aiEnabled = false,
}: {
  orders: ServiceOrderWithCustomer[];
  customers: CustomerBrief[];
  aiEnabled?: boolean;
}) {
  const [dialog, setDialog] = useState<DialogState>(null);

  const abertas = orders.filter((o) => o.status !== "ENTREGUE").length;

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Ordens de Serviço
          </h1>
          <p className="mt-1 text-muted">
            {orders.length} OS no total · {abertas} em aberto · arraste os cards
            entre as colunas ✨
          </p>
        </div>
        <button
          onClick={() => setDialog({})}
          className="glow shrink-0 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary-strong"
        >
          + Nova OS
        </button>
      </div>

      <KanbanBoard orders={orders} onEdit={(o) => setDialog({ order: o })} />

      {dialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 p-4 backdrop-blur-sm"
          onClick={() => setDialog(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-surface-2 p-6 shadow-glow"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-5 text-lg font-semibold text-foreground">
              {dialog.order
                ? `Editar ${dialog.order.code}`
                : "Nova ordem de serviço"}
            </h2>
            <OrderForm
              order={dialog.order}
              customers={customers}
              aiEnabled={aiEnabled}
              onDone={() => setDialog(null)}
              onCancel={() => setDialog(null)}
            />
          </div>
        </div>
      )}
    </>
  );
}

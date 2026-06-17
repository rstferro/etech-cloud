"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import type { ServiceOrderWithCustomer } from "@/lib/db/service-orders";
import {
  createOrderAction,
  updateOrderAction,
  deleteOrderAction,
  type OrderFormState,
} from "@/app/(dashboard)/ordens/actions";

const inputClass =
  "rounded-lg border border-border bg-surface px-3 py-2 text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/30";
const labelClass = "text-sm font-medium text-muted";

type CustomerBrief = { id: string; name: string; phone: string | null };

export function OrderForm({
  order,
  customers,
  onDone,
  onCancel,
}: {
  order?: ServiceOrderWithCustomer;
  customers: CustomerBrief[];
  onDone: () => void;
  onCancel: () => void;
}) {
  const action = order ? updateOrderAction : createOrderAction;
  const [state, formAction, pending] = useActionState<OrderFormState, FormData>(
    action,
    undefined,
  );

  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [isDeleting, startDelete] = useTransition();

  useEffect(() => {
    if (state?.ok) onDone();
  }, [state, onDone]);

  function handleDelete() {
    if (!order) return;
    startDelete(async () => {
      await deleteOrderAction(order.id);
      onDone();
    });
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {order && <input type="hidden" name="id" value={order.id} />}

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="customerName" className={labelClass}>
            Cliente
          </label>
          <input
            id="customerName"
            name="customerName"
            required
            list="customers-list"
            defaultValue={order?.customer.name}
            placeholder="Ex.: João da Silva"
            className={inputClass}
          />
          <datalist id="customers-list">
            {customers.map((c) => (
              <option key={c.id} value={c.name} />
            ))}
          </datalist>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="customerPhone" className={labelClass}>
            Telefone
          </label>
          <input
            id="customerPhone"
            name="customerPhone"
            defaultValue={order?.customer.phone ?? ""}
            placeholder="(53) 99999-0000"
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="deviceType" className={labelClass}>
            Aparelho
          </label>
          <input
            id="deviceType"
            name="deviceType"
            required
            defaultValue={order?.deviceType}
            placeholder="Ex.: Celular"
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="deviceModel" className={labelClass}>
            Modelo
          </label>
          <input
            id="deviceModel"
            name="deviceModel"
            defaultValue={order?.deviceModel ?? ""}
            placeholder="Ex.: Galaxy S21"
            className={inputClass}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="problem" className={labelClass}>
          Problema relatado
        </label>
        <textarea
          id="problem"
          name="problem"
          rows={2}
          required
          defaultValue={order?.problem}
          placeholder="Ex.: Tela trincada, não dá imagem"
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="diagnosis" className={labelClass}>
          Laudo técnico
        </label>
        <textarea
          id="diagnosis"
          name="diagnosis"
          rows={2}
          defaultValue={order?.diagnosis ?? ""}
          placeholder="Opcional"
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="price" className={labelClass}>
          Valor do serviço (R$)
        </label>
        <input
          id="price"
          name="price"
          type="number"
          step="0.01"
          min="0"
          defaultValue={order?.price ?? ""}
          placeholder="Opcional"
          className={inputClass}
        />
      </div>

      {state?.error && (
        <p className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
          {state.error}
        </p>
      )}

      <div className="mt-2 flex items-center justify-between gap-3">
        <div>
          {order &&
            (confirmingDelete ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="rounded-lg bg-danger/15 px-3 py-2 text-sm font-medium text-danger transition hover:bg-danger/25 disabled:opacity-60"
                >
                  {isDeleting ? "..." : "Confirmar exclusão"}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmingDelete(false)}
                  className="text-sm text-muted transition hover:text-foreground"
                >
                  Não
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmingDelete(true)}
                className="rounded-lg border border-border-strong px-3 py-2 text-sm text-muted transition hover:border-danger/50 hover:text-danger"
              >
                Excluir
              </button>
            ))}
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-border-strong px-4 py-2 text-sm text-muted transition hover:text-foreground"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={pending}
            className="glow rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary-strong disabled:opacity-60"
          >
            {pending ? "Salvando..." : order ? "Salvar" : "Abrir OS"}
          </button>
        </div>
      </div>
    </form>
  );
}

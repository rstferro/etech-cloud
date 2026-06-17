"use client";

import {
  useActionState,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import type { ServiceOrderWithCustomer } from "@/lib/db/service-orders";
import {
  createOrderAction,
  updateOrderAction,
  deleteOrderAction,
  suggestLaudoAction,
  type OrderFormState,
} from "@/app/(dashboard)/ordens/actions";

const inputClass =
  "rounded-lg border border-border bg-surface px-3 py-2 text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/30";
const labelClass = "text-sm font-medium text-muted";

type CustomerBrief = { id: string; name: string; phone: string | null };

export function OrderForm({
  order,
  customers,
  aiEnabled = false,
  onDone,
  onCancel,
}: {
  order?: ServiceOrderWithCustomer;
  customers: CustomerBrief[];
  aiEnabled?: boolean;
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

  const formRef = useRef<HTMLFormElement>(null);
  const [diagnosis, setDiagnosis] = useState(order?.diagnosis ?? "");
  const [aiError, setAiError] = useState<string | null>(null);
  const [isSuggesting, startSuggest] = useTransition();

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

  function handleSuggest() {
    setAiError(null);
    const fd = new FormData(formRef.current!);
    const deviceType = String(fd.get("deviceType") ?? "").trim();
    const deviceModel = String(fd.get("deviceModel") ?? "").trim();
    const problem = String(fd.get("problem") ?? "").trim();
    if (!deviceType || problem.length < 3) {
      setAiError("Preencha o aparelho e o problema primeiro.");
      return;
    }
    startSuggest(async () => {
      const res = await suggestLaudoAction({ deviceType, deviceModel, problem });
      if (res.ok) setDiagnosis(res.text);
      else setAiError(res.error);
    });
  }

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-4">
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
        <div className="flex items-center justify-between gap-2">
          <label htmlFor="diagnosis" className={labelClass}>
            Laudo técnico
          </label>
          {aiEnabled && (
            <button
              type="button"
              onClick={handleSuggest}
              disabled={isSuggesting}
              className="rounded-md border border-primary/40 px-2.5 py-1 text-xs text-primary-soft transition hover:bg-primary/10 disabled:opacity-60"
            >
              {isSuggesting ? "Gerando…" : "✨ Sugerir com IA"}
            </button>
          )}
        </div>
        <textarea
          id="diagnosis"
          name="diagnosis"
          rows={3}
          value={diagnosis}
          onChange={(e) => setDiagnosis(e.target.value)}
          placeholder={aiEnabled ? "Opcional — ou gere com IA ✨" : "Opcional"}
          className={inputClass}
        />
        {aiError && <p className="text-xs text-danger">{aiError}</p>}
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

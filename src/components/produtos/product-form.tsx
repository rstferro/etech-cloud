"use client";

import { useActionState, useEffect } from "react";
import type { Product } from "@/generated/prisma/client";
import {
  createProductAction,
  updateProductAction,
  type ProductFormState,
} from "@/app/(dashboard)/produtos/actions";

const inputClass =
  "rounded-lg border border-border bg-surface px-3 py-2 text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/30";
const labelClass = "text-sm font-medium text-muted";

export function ProductForm({
  product,
  onDone,
  onCancel,
}: {
  product?: Product;
  onDone: () => void;
  onCancel: () => void;
}) {
  const action = product ? updateProductAction : createProductAction;
  const [state, formAction, pending] = useActionState<ProductFormState, FormData>(
    action,
    undefined,
  );

  useEffect(() => {
    if (state?.ok) onDone();
  }, [state, onDone]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {product && <input type="hidden" name="id" value={product.id} />}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="name" className={labelClass}>
          Nome
        </label>
        <input
          id="name"
          name="name"
          required
          defaultValue={product?.name}
          placeholder="Ex.: Cabo USB-C 1m"
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="category" className={labelClass}>
          Categoria
        </label>
        <input
          id="category"
          name="category"
          defaultValue={product?.category ?? ""}
          placeholder="Ex.: Acessórios"
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="description" className={labelClass}>
          Descrição
        </label>
        <textarea
          id="description"
          name="description"
          rows={2}
          defaultValue={product?.description ?? ""}
          placeholder="Opcional"
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="costPrice" className={labelClass}>
            Preço de custo (R$)
          </label>
          <input
            id="costPrice"
            name="costPrice"
            type="number"
            step="0.01"
            min="0"
            required
            defaultValue={product?.costPrice ?? 0}
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="salePrice" className={labelClass}>
            Preço de venda (R$)
          </label>
          <input
            id="salePrice"
            name="salePrice"
            type="number"
            step="0.01"
            min="0"
            required
            defaultValue={product?.salePrice ?? 0}
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="stock" className={labelClass}>
            Estoque
          </label>
          <input
            id="stock"
            name="stock"
            type="number"
            min="0"
            required
            defaultValue={product?.stock ?? 0}
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="minStock" className={labelClass}>
            Estoque mínimo
          </label>
          <input
            id="minStock"
            name="minStock"
            type="number"
            min="0"
            required
            defaultValue={product?.minStock ?? 0}
            className={inputClass}
          />
        </div>
      </div>

      {state?.error && (
        <p className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
          {state.error}
        </p>
      )}

      <div className="mt-2 flex justify-end gap-3">
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
          {pending ? "Salvando..." : product ? "Salvar" : "Criar produto"}
        </button>
      </div>
    </form>
  );
}

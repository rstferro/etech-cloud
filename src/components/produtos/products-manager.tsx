"use client";

import { useState, useTransition } from "react";
import type { Product } from "@/generated/prisma/client";
import { ProductForm } from "./product-form";
import { deleteProductAction } from "@/app/(dashboard)/produtos/actions";

const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

type DialogState = null | { product?: Product };

export function ProductsManager({ products }: { products: Product[] }) {
  const [dialog, setDialog] = useState<DialogState>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteProductAction(id);
      setConfirmingId(null);
    });
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Produtos</h1>
          <p className="mt-1 text-muted">
            {products.length} produto{products.length === 1 ? "" : "s"} cadastrado
            {products.length === 1 ? "" : "s"}
          </p>
        </div>
        <button
          onClick={() => setDialog({})}
          className="glow rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary-strong"
        >
          + Novo produto
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-surface-2">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-surface text-left text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">SKU</th>
              <th className="px-4 py-3 font-medium">Nome</th>
              <th className="px-4 py-3 font-medium">Categoria</th>
              <th className="px-4 py-3 text-right font-medium">Venda</th>
              <th className="px-4 py-3 text-right font-medium">Estoque</th>
              <th className="px-4 py-3 text-right font-medium">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {products.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted">
                  Nenhum produto ainda. Clique em “Novo produto”. ✨
                </td>
              </tr>
            )}
            {products.map((p) => {
              const low = p.stock < p.minStock;
              const confirming = confirmingId === p.id;
              return (
                <tr key={p.id} className="transition hover:bg-surface-3/40">
                  <td className="px-4 py-3 font-mono text-xs text-muted">
                    {p.sku}
                  </td>
                  <td className="px-4 py-3 font-medium text-foreground">
                    {p.name}
                  </td>
                  <td className="px-4 py-3 text-muted">{p.category ?? "—"}</td>
                  <td className="px-4 py-3 text-right text-foreground">
                    {brl.format(p.salePrice)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={
                        low
                          ? "rounded-full border border-warning/40 bg-warning/10 px-2 py-0.5 text-xs font-medium text-warning"
                          : "text-foreground"
                      }
                      title={low ? `Abaixo do mínimo (${p.minStock})` : undefined}
                    >
                      {p.stock}
                      {low ? " ⚠" : ""}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {confirming ? (
                        <>
                          <button
                            onClick={() => handleDelete(p.id)}
                            disabled={isPending}
                            className="rounded-md bg-danger/15 px-2.5 py-1 text-xs font-medium text-danger transition hover:bg-danger/25 disabled:opacity-60"
                          >
                            {isPending ? "..." : "Confirmar"}
                          </button>
                          <button
                            onClick={() => setConfirmingId(null)}
                            className="rounded-md px-2.5 py-1 text-xs text-muted transition hover:text-foreground"
                          >
                            Cancelar
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => setDialog({ product: p })}
                            className="rounded-md border border-border-strong px-2.5 py-1 text-xs text-muted transition hover:border-primary hover:text-primary-soft"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => setConfirmingId(p.id)}
                            className="rounded-md border border-border-strong px-2.5 py-1 text-xs text-muted transition hover:border-danger/50 hover:text-danger"
                          >
                            Excluir
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {dialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 p-4 backdrop-blur-sm"
          onClick={() => setDialog(null)}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-border bg-surface-2 p-6 shadow-glow"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-5 text-lg font-semibold text-foreground">
              {dialog.product ? "Editar produto" : "Novo produto"}
            </h2>
            <ProductForm
              product={dialog.product}
              onDone={() => setDialog(null)}
              onCancel={() => setDialog(null)}
            />
          </div>
        </div>
      )}
    </>
  );
}

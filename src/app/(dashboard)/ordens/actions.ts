"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import {
  serviceOrderSchema,
  moveSchema,
} from "@/lib/validations/service-order";
import {
  createServiceOrder,
  updateServiceOrder,
  deleteServiceOrder,
  moveServiceOrder,
} from "@/lib/db/service-orders";

export type OrderFormState = { ok: boolean; error?: string } | undefined;

function revalidate() {
  revalidatePath("/ordens");
  revalidatePath("/dashboard");
}

export async function createOrderAction(
  _prev: OrderFormState,
  formData: FormData,
): Promise<OrderFormState> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "Não autorizado." };

  const parsed = serviceOrderSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos.",
    };
  }

  await createServiceOrder(parsed.data);
  revalidate();
  return { ok: true };
}

export async function updateOrderAction(
  _prev: OrderFormState,
  formData: FormData,
): Promise<OrderFormState> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "Não autorizado." };

  const id = formData.get("id");
  if (typeof id !== "string" || !id) {
    return { ok: false, error: "Ordem inválida." };
  }

  const parsed = serviceOrderSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos.",
    };
  }

  await updateServiceOrder(id, parsed.data);
  revalidate();
  return { ok: true };
}

export async function deleteOrderAction(id: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Não autorizado.");

  await deleteServiceOrder(id);
  revalidate();
  return { ok: true };
}

/** Persiste o drag-and-drop do Kanban (status + nova ordem da coluna). */
export async function moveOrderAction(
  movedId: string,
  status: string,
  orderedIds: string[],
) {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "Não autorizado." };

  const parsed = moveSchema.safeParse({ status, orderedIds });
  if (!parsed.success) return { ok: false, error: "Movimento inválido." };

  await moveServiceOrder(movedId, parsed.data.status, parsed.data.orderedIds);
  revalidate();
  return { ok: true };
}

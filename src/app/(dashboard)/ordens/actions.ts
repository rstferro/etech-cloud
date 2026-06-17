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
import { isAiEnabled, suggestDiagnosis } from "@/lib/ai/laudo";

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

export type LaudoResult =
  | { ok: true; text: string }
  | { ok: false; error: string };

/** Sugere um laudo técnico com IA (Claude) a partir do aparelho + problema. */
export async function suggestLaudoAction(input: {
  deviceType: string;
  deviceModel?: string;
  problem: string;
}): Promise<LaudoResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "Não autorizado." };

  if (!isAiEnabled()) {
    return {
      ok: false,
      error: "IA não configurada. Defina ANTHROPIC_API_KEY no .env.",
    };
  }

  if (
    !input.deviceType?.trim() ||
    !input.problem?.trim() ||
    input.problem.trim().length < 3
  ) {
    return {
      ok: false,
      error: "Preencha o aparelho e o problema antes de gerar o laudo.",
    };
  }

  try {
    const text = await suggestDiagnosis({
      deviceType: input.deviceType,
      deviceModel: input.deviceModel,
      problem: input.problem,
    });
    return text
      ? { ok: true, text }
      : { ok: false, error: "A IA não retornou um laudo. Tente de novo." };
  } catch (e) {
    const err = e as { status?: number; message?: string };
    const raw = err?.message ?? "";
    let error = "Falha ao gerar o laudo. Tente novamente.";
    if (err.status === 401) {
      error = "Chave da Anthropic inválida. Confira a ANTHROPIC_API_KEY.";
    } else if (/credit balance/i.test(raw)) {
      error =
        "Conta Anthropic sem créditos. Adicione créditos em console.anthropic.com (Plans & Billing).";
    } else if (err.status === 429) {
      error = "Muitas requisições à IA agora. Tente em alguns segundos.";
    } else if (e instanceof Error && raw.length < 120) {
      error = raw;
    }
    return { ok: false, error };
  }
}

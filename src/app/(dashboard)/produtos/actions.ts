"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { productSchema } from "@/lib/validations/product";
import {
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/lib/db/products";

export type ProductFormState = { ok: boolean; error?: string } | undefined;

function revalidate() {
  revalidatePath("/produtos");
  revalidatePath("/dashboard");
}

export async function createProductAction(
  _prev: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "Não autorizado." };

  const parsed = productSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  await createProduct(parsed.data);
  revalidate();
  return { ok: true };
}

export async function updateProductAction(
  _prev: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "Não autorizado." };

  const id = formData.get("id");
  if (typeof id !== "string" || !id) {
    return { ok: false, error: "Produto inválido." };
  }

  const parsed = productSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  await updateProduct(id, parsed.data);
  revalidate();
  return { ok: true };
}

export async function deleteProductAction(id: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Não autorizado.");

  try {
    await deleteProduct(id);
  } catch {
    // provável violação de FK (produto com vendas associadas)
    return { ok: false, error: "Não foi possível excluir (produto com vendas)." };
  }
  revalidate();
  return { ok: true };
}

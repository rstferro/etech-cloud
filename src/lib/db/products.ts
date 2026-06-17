import { prisma } from "@/lib/db/prisma";
import type { ProductInput } from "@/lib/validations/product";

/** Lista todos os produtos (mais recentes primeiro). */
export function listProducts() {
  return prisma.product.findMany({ orderBy: { createdAt: "desc" } });
}

export function getProduct(id: string) {
  return prisma.product.findUnique({ where: { id } });
}

/** Prefixo de 3 letras a partir da categoria (sem acento), ou "GEN". */
function categoryPrefix(category?: string | null) {
  if (!category) return "GEN";
  const norm = category
    .normalize("NFD") // separa letra-base do acento
    .replace(/[^\x00-\x7F]/g, "") // remove os acentos (não-ASCII)
    .toUpperCase()
    .replace(/[^A-Z]/g, "");
  return (norm.slice(0, 3) || "GEN").padEnd(3, "X");
}

/** Gera um SKU único no formato ETC-XXX-0001. */
export async function generateSku(category?: string | null) {
  const prefix = categoryPrefix(category);
  const base = `ETC-${prefix}-`;
  const count = await prisma.product.count({
    where: { sku: { startsWith: base } },
  });

  let n = count + 1;
  // garante unicidade mesmo se houver buracos na sequência
  for (;;) {
    const sku = `${base}${String(n).padStart(4, "0")}`;
    const exists = await prisma.product.findUnique({ where: { sku } });
    if (!exists) return sku;
    n++;
  }
}

function normalize(data: ProductInput) {
  return {
    name: data.name,
    description: data.description || null,
    category: data.category || null,
    costPrice: data.costPrice,
    salePrice: data.salePrice,
    stock: data.stock,
    minStock: data.minStock,
  };
}

export async function createProduct(data: ProductInput) {
  const sku = await generateSku(data.category);
  return prisma.product.create({ data: { ...normalize(data), sku } });
}

export function updateProduct(id: string, data: ProductInput) {
  return prisma.product.update({ where: { id }, data: normalize(data) });
}

export function deleteProduct(id: string) {
  return prisma.product.delete({ where: { id } });
}

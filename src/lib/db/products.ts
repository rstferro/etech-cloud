import { prisma } from "@/lib/db/prisma";
import { categoryPrefix, formatSku } from "@/lib/sku";
import type { ProductInput } from "@/lib/validations/product";

/** Lista todos os produtos (mais recentes primeiro). */
export function listProducts() {
  return prisma.product.findMany({ orderBy: { createdAt: "desc" } });
}

export function getProduct(id: string) {
  return prisma.product.findUnique({ where: { id } });
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
    const sku = formatSku(prefix, n);
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

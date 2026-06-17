import { prisma } from "@/lib/db/prisma";

/** Métricas agregadas pro dashboard (lê direto do banco). */
export async function getDashboardMetrics() {
  const [vendas, produtos, estoqueBaixo, osAbertas, osEntregues] =
    await Promise.all([
      prisma.sale.aggregate({ _sum: { total: true } }),
      prisma.product.count({ where: { active: true } }),
      prisma.product.count({
        where: { stock: { lt: prisma.product.fields.minStock } },
      }),
      prisma.serviceOrder.count({ where: { status: { not: "ENTREGUE" } } }),
      prisma.serviceOrder.count({ where: { status: "ENTREGUE" } }),
    ]);

  return {
    vendasTotal: vendas._sum.total ?? 0,
    produtos,
    estoqueBaixo,
    osAbertas,
    osEntregues,
  };
}

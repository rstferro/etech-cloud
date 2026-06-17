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

const localKey = (d: Date) =>
  `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
const label = (d: Date) =>
  `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;

/** Receita por dia nos últimos `days` dias (preenche dias sem venda com 0). */
export async function getSalesTrend(days = 14) {
  const since = new Date();
  since.setHours(0, 0, 0, 0);
  since.setDate(since.getDate() - (days - 1));

  const sales = await prisma.sale.findMany({
    where: { createdAt: { gte: since } },
    select: { total: true, createdAt: true },
  });

  const buckets = new Map<string, { label: string; total: number }>();
  for (let i = 0; i < days; i++) {
    const d = new Date(since);
    d.setDate(since.getDate() + i);
    buckets.set(localKey(d), { label: label(d), total: 0 });
  }
  for (const s of sales) {
    const b = buckets.get(localKey(s.createdAt));
    if (b) b.total += s.total;
  }
  return [...buckets.values()];
}

/** Contagem de OS por status (na ordem do Kanban, com cor de cada coluna). */
export async function getOrdersByStatus() {
  const grouped = await prisma.serviceOrder.groupBy({
    by: ["status"],
    _count: { _all: true },
  });

  const meta = [
    { status: "RECEBIDO", label: "Recebido", color: "#22d3ee" },
    { status: "EM_ANALISE", label: "Em análise", color: "#a78bff" },
    { status: "EM_CONSERTO", label: "Em conserto", color: "#f59e0b" },
    { status: "PRONTO", label: "Pronto", color: "#22c55e" },
    { status: "ENTREGUE", label: "Entregue", color: "#6f6590" },
  ] as const;

  return meta.map((m) => ({
    ...m,
    count: grouped.find((g) => g.status === m.status)?._count._all ?? 0,
  }));
}

/** Estoque atual por produto, marcando quem está abaixo do mínimo. */
export async function getStockByProduct() {
  const products = await prisma.product.findMany({
    where: { active: true },
    orderBy: { stock: "asc" },
    select: { name: true, stock: true, minStock: true },
  });
  return products.map((p) => ({
    name: p.name,
    stock: p.stock,
    minStock: p.minStock,
    low: p.stock < p.minStock,
  }));
}

import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import {
  getDashboardMetrics,
  getSalesTrend,
  getOrdersByStatus,
  getStockByProduct,
} from "@/lib/db/dashboard";
import { MetricCard } from "@/components/dashboard/metric-card";
import { ChartCard } from "@/components/dashboard/chart-card";
import { SalesAreaChart } from "@/components/dashboard/sales-area-chart";
import { OrdersStatusChart } from "@/components/dashboard/orders-status-chart";
import { StockBarChart } from "@/components/dashboard/stock-bar-chart";

export const metadata: Metadata = {
  title: "Dashboard · E-Tech Cloud",
};

const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export default async function DashboardPage() {
  const session = await auth();
  const [m, salesTrend, ordersByStatus, stockByProduct] = await Promise.all([
    getDashboardMetrics(),
    getSalesTrend(14),
    getOrdersByStatus(),
    getStockByProduct(),
  ]);
  const primeiroNome = session?.user.name?.split(" ")[0] ?? "Barda";
  const totalPeriodo = salesTrend.reduce((s, d) => s + d.total, 0);

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-8 py-10">
      <header>
        <h1 className="text-2xl font-semibold text-foreground">
          Olá, {primeiroNome} 👋
        </h1>
        <p className="mt-1 text-muted">Visão geral da loja E-Tech.</p>
      </header>

      <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Vendas (total)"
          value={brl.format(m.vendasTotal)}
          accent="success"
        />
        <MetricCard
          label="Produtos ativos"
          value={m.produtos}
          accent="primary"
        />
        <MetricCard
          label="Estoque baixo"
          value={m.estoqueBaixo}
          hint="abaixo do mínimo"
          accent="warning"
        />
        <MetricCard
          label="OS em aberto"
          value={m.osAbertas}
          hint={`${m.osEntregues} entregues`}
          accent="cyan"
        />
      </section>

      <ChartCard
        title="Vendas — últimos 14 dias"
        hint={brl.format(totalPeriodo)}
      >
        <SalesAreaChart data={salesTrend} />
      </ChartCard>

      <section className="grid gap-5 lg:grid-cols-2">
        <ChartCard title="Ordens de serviço por status">
          <OrdersStatusChart data={ordersByStatus} />
        </ChartCard>
        <ChartCard title="Estoque por produto" hint="⚠ = abaixo do mínimo">
          <StockBarChart data={stockByProduct} />
        </ChartCard>
      </section>
    </main>
  );
}

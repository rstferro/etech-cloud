import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { getDashboardMetrics } from "@/lib/db/dashboard";
import { MetricCard } from "@/components/dashboard/metric-card";

export const metadata: Metadata = {
  title: "Dashboard · E-Tech Cloud",
};

const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export default async function DashboardPage() {
  const session = await auth();
  const m = await getDashboardMetrics();
  const primeiroNome = session?.user.name?.split(" ")[0] ?? "Barda";

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

      <section className="rounded-xl border border-dashed border-border-strong bg-surface/40 p-8 text-center text-muted">
        📊 Gráficos (Recharts) e os módulos de Produtos e Ordens chegam nos
        próximos passos.
      </section>
    </main>
  );
}

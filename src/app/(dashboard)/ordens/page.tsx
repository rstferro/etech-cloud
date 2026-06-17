import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ordens de Serviço · E-Tech Cloud",
};

export default function OrdensPage() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 px-8 py-10">
      <header>
        <h1 className="text-2xl font-semibold text-foreground">
          Ordens de Serviço
        </h1>
        <p className="mt-1 text-muted">
          Kanban: Recebido → Em análise → Em conserto → Pronto → Entregue.
        </p>
      </header>
      <section className="rounded-xl border border-dashed border-border-strong bg-surface/40 p-10 text-center text-muted">
        🚧 Em construção — chega no Passo 5.
      </section>
    </main>
  );
}

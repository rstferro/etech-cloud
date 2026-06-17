import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="cyber-grid relative flex min-h-screen flex-col items-center justify-center gap-12 px-6 py-20">
      {/* Cabeçalho */}
      <header className="flex flex-col items-center gap-5 text-center">
        <span className="rounded-full border border-border-strong bg-surface-2 px-4 py-1 text-xs font-medium tracking-widest text-muted uppercase">
          Ecossistema E-Tech · Cloud
        </span>
        <Image
          src="/brand/logo-horizontal-white.png"
          alt="E-Tech"
          width={1040}
          height={360}
          priority
          className="h-20 w-auto drop-shadow-[0_0_25px_rgba(140,90,255,0.45)] sm:h-24"
        />
        <p className="max-w-xl text-balance text-muted">
          PDV, controle de estoque e ordens de serviço — o sistema da loja de
          tecnologia, agora na nuvem. 💜
        </p>
        <div className="mt-2 flex gap-3">
          <Link
            href="/dashboard"
            className="glow rounded-lg bg-primary px-5 py-2.5 font-medium text-primary-foreground transition hover:bg-primary-strong"
          >
            Acessar dashboard
          </Link>
          <Link
            href="/login"
            className="rounded-lg border border-border-strong bg-surface-2 px-5 py-2.5 font-medium text-foreground transition hover:border-primary"
          >
            Entrar
          </Link>
        </div>
      </header>

      {/* Showcase de cards / tokens */}
      <section className="grid w-full max-w-4xl gap-5 sm:grid-cols-3">
        <Card title="Vendas no mês" value="R$ 12.480" accent="primary" />
        <Card title="Estoque baixo" value="2 produtos" accent="warning" />
        <Card title="OS abertas" value="4 ordens" accent="cyan" />
      </section>

      {/* Paleta de status */}
      <section className="flex flex-wrap items-center justify-center gap-3">
        <Badge className="border-success/40 bg-success/10 text-success">
          Em estoque
        </Badge>
        <Badge className="border-warning/40 bg-warning/10 text-warning">
          Estoque baixo
        </Badge>
        <Badge className="border-danger/40 bg-danger/10 text-danger">
          Esgotado
        </Badge>
        <Badge className="border-neon/40 bg-neon/10 text-neon">Neon</Badge>
        <Badge className="border-cyan/40 bg-cyan/10 text-cyan">Cyan</Badge>
      </section>
    </main>
  );
}

function Card({
  title,
  value,
  accent,
}: {
  title: string;
  value: string;
  accent: "primary" | "warning" | "cyan";
}) {
  const ring = {
    primary: "hover:border-primary",
    warning: "hover:border-warning",
    cyan: "hover:border-cyan",
  }[accent];

  return (
    <div
      className={`rounded-xl border border-border bg-surface-2 p-5 transition ${ring}`}
    >
      <p className="text-sm text-muted">{title}</p>
      <p className="mt-2 text-2xl font-semibold text-foreground">{value}</p>
    </div>
  );
}

function Badge({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-medium ${className}`}
    >
      {children}
    </span>
  );
}

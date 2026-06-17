import Image from "next/image";
import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Entrar · E-Tech Cloud",
};

export default function LoginPage() {
  return (
    <main className="cyber-grid flex min-h-screen flex-col items-center justify-center gap-8 px-6 py-16">
      <Image
        src="/brand/logo-vertical-white.png"
        alt="E-Tech"
        width={638}
        height={613}
        priority
        className="h-28 w-auto drop-shadow-[0_0_30px_rgba(140,90,255,0.45)]"
      />

      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface-2/80 p-7 backdrop-blur">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-semibold text-foreground">
            Acessar painel
          </h1>
          <p className="mt-1 text-sm text-muted">
            Entre com sua conta da E-Tech Cloud
          </p>
        </div>

        <LoginForm />

        <div className="mt-6 rounded-lg border border-border-strong bg-surface/60 p-3 text-xs text-muted">
          <p className="mb-1 font-medium text-primary-soft">🔑 Contas de demonstração</p>
          <p>
            Admin: <span className="text-foreground">admin@etech.local</span> /
            admin123
          </p>
          <p>
            Funcionário:{" "}
            <span className="text-foreground">funcionario@etech.local</span> /
            func123
          </p>
        </div>
      </div>
    </main>
  );
}

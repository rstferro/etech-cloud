"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LogoutButton } from "./logout-button";

type NavItem = { href: string; label: string; icon: React.ReactNode };

const nav: NavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="size-5" aria-hidden>
        <path
          d="M4 13h6V4H4v9Zm0 7h6v-5H4v5Zm10 0h6v-9h-6v9Zm0-16v5h6V4h-6Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
  {
    href: "/produtos",
    label: "Produtos",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="size-5" aria-hidden>
        <path
          d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"
          stroke="currentColor"
          strokeWidth="1.7"
        />
        <path d="m3.3 7 8.7 5 8.7-5M12 22V12" stroke="currentColor" strokeWidth="1.7" />
      </svg>
    ),
  },
  {
    href: "/ordens",
    label: "Ordens de Serviço",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="size-5" aria-hidden>
        <path
          d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18v3h3l6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.5-.7-.7-2.5 2.4-2.8Z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

export function Sidebar({
  user,
}: {
  user: { name: string; role: string };
}) {
  const pathname = usePathname();

  return (
    <aside className="flex w-64 shrink-0 flex-col gap-6 border-r border-border bg-surface/60 p-5 backdrop-blur">
      <Link href="/dashboard" className="flex items-center px-1">
        <Image
          src="/brand/logo-horizontal-white.png"
          alt="E-Tech Cloud"
          width={1040}
          height={360}
          priority
          className="h-9 w-auto"
        />
      </Link>

      <nav className="flex flex-1 flex-col gap-1">
        {nav.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                active
                  ? "bg-primary/15 text-primary-soft"
                  : "text-muted hover:bg-surface-2 hover:text-foreground"
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex flex-col gap-3 border-t border-border pt-4">
        <div className="px-1">
          <p className="truncate text-sm font-medium text-foreground">
            {user.name}
          </p>
          <p className="text-xs text-muted">
            {user.role === "ADMIN" ? "Administrador" : "Funcionário"}
          </p>
        </div>
        <LogoutButton />
      </div>
    </aside>
  );
}

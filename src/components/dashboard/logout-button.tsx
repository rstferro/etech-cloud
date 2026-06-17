"use client";

import { logout } from "@/lib/auth/actions";

export function LogoutButton() {
  return (
    <form action={logout}>
      <button
        type="submit"
        className="w-full rounded-lg border border-border-strong px-3 py-2 text-sm text-muted transition hover:border-danger/50 hover:bg-danger/10 hover:text-danger"
      >
        Sair
      </button>
    </form>
  );
}

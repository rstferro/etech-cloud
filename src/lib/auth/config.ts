import type { NextAuthConfig } from "next-auth";
import type { Role } from "@/generated/prisma/client";

/**
 * Configuração base do Auth.js — SEM dependências de Node (Prisma/bcrypt),
 * pra poder rodar no Edge (middleware). Os providers que usam o banco ficam
 * em ./index.ts.
 */
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    // Protege as rotas do dashboard e redireciona quem já está logado pra fora do /login.
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnApp =
        nextUrl.pathname.startsWith("/dashboard") ||
        nextUrl.pathname.startsWith("/produtos") ||
        nextUrl.pathname.startsWith("/ordens");

      if (isOnApp) return isLoggedIn;

      if (isLoggedIn && nextUrl.pathname === "/login") {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }
      return true;
    },
    // Carrega id e role no token...
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role;
      }
      return token;
    },
    // ...e expõe na session.
    session({ session, token }) {
      if (token.id) session.user.id = token.id as string;
      if (token.role) session.user.role = token.role as Role;
      return session;
    },
  },
  providers: [], // preenchidos em ./index.ts (Credentials usa Prisma + bcrypt)
} satisfies NextAuthConfig;

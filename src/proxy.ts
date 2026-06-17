import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth/config";

// Instância leve (sem Prisma/bcrypt) só pra rodar o callback `authorized` no Edge.
const { auth } = NextAuth(authConfig);
export default auth;

export const config = {
  // Roda em tudo, menos assets estáticos, imagens e as rotas internas do Next/Auth.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};

import { PrismaLibSql } from "@prisma/adapter-libsql";

// Adapter libSQL (Prisma 7). Cobre os dois cenários com a mesma config:
//   • Dev local:  DATABASE_URL="file:./dev.db"        (sem token)
//   • Produção:   DATABASE_URL="libsql://...turso.io" + TURSO_AUTH_TOKEN
export function createLibsqlAdapter() {
  return new PrismaLibSql({
    url: process.env.DATABASE_URL ?? "file:./dev.db",
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
}

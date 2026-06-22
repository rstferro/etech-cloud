import { PrismaClient } from "@/generated/prisma/client";
import { createLibsqlAdapter } from "./adapter";

// Driver adapter libSQL (Prisma 7). Local-first (file:) ou Turso (libsql://).
const adapter = createLibsqlAdapter();

// Singleton: reaproveita a instância em dev pra não criar uma conexão nova
// a cada hot-reload do Next.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

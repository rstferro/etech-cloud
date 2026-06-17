import bcrypt from "bcryptjs";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Semeando E-Tech Cloud...");

  // ── Usuários (senhas demo com hash bcrypt) ──
  const adminHash = await bcrypt.hash("admin123", 10);
  const funcHash = await bcrypt.hash("func123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@etech.local" },
    update: { passwordHash: adminHash },
    create: {
      name: "Barda da E-Tech",
      email: "admin@etech.local",
      passwordHash: adminHash,
      role: "ADMIN",
    },
  });

  await prisma.user.upsert({
    where: { email: "funcionario@etech.local" },
    update: { passwordHash: funcHash },
    create: {
      name: "Funcionário Demo",
      email: "funcionario@etech.local",
      passwordHash: funcHash,
      role: "FUNCIONARIO",
    },
  });

  // ── Produtos (um com estoque abaixo do mínimo pra testar o alerta) ──
  const produtos = [
    {
      sku: "ETC-CAB-0001",
      name: "Cabo USB-C 1m",
      category: "Acessórios",
      costPrice: 8,
      salePrice: 25,
      stock: 3,
      minStock: 10,
    },
    {
      sku: "ETC-FON-0002",
      name: "Fonte 65W USB-C",
      category: "Acessórios",
      costPrice: 60,
      salePrice: 149,
      stock: 12,
      minStock: 5,
    },
    {
      sku: "ETC-SSD-0003",
      name: "SSD 480GB",
      category: "Componentes",
      costPrice: 180,
      salePrice: 299,
      stock: 2,
      minStock: 4,
    },
    {
      sku: "ETC-PEL-0004",
      name: "Película de vidro",
      category: "Acessórios",
      costPrice: 3,
      salePrice: 19,
      stock: 40,
      minStock: 15,
    },
  ];

  for (const p of produtos) {
    await prisma.product.upsert({
      where: { sku: p.sku },
      update: {},
      create: p,
    });
  }

  // ── Cliente de exemplo ──
  const cliente = await prisma.customer.upsert({
    where: { id: "seed-customer-1" },
    update: {},
    create: {
      id: "seed-customer-1",
      name: "João da Silva",
      phone: "(53) 99999-0000",
      email: "joao@example.com",
    },
  });

  // ── Ordens de serviço em status variados (pra encher o Kanban) ──
  const ordens = [
    {
      code: "OS-0001",
      deviceType: "Celular",
      deviceModel: "Galaxy S21",
      problem: "Tela trincada",
      status: "RECEBIDO" as const,
    },
    {
      code: "OS-0002",
      deviceType: "Notebook",
      deviceModel: "Acer Aspire 5",
      problem: "Não liga",
      status: "EM_ANALISE" as const,
    },
    {
      code: "OS-0003",
      deviceType: "Micro-ondas",
      problem: "Não esquenta",
      status: "EM_CONSERTO" as const,
      price: 120,
    },
    {
      code: "OS-0004",
      deviceType: "Celular",
      deviceModel: "Moto G",
      problem: "Bateria viciada",
      status: "PRONTO" as const,
      price: 90,
    },
  ];

  for (const [i, os] of ordens.entries()) {
    await prisma.serviceOrder.upsert({
      where: { code: os.code },
      update: {},
      create: {
        ...os,
        position: i,
        customerId: cliente.id,
        technicianId: admin.id,
      },
    });
  }

  console.log("✅ Seed concluído!");
  console.log("   Login admin:       admin@etech.local / admin123");
  console.log("   Login funcionário: funcionario@etech.local / func123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

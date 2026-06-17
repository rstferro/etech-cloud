# 04 · Prisma 7 (ORM)

Prisma é o **ORM**: você descreve seus dados em um schema, ele gera um cliente
**type-safe** e cuida do SQL por baixo. Banco do projeto: **SQLite** local
(`dev.db`), pronto pra migrar pro Turso depois.

## O schema

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client"          // gerador novo do Prisma 7 (ESM)
  output   = "../src/generated/prisma" // onde o client é gerado
}
datasource db {
  provider = "sqlite"
}

model Product {
  id        String   @id @default(cuid())
  sku       String   @unique
  name      String
  stock     Int      @default(0)
  minStock  Int      @default(0)
  createdAt DateTime @default(now())
  @@index([category])
}
```

- `@id` chave primária · `@unique` único · `@default(...)` valor padrão.
- `String?` (com `?`) = coluna **opcional** (nullable).
- `@@index([...])` cria índice (queries mais rápidas).
- Relações: `ServiceOrder` aponta pra `Customer` via `customerId` + `@relation`.

## Enums

```prisma
enum ServiceStatus { RECEBIDO  EM_ANALISE  EM_CONSERTO  PRONTO  ENTREGUE }
```
Vira um tipo TS no client gerado — o mesmo conjunto de valores do Kanban.

## Migrations — versionar a estrutura do banco

```bash
npx prisma migrate dev --name init   # cria/aplica uma migration a partir do schema
npx prisma generate                  # (re)gera o client TS  ⚠ Prisma 7 não faz sozinho
npx prisma db seed                   # roda o prisma/seed.ts
```

> ⚠️ **Pegadinha do Prisma 7**: `migrate dev` **não** gera o client nem roda o
> seed automaticamente como nas versões antigas. Rode `generate` e `db seed` à mão.

## O client (singleton)

```ts
// src/lib/db/prisma.ts
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL });
export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });
```

O padrão **singleton** evita criar mil conexões no hot-reload do dev. Prisma 7 usa
um **driver adapter** (`better-sqlite3`) em vez do engine binário antigo.

## Queries (o que você mais usa)

```ts
// buscar muitos, ordenado, com relação incluída
prisma.serviceOrder.findMany({
  orderBy: [{ status: "asc" }, { position: "asc" }],
  include: { customer: true },
});

// buscar um
prisma.product.findUnique({ where: { id } });
prisma.customer.findFirst({ where: { name } });

// criar / atualizar / apagar
prisma.product.create({ data: { ...dados, sku } });
prisma.product.update({ where: { id }, data });
prisma.product.delete({ where: { id } });

// contar / agregar (usado no dashboard)
prisma.sale.aggregate({ _sum: { total: true } });
prisma.serviceOrder.groupBy({ by: ["status"], _count: { _all: true } });
```

## Transações — tudo ou nada

No drag-and-drop do Kanban, reescrevemos a posição de vários cards de uma vez. Se
algo falhar, **nada** é gravado:

```ts
// src/lib/db/service-orders.ts
await prisma.$transaction(
  orderedIds.map((id, index) =>
    prisma.serviceOrder.update({ where: { id }, data: { status, position: index } }),
  ),
);
```

## Por que isso é "type-safe"

O retorno das queries é **totalmente tipado** a partir do schema. Por isso o
`ServiceOrderWithCustomer` (módulo 01) consegue extrair o tipo da própria query —
se você adicionar um campo no schema, o tipo acompanha sozinho.

## 🧪 Pratique
Abra o **Prisma Studio** (`npx prisma studio`) — uma UI no navegador pra ver e
editar o `dev.db`. Compare as tabelas com os `model` do schema.

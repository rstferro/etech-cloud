import { prisma } from "@/lib/db/prisma";
import type { ServiceOrderInput, ServiceStatusValue } from "@/lib/validations/service-order";

/** OS com o cliente embutido (o que o Kanban precisa pra renderizar). */
export type ServiceOrderWithCustomer = Awaited<
  ReturnType<typeof listServiceOrders>
>[number];

/** Lista todas as OS, ordenadas por status e posição na coluna. */
export function listServiceOrders() {
  return prisma.serviceOrder.findMany({
    orderBy: [{ status: "asc" }, { position: "asc" }],
    include: { customer: true },
  });
}

export function getServiceOrder(id: string) {
  return prisma.serviceOrder.findUnique({
    where: { id },
    include: { customer: true },
  });
}

/** Clientes para sugestão no formulário (datalist). */
export function listCustomersBrief() {
  return prisma.customer.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, phone: true },
  });
}

/** Gera um código único no formato OS-0001. */
export async function generateOrderCode() {
  const count = await prisma.serviceOrder.count();
  let n = count + 1;
  for (;;) {
    const code = `OS-${String(n).padStart(4, "0")}`;
    const exists = await prisma.serviceOrder.findUnique({ where: { code } });
    if (!exists) return code;
    n++;
  }
}

/** Acha um cliente pelo nome (exato) ou cria um novo. */
async function resolveCustomer(name: string, phone?: string) {
  const existing = await prisma.customer.findFirst({ where: { name } });
  if (existing) {
    // completa o telefone se ainda não tiver
    if (phone && !existing.phone) {
      await prisma.customer.update({
        where: { id: existing.id },
        data: { phone },
      });
    }
    return existing.id;
  }
  const created = await prisma.customer.create({
    data: { name, phone: phone || null },
  });
  return created.id;
}

export async function createServiceOrder(data: ServiceOrderInput) {
  const code = await generateOrderCode();
  const customerId = await resolveCustomer(data.customerName, data.customerPhone);
  // nova OS entra no fim da coluna "Recebido"
  const position = await prisma.serviceOrder.count({
    where: { status: "RECEBIDO" },
  });

  return prisma.serviceOrder.create({
    data: {
      code,
      customerId,
      deviceType: data.deviceType,
      deviceModel: data.deviceModel || null,
      problem: data.problem,
      diagnosis: data.diagnosis || null,
      price: data.price ?? null,
      status: "RECEBIDO",
      position,
    },
  });
}

export async function updateServiceOrder(id: string, data: ServiceOrderInput) {
  const customerId = await resolveCustomer(data.customerName, data.customerPhone);
  return prisma.serviceOrder.update({
    where: { id },
    data: {
      customerId,
      deviceType: data.deviceType,
      deviceModel: data.deviceModel || null,
      problem: data.problem,
      diagnosis: data.diagnosis || null,
      price: data.price ?? null,
    },
  });
}

export function deleteServiceOrder(id: string) {
  return prisma.serviceOrder.delete({ where: { id } });
}

/**
 * Move uma OS no Kanban: reescreve status + posição de todos os cards da
 * coluna de destino (na ordem recebida) numa transação. Define/limpa
 * `deliveredAt` do card movido conforme entra/sai de ENTREGUE.
 */
export async function moveServiceOrder(
  movedId: string,
  status: ServiceStatusValue,
  orderedIds: string[],
) {
  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.serviceOrder.update({
        where: { id },
        data: {
          status,
          position: index,
          ...(id === movedId
            ? { deliveredAt: status === "ENTREGUE" ? new Date() : null }
            : {}),
        },
      }),
    ),
  );
}

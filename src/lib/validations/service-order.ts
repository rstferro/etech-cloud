import { z } from "zod";

/** Status possíveis de uma OS — espelha o enum ServiceStatus do Prisma. */
export const SERVICE_STATUSES = [
  "RECEBIDO",
  "EM_ANALISE",
  "EM_CONSERTO",
  "PRONTO",
  "ENTREGUE",
] as const;

export type ServiceStatusValue = (typeof SERVICE_STATUSES)[number];

/** Campo de preço opcional: "" vira undefined; resto é coagido pra número. */
const optionalPrice = z.preprocess(
  (v) => (v === "" || v == null ? undefined : v),
  z.coerce.number().min(0, "Valor inválido").optional(),
);

export const serviceOrderSchema = z.object({
  customerName: z.string().trim().min(2, "Nome do cliente é obrigatório"),
  customerPhone: z.string().trim().optional(),
  deviceType: z.string().trim().min(2, "Tipo de aparelho é obrigatório"),
  deviceModel: z.string().trim().optional(),
  problem: z.string().trim().min(3, "Descreva o problema relatado"),
  diagnosis: z.string().trim().optional(),
  price: optionalPrice,
});

export type ServiceOrderInput = z.infer<typeof serviceOrderSchema>;

/** Valida só a movimentação no Kanban (drag-and-drop). */
export const moveSchema = z.object({
  status: z.enum(SERVICE_STATUSES),
  orderedIds: z.array(z.string()).min(1),
});

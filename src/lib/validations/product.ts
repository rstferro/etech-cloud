import { z } from "zod";

export const productSchema = z.object({
  name: z.string().trim().min(2, "Nome precisa ter ao menos 2 caracteres"),
  description: z.string().trim().optional(),
  category: z.string().trim().optional(),
  costPrice: z.coerce.number().min(0, "Preço de custo inválido"),
  salePrice: z.coerce.number().min(0, "Preço de venda inválido"),
  stock: z.coerce.number().int("Estoque deve ser inteiro").min(0),
  minStock: z.coerce.number().int("Estoque mínimo deve ser inteiro").min(0),
});

export type ProductInput = z.infer<typeof productSchema>;

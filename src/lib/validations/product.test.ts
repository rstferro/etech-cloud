import { describe, it, expect } from "vitest";
import { productSchema } from "@/lib/validations/product";

const base = {
  name: "Cabo USB-C",
  costPrice: 8,
  salePrice: 25,
  stock: 10,
  minStock: 5,
};

describe("productSchema", () => {
  it("aceita um produto válido", () => {
    const r = productSchema.safeParse(base);
    expect(r.success).toBe(true);
  });

  it("coage strings numéricas vindas do form", () => {
    const r = productSchema.safeParse({
      ...base,
      costPrice: "8",
      salePrice: "25",
      stock: "10",
      minStock: "5",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.salePrice).toBe(25);
      expect(r.data.stock).toBe(10);
    }
  });

  it("rejeita nome curto demais", () => {
    const r = productSchema.safeParse({ ...base, name: "x" });
    expect(r.success).toBe(false);
  });

  it("rejeita preço negativo", () => {
    const r = productSchema.safeParse({ ...base, salePrice: -1 });
    expect(r.success).toBe(false);
  });

  it("rejeita estoque fracionário", () => {
    const r = productSchema.safeParse({ ...base, stock: 1.5 });
    expect(r.success).toBe(false);
  });

  it("trata description/category opcionais", () => {
    const r = productSchema.safeParse(base);
    expect(r.success).toBe(true);
  });
});

import { describe, it, expect } from "vitest";
import {
  serviceOrderSchema,
  moveSchema,
} from "@/lib/validations/service-order";

const base = {
  customerName: "João da Silva",
  deviceType: "Celular",
  problem: "Tela trincada",
};

describe("serviceOrderSchema", () => {
  it("aceita uma OS válida mínima", () => {
    const r = serviceOrderSchema.safeParse(base);
    expect(r.success).toBe(true);
  });

  it("transforma price vazio em undefined", () => {
    const r = serviceOrderSchema.safeParse({ ...base, price: "" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.price).toBeUndefined();
  });

  it("coage price string para número", () => {
    const r = serviceOrderSchema.safeParse({ ...base, price: "120" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.price).toBe(120);
  });

  it("rejeita nome de cliente vazio", () => {
    const r = serviceOrderSchema.safeParse({ ...base, customerName: "" });
    expect(r.success).toBe(false);
  });

  it("rejeita problema curto demais", () => {
    const r = serviceOrderSchema.safeParse({ ...base, problem: "x" });
    expect(r.success).toBe(false);
  });

  it("rejeita price negativo", () => {
    const r = serviceOrderSchema.safeParse({ ...base, price: "-5" });
    expect(r.success).toBe(false);
  });
});

describe("moveSchema", () => {
  it("aceita status válido + lista de ids", () => {
    const r = moveSchema.safeParse({
      status: "EM_CONSERTO",
      orderedIds: ["a", "b"],
    });
    expect(r.success).toBe(true);
  });

  it("rejeita status fora do enum", () => {
    const r = moveSchema.safeParse({
      status: "INEXISTENTE",
      orderedIds: ["a"],
    });
    expect(r.success).toBe(false);
  });

  it("rejeita lista de ids vazia", () => {
    const r = moveSchema.safeParse({ status: "PRONTO", orderedIds: [] });
    expect(r.success).toBe(false);
  });
});

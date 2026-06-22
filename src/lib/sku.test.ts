import { describe, it, expect } from "vitest";
import { categoryPrefix, formatSku } from "@/lib/sku";

describe("categoryPrefix", () => {
  it("usa as 3 primeiras letras da categoria em maiúsculas", () => {
    expect(categoryPrefix("Componentes")).toBe("COM");
  });

  it("remove acentos antes de cortar", () => {
    expect(categoryPrefix("Acessórios")).toBe("ACE");
  });

  it("cai pra GEN quando não há categoria", () => {
    expect(categoryPrefix(undefined)).toBe("GEN");
    expect(categoryPrefix(null)).toBe("GEN");
    expect(categoryPrefix("")).toBe("GEN");
  });

  it("cai pra GEN quando a categoria não tem letras ASCII", () => {
    expect(categoryPrefix("123 !@#")).toBe("GEN");
  });

  it("completa com X quando há menos de 3 letras", () => {
    expect(categoryPrefix("TV")).toBe("TVX");
    expect(categoryPrefix("A")).toBe("AXX");
  });

  it("ignora espaços e símbolos no meio", () => {
    expect(categoryPrefix("P C - gamer")).toBe("PCG");
  });
});

describe("formatSku", () => {
  it("monta o SKU com padding de 4 dígitos", () => {
    expect(formatSku("ACE", 1)).toBe("ETC-ACE-0001");
    expect(formatSku("COM", 42)).toBe("ETC-COM-0042");
  });

  it("não trunca números com mais de 4 dígitos", () => {
    expect(formatSku("GEN", 12345)).toBe("ETC-GEN-12345");
  });
});

import { describe, it, expect } from "vitest";
import { loginSchema } from "@/lib/validations/auth";

describe("loginSchema", () => {
  it("aceita e-mail e senha válidos", () => {
    const r = loginSchema.safeParse({
      email: "admin@etech.local",
      password: "admin123",
    });
    expect(r.success).toBe(true);
  });

  it("rejeita e-mail inválido", () => {
    const r = loginSchema.safeParse({ email: "naoehemail", password: "123456" });
    expect(r.success).toBe(false);
  });

  it("rejeita senha com menos de 6 caracteres", () => {
    const r = loginSchema.safeParse({ email: "a@b.com", password: "123" });
    expect(r.success).toBe(false);
  });
});

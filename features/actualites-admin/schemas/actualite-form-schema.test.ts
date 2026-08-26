import { describe, expect, it } from "vitest";
import { actualiteFormSchema } from "@/features/actualites-admin/schemas/actualite-form-schema";

describe("actualiteFormSchema", () => {
  const valid = {
    title: "Un titre",
    excerpt: "Un chapô",
    content: "<p>Un corps</p>",
    date: "2026-08-26",
    categorieId: "20000000-0000-0000-0000-000000000001",
  };

  it("accepte des champs valides", () => {
    expect(actualiteFormSchema.safeParse(valid).success).toBe(true);
  });

  it("rejette un titre vide (espaces seuls)", () => {
    const result = actualiteFormSchema.safeParse({ ...valid, title: "   " });
    expect(result.success).toBe(false);
  });

  it("rejette un chapô manquant", () => {
    const result = actualiteFormSchema.safeParse({ ...valid, excerpt: "" });
    expect(result.success).toBe(false);
  });

  it("rejette un corps manquant", () => {
    const result = actualiteFormSchema.safeParse({ ...valid, content: "" });
    expect(result.success).toBe(false);
  });

  it("rejette une categorie manquante", () => {
    const result = actualiteFormSchema.safeParse({ ...valid, categorieId: "" });
    expect(result.success).toBe(false);
  });
});

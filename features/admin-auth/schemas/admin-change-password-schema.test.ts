import { describe, expect, it } from "vitest";
import { adminChangePasswordSchema } from "@/features/admin-auth/schemas/admin-change-password-schema";

describe("adminChangePasswordSchema", () => {
  it("accepts a valid password change", () => {
    const result = adminChangePasswordSchema.safeParse({
      oldPassword: "MotDePasseSeed!2026",
      password: "NouveauMotDePasseSeed!2026",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a new password under 12 characters", () => {
    const result = adminChangePasswordSchema.safeParse({
      oldPassword: "MotDePasseSeed!2026",
      password: "short1!",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an empty old password", () => {
    const result = adminChangePasswordSchema.safeParse({
      oldPassword: "",
      password: "NouveauMotDePasseSeed!2026",
    });
    expect(result.success).toBe(false);
  });
});

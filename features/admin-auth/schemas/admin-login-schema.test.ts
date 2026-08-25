import { describe, expect, it } from "vitest";
import { adminLoginSchema } from "@/features/admin-auth/schemas/admin-login-schema";

describe("adminLoginSchema", () => {
  it("accepts a valid email/password pair", () => {
    const result = adminLoginSchema.safeParse({
      email: "national@mec-ci.org",
      password: "MotDePasseSeed!2026",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an email over 254 characters", () => {
    const longEmail = `${"a".repeat(250)}@mec.org`;
    const result = adminLoginSchema.safeParse({ email: longEmail, password: "x" });
    expect(result.success).toBe(false);
  });

  it("rejects an empty password", () => {
    const result = adminLoginSchema.safeParse({ email: "a@mec.org", password: "" });
    expect(result.success).toBe(false);
  });
});

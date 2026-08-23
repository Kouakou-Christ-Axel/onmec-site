import { apiFetch } from "@/lib/api-client";
import type { VerifyEmailInput } from "@/features/auth/schemas/verify-email-schema";
import type { AuthResponse } from "@/features/auth/types/auth";

export function verifyEmailRequest(payload: VerifyEmailInput): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/auth/verify-email", {
    method: "POST",
    body: JSON.stringify(payload),
    auth: false,
  });
}

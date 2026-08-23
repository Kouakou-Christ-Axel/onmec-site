import { apiFetch } from "@/lib/api-client";
import type { RegisterInput } from "@/features/auth/schemas/register-schema";
import type { OtpSentResponse } from "@/features/auth/types/auth";

export function registerRequest(payload: RegisterInput): Promise<OtpSentResponse> {
  return apiFetch<OtpSentResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
    auth: false,
  });
}

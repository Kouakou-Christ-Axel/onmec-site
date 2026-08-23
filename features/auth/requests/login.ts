import { apiFetch } from "@/lib/api-client";
import type { LoginInput } from "@/features/auth/schemas/login-schema";
import type { AuthResponse } from "@/features/auth/types/auth";

export function loginRequest(payload: LoginInput): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
    auth: false,
  });
}

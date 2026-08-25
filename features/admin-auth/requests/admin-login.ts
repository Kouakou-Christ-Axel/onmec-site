import { apiFetch } from "@/lib/api-client";
import type { AdminLoginInput } from "@/features/admin-auth/schemas/admin-login-schema";
import type { AdminLoginResponse } from "@/features/admin-auth/types/admin-auth";

export function adminLoginRequest(payload: AdminLoginInput): Promise<AdminLoginResponse> {
  return apiFetch<AdminLoginResponse>("/auth/admin/login", {
    method: "POST",
    body: JSON.stringify(payload),
    auth: false,
  });
}

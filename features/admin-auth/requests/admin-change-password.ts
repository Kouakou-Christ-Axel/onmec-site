import { apiFetch } from "@/lib/api-client";
import type { AdminChangePasswordInput } from "@/features/admin-auth/schemas/admin-change-password-schema";

export function adminChangePasswordRequest(
  payload: AdminChangePasswordInput,
): Promise<{ message: string }> {
  return apiFetch<{ message: string }>("/auth/admin/change-password", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

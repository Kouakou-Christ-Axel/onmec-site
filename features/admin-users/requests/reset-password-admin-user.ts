import { apiFetch } from "@/lib/api-client";
import type { ResetAdminPassword } from "@/features/admin-users/types/admin-user";

export function resetPasswordAdminUser(id: string) {
  return apiFetch<ResetAdminPassword>(`/admins/${id}/reset-password`, { method: "POST" });
}

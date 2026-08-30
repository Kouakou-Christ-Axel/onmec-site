import { apiFetch } from "@/lib/api-client";
import type { ModifierRoleAdminUserInput } from "@/features/admin-users/schemas/modifier-role-admin-user-schema";
import type { AdminUser } from "@/features/admin-users/types/admin-user";

export function updateAdminUser(id: string, input: ModifierRoleAdminUserInput) {
  return apiFetch<AdminUser>(`/admins/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

import { apiFetch } from "@/lib/api-client";
import type { ChangerStatutAdminUserInput } from "@/features/admin-users/schemas/changer-statut-admin-user-schema";
import type { AdminUser } from "@/features/admin-users/types/admin-user";

export function changerStatutAdminUser(id: string, input: ChangerStatutAdminUserInput) {
  return apiFetch<AdminUser>(`/admins/${id}/statut`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

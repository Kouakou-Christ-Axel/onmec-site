import { apiFetch } from "@/lib/api-client";
import type { CreerAdminUserInput } from "@/features/admin-users/schemas/creer-admin-user-schema";
import type { CreatedAdminUser } from "@/features/admin-users/types/admin-user";

export function createAdminUser(input: CreerAdminUserInput) {
  return apiFetch<CreatedAdminUser>("/admins", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
